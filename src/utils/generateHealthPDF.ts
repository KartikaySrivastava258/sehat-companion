import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { getPersonalizedRecommendations } from "@/data/wellnessKnowledge";

interface Assessment {
  id: string;
  diabetes_risk_score: number;
  bp_risk_score: number;
  confidence_level: string;
  created_at: string;
  assessment_data?: any;
}

interface MealScan {
  id: string;
  meal_description: string | null;
  analysis: any;
  created_at: string;
}

interface LabReport {
  id: string;
  report_text: string | null;
  analysis: any;
  created_at: string;
}

interface HealthData {
  assessments: Assessment[];
  mealScans: MealScan[];
  labReports: LabReport[];
  userName?: string;
}

const ensureSpace = (doc: jsPDF, yPos: number, needed: number): number => {
  if (yPos + needed > doc.internal.pageSize.getHeight() - 30) {
    doc.addPage();
    return 20;
  }
  return yPos;
};

export const generateHealthPDF = (data: HealthData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = 20;

  // Header
  doc.setFontSize(24);
  doc.setTextColor(59, 130, 246);
  doc.text("Health History Report", pageWidth / 2, yPosition, { align: "center" });
  
  yPosition += 10;
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on ${format(new Date(), "MMMM d, yyyy 'at' h:mm a")}`, pageWidth / 2, yPosition, { align: "center" });
  
  if (data.userName) {
    yPosition += 8;
    doc.text(`Patient: ${data.userName}`, pageWidth / 2, yPosition, { align: "center" });
  }

  yPosition += 15;
  doc.setDrawColor(200, 200, 200);
  doc.line(20, yPosition, pageWidth - 20, yPosition);
  yPosition += 10;

  // Risk Assessments Section
  if (data.assessments.length > 0) {
    doc.setFontSize(16);
    doc.setTextColor(30, 30, 30);
    doc.text("Risk Assessments", 20, yPosition);
    yPosition += 8;

    const assessmentData = data.assessments.map((a) => [
      format(new Date(a.created_at), "MMM d, yyyy"),
      `${a.diabetes_risk_score}%`,
      `${a.bp_risk_score}%`,
      a.confidence_level,
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [["Date", "Diabetes Risk", "BP Risk", "Confidence"]],
      body: assessmentData,
      theme: "striped",
      headStyles: { fillColor: [59, 130, 246] },
      margin: { left: 20, right: 20 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // Summary Statistics
  if (data.assessments.length > 0) {
    const latestAssessment = data.assessments[0];
    const oldestAssessment = data.assessments[data.assessments.length - 1];
    
    doc.setFontSize(14);
    doc.setTextColor(30, 30, 30);
    doc.text("Risk Score Summary", 20, yPosition);
    yPosition += 8;

    const diabetesTrend = latestAssessment.diabetes_risk_score - oldestAssessment.diabetes_risk_score;
    const bpTrend = latestAssessment.bp_risk_score - oldestAssessment.bp_risk_score;

    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    doc.text(`• Current Diabetes Risk: ${latestAssessment.diabetes_risk_score}% (${diabetesTrend > 0 ? "+" : ""}${diabetesTrend}% change)`, 25, yPosition);
    yPosition += 6;
    doc.text(`• Current BP Risk: ${latestAssessment.bp_risk_score}% (${bpTrend > 0 ? "+" : ""}${bpTrend}% change)`, 25, yPosition);
    yPosition += 12;
  }

  // Check if we need a new page
  if (yPosition > 240) {
    doc.addPage();
    yPosition = 20;
  }

  // Meal Scans Section
  if (data.mealScans.length > 0) {
    doc.setFontSize(16);
    doc.setTextColor(30, 30, 30);
    doc.text("Meal Scans", 20, yPosition);
    yPosition += 8;

   const getImpactLevel = (impact: any): string => {
     if (!impact) return "N/A";
     const raw = typeof impact === "object" ? (impact.level ?? "") : impact;
     const lower = String(raw).toLowerCase();
      if (lower.includes("high") || lower.includes("excessive")) return `High - ${raw}`;
      if (lower.includes("moderate") || lower.includes("medium")) return `Moderate - ${raw}`;
      if (lower.includes("low") || lower.includes("minimal")) return `Low - ${raw}`;
      return String(raw);
    };

    const mealData = data.mealScans.map((m) => [
      format(new Date(m.created_at), "MMM d, yyyy"),
      m.meal_description || "Not specified",
      getImpactLevel(m.analysis?.carbImpact),
      getImpactLevel(m.analysis?.saltImpact),
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [["Date", "Meal", "Carb Impact (Level)", "Salt Impact (Level)"]],
      body: mealData,
      theme: "striped",
      headStyles: { fillColor: [34, 197, 94] },
      margin: { left: 20, right: 20 },
      columnStyles: {
        1: { cellWidth: 50 },
        2: { cellWidth: 45 },
        3: { cellWidth: 45 },
      },
      didParseCell: (data: any) => {
        if (data.section === 'body' && (data.column.index === 2 || data.column.index === 3)) {
          const text = String(data.cell.raw).toLowerCase();
          if (text.startsWith("high")) {
            data.cell.styles.textColor = [220, 38, 38];
          } else if (text.startsWith("moderate")) {
            data.cell.styles.textColor = [202, 138, 4];
          } else if (text.startsWith("low")) {
            data.cell.styles.textColor = [22, 163, 74];
          }
        }
      },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // Check if we need a new page
  if (yPosition > 200) {
    doc.addPage();
    yPosition = 20;
  }

  // Lab Reports Section
  if (data.labReports.length > 0) {
    doc.setFontSize(16);
    doc.setTextColor(30, 30, 30);
    doc.text("Lab Reports", 20, yPosition);
    yPosition += 8;

    const labData = data.labReports.map((l) => [
      format(new Date(l.created_at), "MMM d, yyyy"),
      l.analysis?.overallSummary?.substring(0, 80) + (l.analysis?.overallSummary?.length > 80 ? "..." : "") || "No summary",
      l.analysis?.labValues?.length ? `${l.analysis.labValues.length} values` : "N/A",
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [["Date", "Summary", "Values Analyzed"]],
      body: labData,
      theme: "striped",
      headStyles: { fillColor: [168, 85, 247] },
      margin: { left: 20, right: 20 },
      columnStyles: {
        1: { cellWidth: 100 },
      },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // ─── Personalized Wellness Recommendations ───
  if (data.assessments.length > 0) {
    const latest = data.assessments[0];
    const stressLevel = latest.assessment_data?.stressLevel;
    const { yogaPractices, herbalKnowledge, primaryFocus } =
      getPersonalizedRecommendations(latest.diabetes_risk_score, latest.bp_risk_score, stressLevel);

    if (yogaPractices.length > 0 || herbalKnowledge.length > 0) {
      yPosition = ensureSpace(doc, yPosition, 30);

      // Section title
      doc.setFontSize(16);
      doc.setTextColor(30, 30, 30);
      doc.text("Personalized Wellness Recommendations", 20, yPosition);
      yPosition += 7;
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Primary Focus: ${primaryFocus}  |  Rooted in Indian Wellness Science (Educational Only)`, 20, yPosition);
      yPosition += 10;

      // Yoga & Pranayama table
      if (yogaPractices.length > 0) {
        yPosition = ensureSpace(doc, yPosition, 20);
        doc.setFontSize(13);
        doc.setTextColor(30, 30, 30);
        doc.text("Recommended Yoga & Pranayama", 20, yPosition);
        yPosition += 6;

        const yogaRows = yogaPractices.map((r) => [
          r.practice.name,
          r.practice.type === "pranayama" ? "Pranayama" : "Yoga Asana",
          r.practice.primarySupport.join(", "),
          r.practice.scientificSignificance[0],
        ]);

        autoTable(doc, {
          startY: yPosition,
          head: [["Practice", "Type", "Supports", "Scientific Significance"]],
          body: yogaRows,
          theme: "striped",
          headStyles: { fillColor: [20, 148, 115] },
          margin: { left: 20, right: 20 },
          styles: { fontSize: 8, cellPadding: 3 },
          columnStyles: {
            0: { cellWidth: 38 },
            2: { cellWidth: 40 },
            3: { cellWidth: 50 },
          },
        });
        yPosition = (doc as any).lastAutoTable.finalY + 10;
      }

      // Herbal Knowledge table
      if (herbalKnowledge.length > 0) {
        yPosition = ensureSpace(doc, yPosition, 20);
        doc.setFontSize(13);
        doc.setTextColor(30, 30, 30);
        doc.text("Traditional Herbal Knowledge", 20, yPosition);
        yPosition += 6;

        const herbRows = herbalKnowledge.map((r) => [
          r.practice.name,
          r.practice.primarySupport.join(", "),
          r.practice.scientificSignificance[0],
          r.practice.safetyNote.replace(/⚠️\s*/g, "").substring(0, 60),
        ]);

        autoTable(doc, {
          startY: yPosition,
          head: [["Herb", "Traditional Support", "Scientific Basis", "Safety Note"]],
          body: herbRows,
          theme: "striped",
          headStyles: { fillColor: [101, 143, 60] },
          margin: { left: 20, right: 20 },
          styles: { fontSize: 8, cellPadding: 3 },
          columnStyles: {
            0: { cellWidth: 35 },
            1: { cellWidth: 40 },
            3: { cellWidth: 42 },
          },
        });
        yPosition = (doc as any).lastAutoTable.finalY + 8;
      }

      // Wellness disclaimer
      yPosition = ensureSpace(doc, yPosition, 20);
      doc.setFontSize(8);
      doc.setTextColor(150, 60, 60);
      const disclaimerLines = doc.splitTextToSize(
        "Wellness Disclaimer: The above recommendations are for educational purposes only, rooted in traditional Indian wellness systems (Yoga & Ayurveda). " +
        "They do not constitute medical advice, diagnosis, or treatment, and are not replacements for professional medical care. " +
        "Always consult a qualified healthcare professional before starting any new health practice or using herbal supplements.",
        pageWidth - 40
      );
      doc.text(disclaimerLines, 20, yPosition);
      yPosition += disclaimerLines.length * 4 + 8;
    }
  }

  // Footer disclaimer
  const finalPage = doc.getNumberOfPages();
  doc.setPage(finalPage);
  yPosition = doc.internal.pageSize.getHeight() - 25;
  
  doc.setFontSize(9);
  doc.setTextColor(130, 130, 130);
  doc.text(
    "This report is for informational purposes only and should not be considered medical advice.",
    pageWidth / 2,
    yPosition,
    { align: "center" }
  );
  doc.text(
    "Please consult with a healthcare professional for proper diagnosis and treatment.",
    pageWidth / 2,
    yPosition + 5,
    { align: "center" }
  );

  // Save the PDF
  doc.save(`health-report-${format(new Date(), "yyyy-MM-dd")}.pdf`);
};
