'use client';

import { ResponsiveContainer } from 'recharts';
import type { ReactNode } from 'react';

interface BaseChartProps {
  children: ReactNode;
  height?: number;
  className?: string;
}

export function BaseChart({ children, height = 300, className = '' }: BaseChartProps) {
  return (
    <div className={`chart-container ${className}`}>
      <ResponsiveContainer width="100%" height={height}>
        {children}
      </ResponsiveContainer>
    </div>
  );
}
