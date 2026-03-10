import {
  TILE_SIZE,
  MAP_COLS,
  MAP_ROWS,
  LOBBY_MAP,
  DOORS,
  getNearbyDoor,
} from "./tilemap";
import { Character, drawCharacter } from "./character";

// Star cache for consistent rendering
let starsCache: { x: number; y: number; r: number; brightness: number }[] = [];

const initStars = (width: number, height: number) => {
  if (starsCache.length > 0) return;
  for (let i = 0; i < 120; i++) {
    starsCache.push({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.5 + 0.3,
      brightness: Math.random() * 0.6 + 0.4,
    });
  }
};

// Animated frame counter
let frameCount = 0;

const drawSpaceBackground = (
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number
) => {
  // Deep space gradient
  const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.7);
  grad.addColorStop(0, "#1a1040");
  grad.addColorStop(0.5, "#0d0a20");
  grad.addColorStop(1, "#050510");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Nebula glow
  ctx.globalAlpha = 0.08;
  const neb1 = ctx.createRadialGradient(w * 0.3, h * 0.3, 0, w * 0.3, h * 0.3, w * 0.3);
  neb1.addColorStop(0, "#8040c0");
  neb1.addColorStop(1, "transparent");
  ctx.fillStyle = neb1;
  ctx.fillRect(0, 0, w, h);

  const neb2 = ctx.createRadialGradient(w * 0.7, h * 0.7, 0, w * 0.7, h * 0.7, w * 0.25);
  neb2.addColorStop(0, "#4080c0");
  neb2.addColorStop(1, "transparent");
  ctx.fillStyle = neb2;
  ctx.fillRect(0, 0, w, h);
  ctx.globalAlpha = 1;

  // Twinkling stars
  initStars(w, h);
  for (const star of starsCache) {
    const twinkle = star.brightness + Math.sin(frameCount * 0.02 + star.x) * 0.2;
    ctx.globalAlpha = Math.max(0.1, Math.min(1, twinkle));
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
};

const drawFloorTile = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
  const col = Math.floor(x / TILE_SIZE);
  const row = Math.floor(y / TILE_SIZE);
  const isLight = (col + row) % 2 === 0;

  ctx.fillStyle = isLight ? "rgba(60, 50, 100, 0.6)" : "rgba(40, 30, 70, 0.6)";
  ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

  // Subtle grid
  ctx.strokeStyle = "rgba(120, 100, 200, 0.15)";
  ctx.lineWidth = 0.5;
  ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
};

const drawWallBorder = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
  ctx.fillStyle = "#1a1030";
  ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

  // Crystal/gem pattern
  ctx.strokeStyle = "rgba(100, 80, 180, 0.3)";
  ctx.lineWidth = 1;
  const bh = TILE_SIZE / 3;
  for (let i = 0; i < 3; i++) {
    ctx.strokeRect(x + 2, y + i * bh + 2, TILE_SIZE - 4, bh - 2);
  }

  // Inner glow
  ctx.fillStyle = "rgba(100, 80, 200, 0.05)";
  ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
};

const drawWallDeco = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
  ctx.fillStyle = "#15102a";
  ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

  // Starfield panel
  ctx.fillStyle = "rgba(80, 60, 160, 0.1)";
  ctx.fillRect(x + 3, y + 3, TILE_SIZE - 6, TILE_SIZE - 6);

  ctx.strokeStyle = "rgba(120, 100, 220, 0.2)";
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 3, y + 3, TILE_SIZE - 6, TILE_SIZE - 6);

  // Small star dots
  ctx.fillStyle = "rgba(200, 180, 255, 0.3)";
  ctx.fillRect(x + 12, y + 10, 2, 2);
  ctx.fillRect(x + 30, y + 20, 2, 2);
  ctx.fillRect(x + 20, y + 35, 2, 2);
};

