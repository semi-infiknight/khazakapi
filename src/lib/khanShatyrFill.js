/** Estimated mesh strokes for sparse zones (broken / stylized SVG lattice) */

export const APEX = { x: 279, y: 12 };

const FILL_COLORS = [
  "#9C88FA",
  "#7D57F9",
  "#B960E8",
  "#7BBEF5",
  "#DB63E2",
  "#936CFC",
  "#E588F3",
  "#ACA1FB",
];

const CELL_W = 20;
const CELL_H = 17;
const ORIGIN_X = 160;
const ORIGIN_Y = 80;

/** Base ring along the tent footprint (t: 0 left → 1 right) */
export function basePoint(t) {
  const x = 168 + t * 228;
  const arch = Math.sin(t * Math.PI);
  const y = 251 - arch * 14 - (t < 0.35 ? (0.35 - t) * 18 : 0);
  return { x, y };
}

/** Point on a radial at normalized height (0 = apex, 1 = base) */
export function radialPoint(t, height) {
  const base = basePoint(t);
  const curve = Math.sin(height * Math.PI) * 5.5;
  return {
    x: APEX.x + (base.x - APEX.x) * height + curve * (t - 0.5) * 0.38,
    y: APEX.y + (base.y - APEX.y) * height - curve * 0.22,
  };
}

function sampleMidpoint(d) {
  const nums = d.match(/[-+]?(?:\d*\.\d+|\d+)(?:[eE][-+]?\d+)?/g)?.map(Number) ?? [];
  if (nums.length < 4) return { x: 240, y: 180 };
  const xs = [];
  const ys = [];
  for (let i = 0; i + 1 < nums.length; i += 2) {
    xs.push(nums[i]);
    ys.push(nums[i + 1]);
  }
  return { x: xs.reduce((a, b) => a + b, 0) / xs.length, y: ys.reduce((a, b) => a + b, 0) / ys.length };
}

function pathLength(d) {
  const nums = d.match(/[-+]?(?:\d*\.\d+|\d+)(?:[eE][-+]?\d+)?/g)?.map(Number) ?? [];
  let len = 0;
  for (let i = 2; i + 1 < nums.length; i += 2) {
    len += Math.hypot(nums[i] - nums[i - 2], nums[i + 1] - nums[i - 1]);
  }
  return len || 30;
}

function cellKey(x, y) {
  const cx = Math.min(11, Math.max(0, Math.floor((x - ORIGIN_X) / CELL_W)));
  const cy = Math.min(9, Math.max(0, Math.floor((y - ORIGIN_Y) / CELL_H)));
  return `${cx}:${cy}`;
}

function buildDensityMap(strokes) {
  const counts = new Map();
  for (const stroke of strokes) {
    const mid = sampleMidpoint(stroke.d);
    if (mid.x < ORIGIN_X || mid.y > 252) continue;
    const key = cellKey(mid.x, mid.y);
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return counts;
}

/** Target streak count per cell — higher on the lower-left where mesh gaps are worst */
function targetForCell(cx, cy) {
  const x = ORIGIN_X + cx * CELL_W + CELL_W / 2;
  const y = ORIGIN_Y + cy * CELL_H + CELL_H / 2;
  let target = 1;
  if (x < 230 && y > 175) target = 3;
  if (x < 210 && y > 190) target = 4;
  if (x < 200 && y > 155 && y < 220) target = 3;
  if (y > 210) target += 1;
  if (x > 300) target = Math.max(1, target - 1);
  return target;
}

function curvedRadialD(t, segments = 4) {
  const pts = [];
  for (let i = 0; i <= segments; i += 1) {
    const h = 1 - i / segments;
    const p = radialPoint(t, h);
    pts.push(`${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`);
  }
  return pts.join(" ");
}

function makeStroke(id, d, fill, kind = "estimated") {
  const nums = d.match(/[-+]?(?:\d*\.\d+|\d+)(?:[eE][-+]?\d+)?/g)?.map(Number) ?? [];
  const ys = nums.filter((_, i) => i % 2 === 1);
  const baseY = Math.max(...ys);
  const topY = Math.min(...ys);
  return {
    idx: id,
    fill,
    d,
    length: Math.round(pathLength(d) * 10) / 10,
    rise: Math.round((baseY - topY) * 10) / 10,
    reverse: false,
    baseY: Math.round(baseY * 10) / 10,
    topY: Math.round(topY * 10) / 10,
    kind,
  };
}

/**
 * Synthesise extra streak routes only where real vector strokes are sparse.
 * Keeps dense/right-side areas untouched.
 */
export function buildFillStrokes(existingStrokes) {
  const density = buildDensityMap(existingStrokes);
  const fills = [];
  let colorIdx = 0;
  const nextColor = () => {
    const c = FILL_COLORS[colorIdx % FILL_COLORS.length];
    colorIdx += 1;
    return c;
  };

  const RING_HEIGHTS = [0.32, 0.44, 0.56, 0.68, 0.8, 0.9];
  const RADIAL_COUNT = 32;

  // Radial estimates — only where cell is under target
  for (let i = 0; i < RADIAL_COUNT; i += 1) {
    const t = i / (RADIAL_COUNT - 1);
    const mid = radialPoint(t, 0.58);
    const key = cellKey(mid.x, mid.y);
    const have = density.get(key) || 0;
    const [cx, cy] = key.split(":").map(Number);
    if (have >= targetForCell(cx, cy)) continue;

    const d = curvedRadialD(t);
    fills.push(makeStroke(`fill-r-${i}`, d, nextColor()));
    density.set(key, have + 1);
  }

  // Ring segments on the lower-left / mid mesh
  for (const height of RING_HEIGHTS) {
    for (let i = 0; i < RADIAL_COUNT - 1; i += 1) {
      const t0 = i / (RADIAL_COUNT - 1);
      const t1 = (i + 1) / (RADIAL_COUNT - 1);
      if (t1 > 0.72) continue;
      const p0 = radialPoint(t0, height);
      const p1 = radialPoint(t1, height);
      const mid = { x: (p0.x + p1.x) / 2, y: (p0.y + p1.y) / 2 };
      const key = cellKey(mid.x, mid.y);
      const have = density.get(key) || 0;
      const [cx, cy] = key.split(":").map(Number);
      const target = targetForCell(cx, cy);
      if (have >= target) continue;
      if (mid.x > 290 && have >= 1) continue;

      const d = `M ${p0.x.toFixed(1)} ${p0.y.toFixed(1)} L ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`;
      fills.push(makeStroke(`fill-ring-${height}-${i}`, d, nextColor()));
      density.set(key, have + 1);
    }
  }

  // Diagonal hops (ring → up) common in broken mesh zones
  for (let i = 0; i < 18; i += 1) {
    const t = 0.04 + (i / 17) * 0.48;
    const h = 0.52 + (i % 4) * 0.1;
    const start = radialPoint(t, h);
    const end = radialPoint(t + 0.06, Math.max(0.12, h - 0.22));
    const mid = { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 };
    const key = cellKey(mid.x, mid.y);
    const have = density.get(key) || 0;
    const [cx, cy] = key.split(":").map(Number);
    if (have >= targetForCell(cx, cy)) continue;

    const d = `M ${start.x.toFixed(1)} ${start.y.toFixed(1)} L ${end.x.toFixed(1)} ${end.y.toFixed(1)}`;
    fills.push(makeStroke(`fill-hop-${i}`, d, nextColor()));
    density.set(key, have + 1);
  }

  return fills;
}
