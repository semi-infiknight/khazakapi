import { KZ_ARCH_TILES } from "../data/kzArchTiles.js";

const ROW_CONFIG = [
  { duration: 70, reverse: false },
  { duration: 84, reverse: true },
  { duration: 98, reverse: false },
];

function buildWallRows(tiles, rowCount = 3) {
  const rows = Array.from({ length: rowCount }, () => []);
  tiles.forEach((tile, index) => {
    rows[index % rowCount].push(tile);
  });
  return rows;
}

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
  const rows = buildWallRows(KZ_ARCH_TILES, ROW_CONFIG.length);

  return (
    <section className="kz-wall" aria-label="Integrated Kazakhstan API providers">
      <div className="kz-wall-rows" aria-hidden="true">
        {rows.map((rowTiles, index) => (
          <LogoTrack
            key={index}
            tiles={rowTiles}
            duration={ROW_CONFIG[index].duration}
            reverse={ROW_CONFIG[index].reverse}
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
