/** Shared logo-wall row config for hero arch + catalogue strip */

export const KZ_WALL_ROW_CONFIG = [
  { duration: 70, reverse: false },
  { duration: 84, reverse: true },
  { duration: 98, reverse: false },
];

export function buildArchWallRows(tiles, rowCount = KZ_WALL_ROW_CONFIG.length) {
  const rows = Array.from({ length: rowCount }, () => []);
  tiles.forEach((tile, index) => {
    rows[index % rowCount].push(tile);
  });
  return rows;
}

export function rowIndexForSlug(tiles, slug, rowCount = KZ_WALL_ROW_CONFIG.length) {
  const index = tiles.findIndex((tile) => tile.slug === slug);
  return index >= 0 ? index % rowCount : 0;
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
  const anchorX = rowRect.left + rowRect.width * alignRatio;
  const candidates = [...track.querySelectorAll(`.kz-af-tile[data-slug="${CSS.escape(slug)}"]`)];
  if (!candidates.length) return null;

  let best = null;
  let bestScore = Infinity;
  for (const tile of candidates) {
    const rect = tile.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const edgePenalty = cx < rowRect.left - 8 || cx > rowRect.right + 8 ? 240 : 0;
    const score = Math.abs(cx - anchorX) + edgePenalty;
    if (score < bestScore) {
      bestScore = score;
      best = tile;
    }
  }

  if (!best) return null;

  const tx = readTrackTranslateX(track);
  const bestRect = best.getBoundingClientRect();
  const tileCx = bestRect.left + bestRect.width / 2;
  track.style.transform = `translateX(${tx + (anchorX - tileCx)}px)`;
  return best;
}
