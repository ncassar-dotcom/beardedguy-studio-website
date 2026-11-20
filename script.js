const nav = document.querySelector(".main-nav");
const toggle = document.querySelector(".menu-toggle");
const siteHeader = document.querySelector(".frame-header");
const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
const compactLayout = window.matchMedia("(max-width: 1100px)");

if (siteHeader) {
  const updateHeader = () => siteHeader.classList.toggle("is-scrolled", window.scrollY > 24);
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });
  window.addEventListener("pageshow", updateHeader);
}

if (toggle && nav && siteHeader) {
  nav.id = "main-navigation";
  toggle.setAttribute("aria-controls", nav.id);
  document.querySelectorAll(".header-actions a").forEach((link) => {
    const item = link.cloneNode(true);
    item.className = "mobile-nav-action";
    nav.append(item);
  });
  const setMenuOpen = (open, restoreFocus = false) => {
    nav.classList.toggle("open", open);
    siteHeader.classList.toggle("menu-open", open);
    document.body.classList.toggle("nav-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.querySelectorAll("main, .site-footer, .scroll-orb").forEach((el) => { el.inert = open; });
    if (restoreFocus) toggle.focus({ preventScroll: true });
  };
  toggle.addEventListener("click", () => setMenuOpen(!nav.classList.contains("open")));
  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) setMenuOpen(false);
  });
  document.addEventListener("click", (event) => {
    if (nav.classList.contains("open") && !siteHeader.contains(event.target)) setMenuOpen(false);
  });
  document.addEventListener("keydown", (event) => {
    if (!nav.classList.contains("open")) return;
    if (event.key === "Escape") setMenuOpen(false, true);
    if (event.key === "Tab") {
      const links = [...siteHeader.querySelectorAll("a, button")].filter((el) => el.getClientRects().length);
      const first = links[0], last = links[links.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  compactLayout.addEventListener("change", () => setMenuOpen(false));
  window.addEventListener("pageshow", () => setMenuOpen(false));
}

// Prefetch only the HTML of likely destinations; never delay a link click.
const prefetchedPages = new Set();
const prefetchPage = (event) => {
  if (navigator.connection?.saveData || /(^|-)2g$/.test(navigator.connection?.effectiveType || "")) return;
  const link = event.target.closest("a[href]");
  if (!link || link.target || link.hasAttribute("download")) return;
  const url = new URL(link.href);
  if (url.origin !== location.origin || !url.pathname.endsWith(".html") || url.pathname === location.pathname || prefetchedPages.has(url.href) || prefetchedPages.size >= 4) return;
  prefetchedPages.add(url.href);
  const hint = document.createElement("link");
  hint.rel = "prefetch";
  hint.href = url.href;
  document.head.append(hint);
};
document.addEventListener("pointerover", prefetchPage, { passive: true });
document.addEventListener("focusin", prefetchPage);

const form = document.querySelector(".contact-form");
const note = document.querySelector(".form-note");
if (form && note) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = form.querySelector(".submit");
    if (button?.disabled) return;
    note.classList.remove("is-error", "is-success");
    note.textContent = "Sending your enquiry...";
    if (button) button.disabled = true;
    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json", "X-Requested-With": "XMLHttpRequest" },
        signal: AbortSignal.timeout(20000),
      });
      const result = await response.json();
      const succeeded = response.ok && result.ok;
      note.textContent = result.message || (succeeded ? "Thank you. Your enquiry has been sent." : "Sorry, your enquiry could not be sent.");
      note.classList.add(succeeded ? "is-success" : "is-error");
      if (succeeded) form.reset();
    } catch {
      note.textContent = "Sorry, the message could not be sent. Please email info@n-vil.com directly.";
      note.classList.add("is-error");
    } finally {
      if (button) button.disabled = false;
    }
  });
}

const hero = document.querySelector(".hero");
const heroVisual = document.querySelector(".hero-visual");
if (hero && heroVisual && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
  let targetX = 0, targetY = 0, currentX = 0, currentY = 0, frame = 0;
  const reset = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    targetX = targetY = currentX = currentY = 0;
    heroVisual.style.removeProperty("--hero-parallax-x");
    heroVisual.style.removeProperty("--hero-parallax-y");
  };
  const render = () => {
    frame = 0;
    if (motionPreference.matches || compactLayout.matches || document.hidden) { reset(); return; }
    currentX += (targetX - currentX) * 0.06;
    currentY += (targetY - currentY) * 0.06;
    heroVisual.style.setProperty("--hero-parallax-x", currentX.toFixed(2) + "px");
    heroVisual.style.setProperty("--hero-parallax-y", currentY.toFixed(2) + "px");
    if (Math.abs(targetX - currentX) > 0.05 || Math.abs(targetY - currentY) > 0.05) frame = requestAnimationFrame(render);
  };
  hero.addEventListener("pointermove", (event) => {
    if (compactLayout.matches || motionPreference.matches) return;
    const rect = hero.getBoundingClientRect();
    targetX = ((event.clientX - rect.left) / rect.width - 0.5) * 24;
    targetY = ((event.clientY - rect.top) / rect.height - 0.5) * 16;
    if (!frame) frame = requestAnimationFrame(render);
  });
  hero.addEventListener("pointerleave", () => {
    targetX = targetY = 0;
    if (!frame) frame = requestAnimationFrame(render);
  });
  motionPreference.addEventListener("change", reset);
  compactLayout.addEventListener("change", reset);
  document.addEventListener("visibilitychange", () => { if (document.hidden) reset(); });
}

