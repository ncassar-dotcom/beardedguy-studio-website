const nav = document.querySelector(".main-nav");
const toggle = document.querySelector(".menu-toggle");
const siteHeader = document.querySelector(".frame-header");

if (siteHeader) {
  const updateHeader = () => {
    siteHeader.classList.toggle("is-scrolled", window.scrollY > 90);
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });
  window.addEventListener("pageshow", updateHeader);
}

if (toggle && nav) {
  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });
}

const form = document.querySelector(".contact-form");
const note = document.querySelector(".form-note");

if (form && note) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const button = form.querySelector(".submit");

    note.classList.remove("is-error", "is-success");
    note.textContent = "Sending your enquiry...";
    if (button) button.disabled = true;

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: data,
        headers: {
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
      });
      const result = await response.json();

      note.textContent = result.message || "Thank you. Your enquiry has been sent.";
      note.classList.add(response.ok && result.ok ? "is-success" : "is-error");

      if (response.ok && result.ok) {
        form.reset();
      }
    } catch (error) {
      note.textContent = "Sorry, the message could not be sent. Please email info@n-vil.com directly.";
      note.classList.add("is-error");
    } finally {
      if (button) button.disabled = false;
    }
  });
}

const hero = document.querySelector(".hero");
const heroVisual = document.querySelector(".hero-visual");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

window.addEventListener("pageshow", () => document.body.classList.remove("page-leaving"));

document.addEventListener("click", (event) => {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const link = event.target.closest("a[href]");
  if (!link || link.hasAttribute("download") || (link.target && link.target !== "_self")) return;
  const destination = new URL(link.href, window.location.href);
  if (destination.origin !== window.location.origin || !destination.pathname.endsWith(".html")) return;
  if (destination.pathname === window.location.pathname && destination.search === window.location.search) return;

  event.preventDefault();
  if (document.body.classList.contains("page-leaving")) return;
  document.body.classList.add("page-leaving");
  window.setTimeout(() => window.location.assign(destination.href), 180);
});

if (hero && heroVisual && !reducedMotion) {
  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;

  const renderParallax = () => {
    currentX += (targetX - currentX) * 0.035;
    currentY += (targetY - currentY) * 0.035;
    heroVisual.style.setProperty("--hero-parallax-x", `${currentX.toFixed(2)}px`);
    heroVisual.style.setProperty("--hero-parallax-y", `${currentY.toFixed(2)}px`);
    requestAnimationFrame(renderParallax);
  };

  hero.addEventListener("pointermove", (event) => {
    if (window.innerWidth < 981) return;
    const rect = hero.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    targetX = x * 24;
    targetY = y * 16;
  });

  hero.addEventListener("pointerleave", () => {
    targetX = 0;
    targetY = 0;
  });

  renderParallax();
}


const scrollOrb = document.querySelector(".scroll-orb");

