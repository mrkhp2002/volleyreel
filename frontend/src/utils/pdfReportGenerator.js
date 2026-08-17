import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Generates and triggers download of a styled, professional Tournament Report PDF.
 * @param {Object} report - The tournament report data object.
 */
export function generateTournamentPDF(report) {
  if (!report) return;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  // Primary Theme Colors (Dark Theme & Amber Accent matching VolleyReel)
  const primaryDark = [15, 23, 42];      // Slate 900
  const headerBg = [30, 41, 59];         // Slate 800
  const accentOrange = [245, 158, 11];   // Amber/Orange accent
  const accentBlue = [59, 130, 246];     // Blue accent
  const textDark = [30, 41, 59];
  const textMuted = [100, 116, 139];
  const lightBg = [248, 250, 252];

  // 1. TOP BRANDING BANNER
  doc.setFillColor(...primaryDark);
  doc.rect(0, 0, pageWidth, 28, "F");

  // VolleyReel Title
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("VOLLEYREEL", margin, 12);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(203, 213, 225);
  doc.text("OFFICIAL TOURNAMENT PERFORMANCE & ANALYTICS REPORT", margin, 18);

  // Accent bar under header
  doc.setFillColor(...accentOrange);
  doc.rect(0, 28, pageWidth, 2, "F");

  // 2. REPORT HEADER & META
  let y = 38;

  // Report Title
  doc.setTextColor(...textDark);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(report.title || "Tournament Report", margin, y);

  y += 7;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...textMuted);
  doc.text(`Report ID: ${report.id || "TR-2026-00"}   |   Generated: ${report.date || new Date().toLocaleDateString()}   |   Status: ${report.status || "Published"}`, margin, y);

  y += 8;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);

  // 3. TOURNAMENT OVERVIEW CARD
  y += 6;
  doc.setFillColor(...lightBg);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, pageWidth - (margin * 2), 26, 3, 3, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...accentOrange);
  doc.text("TOURNAMENT DETAILS", margin + 6, y + 7);

  doc.setFontSize(9.5);
  doc.setTextColor(...textDark);
  
  // Row 1 inside overview card
  doc.setFont("helvetica", "bold");
  doc.text("Tournament Name:", margin + 6, y + 14);
  doc.setFont("helvetica", "normal");
  doc.text(report.tournament || "N/A", margin + 42, y + 14);

  doc.setFont("helvetica", "bold");
  doc.text("Report Category:", margin + 110, y + 14);
  doc.setFont("helvetica", "normal");
  doc.text(report.type || "Tournament Summary", margin + 142, y + 14);

  // Row 2 inside overview card
  doc.setFont("helvetica", "bold");
  doc.text("Match Format:", margin + 6, y + 20);
  doc.setFont("helvetica", "normal");
  doc.text(report.match_format || "Best of 5 Sets (Rally Score)", margin + 42, y + 20);

  doc.setFont("helvetica", "bold");
  doc.text("Access Scope:", margin + 110, y + 20);
  doc.setFont("helvetica", "normal");
  doc.text(report.status === "Public" ? "Public / Shareable" : "Internal Coaching Team", margin + 142, y + 20);

  y += 32;

  // 4. KEY PERFORMANCE METRICS GRID (4 CARDS)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...textDark);
  doc.text("Key Performance Metrics", margin, y);

  y += 5;
  const cardWidth = (pageWidth - (margin * 2) - 9) / 4;
  const cardHeight = 22;

  const stats = report.stats || {
    matches: 12,
    aces: 34,
    blocks: 48,
    efficiency: "68%"
  };

  const kpis = [
    { label: "Matches Tracked", value: String(stats.matches || 0), color: accentBlue },
    { label: "Total Aces", value: String(stats.aces || 0), color: [16, 185, 129] },
    { label: "Total Blocks", value: String(stats.blocks || 0), color: [139, 92, 246] },
    { label: "Execution Efficiency", value: String(stats.efficiency || "0%"), color: accentOrange }
  ];

  kpis.forEach((kpi, idx) => {
    const xPos = margin + idx * (cardWidth + 3);
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(xPos, y, cardWidth, cardHeight, 2, 2, "FD");

    // Left color pill indicator
    doc.setFillColor(...kpi.color);
    doc.rect(xPos, y, 2, cardHeight, "F");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...textMuted);
    doc.text(kpi.label, xPos + 5, y + 7);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...textDark);
    doc.text(kpi.value, xPos + 5, y + 17);
  });

  y += cardHeight + 10;

  // 5. SKILL PERFORMANCE BREAKDOWN TABLE
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...textDark);
  doc.text("Skill Category Breakdown", margin, y);

  y += 4;

  const defaultSkills = [
    { label: "Spikes / Attacks", val: 78, rating: "Excellent", status: "High Conversion Rate" },
    { label: "Blocks & Net Play", val: 65, rating: "Good", status: "Solid Wall Defense" },
    { label: "Serves & Pressure", val: 82, rating: "Superior", status: "High Ace Percentage" },
    { label: "Receptions & Defense", val: 71, rating: "Strong", status: "Consistent Setup" }
  ];

  const skillData = (stats.skills && stats.skills.length > 0)
    ? stats.skills.map((s) => [
        s.label,
        `${s.val} / 100`,
        s.val >= 75 ? "Superior" : s.val >= 60 ? "Good" : "Needs Improvement",
        s.val >= 75 ? "Optimal Performance" : "Standard Output"
      ])
    : defaultSkills.map((s) => [s.label, `${s.val} / 100`, s.rating, s.status]);

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [["Skill Category", "Performance Index", "Rating Level", "Operational Notes"]],
    body: skillData,
    headStyles: {
      fillColor: headerBg,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9.5
    },
    bodyStyles: {
      textColor: textDark,
      fontSize: 9
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    tableLineWidth: 0.2,
    tableLineColor: [226, 232, 240]
  });

  y = doc.lastAutoTable.finalY + 10;

  // 6. EXECUTIVE SUMMARY & COACHING NOTES
  if (y + 35 > pageHeight - 15) {
    doc.addPage();
    y = 20;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...textDark);
  doc.text("Executive Summary & Match Analysis", margin, y);

  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);

  const summaryText = `This report provides an automated analytical evaluation for "${report.tournament || 'the selected tournament'}". Based on match tracking, serve reception stability remained strong throughout sets, while offensive attacks demonstrated high efficiency during key rallies. Recommended focus areas for upcoming training include fast-tempo set transitions and coverage behind primary blockers.`;

  const splitSummary = doc.splitTextToSize(summaryText, pageWidth - (margin * 2));
  doc.text(splitSummary, margin, y);

  y += splitSummary.length * 5 + 8;

  // Signoff Box
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, pageWidth - margin, y);

  y += 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...textMuted);
  doc.text("Report Certified By: VolleyReel Automated Analytics Engine", margin, y);
  doc.text(`Verification Timestamp: ${new Date().toISOString()}`, pageWidth - margin - 70, y);

  // 7. FOOTER ON ALL PAGES
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);

    // Footer divider
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    doc.text("VolleyReel • Tournament Performance & Analytics Platform", margin, pageHeight - 6);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 15, pageHeight - 6);
  }

  // Trigger Save / Download
  const safeFilename = `${(report.title || "Tournament_Report").replace(/[^a-z0-9]/gi, "_")}.pdf`;
  doc.save(safeFilename);
}
