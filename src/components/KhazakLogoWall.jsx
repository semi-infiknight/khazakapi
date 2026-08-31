import KhazakLogRiver from "./KhazakLogRiver.jsx";
import { KZ_ARCH_TILES } from "../data/kzArchTiles.js";
import { buildArchWallRows, KZ_ARCH_ROW_COUNT, KZ_WALL_ROW_CONFIG } from "../lib/kzArchWall.js";

function LogoTrack({ tiles, duration, reverse }) {
  const loop = [...tiles, ...tiles];

  return (
    <div className="kz-wall-row">
      <div
        className={`kz-wall-track ${reverse ? "kz-wall-track-rev" : ""}`.trim()}
        style={{ animationDuration: `${duration}s` }}
      >
        {loop.map((tile, index) => (
          <span key={`${tile.slug}-${index}`} className="kz-wall-tile" title={tile.vendor}>
            <img src={tile.src} alt="" width={26} height={26} loading="lazy" decoding="async" />
          </span>
        ))}
      </div>
    </div>
  );
}

export default function KhazakLogoWall({ catalogueTotal = KZ_ARCH_TILES.length }) {
  const rows = buildArchWallRows(KZ_ARCH_TILES, KZ_ARCH_ROW_COUNT);

  return (
    <section className="kz-wall" aria-label="Integrated Kazakhstan API providers">
      <KhazakLogRiver />

      <div className="kz-wall-rows" aria-hidden="true">
        {rows.map((rowTiles, index) => (
          <LogoTrack
            key={index}
            tiles={rowTiles}
            duration={KZ_WALL_ROW_CONFIG[index].duration}
            reverse={KZ_WALL_ROW_CONFIG[index].reverse}
          />
        ))}
      </div>

      <div className="kz-wall-caption">
        <p className="kz-wall-big">{catalogueTotal} Kazakhstan APIs in the catalogue.</p>
        <span className="kz-wall-small">
          Every integrated provider — payments, maps, banking, travel, weather, and gov open data.
        </span>
      </div>
    </section>
  );
}
