// main.js
// Interactivity for the site:
// 1) Highlight active section in nav while scrolling (index.html)
// 2) Reveal sections on scroll (index.html)
// 3) Back-to-top button (all pages)

console.log("main.js loaded ✅");

document.addEventListener("DOMContentLoaded", () => {
  setupBackToTop();
  setupRevealOnScroll();
  setupActiveSectionHighlight();
});

function setupBackToTop() {
  const btn = document.getElementById("back-to-top");
  if (!btn) return;

  function updateButton() {
    if (window.scrollY > 450) {
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
  // Only run on pages that have multiple sections like index.html
  const sections = document.querySelectorAll("main section");
  if (sections.length === 0) return;

  // If IntersectionObserver isn't supported, just show everything
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

function setupActiveSectionHighlight() {
  // This feature is only meaningful on index.html where links are #education, #skills, etc.
  const nav = document.querySelector(".site-nav");
  if (!nav) return;

  // Only consider nav links that point to sections on the same page (#...)
  const navLinks = Array.from(nav.querySelectorAll('a[href^="#"]'));
  if (navLinks.length === 0) return;

  const targets = navLinks
    .map((a) => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);

  function setActive(linkEl) {
    navLinks.forEach((a) => a.classList.remove("active-section"));
    if (linkEl) linkEl.classList.add("active-section");
  }

  function updateActiveOnScroll() {
    // Find the section closest to the top of the viewport
    let bestMatch = null;
    let bestDistance = Infinity;

    targets.forEach((section) => {
      const rect = section.getBoundingClientRect();
      const distance = Math.abs(rect.top - 120); // 120px offset feels natural under header
      if (rect.top <= 200 && distance < bestDistance) {
        bestDistance = distance;
        bestMatch = section;
      }
    });

    if (!bestMatch) {
      // If we're near the top of the page, highlight nothing (Home stays bold via aria-current)
      setActive(null);
      return;
    }

    const id = `#${bestMatch.id}`;
    const activeLink = navLinks.find((a) => a.getAttribute("href") === id);
    setActive(activeLink);
  }

  window.addEventListener("scroll", updateActiveOnScroll, { passive: true });
  updateActiveOnScroll();
}
