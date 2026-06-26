// Rooted in Indian Wellness Science — Educational Knowledge Dataset
// IMPORTANT: All content is framed as educational, not prescriptive.
// No dosage, no "cures/treats" language. Always "associated with", "may support", "linked to".

export interface WellnessPractice {
  id: string;
  name: string;
  nameHindi?: string;
  type: "yoga" | "pranayama" | "herb";
  category: "stress" | "metabolic" | "cardiovascular";
  primarySupport: string[];
  scientificSignificance: string[];
  traditionalContext: string;
  safetyNote: string;
  beginnerGuide?: string;
  imageEmoji: string;
  imagePath?: string;
}

export const wellnessKnowledge: WellnessPractice[] = [
  // ─── SECTION 1: MENTAL HEALTH & STRESS SUPPORT ───
  {
    id: "anulom-vilom",
    name: "Anulom Vilom",
    nameHindi: "अनुलोम विलोम",
    type: "pranayama",
    category: "stress",
    primarySupport: ["Stress reduction", "Anxiety relief", "BP regulation"],
    scientificSignificance: [
      "Activates parasympathetic nervous system",
      "Reduces sympathetic overdrive (stress response)",
      "May improve heart rate variability",
    ],
    traditionalContext:
      'Balances "Ida" and "Pingala" energy channels in yogic science, promoting equilibrium between the body\'s calming and energizing forces.',
    safetyNote: "Avoid forceful breathing. Practice gently, especially if you have respiratory conditions.",
    beginnerGuide:
      "Sit comfortably. Close right nostril with thumb, inhale through left. Close left nostril with ring finger, exhale through right. Repeat alternating for 5 minutes.",
    imageEmoji: "🫁",
    imagePath: "/wellness/anulom-vilom.jpg",
  },
  {
    id: "bhramari",
    name: "Bhramari Pranayama",
    nameHindi: "भ्रामरी प्राणायाम",
    type: "pranayama",
    category: "stress",
    primarySupport: ["Anxiety relief", "Overthinking", "Irritability"],
    scientificSignificance: [
      "Vagal nerve stimulation",
      "Reduces cortisol levels",
      "Calms limbic system activity",
    ],
    traditionalContext:
      "Known as Humming Bee Breath, it promotes mental clarity and emotional stability through the soothing vibration of humming.",
    safetyNote: "Avoid if you have ear infections. Do not press on the ear canal.",
    beginnerGuide:
      "Sit comfortably, close eyes. Place index fingers on the tragus of each ear. Inhale deeply, exhale with a steady humming sound. Repeat 5–7 times.",
    imageEmoji: "🐝",
    imagePath: "/wellness/bhramari.jpg",
  },
  {
    id: "shavasana",
    name: "Shavasana",
    nameHindi: "शवासन",
    type: "yoga",
    category: "stress",
    primarySupport: ["Chronic stress", "Burnout", "Deep relaxation"],
    scientificSignificance: [
      "Deep muscular relaxation response",
      "Reduces cortisol",
      "Improves autonomic balance",
    ],
    traditionalContext:
      "Corpse Pose — the final resting posture in yoga, designed to integrate the benefits of all preceding practices and restore complete body-mind equilibrium.",
    safetyNote: "Safe for all. Use a pillow under knees if you have lower back discomfort.",
    beginnerGuide:
      "Lie flat on your back, arms by sides with palms facing up. Close eyes, breathe naturally. Focus on relaxing each body part from toes to head. Hold for 5–10 minutes.",
    imageEmoji: "🧘",
    imagePath: "/wellness/shavasana.jpg",
  },
  {
    id: "ashwagandha",
    name: "Ashwagandha",
    nameHindi: "अश्वगंधा",
    type: "herb",
    category: "stress",
    primarySupport: ["Stress resilience", "Energy balance", "Nervous system support"],
    scientificSignificance: [
      "Classified as an adaptogen",
      "May reduce cortisol levels",
      "May support sleep quality",
    ],
    traditionalContext:
      "Used in Rasayana therapy for vitality and longevity. One of the most revered herbs in Ayurvedic pharmacology.",
    safetyNote: "Educational reference only. Not for unsupervised use. Consult a healthcare professional before use.",
    imageEmoji: "🌿",
  },
  {
    id: "brahmi",
    name: "Brahmi",
    nameHindi: "ब्राह्मी",
    type: "herb",
    category: "stress",
    primarySupport: ["Memory", "Focus", "Mental clarity"],
    scientificSignificance: [
      "May enhance cognitive function",
      "Traditionally used for mental clarity",
      "Associated with neuroprotective properties",
    ],
    traditionalContext:
      "Named after Brahma, the creator — this herb is considered a Medhya Rasayana (brain tonic) in Ayurveda.",
    safetyNote: "Educational reference only. Consult a healthcare professional before use.",
    imageEmoji: "🧠",
  },
  {
    id: "shankhpushpi",
    name: "Shankhpushpi",
    nameHindi: "शंखपुष्पी",
    type: "herb",
    category: "stress",
    primarySupport: ["Mental clarity", "Anxiety", "Cognitive calmness"],
    scientificSignificance: [
      "Traditionally used as a Medhya Rasayana (brain tonic)",
      "May support cognitive performance",
      "Associated with calming effects on nervous system",
    ],
    traditionalContext:
      "A revered Ayurvedic herb shaped like a conch shell, traditionally used to sharpen intellect and soothe emotional turbulence.",
    safetyNote: "Educational reference only. Professional consultation recommended.",
    imageEmoji: "🐚",
  },
  {
    id: "jatamansi",
    name: "Jatamansi",
    nameHindi: "जटामांसी",
    type: "herb",
    category: "stress",
    primarySupport: ["Stress", "Emotional regulation", "Sleep support"],
    scientificSignificance: [
      "Traditionally used for calming the mind",
      "May support sleep quality",
      "Associated with neuroprotective properties",
    ],
    traditionalContext:
      "Known as Indian Spikenard, it has been used for centuries to promote tranquility and emotional grounding.",
    safetyNote: "Educational reference only. Consult a healthcare professional before use.",
    imageEmoji: "🌸",
  },

  // ─── SECTION 2: DIABETES / METABOLIC SUPPORT ───
  {
    id: "surya-namaskar",
    name: "Surya Namaskar",
    nameHindi: "सूर्य नमस्कार",
    type: "yoga",
    category: "metabolic",
    primarySupport: ["Insulin sensitivity", "Metabolic rate", "Full-body activation"],
    scientificSignificance: [
      "Full-body muscular activation",
      "Improves glucose uptake",
      "Enhances metabolic rate",
    ],
    traditionalContext:
      "Sun Salutation — a flowing sequence of 12 postures performed as a reverent greeting to the sun, activating all major muscle groups.",
    safetyNote: "Start with gentle flow. Avoid if you have severe back injuries. Modify poses as needed.",
    beginnerGuide:
      "Begin standing. Move through Prayer Pose → Raised Arms → Forward Bend → Lunge → Plank → Low Bow → Cobra → Downward Dog → Lunge → Forward Bend → Raised Arms → Prayer. Start with 2–3 rounds.",
    imageEmoji: "☀️",
    imagePath: "/wellness/surya-namaskar.jpg",
  },
  {
    id: "pavanamuktasana",
    name: "Pavanamuktasana",
    nameHindi: "पवनमुक्तासन",
    type: "yoga",
    category: "metabolic",
    primarySupport: ["Digestive efficiency", "Abdominal stimulation"],
    scientificSignificance: [
      "Stimulates abdominal organs",
      "May improve gut motility",
      "Supports digestive function",
    ],
    traditionalContext:
      "Wind-Relieving Pose — designed to release trapped gas and stimulate the Agni (digestive fire) in Ayurvedic philosophy.",
    safetyNote: "Avoid during pregnancy. Be gentle if you have abdominal surgery history.",
    beginnerGuide:
      "Lie on back. Bring knees to chest, clasp hands around shins. Gently rock side to side. Hold for 30–60 seconds.",
    imageEmoji: "🌬️",
    imagePath: "/wellness/pavanamuktasana.jpg",
  },
  {
    id: "tulsi",
    name: "Tulsi",
    nameHindi: "तुलसी",
    type: "herb",
    category: "metabolic",
    primarySupport: ["Metabolic wellness", "Respiratory wellness", "Immune support"],
    scientificSignificance: [
      "Rich in antioxidant properties",
      "Traditionally used for glucose balance",
      "May support stress resilience",
    ],
    traditionalContext:
      "Holy Basil — considered sacred in Indian culture, worshipped in households and used in daily wellness rituals for centuries.",
    safetyNote: "Generally considered safe as a culinary herb. Consult a professional for concentrated supplementation.",
    imageEmoji: "🌱",
  },
  {
    id: "gudmar",
    name: "Gudmar",
    nameHindi: "गुड़मार",
    type: "herb",
    category: "metabolic",
    primarySupport: ["Sugar regulation awareness", "Metabolic balance"],
    scientificSignificance: [
      'Known as "sugar destroyer" traditionally',
      "May reduce sugar absorption",
      "Contains gymnemic acids",
    ],
    traditionalContext:
      "Gymnema sylvestre — literally translates to 'sugar destroyer' in Hindi. Used for centuries in traditional systems for metabolic support.",
    safetyNote: "Should only be used under professional supervision. Not a replacement for diabetes medication.",
    imageEmoji: "🍃",
  },
  {
    id: "vijaysar",
    name: "Vijaysar",
    nameHindi: "विजयसार",
    type: "herb",
    category: "metabolic",
    primarySupport: ["Blood sugar awareness", "Metabolic support"],
    scientificSignificance: [
      "Traditionally used in glycemic balance",
      "Contains bioactive flavonoids",
      "Used in traditional wooden tumbler therapy",
    ],
    traditionalContext:
      "Pterocarpus marsupium — water stored in Vijaysar wood tumblers has been traditionally consumed for metabolic wellness.",
    safetyNote: "Should not replace medical diabetes management. Consult a healthcare professional.",
    imageEmoji: "🪵",
  },
  {
    id: "methi",
    name: "Methi (Fenugreek)",
    nameHindi: "मेथी",
    type: "herb",
    category: "metabolic",
    primarySupport: ["Glucose metabolism", "Insulin sensitivity"],
    scientificSignificance: [
      "Rich in soluble fiber",
      "May support insulin sensitivity",
      "Traditionally used in Indian diet",
    ],
    traditionalContext:
      "A common kitchen spice in Indian cooking, soaked methi seeds have been a traditional morning wellness practice for generations.",
    safetyNote: "Safe as a culinary ingredient. Consult a professional for concentrated use.",
    imageEmoji: "🫘",
  },
  {
    id: "amla",
    name: "Amla",
    nameHindi: "आँवला",
    type: "herb",
    category: "metabolic",
    primarySupport: ["Antioxidant support", "Metabolic health", "Immunity"],
    scientificSignificance: [
      "Extremely high Vitamin C content",
      "Traditionally supports digestion & immunity",
      "Associated with oxidative stress reduction",
    ],
    traditionalContext:
      "Indian Gooseberry — a cornerstone of Ayurvedic medicine and a key ingredient in Chyawanprash, the traditional rejuvenative tonic.",
    safetyNote: "Generally safe as food. Consult a professional for medicinal use.",
    imageEmoji: "🫒",
  },

  // ─── SECTION 3: HYPERTENSION / CARDIOVASCULAR SUPPORT ───
  {
    id: "viparita-karani",
    name: "Viparita Karani",
    nameHindi: "विपरीत करणी",
    type: "yoga",
    category: "cardiovascular",
    primarySupport: ["Circulation", "Relaxation", "Venous health"],
    scientificSignificance: [
      "Reduces lower limb venous pressure",
      "Promotes relaxation response",
      "May support lymphatic drainage",
    ],
    traditionalContext:
      "Legs Up the Wall Pose — a gentle inversion that reverses the effects of gravity on the lower body, considered deeply restorative.",
    safetyNote: "Avoid during menstruation (traditional advice) and with severe eye conditions like glaucoma.",
    beginnerGuide:
      "Sit sideways next to a wall, swing legs up the wall as you lie back. Rest arms by sides. Hold for 5–15 minutes.",
    imageEmoji: "🦵",
    imagePath: "/wellness/viparita-karani.jpg",
  },
  {
    id: "setu-bandhasana",
    name: "Setu Bandhasana",
    nameHindi: "सेतु बंधासन",
    type: "yoga",
    category: "cardiovascular",
    primarySupport: ["Cardiovascular tone", "Chest opening", "Stress relief"],
    scientificSignificance: [
      "Opens chest and promotes deep breathing",
      "Strengthens back muscles",
      "Encourages cardiovascular circulation",
    ],
    traditionalContext:
      "Bridge Pose — symbolically bridges the gap between body and mind, opening the heart center (Anahata Chakra).",
    safetyNote: "Avoid if you have neck injuries. Keep weight on shoulders, not neck.",
    beginnerGuide:
      "Lie on back, bend knees, feet flat on floor hip-width apart. Press feet down, lift hips. Clasp hands under back. Hold 30–60 seconds.",
    imageEmoji: "🌉",
    imagePath: "/wellness/setu-bandhasana.jpg",
  },
  {
    id: "arjuna",
    name: "Arjuna",
    nameHindi: "अर्जुन",
    type: "herb",
    category: "cardiovascular",
    primarySupport: ["Cardiac wellness", "Heart muscle support"],
    scientificSignificance: [
      "Traditionally used for heart support",
      "Contains antioxidant compounds",
      "May support healthy endothelial function",
    ],
    traditionalContext:
      "Terminalia arjuna — the bark of this tree has been a cornerstone of Ayurvedic cardiac care for over 3,000 years.",
    safetyNote: "Educational reference only. Should not be used without medical guidance, especially if on heart medication.",
    imageEmoji: "💚",
  },
  {
    id: "garlic",
    name: "Garlic (Lahsun)",
    nameHindi: "लहसुन",
    type: "herb",
    category: "cardiovascular",
    primarySupport: ["Vascular function", "Heart health"],
    scientificSignificance: [
      "May support endothelial function",
      "Associated with mild BP modulation",
      "Contains allicin — a sulfur compound",
    ],
    traditionalContext:
      "A staple in Indian cuisine, garlic has been used for centuries across cultures for both culinary and wellness purposes.",
    safetyNote: "Safe as food. Consult a professional if on blood-thinning medication.",
    imageEmoji: "🧄",
  },
  {
    id: "gokshura",
    name: "Gokshura",
    nameHindi: "गोक्षुर",
    type: "herb",
    category: "cardiovascular",
    primarySupport: ["Metabolic balance", "Kidney function", "Cardiovascular wellness"],
    scientificSignificance: [
      "Traditionally supports urinary and metabolic pathways",
      "Associated with cardiovascular wellness",
      "May support kidney function",
    ],
    traditionalContext:
      "Tribulus terrestris — used in Ayurvedic medicine as a Mutral (diuretic) herb, supporting the body's natural fluid balance.",
    safetyNote: "Educational reference only. Consult a healthcare professional before use.",
    imageEmoji: "🌾",
  },
  {
    id: "sarpagandha",
    name: "Sarpagandha",
    nameHindi: "सर्पगंधा",
    type: "herb",
    category: "cardiovascular",
    primarySupport: ["Historical BP knowledge", "Nervous system calming"],
    scientificSignificance: [
      "Contains reserpine (historically studied for BP effects)",
      "Traditionally used for calming the nervous system",
      "Significant historical role in pharmacology",
    ],
    traditionalContext:
      "Rauvolfia serpentina — this potent herb played a foundational role in the development of modern antihypertensive drugs.",
    safetyNote:
      "⚠️ This is a potent herb. Shown as historical knowledge only — never for independent use. Always requires professional medical supervision.",
    imageEmoji: "🐍",
  },
];

