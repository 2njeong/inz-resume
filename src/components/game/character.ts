import { TILE_SIZE } from "./tilemap";

export type Direction = "down" | "up" | "left" | "right";

export type Character = {
  x: number;
  y: number;
  direction: Direction;
  frame: number;
  isMoving: boolean;
};

export const createCharacter = (col: number, row: number): Character => ({
  x: col * TILE_SIZE,
  y: row * TILE_SIZE,
  direction: "down",
  frame: 0,
  isMoving: false,
});

// Positive Duck palette (based on the crochet duck)
const DK = {
  body: "#ffd940",
  bodyLight: "#ffe870",
  bodyShade: "#e0b820",
  beak: "#ff8c30",
  beakDark: "#d06820",
  hat: "#2a2a2a",
  hatShine: "#4a4a4a",
  eyes: "#1a1a1a",
  eyeShine: "#ffffff",
  cheek: "#ffaa80",
  feet: "#ff8c30",
  wing: "#f0c820",
  wingShade: "#d0a810",
  helmet: "rgba(180, 220, 255, 0.3)",
  helmetRim: "#8899bb",
};

export const drawCharacter = (
  ctx: CanvasRenderingContext2D,
  char: Character
) => {
  const cx = char.x + TILE_SIZE / 2;
  const cy = char.y + TILE_SIZE / 2;
  const bounce = char.isMoving ? Math.sin(char.frame * 0.3) * 2 : 0;

  ctx.save();
  ctx.translate(cx, cy + bounce);
  ctx.scale(0.9, 0.9);

  // === FEET ===
  const legOffset = char.isMoving ? Math.sin(char.frame * 0.4) * 3 : 0;
  ctx.fillStyle = DK.feet;
  // Left foot
  ctx.beginPath();
  ctx.ellipse(-5, 18 + legOffset, 5, 3, -0.1, 0, Math.PI * 2);
  ctx.fill();
  // Right foot
  ctx.beginPath();
  ctx.ellipse(5, 18 - legOffset, 5, 3, 0.1, 0, Math.PI * 2);
  ctx.fill();

  // === BODY (round like the crochet duck) ===
  // Body shadow
  ctx.fillStyle = DK.bodyShade;
  ctx.beginPath();
  ctx.ellipse(0, 6, 12, 13, 0, 0, Math.PI * 2);
  ctx.fill();

  // Main body
  ctx.fillStyle = DK.body;
  ctx.beginPath();
  ctx.ellipse(0, 5, 11, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Belly highlight
  ctx.fillStyle = DK.bodyLight;
  ctx.beginPath();
  ctx.ellipse(0, 7, 7, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // === WINGS ===
  const wingFlap = char.isMoving ? Math.sin(char.frame * 0.35) * 6 : Math.sin(char.frame * 0.02) * 2;

  if (char.direction === "left") {
    // Right wing (visible from left view)
    ctx.fillStyle = DK.wing;
    ctx.beginPath();
    ctx.ellipse(9, 4 - wingFlap, 5, 8, 0.2, 0, Math.PI * 2);
    ctx.fill();
  } else if (char.direction === "right") {
    // Left wing
    ctx.fillStyle = DK.wing;
    ctx.beginPath();
    ctx.ellipse(-9, 4 - wingFlap, 5, 8, -0.2, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Both wings
    ctx.fillStyle = DK.wing;
    ctx.beginPath();
    ctx.ellipse(-12, 3 + wingFlap, 4, 7, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(12, 3 - wingFlap, 4, 7, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Wing shade
    ctx.fillStyle = DK.wingShade;
    ctx.beginPath();
    ctx.ellipse(-12, 5 + wingFlap, 3, 5, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(12, 5 - wingFlap, 3, 5, 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  // === HEAD ===
  // Head base
  ctx.fillStyle = DK.body;
  ctx.beginPath();
  ctx.arc(0, -10, 12, 0, Math.PI * 2);
  ctx.fill();

  // Head highlight
  ctx.fillStyle = DK.bodyLight;
  ctx.beginPath();
  ctx.ellipse(-2, -12, 6, 5, -0.2, 0, Math.PI * 2);
  ctx.fill();

  // === HAIR TUFT (cute little feather tuft on top) ===
  ctx.fillStyle = DK.bodyShade;
  ctx.beginPath();
  ctx.ellipse(0, -21, 3, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = DK.body;
  ctx.beginPath();
  ctx.ellipse(-1, -22, 2, 2, -0.3, 0, Math.PI * 2);
  ctx.fill();

  // === FACE ===
  if (char.direction === "down") {
    // Eyes (round bead eyes like the crochet)
    ctx.fillStyle = DK.eyes;
    ctx.beginPath();
    ctx.arc(-5, -10, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(5, -10, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Eye shine
    ctx.fillStyle = DK.eyeShine;
    ctx.beginPath();
    ctx.arc(-4, -11, 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(6, -11, 1, 0, Math.PI * 2);
    ctx.fill();

    // Beak (small triangle, orange)
    ctx.fillStyle = DK.beak;
    ctx.beginPath();
    ctx.moveTo(-3, -6);
    ctx.lineTo(3, -6);
    ctx.lineTo(0, -2);
    ctx.closePath();
    ctx.fill();
    // Beak highlight
    ctx.fillStyle = DK.beakDark;
    ctx.beginPath();
    ctx.moveTo(0, -5);
    ctx.lineTo(3, -6);
    ctx.lineTo(0, -2);
    ctx.closePath();
    ctx.fill();

    // Cheeks
    ctx.fillStyle = DK.cheek;
    ctx.globalAlpha = 0.35;
    ctx.beginPath();
    ctx.ellipse(-7, -6, 3, 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(7, -6, 3, 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  } else if (char.direction === "left") {
    // One eye
    ctx.fillStyle = DK.eyes;
    ctx.beginPath();
    ctx.arc(-4, -10, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = DK.eyeShine;
    ctx.beginPath();
    ctx.arc(-3, -11, 1, 0, Math.PI * 2);
    ctx.fill();

    // Side beak
    ctx.fillStyle = DK.beak;
    ctx.beginPath();
    ctx.moveTo(-8, -7);
    ctx.lineTo(-14, -5);
    ctx.lineTo(-8, -3);
    ctx.closePath();
    ctx.fill();

    // Cheek
    ctx.fillStyle = DK.cheek;
    ctx.globalAlpha = 0.35;
    ctx.beginPath();
    ctx.ellipse(-6, -5, 2.5, 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  } else if (char.direction === "right") {
    ctx.fillStyle = DK.eyes;
    ctx.beginPath();
    ctx.arc(4, -10, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = DK.eyeShine;
    ctx.beginPath();
    ctx.arc(5, -11, 1, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = DK.beak;
    ctx.beginPath();
    ctx.moveTo(8, -7);
    ctx.lineTo(14, -5);
    ctx.lineTo(8, -3);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = DK.cheek;
    ctx.globalAlpha = 0.35;
    ctx.beginPath();
    ctx.ellipse(6, -5, 2.5, 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  // Up: just the back of the head + hat, no face

  // === SPACE HELMET ===
  ctx.strokeStyle = DK.helmetRim;
  ctx.lineWidth = 1.5;
  ctx.fillStyle = DK.helmet;
  ctx.beginPath();
  ctx.arc(0, -10, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Helmet reflection
  ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
  ctx.beginPath();
  ctx.ellipse(-5, -16, 6, 3, -0.4, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
};
