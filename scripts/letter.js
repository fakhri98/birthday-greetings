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

function drawContainImage(ctx, imageCanvas, x, y, width, height) {
  const scale = Math.min(width / imageCanvas.width, height / imageCanvas.height);
  const drawWidth = imageCanvas.width * scale;
  const drawHeight = imageCanvas.height * scale;
  const drawX = x + (width - drawWidth) / 2;
  const drawY = y + (height - drawHeight) / 2;

  ctx.fillStyle = "#f8f4ee";
  ctx.fillRect(x, y, width, height);
  ctx.drawImage(imageCanvas, drawX, drawY, drawWidth, drawHeight);
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
  const capturePolaroidButton = document.getElementById("capturePolaroid");
  const downloadPolaroidLink = document.getElementById("downloadPolaroid");
  const polaroidStatus = document.getElementById("polaroidStatus");
  const polaroidPreview = document.getElementById("polaroidPreview");
  const polaroidImage = document.getElementById("polaroidImage");
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

  async function capturePolaroid() {
    if (typeof window.html2canvas !== "function") {
      polaroidStatus.textContent = "Polaroid capture unavailable: screenshot library failed to load.";
      return;
    }

    polaroidStatus.textContent = "Capturing your polaroid...";
    capturePolaroidButton.disabled = true;

    try {
      const target = finalModal.classList.contains("show")
        ? finalModal.querySelector(".final-card")
        : document.querySelector("main.page-shell");

      const shot = await window.html2canvas(target, {
        backgroundColor: "#fff8f2",
        scale: 2,
        useCORS: true,
        onclone: (doc) => {
          const clonedCard = doc.querySelector(".final-card");
          if (clonedCard) {
            clonedCard.style.maxHeight = "none";
            clonedCard.style.overflow = "visible";
            clonedCard.style.height = "auto";
            clonedCard.scrollTop = 0;
          }

          const clonedPreview = doc.getElementById("polaroidPreview");
          if (clonedPreview) {
            clonedPreview.style.display = "none";
          }
        }
      });

      const polaroidCanvas = document.createElement("canvas");
      polaroidCanvas.width = 1080;
      polaroidCanvas.height = 1320;
      const ctx = polaroidCanvas.getContext("2d");

      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, polaroidCanvas.width, polaroidCanvas.height);

      ctx.fillStyle = "#f9f6ef";
      ctx.fillRect(65, 65, 950, 900);
      drawContainImage(ctx, shot, 90, 90, 900, 850);

      ctx.fillStyle = "#5c3945";
      ctx.font = "700 44px Fraunces, Georgia, serif";
      ctx.fillText(`${recipientName}'s Night`, 90, 1065);
      ctx.font = "600 32px Nunito, Arial, sans-serif";
      const dateLabel = new Date().toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric"
      });
      ctx.fillText(dateLabel, 90, 1110);

      ctx.fillStyle = "rgba(255, 133, 112, 0.16)";
      ctx.beginPath();
      ctx.arc(980, 1180, 130, 0, Math.PI * 2);
      ctx.fill();

      const dataUrl = polaroidCanvas.toDataURL("image/png");
      polaroidImage.src = dataUrl;
      polaroidPreview.classList.remove("hidden");
      downloadPolaroidLink.href = dataUrl;
      downloadPolaroidLink.download = `${createFileSlug(recipientName)}-polaroid.png`;
      downloadPolaroidLink.classList.remove("hidden");
      polaroidStatus.textContent = "Polaroid ready. Download it below.";
      burstConfetti({ count: 70, x: 65, y: 60 });
    } catch (error) {
      polaroidStatus.textContent = "Could not capture screenshot. Try again after opening final modal.";
    } finally {
      capturePolaroidButton.disabled = false;
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

  capturePolaroidButton.addEventListener("click", capturePolaroid);

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
