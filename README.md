# Smart Clip AI - Viral Content Engine

**Smart Clip AI** is a cutting-edge, cyberpunk-themed video repurposing platform designed to turn long-form content into viral short-form assets. Leveraging the power of multi-modal AI models (Gemini, OpenAI, Claude), it automates the extraction of highlights, generation of social strategy, and creation of supplementary content like blogs and scripts.

## 🚀 Features

*   **Smart Clips Extraction**: Uses AI to identify and extract the most viral segments from long videos with timestamps and reasoning.
*   **Virality DNA Audit**: Analyzes content against 5 key viral metrics (Hook, Pacing, Energy, etc.) to predict performance.
*   **Multi-Platform Creator**: specialized tools for **TikTok** and **YouTube Shorts** including AI-generated hooks, audio suggestions, and animated caption synchronization.
*   **Content Repurposing**:
    *   **Video to Blog**: Generates SEO-optimized blog posts from video content.
    *   **Blog to Script**: Converts articles into engaging video scripts.
    *   **Text to Speech**: Integrated ElevenLabs API for realistic voiceovers.
*   **Trailer Generator**: Automatically sequences high-energy moments into a 60s highlight reel.
*   **Social Architect**: Generates platform-specific threads for Twitter/X and LinkedIn carousels.
*   **Visual Prompt Generator**: Creates detailed Midjourney/DALL-E prompts for thumbnails based on video aesthetics.
*   **Watermark Remover**: Experimental tool to clean up video artifacts using AI inpainting logic.
*   **Performance Studio**: Predicts viral potential and analyzes post-launch metrics against AI benchmarks.
*   **Credit System**: Built-in tiered usage system (Free, Creator, Agency) with simulated payment flows.

## 🛠 Tech Stack

*   **Frontend**: React (v19), TypeScript, Tailwind CSS
*   **UI/UX**: Lucide React Icons, Recharts for data visualization, Custom Cyberpunk Theme
*   **AI Integration**:
    *   Google Gemini (Multimodal Video Analysis)
    *   OpenAI (GPT-4o)
    *   Anthropic (Claude 3.5 Sonnet)
    *   ElevenLabs (Voice Synthesis)
*   **Video Processing**: FFmpeg.wasm (Client-side video trimming)
*   **Backend / Auth**: Supabase (Storage, Auth, Database - Optional/Configurable)
*   **Analytics**: PostHog

## ⚙️ Configuration

The application allows you to configure API keys directly within the UI via the **Settings** panel. These keys are stored in your browser's `localStorage`.

**Required Keys for Full Functionality:**
*   `GEMINI_KEY`: For core video analysis and smart clipping.
*   `OPENAI_KEY` / `CLAUDE_KEY`: Alternative text generation providers.
*   `ELEVENLABS_KEY`: For AI VoiceOver generation.

**Backend Configuration (Optional):**
*   `SUPABASE_URL` & `SUPABASE_KEY`: For cloud video storage and user authentication persistence.

## 📦 Installation & Usage

This project uses ES Modules via CDN (`esm.sh`) for a lightweight, build-free development experience.

1.  **Clone the repository.**
2.  **Serve the directory**: You need a local static file server to run the app due to ES module CORS requirements.
    *   If you have Node.js: `npx serve .`
    *   If you have Python: `python3 -m http.server`
3.  **Open in Browser**: Navigate to `http://localhost:3000` (or the port specified by your server).

## ⚠️ Note on FFmpeg

The application uses `ffmpeg.wasm` for client-side video processing. This requires your server to support `SharedArrayBuffer`. If you encounter errors, ensure your server sends the following headers:
*   `Cross-Origin-Opener-Policy: same-origin`
*   `Cross-Origin-Embedder-Policy: require-corp`

## 🎨 Design System

The app features a custom "Future AI" design system:
*   **Primary Color**: Neon Orange (`#FF6600`)
*   **Background**: Deep Cyber Black (`#050505`)
*   **Font**: Orbitron (Headers) & Inter (Body)
