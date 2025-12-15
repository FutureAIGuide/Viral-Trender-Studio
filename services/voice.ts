
export const generateSpeech = async (text: string): Promise<string> => {
  const apiKey = localStorage.getItem('ELEVENLABS_KEY');
  const voiceId = localStorage.getItem('ELEVENLABS_VOICE_ID') || '21m00Tcm4TlvDq8ikWAM'; // Default to "Rachel"

  if (!apiKey) {
    throw new Error("MISSING_API_KEY: Please configure ElevenLabs in Settings.");
  }

  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey
      },
      body: JSON.stringify({
        text: text,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5
        }
      })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail?.message || "ElevenLabs API Error");
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Voice Generation Error", error);
    throw error;
  }
};
