/** Shared logo-wall row config for hero arch animation */

export const KZ_ARCH_ROW_COUNT = 5;

export const KZ_WALL_ROW_CONFIG = [
  { duration: 64, reverse: false },
  { duration: 78, reverse: true },
  { duration: 92, reverse: false },
  { duration: 86, reverse: true },
  { duration: 72, reverse: false },
];

export const SAFE_ALIGN_MIN = 0.32;
export const SAFE_ALIGN_MAX = 0.68;

function vendorKey(slug) {
  if (slug.startsWith("yandex-")) return "yandex";
  if (slug.startsWith("halyk-")) return "halyk";
  if (slug.startsWith("beeline-")) return "beeline";
  return slug.split("-")[0];
}

/** Spread same-vendor logos so scrolling tracks do not cluster duplicates. */
export function interleaveTilesByVendor(tiles) {
  const groups = new Map();
  for (const tile of tiles) {
    const key = vendorKey(tile.slug);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(tile);
  }

  const buckets = [...groups.values()].sort((a, b) => b.length - a.length);
  const out = [];
  let round = 0;

  while (out.length < tiles.length) {
    let added = false;
    for (const bucket of buckets) {
      if (bucket.length > round) {
        out.push(bucket[round]);
        added = true;
      }
    }
    if (!added) break;
    round += 1;
  }

  return out;
}

function breaksAdjacent(row, index, key) {
  const prev = row[index - 1];
  const next = row[index + 1];
  if (prev && vendorKey(prev.slug) === key) return true;
  if (next && vendorKey(next.slug) === key) return true;
  return false;
}

function polishRowVendorRuns(rows) {
  for (const row of rows) {
    for (let i = 1; i < row.length; i += 1) {
      const leftKey = vendorKey(row[i - 1].slug);
      const rightKey = vendorKey(row[i].slug);
      if (leftKey !== rightKey) continue;

      let swapped = false;
      for (const other of rows) {
        if (other === row) continue;
        for (let j = 0; j < other.length; j += 1) {
          const candidate = other[j];
          const candidateKey = vendorKey(candidate.slug);
          if (candidateKey === leftKey || candidateKey === rightKey) continue;
          if (breaksAdjacent(row, i, candidateKey)) continue;
          if (breaksAdjacent(other, j, rightKey)) continue;

          const oldRight = row[i];
          row[i] = candidate;
          other[j] = oldRight;
          swapped = true;
          break;
        }
        if (swapped) break;
      }
    }

    if (row.length > 1 && vendorKey(row[0].slug) === vendorKey(row[row.length - 1].slug)) {
      for (let i = 1; i < row.length - 1; i += 1) {
        const midKey = vendorKey(row[i].slug);
        const seamKey = vendorKey(row[row.length - 1].slug);
        if (midKey === seamKey) continue;
        if (breaksAdjacent(row, i, seamKey)) continue;
        const swap = row[i];
        row[i] = row[row.length - 1];
        row[row.length - 1] = swap;
        break;
      }
    }
  }
}

export function buildArchWallRows(tiles, rowCount = KZ_ARCH_ROW_COUNT) {
  const interleaved = interleaveTilesByVendor(tiles);
  const rows = Array.from({ length: rowCount }, () => []);

  interleaved.forEach((tile, index) => {
    rows[index % rowCount].push(tile);
  });

  polishRowVendorRuns(rows);
  return rows;
}

/** Duplicate a row for seamless marquee scrolling (always an even repeat). */
export function buildTrackLoop(rowTiles, repeat = 2) {
  const copies = Math.max(2, repeat);
  return Array.from({ length: copies }, () => rowTiles).flat();
}

export function rowIndexForSlug(tiles, slug, rowCount = KZ_ARCH_ROW_COUNT) {
  const rows = buildArchWallRows(tiles, rowCount);
  const index = rows.findIndex((row) => row.some((tile) => tile.slug === slug));
  return index >= 0 ? index : 0;
}

export function clampAlignRatio(ratio) {
  return Math.min(SAFE_ALIGN_MAX, Math.max(SAFE_ALIGN_MIN, ratio));
}

function loopDistance(track) {
  return track.scrollWidth / 2;
}

function readTrackTranslateX(track) {
  const transform = getComputedStyle(track).transform;
  if (!transform || transform === "none") return 0;
  return new DOMMatrixReadOnly(transform).m41;
}

export function pauseRowTrack(track) {
  const anim = track.getAnimations()[0];
  anim?.pause();
  return anim ?? null;
}

export function resumeRowTrack(track, anim) {
  const reverse = track.classList.contains("kz-af-wall-track-rev");
  const tx = readTrackTranslateX(track);
  const loop = loopDistance(track);

  track.style.transform = "";
  track.classList.remove("kz-af-track-held");

  if (!anim) {
    track.style.animationPlayState = "";
    return;
  }

  const timing = anim.effect?.getTiming?.() ?? {};
  const duration = Number(timing.duration ?? parseFloat(getComputedStyle(track).animationDuration) * 1000);

  if (loop > 0 && Number.isFinite(duration) && duration > 0) {
    let progress = ((-tx % loop) + loop) % loop / loop;
    if (reverse) progress = 1 - progress;
    anim.currentTime = duration * progress;
  }

  anim.play();
}

export function alignTrackToSlug(rowEl, track, slug, alignRatio = 0.5) {
  if (!rowEl || !track) return null;

  pauseRowTrack(track);
  track.classList.add("kz-af-track-held");

  const rowRect = rowEl.getBoundingClientRect();
  const safeAlign = clampAlignRatio(alignRatio);
  const anchorX = rowRect.left + rowRect.width * safeAlign;
  const safeLeft = rowRect.left + rowRect.width * SAFE_ALIGN_MIN;
  const safeRight = rowRect.left + rowRect.width * SAFE_ALIGN_MAX;
  const candidates = [...track.querySelectorAll(`.kz-af-tile[data-slug="${CSS.escape(slug)}"]`)];
  if (!candidates.length) return null;

  let best = null;
  let bestScore = Infinity;
  for (const tile of candidates) {
    const rect = tile.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    if (cx < safeLeft - 4 || cx > safeRight + 4) continue;
    const score = Math.abs(cx - anchorX);
    if (score < bestScore) {
      bestScore = score;
      best = tile;
    }
  }

  if (!best) {
    for (const tile of candidates) {
      const rect = tile.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const score = Math.abs(cx - anchorX) + (cx < safeLeft || cx > safeRight ? 800 : 0);
      if (score < bestScore) {
        bestScore = score;
        best = tile;
      }
    }
  }

  if (!best) return null;

  const tx = readTrackTranslateX(track);
  const bestRect = best.getBoundingClientRect();
  const tileCx = bestRect.left + bestRect.width / 2;
  track.style.transform = `translateX(${tx + (anchorX - tileCx)}px)`;
  return best;
}
