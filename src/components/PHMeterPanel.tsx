import React from 'react';
import { SimulationMetrics } from '../types/fermentation';
import { Activity, Beaker, Flame, ShieldCheck, AlertTriangle } from 'lucide-react';

interface PHMeterPanelProps {
  metrics: SimulationMetrics;
  initialLactose: number;
}

export const PHMeterPanel: React.FC<PHMeterPanelProps> = ({
  metrics,
  initialLactose,
}) => {
  // Map pH between 3.8 (left: high acidity) and 7.0 (right: neutral milk) or left-to-right 7.0 -> 3.8
  // Let's map left (6.8 - Initial Milk) to right (3.8 - High Acidity) so progress moves left -> right as fermentation advances!
  const minScalePH = 3.8;
  const maxScalePH = 6.8;
  const markerPercent = Math.min(
    98,
    Math.max(2, ((maxScalePH - metrics.pH) / (maxScalePH - minScalePH)) * 100)
  );
  const isoelectricPercent = ((maxScalePH - 4.6) / (maxScalePH - minScalePH)) * 100;

  const getPHBadgeStyle = (pH: number) => {
    if (pH > 5.6) {
      return {
        bg: 'bg-sky-500/20 border-sky-400/50 text-sky-300',
        numColor: 'text-sky-300',
        statusText: 'Môi trường sữa ban đầu (Trung tính nhẹ)',
      };
    }
    if (pH > 4.75) {
      return {
        bg: 'bg-amber-500/20 border-amber-400/50 text-amber-300',
        numColor: 'text-amber-300',
        statusText: 'Đang axit hóa — Bắt đầu kết tụ Casein',
      };
    }
    if (pH >= 4.15) {
      return {
        bg: 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300',
        numColor: 'text-emerald-300',
        statusText: 'Đạt chuẩn Sữa chua! (Quanh điểm đẳng điện pH ≈ 4.6)',
      };
    }
    return {
      bg: 'bg-rose-500/20 border-rose-400/50 text-rose-300',
      numColor: 'text-rose-300',
      statusText: 'Quá chua (pH thấp) — Dễ tách nước chua',
    };
  };

  const badge = getPHBadgeStyle(metrics.pH);

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-4 md:p-5 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300">
            <Beaker className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base md:text-lg font-extrabold text-white tracking-tight">
              Máy Đo Độ pH &amp; Chuyển Hóa Sinh Hóa Trực Tiếp
            </h3>
            <p className="text-xs md:text-sm text-slate-400">
              Theo dõi sự giảm pH khi vi khuẩn Lactic chuyển hóa đường Lactose thành Axit Lactic
            </p>
          </div>
        </div>

        {/* Digital pH Readout Box */}
        <div
          className={`flex items-center gap-3 px-4 py-2 rounded-xl border ${badge.bg}`}
        >
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider opacity-85">
              Độ pH hiện tại
            </div>
            <div className="text-xs font-semibold">{badge.statusText}</div>
          </div>
          <div className={`text-3xl md:text-4xl font-black font-mono ${badge.numColor}`}>
            {metrics.pH.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Interactive pH Spectrum Bar (6.8 on Left -> 3.8 on Right) */}
      <div className="relative pt-6 pb-7 px-2">
        {/* Isoelectric Point (pH 4.6) Target Callout */}
        <div
          className="absolute top-0 -translate-x-1/2 flex flex-col items-center z-10"
          style={{ left: `${isoelectricPercent}%` }}
        >
          <span className="px-2 py-0.5 rounded-md bg-emerald-500/25 border border-emerald-400/60 text-[11px] font-bold text-emerald-300 whitespace-nowrap">
            Điểm đẳng điện pI = 4.6 (Đông tụ Gel)
          </span>
          <div className="w-0.5 h-3 bg-emerald-400" />
        </div>

        {/* Gradient Bar */}
        <div className="h-4 w-full rounded-full bg-gradient-to-r from-sky-400 via-amber-400 via-70% to-rose-500 relative shadow-inner border border-slate-700">
          {/* Isoelectric tick line */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-white/90 shadow"
            style={{ left: `${isoelectricPercent}%` }}
          />

          {/* Live pH Pointer */}
          <div
            className="absolute -top-2 -translate-x-1/2 transition-all duration-200 z-20 flex flex-col items-center"
            style={{ left: `${markerPercent}%` }}
          >
            <div className="w-7 h-7 rounded-full bg-white border-4 border-slate-950 shadow-lg flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
            </div>
          </div>
        </div>

        {/* Scale Labels */}
        <div className="flex justify-between text-xs font-bold text-slate-400 mt-2.5">
          <span className="text-sky-300">pH 6.65 (Sữa tươi ban đầu)</span>
          <span className="text-amber-300">pH 5.3 (Bắt đầu kết cụm)</span>
          <span className="text-emerald-300">pH 4.5 (Sữa chua chuẩn)</span>
          <span className="text-rose-400">pH 3.9 (Chua gắt)</span>
        </div>
      </div>

      {/* 3 Biochemical Progress Bars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-1">
        {/* 1. Lactose Remaining */}
        <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-3">
          <div className="flex justify-between items-center text-xs md:text-sm font-bold mb-1.5">
            <span className="text-amber-300">Đường đôi Lactose</span>
            <span className="font-mono text-white">
              {metrics.lactoseRemainingPercent}% / {initialLactose}%
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-400 rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(100, (metrics.lactoseRemainingPercent / 6.0) * 100)}%`,
              }}
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5">
            Nguồn cơ chất ban đầu bị phân giải bởi enzyme Lactase của vi khuẩn.
          </p>
        </div>

        {/* 2. Lactic Acid Produced */}
        <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-3">
          <div className="flex justify-between items-center text-xs md:text-sm font-bold mb-1.5">
            <span className="text-lime-300">Axit Lactic sản sinh</span>
            <span className="font-mono text-white">{metrics.lacticAcidPercent}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-lime-400 to-emerald-400 rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(100, (metrics.lacticAcidPercent / 1.15) * 100)}%`,
              }}
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5">
            Phân ly ra ion H⁺ làm giảm pH và tạo vị chua dịu đặc trưng.
          </p>
        </div>

        {/* 3. 3D Casein Gel Network */}
        <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-3">
          <div className="flex justify-between items-center text-xs md:text-sm font-bold mb-1.5">
            <span className="text-cyan-300">Mạng lưới Gel 3D Casein</span>
            <span className="font-mono text-white">
              {Math.round(metrics.gelProgress * 100)}%
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky-400 to-cyan-300 rounded-full transition-all duration-300"
              style={{ width: `${Math.round(metrics.gelProgress * 100)}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5">
            Các hạt Casein mất điện tích âm, liên kết thành khung 3D giữ nước.
          </p>
        </div>
      </div>

      {/* Temperature Biological Status Callout */}
      <div
        className={`mt-3 flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl border text-xs md:text-sm ${
          metrics.tempStatus === 'optimal'
            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
            : metrics.tempStatus === 'denatured' || metrics.tempStatus === 'hot'
            ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
            : 'bg-sky-950/40 border-sky-500/40 text-sky-200'
        }`}
      >
        {metrics.tempStatus === 'optimal' ? (
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        ) : metrics.tempStatus === 'denatured' || metrics.tempStatus === 'hot' ? (
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
        ) : (
          <Activity className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
        )}
        <div>
          <span className="font-bold">{metrics.tempStatusLabel}: </span>
          <span className="opacity-90">{metrics.tempStatusExplanation}</span>
          <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900/80 font-mono text-xs font-bold text-amber-300">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            Hoạt tính men: {Math.round(metrics.bacteriaActivity * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
};
