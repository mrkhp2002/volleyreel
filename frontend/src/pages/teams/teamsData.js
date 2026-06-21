export const teamSummaryStats = [
  { label: "Total Teams", value: 64 },
  { label: "Active", value: 52 },
  { label: "Inactive", value: 8 },
  { label: "Draft", value: 4 },
];

export const teamsList = [
  {
    id: "TM-2026-001",
    numericId: 1,
    name: "Thunder Strikers",
    coach: "John Anderson",
    city: "Colombo",
    players: 12,
    division: "Premier",
    status: "Active",
  },
  {
    id: "TM-2026-002",
    numericId: 2,
    name: "Ocean Waves",
    coach: "Sarah Kim",
    city: "Galle",
    players: 11,
    division: "Premier",
    status: "Active",
  },
  {
    id: "TM-2026-003",
    numericId: 3,
    name: "Sky Hawks",
    coach: "Michael Chen",
    city: "Kandy",
    players: 12,
    division: "Division 1",
    status: "Active",
  },
  {
    id: "TM-2026-004",
    numericId: 4,
    name: "Net Ninjas",
    coach: "Emily Davis",
    city: "Negombo",
    players: 10,
    division: "Division 1",
    status: "Inactive",
  },
  {
    id: "TM-2026-005",
    numericId: 5,
    name: "Beach Blazers",
    coach: "David Miller",
    city: "Matara",
    players: 9,
    division: "Division 2",
    status: "Draft",
  },
];

export const teamDetailsById = {
  "TM-2026-001": {
    id: "TM-2026-001",
    numericId: 1,
    name: "Thunder Strikers",
    status: "Active",
    division: "Premier",
    category: "Men's Senior",
    homeVenue: "Central Sports Complex",
    city: "Colombo",
    coach: "John Anderson",
    clubName: "Thunder Volleyball Club",
    foundedYear: "2018",
    rosterLimit: 15,
    registeredPlayers: 12,
    matchesPlayed: 8,
    wins: 6,
    description:
      "Thunder Strikers are a competitive premier division team known for strong defensive play and fast transitions.",
    players: [
      { name: "Alex Rivera", position: "Setter", number: 7, status: "Active" },
      { name: "Chris Lee", position: "Outside Hitter", number: 12, status: "Active" },
      { name: "Jordan Smith", position: "Middle Blocker", number: 9, status: "Active" },
      { name: "Sam Patel", position: "Libero", number: 3, status: "Active" },
    ],
    matches: [
      {
        id: "VM-2026-001",
        teams: "Thunder Strikers vs Ocean Waves",
        date: "Apr 15, 2026",
        status: "Scheduled",
      },
      {
        id: "VM-2026-002",
        teams: "Thunder Strikers vs Sky Hawks",
        date: "Apr 18, 2026",
        status: "Scheduled",
      },
      {
        id: "VM-2026-003",
        teams: "Thunder Strikers vs Net Ninjas",
        date: "Apr 02, 2026",
        status: "Completed",
      },
    ],
  },
};

export function getTeamByRouteId(routeId) {
  if (teamDetailsById[routeId]) {
    return teamDetailsById[routeId];
  }
  const numeric = Number(routeId);
  const fromList = teamsList.find((t) => t.numericId === numeric || t.id === routeId);
  if (!fromList) return null;
  return {
    ...teamDetailsById["TM-2026-001"],
    ...fromList,
    registeredPlayers: fromList.players,
    matches: teamDetailsById["TM-2026-001"].matches,
    players: teamDetailsById["TM-2026-001"].players,
  };
}
