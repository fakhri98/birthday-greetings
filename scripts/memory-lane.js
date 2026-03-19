const memories = [
  {
    title: "Graduation Day",
    caption: "Finally you did it, and I couldn't be prouder.",
    voiceNote: "{name}, this one is your big moment, after all those years of hard work.",
    image: "assets/memories/memory-1.jpg"
  },
  {
    title: "Photoshoot at Library",
    caption: "The place where we getting to know each other better.",
    voiceNote: "I still remember how happy you were that day, even though the photographer is not satisfied enough.",
    image: "assets/memories/memory-2.jpg"
  },
  {
    title: "Sushi Time!",
    caption: "Creating our own sushi rolls for the first time was a hilarious mess.",
    voiceNote: "{name}, we should absolutely do another sushi-making adventure.",
    image: "assets/memories/memory-3.jpg"
  },
  {
    title: "Library Date",
    caption: "This place and that spot is very special to us, isn't it?",
    voiceNote: "This photo taken after I asked that special question right? haha.",
    image: "assets/memories/memory-4.jpg"
  },
  {
    title: "Trunk Moment",
    caption: "This quiet moment in the park trunk was one of my favorites.",
    voiceNote: "{name}, I love how we can find magic in the simplest moments together.",
    image: "assets/memories/memory-5.jpg"
  },
  {
    title: "Memorable Moment",
    caption: "This moment will forever be etched in my heart when our parents are meeting.",
    voiceNote: "{name}, This was a big step for us, and you handled it with so much grace and warmth.",
    image: "assets/memories/memory-6.jpg"
  },
  {
    title: "First Date",
    caption: "This place was our first date spot, and it will always be special to me.",
    voiceNote: "{name}, I'm so glad we took that first step together.",
    image: "assets/memories/memory-7.jpg"
  },
  {
    title: "Today",
    caption: "Another year of you, and that is the best gift.",
    voiceNote: "Happy birthday, {name}. You mean more than words can say.",
    image: "assets/memories/memory-8.jpg"
  }
];

const quizQuestions = [
  {
    question: "What place we went to for our first date?",
    options: ["Kedai Kita Sentul", "PIM Mall", "Margo City Mall"],
    answerIndex: 1,
    success: "Correct. Unlock 1: confetti burst activated."
  },
  {
    question: "What food did we eat during our first meeting?",
    options: ["Cake The Harvest", "Bubur Ayam", "Pho"],
    answerIndex: 1,
    success: "Correct. Unlock 2: dreamy aurora overlay activated."
  },
  {
    question: "What is the date our parents met?",
    options: ["17th January 2026", "11th January 2026", "18th January 2026"],
    answerIndex: 2,
    success: "Correct. Unlock 3: grand celebration mode activated."
  }
];

const FUN_VIDEO_UNLOCK_COUNT = 3;
const dumpPhotos = [
  { src: "assets/memories/photo-dump-1.jpeg" },
  { src: "assets/memories/photo-dump-2.jpeg" },
  { src: "assets/memories/photo-dump-3.jpeg" },
  { src: "assets/memories/photo-dump-4.jpeg" },
  { src: "assets/memories/photo-dump-5.jpeg" }
];
const DUMP_SLOTS = [
  { x: 18, y: 24, r: -11 },
  { x: 44, y: 18, r: 7 },
  { x: 72, y: 26, r: -6 },
  { x: 30, y: 56, r: 9 },
  { x: 60, y: 58, r: -8 }
];