const scrollOrb = document.querySelector(".scroll-orb");
if (scrollOrb) {
  const updateScrollOrb = () => {
    const scrolled = window.scrollY > 8;
    scrollOrb.classList.toggle("is-up", scrolled);
    scrollOrb.setAttribute("href", scrolled ? "#before-hero" : "#after-hero");
    scrollOrb.setAttribute("aria-label", scrolled ? "Back to top" : "Scroll down");
  };
  scrollOrb.addEventListener("click", (event) => {
    if (window.scrollY > 8) {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: motionPreference.matches ? "instant" : "smooth" });
    }
  });
  updateScrollOrb();
  window.addEventListener("scroll", updateScrollOrb, { passive: true });
  window.addEventListener("pageshow", updateScrollOrb);
}

const videoModal = document.querySelector(".video-modal");
const videoFrame = document.querySelector(".video-modal__frame");
const modalVideo = document.querySelector(".video-modal__video");
const modalStatus = document.querySelector(".video-modal__status");
const videoClose = document.querySelector(".video-modal__close");
const videoPanel = document.querySelector(".video-modal__panel");
const videoCards = document.querySelectorAll(".video-card");

if (videoModal && videoClose && videoPanel && videoCards.length) {
  // Keep the fixed player outside the animated main content.
  document.body.append(videoModal);
  let opener = null;
  const setBackgroundInert = (inert) => {
    document.querySelectorAll("main, .site-header, .site-footer, .scroll-orb").forEach((el) => { el.inert = inert; });
  };
  const sizeVideoPanel = () => {
    const naturalWidth = modalVideo?.videoWidth || 1120;
    const naturalHeight = modalVideo?.videoHeight || 630;
    const viewport = window.visualViewport;
    const maxWidth = Math.max(1, (viewport?.width || window.innerWidth) - 32);
    const maxHeight = Math.max(1, (viewport?.height || window.innerHeight) - 120);
    const scale = Math.min(1, maxWidth / naturalWidth, maxHeight / naturalHeight);
    videoPanel.style.width = Math.floor(naturalWidth * scale) + "px";
    videoPanel.style.height = Math.floor(naturalHeight * scale) + "px";
  };
  const closeVideo = () => {
    videoModal.classList.remove("is-open");
    videoModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    setBackgroundInert(false);
    if (videoFrame) videoFrame.removeAttribute("src");
    if (modalVideo) {
      modalVideo.pause();
      modalVideo.removeAttribute("src");
      modalVideo.removeAttribute("poster");
      modalVideo.load();
    }
    if (modalStatus) modalStatus.textContent = "";
    opener?.focus({ preventScroll: true });
  };
  const openVideo = (card) => {
    const iframe = card.querySelector("iframe");
    const source = card.dataset.video || card.querySelector("video")?.getAttribute("src");
    if (!iframe?.getAttribute("src") && !source) return;
    opener = card;
    videoModal.classList.add("is-open");
    videoModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    setBackgroundInert(true);
    sizeVideoPanel();
    videoClose.focus({ preventScroll: true });
    if (iframe && videoFrame) {
      videoFrame.src = iframe.src;
      videoFrame.title = iframe.title || "Selected video";
    } else if (source && modalVideo) {
      modalVideo.poster = card.dataset.poster || "";
      modalVideo.title = card.dataset.title || "Selected video";
      if (modalStatus) modalStatus.textContent = "Loading video...";
      // Stream directly so playback and seeking do not wait for a full-file download.
      modalVideo.src = source;
      modalVideo.load();
      const promise = modalVideo.play();
      promise?.catch(() => {
        if (videoModal.classList.contains("is-open") && modalStatus) modalStatus.textContent = "Press play to start the video.";
      });
    }
  };
  if (modalVideo) {
    modalVideo.addEventListener("loadedmetadata", sizeVideoPanel);
    modalVideo.addEventListener("playing", () => { if (modalStatus) modalStatus.textContent = ""; });
    modalVideo.addEventListener("error", () => { if (modalStatus && modalVideo.hasAttribute("src")) modalStatus.textContent = "This video could not be loaded. Please try again."; });
  }
  window.addEventListener("resize", sizeVideoPanel);
  window.visualViewport?.addEventListener("resize", sizeVideoPanel);
  videoCards.forEach((card) => {
    const title = card.querySelector("iframe")?.title || card.dataset.title || "video";
    card.setAttribute("role", "button");
    card.tabIndex = 0;
    card.setAttribute("aria-label", "Open " + title);
    card.addEventListener("click", (event) => { event.preventDefault(); openVideo(card); });
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openVideo(card); }
    });
  });
  videoClose.addEventListener("click", closeVideo);
  videoModal.addEventListener("click", (event) => { if (event.target === videoModal) closeVideo(); });
  document.addEventListener("keydown", (event) => {
    if (!videoModal.classList.contains("is-open")) return;
    if (event.key === "Escape") closeVideo();
    if (event.key === "Tab") {
      const controls = [...videoPanel.querySelectorAll("button, video, iframe")];
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
}













