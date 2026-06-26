import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const systemPrompt = `You are an AI wellness education assistant for SehatGuardian AI. Generate a personalized "Rooted in Indian Wellness" section based on the user's health assessment data.

RULES:
- NEVER diagnose, prescribe, recommend dosages, or claim cures
- Frame everything as educational wellness guidance
- Use supportive, intelligent, culturally aware, empowering, simple language
- Reference traditional Indian wellness systems (Yoga & Ayurveda) respectfully
- Use non-prescriptive language ("traditionally associated with", "may support", "linked to")
- RESPOND IN THE LANGUAGE SPECIFIED by the "language" field. If "hi", respond in Hindi. If "ta", respond in Tamil, etc. If "en", respond in English.

OUTPUT FORMAT - Return valid JSON with this exact structure:
{
  "wellnessStory": "A 2-3 paragraph narrative about what the user's lifestyle signals suggest about their body. Cover energy levels, stress regulation, metabolism, and overall balance. Make it feel like a story, not a clinical report. Use warm, friendly tone.",
  
  "bodyBalance": {
    "stressRegulation": <number 1-10>,
    "metabolicBalance": <number 1-10>,
    "cardiovascularLoad": <number 1-10>,
    "recoveryScore": <number 1-10>,
    "summary": "One sentence explaining what this balance indicates"
  },
  
  "wellnessFocus": {
    "primary": "One of: Stress Regulation | Metabolic Balance | Heart & Circulation | General Wellness",
    "explanation": "2-3 sentences explaining why this focus was identified based on the user's data"
  },
  
  "recommendedPractices": [
    {
      "name": "Practice name (e.g., Anulom Vilom)",
      "nameLocal": "Name in local language if applicable",
      "type": "yoga | pranayama | meditation",
      "explanation": "2-3 sentences explaining the practice and its benefits",
      "traditionalSignificance": "Brief traditional/historical context",
      "youtubeQuery": "search query to find a good tutorial video for this practice"
    }
  ],
  
  "traditionalInsights": [
    {
      "name": "Herb or concept name (e.g., Ashwagandha)",
      "traditionalRole": "2-3 sentences about historical use in Ayurveda",
      "whyForYou": "1-2 sentences about why this is relevant to the user",
      "youtubeQuery": "search query to find educational video about this herb/concept"
    }
  ],
  
  "globalContext": "A short paragraph explaining that Yoga and Ayurveda are increasingly studied globally for preventive health. Mention worldwide practice, growing research, and preventive lifestyle importance.",
  
  "closingMessage": "An empowering 2-3 sentence reflective message about the health journey, daily habits, and traditional wisdom."
}

Generate 4-5 recommendedPractices and 3-4 traditionalInsights.
Personalize everything based on the provided assessment scores and lifestyle data.
Remember to respond in the specified language.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { assessmentData, riskAnalysis, language } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const langMap: Record<string, string> = {
      en: "English", hi: "Hindi", ta: "Tamil", te: "Telugu", bn: "Bengali", mr: "Marathi"
    };
    const langName = langMap[language] || "English";

    const userPrompt = `Generate the personalized "Rooted in Indian Wellness" section for this user.

IMPORTANT: Respond entirely in ${langName} (language code: ${language || "en"}).

ASSESSMENT DATA:
- Age group: ${assessmentData.age}
- Gender: ${assessmentData.gender}
- City: ${assessmentData.city}
- Activity level: ${assessmentData.activityLevel}
- Sleep hours: ${assessmentData.sleepHours}
- Stress level: ${assessmentData.stressLevel}
- Diet type: ${assessmentData.dietType}
- Smoking: ${assessmentData.smokingStatus}
- Alcohol: ${assessmentData.alcoholConsumption}
- Family history diabetes: ${assessmentData.familyHistoryDiabetes}
- Family history BP: ${assessmentData.familyHistoryBP}

RISK SCORES:
- Diabetes risk: ${riskAnalysis.diabetesRisk.score}/100 (${riskAnalysis.diabetesRisk.level})
- BP risk: ${riskAnalysis.bpRisk.score}/100 (${riskAnalysis.bpRisk.level})

Personalize all recommendations based on these specific inputs.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      throw new Error("AI gateway error");
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;

    let parsed;
    try {
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[1].trim() : content.trim());
    } catch {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse wellness insights");
    }

    return new Response(JSON.stringify({ insights: parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("know-yourself error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
