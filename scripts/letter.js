const playlist = [
  { title: "Daylight by Taylor Swift", note: "For your calm and bright energy" },
  { title: "Invisible String by Taylor Swift", note: "For the connection that brought us together" },
  // { title: "you! by LANY", note: "For every road trip playlist" },
  { title: "free love by HONNE", note: "For the love that sets us free" },
  { title: "Penjaga Hati by Nadhif Basalamah", note: "For the protector of my heart" }
];

function buildLetterText(name) {
  return `Dear ${name},

Happy Birthday! Another year has gone by, and it’s honestly just another reminder of how lucky I am to have you. I love how you bring so much warmth into a room and make even the most "ordinary" days feel special.

Looking back, it’s so cool to think about the "invisible string" that brought us together. Thank you for all the laughs, your endless patience, and for just being you. You make my life feel so much lighter.

As we step into this new year, my heart is so full thinking about the big moments ahead of us. With our wedding on the horizon, I am endlessly grateful that fate pulled us together. My deepest prayer is that this golden thread keeps us tightly woven together, hand in hand through this life, and all the way to Jannah.

I hope this year brings you:
- Amazing surprises as we get ready for our big day,
- Gold moments that turn into the best memories,
- And a sense of peace that feels like home.

You deserve the kind of happiness that never ends.

Happy Birthday, ${name}. You deserve the kind of happiness that keeps surprising you.

With all my love,

The one so glad that string pulled me to you`;
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
  paragraphs.forEach((paragraph) => {
    if (paragraph.trim() === "") {
      result.push("");
      return;
    }
    result.push(...wrapParagraph(ctx, paragraph, maxWidth));
  });
  while (result.length > 0 && result[result.length - 1] === "") {
    result.pop();
  }
  return result;
}

