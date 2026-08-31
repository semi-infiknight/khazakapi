import { KZ_ARCH_TILES } from "../data/kzArchTiles.js";
import {
  buildArchWallRows,
  buildTrackLoop,
  KZ_ARCH_ROW_COUNT,
  KZ_WALL_ROW_CONFIG,
} from "../lib/kzArchWall.js";

export default function KhazakArchWallRows() {
  const rows = buildArchWallRows(KZ_ARCH_TILES, KZ_ARCH_ROW_COUNT);

  return (
    <div className="kz-af-wall-rows">
      {rows.map((rowTiles, index) => {
        const cfg = KZ_WALL_ROW_CONFIG[index];
        const loop = buildTrackLoop(rowTiles);

        return (
          <div key={index} className="kz-af-wall-row" data-row={index}>
            <div
              className={`kz-af-wall-track ${cfg.reverse ? "kz-af-wall-track-rev" : ""}`.trim()}
              style={{ animationDuration: `${cfg.duration}s` }}
            >
              {loop.map((tile, tileIndex) => (
                <span
                  key={`${tile.slug}-${tileIndex}`}
                  className="kz-af-tile"
                  data-slug={tile.slug}
                  title={tile.vendor}
                >
                  <img src={tile.src} alt="" width={24} height={24} loading="lazy" decoding="async" />
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
