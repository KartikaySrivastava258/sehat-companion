import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    if (!ELEVENLABS_API_KEY) {
      throw new Error("ElevenLabs API key not configured");
    }

    const { text, voiceId = "21m00Tcm4TlvDq8ikWAM" } = await req.json();
    // Default voice: Rachel — warm, clear, natural female voice

    if (!text || text.trim().length === 0) {
      throw new Error("No text provided");
    }

    // Clean text for better speech synthesis
    const cleanedText = text
      .replace(/\s+/g, ' ')
      .replace(/[•●▪►◆★✓✗☐☑🧘🌿🕉️☀️🐝🫁🧠💚🧄🌾🐍🫒🪵🫘🌸🌱🍃🌬️🦵🌉]/gu, '')
      .replace(/\n+/g, '. ')
      .replace(/\.{2,}/g, '.')
      .replace(/\(\)/g, '')
      .trim();

    const trimmedText = cleanedText.length > 4000 ? cleanedText.substring(0, 4000) + "." : cleanedText;

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: trimmedText,
          model_id: "eleven_turbo_v2_5",
          voice_settings: {
            stability: 0.75,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ElevenLabs API error:", response.status, errorText);

      if (response.status === 401) {
        return new Response(
          JSON.stringify({ error: "Invalid ElevenLabs API key.", code: "INVALID_KEY" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402 || response.status === 429) {
        return new Response(
          JSON.stringify({
            error: "ElevenLabs quota exceeded. Please add credits to your ElevenLabs account.",
            code: "QUOTA_EXCEEDED",
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();

    return new Response(audioBuffer, {
      headers: {
        ...corsHeaders,
        "Content-Type": "audio/mpeg",
      },
    });
  } catch (error) {
    console.error("TTS Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
