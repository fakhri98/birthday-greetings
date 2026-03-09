document.addEventListener("DOMContentLoaded", () => {
  const { createFloatingLayer, navigate } = window.BirthdayApp;

  createFloatingLayer({
    count: 30,
    symbols: ["&#10084;", "&#10024;", "&#9679;", "&#9830;"],
    colors: ["#ff6f61", "#ffb347", "#9edfb2", "#ff9eb6"],
    minDuration: 14,
    maxDuration: 28
  });

  const startButton = document.getElementById("startSurprise");
  startButton.addEventListener("click", () => {
    navigate("memory-lane.html");
  });
});
