import { facebookPixel } from '@/lib/facebook-pixel';
import { callEdge } from '@/lib/edge';
import { STORE_ID } from '@/lib/config';
import posthog from 'posthog-js';

// Types for tracking parameters
export interface TrackingProduct {
  id: string;
  name?: string;
  price?: number;
  category?: string;
  variant_id?: string;
  variant_name?: string;
}

export interface TrackingParams {
  products?: TrackingProduct[];
  value?: number;
  currency?: string;
  search_string?: string;
  content_category?: string;
  num_items?: number;
  order_id?: string;
  custom_parameters?: Record<string, any>;
}

// Interface for CAPI user data
interface UserDataForCapi {
  fbp?: string;
  fbc?: string;
  client_user_agent: string;
  em?: string;  // Email hashed SHA256
  ph?: string;  // Phone hashed SHA256
}

class TrackingUtility {
  private isDebugMode = process.env.NODE_ENV === 'development';
  private pixelId: string | null = null;
  private fbp: string | null = null;
  private fbc: string | null = null;

  // Setter for pixel data (called from PixelContext)
  setPixelData(pixelId: string | null, fbp: string | null, fbc: string | null) {
    this.pixelId = pixelId;
    this.fbp = fbp;
    this.fbc = fbc;
  }

  private log(event: string, params: any) {
    if (this.isDebugMode) {
      console.group(`🎯 Tracking: ${event}`);
      console.log('Parameters:', params);
      console.groupEnd();
    }
  }

  private logError(event: string, error: any) {
    console.error(`❌ Tracking Error (${event}):`, error);
  }

  private isPostHogLoaded(): boolean {
    return typeof window !== 'undefined' && posthog.__loaded;
  }

  private formatCurrency(currency?: string): string {
    if (!currency) return 'usd';
    return currency.toLowerCase().replace(/[^a-z]/g, '');
  }

  private formatValue(value?: number): number {
    if (typeof value !== 'number' || isNaN(value) || value < 0) return 0;
    return Math.round(value * 100) / 100;
  }

  private formatContentIds(products?: TrackingProduct[]): string[] {
    if (!Array.isArray(products) || products.length === 0) return [];
    return products
      .map(p => p.id)
      .filter(id => typeof id === 'string' && id.length > 0);
  }

  private buildStandardParams(params: TrackingParams) {
    const { products, value, currency, num_items } = params;
    
    return {
      content_ids: this.formatContentIds(products),
      content_type: 'product',
      value: this.formatValue(value),
      currency: this.formatCurrency(currency),
      ...(num_items && { num_items: Math.max(1, Math.floor(num_items)) })
    };
  }

  // Generate deterministic event ID for deduplication.
  // When a stableId is provided (e.g. order_id, product_id) the resulting ID
  // is always the same for the same (event, resource) pair, so Meta/CAPI
  // correctly deduplicates re-fires (Stripe 3DS return, double-click, etc.).
  // PageView intentionally never passes a stableId so every page visit counts.
  private generateEventId(eventName: string = 'evt', stableId?: string): string {
    const ev = eventName.toLowerCase();
    if (stableId && String(stableId).length > 0) {
      return `${ev}_${stableId}`;
    }
    return `${ev}_${crypto.randomUUID()}`;
  }

  // Get user data for CAPI — always reads localStorage fallbacks so
  // fbc/fbp survive page refresh and SPA navigation after the initial ad click.
  private getUserDataForCapi(): UserDataForCapi {
    let fbc = this.fbc || null;
    let fbp = this.fbp || null;

    if (typeof localStorage !== 'undefined') {
      if (!fbc) fbc = localStorage.getItem('_fbc_fallback');
      if (!fbp) fbp = localStorage.getItem('_fbp_fallback');
    }

    return {
      fbp: fbp || undefined,
      fbc: fbc || undefined,
      client_user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : ''
    };
  }

  // Send event to server (CAPI) - fire and forget
  private async sendToServer(
    eventName: string,
    eventId: string,
    customData: Record<string, any>
  ): Promise<void> {
    try {
      await callEdge('meta-capi', {
        store_id: STORE_ID,
        event_name: eventName,
        event_id: eventId,
        event_source_url: typeof window !== 'undefined' ? window.location.href : '',
        user_data: this.getUserDataForCapi(),
        custom_data: customData
      });
      this.log(`CAPI: ${eventName}`, { eventId, customData });
    } catch (error) {
      // Log but don't throw - CAPI is fire and forget
      this.logError(`CAPI: ${eventName}`, error);
    }
  }

