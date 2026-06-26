import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const systemPrompt = `You are SehatGuardian's Meal Scanner — an AI nutrition assistant focused on Indian meals.

Your role is to analyze food items or meals described or photographed by users and provide:
1. CARB IMPACT: Rate as Low/Moderate/High with a brief explanation
2. SALT IMPACT: Rate as Low/Moderate/High with a brief explanation
3. DIABETES RELEVANCE: How this meal affects blood sugar
4. BP RELEVANCE: How this meal affects blood pressure
5. HEALTHIER SWAPS: Suggest 2-3 culturally appropriate Indian alternatives

IMPORTANT RULES:
- Focus on cultural context — suggest Indian food swaps (e.g., replace white rice with brown rice or millets)
- Avoid calorie obsession — focus on glycemic impact and sodium content
- Use supportive, non-judgmental language
- Never prescribe or diagnose
- Encourage balanced eating, not restriction

Always end with: "This is general nutritional guidance — not medical advice. Consult a dietitian for personalized plans."

Respond in JSON format with this structure:
{
  "mealName": "Identified meal name",
  "carbImpact": {
    "level": "Low" | "Moderate" | "High",
    "explanation": "Brief explanation"
  },
  "saltImpact": {
    "level": "Low" | "Moderate" | "High", 
    "explanation": "Brief explanation"
  },
  "diabetesRelevance": "How it affects blood sugar",
  "bpRelevance": "How it affects blood pressure",
  "healthierSwaps": [
    {
      "original": "Original item",
      "swap": "Healthier alternative",
      "benefit": "Why this is better"
    }
  ],
  "overallTip": "One encouraging tip for the user"
}`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mealDescription, imageBase64 } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Analyzing meal:", mealDescription?.substring(0, 100) || "Image provided");

    const userContent: any[] = [];
    
    if (mealDescription) {
      userContent.push({
        type: "text",
        text: `Analyze this Indian meal: ${mealDescription}`
      });
    }
    
    if (imageBase64) {
      userContent.push({
        type: "image_url",
        image_url: {
          url: imageBase64.startsWith("data:") ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`
        }
      });
      if (!mealDescription) {
        userContent.push({
          type: "text",
          text: "Analyze this Indian meal from the image."
        });
      }
    }

    if (userContent.length === 0) {
      return new Response(
        JSON.stringify({ error: "Please provide a meal description or image" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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
          { role: "user", content: userContent }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service quota exceeded. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Failed to analyze meal. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    console.log("AI response received successfully");

    let analysis;
    try {
      analysis = JSON.parse(content);
    } catch {
      console.error("Failed to parse AI response as JSON:", content);
      return new Response(
        JSON.stringify({ error: "Failed to parse meal analysis. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify(analysis),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in analyze-meal function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
