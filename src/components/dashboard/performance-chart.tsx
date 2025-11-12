'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface PerformanceChartProps {
  userId?: string;
}

// Mock data - substituir por dados reais do banco
const mockData = [
  { day: 'Seg', acertos: 65 },
  { day: 'Ter', acertos: 72 },
  { day: 'Qua', acertos: 58 },
  { day: 'Qui', acertos: 80 },
  { day: 'Sex', acertos: 75 },
  { day: 'Sáb', acertos: 85 },
  { day: 'Dom', acertos: 70 },
];

export function PerformanceChart({ userId }: PerformanceChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Desempenho Semanal</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="day"
                stroke="#9ca3af"
                fontSize={12}
                tickLine={false}
              />
              <YAxis
                stroke="#9ca3af"
                fontSize={12}
                tickLine={false}
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Line
                type="monotone"
                dataKey="acertos"
                stroke="#8fbc8f"
                strokeWidth={3}
                dot={{ fill: '#8fbc8f', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-between border-t border-gray-800 pt-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[#8fbc8f]" />
            <span className="text-sm text-gray-400">Taxa de Acerto (%)</span>
          </div>
          <div className="text-right">
            <p className="font-saira text-2xl font-bold text-[#8fbc8f]">72%</p>
            <p className="text-xs text-gray-500">Média da semana</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
