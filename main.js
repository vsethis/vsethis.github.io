// main.js

document.addEventListener("DOMContentLoaded", () => {
  setupBackToTop();
  setupRevealOnScroll();
  setupThemeToggle();
});

function setupBackToTop() {
  const btn = document.getElementById("back-to-top");
  if (!btn) return;

  function updateButton() {
    if (window.scrollY > 120) {
      btn.classList.add("show");
    } else {
      btn.classList.remove("show");
    }
  }

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  window.addEventListener("scroll", updateButton, { passive: true });
  updateButton();
}

function setupRevealOnScroll() {
  const sections = document.querySelectorAll("main section");
  if (sections.length === 0) return;

  if (!("IntersectionObserver" in window)) {
    sections.forEach((s) => s.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target); // reveal once
        }
      });
    },
    { threshold: 0.12 }
  );

  sections.forEach((s) => observer.observe(s));
}

function setupThemeToggle() {
  const btn = document.getElementById("theme-toggle");
  if (!btn) return;

  // Load saved theme
  const saved = localStorage.getItem("theme");
  if (saved === "dark") {
    document.body.classList.add("dark");
  }

  btn.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    const isDark = document.body.classList.contains("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");

    if (typeof drawGenerativeArt === "function") drawGenerativeArt();
    if (typeof drawTintTradeoffChart === "function") drawTintTradeoffChart();
  });
}

