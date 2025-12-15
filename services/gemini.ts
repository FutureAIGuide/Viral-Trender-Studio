
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { OpenAI } from "openai";
import { Anthropic } from "@anthropic-ai/sdk";
import { ClipData, SmartClipResponse, ImagePrompt, TrailerResponse, ShortsStrategy, CaptionWord, AIProvider } from "../types";

// Helper to get active provider configuration
const getProviderConfig = () => {
    const provider = localStorage.getItem('ACTIVE_PROVIDER') || AIProvider.GEMINI;
    
    // Gemini Config
    const geminiKey = localStorage.getItem('GEMINI_KEY') || process.env.API_KEY || '';
    const geminiModel = localStorage.getItem('GEMINI_MODEL') || 'gemini-2.5-flash';
    
    // OpenAI Config
    const openaiKey = localStorage.getItem('OPENAI_KEY') || '';
    const openaiModel = localStorage.getItem('OPENAI_MODEL') || 'gpt-4o';
    
    // Claude Config
    const claudeKey = localStorage.getItem('CLAUDE_KEY') || '';
    const claudeModel = localStorage.getItem('CLAUDE_MODEL') || 'claude-3-5-sonnet-latest';

    return {
        provider,
        gemini: { key: geminiKey, model: geminiModel },
        openai: { key: openaiKey, model: openaiModel },
        claude: { key: claudeKey, model: claudeModel }
    };
};

/**
 * Unified AI Generation Handler
 * Handles differences between Gemini, OpenAI, and Claude APIs
 */
async function generateContentCommon(
    prompt: string, 
    media: { mimeType: string; data: string } | null, 
    jsonMode: boolean = false
): Promise<string> {
    const config = getProviderConfig();

    // --- GEMINI HANDLER ---
    if (config.provider === AIProvider.GEMINI) {
        if (!config.gemini.key) throw new Error("Gemini API Key missing");
        const ai = new GoogleGenAI({ apiKey: config.gemini.key });
        
        const contents: any = { parts: [] };
        if (media) {
            contents.parts.push({
                inlineData: { mimeType: media.mimeType, data: media.data }
            });
        }
        contents.parts.push({ text: prompt });

        const requestConfig: any = { responseMimeType: jsonMode ? "application/json" : "text/plain" };
        
        const response = await ai.models.generateContent({
            model: config.gemini.model,
            contents,
            config: requestConfig
        });
        
        return response.text || "";
    }

    // --- OPENAI HANDLER ---
    if (config.provider === AIProvider.OPENAI) {
        if (!config.openai.key) throw new Error("OpenAI API Key missing");
        const openai = new OpenAI({ 
            apiKey: config.openai.key,
            dangerouslyAllowBrowser: true // Enable for client-side prototype
        });

        const messages: any[] = [];
        
        // System instruction to ensure JSON if requested
        if (jsonMode) {
             messages.push({ role: "system", content: "You are a helpful assistant. Return ONLY valid JSON." });
        }

        const userContent: any[] = [{ type: "text", text: prompt }];
        if (media) {
            // OpenAI Image URL format for base64
            userContent.push({
                type: "image_url",
                image_url: {
                    url: `data:${media.mimeType};base64,${media.data}`
                }
            });
        }

        messages.push({ role: "user", content: userContent });

        const response = await openai.chat.completions.create({
            model: config.openai.model,
            messages: messages,
            response_format: jsonMode ? { type: "json_object" } : undefined
        });

        return response.choices[0].message.content || "";
    }

    // --- CLAUDE HANDLER ---
    if (config.provider === AIProvider.CLAUDE) {
        if (!config.claude.key) throw new Error("Claude API Key missing");
        const anthropic = new Anthropic({ 
            apiKey: config.claude.key,
            dangerouslyAllowBrowser: true // Enable for client-side prototype
        });

        const messages: any[] = [];
        const content: any[] = [];

        if (media) {
             // Claude supports specific image media types
             content.push({
                type: "image",
                source: {
                    type: "base64",
                    media_type: media.mimeType as any, // "image/jpeg", "image/png", "image/gif", "image/webp"
                    data: media.data
                }
             });
        }
        
        // Append prompt
        let finalPrompt = prompt;
        if (jsonMode) finalPrompt += "\n\nReturn ONLY valid JSON.";
        content.push({ type: "text", text: finalPrompt });

        messages.push({ role: "user", content });

        const response = await anthropic.messages.create({
            model: config.claude.model,
            max_tokens: 4096,
            messages: messages
        });

        // Handle text block content
        if (response.content[0].type === 'text') {
            return response.content[0].text;
        }
        return "";
    }

    throw new Error("Unknown AI Provider");
}


