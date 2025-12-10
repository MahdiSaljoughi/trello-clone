// src/components/effects/ConfettiEffect.tsx (با Tailwind)
"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ConfettiEffectProps {
  trigger: boolean;
}

export function ConfettiEffect({ trigger }: ConfettiEffectProps) {
  const [pieces, setPieces] = useState<
    Array<{
      id: number;
      color: string;
      left: number;
      delay: number;
      duration: number;
    }>
  >([]);

  useEffect(() => {
    if (trigger) {
      // ایجاد confetti pieces
      const newPieces = [];
      for (let i = 0; i < 60; i++) {
        newPieces.push({
          id: i,
          color: getRandomColor(),
          left: Math.random() * 100,
          delay: Math.random() * 300,
          duration: 800 + Math.random() * 700,
        });
      }
      setPieces(newPieces);

      // پاک کردن بعد از انیمیشن
      const timer = setTimeout(() => {
        setPieces([]);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [trigger]);

  const getRandomColor = () => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-yellow-500",
      "bg-red-500",
      "bg-pink-500",
      "bg-cyan-500",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const getRandomShape = () => {
    const shapes = ["rounded-full", "rounded-sm", ""];
    return shapes[Math.floor(Math.random() * shapes.length)];
  };

  if (!trigger || pieces.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className={cn(
            "absolute top-0 w-3 h-3",
            piece.color,
            getRandomShape(),
            "shadow-lg"
          )}
          style={{
            left: `${piece.left}%`,
            animation: `
              confettiFall ${piece.duration}ms cubic-bezier(0.1, 0.8, 0.9, 0.1) ${piece.delay}ms forwards,
              confettiSpin ${piece.duration}ms linear ${piece.delay}ms forwards
            `,
          }}
        />
      ))}

      {/* CSS Animations */}
      <style jsx global>{`
        @keyframes confettiFall {
          0% {
            transform: translateY(-100px) translateX(0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh)
              translateX(${Math.random() * 200 - 100}px) scale(0);
            opacity: 0;
          }
        }

        @keyframes confettiSpin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(${Math.random() * 720}deg);
          }
        }
      `}</style>
    </div>
  );
}