document.addEventListener("DOMContentLoaded", () => {
  const {
    burstConfetti,
    createFileSlug,
    createFloatingLayer,
    getRecipientName,
    initEasterEggs,
    navigate,
    pauseMusicForVoiceNote,
    resumeMusicAfterVoiceNote,
    resetEasterEggProgress
  } = window.BirthdayApp;
  const recipientName = getRecipientName("Birthday Star");
  const letterText = buildLetterText(recipientName);

  createFloatingLayer({
    count: 28,
    symbols: ["&#10084;", "&#10024;", "&#9679;"],
    colors: ["#ff8a72", "#ffd166", "#9adbc4", "#f2acd6"]
  });

  initEasterEggs({
    count: 4,
    scope: "story",
    globalTotal: 14,
    symbols: ["\u2605", "\u2665"],
    messages: [
      "Easter egg: You are still the best chapter in my story.",
      "Easter egg: This page exists because you are worth the effort.",
      "Easter egg: I replay our funniest moments way too often.",
      `Easter egg: ${recipientName}, thank you for being you.`
    ]
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
  const finalVideoFeature = document.getElementById("finalVideoFeature");
  const playFinalVideoButton = document.getElementById("playFinalVideo");
  const finalMomentVideo = document.getElementById("finalMomentVideo");
  const finalVideoStatus = document.getElementById("finalVideoStatus");
  const finalVideoChapterChips = Array.from(
    finalVideoFeature ? finalVideoFeature.querySelectorAll(".chapter-chip") : []
  );
  const backCakeButton = document.getElementById("backCake");
  const restartButton = document.getElementById("restart");
  const endingButtons = Array.from(document.querySelectorAll(".ending-btn"));
  const endingMessage = document.getElementById("endingMessage");
  let pausedMusicForFinalVideo = false;

  const endingMessages = {
    romantic: `${recipientName}, every little thing feels better with you in my life.`,
    funny: `Final verdict: ${recipientName}, you are 73% chaos, 27% sweetness, and 100% my favorite person.`,
    nostalgic: `From old memories to new adventures, ${recipientName}, I would choose this story with you every time.`
  };

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
    const width = 1400;
    const minHeight = 1800;
    const cardX = 90;
    const cardY = 270;
    const cardWidth = 1220;
    const textX = 140;
    const textStartY = 350;
    const lineHeight = 52;
    const cardBottomPadding = 96;
    const footerGap = 74;
    const footerBottomPadding = 92;

    const measureCanvas = document.createElement("canvas");
    const measureCtx = measureCanvas.getContext("2d");
    measureCtx.font = "600 38px Nunito, Arial, sans-serif";
    const maxWidth = 1120;
    const lines = wrapMultilineText(measureCtx, typedLetter.textContent, maxWidth);
    const textHeight = Math.max(1, lines.length) * lineHeight;
    const neededCardHeight = Math.max(1330, textStartY - cardY + textHeight + cardBottomPadding);
    const footerY = cardY + neededCardHeight + footerGap;
    const height = Math.max(minHeight, footerY + footerBottomPadding);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
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
    ctx.arc(220, canvas.height - 200, 210, 0, Math.PI * 2);
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
    ctx.fillRect(cardX, cardY, cardWidth, neededCardHeight);
    ctx.strokeStyle = "rgba(255, 165, 145, 0.5)";
    ctx.lineWidth = 3;
    ctx.strokeRect(cardX, cardY, cardWidth, neededCardHeight);

    ctx.font = "600 38px Nunito, Arial, sans-serif";
    ctx.fillStyle = "#4f3640";
    let y = textStartY;
    lines.forEach((line) => {
      if (line) {
        ctx.fillText(line, textX, y);
      }
      y += lineHeight;
    });

    ctx.font = "700 30px Nunito, Arial, sans-serif";
    ctx.fillStyle = "#7f555f";
    ctx.fillText("Made with love", textX, footerY);

    return canvas;
  }

  function setEnding(type) {
    endingButtons.forEach((button) => {
      button.classList.toggle("is-selected", button.dataset.ending === type);
    });
    endingMessage.textContent = endingMessages[type] || "Pick one to reveal your custom ending message.";
    burstConfetti({ count: 30, x: 62, y: 55 });
  }

  function setFinalVideoStatus(text) {
    if (finalVideoStatus) {
      finalVideoStatus.textContent = text;
    }
  }

  function pauseMusicForFinalVideoIfNeeded() {
    if (!pausedMusicForFinalVideo) {
      pausedMusicForFinalVideo = pauseMusicForVoiceNote();
    }
  }

  function resumeMusicForFinalVideoIfNeeded() {
    if (pausedMusicForFinalVideo) {
      resumeMusicAfterVoiceNote();
      pausedMusicForFinalVideo = false;
    }
  }

  function stopFinalVideo() {
    if (!finalMomentVideo) {
      return;
    }
    if (!finalMomentVideo.paused) {
      finalMomentVideo.pause();
    }
    resumeMusicForFinalVideoIfNeeded();
  }

  function playFinalVideo(startTime) {
    if (!finalMomentVideo || !finalVideoFeature) {
      return;
    }
    finalVideoFeature.classList.add("is-playing");
    if (Number.isFinite(startTime) && startTime >= 0) {
      finalMomentVideo.currentTime = startTime;
    }
    pauseMusicForFinalVideoIfNeeded();
    const attempt = finalMomentVideo.play();
    if (attempt && typeof attempt.catch === "function") {
      attempt.catch(() => {
        setFinalVideoStatus("Tap play again to start your story reel.");
      });
    }
  }

  openFinalButton.addEventListener("click", () => {
    finalModal.classList.add("show");
    finalModal.setAttribute("aria-hidden", "false");
    setFinalVideoStatus("Press play for the romantic finale.");
    burstConfetti({ count: 120, x: 50, y: 52 });
  });

  closeFinalButton.addEventListener("click", () => {
    stopFinalVideo();
    if (finalVideoFeature) {
      finalVideoFeature.classList.remove("is-playing");
    }
    finalModal.classList.remove("show");
    finalModal.setAttribute("aria-hidden", "true");
  });

  endingButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setEnding(button.dataset.ending);
    });
  });

  if (playFinalVideoButton) {
    playFinalVideoButton.addEventListener("click", () => {
      playFinalVideo();
    });
  }

  finalVideoChapterChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const startTime = Number(chip.dataset.time || "0");
      playFinalVideo(startTime);
    });
  });

  if (finalMomentVideo) {
    finalMomentVideo.addEventListener("play", () => {
      pauseMusicForFinalVideoIfNeeded();
      setFinalVideoStatus("Playing your story reel.");
    });

    finalMomentVideo.addEventListener("pause", () => {
      resumeMusicForFinalVideoIfNeeded();
      if (!finalMomentVideo.ended) {
        setFinalVideoStatus("Video paused. Press play to continue.");
      }
    });

    finalMomentVideo.addEventListener("ended", () => {
      resumeMusicForFinalVideoIfNeeded();
      setFinalVideoStatus("That was beautiful. Replay anytime.");
      burstConfetti({ count: 140, x: 52, y: 48 });
    });

    finalMomentVideo.addEventListener("error", () => {
      setFinalVideoStatus("Video file not found yet. Add assets/videos/best-moments-romantic.mp4");
    });
  }

  downloadKeepsakeButton.addEventListener("click", () => {
    const canvas = buildKeepsakeCanvas();
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `${createFileSlug(recipientName)}-birthday-keepsake.png`;
    link.click();
    keepsakeStatus.textContent = "Keepsake downloaded. You can send it to her.";
  });

  backCakeButton.addEventListener("click", () => {
    stopFinalVideo();
    navigate("cake.html");
  });
  restartButton.addEventListener("click", () => {
    stopFinalVideo();
    resetEasterEggProgress("story");
    navigate("index.html");
  });

  window.addEventListener("beforeunload", stopFinalVideo);

  renderPlaylist();
  writeLetter(letterText, 22);
});