if (scrollOrb) {
  const getScrollY = () => window.scrollY || document.documentElement.scrollTop || 0;

  const updateScrollOrb = () => {
    const isScrolled = getScrollY() > 8;
    scrollOrb.classList.toggle("is-up", isScrolled);
    scrollOrb.setAttribute("href", isScrolled ? "#before-hero" : "#after-hero");
    scrollOrb.setAttribute("aria-label", isScrolled ? "Back to top" : "Scroll down");
  };

  scrollOrb.addEventListener("click", (event) => {
    if (getScrollY() > 8) {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });

  updateScrollOrb();
  window.addEventListener("scroll", updateScrollOrb, { passive: true });
  window.addEventListener("resize", updateScrollOrb);
}
const videoModal = document.querySelector(".video-modal");
const videoFrame = document.querySelector(".video-modal__frame");
const modalVideo = document.querySelector(".video-modal__video");
const modalStatus = document.querySelector(".video-modal__status");
const videoClose = document.querySelector(".video-modal__close");
const videoPanel = document.querySelector(".video-modal__panel");
const videoCards = document.querySelectorAll(".video-card");

if (videoModal && videoClose && videoCards.length) {
  const openVideo = (card) => {
    const iframe = card.querySelector("iframe");
    const localVideo = card.querySelector("video");

    if (iframe && videoFrame) {
      const source = iframe.getAttribute("src");
      const title = iframe.getAttribute("title") || "Selected video";
      if (!source) return;
      videoFrame.src = source;
      videoFrame.title = title;
    } else if (card.dataset.video && modalVideo) {
      const source = card.dataset.video;
      const poster = card.dataset.poster;
      if (!source) return;
      modalVideo.poster = poster || "";
      modalVideo.title = card.dataset.title || "Selected video";
      if (modalStatus) modalStatus.textContent = "Loading video...";
    } else if (localVideo && modalVideo) {
      const source = localVideo.currentSrc || localVideo.getAttribute("src");
      const poster = localVideo.getAttribute("poster");
      if (!source) return;
      modalVideo.poster = poster || "";
      modalVideo.title = localVideo.getAttribute("title") || "Selected video";
      if (modalStatus) modalStatus.textContent = "Loading video...";
    } else {
      return;
    }

    videoModal.classList.add("is-open");
    videoModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    videoClose.focus();

    const sizeVideoPanel = () => {
      if (!videoPanel || !modalVideo.videoWidth || !modalVideo.videoHeight) return;
      const maxWidth = Math.max(280, window.innerWidth - 72);
      const maxHeight = Math.max(220, window.innerHeight - 116);
      const scale = Math.min(1, maxWidth / modalVideo.videoWidth, maxHeight / modalVideo.videoHeight);
      const width = Math.round(modalVideo.videoWidth * scale);
      const height = Math.round(modalVideo.videoHeight * scale);
      videoPanel.style.setProperty("--video-width", `${width}px`);
      videoPanel.style.setProperty("--video-height", `${height}px`);
    };

    const playModalVideo = () => {
      modalVideo.muted = true;
      modalVideo.load();
      modalVideo.addEventListener("loadedmetadata", sizeVideoPanel, { once: true });
      const playPromise = modalVideo.play();

      if (playPromise && typeof playPromise.then === "function") {
        playPromise
          .then(() => {
            sizeVideoPanel();
            if (modalStatus) modalStatus.textContent = "";
          })
          .catch(() => {
            sizeVideoPanel();
            if (modalStatus) modalStatus.textContent = "Press play to start the video.";
          });
      } else {
        sizeVideoPanel();
        if (modalStatus) modalStatus.textContent = "";
      }
    };

    const source = card.dataset.video || localVideo?.currentSrc || localVideo?.getAttribute("src");
    if (source && modalVideo) {
      if (modalStatus) modalStatus.textContent = "Loading video...";

      fetch(source)
        .then((response) => {
          if (!response.ok) throw new Error("Video could not be loaded");
          return response.blob();
        })
        .then((blob) => {
          if (modalVideo.dataset.objectUrl) URL.revokeObjectURL(modalVideo.dataset.objectUrl);
          const objectUrl = URL.createObjectURL(blob);
          modalVideo.dataset.objectUrl = objectUrl;
          modalVideo.src = objectUrl;
          playModalVideo();
        })
        .catch(() => {
          modalVideo.src = source;
          playModalVideo();
        });
    }
  };

  const closeVideo = () => {
    videoModal.classList.remove("is-open");
    videoModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");

    if (videoFrame) {
      videoFrame.src = "";
    }

    if (modalVideo) {
      modalVideo.pause();
      if (modalVideo.dataset.objectUrl) {
        URL.revokeObjectURL(modalVideo.dataset.objectUrl);
        delete modalVideo.dataset.objectUrl;
      }
      modalVideo.removeAttribute("src");
      modalVideo.removeAttribute("poster");
      modalVideo.load();
    }
  };

  videoCards.forEach((card) => {
    const title = card.querySelector("iframe")?.getAttribute("title") || card.dataset.title || card.querySelector("video")?.getAttribute("title") || "video";
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");
    card.setAttribute("aria-label", `Open ${title}`);

    card.addEventListener("click", (event) => {
      event.preventDefault();
      openVideo(card);
    });
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openVideo(card);
      }
    });
  });

  videoClose.addEventListener("click", closeVideo);
  videoModal.addEventListener("click", (event) => {
    if (event.target === videoModal) closeVideo();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && videoModal.classList.contains("is-open")) {
      closeVideo();
    }
  });
}













