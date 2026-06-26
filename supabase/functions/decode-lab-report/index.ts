import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reportText, imageBase64 } = await req.json();
    
    if (!reportText && !imageBase64) {
      return new Response(
        JSON.stringify({ error: 'Please provide lab report text or image' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `You are SehatGuardian AI — an assistive health companion for India. Your role is to explain lab report values in SIMPLE, non-medical language.

STRICT RULES:
- NEVER diagnose or prescribe
- NEVER claim certainty
- ALWAYS suggest consulting a doctor
- Use calm, supportive, non-judgmental tone
- Explain in simple language an average person can understand

For each lab value found, provide:
1. The value name and reading
2. What it measures (simple explanation)
3. Whether it appears normal, borderline, or outside normal range
4. What this might mean for health (without diagnosing)
5. General lifestyle suggestions if relevant

Focus on these key markers for diabetes and BP risk:
- HbA1c (glycated hemoglobin)
- Fasting glucose / blood sugar
- Post-meal glucose
- Total cholesterol, LDL, HDL, triglycerides
- Creatinine, urea (kidney function)
- Blood pressure readings if mentioned

IMPORTANT: If values seem concerning, gently encourage doctor consultation without causing alarm.

Respond in JSON format:
{
  "labValues": [
    {
      "name": "Value name",
      "reading": "Actual value with units",
      "normalRange": "Expected normal range",
      "status": "normal" | "borderline" | "attention",
      "simpleExplanation": "What this test measures in plain language",
      "interpretation": "What this reading might indicate",
      "suggestion": "General guidance if any"
    }
  ],
  "overallSummary": "Brief overall summary of the report in simple terms",
  "keyTakeaways": ["List of 2-3 main points to remember"],
  "doctorConsultAdvice": "Gentle recommendation about discussing with doctor"
}`;

    const messages: any[] = [
      { role: "system", content: systemPrompt }
    ];

    if (imageBase64) {
      messages.push({
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: { url: `data:image/jpeg;base64,${imageBase64}` }
          },
          {
            type: "text",
            text: reportText 
              ? `Please analyze this lab report image. Additional context: ${reportText}`
              : "Please analyze this lab report image and explain the values in simple terms."
          }
        ]
      });
    } else {
      messages.push({
        role: "user",
        content: `Please analyze these lab report values and explain them in simple terms:\n\n${reportText}`
      });
    }

    console.log('Calling Lovable AI for lab report analysis...');

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Service is busy. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to analyze report" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error("No content in AI response");
      return new Response(
        JSON.stringify({ error: "Failed to get analysis" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse the JSON from the response
    let analysis;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      analysis = {
        labValues: [],
        overallSummary: content,
        keyTakeaways: ["Please consult your doctor for detailed interpretation"],
        doctorConsultAdvice: "We recommend discussing these results with your healthcare provider."
      };
    }

    console.log('Lab report analysis completed successfully');

    return new Response(
      JSON.stringify({ analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in decode-lab-report function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
