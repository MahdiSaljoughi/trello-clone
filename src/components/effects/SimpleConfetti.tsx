// src/components/effects/SimpleConfetti.tsx
"use client";

import { useEffect, useState } from "react";

interface SimpleConfettiProps {
  trigger: boolean;
}

export function SimpleConfetti({ trigger }: SimpleConfettiProps) {
  const [emojis, setEmojis] = useState<
    Array<{
      id: number;
      emoji: string;
      left: number;
      size: number;
    }>
  >([]);

  useEffect(() => {
    if (trigger) {
      const emojiList = [
        "🎉",
        "🎊",
        "✨",
        "🌟",
        "⭐",
        "💫",
        "🔥",
        "💯",
        "✅",
        "🏆",
      ];
      const newEmojis = [];

      for (let i = 0; i < 20; i++) {
        newEmojis.push({
          id: i,
          emoji: emojiList[Math.floor(Math.random() * emojiList.length)],
          left: Math.random() * 100,
          size: 20 + Math.random() * 20,
        });
      }

      setEmojis(newEmojis);

      setTimeout(() => {
        setEmojis([]);
      }, 1500);
    }
  }, [trigger]);

  if (emojis.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {emojis.map((emoji) => (
        <div
          key={emoji.id}
          className="absolute top-0 animate-bounce"
          style={{
            left: `${emoji.left}%`,
            fontSize: `${emoji.size}px`,
            animationDelay: `${Math.random() * 300}ms`,
            animationDuration: `${800 + Math.random() * 800}ms`,
          }}
        >
          {emoji.emoji}
        </div>
      ))}
    </div>
  );
}