// --- EXPORTED SERVICE FUNCTIONS ---

export const generateSmartClips = async (
  base64Data: string,
  mimeType: string
): Promise<SmartClipResponse> => {
    const prompt = `Analyze this video content deeply. 
    Identify 3-4 highly engaging segments suitable for short-form content (TikTok/Reels/Shorts). 
    Focus on moments with high emotional impact, humor, insightful quotes, or strong visuals.
    For each clip, provide timestamps, a catchy viral-style title, and a virality score (0-100).
    
    Return a JSON object with this exact schema:
    {
      "clips": [
        {
          "title": "string",
          "startTime": "MM:SS",
          "endTime": "MM:SS",
          "description": "string",
          "viralityScore": number,
          "reasoning": "string"
        }
      ],
      "overallSummary": "string"
    }`;

    try {
        const result = await generateContentCommon(prompt, { mimeType, data: base64Data }, true);
        return JSON.parse(result);
    } catch (error) {
        console.error("Smart Clips Gen Error", error);
        throw error;
    }
};

export const generateTrailerPlan = async (
  base64Data: string,
  mimeType: string
): Promise<TrailerResponse> => {
    const prompt = `Act as a professional video editor. Create a 'Trailer' (Highlight Reel) blueprint for this video.
    The trailer should be a highlight reel of the most engaging moments, aiming for 30-60 seconds total.
    
    Instructions:
    1. Identify high-energy, funny, or visually striking moments.
    2. Sequence them to create a compelling narrative or excitement.
    3. Ensure cuts flow well together (pacing).
    
    Return a JSON object with:
    {
        "title": "Catchy title",
        "mood": "Music/Atmosphere suggestion",
        "synopsis": "Brief summary",
        "cuts": [
            { "startTime": "MM:SS", "endTime": "MM:SS", "description": "Visual description" }
        ]
    }`;

    try {
        const result = await generateContentCommon(prompt, { mimeType, data: base64Data }, true);
        return JSON.parse(result);
    } catch (error) {
        console.error("Trailer Gen Error", error);
        throw error;
    }
};

export const generateBlogPost = async (
  base64Data: string,
  mimeType: string
): Promise<string> => {
    const prompt = `Act as a professional technical copywriter. 
    Watch the video and write a comprehensive, engaging blog post based on its content.
    Use Markdown formatting. Include an introduction, key takeaways (bullet points), detailed sections for each main topic discussed, and a conclusion.
    Add suggested SEO keywords at the bottom.`;

    try {
        return await generateContentCommon(prompt, { mimeType, data: base64Data }, false);
    } catch (error) {
        console.error("Blog Post Error", error);
        throw error;
    }
};

export const generateScriptFromBlog = async (blogContent: string): Promise<string> => {
    const prompt = `Convert the following blog post into a YouTube Video Script. 
    Format it with clear 'Scene', 'Visual', and 'Audio' cues. 
    Make it engaging and suitable for a 5-10 minute video.\n\nSOURCE BLOG:\n${blogContent}`;

    try {
        return await generateContentCommon(prompt, null, false);
    } catch (error) {
        console.error("Script Gen Error", error);
        throw error;
    }
};

export const analyzeViralityFactors = async (
  base64Data: string,
  mimeType: string
): Promise<{ metrics: { category: string; score: number }[]; summary: string }> => {
    const prompt = `Analyze this video for its viral potential on social media.
    Evaluate it on these 5 specific metrics (0-100): 
    1. Visual Hook (First 3 seconds quality)
    2. Audio Quality/Clarity
    3. Pacing & Energy
    4. Emotional/Humor Impact
    5. Re-watchability
    
    Return ONLY a valid JSON object with:
    {
       "metrics": [ { "category": "string", "score": number } ],
       "summary": "string"
    }`;

    try {
        const result = await generateContentCommon(prompt, { mimeType, data: base64Data }, true);
        return JSON.parse(result);
    } catch (e) {
        console.error("Virality Analysis Failed", e);
        throw e;
    }
};

export const generateSocialThread = async (
  base64Data: string,
  mimeType: string,
  platform: 'TWITTER' | 'LINKEDIN'
): Promise<string[]> => {
    const prompt = platform === 'TWITTER' 
      ? "Create a viral Twitter/X thread (7-10 tweets) summarizing this video. Start with a strong hook, use bullet points where appropriate, and end with a call-to-action. Return a JSON object: { \"posts\": [ \"string\" ] }"
      : "Create a LinkedIn Carousel text outline (5-8 slides). Slide 1 is the Hook/Title, following slides are value points, last slide is a discussion question. Professional yet engaging tone. Return a JSON object: { \"posts\": [ \"string\" ] }";

    try {
        const result = await generateContentCommon(prompt, { mimeType, data: base64Data }, true);
        const data = JSON.parse(result);
        return data.posts;
    } catch (error) {
        console.error("Social Thread Error", error);
        throw error;
    }
};

