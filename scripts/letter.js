const playlist = [
  { title: "Midnight Smile", note: "For your calm and bright energy" },
  { title: "Golden Hour", note: "For all our sunset memories" },
  { title: "Long Drive Loops", note: "For every road trip playlist" },
  { title: "Soft Rain Session", note: "For peaceful rainy afternoons" },
  { title: "Birthday Theme", note: "For today, obviously" }
];

function buildLetterText(name) {
  return `Dear ${name},

Another year, another reminder of how lucky people are to know you.
You bring warmth into rooms, calm into chaos, and joy into ordinary days.

Thank you for the laughs, the patience, and the way you show up for everyone
without making a big deal about it. You make life feel lighter.

I hope this year gives back to you:
- more peace,
- bigger wins,
- and moments that feel exactly like home.

Happy Birthday, ${name}. You deserve the kind of happiness that keeps surprising you.

With love,
Someone who is very grateful for you`;
}

function wrapParagraph(ctx, paragraph, maxWidth) {
  if (!paragraph) {
    return [""];
  }

  const words = paragraph.split(" ");
  const lines = [];
  let line = words[0];

  for (let i = 1; i < words.length; i += 1) {
    const candidate = `${line} ${words[i]}`;
    if (ctx.measureText(candidate).width <= maxWidth) {
      line = candidate;
    } else {
      lines.push(line);
      line = words[i];
    }
  }
  lines.push(line);
  return lines;
}

function wrapMultilineText(ctx, text, maxWidth) {
  const paragraphs = text.split("\n");
  const result = [];
  paragraphs.forEach((paragraph, index) => {
    result.push(...wrapParagraph(ctx, paragraph, maxWidth));
    if (index < paragraphs.length - 1) {
      result.push("");
    }
  });
  return result;
}

document.addEventListener("DOMContentLoaded", () => {
  const {
    burstConfetti,
    createFileSlug,
    createFloatingLayer,
    getRecipientName,
    navigate
  } = window.BirthdayApp;
  const recipientName = getRecipientName("Birthday Star");
  const letterText = buildLetterText(recipientName);

  createFloatingLayer({
    count: 28,
    symbols: ["&#10084;", "&#10024;", "&#9679;"],
    colors: ["#ff8a72", "#ffd166", "#9adbc4", "#f2acd6"]
  });

  const heading = document.getElementById("letterHeading");
  const typedLetter = document.getElementById("typedLetter");
  const openFinalButton = document.getElementById("openFinal");
  const downloadKeepsakeButton = document.getElementById("downloadKeepsake");
  const keepsakeStatus = document.getElementById("keepsakeStatus");
  const finalModal = document.getElementById("finalModal");
  const finalTitle = document.getElementById("finalTitle");
  const closeFinalButton = document.getElementById("closeFinal");
  const playlistList = document.getElementById("playlist");
  const backCakeButton = document.getElementById("backCake");
  const restartButton = document.getElementById("restart");

  heading.textContent = `A Note Just For ${recipientName}`;
  finalTitle.textContent = `${recipientName}'s Playlist Gift`;

  function writeLetter(text, speed) {
    let index = 0;
    const timer = window.setInterval(() => {
      typedLetter.textContent += text[index];
      index += 1;

      if (index >= text.length) {
        window.clearInterval(timer);
        openFinalButton.disabled = false;
        downloadKeepsakeButton.disabled = false;
        openFinalButton.textContent = "Open Final Surprise";
        keepsakeStatus.textContent = "Letter complete. You can now download a keepsake image.";
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

  function buildKeepsakeCanvas() {
    const canvas = document.createElement("canvas");
    canvas.width = 1400;
    canvas.height = 1800;
    const ctx = canvas.getContext("2d");

    const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bg.addColorStop(0, "#fff5ef");
    bg.addColorStop(0.5, "#ffe9f2");
    bg.addColorStop(1, "#effff6");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "rgba(255, 140, 110, 0.24)";
    ctx.beginPath();
    ctx.arc(1180, 180, 170, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(141, 217, 183, 0.24)";
    ctx.beginPath();
    ctx.arc(220, 1600, 210, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#5a2f39";
    ctx.font = "700 74px Fraunces, Georgia, serif";
    ctx.fillText(`Happy Birthday, ${recipientName}`, 110, 170);

    const dateLabel = new Date().toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
    ctx.font = "600 32px Nunito, Arial, sans-serif";
    ctx.fillStyle = "#7f555f";
    ctx.fillText(dateLabel, 110, 225);

    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.fillRect(90, 270, 1220, 1330);
    ctx.strokeStyle = "rgba(255, 165, 145, 0.5)";
    ctx.lineWidth = 3;
    ctx.strokeRect(90, 270, 1220, 1330);

    ctx.font = "600 38px Nunito, Arial, sans-serif";
    ctx.fillStyle = "#4f3640";

    const maxWidth = 1120;
    const lines = wrapMultilineText(ctx, typedLetter.textContent, maxWidth);
    let y = 350;
    const lineHeight = 52;
    lines.forEach((line) => {
      if (line) {
        ctx.fillText(line, 140, y);
      }
      y += lineHeight;
    });

    ctx.font = "700 30px Nunito, Arial, sans-serif";
    ctx.fillStyle = "#7f555f";
    ctx.fillText("Made with love", 140, 1680);

    return canvas;
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

  downloadKeepsakeButton.addEventListener("click", () => {
    const canvas = buildKeepsakeCanvas();
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `${createFileSlug(recipientName)}-birthday-keepsake.png`;
    link.click();
    keepsakeStatus.textContent = "Keepsake downloaded. You can send it to her.";
  });

  backCakeButton.addEventListener("click", () => navigate("cake.html"));
  restartButton.addEventListener("click", () => navigate("index.html"));

  renderPlaylist();
  writeLetter(letterText, 22);
});
