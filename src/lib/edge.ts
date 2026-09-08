import { supabase, supabaseUrl, supabaseKey } from './supabase'

/**
 * Centralized utility for calling Supabase Edge Functions
 * Handles both supabase.functions.invoke and direct fetch fallback
 */
export const callEdge = async (functionName: string, body: any) => {
  console.log(`Calling edge function '${functionName}' with payload:`, body)

  try {
    // Try supabase.functions.invoke first
    const { data, error } = await supabase.functions.invoke(functionName, { body })

    if (error) {
      console.error(`Error in ${functionName} (supabase.functions.invoke):`, error)
      
      // If it's an edge function error, try direct fetch
      if (error.message?.includes('Edge Function returned a non-2xx status code')) {
        console.log(`Attempting direct fetch for ${functionName}...`)
        
        const response = await fetch(`${supabaseUrl}/functions/v1/${functionName}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify(body),
        })
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error(`Direct fetch error for ${functionName}:`, errorText)
          throw new Error(`${functionName} failed (${response.status}): ${errorText}`)
        }
        
        const result = await response.json()
        console.log(`${functionName} succeeded with direct fetch:`, result)
        return result
      }
      
      throw new Error(`Error in ${functionName}: ${error.message}`)
    }

    console.log(`${functionName} succeeded:`, data)
    return data
  } catch (fetchError) {
    console.error(`Error calling ${functionName}:`, fetchError)
    throw new Error(`Error calling ${functionName}: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`)
  }
}

export interface EdgeOnceResult {
  ok: boolean
  status: number
  data: any
}

/**
 * Posts once, keeps the body whatever the status says.
 *
 * callEdge() re-sends the same request when the first attempt answers non-2xx,
 * which is harmless for a read and unacceptable for a capture: the money may
 * already have moved. It also reduces an error response to its text, losing the
 * state the backend put in the body. Reserved for calls that must not be
 * repeated and whose failure body still carries information.
 */
export const callEdgeOnce = async (functionName: string, body: any): Promise<EdgeOnceResult> => {
  console.log(`Calling edge function '${functionName}' once with payload:`, body)

  const response = await fetch(`${supabaseUrl}/functions/v1/${functionName}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
    },
    body: JSON.stringify(body),
  })

  const text = await response.text()
  let data: any = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = { error: text }
    }
  }

  console.log(`${functionName} answered ${response.status}:`, data)
  return { ok: response.ok, status: response.status, data }
}

/**
 * Call edge function with direct fetch (for functions that need custom headers or handling)
 */
export const callEdgeFetch = async (functionName: string, body: any) => {
  console.log(`Direct fetching edge function '${functionName}' with payload:`, body)

  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/${functionName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify(body),
    })

    const result = await response.json()
    
    if (!response.ok) {
      // If backend returned structured JSON with ok:false, return it instead of throwing
      // This lets callers handle "invalid code" responses gracefully
      if (result && result.ok === false) {
        console.log(`${functionName} returned structured error:`, result)
        return result
      }
      console.error(`Direct fetch error for ${functionName}:`, result)
      throw new Error(result.error || `${functionName} failed`)
    }

    console.log(`${functionName} direct fetch succeeded:`, result)
    return result
  } catch (error) {
    console.error(`Error direct fetching ${functionName}:`, error)
    throw error
  }
}