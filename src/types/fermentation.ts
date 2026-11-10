export type MilkType = 'fresh_milk' | 'condensed_milk' | 'skim_milk';
export type BacteriaType = 'symbiotic' | 'lactobacillus' | 'streptococcus';
export type StageId = 1 | 2 | 3;
export type ViewMode = 'dual' | 'macro' | 'micro';

export interface MilkOption {
  id: MilkType;
  name: string;
  subtitle: string;
  lactosePercent: number;
  proteinPercent: number;
  fatPercent: number;
  colorHex: string;
  yogurtColorHex: string;
  description: string;
  badge: string;
  gelStrengthMultiplier: number;
  fermentationRateMultiplier: number;
}

export interface BacteriaOption {
  id: BacteriaType;
  name: string;
  scientificName: string;
  shapeLabel: string;
  optimalTempRange: [number, number];
  minPH: number;
  rateMultiplier: number;
  description: string;
  badge: string;
  rodRatio: number; // 0 = all cocci, 1 = all rods, 0.5 = both
}

export interface SimulationMetrics {
  pH: number;
  lacticAcidPercent: number; // 0.15% initial -> up to ~1.1%
  lactoseRemainingPercent: number;
  gelProgress: number; // 0 (liquid milk) to 1 (solid 3D gel matrix)
  bacteriaActivity: number; // 0 (inactive/dead) to 1 (peak activity)
  tempStatus: 'cold' | 'suboptimal' | 'optimal' | 'hot' | 'denatured';
  tempStatusLabel: string;
  tempStatusExplanation: string;
  caseinChargeState: 'negative_repel' | 'neutralizing' | 'isoelectric_gel' | 'syneresis';
  caseinChargeLabel: string;
  textureLabel: string;
}

export const MILK_OPTIONS: MilkOption[] = [
  {
    id: 'fresh_milk',
    name: 'Sữa tươi tiệt trùng',
    subtitle: 'Cân bằng tự nhiên (Chuẩn phòng thí nghiệm)',
    lactosePercent: 4.8,
    proteinPercent: 3.3,
    fatPercent: 3.6,
    colorHex: '#fffdf7',
    yogurtColorHex: '#faf5e8',
    description:
      'Chứa các hạt Micelle Casein tự nhiên và đường Lactose vừa đủ. Tạo cấu trúc gel sữa chua mịn màng, sánh dẻo chuẩn xác nhất.',
    badge: 'Khuyên dùng',
    gelStrengthMultiplier: 1.0,
    fermentationRateMultiplier: 1.0,
  },
  {
    id: 'condensed_milk',
    name: 'Sữa đặc pha nước ấm',
    subtitle: 'Truyền thống Việt Nam (Giàu chất khô & đường)',
    lactosePercent: 5.6,
    proteinPercent: 3.5,
    fatPercent: 4.2,
    colorHex: '#fdf4dc',
    yogurtColorHex: '#f8e9c4',
    description:
      'Màu trắng ngà ấm, hàm lượng đường và chất khô cao giúp vi khuẩn có nguồn năng lượng dồi dào, sữa chua có vị ngọt dịu và béo ngậy.',
    badge: 'Truyền thống',
    gelStrengthMultiplier: 1.08,
    fermentationRateMultiplier: 1.12,
  },
  {
    id: 'skim_milk',
    name: 'Sữa tách béo giàu đạm',
    subtitle: 'Tập trung quan sát mạng lưới Protein Casein',
    lactosePercent: 5.0,
    proteinPercent: 4.2,
    fatPercent: 0.5,
    colorHex: '#f4f8ff',
    yogurtColorHex: '#eef3fc',
    description:
      'Hầu như không có giọt chất béo (Lipid), mật độ hạt Protein Casein cao giúp mạng lưới liên kết 3D hình thành rất rõ nét và săn chắc.',
    badge: 'Giàu Protein',
    gelStrengthMultiplier: 1.18,
    fermentationRateMultiplier: 0.95,
  },
];

