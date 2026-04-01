document.addEventListener("click", (event) => {
  const dismissButton = event.target.closest("[data-flash-dismiss]");

  if (!dismissButton) {
    return;
  }

  const flashMessage = dismissButton.closest(".flash-message");

  if (!flashMessage) {
    return;
  }

  flashMessage.classList.add("is-dismissing");

  window.setTimeout(() => {
    flashMessage.remove();
  }, 200);
});
