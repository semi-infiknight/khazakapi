#!/usr/bin/env node
/** Regenerate src/lib/khanShatyrStrokes.json from public/khan-shatyr.svg */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const svg = readFileSync(join(root, "public/khan-shatyr.svg"), "utf8");
const paths = [...svg.matchAll(/<path d="([^"]+)" fill="([^"]+)"/g)].map((m, idx) => ({
  idx,
  d: m[1],
  fill: m[2],
}));

const APEX = { x: 279, y: 12 };
const MEMBRANE = new Set([
  "#ACA1FB", "#9C88FA", "#936CFC", "#7D57F9", "#7BBEF5", "#3A87FA", "#5177EE",
  "#B960E8", "#DB63E2", "#E588F3", "#F96CD4", "#9D4EE3", "#7D3DE9", "#6A30DE",
  "#BF77F5", "#F7F2F7", "#F1DBF1", "#0B0411", "#0D012D", "#1F0749", "#41414D",
  "#596060", "#352C59", "#702DC5", "#2A0D2E", "#4149A5", "#3F5BCB",
]);

function samplePath(d, n = 40) {
  const nums = d.match(/[-+]?(?:\d*\.\d+|\d+)(?:[eE][-+]?\d+)?/g)?.map(Number) ?? [];
  const pts = [];
  for (let i = 0; i + 1 < nums.length; i += 2) pts.push([nums[i], nums[i + 1]]);
  if (pts.length < 2) return [];
  const segs = [];
  let total = 0;
  for (let i = 0; i < pts.length - 1; i += 1) {
    const ln = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]);
    segs.push([total, total + ln, pts[i], pts[i + 1]]);
    total += ln;
  }
  const out = [];
  for (let k = 0; k < n; k += 1) {
    const t = (k / (n - 1)) * total;
    for (const [a, b, p0, p1] of segs) {
      if (t <= b) {
        const u = b > a ? (t - a) / (b - a) : 0;
        out.push([p0[0] + (p1[0] - p0[0]) * u, p0[1] + (p1[1] - p0[1]) * u]);
        break;
      }
    }
  }
  return out;
}

function dist(a, b) {
  return Math.hypot(a[0] - b[0], a[1] - b[1]);
}

const radial = [];
for (const path of paths) {
  if (!MEMBRANE.has(path.fill)) continue;
  const pts = samplePath(path.d);
  if (pts.length < 4) continue;
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const x0 = Math.min(...xs);
  const x1 = Math.max(...xs);
  const y0 = Math.min(...ys);
  const y1 = Math.max(...ys);
  if (x1 < 160 || y1 > 244 || y0 < 8) continue;
  const length = pts.slice(0, -1).reduce((sum, p, i) => sum + dist(p, pts[i + 1]), 0);
  if (length < 14) continue;
  const w = x1 - x0;
  const h = y1 - y0;
  if (w * h > 1200 && Math.min(w, h) > 10) continue;
  const basePt = pts.reduce((a, b) => (a[1] > b[1] ? a : b));
  const topPt = pts.reduce((a, b) => (a[1] < b[1] ? a : b));
  const rise = basePt[1] - topPt[1];
  if (rise < 10 || basePt[1] < 125) continue;
  if (dist(topPt, APEX) >= dist(basePt, APEX) * 0.95) continue;
  const p0 = pts[0];
  const p1 = pts[pts.length - 1];
  radial.push({
    idx: path.idx,
    fill: path.fill,
    d: path.d,
    length: Math.round(length * 10) / 10,
    rise: Math.round(rise * 10) / 10,
    reverse: p0[1] < p1[1],
    baseY: Math.round(basePt[1] * 10) / 10,
    topY: Math.round(topPt[1] * 10) / 10,
    midX: Math.round(((x0 + x1) / 2) * 10) / 10,
    kind: "radial",
  });
}

radial.sort((a, b) => b.rise - a.rise || b.length - a.length);
const buckets = new Map();
for (const stroke of radial) {
  const key = Math.floor(stroke.midX / 16);
  if (!buckets.has(key)) buckets.set(key, []);
  buckets.get(key).push(stroke);
}

const picked = [];
const seen = new Set();
for (const key of [...buckets.keys()].sort((a, b) => a - b)) {
  for (const stroke of buckets.get(key).sort((a, b) => b.rise - a.rise).slice(0, 2)) {
    if (seen.has(stroke.idx)) continue;
    seen.add(stroke.idx);
    picked.push(stroke);
  }
}

for (const stroke of radial) {
  if (picked.length >= 50) break;
  if (seen.has(stroke.idx)) continue;
  seen.add(stroke.idx);
  picked.push(stroke);
}

writeFileSync(
  join(root, "src/lib/khanShatyrStrokes.json"),
  `${JSON.stringify(picked, null, 2)}\n`,
);
console.log(`Wrote ${picked.length} stroke paths`);
