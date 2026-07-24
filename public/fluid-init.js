(function () {
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var host = document.getElementById("fluid-background");
  if (!host || reducedMotion) return;

  host.classList.add("is-live");
  host.style.background =
    "radial-gradient(ellipse 80% 60% at 20% 40%, rgba(0, 174, 239, 0.12), transparent 55%)," +
    "radial-gradient(ellipse 70% 50% at 80% 60%, rgba(201, 207, 214, 0.1), transparent 50%)," +
    "linear-gradient(160deg, #0a0015 0%, #16161a 45%, #0a0015 100%)";
})();
