(function () {
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

  window.BirthdayApp = {
    burstConfetti,
    createFloatingLayer,
    navigate
  };
})();
