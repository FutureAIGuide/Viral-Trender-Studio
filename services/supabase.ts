
import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabase: SupabaseClient | null = null;

export const getSupabaseConfig = () => {
  const url = localStorage.getItem('SUPABASE_URL');
  const key = localStorage.getItem('SUPABASE_KEY');
  return { url, key };
};

export const initSupabase = () => {
  const { url, key } = getSupabaseConfig();
  if (url && key && !supabase) {
    try {
        supabase = createClient(url, key);
        console.log("Supabase Client Initialized");
    } catch (e) {
        console.error("Failed to init Supabase", e);
    }
  }
  return supabase;
};

export const getSupabase = () => supabase;

/**
 * Uploads a file to Supabase Storage bucket 'uploads'
 */
export const uploadToStorage = async (file: File): Promise<{ path: string, publicUrl: string } | null> => {
  if (!supabase) return null;

  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { data, error } = await supabase.storage
    .from('uploads')
    .upload(filePath, file);

  if (error) {
    console.error("Supabase Upload Error:", error);
    throw error;
  }

  const { data: publicUrlData } = supabase.storage
    .from('uploads')
    .getPublicUrl(filePath);

  return {
    path: filePath,
    publicUrl: publicUrlData.publicUrl
  };
};

/**
 * Invokes a Supabase Edge Function
 */
export const invokeEdgeFunction = async (functionName: string, body: any) => {
    if (!supabase) throw new Error("Supabase not configured");
    
    const { data, error } = await supabase.functions.invoke(functionName, {
        body: body
    });

    if (error) throw error;
    return data;
};

/**
 * Creates a Stripe Checkout Session via Edge Function
 */
export const createStripeCheckout = async (priceId: string, successUrl: string, cancelUrl: string) => {
    // This assumes you have an Edge Function named 'create-checkout' deployed
    return await invokeEdgeFunction('create-checkout', {
        priceId,
        successUrl,
        cancelUrl
    });
};

/**
 * Tracks credit usage in Supabase DB (if table exists)
 */
export const trackCreditUsage = async (userId: string, credits: number) => {
    if (!supabase) return;
    
    // Example DB call
    const { error } = await supabase
        .from('user_credits')
        .upsert({ user_id: userId, credits_used: credits }); // Simplified
    
    if (error) console.error("Failed to track credits", error);
};
