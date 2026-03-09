(function () {
  const RECIPIENT_KEY = "birthday_greetings_recipient";
  const MUSIC_PREF_KEY = "birthday_greetings_music_enabled";
  const MUSIC_SRC = "assets/audio/invisible-string-instrumental.mp3";

  let musicEnabled = window.localStorage.getItem(MUSIC_PREF_KEY) === "on";
  let musicAudio = null;
  let musicButton = null;
  let musicReady = false;
  let musicTempPauseDepth = 0;
  let shouldResumeAfterTempPause = false;
  let waitingForInteraction = false;

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
      window.localStorage.removeItem(RECIPIENT_KEY);
      return "";
    }
    window.localStorage.setItem(RECIPIENT_KEY, clean);
    return clean;
  }

  function getRecipientName(fallback) {
    const stored = window.localStorage.getItem(RECIPIENT_KEY);
    const clean = sanitizeName(stored);
    return clean || fallback || "Birthday Star";
  }

  function createFileSlug(value) {
    return sanitizeName(value)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "birthday-star";
  }

  function updateMusicButton() {
    if (!musicButton) {
      return;
    }

    if (!musicReady) {
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
    window.localStorage.setItem(MUSIC_PREF_KEY, musicEnabled ? "on" : "off");
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
    if (!musicAudio || !musicReady) {
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
    if (!musicAudio || !musicReady || musicTempPauseDepth === 0) {
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

    musicAudio.addEventListener("canplaythrough", () => {
      musicReady = true;
      updateMusicButton();
      if (musicEnabled) {
        tryPlayMusic();
      }
    });

    musicAudio.addEventListener("error", () => {
      musicReady = false;
      updateMusicButton();
    });

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
    navigate,
    pauseMusicForVoiceNote,
    resumeMusicAfterVoiceNote,
    sanitizeName,
    setRecipientName
  };
})();
