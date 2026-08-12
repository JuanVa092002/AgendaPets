document.addEventListener("DOMContentLoaded", () => {
  const root = document.querySelector("[data-team-carousel]");
  if (!root) return;

  const track = root.querySelector("[data-team-track]");
  const viewport = root.querySelector(".team-carousel__viewport");
  const cards = Array.from(track.querySelectorAll(".team-card"));
  const prevBtn = root.querySelector("[data-team-prev]");
  const nextBtn = root.querySelector("[data-team-next]");
  const dotsWrap = root.querySelector("[data-team-dots]");

  if (!cards.length || !viewport) return;

  let index = 0;
  let perView = 3;
  let gap = 24;

  const getPerView = () => {
    if (window.innerWidth < 768) return 1;
    if (window.innerWidth < 992) return 2;
    return 3;
  };

  const maxIndex = () => Math.max(0, cards.length - perView);

  const renderDots = () => {
    const pages = maxIndex() + 1;
    dotsWrap.innerHTML = "";

    for (let i = 0; i < pages; i += 1) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "team-carousel__dot" + (i === index ? " is-active" : "");
      btn.setAttribute("aria-label", `Ir a la página ${i + 1}`);
      btn.setAttribute("aria-current", i === index ? "true" : "false");
      btn.addEventListener("click", () => {
        index = i;
        update();
      });
      dotsWrap.appendChild(btn);
    }
  };

  const update = () => {
    perView = getPerView();
    gap = parseFloat(getComputedStyle(track).gap) || 24;
    index = Math.min(index, maxIndex());

    const viewportWidth = viewport.clientWidth;
    const cardWidth = (viewportWidth - gap * (perView - 1)) / perView;

    cards.forEach((card) => {
      card.style.flex = `0 0 ${cardWidth}px`;
      card.style.width = `${cardWidth}px`;
    });

    const offset = index * (cardWidth + gap);
    track.style.transform = `translateX(-${offset}px)`;

    prevBtn.disabled = index === 0;
    nextBtn.disabled = index >= maxIndex();

    renderDots();
  };

  prevBtn.addEventListener("click", () => {
    index = Math.max(0, index - 1);
    update();
  });

  nextBtn.addEventListener("click", () => {
    index = Math.min(maxIndex(), index + 1);
    update();
  });

  let touchStartX = 0;
  track.addEventListener(
    "touchstart",
    (e) => {
      touchStartX = e.changedTouches[0].screenX;
    },
    { passive: true }
  );

  track.addEventListener(
    "touchend",
    (e) => {
      const delta = e.changedTouches[0].screenX - touchStartX;
      if (Math.abs(delta) < 40) return;
      if (delta < 0) index = Math.min(maxIndex(), index + 1);
      else index = Math.max(0, index - 1);
      update();
    },
    { passive: true }
  );

  window.addEventListener("resize", update);
  update();
});
