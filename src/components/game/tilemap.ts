export const TILE_SIZE = 48;

// Tile types
// 0 = floor, 1 = wall (border), 2~5 = doors, 6 = wall_deco, 7 = pillar, 8 = path_glow
export const LOBBY_MAP: number[][] = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 6, 6, 6, 2, 2, 2, 6, 6, 6, 6, 6, 6, 3, 3, 3, 6, 6, 6, 6, 1],
  [1, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 1],
  [1, 6, 6, 6, 4, 4, 4, 6, 6, 6, 6, 6, 6, 5, 5, 5, 6, 6, 6, 6, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

export const MAP_COLS = LOBBY_MAP[0].length;
export const MAP_ROWS = LOBBY_MAP.length;

export type DoorInfo = {
  id: number;
  label: string;
  route: string;
  emoji: string;
};

export const DOORS: DoorInfo[] = [
  { id: 2, label: "Resume", route: "/resume", emoji: "📄" },
  { id: 3, label: "Blog", route: "/blog", emoji: "✏️" },
  { id: 4, label: "Projects", route: "/projects", emoji: "🚀" },
  { id: 5, label: "Contact", route: "/contact", emoji: "💌" },
];

export const getTileAt = (col: number, row: number): number => {
  if (row < 0 || row >= MAP_ROWS || col < 0 || col >= MAP_COLS) return 1;
  return LOBBY_MAP[row][col];
};

export const isWalkable = (col: number, row: number): boolean => {
  const tile = getTileAt(col, row);
  return tile === 0 || tile === 8;
};

// Check adjacent tiles (including current) for a door
export const getNearbyDoor = (col: number, row: number): DoorInfo | undefined => {
  const directions = [
    [0, 0], [0, -1], [0, 1], [-1, 0], [1, 0],
  ];
  for (const [dc, dr] of directions) {
    const tile = getTileAt(col + dc, row + dr);
    const door = DOORS.find((d) => d.id === tile);
    if (door) return door;
  }
  return undefined;
};
