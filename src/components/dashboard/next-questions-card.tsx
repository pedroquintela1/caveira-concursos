'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, PlayCircle } from 'lucide-react';

export function NextQuestionsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Próximas Questões</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Quick Start */}
        <div className="rounded-lg border-2 border-dashed border-[#8fbc8f]/50 bg-[#8fbc8f]/10 p-4 text-center">
          <PlayCircle className="mx-auto mb-2 h-8 w-8 text-[#8fbc8f]" />
          <p className="mb-2 text-sm font-medium text-white">
            Pronto para começar?
          </p>
          <Link href="/dashboard/cadernos">
            <Button className="w-full bg-[#8fbc8f] font-bold text-gray-900 hover:bg-[#7da87d]">
              Ir para Cadernos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Recommended Topics */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-400">
            Tópicos Recomendados:
          </p>
          <div className="space-y-2">
            {['CF/88 - Arts. 1-5', 'Código Penal', 'Lei 8.112/90'].map(
              (topic) => (
                <button
                  key={topic}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-3 py-2 text-left text-sm text-white transition-all hover:border-[#8fbc8f]/50 hover:bg-gray-700"
                >
                  {topic}
                </button>
              )
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="border-t border-gray-800 pt-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Questões disponíveis hoje:</span>
            <span className="font-semibold text-[#8fbc8f]">5 / 5</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
