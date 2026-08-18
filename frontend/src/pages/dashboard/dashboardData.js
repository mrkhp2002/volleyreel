export const statCards = [
  { label: "Total Tournaments", value: "12", trend: "+3 from last month", iconTone: "blue" },
  { label: "Total Teams", value: "64", trend: "+8 from last month", iconTone: "teal" },
  { label: "Total Players", value: "512", trend: "+24 from last month", iconTone: "purple" },
  { label: "Total Matches", value: "47", trend: "+12 from last month", iconTone: "blue" },
  { label: "Under Review", value: "12", trend: "-3 from last month", trendDirection: "down", iconTone: "orange" },
  { label: "Videos Generated", value: "31", trend: "+15 from last month", iconTone: "teal" },
];

export const recentMatches = [
  {
    id: "VM-2026-001",
    tournament: "Spring Championship 2026",
    teams: "Thunder Hawks vs Coastal Waves",
    score: "3-1",
    status: "Completed",
  },
  {
    id: "VM-2026-002",
    tournament: "Spring Championship 2026",
    teams: "Mountain Lions vs Valley Vipers",
    score: "2-3",
    status: "Completed",
  },
  {
    id: "VM-2026-003",
    tournament: "Regional Qualifiers",
    teams: "City Spikers vs North Stars",
    score: "--",
    status: "Upcoming",
  },
  {
    id: "VM-2026-004",
    tournament: "Regional Qualifiers",
    teams: "East Eagles vs West Wolves",
    score: "3-0",
    status: "Completed",
  },
];

export const activeTournaments = [
  {
    name: "Spring Championship 2026",
    status: "Ongoing",
    dateRange: "Feb 01 - Mar 06, 2026",
    teams: "16 teams",
  },
  {
    name: "Regional Qualifiers",
    status: "Upcoming",
    dateRange: "Mar 15 - Apr 20, 2026",
    teams: "12 teams",
  },
  {
    name: "Winter League Finals",
    status: "Completed",
    dateRange: "Dec 01 - Jan 15, 2026",
    teams: "8 teams",
  },
];

export const bottomMetrics = [
  {
    title: "Team Overview",
    rows: [
      { label: "Active Teams", value: "64" },
      { label: "Registered Players", value: "512" },
      { label: "Avg Players/Team", value: "8" },
    ],
  },
  {
    title: "Upload Activity",
    rows: [
      { label: "Uploaded This Week", value: "15", tone: "success" },
      { label: "Processing Now", value: "3", tone: "info" },
      { label: "Completed Reviews", value: "27" },
    ],
  },
  {
    title: "Video Generation",
    rows: [
      { label: "Ready", value: "27", tone: "success" },
      { label: "Generating", value: "3", tone: "info" },
      { label: "Failed", value: "1", tone: "danger" },
    ],
  },
];
