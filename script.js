const navToggle = document.querySelector(".nav-toggle");
const navBar = document.querySelector(".nav");
const navLinks = document.querySelector(".nav-links");

if (navToggle && navBar) {
  navToggle.addEventListener("click", () => {
    const isOpen = navBar.classList.toggle("nav--open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

if (navLinks && navBar && navToggle) {
  navLinks.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      navBar.classList.remove("nav--open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });
}

const demoForm = document.querySelector(".demo-form");
if (demoForm) {
  demoForm.addEventListener("submit", (event) => {
    event.preventDefault();
  });
}