  // Main hybrid tracking method
  private trackHybrid(
    eventName: string,
    browserParams: Record<string, any>,
    customData: Record<string, any>,
    stableId?: string
  ): void {
    const eventId = this.generateEventId(eventName, stableId);

    // 1. Browser Pixel (if available and initialized)
    if (this.pixelId) {
      facebookPixel.track(eventName, browserParams, eventId);
    }

    // 2. Server-side via Edge Function (fire and forget)
    this.sendToServer(eventName, eventId, customData);

    // 3. PostHog (if loaded)
    if (this.isPostHogLoaded()) {
      posthog.capture(eventName.toLowerCase(), { ...customData, event_id: eventId });
    }

    this.log(eventName, { eventId, browserParams, customData });
  }

  /**
   * Track page view - automatically called on route changes
   */
  trackPageView(): void {
    try {
      facebookPixel.pageView();
      
      if (this.isPostHogLoaded()) {
        posthog.capture('$pageview', {
          $current_url: typeof window !== 'undefined' ? window.location.href : undefined,
          $pathname: typeof window !== 'undefined' ? window.location.pathname : undefined,
        });
      }
      
      this.log('PageView', {});
    } catch (error) {
      this.logError('PageView', error);
    }
  }

  /**
   * Track when user views a product
   */
  trackViewContent(params: TrackingParams): void {
    try {
      const { products, content_category } = params;
      
      if (!products || products.length === 0) {
        console.warn('🟡 ViewContent: No products provided');
        return;
      }

      const browserParams = {
        ...this.buildStandardParams(params),
        ...(content_category && { content_category })
      };

      const customData = {
        content_ids: browserParams.content_ids,
        value: browserParams.value,
        currency: browserParams.currency,
        content_category
      };

      this.trackHybrid('ViewContent', browserParams, customData, products?.[0]?.id);
    } catch (error) {
      this.logError('ViewContent', error);
    }
  }

  /**
   * Track when user adds product to cart
   */
  trackAddToCart(params: TrackingParams): void {
    try {
      const { products, value } = params;
      
      if (!products || products.length === 0) {
        console.warn('🟡 AddToCart: No products provided');
        return;
      }

      if (!value || value <= 0) {
        console.warn('🟡 AddToCart: Invalid value provided');
        return;
      }

      const browserParams = this.buildStandardParams(params);
      const customData = {
        content_ids: browserParams.content_ids,
        value: browserParams.value,
        currency: browserParams.currency,
        num_items: params.num_items || products.length
      };

      this.trackHybrid('AddToCart', browserParams, customData, products?.[0]?.id);
    } catch (error) {
      this.logError('AddToCart', error);
    }
  }

  /**
   * Track when user initiates checkout process
   */
  trackInitiateCheckout(params: TrackingParams): void {
    try {
      const { products, value, num_items } = params;
      
      if (!products || products.length === 0) {
        console.warn('🟡 InitiateCheckout: No products provided');
        return;
      }

      if (!value || value <= 0) {
        console.warn('🟡 InitiateCheckout: Invalid value provided');
        return;
      }

      const browserParams = {
        ...this.buildStandardParams(params),
        num_items: num_items || products.length
      };

      const customData = {
        content_ids: browserParams.content_ids,
        value: browserParams.value,
        currency: browserParams.currency,
        num_items: browserParams.num_items
      };

      const icStableId = params.order_id || products?.[0]?.id;
      this.trackHybrid('InitiateCheckout', browserParams, customData, icStableId);
    } catch (error) {
      this.logError('InitiateCheckout', error);
    }
  }

  /**
   * Track successful purchase
   */
  trackPurchase(params: TrackingParams): void {
    try {
      const { products, value, order_id } = params;
      
      if (!products || products.length === 0) {
        console.warn('🟡 Purchase: No products provided');
        return;
      }

      if (!value || value <= 0) {
        console.warn('🟡 Purchase: Invalid value provided');
        return;
      }

      const browserParams = this.buildStandardParams(params);
      const customData = {
        content_ids: browserParams.content_ids,
        value: browserParams.value,
        currency: browserParams.currency,
        order_id,
        ...params.custom_parameters
      };

      this.trackHybrid('Purchase', browserParams, customData, order_id);
    } catch (error) {
      this.logError('Purchase', error);
    }
  }

