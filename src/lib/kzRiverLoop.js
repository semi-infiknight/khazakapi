/** Seamless vertical river loop — mirrors buildTrackLoop in kzArchWall.js */

/** Page lines: 11px × 2.05 lh; section: 12px × 2.35 lh */
export const RIVER_LINE_HEIGHT = {
  page: 22.55,
  section: 28.2,
};

/** Pad each loop half past typical viewport / section height. */
export const RIVER_MIN_SEGMENT_PX = {
  page: 1080,
  section: 480,
};

/** Scroll speed tuned to legacy 52s cycle over ~722px track (half ≈ 361px). */
export const RIVER_PX_PER_SEC = 361 / 52;

/** Repeat log entries until one segment exceeds min height (even repeat for marquee). */
export function buildRiverSegment(logs, variant = "section", minPxOverride) {
  if (!logs.length) return [];

  const lineHeight = RIVER_LINE_HEIGHT[variant] ?? RIVER_LINE_HEIGHT.section;
  const minPx = minPxOverride ?? RIVER_MIN_SEGMENT_PX[variant] ?? RIVER_MIN_SEGMENT_PX.section;
  const minLines = Math.ceil(minPx / lineHeight);

  const segment = [];
  while (segment.length < minLines) {
    segment.push(...logs);
  }
  return segment;
}

export function riverAnimationDuration(segmentLineCount, variant = "section") {
  const lineHeight = RIVER_LINE_HEIGHT[variant] ?? RIVER_LINE_HEIGHT.section;
  const segmentPx = segmentLineCount * lineHeight;
  return Math.max(32, segmentPx / RIVER_PX_PER_SEC);
}
