import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const systemPrompt = `You are SehatGuardian's risk assessment AI, designed for the Indian population. You analyze health data to estimate Diabetes and Blood Pressure (BP) risks using a three-layer model:

**Layer 1 - Population Baseline:**
- Age: Risk increases with age, especially 40+
- Gender: Men slightly higher diabetes risk, women higher BP risk post-menopause
- Region: Urban areas (Mumbai, Delhi, Bangalore) have higher lifestyle disease prevalence due to sedentary jobs and processed food access. Rural areas may have different patterns.
- BMI: Overweight (25-29.9) increases risk moderately, Obese (30+) significantly increases risk

**Layer 2 - Personal Risk Modifiers:**
- Activity Level: Sedentary (+20-30% risk), Active (-15-25% risk)
- Sleep: <6 hrs or >9 hrs increases risk
- Stress: High stress significantly elevates BP risk
- Diet: High carb/processed foods increase diabetes risk
- Smoking: Significantly increases both risks
- Alcohol: Heavy drinking increases BP risk significantly
- Other substances (gutka, pan masala): Increases cardiovascular and diabetes risk
- Family History: One parent (+15-20%), Both parents (+25-35%)
- Recent diabetes test results: If prediabetic or diabetic, adjust scores accordingly

**Layer 3 - Interaction Effects:**
- Urban + Sedentary + High Stress = Compound risk
- Family History + Poor Diet = Higher diabetes risk
- Age 45+ + Smoking + Stress = Higher BP risk
- High BMI + Sedentary + High Carb Diet = Very high diabetes risk
- Alcohol + Smoking + Stress = Compound BP risk

CRITICAL RULES:
1. Never diagnose - only provide risk ESTIMATES (0-100 scale)
2. Always recommend consulting a doctor
3. Be supportive and non-judgmental
4. Provide culturally relevant advice for India
5. If data is incomplete, assign "LOW" confidence
6. If user has confirmed prediabetic/diabetic status, factor that heavily into diabetes risk
7. Calculate BMI if weight and height are provided: BMI = weight(kg) / height(m)^2

OUTPUT FORMAT (JSON only):
{
  "diabetesRisk": {
    "score": <number 0-100>,
    "level": "Low" | "Moderate" | "Elevated" | "High",
    "confidence": "Low" | "Medium" | "High",
    "comparison": "<population comparison string>"
  },
  "bpRisk": {
    "score": <number 0-100>,
    "level": "Low" | "Moderate" | "Elevated" | "High",
    "confidence": "Low" | "Medium" | "High",
    "comparison": "<population comparison string>"
  },
  "explanation": {
    "summary": "<2-3 sentence overall summary of why these scores>",
    "diabetesReasons": [
      "<specific, medically-grounded reason explaining a factor contributing to diabetes risk score, referencing the user's actual data e.g. 'Your sedentary lifestyle reduces insulin sensitivity, which is a well-documented risk factor for type 2 diabetes (WHO, 2023)'>"
    ],
    "bpReasons": [
      "<specific, medically-grounded reason explaining a factor contributing to BP risk score, referencing the user's actual data e.g. 'High stress levels trigger sustained cortisol release, which constricts blood vessels and raises blood pressure (American Heart Association)'>"
    ],
    "protectiveFactors": [
      "<things the user is doing well that LOWER their risk, e.g. 'Your vegetarian diet rich in fiber and potassium may help maintain healthy blood pressure levels (DASH diet research, NIH)'>"
    ]
  },
  "modifiableFactors": [
    { "name": "<factor>", "impact": "high" | "medium" | "low" }
  ],
  "nonModifiableFactors": [
    { "name": "<factor>", "impact": "high" | "medium" | "low" }
  ],
  "actionPlan": [
    { "text": "<actionable daily tip>", "category": "exercise" | "diet" | "lifestyle" | "monitoring" }
  ]
}

Provide 3-5 modifiable factors, 1-3 non-modifiable factors, and 4-5 action items. Actions should be specific, achievable, and culturally appropriate for India (e.g., "Add more dal and vegetables to your meals" rather than generic advice).

CRITICAL FOR EXPLANATION FIELD:
- Provide 2-4 specific diabetesReasons and 2-4 bpReasons based on the user's ACTUAL data
- Each reason MUST reference a credible medical source (WHO, CDC, Mayo Clinic, NHS, American Heart Association, Indian Council of Medical Research, Lancet, etc.)
- Each reason must explain the MECHANISM of how the factor affects health (e.g., HOW sedentary lifestyle causes insulin resistance, not just "sedentary lifestyle increases risk")
- Include 1-3 protectiveFactors showing what the user is doing RIGHT (positive reinforcement)
- Use simple language but scientifically accurate explanations
- Be specific to the user's data, not generic`;


serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { assessmentData, profileData } = await req.json();

    console.log("Received assessment data:", assessmentData);
    console.log("Received profile data:", profileData);

    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Calculate BMI if weight and height are provided
    let bmiInfo = "Not provided";
    if (assessmentData.weight && assessmentData.height) {
      const heightInMeters = assessmentData.height / 100;
      const bmi = assessmentData.weight / (heightInMeters * heightInMeters);
      const bmiCategory = bmi < 18.5 ? "Underweight" : 
                          bmi < 25 ? "Normal" : 
                          bmi < 30 ? "Overweight" : "Obese";
      bmiInfo = `${bmi.toFixed(1)} (${bmiCategory})`;
    }

    // Construct user message with all available data
    const userMessage = `Analyze the following health data and provide risk assessment:

**Profile Information:**
- Full Name: ${profileData?.full_name || 'Not provided'}
- Age: ${profileData?.age || assessmentData.age || 'Not provided'}
- Gender: ${profileData?.gender || assessmentData.gender || 'Not provided'}
- City: ${profileData?.city || assessmentData.city || 'Not provided'}

**Body Measurements (optional):**
- Weight: ${assessmentData.weight ? assessmentData.weight + ' kg' : 'Not provided'}
- Height: ${assessmentData.height ? assessmentData.height + ' cm' : 'Not provided'}
- BMI: ${bmiInfo}

**Assessment Responses:**
- Age Group: ${assessmentData.age}
- Gender: ${assessmentData.gender}
- City/Region: ${assessmentData.city}
- Activity Level: ${assessmentData.activityLevel}
- Sleep Hours: ${assessmentData.sleepHours} hours per night
- Stress Level: ${assessmentData.stressLevel}
- Diet Type: ${assessmentData.dietType}
- Smoking Status: ${assessmentData.smokingStatus}
- Alcohol Consumption: ${assessmentData.alcoholConsumption || 'Not provided'}
- Other Substances (gutka/pan masala): ${assessmentData.otherSubstances || 'Not provided'}
- Family History (Diabetes): ${assessmentData.familyHistoryDiabetes}
- Family History (BP): ${assessmentData.familyHistoryBP}

**Recent Diabetes Test (optional):**
- Recent Test Taken: ${assessmentData.recentDiabetesTest || 'Not provided'}
- Last Blood Sugar Reading: ${assessmentData.lastBloodSugar || 'Not provided'}

Provide a personalized risk assessment based on this data. If the user has indicated prediabetic or diabetic status, factor this heavily into the diabetes risk score.`;

    console.log("Sending request to AI gateway...");

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error(`AI service error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI response received");

    const content = data.choices[0]?.message?.content || '';
    
    // Extract JSON from response
    let analysis;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      console.log("Raw content:", content);
      
      // Return fallback analysis
      analysis = {
        diabetesRisk: {
          score: 40,
          level: "Moderate",
          confidence: "Low",
          comparison: "Unable to determine comparison"
        },
        bpRisk: {
          score: 35,
          level: "Low",
          confidence: "Low",
          comparison: "Unable to determine comparison"
        },
        explanation: {
          summary: "We could not fully analyze your data. Please consult a healthcare professional for accurate assessment.",
          diabetesReasons: ["Insufficient data to determine specific diabetes risk factors."],
          bpReasons: ["Insufficient data to determine specific blood pressure risk factors."],
          protectiveFactors: ["Taking this assessment shows health awareness, which is a positive first step."]
        },
        modifiableFactors: [
          { name: "Lifestyle factors need review", impact: "medium" }
        ],
        nonModifiableFactors: [
          { name: "Family history", impact: "medium" }
        ],
        actionPlan: [
          { text: "Consult a doctor for a proper health checkup", category: "monitoring" },
          { text: "Maintain a balanced diet with dal, vegetables, and limited fried foods", category: "diet" },
          { text: "Aim for 30 minutes of walking daily", category: "exercise" }
        ]
      };
    }

    console.log("Returning analysis:", analysis);

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to calculate risk assessment';
    console.error("Error in calculate-risk function:", error);
    return new Response(JSON.stringify({ 
      error: errorMessage
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
