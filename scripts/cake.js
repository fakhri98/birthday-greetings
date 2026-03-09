document.addEventListener("DOMContentLoaded", () => {
  const { burstConfetti, createFloatingLayer, navigate } = window.BirthdayApp;

  createFloatingLayer({
    count: 24,
    symbols: ["&#10024;", "&#9679;", "&#9675;"],
    colors: ["#ffd166", "#ff9f68", "#9adbc4", "#f4b6de"],
    minSize: 10,
    maxSize: 22
  });

  const candles = Array.from(document.querySelectorAll(".candle"));
  const hint = document.getElementById("cakeHint");
  const wishModal = document.getElementById("wishModal");
  const closeWishButton = document.getElementById("closeWish");
  const backMemoriesButton = document.getElementById("backMemories");
  const nextLetterButton = document.getElementById("nextLetter");

  let blownCount = 0;
  let modalShown = false;

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

  candles.forEach((candle) => {
    candle.addEventListener("click", () => blowCandle(candle));
    candle.addEventListener("touchstart", () => blowCandle(candle), { passive: true });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key.toLowerCase() !== "b") {
      return;
    }
    const nextUnblown = candles.find((candle) => !candle.classList.contains("blown"));
    if (nextUnblown) {
      blowCandle(nextUnblown);
    }
  });

  closeWishButton.addEventListener("click", () => {
    wishModal.classList.remove("show");
    wishModal.setAttribute("aria-hidden", "true");
  });

  backMemoriesButton.addEventListener("click", () => navigate("memory-lane.html"));
  nextLetterButton.addEventListener("click", () => navigate("letter.html"));

  updateHint();
});
