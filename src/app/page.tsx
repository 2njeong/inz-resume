"use client";

import { GameCanvas } from "@/components/game/GameCanvas";

export default function Home() {
  return (
    <main className="w-screen h-screen bg-[var(--game-bg)] overflow-hidden">
      <GameCanvas />
    </main>
  );
}
