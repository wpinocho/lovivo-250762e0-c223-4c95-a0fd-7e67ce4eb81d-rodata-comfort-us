import type { Appearance } from "@stripe/stripe-js"

/**
 * Returns a Stripe Elements `appearance` object that matches the store's design system.
 *
 * Stripe Elements run inside an iframe — they CANNOT read CSS custom properties
 * from the parent document. Colors must be resolved to real values before being
 * passed to the <Elements> provider.
 *
 * Two modes:
 *  - 'dark'  → uses the rodata.mx dark-theme tokens (checkout is always dark)
 *  - 'light' → reads :root CSS variables at call-time (for light-themed contexts)
 */
export function getStripeAppearance(mode: "light" | "dark" = "dark"): Appearance {
  if (mode === "dark") {
    // rodata.mx dark brand tokens — mirrors the .dark values in src/index.css
    // These are hardcoded because the checkout wrapper uses hardcoded dark bg
    // classes (bg-[#111315] / bg-[#1D2125]) without adding .dark to <html>,
    // so getComputedStyle(documentElement) would return the light-theme values.
    return {
      theme: "night",
      variables: {
        colorPrimary: "hsl(34 62% 48%)",           // --brand-amber
        colorBackground: "hsl(214 10% 13%)",        // --brand-graphite
        colorText: "hsl(200 18% 97%)",              // --brand-offwhite
        colorTextSecondary: "hsl(210 13% 60%)",     // --muted-foreground dark
        colorTextPlaceholder: "hsl(210 13% 38%)",   // subtle placeholder
        colorDanger: "hsl(0 72% 50%)",              // readable red on dark
        colorSuccess: "hsl(142 71% 45%)",
        colorWarning: "hsl(38 92% 50%)",
        borderRadius: "0.375rem",
        fontFamily: "'Inter', system-ui, sans-serif",
        fontSizeBase: "15px",
        spacingUnit: "4px",
        gridRowSpacing: "20px",
        gridColumnSpacing: "16px",
        focusBoxShadow: "0 0 0 2px hsl(34 62% 48% / 0.4)",
        focusOutline: "none",
      },
      rules: {
        ".Input": {
          backgroundColor: "hsl(216 10% 9%)",
          border: "1px solid hsl(214 10% 22%)",
          color: "hsl(200 18% 97%)",
          boxShadow: "none",
          padding: "10px 12px",
        },
        ".Input:focus": {
          border: "1px solid hsl(34 62% 48%)",
          boxShadow: "0 0 0 2px hsl(34 62% 48% / 0.25)",
          outline: "none",
        },
        ".Input--invalid": {
          border: "1px solid hsl(0 72% 50%)",
          boxShadow: "0 0 0 1px hsl(0 72% 50% / 0.3)",
        },
        ".Input::placeholder": {
          color: "hsl(210 13% 38%)",
        },
        ".Label": {
          color: "hsl(210 13% 65%)",
          fontWeight: "500",
          fontSize: "13px",
          marginBottom: "6px",
        },
        ".Tab": {
          backgroundColor: "hsl(216 10% 10%)",
          border: "1px solid hsl(214 10% 20%)",
          color: "hsl(210 13% 65%)",
          boxShadow: "none",
          padding: "10px 12px",
        },
        ".Tab:hover": {
          backgroundColor: "hsl(214 10% 14%)",
          border: "1px solid hsl(214 10% 28%)",
          color: "hsl(200 18% 90%)",
        },
        ".Tab--selected": {
          backgroundColor: "hsl(214 10% 13%)",
          border: "1px solid hsl(34 62% 48%)",
          color: "hsl(200 18% 97%)",
          boxShadow: "none",
        },
        ".Tab--selected:hover": {
          backgroundColor: "hsl(214 10% 16%)",
          border: "1px solid hsl(34 62% 55%)",
        },
        ".TabIcon": {
          fill: "hsl(210 13% 65%)",
        },
        ".TabIcon--selected": {
          fill: "hsl(34 62% 58%)",
        },
        ".TabLabel": {
          color: "hsl(210 13% 65%)",
        },
        ".TabLabel--selected": {
          color: "hsl(34 62% 58%)",
        },
        ".Block": {
          backgroundColor: "hsl(216 10% 10%)",
          border: "1px solid hsl(214 10% 20%)",
          borderRadius: "0.375rem",
        },
        ".AccordionItem": {
          backgroundColor: "hsl(216 10% 10%)",
          border: "1px solid hsl(214 10% 20%)",
        },
        ".AccordionItem--selected": {
          border: "1px solid hsl(34 62% 48%)",
        },
        ".CheckboxInput": {
          backgroundColor: "hsl(216 10% 9%)",
          border: "1px solid hsl(214 10% 22%)",
        },
        ".CheckboxInput--checked": {
          backgroundColor: "hsl(34 62% 48%)",
          border: "1px solid hsl(34 62% 48%)",
        },
        ".PickerItem": {
          backgroundColor: "hsl(216 10% 10%)",
          border: "1px solid hsl(214 10% 20%)",
          color: "hsl(200 18% 97%)",
        },
        ".PickerItem--selected": {
          border: "1px solid hsl(34 62% 48%)",
          backgroundColor: "hsl(34 62% 48% / 0.1)",
        },
        ".RedirectText": {
          color: "hsl(210 13% 65%)",
        },
        ".TermsText": {
          color: "hsl(210 13% 50%)",
          fontSize: "12px",
        },
        ".TermsLink": {
          color: "hsl(34 62% 58%)",
        },
        ".Error": {
          color: "hsl(0 72% 60%)",
          fontSize: "13px",
        },
      },
    }
  }

  // ── Light mode: resolve from :root CSS variables at call-time ──────────────
  const style = getComputedStyle(document.documentElement)
  const hsl = (v: string): string | undefined => {
    const raw = style.getPropertyValue(v).trim()
    return raw ? `hsl(${raw})` : undefined
  }
  const radius = style.getPropertyValue("--radius").trim()
  const inputBorder = style.getPropertyValue("--input").trim()
  const ringVal = style.getPropertyValue("--ring").trim()

  return {
    theme: "stripe",
    variables: {
      colorPrimary: hsl("--primary"),
      colorBackground: hsl("--background"),
      colorText: hsl("--foreground"),
      colorDanger: hsl("--destructive"),
      colorTextSecondary: hsl("--muted-foreground"),
      borderRadius: radius || "6px",
      fontFamily: "'Inter', system-ui, sans-serif",
      fontSizeBase: "15px",
    },
    rules: {
      ".Input": {
        border: inputBorder ? `1px solid hsl(${inputBorder})` : undefined,
        backgroundColor: hsl("--background"),
        boxShadow: "none",
      },
      ".Input:focus": {
        borderColor: ringVal ? `hsl(${ringVal})` : undefined,
        boxShadow: ringVal ? `0 0 0 2px hsl(${ringVal} / 0.25)` : undefined,
      },
    },
  }
}