export const BACTERIA_OPTIONS: BacteriaOption[] = [
  {
    id: 'symbiotic',
    name: 'Tổ hợp Cộng sinh Chuẩn',
    scientificName: 'S. thermophilus + L. bulgaricus',
    shapeLabel: 'Cầu khuẩn chuỗi & Trực khuẩn que',
    optimalTempRange: [40, 45],
    minPH: 4.2,
    rateMultiplier: 1.25,
    description:
      'Hai loài hỗ trợ lẫn nhau (cộng sinh): Cầu khuẩn phát triển nhanh tạo môi trường axit nhẹ ban đầu, kích thích Trực khuẩn tạo hương thơm và đông tụ gel hoàn hảo.',
    badge: 'Hiệu suất cao nhất',
    rodRatio: 0.5,
  },
  {
    id: 'lactobacillus',
    name: 'Trực khuẩn Lactic',
    scientificName: 'Lactobacillus delbrueckii subsp. bulgaricus',
    shapeLabel: 'Hình que dài (Bacilli)',
    optimalTempRange: [42, 46],
    minPH: 3.9,
    rateMultiplier: 0.9,
    description:
      'Vi khuẩn hình que, chịu được môi trường axit mạnh. Chuyển hóa Lactose bền bỉ ở giai đoạn sau, giúp sữa chua đông đặc sâu và có vị chua đậm.',
    badge: 'Chịu axit cao',
    rodRatio: 0.9,
  },
  {
    id: 'streptococcus',
    name: 'Liên cầu khuẩn Lactic',
    scientificName: 'Streptococcus thermophilus',
    shapeLabel: 'Hình cầu xếp chuỗi (Cocci)',
    optimalTempRange: [38, 43],
    minPH: 4.65,
    rateMultiplier: 0.85,
    description:
      'Vi khuẩn hình cầu nối thành chuỗi như chuỗi hạt. Sinh sản nhanh ở giai đoạn đầu nhưng bị ức chế sớm khi pH xuống gần 4.6, tạo gel mềm dịu.',
    badge: 'Khởi phát nhanh',
    rodRatio: 0.1,
  },
];

