"use client";

import { useRouter } from "next/navigation";
import { useEffect, useCallback } from "react";

type RoomLayoutProps = {
  title: string;
  accentColor?: string;
  children: React.ReactNode;
};

export const RoomLayout = ({
  title,
  accentColor = "#60d0ff",
  children,
}: RoomLayoutProps) => {
  const router = useRouter();

  const handleBack = useCallback(() => {
    router.push("/");
  }, [router]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleBack();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleBack]);

  return (
    <div className="min-h-screen bg-[#080515] text-white relative overflow-hidden">
      {/* Background stars */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute w-1 h-1 rounded-full bg-white/30 animate-pulse"
          style={{ top: "10%", left: "15%" }}
        />
        <div
          className="absolute w-1.5 h-1.5 rounded-full bg-white/20 animate-pulse"
          style={{ top: "25%", left: "80%", animationDelay: "1s" }}
        />
        <div
          className="absolute w-1 h-1 rounded-full bg-white/25 animate-pulse"
          style={{ top: "60%", left: "5%", animationDelay: "2s" }}
        />
        <div
          className="absolute w-1 h-1 rounded-full bg-white/30 animate-pulse"
          style={{ top: "45%", left: "90%", animationDelay: "0.5s" }}
        />
        <div
          className="absolute w-1.5 h-1.5 rounded-full bg-white/15 animate-pulse"
          style={{ top: "80%", left: "70%", animationDelay: "1.5s" }}
        />
        {/* Nebula glow */}
        <div
          className="absolute w-96 h-96 rounded-full opacity-5 blur-3xl"
          style={{
            background: `radial-gradient(circle, ${accentColor}, transparent)`,
            top: "-10%",
            right: "-10%",
          }}
        />
        <div
          className="absolute w-80 h-80 rounded-full opacity-5 blur-3xl"
          style={{
            background: "radial-gradient(circle, #8040c0, transparent)",
            bottom: "0%",
            left: "-5%",
          }}
        />
      </div>

      {/* Header */}
      <header
        className="sticky top-0 z-10 backdrop-blur-md border-b px-6 py-4 flex items-center gap-4"
        style={{
          backgroundColor: "rgba(8, 5, 21, 0.85)",
          borderColor: `${accentColor}20`,
        }}
      >
        <button
          onClick={handleBack}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all cursor-pointer hover:scale-105"
          style={{
            color: accentColor,
            backgroundColor: `${accentColor}10`,
            border: `1px solid ${accentColor}30`,
          }}
        >
          <span>&larr;</span>
          <span>Lobby</span>
        </button>
        <h1 className="text-xl font-bold" style={{ color: accentColor }}>
          {title}
        </h1>
      </header>

      {/* Content */}
      <main className="relative z-1 max-w-4xl mx-auto px-6 py-10">
        {children}
      </main>
    </div>
  );
};
