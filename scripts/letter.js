const letterText = `Dear Birthday Star,

Another year, another reminder of how lucky people are to know you.
You bring warmth into rooms, calm into chaos, and joy into ordinary days.

Thank you for the laughs, the patience, and the way you show up for everyone
without making a big deal about it. You make life feel lighter.

I hope this year gives back to you:
- more peace,
- bigger wins,
- and moments that feel exactly like home.

Happy Birthday. You deserve the kind of happiness that keeps surprising you.

With love,
Someone who is very grateful for you`;

const playlist = [
  { title: "Midnight Smile", note: "For your calm and bright energy" },
  { title: "Golden Hour", note: "For all our sunset memories" },
  { title: "Long Drive Loops", note: "For every road trip playlist" },
  { title: "Soft Rain Session", note: "For peaceful rainy afternoons" },
  { title: "Birthday Theme", note: "For today, obviously" }
];

document.addEventListener("DOMContentLoaded", () => {
  const { burstConfetti, createFloatingLayer, navigate } = window.BirthdayApp;
  createFloatingLayer({
    count: 28,
    symbols: ["&#10084;", "&#10024;", "&#9679;"],
    colors: ["#ff8a72", "#ffd166", "#9adbc4", "#f2acd6"]
  });

  const typedLetter = document.getElementById("typedLetter");
  const openFinalButton = document.getElementById("openFinal");
  const finalModal = document.getElementById("finalModal");
  const closeFinalButton = document.getElementById("closeFinal");
  const playlistList = document.getElementById("playlist");
  const backCakeButton = document.getElementById("backCake");
  const restartButton = document.getElementById("restart");

  function writeLetter(text, speed) {
    let index = 0;
    const timer = window.setInterval(() => {
      typedLetter.textContent += text[index];
      index += 1;

      if (index >= text.length) {
        window.clearInterval(timer);
        openFinalButton.disabled = false;
        openFinalButton.textContent = "Open Final Surprise";
        burstConfetti({ count: 65, x: 50, y: 35 });
      }
    }, speed);
  }

  function renderPlaylist() {
    playlistList.innerHTML = "";
    playlist.forEach((track, trackIndex) => {
      const item = document.createElement("li");
      item.className = "playlist-item";
      item.innerHTML = `
        <span class="playlist-number">${trackIndex + 1}</span>
        <div>
          <p class="playlist-title">${track.title}</p>
          <p class="playlist-note">${track.note}</p>
        </div>
        <span class="playlist-pill">Dedicate</span>
      `;
      playlistList.appendChild(item);
    });
  }

  openFinalButton.addEventListener("click", () => {
    finalModal.classList.add("show");
    finalModal.setAttribute("aria-hidden", "false");
    burstConfetti({ count: 120, x: 50, y: 52 });
  });

  closeFinalButton.addEventListener("click", () => {
    finalModal.classList.remove("show");
    finalModal.setAttribute("aria-hidden", "true");
  });

  backCakeButton.addEventListener("click", () => navigate("cake.html"));
  restartButton.addEventListener("click", () => navigate("index.html"));

  renderPlaylist();
  writeLetter(letterText, 22);
});
