document.addEventListener("DOMContentLoaded", () => {
  const { burstConfetti, createFloatingLayer, getRecipientName, navigate } = window.BirthdayApp;
  const recipientName = getRecipientName("Birthday Star");

  createFloatingLayer({
    count: 24,
    symbols: ["&#10024;", "&#9679;", "&#9675;"],
    colors: ["#ffd166", "#ff9f68", "#9adbc4", "#f4b6de"],
    minSize: 10,
    maxSize: 22
  });

  const heading = document.getElementById("cakeHeading");
  const wishText = document.getElementById("wishText");
  const candles = Array.from(document.querySelectorAll(".candle"));
  const hint = document.getElementById("cakeHint");
  const wishModal = document.getElementById("wishModal");
  const closeWishButton = document.getElementById("closeWish");
  const backMemoriesButton = document.getElementById("backMemories");
  const nextLetterButton = document.getElementById("nextLetter");
  const toggleMicButton = document.getElementById("toggleMic");
  const micStatus = document.getElementById("micStatus");

  heading.textContent = `Make A Birthday Wish, ${recipientName}`;
  wishText.textContent = `May this year bring you loud laughter, calm days, and everything you secretly wished for, ${recipientName}.`;

  let blownCount = 0;
  let modalShown = false;

  let micStream = null;
  let audioContext = null;
  let analyser = null;
  let audioData = null;
  let micRafId = null;
  let micEnabled = false;
  let blowFrames = 0;
  let blowCooldownUntil = 0;

  function updateHint() {
    hint.textContent = `Candles blown: ${blownCount} / ${candles.length}`;
  }

  function makeSpark(x, y) {
    for (let i = 0; i < 6; i += 1) {
      const spark = document.createElement("span");
      spark.className = "spark";
      spark.style.left = `${x}px`;
      spark.style.top = `${y}px`;
      spark.style.setProperty("--spark-x", `${Math.random() * 42 - 21}px`);
      spark.style.setProperty("--spark-y", `${-10 - Math.random() * 32}px`);
      document.body.appendChild(spark);
      setTimeout(() => spark.remove(), 520);
    }
  }

  function getNextUnblown() {
    return candles.find((candle) => !candle.classList.contains("blown"));
  }

  function blowCandle(candle) {
    if (candle.classList.contains("blown")) {
      return;
    }

    candle.classList.add("blown");
    blownCount += 1;
    const rect = candle.getBoundingClientRect();
    makeSpark(rect.left + rect.width / 2, rect.top - 6);
    updateHint();

    if (blownCount === candles.length && !modalShown) {
      modalShown = true;
      setTimeout(() => {
        wishModal.classList.add("show");
        wishModal.setAttribute("aria-hidden", "false");
        burstConfetti({ count: 110, x: 50, y: 44 });
      }, 520);
    }
  }

  function currentVolumeLevel() {
    analyser.getByteTimeDomainData(audioData);
    let sum = 0;
    for (let i = 0; i < audioData.length; i += 1) {
      const normalized = (audioData[i] - 128) / 128;
      sum += normalized * normalized;
    }
    return Math.sqrt(sum / audioData.length);
  }

  function listenForBlow() {
    if (!analyser || !audioData || !micEnabled) {
      return;
    }

    const level = currentVolumeLevel();
    const now = Date.now();

    if (level > 0.15) {
      blowFrames += 1;
      if (blowFrames >= 3 && now > blowCooldownUntil) {
        const nextCandle = getNextUnblown();
        if (nextCandle) {
          blowCandle(nextCandle);
          micStatus.textContent = "Blow detected. Nice one!";
        }
        blowCooldownUntil = now + 800;
        blowFrames = 0;
      }
    } else {
      blowFrames = Math.max(0, blowFrames - 1);
    }

    micRafId = requestAnimationFrame(listenForBlow);
  }

  async function enableMic() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      micStatus.textContent = "Microphone API is not supported in this browser.";
      return;
    }

    try {
      micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(micStream);
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
      audioData = new Uint8Array(analyser.fftSize);
      micEnabled = true;
      blowFrames = 0;
      blowCooldownUntil = 0;

      toggleMicButton.textContent = "Disable Blow Detection";
      toggleMicButton.classList.add("is-live");
      micStatus.textContent = "Microphone live. Blow near your mic to put out candles.";
      listenForBlow();
    } catch (error) {
      micStatus.textContent = "Mic permission denied. You can still click candles manually.";
    }
  }

  async function disableMic() {
    micEnabled = false;
    if (micRafId) {
      cancelAnimationFrame(micRafId);
      micRafId = null;
    }

    if (micStream) {
      micStream.getTracks().forEach((track) => track.stop());
      micStream = null;
    }

    if (audioContext && audioContext.state !== "closed") {
      await audioContext.close();
    }
    audioContext = null;
    analyser = null;
    audioData = null;

    toggleMicButton.textContent = "Enable Blow Detection";
    toggleMicButton.classList.remove("is-live");
    micStatus.textContent = "Allow microphone access, then blow near your mic to extinguish candles.";
  }

  candles.forEach((candle) => {
    candle.addEventListener("click", () => blowCandle(candle));
    candle.addEventListener("touchstart", () => blowCandle(candle), { passive: true });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key.toLowerCase() !== "b") {
      return;
    }
    const nextUnblown = getNextUnblown();
    if (nextUnblown) {
      blowCandle(nextUnblown);
    }
  });

  toggleMicButton.addEventListener("click", async () => {
    if (micEnabled) {
      await disableMic();
      return;
    }
    await enableMic();
  });

  closeWishButton.addEventListener("click", () => {
    wishModal.classList.remove("show");
    wishModal.setAttribute("aria-hidden", "true");
  });

  backMemoriesButton.addEventListener("click", async () => {
    await disableMic();
    navigate("memory-lane.html");
  });
  nextLetterButton.addEventListener("click", async () => {
    await disableMic();
    navigate("letter.html");
  });

  window.addEventListener("beforeunload", () => {
    if (micEnabled) {
      disableMic();
    }
  });

  updateHint();
});