  /**
   * Track search events
   */
  trackSearch(params: TrackingParams): void {
    try {
      const { search_string, products } = params;
      
      if (!search_string || search_string.trim().length === 0) {
        console.warn('🟡 Search: No search string provided');
        return;
      }

      const eventId = this.generateEventId('Search', search_string?.trim().toLowerCase());
      const browserParams = {
        search_string: search_string.trim(),
        ...(products && products.length > 0 && {
          content_ids: this.formatContentIds(products)
        })
      };

      // Browser pixel
      if (this.pixelId) {
        facebookPixel.search(browserParams, eventId);
      }

      // Server-side
      this.sendToServer('Search', eventId, browserParams);
      
      if (this.isPostHogLoaded()) {
        posthog.capture('search_performed', {
          search_query: search_string.trim(),
          event_id: eventId,
          ...(products && products.length > 0 && {
            product_ids: this.formatContentIds(products)
          })
        });
      }
      
      this.log('Search', browserParams);
    } catch (error) {
      this.logError('Search', error);
    }
  }

  /**
   * Track custom events
   */
  trackCustomEvent(eventName: string, parameters?: Record<string, any>): void {
    try {
      if (!eventName || eventName.trim().length === 0) {
        console.warn('🟡 CustomEvent: No event name provided');
        return;
      }

      const cleanEventName = eventName.trim().replace(/[^a-zA-Z0-9_]/g, '_');
      const trackingParams = parameters || {};
      const eventId = this.generateEventId();

      // Browser pixel
      if (this.pixelId) {
        facebookPixel.track(cleanEventName, trackingParams, eventId);
      }

      // Server-side
      this.sendToServer(cleanEventName, eventId, trackingParams);
      
      if (this.isPostHogLoaded()) {
        posthog.capture(cleanEventName, { ...trackingParams, event_id: eventId });
      }
      
      this.log(`CustomEvent: ${cleanEventName}`, trackingParams);
    } catch (error) {
      this.logError(`CustomEvent: ${eventName}`, error);
    }
  }

  /**
   * Helper method to create product objects from different data sources
   */
  createTrackingProduct(data: {
    id: string;
    title?: string;
    price?: number;
    category?: string;
    variant?: any;
  }): TrackingProduct {
    return {
      id: data.id,
      name: data.title,
      price: this.formatValue(data.price),
      category: data.category,
      variant_id: data.variant?.id,
      variant_name: data.variant?.title
    };
  }

  /**
   * Helper method to get currency from settings
   */
  getCurrencyFromSettings(currencyCode?: string): string {
    return this.formatCurrency(currencyCode || 'USD');
  }
}

// Export singleton instance
export const tracking = new TrackingUtility();

// Export helper functions for easy access
export const trackPageView = () => tracking.trackPageView();

export const trackViewContent = (params: TrackingParams) => tracking.trackViewContent(params);

export const trackAddToCart = (params: TrackingParams) => tracking.trackAddToCart(params);

export const trackInitiateCheckout = (params: TrackingParams) => tracking.trackInitiateCheckout(params);

export const trackPurchase = (params: TrackingParams) => tracking.trackPurchase(params);

export const trackSearch = (params: TrackingParams) => tracking.trackSearch(params);

export const trackCustomEvent = (eventName: string, parameters?: Record<string, any>) => 
  tracking.trackCustomEvent(eventName, parameters);

// Export the main tracking instance
export default tracking;

/**
 * Reads all attribution data from localStorage and current URL params.
 * Call this when creating a checkout or PayPal order to include attribution
 * in the backend payload (checkout-create, paypal-create-order, paypal-capture-order).
 *
 * First-touch values (fbclid, UTMs, landing_site, referrer) are written by
 * PixelContext on the first ad-click page load and never overwritten.
 * Last-touch values (_lt_utm_*) are always overwritten on every landing.
 */
export function getAttributionPayload(): Record<string, string | null> {
  const ls = typeof localStorage !== 'undefined' ? localStorage : null;
  const params =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search)
      : null;

  const fbc = ls?.getItem('_fbc_fallback') || null;
  const fbp = ls?.getItem('_fbp_fallback') || null;
  const fbclid = ls?.getItem('_fbclid') || params?.get('fbclid') || null;
  const landing_site = ls?.getItem('_landing_site') || null;
  const referrer = ls?.getItem('_referrer') || null;

  const utm_source =
    ls?.getItem('_utm_source') || params?.get('utm_source') || null;
  const utm_medium =
    ls?.getItem('_utm_medium') || params?.get('utm_medium') || null;
  const utm_campaign =
    ls?.getItem('_utm_campaign') || params?.get('utm_campaign') || null;
  const utm_content =
    ls?.getItem('_utm_content') || params?.get('utm_content') || null;
  const utm_term =
    ls?.getItem('_utm_term') || params?.get('utm_term') || null;
  const utm_id = ls?.getItem('_utm_id') || params?.get('utm_id') || null;

  return {
    fbp,
    fbc,
    fbclid,
    landing_site,
    referrer,
    utm_source,
    utm_medium,
    utm_campaign,
    utm_content,
    utm_term,
    utm_id,
  };
}