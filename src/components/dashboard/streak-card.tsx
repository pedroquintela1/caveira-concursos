'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame } from 'lucide-react';

interface StreakCardProps {
  streak: number;
}

export function StreakCard({ streak }: StreakCardProps) {
  return (
    <Card className="border-[#8fbc8f]/30 bg-gradient-to-br from-[#8fbc8f]/20 to-[#8fbc8f]/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[#8fbc8f]">
          <Flame className="h-5 w-5" />
          Sequência de Estudos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center">
          <div className="mb-2 font-saira text-6xl font-bold text-[#8fbc8f]">
            {streak}
          </div>
          <p className="text-sm text-gray-400">dias consecutivos</p>

          {/* Streak Calendar */}
          <div className="mt-4 grid grid-cols-7 gap-1">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className={`h-8 rounded ${
                  i < streak ? 'bg-[#8fbc8f]' : 'bg-gray-800'
                }`}
              />
            ))}
          </div>

          <p className="mt-4 text-xs text-gray-500">
            Continue estudando para manter sua sequência!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
