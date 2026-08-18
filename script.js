document.addEventListener("DOMContentLoaded", () => {
  // 1. 모바일 햄버거 메뉴 토글
  const menuToggle = document.querySelector(".menu-toggle");
  const siteNav = document.querySelector(".site-nav");

  if (menuToggle && siteNav) {
    menuToggle.addEventListener("click", () => {
      const isOpen = siteNav.classList.toggle("is-open");
      menuToggle.setAttribute("aria-expanded", isOpen);
    });

    // Escape 키로 모바일 메뉴 닫기
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && siteNav.classList.contains("is-open")) {
        siteNav.classList.remove("is-open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.focus();
      }
    });
  }

  // 2. 스크롤 위치에 따른 네비게이션 활성화 (Scrollspy)
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-link");

  const onScroll = () => {
    const scrollY = window.scrollY;

    sections.forEach((current) => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 100;
      const sectionId = current.getAttribute("id");

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        navLinks.forEach((link) => {
          link.classList.remove("active");
          if (link.getAttribute("href") === `#${sectionId}`) {
            link.classList.add("active");
          }
        });
      }
    });
  };

  window.addEventListener("scroll", onScroll);

  // 3. Back to top 버튼
  const backToTopBtn = document.getElementById("back-to-top");
  if (backToTopBtn) {
    backToTopBtn.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  }
});

function moveSlide(button, direction) {
  const container = button.closest(".custom-carousel-wrap");
  const track = container.querySelector(".carousel-track");
  const slideWidth = track.clientWidth;

  track.scrollBy({
    left: slideWidth * direction,
    behavior: "smooth",
  });
}

function updateSlideCounter(track) {
  const container = track.closest(".custom-carousel-wrap");
  const counterCurrent = container.querySelector(".current-slide");
  const slideWidth = track.clientWidth;

  if (slideWidth > 0 && counterCurrent) {
    const currentIndex = Math.round(track.scrollLeft / slideWidth) + 1;
    counterCurrent.textContent = currentIndex;
  }
}
