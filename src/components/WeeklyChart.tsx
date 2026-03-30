import { useMemo } from 'react';
import { motion } from 'framer-motion';

export interface DayData {
  label: string;
  chats: number;
  orders: number;
}

interface WeeklyChartProps {
  data: DayData[];
}

const BAR_COLORS = {
  chats: '#2A8BFF',
  orders: '#F59E0B',
} as const;

export default function WeeklyChart({ data }: WeeklyChartProps) {
  const maxVal = useMemo(
    () => Math.max(1, ...data.flatMap((d) => [d.chats, d.orders])),
    [data]
  );

  const chartH = 160;
  const barWidth = 18;
  const gap = 6;
  const groupW = barWidth * 2 + gap;

  return (
    <div className="w-full font-professional">
      <div className="flex items-center gap-5 mb-4">
        <span className="flex items-center gap-2 text-[12px] font-medium text-app-muted">
          <span
            className="w-2.5 h-2.5 rounded-[3px]"
            style={{ backgroundColor: BAR_COLORS.chats }}
          />
          Chats
        </span>
        <span className="flex items-center gap-2 text-[12px] font-medium text-app-muted">
          <span
            className="w-2.5 h-2.5 rounded-[3px]"
            style={{ backgroundColor: BAR_COLORS.orders }}
          />
          Pedidos
        </span>
      </div>

      <div className="flex items-end justify-between w-full">
        {data.map((day, i) => {
          const chatsH = (day.chats / maxVal) * chartH;
          const ordersH = (day.orders / maxVal) * chartH;

          return (
            <div key={day.label} className="flex flex-col items-center">
              <div
                className="flex items-end gap-[3px]"
                style={{ height: chartH }}
              >
                <motion.div
                  className="rounded-t-md"
                  style={{
                    width: barWidth,
                    backgroundColor: BAR_COLORS.chats,
                  }}
                  initial={{ height: 0 }}
                  animate={{ height: Math.max(chatsH, 4) }}
                  transition={{
                    delay: i * 0.06,
                    type: 'spring',
                    stiffness: 260,
                    damping: 24,
                  }}
                  title={`${day.chats} chats`}
                />
                <motion.div
                  className="rounded-t-md"
                  style={{
                    width: barWidth,
                    backgroundColor: BAR_COLORS.orders,
                  }}
                  initial={{ height: 0 }}
                  animate={{ height: Math.max(ordersH, 4) }}
                  transition={{
                    delay: i * 0.06 + 0.03,
                    type: 'spring',
                    stiffness: 260,
                    damping: 24,
                  }}
                  title={`${day.orders} pedidos`}
                />
              </div>
              <span className="text-[11px] font-medium text-app-muted mt-2 select-none">
                {day.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
