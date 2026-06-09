'use client';

// ============================================================
// ⬢ ELO CHART
// Recharts LineChart of ELO trajectory over time.
// Win = green dot, Loss = red dot, Draw = gray dot.
// Install: pnpm add recharts
// ============================================================

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
  CartesianGrid,
} from 'recharts';
import { useMemo } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { PiChartLine } from 'react-icons/pi';

// ─── TYPES ───────────────────────────────────────────────────

type EloDataPoint = {
  date:             Date;
  elo:              number;
  result:           'win' | 'loss' | 'draw';
  opponentUsername: string;
  opponentElo:      number;
};

type EloChartProps = {
  data:     EloDataPoint[];
  loading?: boolean;
};

type ChartPoint = {
  dateMs:   number;
  dateLabel: string;
  elo:      number;
  result:   'win' | 'loss' | 'draw';
  opponent: string;
  oppElo:   number;
};

// ─── CONSTANTS ───────────────────────────────────────────────

const RESULT_COLORS = {
  win:  '#22AA44',
  loss: '#CC2222',
  draw: '#9B9088',
} as const;

// ─── CUSTOM TOOLTIP ──────────────────────────────────────────

function ChartTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;

  const d: ChartPoint = payload[0].payload;

  return (
    <div
      style={{
        fontFamily: "'IBM Plex Mono', monospace",
        border:     '1.5px solid #1A1A1A',
        background: '#F8F3E8',
      }}
      className="px-3 py-2.5 flex flex-col gap-1.5 shadow-none"
    >
      <p className="text-[10px] font-semibold tracking-[0.1em] uppercase text-[#9B9088]">
        {d.dateLabel}
      </p>
      <p
        style={{ fontFamily: "'Playfair Display', serif" }}
        className="text-[22px] font-black text-[#1A1A1A] leading-none"
      >
        {d.elo}
      </p>
      <p className={`text-[10px] font-semibold uppercase tracking-[0.08em]
        ${d.result === 'win' ? 'text-[#22AA44]' : d.result === 'loss' ? 'text-[#CC2222]' : 'text-[#9B9088]'}`}
      >
        {d.result} vs {d.opponent} ({d.oppElo})
      </p>
    </div>
  );
}

// ─── COMPONENT ───────────────────────────────────────────────

export function EloChart({ data, loading = false }: EloChartProps) {

  // ── Transform ──

  const chartData = useMemo((): ChartPoint[] => {
    return data.map((d) => ({
      dateMs:    d.date.getTime(),
      dateLabel: d.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }),
      elo:       d.elo,
      result:    d.result,
      opponent:  d.opponentUsername,
      oppElo:    d.opponentElo,
    }));
  }, [data]);

  // ── Loading ──

  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton height="180px" />
      </div>
    );
  }

  // ── Empty ──

  if (chartData.length === 0) {
    return (
      <EmptyState
        icon={<PiChartLine size={24} />}
        title="No ELO data yet"
        description="Play some games to see your trajectory."
      />
    );
  }

  const minElo = Math.min(...chartData.map((d) => d.elo)) - 50;
  const maxElo = Math.max(...chartData.map((d) => d.elo)) + 50;

  // ── Render ──

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={chartData} margin={{ top: 10, right: 8, bottom: 0, left: -10 }}>

        <CartesianGrid
          strokeDasharray="0"
          stroke="#C5C8B5"
          strokeWidth={0.75}
          vertical={false}
        />

        <XAxis
          dataKey="dateMs"
          type="number"
          scale="time"
          domain={['dataMin', 'dataMax']}
          tickFormatter={(ms) =>
            new Date(ms).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
          }
          tick={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, fill: '#9B9088' }}
          tickLine={false}
          axisLine={{ stroke: '#C5C8B5' }}
          interval="preserveStartEnd"
        />

        <YAxis
          domain={[minElo, maxElo]}
          tick={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, fill: '#9B9088' }}
          tickLine={false}
          axisLine={false}
          width={38}
        />

        <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#C5C8B5', strokeWidth: 1 }} />

        {/* Main ELO line */}
        <Line
          type="monotone"
          dataKey="elo"
          stroke="#1A1A1A"
          strokeWidth={1.5}
          dot={false}
          activeDot={{ r: 4, fill: '#1A1A1A', strokeWidth: 0 }}
        />

        {/* Result dots — only render up to 60 to avoid SVG overload */}
        {chartData.slice(-60).map((point, i) => (
          <ReferenceDot
            key={i}
            x={point.dateMs}
            y={point.elo}
            r={3}
            fill={RESULT_COLORS[point.result]}
            strokeWidth={0}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}