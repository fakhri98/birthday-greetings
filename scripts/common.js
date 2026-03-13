(function () {
  const RECIPIENT_KEY = "birthday_greetings_recipient";
  const MUSIC_PREF_KEY = "birthday_greetings_music_enabled";
  const EGG_PROGRESS_KEY = "birthday_greetings_easter_progress";
  const MUSIC_SRC = "assets/audio/invisible-string-instrumental.mp3";

  function cookieGet(key) {
    const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const match = document.cookie.match(new RegExp(`(?:^|; )${escaped}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : null;
  }

  function cookieSet(key, value) {
    const maxAge = 60 * 60 * 24 * 365;
    document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; samesite=lax`;
  }

  function cookieRemove(key) {
    document.cookie = `${key}=; path=/; max-age=0; samesite=lax`;
  }

  function storageGet(key) {
    try {
      const value = window.localStorage.getItem(key);
      if (value !== null) {
        return value;
      }
    } catch (error) {
      // Ignore and fallback to cookies.
    }
    return cookieGet(key);
  }

  function storageSet(key, value) {
    let success = false;
    try {
      window.localStorage.setItem(key, value);
      success = true;
    } catch (error) {
      success = false;
    }

    try {
      cookieSet(key, value);
      return true;
    } catch (error) {
      return success;
    }
  }

  function storageRemove(key) {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      // Ignore and continue.
    }

    try {
      cookieRemove(key);
      return true;
    } catch (error) {
      return false;
    }
  }

  let musicEnabled = storageGet(MUSIC_PREF_KEY) === "on";
  let musicAudio = null;
  let musicButton = null;
  let musicReady = false;
  let musicErrored = false;
  let musicTempPauseDepth = 0;
  let shouldResumeAfterTempPause = false;
  let waitingForInteraction = false;
  let eggToastTimer = null;
  let eggResetButton = null;

  function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
  }

  function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  function createFloatingLayer(options) {
    const settings = {
      count: 24,
      symbols: ["&#10084;", "&#10024;", "&#9679;"],
      colors: ["#ff6f61", "#ffb347", "#8ad6b9", "#ff8da1"],
      minSize: 12,
      maxSize: 34,
      minDuration: 12,
      maxDuration: 26,
      ...options
    };

    const layer = document.createElement("div");
    layer.className = "floating-layer";

    for (let i = 0; i < settings.count; i += 1) {
      const item = document.createElement("span");
      item.className = "float-item";
      item.innerHTML = pickRandom(settings.symbols);
      item.style.left = `${randomBetween(1, 98)}vw`;
      item.style.setProperty("--float-color", pickRandom(settings.colors));
      item.style.setProperty("--float-size", `${randomBetween(settings.minSize, settings.maxSize)}px`);
      item.style.setProperty("--float-duration", `${randomBetween(settings.minDuration, settings.maxDuration)}s`);
      item.style.setProperty("--float-x", `${randomBetween(-70, 70)}px`);
      item.style.setProperty("--float-rot", `${randomBetween(-220, 220)}deg`);
      item.style.animationDelay = `${randomBetween(0, 16)}s`;
      layer.appendChild(item);
    }

    document.body.appendChild(layer);
    return layer;
  }

  function burstConfetti(options) {
    const settings = {
      count: 70,
      x: 50,
      y: 50,
      colors: ["#ff6f61", "#ffb347", "#8ad6b9", "#f1a7d8", "#ffd166"],
      ...options
    };

    for (let i = 0; i < settings.count; i += 1) {
      const piece = document.createElement("span");
      piece.className = "confetti-burst";
      piece.style.left = `${settings.x}%`;
      piece.style.top = `${settings.y}%`;
      piece.style.background = pickRandom(settings.colors);
      piece.style.setProperty("--burst-x", `${randomBetween(-220, 220)}px`);
      piece.style.setProperty("--burst-y", `${randomBetween(-220, 220)}px`);
      piece.style.setProperty("--burst-r", `${randomBetween(-280, 280)}deg`);
      piece.style.animationDelay = `${randomBetween(0, 120)}ms`;
      document.body.appendChild(piece);
      setTimeout(() => piece.remove(), 1000);
    }
  }

  function navigate(path) {
    window.location.href = path;
  }

  function sanitizeName(value) {
    return (value || "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 36);
  }

  function setRecipientName(value) {
    const clean = sanitizeName(value);
    if (!clean) {
      storageRemove(RECIPIENT_KEY);
      return "";
    }
    storageSet(RECIPIENT_KEY, clean);
    return clean;
  }

  function getRecipientName(fallback) {
    const stored = storageGet(RECIPIENT_KEY);
    const clean = sanitizeName(stored);
    return clean || fallback || "Birthday Star";
  }

  function createFileSlug(value) {
    return sanitizeName(value)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "birthday-star";
  }

  function getCurrentPageEggId() {
    const rawPath = (window.location.pathname || "/index.html").toLowerCase();
    const normalized = rawPath.endsWith("/")
      ? `${rawPath}index.html`
      : rawPath;
    const pagePart = normalized.split("/").pop() || "index.html";
    return pagePart.replace(/\.[a-z0-9]+$/i, "") || "index";
  }

  function readEggProgressStore() {
    const raw = storageGet(EGG_PROGRESS_KEY);
    if (!raw) {
      return {};
    }

    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        return parsed;
      }
      return {};
    } catch (error) {
      return {};
    }
  }

  function writeEggProgressStore(store) {
    storageSet(EGG_PROGRESS_KEY, JSON.stringify(store));
  }

  function showEggToast(payload) {
    let title = "Secret Unlocked";
    let message = "";
    if (typeof payload === "string") {
      message = payload;
    } else if (payload && typeof payload === "object") {
      title = payload.title || title;
      message = payload.message || "";
    }

    let toast = document.querySelector(".egg-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "egg-toast";
      document.body.appendChild(toast);
    }

    toast.innerHTML = `
      <span class="egg-toast-title">${title}</span>
      <span class="egg-toast-body">${message}</span>
    `;
    toast.classList.remove("show");
    void toast.offsetWidth;
    toast.classList.add("show");

    if (eggToastTimer) {
      window.clearTimeout(eggToastTimer);
    }
    eggToastTimer = window.setTimeout(() => {
      toast.classList.remove("show");
    }, 2800);
  }

  function mountEggResetButton(options) {
    const settings = {
      scope: "story",
      label: "Reset Eggs",
      confirmMessage: "Reset all found easter eggs? This will clear saved progress.",
      ...options
    };

    const cleanScope = sanitizeName(String(settings.scope || "story"))
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-") || "story";

    if (!eggResetButton) {
      eggResetButton = document.createElement("button");
      eggResetButton.type = "button";
      eggResetButton.className = "egg-reset-toggle";
      document.body.appendChild(eggResetButton);
    }

    eggResetButton.textContent = settings.label;
    eggResetButton.setAttribute("aria-label", settings.label);
    eggResetButton.dataset.scope = cleanScope;
    eggResetButton.onclick = () => {
      const shouldReset = window.confirm(settings.confirmMessage);
      if (!shouldReset) {
        return;
      }

      resetEasterEggProgress(cleanScope);
      window.location.reload();
    };
  }

  function initEasterEggs(options) {
    const settings = {
      messages: [
        "Inside joke unlocked.",
        "Secret found."
      ],
      symbols: ["\u2665", "\u2605"],
      count: 4,
      completeMessage: "All hidden secrets found. You are officially adorable.",
      counterLabel: "Secrets found",
      persist: true,
      pageId: getCurrentPageEggId(),
      scope: "story",
      globalTotal: null,
      resetButton: true,
      resetButtonLabel: "Reset Eggs",
      resetButtonConfirm: "Reset all found easter eggs? This will clear saved progress.",
      ...options
    };

    const oldLayer = document.querySelector(".egg-layer");
    if (oldLayer) {
      oldLayer.remove();
    }

    if (!Array.isArray(settings.messages) || settings.messages.length === 0) {
      return null;
    }

    const layer = document.createElement("div");
    layer.className = "egg-layer";
    document.body.appendChild(layer);

    const total = Math.max(1, Math.min(settings.count, settings.messages.length));
    const pageId = sanitizeName(String(settings.pageId || "index"))
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-") || "index";
    const eggScope = sanitizeName(String(settings.scope || "story"))
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-") || "story";
    const eggIds = Array.from({ length: total }, (_, index) => `${pageId}:${index}`);
    const foundIds = new Set();

    let store = readEggProgressStore();
    if (!store || typeof store !== "object") {
      store = {};
    }
    if (!store.scopes || typeof store.scopes !== "object") {
      store.scopes = {};
    }
    if (!store.scopes[eggScope] || typeof store.scopes[eggScope] !== "object") {
      store.scopes[eggScope] = {
        foundIds: [],
        pageTotals: {},
        globalTotal: 0,
        updatedAt: Date.now()
      };
    }

    const scopeState = store.scopes[eggScope];
    if (!Array.isArray(scopeState.foundIds)) {
      scopeState.foundIds = [];
    }
    if (!scopeState.pageTotals || typeof scopeState.pageTotals !== "object") {
      scopeState.pageTotals = {};
    }

    scopeState.pageTotals[pageId] = total;
    if (Number.isFinite(settings.globalTotal) && settings.globalTotal > 0) {
      scopeState.globalTotal = Number(settings.globalTotal);
    } else if (!Number.isFinite(scopeState.globalTotal) || scopeState.globalTotal <= 0) {
      const totals = Object.values(scopeState.pageTotals)
        .map((value) => Number(value))
        .filter((value) => Number.isFinite(value) && value > 0);
      scopeState.globalTotal = totals.reduce((sum, value) => sum + value, 0);
    }

    scopeState.foundIds.forEach((value) => {
      if (typeof value === "string" && value.includes(":")) {
        foundIds.add(value);
      }
    });

    const getGlobalFoundCount = () => foundIds.size;
    const getGlobalTotalCount = () => {
      if (Number.isFinite(settings.globalTotal) && settings.globalTotal > 0) {
        return Number(settings.globalTotal);
      }
      if (Number.isFinite(scopeState.globalTotal) && scopeState.globalTotal > 0) {
        return Number(scopeState.globalTotal);
      }
      const totals = Object.values(scopeState.pageTotals)
        .map((value) => Number(value))
        .filter((value) => Number.isFinite(value) && value > 0);
      return totals.reduce((sum, value) => sum + value, 0);
    };

    let completedShown = getGlobalFoundCount() >= getGlobalTotalCount() && getGlobalTotalCount() > 0;

    const counter = document.createElement("div");
    counter.className = "egg-counter";
    layer.appendChild(counter);

    if (settings.resetButton) {
      mountEggResetButton({
        scope: eggScope,
        label: settings.resetButtonLabel,
        confirmMessage: settings.resetButtonConfirm
      });
    }

    function persistState() {
      if (!settings.persist) {
        return;
      }
      scopeState.foundIds = Array.from(foundIds);
      scopeState.pageTotals[pageId] = total;
      if (Number.isFinite(settings.globalTotal) && settings.globalTotal > 0) {
        scopeState.globalTotal = Number(settings.globalTotal);
      }
      scopeState.updatedAt = Date.now();
      writeEggProgressStore(store);
    }

    function updateCounter() {
      const foundCount = getGlobalFoundCount();
      const totalCount = getGlobalTotalCount();
      counter.textContent = `${settings.counterLabel}: ${foundCount}/${totalCount}`;
      counter.classList.toggle("is-complete", totalCount > 0 && foundCount >= totalCount);
    }

    updateCounter();

    for (let i = 0; i < total; i += 1) {
      const egg = document.createElement("button");
      egg.type = "button";
      egg.className = "easter-egg";
      egg.innerHTML = settings.symbols[i % settings.symbols.length];
      egg.setAttribute("aria-label", `Hidden message ${i + 1}`);
      egg.style.left = `${8 + Math.random() * 82}%`;
      egg.style.top = `${10 + Math.random() * 74}%`;
      const eggId = eggIds[i];
      const isFoundAlready = foundIds.has(eggId);
      egg.dataset.found = isFoundAlready ? "yes" : "no";
      if (isFoundAlready) {
        egg.classList.add("found");
      }

      egg.addEventListener("click", () => {
        const message = settings.messages[i] || "Secret found.";
        const isFirstFind = egg.dataset.found !== "yes";

        if (isFirstFind) {
          egg.dataset.found = "yes";
          egg.classList.add("found");
          foundIds.add(eggId);
          persistState();
          updateCounter();
          showEggToast({
            title: "Secret Found",
            message
          });
          burstConfetti({ count: 28, x: 10 + Math.random() * 80, y: 20 + Math.random() * 50 });
        } else {
          showEggToast({
            title: "Secret Replay",
            message
          });
          burstConfetti({ count: 14, x: 10 + Math.random() * 80, y: 20 + Math.random() * 50 });
        }

        const globalFound = getGlobalFoundCount();
        const globalTotal = getGlobalTotalCount();
        if (globalTotal > 0 && globalFound >= globalTotal && !completedShown) {
          completedShown = true;
          window.setTimeout(() => {
            showEggToast({
              title: "All Secrets Complete",
              message: settings.completeMessage
            });
            burstConfetti({ count: 120, x: 50, y: 30 });
          }, 520);
        }
      });

      layer.appendChild(egg);
    }

    return layer;
  }

  function resetEasterEggProgress(scope) {
    const store = readEggProgressStore();
    if (!store || typeof store !== "object") {
      storageRemove(EGG_PROGRESS_KEY);
      return;
    }

    if (scope) {
      const cleanScope = sanitizeName(String(scope))
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, "-");
      if (store.scopes && typeof store.scopes === "object" && cleanScope && store.scopes[cleanScope]) {
        delete store.scopes[cleanScope];
        if (Object.keys(store.scopes).length === 0) {
          storageRemove(EGG_PROGRESS_KEY);
        } else {
          writeEggProgressStore(store);
        }
      }
      return;
    }

    storageRemove(EGG_PROGRESS_KEY);
  }

  function updateMusicButton() {
    if (!musicButton) {
      return;
    }

    if (musicErrored) {
      musicButton.textContent = "Music unavailable";
      musicButton.disabled = true;
      musicButton.classList.remove("is-on");
      musicButton.setAttribute("aria-label", "Background music unavailable");
      return;
    }

    const label = musicEnabled ? "Music: On" : "Music: Off";
    musicButton.textContent = label;
    musicButton.disabled = false;
    musicButton.classList.toggle("is-on", musicEnabled);
    musicButton.setAttribute("aria-label", label);
  }

  function rememberMusicPreference() {
    storageSet(MUSIC_PREF_KEY, musicEnabled ? "on" : "off");
  }

  function tryPlayMusic() {
    if (!musicAudio || !musicEnabled || musicTempPauseDepth > 0) {
      return;
    }

    const playAttempt = musicAudio.play();
    if (playAttempt && typeof playAttempt.catch === "function") {
      playAttempt.catch(() => {
        if (!waitingForInteraction) {
          waitingForInteraction = true;
          const resume = () => {
            waitingForInteraction = false;
            window.removeEventListener("pointerdown", resume);
            window.removeEventListener("keydown", resume);
            tryPlayMusic();
          };
          window.addEventListener("pointerdown", resume, { once: true });
          window.addEventListener("keydown", resume, { once: true });
        }
      });
    }
  }

  function setMusicEnabled(value) {
    musicEnabled = value;
    rememberMusicPreference();

    if (!musicAudio) {
      return;
    }

    if (!musicEnabled) {
      musicAudio.pause();
    } else {
      tryPlayMusic();
    }

    updateMusicButton();
  }

  function toggleMusic() {
    setMusicEnabled(!musicEnabled);
  }

  function pauseMusicForVoiceNote() {
    if (!musicAudio || !musicReady || musicErrored) {
      return false;
    }

    musicTempPauseDepth += 1;
    if (musicTempPauseDepth === 1) {
      shouldResumeAfterTempPause = !musicAudio.paused;
      if (!musicAudio.paused) {
        musicAudio.pause();
      }
    }
    return true;
  }

  function resumeMusicAfterVoiceNote() {
    if (!musicAudio || !musicReady || musicErrored || musicTempPauseDepth === 0) {
      return;
    }

    musicTempPauseDepth -= 1;
    if (musicTempPauseDepth === 0) {
      if (musicEnabled && shouldResumeAfterTempPause) {
        tryPlayMusic();
      }
      shouldResumeAfterTempPause = false;
    }
  }

  function mountMusicControls() {
    if (document.querySelector(".music-toggle")) {
      return;
    }

    musicAudio = document.createElement("audio");
    musicAudio.src = MUSIC_SRC;
    musicAudio.loop = true;
    musicAudio.preload = "metadata";
    musicAudio.setAttribute("aria-hidden", "true");

    musicButton = document.createElement("button");
    musicButton.type = "button";
    musicButton.className = "music-toggle";
    musicButton.addEventListener("click", toggleMusic);

    document.body.appendChild(musicAudio);
    document.body.appendChild(musicButton);

    musicAudio.addEventListener("canplay", () => {
      musicReady = true;
      musicErrored = false;
      updateMusicButton();
      if (musicEnabled) {
        tryPlayMusic();
      }
    });

    musicAudio.addEventListener("loadeddata", () => {
      musicReady = true;
      musicErrored = false;
      updateMusicButton();
      if (musicEnabled) {
        tryPlayMusic();
      }
    });

    musicAudio.addEventListener("error", () => {
      musicReady = false;
      musicErrored = true;
      updateMusicButton();
    });

    musicAudio.load();
    updateMusicButton();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountMusicControls);
  } else {
    mountMusicControls();
  }

  window.BirthdayApp = {
    burstConfetti,
    createFloatingLayer,
    createFileSlug,
    getRecipientName,
    initEasterEggs,
    navigate,
    readEggProgressStore,
    resetEasterEggProgress,
    pauseMusicForVoiceNote,
    resumeMusicAfterVoiceNote,
    sanitizeName,
    setRecipientName
  };
})();
