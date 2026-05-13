const btn = document.getElementById("colapsible-button");
const panel = document.getElementById("control-box");
btn.addEventListener("click", () => {
console.log("klik");
	panel.classList.toggle("active");
  btn.classList.toggle("open");

});
