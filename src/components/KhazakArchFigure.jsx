import { useEffect, useRef } from "react";
import KhanShatyrAnimated from "./KhanShatyrAnimated.jsx";
import { KZ_ARCH_AGENTS, KZ_ARCH_ALLOWS, KZ_ARCH_DENIES } from "../data/kzArchCalls.js";
import { KZ_ARCH_TILES } from "../data/kzArchTiles.js";

const DENY_LABEL = "blocked";

function schedule(queue, ms, fn, alive) {
  const id = setTimeout(() => {
    queue.delete(id);
    if (alive.current) fn();
  }, ms);
  queue.add(id);
  return id;
}

function runTimeline(steps, alive) {
  const queue = new Set();
  let at = 0;
  steps.forEach(([delay, fn]) => {
    at += delay;
    schedule(queue, at, fn, alive);
  });
  return { queue, total: at };
}

function tileCenter(tile, stage, offsetX = 0, offsetY = 0) {
  const rect = tile.getBoundingClientRect();
  const stageRect = stage.getBoundingClientRect();
  return {
    x: rect.left - stageRect.left + rect.width / 2 + offsetX,
    y: rect.top - stageRect.top + rect.height / 2 + offsetY,
  };
}

function movePill(pill, point) {
  pill.style.transform = `translate(${point.x}px, ${point.y}px) translate(-50%, -50%)`;
}

function snapPill(pill, point) {
  pill.style.transition = "none";
  movePill(pill, point);
  pill.offsetWidth;
  pill.style.transition = "";
}

function animatePill(pill, point, ms) {
  pill.style.transitionDuration = `0.35s, ${ms}ms, 0.4s, 0.4s`;
  movePill(pill, point);
}

function drawBeam(beam, from, to, ms, tone = "") {
  beam.setAttribute("d", `M${from.x} ${from.y}L${to.x} ${to.y}`);
  beam.setAttribute(
    "class",
    `kz-af-beam ${beam.classList.contains("kz-af-beam-b") ? "kz-af-beam-b" : "kz-af-beam-a"} ${tone}`.trim(),
  );
  beam.style.transition = "none";
  beam.style.strokeDashoffset = "1";
  beam.style.opacity = "1";
  beam.getBoundingClientRect();
  beam.style.transition = `stroke-dashoffset ${ms}ms cubic-bezier(0.4,0,0.2,1), opacity 0.55s ease, stroke 0.4s ease, filter 0.4s ease`;
  beam.style.strokeDashoffset = "0";
}

function setBeamTone(beam, tone) {
  beam.setAttribute(
    "class",
    `kz-af-beam ${beam.classList.contains("kz-af-beam-b") ? "kz-af-beam-b" : "kz-af-beam-a"} ${tone}`.trim(),
  );
}

function hideBeam(beam) {
  beam.style.opacity = "0";
}

function hidePill(pill) {
  pill.classList.remove("kz-af-vis");
}

function pillAnchor(hub, pill, offset = 0) {
  return { x: hub.right - (pill.offsetWidth + offset) / 2 - 14, y: hub.top + 24 };
}

function appendLog(strip, kind, text, timers, alive, instant = false) {
  const line = document.createElement("div");
  line.className = "kz-af-line";
  const span = document.createElement("span");
  span.className = kind === "ok" ? "kz-af-ok" : "kz-af-nok";
  span.textContent = text;
  line.appendChild(span);
  strip.appendChild(line);
  line.offsetHeight;
  if (instant) line.classList.add("kz-af-in");
  else schedule(timers, 30, () => line.classList.add("kz-af-in"), alive);

  const lines = strip.querySelectorAll(".kz-af-line");
  lines.forEach((node, index) => {
    node.classList.toggle("kz-af-aged", index < lines.length - 1);
  });
  if (lines.length > 3) {
    const first = lines[0];
    first.classList.add("kz-af-gone");
    schedule(timers, 600, () => first.remove(), alive);
  }
}

