document.addEventListener("DOMContentLoaded", () => {
  const navbar = document.querySelector(".navbar");
  const reveals = document.querySelectorAll(".home-reveal");

  const onScroll = () => {
    if (navbar) {
      navbar.classList.toggle("is-scrolled", window.scrollY > 8);
    }
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    reveals.forEach((el) => observer.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-visible"));
  }
});