document.addEventListener("DOMContentLoaded", () => {
  const {
    burstConfetti,
    createFloatingLayer,
    getRecipientName,
    initEasterEggs,
    navigate,
    pauseMusicForVoiceNote,
    resumeMusicAfterVoiceNote
  } = window.BirthdayApp;
  const recipientName = getRecipientName("Birthday Star");

  createFloatingLayer({
    count: 34,
    symbols: ["&#10084;", "&#10024;", "&#9679;", "&#9675;"],
    colors: ["#ff7f66", "#ffca7a", "#8dd9b7", "#e6abdc"]
  });

  initEasterEggs({
    count: 4,
    scope: "story",
    globalTotal: 14,
    symbols: ["\u2665", "\u2605"],
    messages: [
      "Secret 1: You looked amazing in that beautiful graduation dress.",
      "Secret 2: Cafe Story still makes me laugh randomly.",
      "Secret 3: Road trip playlist was perfect because of you.",
      `Secret 4: ${recipientName}, you are my favorite memory in every timeline.`
    ]
  });

  const heading = document.getElementById("memoryHeading");
  const track = document.getElementById("memoryTrack");
  const voiceStatus = document.getElementById("voiceStatus");
  const autoPlayButton = document.getElementById("autoPlay");
  const pausePlayButton = document.getElementById("pausePlay");
  const prevMemoryButton = document.getElementById("prevMemory");
  const nextMemoryButton = document.getElementById("nextMemory");
  const backHomeButton = document.getElementById("backHome");
  const nextSceneButton = document.getElementById("nextScene");
  const quizList = document.getElementById("quizList");
  const quizProgress = document.getElementById("quizProgress");
  const funVideoMoment = document.getElementById("funVideoMoment");
  const funVideoUnlockHint = document.getElementById("funVideoUnlockHint");
  const playFunVideoButton = document.getElementById("playFunVideo");
  const funMomentVideo = document.getElementById("funMomentVideo");
  const chapterChips = Array.from(document.querySelectorAll(".chapter-chip"));
  const dumpStage = document.getElementById("dumpStage");
  const dumpStatus = document.getElementById("dumpStatus");
  const shuffleDumpButton = document.getElementById("shuffleDump");

  heading.textContent = `Memory Lane for ${recipientName}`;

  let currentIndex = 0;
  let intervalId = null;
  let trackSyncRafId = null;
  let activeVoiceButton = null;
  let pausedMusicForVoice = false;
  let pausedMusicForFunVideo = false;
  let funVideoUnlocked = false;
  let dumpCards = [];
  let unlockedEffects = 0;
  const solvedQuestions = new Set();
  const viewedMemoryIndexes = new Set();

  function withName(text) {
    return text.replaceAll("{name}", recipientName);
  }

  function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
  }

  function setDumpStatus(text) {
    if (dumpStatus) {
      dumpStatus.textContent = text;
    }
  }

  function layoutDumpCards() {
    if (!dumpCards.length) {
      return;
    }

    const slots = DUMP_SLOTS.slice().sort(() => Math.random() - 0.5);
    dumpCards.forEach((card, index) => {
      const slot = slots[index % slots.length];
      const x = Math.max(14, Math.min(84, slot.x + randomBetween(-4.5, 4.5)));
      const y = Math.max(20, Math.min(78, slot.y + randomBetween(-5, 5)));
      const rotation = slot.r + randomBetween(-3.5, 3.5);
      card.style.left = `${x}%`;
      card.style.top = `${y}%`;
      card.style.setProperty("--dump-rotation", `${rotation}deg`);
      card.style.zIndex = String(index + 2);
      card.classList.remove("is-focus");
    });
  }

  function focusDumpCard(index) {
    if (!dumpCards.length || index < 0 || index >= dumpCards.length) {
      return;
    }

    dumpCards.forEach((card, cardIndex) => {
      const isFocused = cardIndex === index;
      card.classList.toggle("is-focus", isFocused);
      if (isFocused) {
        card.style.zIndex = "80";
      } else {
        card.style.zIndex = String(cardIndex + 2);
      }
    });

    setDumpStatus(`Spotlight on photo ${index + 1}.`);
  }

  function renderDumpWall() {
    if (!dumpStage) {
      return;
    }

    const source = dumpPhotos.slice(0, 5);
    dumpStage.innerHTML = "";
    dumpCards = [];

    source.forEach((photo, index) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "dump-card";
      card.setAttribute("aria-label", `Dump photo ${index + 1}`);
      card.innerHTML = `
        <img class="dump-card-image" src="${photo.src}" alt="Photo dump ${index + 1}">
      `;

      const image = card.querySelector(".dump-card-image");
      if (image) {
        image.addEventListener("error", () => {
          card.classList.add("is-missing");
          setDumpStatus("One dump photo is missing. Check your file names in assets/memories.");
        });
      }

      card.addEventListener("click", () => {
        focusDumpCard(index);
        burstConfetti({ count: 24, x: 48 + Math.random() * 12, y: 58 + Math.random() * 12 });
      });

      dumpCards.push(card);
      dumpStage.appendChild(card);
    });

    layoutDumpCards();
    setDumpStatus(`Loaded ${dumpCards.length} dump photos. Tap one to spotlight.`);
  }

  memories.forEach((memory, index) => {
    const card = document.createElement("article");
    card.className = "memory-card";
    card.dataset.index = String(index);
    card.innerHTML = `
      <div class="memory-image-wrap">
        <img class="memory-image" src="${memory.image}" alt="${memory.title}">
      </div>
      <div class="memory-body">
        <h3 class="memory-title">${memory.title}</h3>
        <p class="memory-caption">${withName(memory.caption)}</p>
        <div class="memory-actions">
          <button class="btn secondary voice-note-btn" type="button">Play Voice Note</button>
        </div>
      </div>
    `;
    track.appendChild(card);
  });

  const cards = Array.from(track.querySelectorAll(".memory-card"));
  const voiceButtons = Array.from(track.querySelectorAll(".voice-note-btn"));

  if (!("speechSynthesis" in window)) {
    voiceStatus.textContent = "Voice notes are not supported in this browser.";
    voiceButtons.forEach((button) => {
      button.disabled = true;
      button.textContent = "Voice Note Unavailable";
    });
  }

  function pauseMusicForVideo() {
    if (!pausedMusicForFunVideo) {
      pausedMusicForFunVideo = pauseMusicForVoiceNote();
    }
  }

  function resumeMusicForVideo() {
    if (pausedMusicForFunVideo) {
      resumeMusicAfterVoiceNote();
      pausedMusicForFunVideo = false;
    }
  }

  function stopFunVideo() {
    if (!funMomentVideo) {
      return;
    }
    if (!funMomentVideo.paused) {
      funMomentVideo.pause();
    }
    resumeMusicForVideo();
  }

  function setFunVideoHint(text) {
    if (funVideoUnlockHint) {
      funVideoUnlockHint.textContent = text;
    }
  }

  function updateFunVideoUnlock() {
    if (!funVideoMoment || !playFunVideoButton) {
      return;
    }

    const viewedCount = viewedMemoryIndexes.size;
    if (!funVideoUnlocked && viewedCount >= FUN_VIDEO_UNLOCK_COUNT) {
      funVideoUnlocked = true;
      funVideoMoment.classList.remove("is-locked");
      funVideoMoment.classList.add("is-unlocked");
      playFunVideoButton.disabled = false;
      const coverTag = playFunVideoButton.querySelector(".video-cover-tag");
      if (coverTag) {
        coverTag.textContent = "Unlocked";
      }
      setFunVideoHint("Unlocked. Press play and enjoy your fun moments reel.");
      burstConfetti({ count: 90, x: 50, y: 48 });
      return;
    }

    if (!funVideoUnlocked) {
      const safeViewedCount = Math.min(FUN_VIDEO_UNLOCK_COUNT, viewedCount);
      const remaining = Math.max(0, FUN_VIDEO_UNLOCK_COUNT - viewedCount);
      const memoryLabel = remaining === 1 ? "memory" : "memories";
      setFunVideoHint(`Mini reel unlock progress: ${safeViewedCount}/${FUN_VIDEO_UNLOCK_COUNT}. Browse ${remaining} more ${memoryLabel}.`);
    }
  }

  function playFunVideo(startTime) {
    if (!funVideoUnlocked || !funMomentVideo || !funVideoMoment) {
      setFunVideoHint(`Browse at least ${FUN_VIDEO_UNLOCK_COUNT} memory cards to unlock this mini reel.`);
      return;
    }

    stopVoiceNote();
    pauseSlideshow();
    funVideoMoment.classList.add("is-playing");

    if (Number.isFinite(startTime) && startTime >= 0) {
      funMomentVideo.currentTime = startTime;
    }

    pauseMusicForVideo();
    const attempt = funMomentVideo.play();
    if (attempt && typeof attempt.catch === "function") {
      attempt.catch(() => {
        setFunVideoHint("Tap play again to start the video.");
      });
    }
  }

  function updateActiveCard(index) {
    currentIndex = (index + cards.length) % cards.length;
    cards.forEach((card, cardIndex) => {
      card.classList.toggle("is-active", cardIndex === currentIndex);
    });
    viewedMemoryIndexes.add(currentIndex);
    updateFunVideoUnlock();
  }

  function scrollToCard(index) {
    updateActiveCard(index);
    const target = cards[currentIndex];
    const leftPosition = target.offsetLeft - (track.clientWidth - target.clientWidth) / 2;
    const clampedLeft = Math.max(0, leftPosition);

    if (typeof track.scrollTo === "function") {
      try {
        track.scrollTo({ left: clampedLeft, behavior: "smooth" });
        return;
      } catch (error) {
        // Fallback for browsers that don't support ScrollToOptions on elements.
      }
    }

    track.scrollLeft = clampedLeft;
  }

  function getClosestCardIndexFromScroll() {
    const trackCenter = track.scrollLeft + track.clientWidth / 2;
    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    cards.forEach((card, index) => {
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const distance = Math.abs(cardCenter - trackCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    return closestIndex;
  }

  function syncActiveCardFromTrackScroll() {
    if (!cards.length) {
      return;
    }
    updateActiveCard(getClosestCardIndexFromScroll());
  }

  function startSlideshow() {
    if (intervalId || cards.length <= 1) {
      return;
    }

    autoPlayButton.classList.add("hidden");
    pausePlayButton.classList.remove("hidden");
    scrollToCard(currentIndex + 1);
    intervalId = window.setInterval(() => {
      scrollToCard(currentIndex + 1);
    }, 2200);
  }

  function pauseSlideshow() {
    autoPlayButton.classList.remove("hidden");
    pausePlayButton.classList.add("hidden");
    if (intervalId) {
      window.clearInterval(intervalId);
      intervalId = null;
    }
  }

  function stopVoiceNote() {
    if (!("speechSynthesis" in window)) {
      return;
    }

    window.speechSynthesis.cancel();
    if (pausedMusicForVoice) {
      resumeMusicAfterVoiceNote();
      pausedMusicForVoice = false;
    }

    if (activeVoiceButton) {
      activeVoiceButton.textContent = "Play Voice Note";
      activeVoiceButton.classList.remove("is-speaking");
      activeVoiceButton = null;
    }
  }

  function playVoiceNote(index, button) {
    if (!("speechSynthesis" in window)) {
      voiceStatus.textContent = "Voice notes are not supported in this browser.";
      return;
    }

    const note = withName(memories[index].voiceNote);
    if (activeVoiceButton === button) {
      stopVoiceNote();
      voiceStatus.textContent = "Voice note stopped.";
      return;
    }

    stopFunVideo();
    stopVoiceNote();
    const utterance = new SpeechSynthesisUtterance(note);
    utterance.rate = 0.95;
    utterance.pitch = 1.05;
    utterance.onend = () => {
      if (activeVoiceButton === button) {
        button.textContent = "Play Voice Note";
        button.classList.remove("is-speaking");
        voiceStatus.textContent = "Tap any card to play another personal voice note.";
        if (pausedMusicForVoice) {
          resumeMusicAfterVoiceNote();
          pausedMusicForVoice = false;
        }
        activeVoiceButton = null;
      }
    };

    activeVoiceButton = button;
    pausedMusicForVoice = pauseMusicForVoiceNote();
    button.textContent = "Stop Voice Note";
    button.classList.add("is-speaking");
    voiceStatus.textContent = `Playing note from "${memories[index].title}".`;
    window.speechSynthesis.speak(utterance);
  }

  function applyQuizEffect(level) {
    if (level === 1) {
      burstConfetti({ count: 80, x: 50, y: 40 });
      voiceStatus.textContent = "Quiz Unlock 1: confetti celebration unlocked.";
    } else if (level === 2) {
      document.body.classList.add("memory-quiz-aurora");
      voiceStatus.textContent = "Quiz Unlock 2: dreamy aurora overlay unlocked.";
    } else if (level === 3) {
      document.body.classList.add("memory-quiz-won");
      burstConfetti({ count: 160, x: 50, y: 45 });
      createFloatingLayer({
        count: 20,
        symbols: ["&#10024;", "&#10084;"],
        colors: ["#ff7f66", "#ffd166", "#9adbc4", "#f2acd6"],
        minDuration: 9,
        maxDuration: 16
      });
      voiceStatus.textContent = `Quiz complete. ${recipientName}, every answer unlocked more sparkle.`;
    }
  }

  function updateQuizProgress() {
    quizProgress.textContent = `Unlocked effects: ${unlockedEffects} / 3`;
  }

  function lockQuestionOptions(container) {
    const buttons = container.querySelectorAll(".quiz-option");
    buttons.forEach((button) => {
      button.disabled = true;
    });
  }

  function renderQuiz() {
    quizList.innerHTML = "";

    quizQuestions.forEach((quiz, quizIndex) => {
      const item = document.createElement("article");
      item.className = "quiz-item";
      item.innerHTML = `
        <p class="quiz-question">${quizIndex + 1}. ${quiz.question}</p>
        <div class="quiz-options"></div>
        <p class="quiz-note" id="quizNote${quizIndex}">Choose an answer to unlock an effect.</p>
      `;

      const optionsWrap = item.querySelector(".quiz-options");
      const note = item.querySelector(".quiz-note");

      quiz.options.forEach((optionText, optionIndex) => {
        const option = document.createElement("button");
        option.type = "button";
        option.className = "quiz-option";
        option.textContent = optionText;

        option.addEventListener("click", () => {
          if (solvedQuestions.has(quizIndex)) {
            return;
          }

          if (optionIndex === quiz.answerIndex) {
            solvedQuestions.add(quizIndex);
            unlockedEffects += 1;
            option.classList.add("correct");
            note.textContent = quiz.success;
            lockQuestionOptions(item);
            updateQuizProgress();
            applyQuizEffect(unlockedEffects);
          } else {
            option.classList.add("wrong");
            note.textContent = "Not this one. Try another answer.";
          }
        });

        optionsWrap.appendChild(option);
      });

      quizList.appendChild(item);
    });
  }

  autoPlayButton.addEventListener("click", startSlideshow);
  pausePlayButton.addEventListener("click", pauseSlideshow);
  prevMemoryButton.addEventListener("click", () => {
    scrollToCard(currentIndex - 1);
  });
  nextMemoryButton.addEventListener("click", () => {
    scrollToCard(currentIndex + 1);
  });

  cards.forEach((card, index) => {
    card.addEventListener("click", (event) => {
      if (event.target.closest(".voice-note-btn")) {
        return;
      }
      scrollToCard(index);
    });
  });

  voiceButtons.forEach((button, index) => {
    button.addEventListener("click", () => {
      playVoiceNote(index, button);
    });
  });

  track.addEventListener("scroll", () => {
    if (trackSyncRafId) {
      return;
    }

    trackSyncRafId = window.requestAnimationFrame(() => {
      trackSyncRafId = null;
      syncActiveCardFromTrackScroll();
    });
  }, { passive: true });

  if (playFunVideoButton) {
    playFunVideoButton.addEventListener("click", () => {
      playFunVideo();
    });
  }

  chapterChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const startTime = Number(chip.dataset.time || "0");
      playFunVideo(startTime);
    });
  });

  if (funMomentVideo) {
    funMomentVideo.addEventListener("play", () => {
      pauseMusicForVideo();
      setFunVideoHint("Playing your best moments reel.");
    });

    funMomentVideo.addEventListener("pause", () => {
      resumeMusicForVideo();
      if (!funMomentVideo.ended) {
        setFunVideoHint("Video paused. Press play any time.");
      }
    });

    funMomentVideo.addEventListener("ended", () => {
      resumeMusicForVideo();
      setFunVideoHint("Replay it anytime for another smile.");
      burstConfetti({ count: 80, x: 55, y: 50 });
    });

    funMomentVideo.addEventListener("error", () => {
      setFunVideoHint("Video file not found yet. Add assets/videos/best-moments-fun.mp4");
    });
  }

  if (shuffleDumpButton) {
    shuffleDumpButton.addEventListener("click", () => {
      layoutDumpCards();
      setDumpStatus("Shuffled. Pick one photo to spotlight.");
      burstConfetti({ count: 34, x: 50, y: 66 });
    });
  }

  backHomeButton.addEventListener("click", () => {
    stopFunVideo();
    stopVoiceNote();
    navigate("index.html");
  });
  nextSceneButton.addEventListener("click", () => {
    stopFunVideo();
    stopVoiceNote();
    navigate("cake.html");
  });

  window.addEventListener("beforeunload", () => {
    if (trackSyncRafId) {
      window.cancelAnimationFrame(trackSyncRafId);
      trackSyncRafId = null;
    }
    stopFunVideo();
    stopVoiceNote();
  });
  renderQuiz();
  updateQuizProgress();
  renderDumpWall();
  scrollToCard(0);
});
