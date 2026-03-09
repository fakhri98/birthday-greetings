document.addEventListener("DOMContentLoaded", () => {
  const {
    createFloatingLayer,
    getRecipientName,
    navigate,
    sanitizeName,
    setRecipientName
  } = window.BirthdayApp;

  createFloatingLayer({
    count: 30,
    symbols: ["&#10084;", "&#10024;", "&#9679;", "&#9830;"],
    colors: ["#ff6f61", "#ffb347", "#9edfb2", "#ff9eb6"],
    minDuration: 14,
    maxDuration: 28
  });

  const heading = document.getElementById("recipientHeading");
  const nameInput = document.getElementById("recipientName");
  const startButton = document.getElementById("startSurprise");

  const initialName = getRecipientName("");
  if (initialName) {
    nameInput.value = initialName;
    heading.textContent = initialName;
  }

  function reflectName(value) {
    const safe = sanitizeName(value);
    heading.textContent = safe || "My Favorite Human";
  }

  nameInput.addEventListener("input", () => {
    reflectName(nameInput.value);
  });

  nameInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      startButton.click();
    }
  });

  startButton.addEventListener("click", () => {
    setRecipientName(nameInput.value);
    navigate("memory-lane.html");
  });
});
