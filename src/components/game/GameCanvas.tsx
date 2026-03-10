"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { TILE_SIZE, MAP_COLS, MAP_ROWS, isWalkable, getNearbyDoor } from "./tilemap";
import { Character, createCharacter } from "./character";
import { renderLobby } from "./renderer";

const MOVE_SPEED = 3;

export const GameCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const characterRef = useRef<Character>(createCharacter(10, 6));
  const keysRef = useRef<Set<string>>(new Set());
  const animFrameRef = useRef<number>(0);
  const scaleRef = useRef<number>(1);
  const offsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const router = useRouter();

  const updateCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const mapWidth = MAP_COLS * TILE_SIZE;
    const mapHeight = MAP_ROWS * TILE_SIZE;
    scaleRef.current = Math.max(
      canvas.width / mapWidth,
      canvas.height / mapHeight
    );
    offsetRef.current = {
      x: (canvas.width - mapWidth * scaleRef.current) / 2,
      y: (canvas.height - mapHeight * scaleRef.current) / 2,
    };
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) {
        e.preventDefault();
      }
      keysRef.current.add(e.key);

      if (e.key === "Enter") {
        const char = characterRef.current;
        const col = Math.round(char.x / TILE_SIZE);
        const row = Math.round(char.y / TILE_SIZE);
        const door = getNearbyDoor(col, row);
        if (door) {
          router.push(door.route);
        }
      }
    },
    [router]
  );

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    keysRef.current.delete(e.key);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    const gameLoop = () => {
      const char = characterRef.current;
      const keys = keysRef.current;

      let dx = 0;
      let dy = 0;

      if (keys.has("ArrowUp") || keys.has("w")) {
        dy = -MOVE_SPEED;
        char.direction = "up";
      }
      if (keys.has("ArrowDown") || keys.has("s")) {
        dy = MOVE_SPEED;
        char.direction = "down";
      }
      if (keys.has("ArrowLeft") || keys.has("a")) {
        dx = -MOVE_SPEED;
        char.direction = "left";
      }
      if (keys.has("ArrowRight") || keys.has("d")) {
        dx = MOVE_SPEED;
        char.direction = "right";
      }

      char.isMoving = dx !== 0 || dy !== 0;

      if (char.isMoving) {
        char.frame++;

        const nextX = char.x + dx;
        const nextCol = Math.round(nextX / TILE_SIZE);
        const currentRow = Math.round(char.y / TILE_SIZE);
        if (isWalkable(nextCol, currentRow)) {
          char.x = nextX;
        }

        const nextY = char.y + dy;
        const currentCol = Math.round(char.x / TILE_SIZE);
        const nextRow = Math.round(nextY / TILE_SIZE);
        if (isWalkable(currentCol, nextRow)) {
          char.y = nextY;
        }
      }

      renderLobby(ctx, char, canvas.width, canvas.height);
      animFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      window.removeEventListener("resize", updateCanvasSize);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [handleKeyDown, handleKeyUp, updateCanvasSize]);

  return (
    <canvas
      ref={canvasRef}
      className="block w-screen h-screen"
      style={{ imageRendering: "pixelated" }}
    />
  );
};