const drawPillar = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
  drawFloorTile(ctx, x, y);

  // Crystal pillar
  const pw = 18;
  const px = x + (TILE_SIZE - pw) / 2;

  // Pillar glow
  ctx.shadowColor = "#8060d0";
  ctx.shadowBlur = 12;

  // Pillar body
  const grad = ctx.createLinearGradient(px, y, px + pw, y);
  grad.addColorStop(0, "#5040a0");
  grad.addColorStop(0.3, "#8070d0");
  grad.addColorStop(0.7, "#8070d0");
  grad.addColorStop(1, "#403080");
  ctx.fillStyle = grad;
  ctx.fillRect(px, y, pw, TILE_SIZE);

  // Crystal highlight
  ctx.fillStyle = "rgba(200, 180, 255, 0.3)";
  ctx.fillRect(px + 3, y, 4, TILE_SIZE);

  ctx.shadowBlur = 0;

  // Cap and base
  ctx.fillStyle = "#9080d0";
  ctx.fillRect(px - 3, y, pw + 6, 5);
  ctx.fillRect(px - 3, y + TILE_SIZE - 5, pw + 6, 5);
};

const drawGlowPath = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
  drawFloorTile(ctx, x, y);

  // Animated glow path
  const pulse = 0.3 + Math.sin(frameCount * 0.03) * 0.15;
  ctx.fillStyle = `rgba(120, 80, 220, ${pulse})`;
  ctx.fillRect(x + 8, y, TILE_SIZE - 16, TILE_SIZE);

  // Center line
  ctx.fillStyle = `rgba(180, 150, 255, ${pulse * 0.6})`;
  ctx.fillRect(x + TILE_SIZE / 2 - 1, y, 2, TILE_SIZE);

  // Side borders
  ctx.fillStyle = `rgba(150, 120, 255, ${pulse * 0.8})`;
  ctx.fillRect(x + 8, y, 2, TILE_SIZE);
  ctx.fillRect(x + TILE_SIZE - 10, y, 2, TILE_SIZE);
};

