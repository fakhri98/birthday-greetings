const memories = [
  {
    title: "Sunset Walk",
    caption: "You turned a random evening into a perfect memory.",
    image: "assets/memories/memory-1.svg"
  },
  {
    title: "Cafe Story",
    caption: "The place where we laughed until everyone stared at us.",
    image: "assets/memories/memory-2.svg"
  },
  {
    title: "Road Trip",
    caption: "No plan, loud songs, and the best wrong turns ever.",
    image: "assets/memories/memory-3.svg"
  },
  {
    title: "Movie Night",
    caption: "Blankets, snacks, and you claiming every good pillow.",
    image: "assets/memories/memory-4.svg"
  },
  {
    title: "Rainy Day",
    caption: "We stayed in, made tea, and watched the storm pass.",
    image: "assets/memories/memory-5.svg"
  },
  {
    title: "Little Wins",
    caption: "You always celebrate my small victories like big ones.",
    image: "assets/memories/memory-6.svg"
  },
  {
    title: "Birthday Eve",
    caption: "You smiled at midnight like it was a movie scene.",
    image: "assets/memories/memory-7.svg"
  },
  {
    title: "Today",
    caption: "Another year of you, and that is the best gift.",
    image: "assets/memories/memory-8.svg"
  }
];

document.addEventListener("DOMContentLoaded", () => {
  const { createFloatingLayer, navigate } = window.BirthdayApp;
  createFloatingLayer({
    count: 34,
    symbols: ["&#10084;", "&#10024;", "&#9679;", "&#9675;"],
    colors: ["#ff7f66", "#ffca7a", "#8dd9b7", "#e6abdc"]
  });

  const track = document.getElementById("memoryTrack");
  const autoPlayButton = document.getElementById("autoPlay");
  const pausePlayButton = document.getElementById("pausePlay");
  const prevMemoryButton = document.getElementById("prevMemory");
  const nextMemoryButton = document.getElementById("nextMemory");
  const backHomeButton = document.getElementById("backHome");
  const nextSceneButton = document.getElementById("nextScene");

  let currentIndex = 0;
  let intervalId = null;

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
        <p class="memory-caption">${memory.caption}</p>
      </div>
    `;
    track.appendChild(card);
  });

  const cards = Array.from(track.querySelectorAll(".memory-card"));

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

  autoPlayButton.addEventListener("click", startSlideshow);
  pausePlayButton.addEventListener("click", pauseSlideshow);
  prevMemoryButton.addEventListener("click", () => {
    scrollToCard(currentIndex - 1);
  });
  nextMemoryButton.addEventListener("click", () => {
    scrollToCard(currentIndex + 1);
  });

  cards.forEach((card, index) => {
    card.addEventListener("click", () => {
      scrollToCard(index);
    });
  });

  backHomeButton.addEventListener("click", () => navigate("index.html"));
  nextSceneButton.addEventListener("click", () => navigate("cake.html"));

  scrollToCard(0);
});
