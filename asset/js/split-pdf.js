const btn = document.getElementById("hidden-colapsible-button");
const panel = document.getElementById("control-box");
btn.addEventListener("click", () => {
  panel.classList.toggle("active");
  btn.classList.toggle("open");
});

