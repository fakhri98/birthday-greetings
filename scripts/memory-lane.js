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

document.addEventListener("DOMContentLoaded", () => {
  const { createFloatingLayer, getRecipientName, navigate } = window.BirthdayApp;
  const recipientName = getRecipientName("Birthday Star");

  createFloatingLayer({
    count: 34,
    symbols: ["&#10084;", "&#10024;", "&#9679;", "&#9675;"],
    colors: ["#ff7f66", "#ffca7a", "#8dd9b7", "#e6abdc"]
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

  heading.textContent = `Memory Lane for ${recipientName}`;

  let currentIndex = 0;
  let intervalId = null;
  let activeVoiceButton = null;
  let activeUtterance = null;

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
    track.scrollTo({ left: leftPosition, behavior: "smooth" });
  }

  function startSlideshow() {
    if (intervalId) {
      return;
    }
    autoPlayButton.classList.add("hidden");
    pausePlayButton.classList.remove("hidden");
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
    if (activeVoiceButton) {
      activeVoiceButton.textContent = "Play Voice Note";
      activeVoiceButton.classList.remove("is-speaking");
      activeVoiceButton = null;
      activeUtterance = null;
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
        activeVoiceButton = null;
        activeUtterance = null;
      }
    };

    activeVoiceButton = button;
    activeUtterance = utterance;
    button.textContent = "Stop Voice Note";
    button.classList.add("is-speaking");
    voiceStatus.textContent = `Playing note from "${memories[index].title}".`;
    window.speechSynthesis.speak(utterance);
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
  scrollToCard(0);
});
