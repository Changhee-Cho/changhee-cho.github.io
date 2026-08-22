document.addEventListener("DOMContentLoaded", () => {
  // 1. 모바일 햄버거 메뉴 토글
  const menuToggle = document.querySelector(".menu-toggle");
  const siteNav = document.querySelector(".site-nav");

  if (menuToggle && siteNav) {
    menuToggle.addEventListener("click", () => {
      const isOpen = siteNav.classList.toggle("is-open");
      menuToggle.setAttribute("aria-expanded", isOpen);
    });

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

  // 4. JSON 파일로부터 프로젝트 데이터 로드 및 렌더링
  loadProjects();
});

// JSON 데이터 로드 & 렌더링 함수
async function loadProjects() {
  const container = document.getElementById("projects-container");
  if (!container) return;

  try {
    const response = await fetch("data/projects.json");
    if (!response.ok) throw new Error("JSON 로드 실패");
    const projects = await response.json();

    container.innerHTML = projects.map((p) => createProjectHTML(p)).join("");

    initAccordions();
  } catch (error) {
    console.error("프로젝트 데이터를 불러오는 데 실패했습니다:", error);
    initAccordions();
  }
}

// 개별 프로젝트 HTML 템플릿 생성
function createProjectHTML(project) {
  const hasImages = project.images && project.images.length > 0;
  const hasBadge = project.badge && project.badge.trim() !== "";
  const hasLinks = Array.isArray(project.links) && project.links.length > 0;

  // 1. 배지 템플릿 (있을 때만 렌더링)
  const badgeHTML = hasBadge
    ? `<span style="display: inline-flex; align-items: center; gap: 4px; background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); color: #b45309; border: 1px solid #fde68a; padding: 2px 9px; border-radius: 20px; font-size: 11.5px; font-weight: 700; box-shadow: 0 1px 2px rgba(180,83,9,0.08);">
        ${project.badge}
       </span>`
    : "";

  // 2. 태그 템플릿
  const tagsHTML = project.tags
    .map((tag) => `<span class="tag">${tag}</span>`)
    .join("");

  // 3. 커스텀 링크 버튼 템플릿 (개수, 이름, 스타일 자유 반영)
  let linksHTML = "";
  if (hasLinks) {
    const buttonsHTML = project.links
      .map((link) => {
        const btnClass =
          link.type === "primary" ? "btn-primary" : "btn-outline";
        return `
          <a href="${link.url}" target="_blank" class="btn ${btnClass}" style="flex: 1 1 auto; justify-content: center; padding: 7px 14px; font-size: 13px; display: inline-flex; align-items: center; gap: 6px;">
            <span>${link.label}</span> ↗
          </a>
        `;
      })
      .join("");

    linksHTML = `<div style="display: flex; gap: 10px; flex-wrap: wrap;">${buttonsHTML}</div>`;
  }

  // 4. 이미지 슬라이더 (이미지가 있을 때만 생성)
  let mediaColHTML = "";
  if (hasImages) {
    const slidesHTML = project.images
      .map(
        (img) => `
        <div style="flex: 0 0 100%; width: 100%; min-width: 100%; scroll-snap-align: start; display: flex; justify-content: center; align-items: center;">
          <img src="${img.src}" alt="${img.alt}" />
        </div>
      `,
      )
      .join("");

    mediaColHTML = `
      <div class="project-media-col" style="display: flex; flex-direction: column; gap: 12px;">
        <div class="custom-carousel-wrap">
          ${project.images.length > 1 ? `<button type="button" class="carousel-btn prev" onclick="moveSlide(this, -1)" aria-label="이전 사진">‹</button>` : ""}
          <div class="carousel-track" onscroll="updateSlideCounter(this)">
            ${slidesHTML}
          </div>
          ${project.images.length > 1 ? `<button type="button" class="carousel-btn next" onclick="moveSlide(this, 1)" aria-label="다음 사진">›</button>` : ""}
          ${project.images.length > 1 ? `<div style="position: absolute; bottom: 12px; right: 12px; background: rgba(18, 23, 34, 0.7); color: #ffffff; padding: 3px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; letter-spacing: 0.05em; backdrop-filter: blur(4px); pointer-events: none; z-index: 20;"><span class="current-slide">1</span> / <span class="total-slides">${project.images.length}</span></div>` : ""}
        </div>
        ${linksHTML}
      </div>
    `;
  }

  // 5. 테이블 세부 항목
  const detailsRowsHTML = project.details
    .map(
      (d) => `
      <tr>
        <th>${d.label}</th>
        <td ${d.highlight ? 'style="font-weight: 600; color: #b45309;"' : ""}>${d.content}</td>
      </tr>
    `,
    )
    .join("");

  // 이미지가 없을 때: 링크가 있다면 설명글 상단에 표시
  const textLinksHTML =
    !hasImages && hasLinks
      ? `<div style="margin-bottom: 8px;">${linksHTML}</div>`
      : "";

  // 6. 전체 아티클 조립
  return `
    <article class="project-card" style="position: relative">
      <details class="project-accordion" ${project.isOpen ? "open" : ""}>
        <summary class="project-summary-header">
          <div class="project-header" style="margin-bottom: 0">
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <span class="comp-num">PROJECT ${project.id}</span>
              ${badgeHTML}
              ${project.period ? `<span style="font-size: 12px; color: var(--text-secondary); font-weight: 500;">${project.period}</span>` : ""}
            </div>
            <h3 class="project-title">${project.title}</h3>
            <div class="tag-group">
              ${tagsHTML}
            </div>
          </div>
          <div class="accordion-toggle-btn">
            <span class="toggle-text">상세내용</span>
            <span class="toggle-icon">▼</span>
          </div>
        </summary>

        <div class="accordion-content-wrapper">
          <div class="accordion-inner">
            <div class="project-detail-layout ${!hasImages ? "no-media" : ""}" style="padding-top: 24px; border-top: 1px solid var(--border-color); margin-top: 20px;">
              ${mediaColHTML}
              <div class="project-info-col" style="display: flex; flex-direction: column; gap: 16px">
                ${textLinksHTML}
                <div class="project-goal" style="margin: 0">
                  <h4>GOAL</h4>
                  <p>${project.goal}</p>
                </div>
                <table class="project-table" style="margin: 0">
                  ${detailsRowsHTML}
                </table>
              </div>
            </div>
          </div>
        </div>
      </details>
    </article>
  `;
}

// 아코디언 토글 제어 함수
function initAccordions() {
  const detailsElements = document.querySelectorAll("details");

  detailsElements.forEach((detail) => {
    const summary = detail.querySelector("summary");
    if (!summary || summary.dataset.bound) return;
    summary.dataset.bound = "true";

    summary.addEventListener("click", (e) => {
      e.preventDefault();
      const wrapper = detail.querySelector(".accordion-content-wrapper");

      if (detail.open) {
        if (wrapper) {
          wrapper.style.gridTemplateRows = "0fr";
          setTimeout(() => {
            detail.removeAttribute("open");
            wrapper.style.removeProperty("grid-template-rows");
          }, 300);
        } else {
          detail.removeAttribute("open");
        }
      } else {
        detail.setAttribute("open", "");
      }
    });
  });
}

// 슬라이더 이동 제어 함수
function moveSlide(button, direction) {
  const container = button.closest(".custom-carousel-wrap");
  if (!container) return;
  const track = container.querySelector(".carousel-track");
  const slideWidth = track.clientWidth;
  track.scrollBy({ left: slideWidth * direction, behavior: "smooth" });
}

// 슬라이더 카운터 갱신 함수
function updateSlideCounter(track) {
  const container = track.closest(".custom-carousel-wrap");
  if (!container) return;
  const counterCurrent = container.querySelector(".current-slide");
  const slideWidth = track.clientWidth;
  if (slideWidth > 0 && counterCurrent) {
    const currentIndex = Math.round(track.scrollLeft / slideWidth) + 1;
    counterCurrent.textContent = currentIndex;
  }
}