export default function KhazakArchFigure() {
  const rootRef = useRef(null);
  const aliveRef = useRef(true);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    aliveRef.current = true;
    const timers = new Set();
    const alive = aliveRef;

    const q = (sel) => {
      const node = root.querySelector(sel);
      if (!node) throw new Error(`KhazakArchFigure: missing ${sel}`);
      return node;
    };

    const stage = q(".kz-af-stage");
    const wires = q(".kz-af-wires");
    const fan = q(".kz-af-fan");
    const beamA = q(".kz-af-beam-a");
    const beamB = q(".kz-af-beam-b");
    const hub = q(".kz-af-hub");
    const capAgents = q(".kz-af-cap-agents");
    const capApis = q(".kz-af-cap-apis");
    const chip = q(".kz-af-chip");
    const chipText = q(".kz-af-chip-t");
    const keyBadge = q(".kz-af-key");
    const retPill = q(".kz-af-ret");
    const noPill = q(".kz-af-no");
    const strip = q(".kz-af-strip");
    const slots = Array.from(root.querySelectorAll(".kz-af-slot"));
    const tiles = Array.from(root.querySelectorAll(".kz-af-tile"));
    const tileBySlug = new Map(KZ_ARCH_TILES.map((tile, index) => [tile.slug, tiles[index]]));

    let visible = false;
    let cycling = false;
    let cycleIndex = 0;
    let activeSlot = slots[0];
    let activeTile = tileBySlug.get(KZ_ARCH_ALLOWS[0].slug) ?? tiles[0];

    const layout = {
      stacked: false,
      hubIn: { x: 0, y: 0 },
      hubOut: { x: 0, y: 0 },
      hub: { left: 0, right: 0, top: 0, bottom: 0 },
      slots: [],
      target: { x: 0, y: 0 },
    };

    const measure = () => {
      const stageRect = stage.getBoundingClientRect();
      const hubRect = hub.getBoundingClientRect();
      layout.stacked = window.matchMedia("(max-width: 860px)").matches;
      wires.setAttribute("viewBox", `0 0 ${Math.round(stageRect.width)} ${Math.round(stageRect.height)}`);

      layout.hub = {
        left: hubRect.left - stageRect.left,
        right: hubRect.right - stageRect.left,
        top: hubRect.top - stageRect.top,
        bottom: hubRect.bottom - stageRect.top,
      };

      layout.slots = slots.map((slot) => {
        const rect = slot.getBoundingClientRect();
        return layout.stacked
          ? { x: rect.left - stageRect.left + rect.width / 2, y: rect.bottom - stageRect.top + 5 }
          : { x: rect.right - stageRect.left + 5, y: rect.top - stageRect.top + rect.height / 2 };
      });

      layout.hubIn = layout.stacked
        ? { x: (layout.hub.left + layout.hub.right) / 2, y: layout.hub.top - 2 }
        : { x: layout.hub.left - 7, y: (layout.hub.top + layout.hub.bottom) / 2 };

      layout.hubOut = layout.stacked
        ? { x: (layout.hub.left + layout.hub.right) / 2, y: layout.hub.bottom + 2 }
        : { x: layout.hub.right + 7, y: (layout.hub.top + layout.hub.bottom) / 2 };

      layout.target = tileCenter(activeTile, stage);

      fan.setAttribute(
        "d",
        layout.slots
          .map((point) =>
            layout.stacked
              ? `M${point.x} ${point.y}L${point.x} ${layout.hub.top - 2}`
              : `M${point.x} ${point.y}L${layout.hubIn.x} ${layout.hubIn.y}`,
          )
          .join(""),
      );
    };

    const formatAllow = (call) =>
      `✓ ${call.agent} · ${call.method} ${call.path} · ${call.vendor} → ${call.status} · ${call.dur}`;

    const formatDeny = (call) =>
      `✗ ${call.agent} · ${call.method} ${call.path} · ${call.vendor} → ${DENY_LABEL} ${call.rule}`;

    const seedLogs = (instant = false) => {
      appendLog(strip, "ok", formatAllow(KZ_ARCH_ALLOWS[0]), timers, alive, instant);
      appendLog(strip, "nok", formatDeny(KZ_ARCH_DENIES[0]), timers, alive, instant);
      strip.querySelectorAll(".kz-af-line").forEach((line) => line.classList.add("kz-af-aged"));
    };

    const resetVisual = () => {
      [chip, retPill, noPill].forEach(hidePill);
      [beamA, beamB].forEach(hideBeam);
      hub.classList.remove("kz-af-hot-a", "kz-af-hot-r");
      capAgents.classList.remove("kz-af-lit");
      capApis.classList.remove("kz-af-lit");
      keyBadge.classList.remove("kz-af-show");
      chip.classList.remove("kz-af-bad");
      slots.forEach((slot) => slot.classList.remove("kz-af-calling"));
      tiles.forEach((tile) => tile.classList.remove("kz-af-bloom"));
    };

    const runCycle = () => {
      cycling = true;
      const allow = KZ_ARCH_ALLOWS[cycleIndex % KZ_ARCH_ALLOWS.length];
      const deny = KZ_ARCH_DENIES[cycleIndex % KZ_ARCH_DENIES.length];
      activeTile = tileBySlug.get(allow.slug) ?? activeTile;
      activeSlot = slots[cycleIndex % slots.length];
      cycleIndex += 1;
      measure();

      const slotPoint = layout.slots[slots.indexOf(activeSlot)];
      const hubChipPoint = () => pillAnchor(layout.hub, chip, 54);

      const allowSteps = [
        [0, () => {
          activeSlot.classList.add("kz-af-calling");
          capAgents.classList.add("kz-af-lit");
        }],
        [520, () => {
          chipText.textContent = `${allow.method} ${allow.path}`;
          chip.classList.remove("kz-af-bad");
          keyBadge.classList.remove("kz-af-show");
          snapPill(chip, slotPoint);
          chip.classList.add("kz-af-vis");
        }],
        [260, () => {
          drawBeam(beamA, slotPoint, layout.stacked ? { x: slotPoint.x, y: layout.hub.top - 2 } : layout.hubIn, 900);
          animatePill(chip, hubChipPoint(), 900);
          hub.classList.add("kz-af-hot-a");
        }],
        [940, () => {
          keyBadge.classList.add("kz-af-show");
          setBeamTone(beamA, "kz-af-b-amber");
        }],
        [760, () => {
          drawBeam(
            beamB,
            layout.stacked ? { x: layout.target.x, y: layout.hub.bottom + 2 } : layout.hubOut,
            layout.target,
            900,
          );
          animatePill(chip, layout.target, 900);
          hub.classList.remove("kz-af-hot-a");
          keyBadge.classList.remove("kz-af-show");
        }],
        [640, () => hidePill(chip)],
        [260, () => {
          activeTile.classList.add("kz-af-bloom");
          capApis.classList.add("kz-af-lit");
        }],
        [620, () => {
          retPill.textContent = allow.status;
          setBeamTone(beamA, "kz-af-b-green");
          setBeamTone(beamB, "kz-af-b-green");
          snapPill(retPill, layout.target);
          retPill.classList.add("kz-af-vis");
          animatePill(retPill, pillAnchor(layout.hub, retPill), 950);
        }],
        [980, () => appendLog(strip, "ok", formatAllow(allow), timers, alive)],
        [520, () => hidePill(retPill)],
        [420, () => {
          activeTile.classList.remove("kz-af-bloom");
          hideBeam(beamA);
          hideBeam(beamB);
          activeSlot.classList.remove("kz-af-calling");
          capAgents.classList.remove("kz-af-lit");
          capApis.classList.remove("kz-af-lit");
        }],
        [1500, () => {
          activeSlot.classList.add("kz-af-calling");
          capAgents.classList.add("kz-af-lit");
        }],
        [520, () => {
          chipText.textContent = `${deny.method} ${deny.path}`;
          keyBadge.classList.remove("kz-af-show");
          snapPill(chip, slotPoint);
          chip.classList.add("kz-af-vis");
        }],
        [260, () => {
          drawBeam(beamA, slotPoint, layout.stacked ? { x: slotPoint.x, y: layout.hub.top - 2 } : layout.hubIn, 900);
          animatePill(chip, hubChipPoint(), 900);
        }],
        [940, () => {
          hub.classList.add("kz-af-hot-r");
          chip.classList.add("kz-af-bad");
          setBeamTone(beamA, "kz-af-b-red");
        }],
        [560, () => {
          hidePill(chip);
          beamA.style.opacity = "0.45";
        }],
        [400, () => {
          noPill.textContent = `${DENY_LABEL} · ${deny.rule}`;
          const anchor = pillAnchor(layout.hub, noPill);
          snapPill(noPill, anchor);
          noPill.classList.add("kz-af-vis");
          animatePill(noPill, { x: anchor.x - 26, y: anchor.y }, 800);
        }],
        [760, () => appendLog(strip, "nok", formatDeny(deny), timers, alive)],
        [820, () => {
          hidePill(noPill);
          hub.classList.remove("kz-af-hot-r");
          hideBeam(beamA);
          activeSlot.classList.remove("kz-af-calling");
          capAgents.classList.remove("kz-af-lit");
        }],
      ];

      const { total } = runTimeline(allowSteps, alive);
      schedule(timers, total + 300, () => {
        if (visible) runCycle();
        else cycling = false;
      }, alive);
    };

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let observer;
    let resizeTimer;

    const cleanup = () => {
      alive.current = false;
      timers.forEach((id) => clearTimeout(id));
      observer?.disconnect();
      window.removeEventListener("resize", onResize);
      clearTimeout(resizeTimer);
      strip.replaceChildren();
      root.classList.remove("kz-af-on");
      resetVisual();
    };

    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (alive.current) measure();
      }, 160);
    };

    measure();

    if (reduced) {
      root.classList.add("kz-af-on");
      measure();
      activeSlot = slots[1] ?? slots[0];
      activeSlot.classList.add("kz-af-calling");
      const slotPoint = layout.slots[slots.indexOf(activeSlot)];
      drawBeam(
        beamA,
        slotPoint,
        layout.stacked ? { x: slotPoint.x, y: layout.hub.top - 2 } : layout.hubIn,
        0,
        "kz-af-b-amber",
      );
      drawBeam(
        beamB,
        layout.stacked ? { x: layout.target.x, y: layout.hub.bottom + 2 } : layout.hubOut,
        layout.target,
        0,
        "kz-af-b-green",
      );
      activeTile.classList.add("kz-af-bloom");
      capAgents.classList.add("kz-af-lit");
      capApis.classList.add("kz-af-lit");
      keyBadge.classList.add("kz-af-show");
      seedLogs(true);
      strip.lastElementChild?.classList.remove("kz-af-aged");
      return cleanup;
    }

    let started = false;
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          visible = entry.isIntersecting;
          if (!visible) continue;
          if (started) {
            if (!cycling) {
              cycling = true;
              schedule(timers, 300, runCycle, alive);
            }
          } else {
            started = true;
            cycling = true;
            root.classList.add("kz-af-on");
            seedLogs();
            schedule(timers, 900, runCycle, alive);
          }
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(root);
    window.addEventListener("resize", onResize);
    return cleanup;
  }, []);

  return (
    <figure ref={rootRef} className="kz-af" role="img" aria-label="Agent requests flow through Khazak API to Kazakhstan providers">
      <div className="kz-af-stage" aria-hidden="true">
        <svg className="kz-af-wires" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path className="kz-af-fan" />
          <path className="kz-af-beam kz-af-beam-a" pathLength="1" />
          <path className="kz-af-beam kz-af-beam-b" pathLength="1" />
        </svg>

        <span className="kz-af-cap kz-af-cap-agents">any agent</span>
        <span className="kz-af-cap kz-af-cap-apis">Kazakhstan APIs · public or private</span>

        <div className="kz-af-agents">
          {KZ_ARCH_AGENTS.map((mask) => (
            <span key={mask} className="kz-af-slot">
              <span
                className="kz-af-glyph"
                style={{
                  maskImage: `url(${mask})`,
                  WebkitMaskImage: `url(${mask})`,
                }}
              />
            </span>
          ))}
        </div>

        <div className="kz-af-hub">
          <KhanShatyrAnimated className="kz-af-hub-art" />
        </div>

        <div className="kz-af-fieldwrap">
          <div className="kz-af-field">
            {KZ_ARCH_TILES.map((tile) => (
              <span key={tile.slug} className="kz-af-tile" title={tile.vendor}>
                <img src={tile.src} alt="" width={22} height={22} loading="lazy" decoding="async" />
              </span>
            ))}
          </div>
        </div>

        <div className="kz-af-pill kz-af-chip">
          <span className="kz-af-chip-t" />
          <span className="kz-af-key">key_████</span>
        </div>
        <div className="kz-af-pill kz-af-ret" />
        <div className="kz-af-pill kz-af-no" />
      </div>

      <div className="kz-af-strip" aria-hidden="true" />
    </figure>
  );
}
