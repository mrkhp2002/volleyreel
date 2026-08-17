import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Generates and triggers download of a styled, professional Tournament Report PDF.
 * Includes Tournament Details, Team Details with Top Performer, Match Scores, and Tournament Analysis.
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

  // Primary Theme Colors (Dark Slate & Amber Accent)
  const primaryDark = [15, 23, 42];      // Slate 900
  const headerBg = [30, 41, 59];         // Slate 800
  const accentOrange = [245, 158, 11];   // Amber/Orange accent
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
  doc.setFontSize(9.5);
  doc.setTextColor(...textMuted);
  doc.text(`Report ID: ${report.id || "TR-1"}   |   Generated: ${report.date || new Date().toLocaleDateString()}   |   Status: Published`, margin, y);

  y += 6;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);

  // 3. TOURNAMENT DETAILS CARD
  y += 6;
  doc.setFillColor(...lightBg);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, pageWidth - (margin * 2), 26, 3, 3, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...accentOrange);
  doc.text("TOURNAMENT DETAILS", margin + 6, y + 7);

  doc.setFontSize(9);
  doc.setTextColor(...textDark);
  
  // Row 1 inside overview card
  doc.setFont("helvetica", "bold");
  doc.text("Tournament Name:", margin + 6, y + 14);
  doc.setFont("helvetica", "normal");
  doc.text(report.tournament || "N/A", margin + 38, y + 14);

  doc.setFont("helvetica", "bold");
  doc.text("Category / Format:", margin + 110, y + 14);
  doc.setFont("helvetica", "normal");
  doc.text(`${report.category || "General"} (${report.match_format || "Best of 5 Sets"})`, margin + 146, y + 14);

  // Row 2 inside overview card
  doc.setFont("helvetica", "bold");
  doc.text("Location / Venue:", margin + 6, y + 20);
  doc.setFont("helvetica", "normal");
  doc.text(report.location || "Main Arena", margin + 38, y + 20);

  doc.setFont("helvetica", "bold");
  doc.text("Matches & Teams:", margin + 110, y + 20);
  doc.setFont("helvetica", "normal");
  doc.text(`${report.totalMatches || 0} Matches Played (${report.totalTeams || 0} Teams)`, margin + 146, y + 20);

  y += 32;

  // 4. TOP PERFORMING TEAM CALLOUT BOX
  if (report.topTeam) {
    doc.setFillColor(254, 243, 199); // Amber background
    doc.setDrawColor(245, 158, 11);
    doc.roundedRect(margin, y, pageWidth - (margin * 2), 16, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(180, 83, 9);
    doc.text(`TOP PERFORMING TEAM: ${report.topTeam.name}`, margin + 6, y + 6);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(120, 53, 15);
    doc.text(`Total Wins: ${report.topTeam.wins}  |  Matches Played: ${report.topTeam.matchesPlayed}  |  Win Rate: ${report.topTeam.winRate}%`, margin + 6, y + 11.5);

    y += 22;
  }

  // 5. TEAM DETAILS & PERFORMANCE TABLE
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...textDark);
  doc.text("Team Details & Standings", margin, y);

  y += 4;

  const teamRows = (report.teams && report.teams.length > 0)
    ? report.teams.map((t) => [
        t.name,
        t.division || "Premier",
        String(t.matchesPlayed || 0),
        String(t.wins || 0),
        String(t.losses || 0),
        `${t.winRate || 0}%`
      ])
    : [["No registered teams found", "-", "0", "0", "0", "0%"]];

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [["Team Name", "Division", "Matches Played", "Wins", "Losses", "Win Rate (%)"]],
    body: teamRows,
    headStyles: {
      fillColor: headerBg,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9
    },
    bodyStyles: {
      textColor: textDark,
      fontSize: 8.5
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    tableLineWidth: 0.2,
    tableLineColor: [226, 232, 240]
  });

  y = doc.lastAutoTable.finalY + 10;

  // 6. MATCH DETAILS & FINAL SCORES TABLE
  if (y + 40 > pageHeight - 20) {
    doc.addPage();
    y = 20;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...textDark);
  doc.text("Match Details & Final Scores", margin, y);

  y += 4;

  const matchRows = (report.matches && report.matches.length > 0)
    ? report.matches.map((m) => [
        m.fixture,
        m.stage || "Tournament Match",
        m.score || "N/A",
        m.winner || "-",
        m.status || "Completed"
      ])
    : [["No matches recorded", "-", "-", "-", "-"]];

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [["Match Fixture", "Stage / Round", "Final Score (Sets)", "Match Winner", "Status"]],
    body: matchRows,
    headStyles: {
      fillColor: headerBg,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9
    },
    bodyStyles: {
      textColor: textDark,
      fontSize: 8.5
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    tableLineWidth: 0.2,
    tableLineColor: [226, 232, 240]
  });

  y = doc.lastAutoTable.finalY + 10;

  // 7. EXECUTIVE SUMMARY & TOURNAMENT ANALYSIS
  if (y + 35 > pageHeight - 20) {
    doc.addPage();
    y = 20;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...textDark);
  doc.text("Tournament Analysis & Summary", margin, y);

  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);

  const topTeamName = report.topTeam ? report.topTeam.name : "the top team";
  const topTeamWins = report.topTeam ? report.topTeam.wins : 0;
  const summaryText = `This report details official tournament performance for "${report.tournament || 'the selected tournament'}". A total of ${report.totalMatches || 0} match(es) were recorded across ${report.totalTeams || 0} participating team(s). The top performing team during this tournament was ${topTeamName} with ${topTeamWins} win(s). All matches were conducted under official Best-of-5 Sets volleyball competition rules.`;

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

  // 8. FOOTER ON ALL PAGES
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);

    // Footer line
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
