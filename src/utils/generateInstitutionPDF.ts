import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";

interface HealthStats {
  total_assessed: number;
  avg_diabetes_risk: number;
  avg_bp_risk: number;
  diabetes_high: number;
  diabetes_moderate: number;
  diabetes_low: number;
  bp_high: number;
  bp_moderate: number;
  bp_low: number;
  total_assessments: number;
}

export const generateInstitutionPDF = (
  institutionName: string,
  stats: HealthStats,
  memberCount: number
) => {
  const doc = new jsPDF();
  const pw = doc.internal.pageSize.getWidth();
  let y = 20;

  // Header
  doc.setFontSize(22);
  doc.setTextColor(20, 148, 115);
  doc.text("Campus Wellness Report", pw / 2, y, { align: "center" });

  y += 10;
  doc.setFontSize(14);
  doc.setTextColor(30, 30, 30);
  doc.text(institutionName, pw / 2, y, { align: "center" });

  y += 8;
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on ${format(new Date(), "MMMM d, yyyy 'at' h:mm a")}`, pw / 2, y, { align: "center" });

  y += 12;
  doc.setDrawColor(200, 200, 200);
  doc.line(20, y, pw - 20, y);
  y += 10;

  // Key Metrics
  doc.setFontSize(14);
  doc.setTextColor(30, 30, 30);
  doc.text("Key Metrics", 20, y);
  y += 8;

  autoTable(doc, {
    startY: y,
    head: [["Metric", "Value"]],
    body: [
      ["Total Members", String(memberCount)],
      ["Students Assessed", String(stats.total_assessed)],
      ["Total Assessments", String(stats.total_assessments)],
      ["Avg Diabetes Risk", `${stats.avg_diabetes_risk || 0}%`],
      ["Avg BP Risk", `${stats.avg_bp_risk || 0}%`],
    ],
    theme: "striped",
    headStyles: { fillColor: [20, 148, 115] },
    margin: { left: 20, right: 20 },
  });
  y = (doc as any).lastAutoTable.finalY + 15;

  // Risk Distribution
  const total = stats.total_assessments || 1;
  const pct = (v: number) => `${Math.round((v / total) * 100)}% (${v})`;

  doc.setFontSize(14);
  doc.setTextColor(30, 30, 30);
  doc.text("Risk Distribution", 20, y);
  y += 8;

  autoTable(doc, {
    startY: y,
    head: [["Risk Category", "High", "Moderate", "Low"]],
    body: [
      ["Diabetes Risk", pct(stats.diabetes_high), pct(stats.diabetes_moderate), pct(stats.diabetes_low)],
      ["Blood Pressure Risk", pct(stats.bp_high), pct(stats.bp_moderate), pct(stats.bp_low)],
    ],
    theme: "striped",
    headStyles: { fillColor: [20, 148, 115] },
    margin: { left: 20, right: 20 },
    didParseCell: (data: any) => {
      if (data.section === "body" && data.column.index === 1) data.cell.styles.textColor = [220, 38, 38];
      if (data.section === "body" && data.column.index === 2) data.cell.styles.textColor = [202, 138, 4];
      if (data.section === "body" && data.column.index === 3) data.cell.styles.textColor = [22, 163, 74];
    },
  });
  y = (doc as any).lastAutoTable.finalY + 15;

  // Campus Wellness Score
  const metabolic = Math.max(0, 100 - (stats.avg_diabetes_risk || 0));
  const cardio = Math.max(0, 100 - (stats.avg_bp_risk || 0));
  const stress = Math.max(0, 100 - Math.round(((stats.avg_diabetes_risk || 0) + (stats.avg_bp_risk || 0)) / 4));
  const overall = Math.round((metabolic + cardio + stress) / 3);

  doc.setFontSize(14);
  doc.setTextColor(30, 30, 30);
  doc.text("Campus Wellness Score", 20, y);
  y += 8;

  autoTable(doc, {
    startY: y,
    head: [["Dimension", "Score"]],
    body: [
      ["Overall Wellness Score", `${overall}/100`],
      ["Metabolic Health", `${metabolic}/100`],
      ["Cardiovascular Health", `${cardio}/100`],
      ["Stress Balance", `${stress}/100`],
    ],
    theme: "striped",
    headStyles: { fillColor: [20, 148, 115] },
    margin: { left: 20, right: 20 },
  });
  y = (doc as any).lastAutoTable.finalY + 15;

  // Suggested Programs
  if (y > 200) { doc.addPage(); y = 20; }

  doc.setFontSize(14);
  doc.setTextColor(30, 30, 30);
  doc.text("Suggested Wellness Programs", 20, y);
  y += 8;

  const programs: string[][] = [];
  if (stats.avg_bp_risk > 35) {
    programs.push(["Weekly Yoga Sessions", "Stress & BP", "Shavasana, Balasana, Setu Bandhasana"]);
    programs.push(["Breathing Workshops", "Stress & Anxiety", "Anulom Vilom, Bhramari Pranayama"]);
    programs.push(["Meditation Rooms", "Mental Health", "Dedicated quiet spaces on campus"]);
  }
  if (stats.avg_diabetes_risk > 35) {
    programs.push(["Campus Walking Tracks", "Metabolic", "Marked paths with distance indicators"]);
    programs.push(["Healthy Mess Menu", "Nutrition", "Balanced meals with calorie labels"]);
    programs.push(["Sports & Fitness Challenges", "Activity", "Monthly step challenges & sports events"]);
  }
  programs.push(["Sleep Hygiene Education", "Wellness", "Screen time management workshops"]);
  programs.push(["Wellness Ambassador Program", "Community", "Train student wellness volunteers"]);

  autoTable(doc, {
    startY: y,
    head: [["Program", "Focus Area", "Description"]],
    body: programs,
    theme: "striped",
    headStyles: { fillColor: [101, 143, 60] },
    margin: { left: 20, right: 20 },
    styles: { fontSize: 9 },
  });
  y = (doc as any).lastAutoTable.finalY + 15;

  // Predictive Insights
  if (y > 220) { doc.addPage(); y = 20; }

  doc.setFontSize(14);
  doc.setTextColor(30, 30, 30);
  doc.text("AI Predictive Insights", 20, y);
  y += 8;

  const insights: string[][] = [];
  if (stats.avg_bp_risk > 35) {
    const inc = Math.min(25, Math.round(stats.avg_bp_risk * 0.4));
    insights.push(["Stress Spike", `Stress risk may increase by ${inc}% during exams`, "Run pre-exam wellness workshops"]);
  }
  if (stats.avg_diabetes_risk > 40) {
    insights.push(["Metabolic Trend", `${Math.round((stats.diabetes_high / total) * 100)}% show elevated metabolic risk`, "Launch Move More campus initiative"]);
  }
  if (insights.length === 0) {
    insights.push(["Positive Outlook", "Overall risk levels are within healthy ranges", "Maintain current wellness programs"]);
  }

  autoTable(doc, {
    startY: y,
    head: [["Alert", "Insight", "Recommendation"]],
    body: insights,
    theme: "striped",
    headStyles: { fillColor: [168, 85, 247] },
    margin: { left: 20, right: 20 },
    styles: { fontSize: 9 },
  });
  y = (doc as any).lastAutoTable.finalY + 15;

  // Privacy notice
  if (y > 240) { doc.addPage(); y = 20; }
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  const notice = doc.splitTextToSize(
    "Privacy Notice: This report contains only anonymized, aggregated data. No individual student identities or personal health records are included. " +
    "All insights are for educational and preventive awareness purposes only and do not constitute medical advice. " +
    "This platform aligns with SDG 3 (Good Health & Well-Being) and SDG 4 (Quality Education).",
    pw - 40
  );
  doc.text(notice, 20, y);

  // Footer
  const finalY = doc.internal.pageSize.getHeight() - 15;
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text("Generated by SehatGuardian AI — Campus Preventive Health Intelligence", pw / 2, finalY, { align: "center" });

  doc.save(`${institutionName.replace(/\s+/g, "-").toLowerCase()}-wellness-report-${format(new Date(), "yyyy-MM-dd")}.pdf`);
};
