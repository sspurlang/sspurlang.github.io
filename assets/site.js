// sspurlang.github.io: theme, install tabs, copy buttons and two easter eggs.
// The page works without this script: every install command is shown and selectable.
(() => {
  const D = document, root = D.documentElement;
  const calm = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const store = (k, v) => { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) {} };
  const toast = (msg) => {
    const t = D.querySelector(".toast");
    if (!t) return;
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => (t.hidden = true), 2200);
  };

  // Theme: the system's by default, the toggle remembers a choice. Six quick toggles find a terminal.
  let flips = [];
  const themeBtn = D.querySelector("[data-theme-toggle]");
  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      if (root.dataset.egg === "crt") {
        delete root.dataset.egg;
        toast("Back to the present.");
        return;
      }
      const dark = root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
      root.dataset.theme = dark ? "light" : "dark";
      store("sspur-theme", root.dataset.theme);
      const now = Date.now();
      flips = flips.filter((t) => now - t < 3000).concat(now);
      if (flips.length >= 6) {
        flips = [];
        root.dataset.egg = "crt";
        toast("Can't decide? Have a terminal. Tap the theme button to leave.");
      }
    });
  }

  // Install tabs, with arrow keys, Home and End, and the visitor's OS picked first.
  const tabs = [...D.querySelectorAll('[role="tab"]')];
  const select = (tab, focus) => {
    for (const t of tabs) {
      const on = t === tab;
      t.setAttribute("aria-selected", on);
      t.tabIndex = on ? 0 : -1;
      const p = D.getElementById(t.getAttribute("aria-controls"));
      p.classList.toggle("on", on);
      p.classList.toggle("in", on && focus !== undefined);
    }
    if (focus) tab.focus();
  };
  tabs.forEach((t, i) => {
    t.addEventListener("click", () => select(t, false));
    t.addEventListener("keydown", (e) => {
      const n = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
      if (n === undefined) return;
      e.preventDefault();
      select(tabs[(n + tabs.length) % tabs.length], true);
    });
  });
  const plat = ((navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || navigator.userAgent || "").toLowerCase();
  if (tabs.length && /win/.test(plat)) select(D.getElementById("tab-win"));
  else if (tabs.length && /linux|x11|cros/.test(plat) && !/android/.test(navigator.userAgent.toLowerCase())) select(D.getElementById("tab-curl"));

  // Copy buttons.
  for (const b of D.querySelectorAll("[data-copy]")) {
    b.addEventListener("click", async () => {
      const el = D.getElementById(b.dataset.copy);
      const label = b.querySelector("span");
      try {
        await navigator.clipboard.writeText(el.textContent);
        b.classList.add("done");
        if (label) label.textContent = "Copied";
        toast("Copied to the clipboard");
        clearTimeout(b.timer);
        b.timer = setTimeout(() => { b.classList.remove("done"); if (label) label.textContent = "Copy"; }, 1600);
      } catch (e) {
        getSelection().selectAllChildren(el);
        toast("Selected: press Ctrl+C or Cmd+C");
      }
    });
  }

  // Tap the big logo five times (or type "sspur" anywhere) for a spin and a burst of logos.
  const logo = D.querySelector("[data-egg-logo]");
  let taps = [];
  const party = () => {
    if (!logo) return;
    logo.classList.remove("spin");
    void logo.offsetWidth;
    logo.classList.add("spin");
    toast("Effects in the signature, hashes in the lock.");
    if (calm()) return;
    const r = logo.getBoundingClientRect();
    const x = r.left + r.width / 2, y = r.top + r.height / 2;
    for (let i = 0; i < 18; i++) {
      const img = D.createElement("img");
      img.src = logo.querySelector("img").src;
      img.alt = "";
      img.className = "burst";
      img.style.left = x - 13 + "px";
      img.style.top = y - 13 + "px";
      D.body.appendChild(img);
      const a = (i / 18) * Math.PI * 2 + Math.random() * 0.3;
      const d = 90 + Math.random() * 140;
      img.animate([
        { transform: "translate(0,0) scale(.4) rotate(0)", opacity: 1 },
        { transform: `translate(${Math.cos(a) * d}px,${Math.sin(a) * d + 60}px) scale(${0.6 + Math.random() * 0.6}) rotate(${Math.random() * 540 - 270}deg)`, opacity: 0 },
      ], { duration: 900 + Math.random() * 400, easing: "cubic-bezier(.2,.8,.2,1)" }).onfinish = () => img.remove();
    }
  };
  if (logo) {
    logo.addEventListener("click", () => {
      const now = Date.now();
      taps = taps.filter((t) => now - t < 2000).concat(now);
      if (taps.length >= 5) { taps = []; party(); }
    });
  }
  let typed = "";
  addEventListener("keydown", (e) => {
    if (/input|textarea|select/i.test(D.activeElement.tagName) || e.key.length !== 1) return;
    typed = (typed + e.key.toLowerCase()).slice(-5);
    if (typed === "sspur") party();
  });
})();

// The build pins the release it saw; a newer one shows up here as soon as it's published.
(function () {
  var v = document.getElementById("release-version");
  if (!v || !window.fetch) return;
  fetch("https://api.github.com/repos/sspurlang/sspur/releases/latest", { headers: { Accept: "application/vnd.github+json" } })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (rel) {
      if (!rel || !rel.tag_name) return;
      var tag = String(rel.tag_name).replace(/^v/, "");
      if (tag === v.textContent) return;
      v.textContent = tag;
      var pill = document.getElementById("release-pill");
      if (pill && rel.html_url) pill.href = rel.html_url;
      var d = document.getElementById("release-date");
      if (d && rel.published_at) d.textContent = new Date(rel.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    })
    .catch(function () {});
})();
