import React, { useEffect, useMemo, useState } from 'react';
import {
  BACTERIA_OPTIONS,
  BacteriaType,
  computeSimulationMetrics,
  MILK_OPTIONS,
  MilkType,
  StageId,
  ViewMode,
} from './types/fermentation';
import { MacroJarScene } from './components/MacroJarScene';
import { MicroStructureScene } from './components/MicroStructureScene';
import { PHMeterPanel } from './components/PHMeterPanel';
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  Columns,
  Droplets,
  FlaskConical,
  HelpCircle,
  Layers,
  Microscope,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Thermometer,
} from 'lucide-react';

export function App() {
  // Interactive State
  const [stage, setStage] = useState<StageId>(1);
  const [viewMode, setViewMode] = useState<ViewMode>('dual');
  const [selectedMilkId, setSelectedMilkId] = useState<MilkType>('fresh_milk');
  const [selectedBacteriaId, setSelectedBacteriaId] = useState<BacteriaType>('symbiotic');
  const [timeHours, setTimeHours] = useState<number>(0);
  const [temperatureC, setTemperatureC] = useState<number>(42);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [showQuizModal, setShowQuizModal] = useState<boolean>(false);
  const [selectedQuizAnswers, setSelectedQuizAnswers] = useState<Record<number, number>>({});

  const selectedMilk = useMemo(
    () => MILK_OPTIONS.find((m) => m.id === selectedMilkId) || MILK_OPTIONS[0],
    [selectedMilkId]
  );

  const selectedBacteria = useMemo(
    () => BACTERIA_OPTIONS.find((b) => b.id === selectedBacteriaId) || BACTERIA_OPTIONS[0],
    [selectedBacteriaId]
  );

  const metrics = useMemo(
    () => computeSimulationMetrics(selectedMilk, selectedBacteria, timeHours, temperatureC),
    [selectedMilk, selectedBacteria, timeHours, temperatureC]
  );

  // Auto-advance fermentation timer when playing
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setTimeHours((prev) => {
        if (prev >= 12) {
          setIsPlaying(false);
          return 12;
        }
        return Number((prev + 0.15).toFixed(2));
      });
    }, 100);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Stage transition helper
  const handleSelectStage = (targetStage: StageId) => {
    setStage(targetStage);
    if (targetStage === 1) {
      setIsPlaying(false);
    } else if (targetStage === 2 && timeHours < 1.5) {
      // Jump to active fermentation if still at 0h so students see immediate reaction
      setTimeHours(3.5);
    } else if (targetStage === 3 && timeHours < 5.0) {
      // Jump to gel coagulation stage so students see the 3D gel matrix form
      setTimeHours(7.5);
    }
  };

  // Classroom Experiment Presets
  const applyPreset = (preset: 'initial' | 'optimal' | 'cold' | 'hot_dead') => {
    setIsPlaying(false);
    if (preset === 'initial') {
      setTimeHours(0);
      setTemperatureC(42);
    } else if (preset === 'optimal') {
      setTemperatureC(42);
      setTimeHours(8);
    } else if (preset === 'cold') {
      setTemperatureC(22);
      setTimeHours(8);
    } else if (preset === 'hot_dead') {
      setTemperatureC(58);
      setTimeHours(8);
    }
  };

  const quizQuestions = [
    {
      q: '1. Vi khuẩn Lactic chuyển hóa đường Lactose trong sữa thành chất gì làm giảm độ pH?',
      options: [
        'Rượu Etylic và khí CO₂',
        'Axit Lactic (CH₃CH(OH)COOH)',
        'Axit Axetic (Giấm ăn)',
        'Đường Glucose và Tinh bột',
      ],
      correct: 1,
      explain:
        'Lên men sữa chua là quá trình lên men Lactic đồng hình: Đường đôi Lactose được chuyển hóa thành Axit Lactic, giải phóng ion H⁺ làm giảm độ pH.',
    },
    {
      q: '2. Tại sao sữa từ trạng thái lỏng lại đông đặc thành cấu trúc Gel 3D mịn màng khi pH giảm xuống khoảng 4.6?',
      options: [
        'Do nước trong sữa bay hơi hết khi ủ ấm',
        'Do vi khuẩn tiết ra chất keo dính kết sữa lại',
        'Do các hạt Protein (Micelle Casein) mất điện tích âm ở điểm đẳng điện (pI ≈ 4.6) và liên kết thành mạng lưới 3D giữ nước',
        'Do chất béo đông đặc lại ở nhiệt độ 42°C',
      ],
      correct: 2,
      explain:
        'Ở pH 6.6, các hạt Micelle Casein tích điện âm nên đẩy nhau. Khi pH hạ xuống 4.6 (điểm đẳng điện), điện tích ròng bằng 0, chúng kết cụm tạo mạng lưới Gel 3D giữ nước và chất béo.',
    },
    {
      q: '3. Điều gì xảy ra nếu ta pha sữa quá nóng (> 55°C) khi cho sữa chua cái (men giống) vào?',
      options: [
        'Sữa chua đông đặc nhanh gấp đôi và thơm ngon hơn',
        'Enzyme bị biến tính và vi khuẩn Lactic bị tiêu diệt (chết men), sữa không thể lên men',
        'Vi khuẩn chuyển sang lên men rượu',
        'Độ pH giảm ngay lập tức xuống 3.0',
      ],
      correct: 1,
      explain:
        'Nhiệt độ tối ưu cho vi khuẩn Lactic là 40°C – 45°C. Trên 54°C, protein enzyme của vi khuẩn bị biến tính nhiệt làm chết men.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      {/* Top Presentation Header */}
      <header className="border-b border-slate-800/90 bg-slate-950/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
          {/* Brand & Course Title */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20">
              <FlaskConical className="w-6 h-6 stroke-[2.4]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/40 text-amber-300 text-xs font-extrabold uppercase tracking-wider">
                  Sinh Học 10 • Công Nghệ Vi Sinh
                </span>
                <span className="hidden sm:inline-block text-xs text-slate-400 font-medium">
                  Mô phỏng Tương tác 3D Vĩ mô &amp; Vi mô
                </span>
              </div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-white">
                Quá Trình Lên Men Lactic Làm Sữa Chua
              </h1>
            </div>
          </div>

          {/* 3-Step Interactive Progress Stepper */}
          <nav
            aria-label="Các bước mô phỏng"
            className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-2xl border border-slate-800"
          >
            {[
              { id: 1 as StageId, label: '1. Chuẩn bị Nguyên liệu', short: '1. Nguyên liệu' },
              { id: 2 as StageId, label: '2. Lên men & Hạ pH', short: '2. Lên men' },
              { id: 3 as StageId, label: '3. Đông tụ Gel 3D', short: '3. Tạo Gel 3D' },
            ].map((item) => {
              const active = stage === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectStage(item.id)}
                  className={`px-3.5 py-2 rounded-xl font-bold text-sm md:text-base transition-all cursor-pointer flex items-center gap-2 ${
                    active
                      ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                  }`}
                >
                  <span className="hidden lg:inline">{item.label}</span>
                  <span className="lg:hidden">{item.short}</span>
                </button>
              );
            })}
          </nav>

          {/* View Mode Switcher & Quiz Button */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setViewMode('dual')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs md:text-sm font-bold transition-all cursor-pointer ${
                  viewMode === 'dual'
                    ? 'bg-cyan-400 text-slate-950'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Columns className="w-4 h-4" />
                <span>Song song (Vĩ mô + Vi mô)</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('macro')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs md:text-sm font-bold transition-all cursor-pointer ${
                  viewMode === 'macro'
                    ? 'bg-amber-400 text-slate-950'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span className="hidden sm:inline">Hũ sữa</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('micro')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs md:text-sm font-bold transition-all cursor-pointer ${
                  viewMode === 'micro'
                    ? 'bg-pink-500 text-white'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Microscope className="w-4 h-4" />
                <span className="hidden sm:inline">Vi mô 3D</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowQuizModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/50 text-emerald-300 font-bold text-xs md:text-sm transition-all cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Câu hỏi ôn tập</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 md:px-6 py-4 grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* LEFT COLUMN (7/12 on XL): Dual 3D Perspectives + Live pH Meter */}
        <div className="xl:col-span-7 flex flex-col gap-4">
          {/* Dual 3D Viewport Container */}
          <div
            className={`grid gap-4 min-h-[380px] md:min-h-[430px] ${
              viewMode === 'dual' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'
            }`}
          >
            {(viewMode === 'dual' || viewMode === 'macro') && (
              <MacroJarScene
                milk={selectedMilk}
                bacteria={selectedBacteria}
                metrics={metrics}
                temperatureC={temperatureC}
                timeHours={timeHours}
                stage={stage}
              />
            )}

            {(viewMode === 'dual' || viewMode === 'micro') && (
              <MicroStructureScene
                milk={selectedMilk}
                bacteria={selectedBacteria}
                metrics={metrics}
                temperatureC={temperatureC}
                timeHours={timeHours}
                stage={stage}
              />
            )}
          </div>

          {/* Live pH Meter & Biochemical Conversion Component */}
          <PHMeterPanel
            metrics={metrics}
            initialLactose={selectedMilk.lactosePercent}
          />
        </div>

        {/* RIGHT COLUMN (5/12 on XL): Interactive Controls & Stage Explanations */}
        <div className="xl:col-span-5 flex flex-col gap-4">
          {/* Persistent Fermentation Time & Temperature Sliders Card */}
          <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-4 md:p-5 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h2 className="text-base md:text-lg font-extrabold text-white">
                  Bảng Điều Khiển Ủ Sữa Chua (Thời Gian &amp; Nhiệt Độ)
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (timeHours >= 12) setTimeHours(0);
                    setIsPlaying((prev) => !prev);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-extrabold text-sm transition-all cursor-pointer shadow-lg ${
                    isPlaying
                      ? 'bg-rose-500 text-white'
                      : 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                  }`}
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-4 h-4 fill-current" />
                      Tạm dừng ủ
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      Chạy tự động
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsPlaying(false);
                    setTimeHours(0);
                    setTemperatureC(42);
                  }}
                  title="Đặt lại về 0 giờ"
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Slider 1: Time (0 - 12 hours) */}
            <div className="mb-4 bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5">
              <div className="flex justify-between items-center mb-2">
                <label
                  htmlFor="time-slider"
                  className="flex items-center gap-2 text-sm md:text-base font-bold text-slate-200"
                >
                  <Clock className="w-5 h-5 text-amber-400" />
                  <span>Thời gian ủ lên men:</span>
                </label>
                <span className="px-3 py-1 rounded-lg bg-amber-400/20 border border-amber-400/40 font-mono text-lg md:text-xl font-black text-amber-300">
                  {timeHours.toFixed(1)} giờ
                </span>
              </div>
              <input
                id="time-slider"
                type="range"
                min={0}
                max={12}
                step={0.1}
                value={timeHours}
                onChange={(e) => {
                  setIsPlaying(false);
                  setTimeHours(parseFloat(e.target.value));
                }}
                className="w-full presentation-slider bg-gradient-to-r from-sky-500 via-amber-400 to-emerald-400"
              />
              <div className="flex justify-between text-xs font-semibold text-slate-400 mt-1.5">
                <span>0h (Mới cấy men)</span>
                <span>4h (Đang lên men mạnh)</span>
                <span>8h (Đông đặc chuẩn)</span>
                <span>12h (Ủ lâu / Chua đậm)</span>
              </div>
            </div>

            {/* Slider 2: Temperature (20°C - 60°C) */}
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5">
              <div className="flex justify-between items-center mb-2">
                <label
                  htmlFor="temp-slider"
                  className="flex items-center gap-2 text-sm md:text-base font-bold text-slate-200"
                >
                  <Thermometer className="w-5 h-5 text-rose-400" />
                  <span>Nhiệt độ buồng ủ:</span>
                </label>
                <span
                  className={`px-3 py-1 rounded-lg border font-mono text-lg md:text-xl font-black ${
                    temperatureC >= 40 && temperatureC <= 45
                      ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300'
                      : temperatureC > 53
                      ? 'bg-rose-500/20 border-rose-400/50 text-rose-300'
                      : 'bg-sky-500/20 border-sky-400/50 text-sky-300'
                  }`}
                >
                  {temperatureC}°C
                </span>
              </div>
              <input
                id="temp-slider"
                type="range"
                min={20}
                max={60}
                step={1}
                value={temperatureC}
                onChange={(e) => setTemperatureC(parseInt(e.target.value, 10))}
                className="w-full presentation-slider bg-gradient-to-r from-sky-400 via-emerald-400 via-60% to-rose-500"
              />
              <div className="flex justify-between text-xs font-semibold text-slate-400 mt-1.5">
                <span className="text-sky-300">20°C (Quá lạnh)</span>
                <span className="text-emerald-300 font-bold">40–45°C (Nhiệt độ Vàng)</span>
                <span className="text-rose-400">60°C (Chết men)</span>
              </div>
            </div>

            {/* Quick Classroom Experiment Scenario Buttons */}
            <div className="mt-3 pt-3 border-t border-slate-800/80">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Thí nghiệm đối chứng nhanh trên lớp:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => applyPreset('initial')}
                  className="px-2.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition-all cursor-pointer"
                >
                  Ban đầu (0h, 42°C)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('optimal')}
                  className="px-2.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-xs font-bold text-emerald-300 border border-emerald-500/40 transition-all cursor-pointer"
                >
                  Ủ chuẩn (8h, 42°C)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('cold')}
                  className="px-2.5 py-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-xs font-bold text-sky-300 border border-sky-500/40 transition-all cursor-pointer"
                >
                  Ủ lạnh (8h, 22°C)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('hot_dead')}
                  className="px-2.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-xs font-bold text-rose-300 border border-rose-500/40 transition-all cursor-pointer"
                >
                  Nước sôi (8h, 58°C)
                </button>
              </div>
            </div>
          </div>

          {/* STAGE-SPECIFIC INTERACTIVE CARDS & VIETNAMESE EXPLANATION */}
          {stage === 1 && (
            <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-4 md:p-5 shadow-xl flex-1 flex flex-col justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-bold mb-2">
                  <span>BƯỚC 1 / 3 • THIẾT LẬP MÔI TRƯỜNG &amp; GIỐNG VI SINH VẬT</span>
                </div>
                <h2 className="text-lg md:text-xl font-extrabold text-white mb-1">
                  Chọn Nền Sữa &amp; Chủng Vi Khuẩn Lactic
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed mb-4">
                  Để làm sữa chua, ta cần <strong>nguồn đường Lactose + Protein Casein</strong> (từ
                  sữa) và <strong>men giống vi khuẩn Lactic</strong> (từ sữa chua cái). Hãy chọn tổ
                  hợp nguyên liệu bên dưới:
                </p>

                {/* 1A. Select Milk Base */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 text-sm font-extrabold text-amber-300 mb-2">
                    <Droplets className="w-4 h-4" />
                    <span>1. Chọn loại Sữa nền (Cơ chất lên men):</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2.5">
                    {MILK_OPTIONS.map((milk) => {
                      const isSelected = milk.id === selectedMilkId;
                      return (
                        <button
                          key={milk.id}
                          type="button"
                          onClick={() => setSelectedMilkId(milk.id)}
                          className={`text-left p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-amber-400/15 border-amber-400 shadow-lg'
                              : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="font-extrabold text-base text-white flex items-center gap-2">
                              <span>{milk.name}</span>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-amber-300 font-semibold">
                                {milk.badge}
                              </span>
                            </div>
                            {isSelected && (
                              <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
                            )}
                          </div>
                          <p className="text-xs md:text-sm text-slate-300 mt-1">
                            {milk.description}
                          </p>
                          <div className="flex flex-wrap gap-3 mt-2 text-xs font-mono text-slate-400">
                            <span>Đường Lactose: {milk.lactosePercent}%</span>
                            <span>•</span>
                            <span>Đạm Protein: {milk.proteinPercent}%</span>
                            <span>•</span>
                            <span>Chất béo: {milk.fatPercent}%</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 1B. Select Lactic Acid Bacteria */}
                <div>
                  <div className="flex items-center gap-2 text-sm font-extrabold text-pink-400 mb-2">
                    <Microscope className="w-4 h-4" />
                    <span>2. Chọn chủng Vi khuẩn Lactic (Men cái):</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2.5">
                    {BACTERIA_OPTIONS.map((bac) => {
                      const isSelected = bac.id === selectedBacteriaId;
                      return (
                        <button
                          key={bac.id}
                          type="button"
                          onClick={() => setSelectedBacteriaId(bac.id)}
                          className={`text-left p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-pink-500/15 border-pink-400 shadow-lg'
                              : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <span className="font-extrabold text-base text-white">
                                {bac.name}
                              </span>
                              <span className="ml-2 italic text-xs text-pink-300">
                                ({bac.scientificName})
                              </span>
                            </div>
                            {isSelected && (
                              <CheckCircle2 className="w-5 h-5 text-pink-400 shrink-0" />
                            )}
                          </div>
                          <p className="text-xs md:text-sm text-slate-300 mt-1">
                            {bac.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleSelectStage(2)}
                className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 text-slate-950 font-extrabold text-base flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-all"
              >
                <span>Tiếp tục sang Bước 2: Quan sát Lên men Lactic</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {stage === 2 && (
            <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-4 md:p-5 shadow-xl flex-1 flex flex-col justify-between gap-4">
              <div className="space-y-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/15 border border-pink-400/30 text-pink-300 text-xs font-bold mb-2">
                    <span>BƯỚC 2 / 3 • QUÁ TRÌNH CHUYỂN HÓA SINH HÓA</span>
                  </div>
                  <h2 className="text-lg md:text-xl font-extrabold text-white">
                    Vi Khuẩn Chuyển Hóa Đường Lactose Thành Axit Lactic
                  </h2>
                </div>

                {/* Chemical Reaction Card */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-amber-300 mb-2">
                    Phương trình Lên men Lactic đồng hình:
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 font-mono text-sm md:text-base text-center text-white leading-relaxed">
                    <span className="text-amber-300 font-bold">
                      C₁₂H₂₂O₁₁ (Đường Lactose)
                    </span>{' '}
                    + H₂O{' '}
                    <span className="text-pink-400 font-bold">
                      —(Enzyme Lactase)→
                    </span>{' '}
                    <span className="text-lime-300 font-bold">
                      4 CH₃CH(OH)COOH (Axit Lactic)
                    </span>
                  </div>
                  <p className="text-xs md:text-sm text-slate-300 mt-2.5 leading-relaxed">
                    Vi khuẩn Lactic tiết ra enzyme <strong>Lactase (β-galactosidase)</strong> thủy
                    phân đường đôi Lactose thành đường đơn (Glucose &amp; Galactose), sau đó chuyển
                    hóa qua đường phân thành <strong>Axit Lactic</strong>.
                  </p>
                </div>

                {/* Symbiotic Interaction Explanation */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-3.5">
                    <div className="font-extrabold text-sm text-emerald-300 mb-1">
                      1. Liên cầu khuẩn (S. thermophilus)
                    </div>
                    <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                      Hình cầu xếp chuỗi (màu xanh ngọc). Sinh trưởng mạnh ở giai đoạn đầu (pH 6.6 →
                      5.2), tạo môi trường axit nhẹ và giải phóng axit formic kích thích trực khuẩn.
                    </p>
                  </div>

                  <div className="bg-pink-950/30 border border-pink-500/30 rounded-xl p-3.5">
                    <div className="font-extrabold text-sm text-pink-300 mb-1">
                      2. Trực khuẩn (L. bulgaricus)
                    </div>
                    <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                      Hình que dài (màu hồng tím). Chịu axit rất tốt, tiếp tục hạ pH xuống 4.5 và
                      cắt nhỏ chuỗi peptit tạo hương thơm đặc trưng cho sữa chua.
                    </p>
                  </div>
                </div>

                {/* Educational Observation Tip */}
                <div className="bg-amber-500/10 border border-amber-400/30 rounded-xl p-3.5 text-xs md:text-sm text-amber-100 leading-relaxed">
                  <strong className="text-amber-300 flex items-center gap-1.5 mb-1">
                    <BookOpen className="w-4 h-4" />
                    Quan sát trên màn hình Vi mô 3D:
                  </strong>
                  Khi bạn kéo thanh trượt <strong>Thời gian ủ</strong> tăng lên, các phân tử{' '}
                  <span className="text-amber-300 font-bold">Đường Lactose (vàng)</span> giảm dần và
                  các hạt <span className="text-lime-300 font-bold">Axit Lactic + Ion H⁺ (xanh lá)</span>{' '}
                  xuất hiện ngày càng dày đặc, kéo kim đồng hồ pH dịch chuyển về mốc <strong>4.6</strong>!
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleSelectStage(3)}
                className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 text-slate-950 font-extrabold text-base flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-all"
              >
                <span>Sang Bước 3: Cơ chế Đông tụ Protein thành Gel 3D</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {stage === 3 && (
            <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-4 md:p-5 shadow-xl flex-1 flex flex-col justify-between gap-4">
              <div className="space-y-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-400/15 border border-cyan-400/30 text-cyan-300 text-xs font-bold mb-2">
                    <span>BƯỚC 3 / 3 • BIẾN ĐỔI CẤU TRÚC VẬT LÝ (LỎNG → GEL 3D)</span>
                  </div>
                  <h2 className="text-lg md:text-xl font-extrabold text-white">
                    Đông Tụ Micelle Casein &amp; Tạo Mạng Lưới Gel 3D
                  </h2>
                </div>

                {/* 3 Phase Cards of Casein Coagulation */}
                <div className="space-y-2.5">
                  <div
                    className={`p-3.5 rounded-xl border transition-all ${
                      metrics.pH > 5.6
                        ? 'bg-sky-500/20 border-sky-400 shadow-md'
                        : 'bg-slate-950/70 border-slate-800 opacity-80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm md:text-base text-sky-300">
                        Giai đoạn A: Sữa lỏng ban đầu (pH ≈ 6.6)
                      </span>
                      {metrics.pH > 5.6 && (
                        <span className="text-xs px-2 py-0.5 rounded bg-sky-400 text-slate-950 font-bold">
                          Đang ở giai đoạn này
                        </span>
                      )}
                    </div>
                    <p className="text-xs md:text-sm text-slate-300 mt-1 leading-relaxed">
                      Bề mặt các hạt <strong>Micelle Casein</strong> được bao phủ bởi lớp lông{' '}
                      <em>κ-casein</em> mang <strong>điện tích âm (-)</strong>. Cùng dấu nên chúng
                      đẩy nhau tĩnh điện, giúp sữa ở trạng thái lỏng.
                    </p>
                  </div>

                  <div
                    className={`p-3.5 rounded-xl border transition-all ${
                      metrics.pH <= 5.6 && metrics.pH > 4.75
                        ? 'bg-amber-500/20 border-amber-400 shadow-md'
                        : 'bg-slate-950/70 border-slate-800 opacity-80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm md:text-base text-amber-300">
                        Giai đoạn B: Trung hòa điện tích (pH 5.5 → 4.8)
                      </span>
                      {metrics.pH <= 5.6 && metrics.pH > 4.75 && (
                        <span className="text-xs px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-bold">
                          Đang ở giai đoạn này
                        </span>
                      )}
                    </div>
                    <p className="text-xs md:text-sm text-slate-300 mt-1 leading-relaxed">
                      Ion <strong>H⁺</strong> từ Axit Lactic trung hòa dần điện tích âm trên bề mặt
                      Casein. Lớp vỏ ưa nước xẹp xuống, lực đẩy giảm, các hạt Protein bắt đầu xích
                      lại gần nhau.
                    </p>
                  </div>

                  <div
                    className={`p-3.5 rounded-xl border transition-all ${
                      metrics.pH <= 4.75
                        ? 'bg-emerald-500/20 border-emerald-400 shadow-md'
                        : 'bg-slate-950/70 border-slate-800 opacity-80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm md:text-base text-emerald-300">
                        Giai đoạn C: Điểm đẳng điện pI ≈ 4.6 — Khóa mạng Gel 3D!
                      </span>
                      {metrics.pH <= 4.75 && (
                        <span className="text-xs px-2 py-0.5 rounded bg-emerald-400 text-slate-950 font-bold">
                          Đã tạo mạng Gel 3D!
                        </span>
                      )}
                    </div>
                    <p className="text-xs md:text-sm text-slate-300 mt-1 leading-relaxed">
                      Tại <strong>pH ≈ 4.6</strong>, tổng điện tích ròng của Casein bằng <strong>0</strong>.
                      Chúng liên kết với nhau qua cầu nối kỵ nước tạo thành <strong>khung mạng lưới Gel 3D</strong>{' '}
                      giam giữ các phân tử nước và giọt chất béo bên trong — tạo nên sữa chua đặc mịn!
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={() => handleSelectStage(1)}
                  className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm cursor-pointer transition-all"
                >
                  Đổi nguyên liệu (Bước 1)
                </button>
                <button
                  type="button"
                  onClick={() => setShowQuizModal(true)}
                  className="flex-1 py-3 px-4 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg"
                >
                  <Award className="w-4 h-4" />
                  <span>Kiểm tra kiến thức (3 câu hỏi)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Classroom Review Quiz Modal */}
      {showQuizModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <Award className="w-7 h-7 text-amber-400" />
                <div>
                  <h2 className="text-xl font-extrabold text-white">
                    Câu Hỏi Củng Cố Bài Học (Sinh Học 10)
                  </h2>
                  <p className="text-xs text-slate-400">
                    Ứng dụng Lên men Lactic trong chế biến thực phẩm
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowQuizModal(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-bold cursor-pointer"
              >
                Đóng
              </button>
            </div>

            <div className="space-y-5 max-h-[65vh] overflow-y-auto pr-1">
              {quizQuestions.map((item, qIdx) => {
                const userChoice = selectedQuizAnswers[qIdx];
                const isAnswered = userChoice !== undefined;
                return (
                  <div
                    key={qIdx}
                    className="bg-slate-950/80 border border-slate-800 rounded-xl p-4"
                  >
                    <p className="font-bold text-base text-white mb-3">{item.q}</p>
                    <div className="space-y-2">
                      {item.options.map((opt, oIdx) => {
                        const isSelected = userChoice === oIdx;
                        const isCorrect = item.correct === oIdx;
                        let btnStyle =
                          'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-200';
                        if (isAnswered) {
                          if (isCorrect) {
                            btnStyle =
                              'bg-emerald-500/20 border-emerald-400 text-emerald-200 font-bold';
                          } else if (isSelected) {
                            btnStyle = 'bg-rose-500/20 border-rose-400 text-rose-200';
                          }
                        }
                        return (
                          <button
                            key={oIdx}
                            type="button"
                            onClick={() =>
                              setSelectedQuizAnswers((prev) => ({ ...prev, [qIdx]: oIdx }))
                            }
                            className={`w-full text-left px-3.5 py-2.5 rounded-xl border text-sm transition-all cursor-pointer ${btnStyle}`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                    {isAnswered && (
                      <div className="mt-3 p-3 rounded-lg bg-slate-900 border border-slate-700 text-xs md:text-sm text-amber-200">
                        <strong>Giải thích khoa học: </strong>
                        {item.explain}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default App;