export const generateVisualPrompts = async (
  base64Data: string,
  mimeType: string
): Promise<ImagePrompt[]> => {
    const prompt = `Analyze the visual style and core topics of this video. Create 3 distinct, high-quality AI image generation prompts (optimized for Midjourney/DALL-E) to create a viral YouTube thumbnail or blog cover art for this content. One should be 'Photorealistic', one 'Illustrative/3D', and one 'Abstract/Conceptual'.
    
    Return JSON:
    {
      "prompts": [
         { "conceptName": "string", "prompt": "string", "rationale": "string" }
      ]
    }`;

    try {
        const result = await generateContentCommon(prompt, { mimeType, data: base64Data }, true);
        const data = JSON.parse(result);
        return data.prompts;
    } catch (error) {
        console.error("Visual Prompt Error", error);
        throw error;
    }
};

export const generateShortsStrategy = async (
  base64Data: string,
  mimeType: string,
  platform: 'TIKTOK' | 'YOUTUBE_SHORTS'
): Promise<ShortsStrategy> => {
    const prompt = `Create a viral content strategy for this video specifically for ${platform}.
    1. Provide 3 attention-grabbing hooks (first 3 seconds text).
    2. Suggest 3 trending audio vibes or genres that fit.
    3. List 10 optimized hashtags.
    4. Write a short, punchy caption/description.
    
    Return JSON:
    {
        "hooks": ["string"],
        "audioSuggestions": ["string"],
        "hashtags": ["string"],
        "description": "string"
    }`;

    try {
        const result = await generateContentCommon(prompt, { mimeType, data: base64Data }, true);
        return JSON.parse(result);
    } catch (error) {
        console.error("Strategy Gen Error", error);
        throw error;
    }
};

export const generateShortScript = async (
  base64Data: string,
  mimeType: string
): Promise<string> => {
    const prompt = `Write a high-energy, fast-paced voiceover script for a 60-second short-form video based on this visual content. 
    Keep sentences short. Focus on the most interesting parts. Do not include scene directions, just the spoken words.`;
    
    try {
        return await generateContentCommon(prompt, { mimeType, data: base64Data }, false);
    } catch (error) {
        console.error("Short Script Gen Error", error);
        throw error;
    }
};

export const refineShortScript = async (currentScript: string): Promise<string> => {
    const prompt = `Refine this short-form video script to be punchier, more viral, and easier to speak. Remove fluff. Keep it under 150 words.\n\nSCRIPT:\n${currentScript}`;
    
    try {
        return await generateContentCommon(prompt, null, false);
    } catch (error) {
        console.error("Script Refinement Error", error);
        throw error;
    }
};

export const generateCaptionData = async (script: string): Promise<CaptionWord[]> => {
    const prompt = `Take this script and simulate a word-by-word timestamp JSON for an animated caption system. 
    Assume a fast speaking pace (150-160 words per minute). 
    Start at 0 seconds.
    Return JSON array of objects with {word, start, end} where start/end are numbers in seconds.
    
    Example: [{"word": "Hello", "start": 0, "end": 0.3}, ...]
    \n\nSCRIPT:\n${script}`;

    try {
        const result = await generateContentCommon(prompt, null, true);
        const parsed = JSON.parse(result);
        // Handle potential wrapping object like { "captions": [...] } if model adds it
        if (Array.isArray(parsed)) return parsed;
        if (parsed.captions && Array.isArray(parsed.captions)) return parsed.captions;
        return [];
    } catch (error) {
        console.error("Caption Data Gen Error", error);
        throw error;
    }
};

export const generateTrendAnalysis = async (
  trendName: string,
  platform: string,
  userNiche: string
): Promise<{ mechanism: string; psychology: string; opportunities: string[] }> => {
    const prompt = `Analyze the viral trend "${trendName}" currently popular on ${platform}.
    1. Explain the "Mechanism": What is the format/hook? (Max 50 words)
    2. Explain the "Psychology": Why does it work? (FOMO, shock, reliability, etc.) (Max 50 words)
    3. Provide 3 specific video ideas for a creator in the "${userNiche}" niche to use this trend.

    Return JSON:
    {
      "mechanism": "string",
      "psychology": "string",
      "opportunities": ["string", "string", "string"]
    }`;

    try {
        const result = await generateContentCommon(prompt, null, true);
        return JSON.parse(result);
    } catch (error) {
        console.error("Trend Analysis Error", error);
        throw error;
    }
};