export function computeSimulationMetrics(
  milk: MilkOption,
  bacteria: BacteriaOption,
  timeHours: number,
  temperatureC: number
): SimulationMetrics {
  // 1. Calculate temperature activity curve (0 to 1)
  let bacteriaActivity = 0;
  let tempStatus: SimulationMetrics['tempStatus'] = 'optimal';
  let tempStatusLabel = 'Nhiệt độ tối ưu (40°C – 45°C)';
  let tempStatusExplanation =
    'Enzyme Lactase hoạt động mạnh nhất, vi khuẩn Lactic sinh trưởng và phân giải Lactose với tốc độ tối đa.';

  if (temperatureC < 28) {
    // Cold / dormant
    bacteriaActivity = Math.max(0.04, ((temperatureC - 15) / 13) * 0.2);
    tempStatus = 'cold';
    tempStatusLabel = 'Quá lạnh (< 28°C) — Vi khuẩn ngủ nghỉ';
    tempStatusExplanation =
      'Nhiệt độ thấp làm chậm chuyển động phân tử và bất hoạt tạm thời enzyme. Quá trình lên men diễn ra cực kỳ chậm.';
  } else if (temperatureC < 38) {
    // Suboptimal warm
    bacteriaActivity = 0.2 + ((temperatureC - 28) / 10) * 0.65;
    tempStatus = 'suboptimal';
    tempStatusLabel = 'Ấm nhẹ (28°C – 37°C) — Lên men chậm';
    tempStatusExplanation =
      'Vi khuẩn đã hoạt động nhưng chưa đạt đỉnh sinh trưởng. Cần thời gian ủ lâu hơn để sữa đông tụ.';
  } else if (temperatureC <= 46) {
    // Optimal zone (38 - 46°C, peak at 42-43°C)
    const distFrom42 = Math.abs(temperatureC - 42.5);
    bacteriaActivity = Math.min(1.0, 1.0 - distFrom42 * 0.025);
    tempStatus = 'optimal';
    tempStatusLabel = 'Nhiệt độ Vàng (40°C – 45°C) — Tối ưu!';
    tempStatusExplanation =
      'Điều kiện lý tưởng cho hệ vi khuẩn Lactic cộng sinh chuyển hóa đường Lactose thành Axit Lactic nhanh và mịn nhất.';
  } else if (temperatureC <= 53) {
    // Too hot - heat stress
    bacteriaActivity = Math.max(0.15, 0.85 - ((temperatureC - 46) / 7) * 0.7);
    tempStatus = 'hot';
    tempStatusLabel = 'Quá nóng (47°C – 53°C) — Ức chế nhiệt';
    tempStatusExplanation =
      'Nhiệt độ cao gây sốc nhiệt cho vi khuẩn và dễ làm mạng lưới protein co rút mạnh, gây hiện tượng tách nước (vữa sữa).';
  } else {
    // Denatured / killed (> 53°C)
    bacteriaActivity = 0.02;
    tempStatus = 'denatured';
    tempStatusLabel = 'Nguy hiểm (> 54°C) — Chết men!';
    tempStatusExplanation =
      'Nhiệt độ quá cao làm biến tính hoàn toàn Enzyme và tiêu diệt vi khuẩn Lactic. Sữa không thể lên men thành sữa chua.';
  }

  // 2. Calculate fermentation progress based on time, activity, milk & bacteria
  const effectiveHours =
    timeHours *
    bacteriaActivity *
    milk.fermentationRateMultiplier *
    bacteria.rateMultiplier;

  // Logistic / exponential decay of pH from 6.65 down towards bacteria.minPH
  const initialPH = 6.65;
  const targetMinPH = bacteria.minPH;
  // Standard yogurt reaches pH ~4.5 around 6-8 hours at 42°C
  const progressFactor = 1 - Math.exp(-0.26 * effectiveHours);
  const rawPH = initialPH - (initialPH - targetMinPH) * progressFactor;
  const pH = Number(Math.max(targetMinPH, Math.min(initialPH, rawPH)).toFixed(2));

  // 3. Lactic acid % (starts ~0.15%, reaches ~0.95% - 1.15% at pH 4.2)
  const pHDropNormalized = (initialPH - pH) / (initialPH - 4.0);
  const lacticAcidPercent = Number((0.15 + pHDropNormalized * 0.95).toFixed(2));

  // 4. Lactose remaining (roughly 25-35% of lactose is converted during fermentation)
  const lactoseConsumed = pHDropNormalized * 1.65;
  const lactoseRemainingPercent = Number(
    Math.max(2.5, milk.lactosePercent - lactoseConsumed).toFixed(2)
  );

  // 5. Gel matrix formation (Casein aggregation starts around pH 5.3 and locks around pH 4.6)
  // Smooth sigmoid centered at pH 5.05
  let rawGel = 0;
  if (pH < 6.4) {
    const x = (5.15 - pH) * 3.2;
    rawGel = 1 / (1 + Math.exp(-x));
  }
  const gelProgress = Number(
    Math.min(1, Math.max(0, rawGel * milk.gelStrengthMultiplier)).toFixed(3)
  );

  // 6. Casein charge state & educational labels
  let caseinChargeState: SimulationMetrics['caseinChargeState'] = 'negative_repel';
  let caseinChargeLabel = 'Tích điện âm (-) • Đẩy nhau tự do';
  let textureLabel = 'Sữa lỏng (Liquid Milk)';

  if (pH > 5.6) {
    caseinChargeState = 'negative_repel';
    caseinChargeLabel = 'pH > 5.6: Micelle Casein tích điện âm (-), đẩy nhau tĩnh điện';
    textureLabel = 'Chất lỏng sánh nhẹ — Các hạt Protein chuyển động tự do';
  } else if (pH > 4.75) {
    caseinChargeState = 'neutralizing';
    caseinChargeLabel = 'pH 4.8 – 5.5: Ion H⁺ trung hòa điện tích âm, bắt đầu kết cụm';
    textureLabel = 'Sữa sánh đặc dần — Khởi tạo chuỗi liên kết Protein';
  } else if (pH >= 4.15 && temperatureC <= 50) {
    caseinChargeState = 'isoelectric_gel';
    caseinChargeLabel = 'Đạt điểm đẳng điện (pH ≈ 4.6): Mạng lưới Gel 3D hoàn chỉnh!';
    textureLabel = 'Sữa chua đông đặc mịn màng (3D Protein Gel Matrix)';
  } else {
    caseinChargeState = 'syneresis';
    caseinChargeLabel = 'pH quá thấp / Nhiệt cao: Mạng Gel co rút mạnh (Tách huyết thanh)';
    textureLabel = 'Đông đặc gắt — Có hiện tượng tách nước vàng (Whey)';
  }

  return {
    pH,
    lacticAcidPercent,
    lactoseRemainingPercent,
    gelProgress,
    bacteriaActivity: Number(bacteriaActivity.toFixed(2)),
    tempStatus,
    tempStatusLabel,
    tempStatusExplanation,
    caseinChargeState,
    caseinChargeLabel,
    textureLabel,
  };
}
