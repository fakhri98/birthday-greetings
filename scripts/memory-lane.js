const memories = [
  {
    title: "Sunset Walk",
    caption: "You turned a random evening into a perfect memory.",
    voiceNote: "{name}, this one is my favorite because you made a normal sunset feel magical.",
    image: "assets/memories/memory-1.svg"
  },
  {
    title: "Cafe Story",
    caption: "The place where we laughed until everyone stared at us.",
    voiceNote: "I still remember how contagious your laugh was that day, {name}.",
    image: "assets/memories/memory-2.svg"
  },
  {
    title: "Road Trip",
    caption: "No plan, loud songs, and the best wrong turns ever.",
    voiceNote: "{name}, we should absolutely do another unplanned road trip soon.",
    image: "assets/memories/memory-3.svg"
  },
  {
    title: "Movie Night",
    caption: "Blankets, snacks, and you claiming every good pillow.",
    voiceNote: "You called this a movie night, but I call it elite comfort strategy.",
    image: "assets/memories/memory-4.svg"
  },
  {
    title: "Rainy Day",
    caption: "We stayed in, made tea, and watched the storm pass.",
    voiceNote: "{name}, quiet moments like this are why I feel lucky to know you.",
    image: "assets/memories/memory-5.svg"
  },
  {
    title: "Little Wins",
    caption: "You always celebrate my small victories like big ones.",
    voiceNote: "Thank you for cheering me on, even on my most ordinary days.",
    image: "assets/memories/memory-6.svg"
  },
  {
    title: "Birthday Eve",
    caption: "You smiled at midnight like it was a movie scene.",
    voiceNote: "{name}, I hope tonight feels as special as you are.",
    image: "assets/memories/memory-7.svg"
  },
  {
    title: "Today",
    caption: "Another year of you, and that is the best gift.",
    voiceNote: "Happy birthday, {name}. You mean more than words can say.",
    image: "assets/memories/memory-8.svg"
  }
];

const quizQuestions = [
  {
    question: "Which memory mentions a no-plan adventure?",
    options: ["Movie Night", "Road Trip", "Little Wins"],
    answerIndex: 1,
    success: "Correct. Unlock 1: confetti burst activated."
  },
  {
    question: "Where did we laugh until everyone stared?",
    options: ["Cafe Story", "Rainy Day", "Sunset Walk"],
    answerIndex: 0,
    success: "Correct. Unlock 2: dreamy aurora overlay activated."
  },
  {
    question: "What did she claim during movie night?",
    options: ["All snacks", "Every good pillow", "The playlist remote"],
    answerIndex: 1,
    success: "Correct. Unlock 3: grand celebration mode activated."
  }
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
    symbols: ["\u2665", "\u2605"],
    messages: [
      "Secret 1: You looked amazing in that sunset light.",
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

  heading.textContent = `Memory Lane for ${recipientName}`;

  let currentIndex = 0;
  let intervalId = null;
  let activeVoiceButton = null;
  let pausedMusicForVoice = false;
  let unlockedEffects = 0;
  const solvedQuestions = new Set();

  function withName(text) {
    return text.replaceAll("{name}", recipientName);
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

  function updateActiveCard(index) {
    currentIndex = (index + cards.length) % cards.length;
    cards.forEach((card, cardIndex) => {
      card.classList.toggle("is-active", cardIndex === currentIndex);
    });
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

  backHomeButton.addEventListener("click", () => {
    stopVoiceNote();
    navigate("index.html");
  });
  nextSceneButton.addEventListener("click", () => {
    stopVoiceNote();
    navigate("cake.html");
  });

  window.addEventListener("beforeunload", stopVoiceNote);
  renderQuiz();
  updateQuizProgress();
  scrollToCard(0);
});
