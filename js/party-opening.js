/* Home-only cinematic intro. Existing game state is never reset. */
(function () {
  "use strict";
  if (document.getElementById("party-opening")) return;
  // Returning from a game or study page should not delay the next round.
  try {
    if (document.referrer) {
      const ref = new URL(document.referrer);
      if (ref.origin === location.origin && /\/(charades|study)\.html$/.test(ref.pathname)) return;
    }
  } catch (_) {}
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const overlay = document.createElement("div");
  overlay.id = "party-opening";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-label", "Similar Photo Party オープニング");
  overlay.innerHTML = '<div class="party-sky" aria-hidden="true"></div><div class="party-stars" aria-hidden="true"></div><div class="party-vignette" aria-hidden="true"></div><div class="party-trail party-trail-left" aria-hidden="true"></div><div class="party-trail party-trail-right" aria-hidden="true"></div><div class="party-logo-stage"><img class="party-logo party-photo" src="assets/images/similar-photo-badge.avif" alt="Similar Photo" width="256" height="256"><img class="party-logo party-charade" src="assets/images/charade-badge.avif" alt="Charade" width="256" height="256"></div><div class="party-ring" aria-hidden="true"></div><div class="party-ring party-ring-two" aria-hidden="true"></div><div class="party-fusion" aria-hidden="true"></div><div class="party-title-stage"><span class="party-kicker">ONE APP. TWO WAYS TO PLAY.</span><strong class="party-title-line">Play together.</strong><strong class="party-title-line party-title-accent">Think differently.</strong><span class="party-tagline">PLAY · GUESS · CONNECT</span></div><button class="party-skip" type="button">スキップ →</button><div class="party-progress" aria-hidden="true"></div>';
  document.body.prepend(overlay);
  if (getComputedStyle(overlay).position !== "fixed") { overlay.remove(); return; }
  const skip = overlay.querySelector(".party-skip");
  const held = [];
  let finished = false;
  let timer;
  function finish() {
    if (finished) return;
    finished = true;
    clearTimeout(timer);
    document.removeEventListener("DOMContentLoaded", isolate);
    window.removeEventListener("keydown", onKey, true);
    for (const node of held) node.inert = false;
    overlay.remove();
  }
  function isolate() {
    if (finished) return;
    for (const node of document.body.children) {
      if (node !== overlay && !node.matches("script,style,link") && "inert" in node && !node.inert) {
        node.inert = true; held.push(node);
      }
    }
    skip.focus({preventScroll:true});
  }
  function onKey(event) {
    if (event.key === "Escape") { event.preventDefault(); event.stopImmediatePropagation(); finish(); }
    else if (event.key === "Tab") { event.preventDefault(); event.stopImmediatePropagation(); skip.focus(); }
    else if (event.target !== skip || !["Enter"," "].includes(event.key)) event.stopImmediatePropagation();
  }
  skip.addEventListener("click", finish);
  window.addEventListener("keydown", onKey, true);
  timer = window.setTimeout(finish, 6000);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", isolate, {once:true});
  else isolate();
  for (const img of overlay.querySelectorAll("img")) {
    img.addEventListener("error", finish, {once:true});
    if (img.complete && !img.naturalWidth) { finish(); break; }
  }
})();