// ─── Recommendation Engine Logic ───

export interface WellnessRecommendation {
  practice: WellnessPractice;
  reason: string;
}

export function getPersonalizedRecommendations(
  diabetesRiskScore: number,
  bpRiskScore: number,
  stressLevel?: string
): {
  yogaPractices: WellnessRecommendation[];
  herbalKnowledge: WellnessRecommendation[];
  primaryFocus: string;
} {
  const recommendations: WellnessRecommendation[] = [];
  let primaryFocus = "General Wellness";

  // Determine stress score from level
  const stressScore =
    stressLevel === "high" ? 80 : stressLevel === "moderate" ? 50 : 30;

  // Determine primary focus
  if (stressScore > 60 && diabetesRiskScore < 50 && bpRiskScore < 50) {
    primaryFocus = "Mental Health & Stress Regulation";
  } else if (diabetesRiskScore >= 60 && diabetesRiskScore >= bpRiskScore) {
    primaryFocus = "Metabolic Support";
  } else if (bpRiskScore >= 60) {
    primaryFocus = "Cardiovascular Tone";
  } else if (diabetesRiskScore >= 40 || bpRiskScore >= 40) {
    primaryFocus = "Preventive Wellness";
  }

  // Stress-based recommendations
  if (stressScore > 60) {
    const stressPractices = wellnessKnowledge.filter(
      (p) => p.category === "stress"
    );
    stressPractices.forEach((p) => {
      recommendations.push({
        practice: p,
        reason:
          "Your profile indicates elevated stress markers. This practice is traditionally associated with stress regulation.",
      });
    });
  } else if (stressScore > 40) {
    // Add top 3 stress practices
    const stressPractices = wellnessKnowledge
      .filter((p) => p.category === "stress")
      .slice(0, 3);
    stressPractices.forEach((p) => {
      recommendations.push({
        practice: p,
        reason:
          "Moderate stress levels detected. This practice may support emotional balance.",
      });
    });
  }

  // Diabetes/metabolic-based recommendations
  if (diabetesRiskScore >= 60) {
    const metabolicPractices = wellnessKnowledge.filter(
      (p) => p.category === "metabolic"
    );
    metabolicPractices.forEach((p) => {
      recommendations.push({
        practice: p,
        reason:
          "Your metabolic risk indicators suggest potential benefit from traditional practices associated with metabolic balance.",
      });
    });
  } else if (diabetesRiskScore >= 40) {
    const metabolicPractices = wellnessKnowledge
      .filter((p) => p.category === "metabolic")
      .slice(0, 4);
    metabolicPractices.forEach((p) => {
      recommendations.push({
        practice: p,
        reason:
          "Moderate metabolic risk detected. Traditional wellness systems emphasize digestive balance (Agni concept).",
      });
    });
  }

  // BP/cardiovascular-based recommendations
  if (bpRiskScore >= 60) {
    const cvPractices = wellnessKnowledge.filter(
      (p) => p.category === "cardiovascular"
    );
    cvPractices.forEach((p) => {
      recommendations.push({
        practice: p,
        reason:
          "Your cardiovascular risk profile suggests practices traditionally linked to circulatory wellness may be relevant.",
      });
    });
  } else if (bpRiskScore >= 40) {
    const cvPractices = wellnessKnowledge
      .filter((p) => p.category === "cardiovascular")
      .slice(0, 3);
    cvPractices.forEach((p) => {
      recommendations.push({
        practice: p,
        reason:
          "Moderate BP risk detected. Restorative practices are traditionally associated with cardiovascular relaxation.",
      });
    });
  }

  // If very low risk, still show general wellness
  if (recommendations.length === 0) {
    const generalPicks = [
      wellnessKnowledge.find((p) => p.id === "anulom-vilom")!,
      wellnessKnowledge.find((p) => p.id === "surya-namaskar")!,
      wellnessKnowledge.find((p) => p.id === "shavasana")!,
      wellnessKnowledge.find((p) => p.id === "tulsi")!,
      wellnessKnowledge.find((p) => p.id === "amla")!,
    ];
    generalPicks.forEach((p) => {
      if (p) {
        recommendations.push({
          practice: p,
          reason:
            "Your risk profile is favorable. These foundational practices may support continued wellness.",
        });
      }
    });
  }

  // Deduplicate
  const seen = new Set<string>();
  const unique = recommendations.filter((r) => {
    if (seen.has(r.practice.id)) return false;
    seen.add(r.practice.id);
    return true;
  });

  const yogaPractices = unique.filter(
    (r) => r.practice.type === "yoga" || r.practice.type === "pranayama"
  );
  const herbalKnowledge = unique.filter((r) => r.practice.type === "herb");

  return { yogaPractices, herbalKnowledge, primaryFocus };
}