const drawPortalDoor = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  doorId: number,
  isCenter: boolean
) => {
  // Wall background
  ctx.fillStyle = "#15102a";
  ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

  const portalColors: Record<number, { glow: string; accent: string }> = {
    2: { glow: "#60d0ff", accent: "#2080c0" }, // Resume - blue
    3: { glow: "#ffa060", accent: "#c06020" }, // Blog - orange
    4: { glow: "#60ffa0", accent: "#20c060" }, // Projects - green
    5: { glow: "#ff60d0", accent: "#c02080" }, // Contact - pink
  };
  const colors = portalColors[doorId] || portalColors[2];

  if (isCenter) {
    const dx = x + 6;
    const dy = y + 2;
    const dw = TILE_SIZE - 12;
    const dh = TILE_SIZE - 2;
    const archR = dw / 2;

    // Door glow
    ctx.shadowColor = colors.glow;
    ctx.shadowBlur = 14;

    // Door frame (gold/accent)
    ctx.fillStyle = colors.accent;
    ctx.beginPath();
    ctx.moveTo(dx - 3, dy + dh);
    ctx.lineTo(dx - 3, dy + archR);
    ctx.arc(dx + archR, dy + archR, archR + 3, Math.PI, 0);
    ctx.lineTo(dx + dw + 3, dy + dh);
    ctx.closePath();
    ctx.fill();

    // Door body (wood)
    const woodGrad = ctx.createLinearGradient(dx, dy, dx + dw, dy);
    woodGrad.addColorStop(0, "#6b3a1f");
    woodGrad.addColorStop(0.3, "#8b5e3c");
    woodGrad.addColorStop(0.7, "#8b5e3c");
    woodGrad.addColorStop(1, "#5a2e15");
    ctx.fillStyle = woodGrad;
    ctx.beginPath();
    ctx.moveTo(dx, dy + dh);
    ctx.lineTo(dx, dy + archR);
    ctx.arc(dx + archR, dy + archR, archR, Math.PI, 0);
    ctx.lineTo(dx + dw, dy + dh);
    ctx.closePath();
    ctx.fill();

    ctx.shadowBlur = 0;

    // Wood panels
    ctx.strokeStyle = "rgba(0,0,0,0.25)";
    ctx.lineWidth = 1;
    // Top panel
    ctx.beginPath();
    ctx.roundRect(dx + 4, dy + archR - 4, dw / 2 - 6, 14, 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.roundRect(dx + dw / 2 + 2, dy + archR - 4, dw / 2 - 6, 14, 2);
    ctx.stroke();
    // Bottom panel
    ctx.beginPath();
    ctx.roundRect(dx + 4, dy + archR + 14, dw / 2 - 6, 16, 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.roundRect(dx + dw / 2 + 2, dy + archR + 14, dw / 2 - 6, 16, 2);
    ctx.stroke();

    // Center line
    ctx.strokeStyle = "rgba(0,0,0,0.2)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(dx + dw / 2, dy + archR - 8);
    ctx.lineTo(dx + dw / 2, dy + dh);
    ctx.stroke();

    // Door knob (gold)
    ctx.shadowColor = "#ffd700";
    ctx.shadowBlur = 4;
    ctx.fillStyle = "#ffd700";
    ctx.beginPath();
    ctx.arc(dx + dw / 2 + 8, dy + archR + 12, 3, 0, Math.PI * 2);
    ctx.fill();
    // Knob highlight
    ctx.fillStyle = "#fff8c0";
    ctx.beginPath();
    ctx.arc(dx + dw / 2 + 7, dy + archR + 11, 1.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Keyhole on arch
    const khCx = dx + dw / 2;
    const khCy = dy + archR / 2 + 2;
    const pulse = 0.6 + Math.sin(frameCount * 0.04 + doorId) * 0.3;

    // Keyhole glow
    ctx.shadowColor = colors.glow;
    ctx.shadowBlur = 8;
    ctx.globalAlpha = pulse;

    // Keyhole plate (gold circle)
    ctx.fillStyle = "#c8a830";
    ctx.beginPath();
    ctx.arc(khCx, khCy, 6, 0, Math.PI * 2);
    ctx.fill();

    // Keyhole shape (dark cutout)
    ctx.fillStyle = "#1a0a00";
    ctx.globalAlpha = 1;
    // Circle part of keyhole
    ctx.beginPath();
    ctx.arc(khCx, khCy - 1, 2.2, 0, Math.PI * 2);
    ctx.fill();
    // Triangle part of keyhole
    ctx.beginPath();
    ctx.moveTo(khCx - 1.8, khCy + 0.5);
    ctx.lineTo(khCx + 1.8, khCy + 0.5);
    ctx.lineTo(khCx, khCy + 5);
    ctx.closePath();
    ctx.fill();

    ctx.shadowBlur = 0;
  } else {
    // Side pillar blocks
    ctx.fillStyle = "rgba(80, 60, 160, 0.2)";
    ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);

    // Stone texture
    ctx.strokeStyle = "rgba(120, 100, 220, 0.2)";
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 4, y + 4, TILE_SIZE - 8, TILE_SIZE / 2 - 4);
    ctx.strokeRect(x + 4, y + TILE_SIZE / 2 + 2, TILE_SIZE - 8, TILE_SIZE / 2 - 6);

    // Small accent gem
    ctx.fillStyle = colors.glow;
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.arc(x + TILE_SIZE / 2, y + TILE_SIZE / 2, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
};

const drawStar = (
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  spikes: number,
  outerR: number,
  innerR: number
) => {
  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (i * Math.PI) / spikes - Math.PI / 2;
    const px = cx + Math.cos(angle) * r;
    const py = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
};

export const renderLobby = (
  ctx: CanvasRenderingContext2D,
  character: Character,
  canvasWidth: number,
  canvasHeight: number
) => {
  frameCount++;

  const mapWidth = MAP_COLS * TILE_SIZE;
  const mapHeight = MAP_ROWS * TILE_SIZE;

  // Use Math.min so the entire map fits on screen
  const scale = Math.min(canvasWidth / mapWidth, canvasHeight / mapHeight);
  const offsetX = (canvasWidth - mapWidth * scale) / 2;
  const offsetY = (canvasHeight - mapHeight * scale) / 2;

  // Draw space background (full canvas, before transform)
  drawSpaceBackground(ctx, canvasWidth, canvasHeight);

  ctx.save();
  ctx.translate(offsetX, offsetY);
  ctx.scale(scale, scale);

  // Draw tiles
  for (let row = 0; row < MAP_ROWS; row++) {
    for (let col = 0; col < MAP_COLS; col++) {
      const tile = LOBBY_MAP[row][col];
      const x = col * TILE_SIZE;
      const y = row * TILE_SIZE;

      switch (tile) {
        case 0:
          drawFloorTile(ctx, x, y);
          break;
        case 1:
          drawWallBorder(ctx, x, y);
          break;
        case 6:
          drawWallDeco(ctx, x, y);
          break;
        case 7:
          drawPillar(ctx, x, y);
          break;
        case 8:
          drawGlowPath(ctx, x, y);
          break;
        default:
          if (tile >= 2 && tile <= 5) {
            const doorPositions: number[] = [];
            for (let c = 0; c < MAP_COLS; c++) {
              if (LOBBY_MAP[row][c] === tile) doorPositions.push(c);
            }
            const centerCol = doorPositions[Math.floor(doorPositions.length / 2)];
            drawPortalDoor(ctx, x, y, tile, col === centerCol);
          }
          break;
      }
    }
  }

  // Door labels
  for (const door of DOORS) {
    const positions: { col: number; row: number }[] = [];
    for (let r = 0; r < MAP_ROWS; r++) {
      for (let c = 0; c < MAP_COLS; c++) {
        if (LOBBY_MAP[r][c] === door.id) {
          positions.push({ col: c, row: r });
        }
      }
    }
    if (positions.length > 0) {
      const avgCol = positions.reduce((s, p) => s + p.col, 0) / positions.length;
      const avgRow = positions.reduce((s, p) => s + p.row, 0) / positions.length;
      const lx = (avgCol + 0.5) * TILE_SIZE;
      // Label below door for top doors, above for bottom doors
      const isTopDoor = avgRow < MAP_ROWS / 2;
      const ly = isTopDoor
        ? (avgRow + 1.5) * TILE_SIZE + 4
        : (avgRow - 0.5) * TILE_SIZE - 4;

      const labelText = `${door.emoji} ${door.label}`;
      ctx.font = "bold 13px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const textWidth = ctx.measureText(labelText).width;

      ctx.fillStyle = "rgba(0,0,0,0.7)";
      ctx.beginPath();
      ctx.roundRect(lx - textWidth / 2 - 10, ly - 11, textWidth + 20, 22, 6);
      ctx.fill();

      // Colored text matching portal
      const labelColors: Record<number, string> = {
        2: "#60d0ff",
        3: "#ffa060",
        4: "#60ffa0",
        5: "#ff60d0",
      };
      ctx.fillStyle = labelColors[door.id] || "#fff";
      ctx.fillText(labelText, lx, ly);
    }
  }

  // Draw character
  drawCharacter(ctx, character);

  // Interaction prompt
  const charCol = Math.round(character.x / TILE_SIZE);
  const charRow = Math.round(character.y / TILE_SIZE);
  const door = getNearbyDoor(charCol, charRow);

  if (door) {
    const promptText = "Press Enter";
    ctx.font = "bold 14px sans-serif";
    const tw = ctx.measureText(promptText).width;
    const px = character.x + TILE_SIZE / 2;
    const py = character.y - 30;

    const labelColors: Record<number, string> = {
      2: "#60d0ff",
      3: "#ffa060",
      4: "#60ffa0",
      5: "#ff60d0",
    };

    ctx.shadowColor = labelColors[door.id] || "#f0c040";
    ctx.shadowBlur = 10;
    ctx.fillStyle = "rgba(0,0,0,0.85)";
    ctx.beginPath();
    ctx.roundRect(px - tw / 2 - 14, py - 13, tw + 28, 26, 8);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = labelColors[door.id] || "#fff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(promptText, px, py);
  }

  ctx.restore();
};
