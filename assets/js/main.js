const year = new Date().getFullYear();
document.querySelectorAll(".year").forEach((element) => {
  element.textContent = year;
});

const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".site-nav");
if (menuButton && navigation) {
  menuButton.addEventListener("click", () => {
    const isOpen = navigation.classList.toggle("is-open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.textContent = isOpen ? "Tutup" : "Menu";
  });
  navigation.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navigation.classList.remove("is-open");
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.textContent = "Menu";
    });
  });
}

const progress = document.querySelector(".scroll-progress");
const hero = document.querySelector(".hero");
let lastScrollY = window.scrollY;
let scrollFrame = null;

const updateScrollMotion = () => {
  const scrollY = window.scrollY;
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const value = scrollable > 0 ? (scrollY / scrollable) * 100 : 0;

  if (progress) {
    progress.style.width = `${value}%`;
  }

  document.body.classList.toggle("scrolling-down", scrollY > lastScrollY && scrollY > 80);
  document.body.classList.toggle("scrolling-up", scrollY < lastScrollY);
  document.body.classList.toggle("has-scrolled", scrollY > 24);

  if (hero && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const offset = Math.min(scrollY * 0.12, 90);
    hero.style.setProperty("--hero-shift", `${offset}px`);
  }

  lastScrollY = scrollY;
  scrollFrame = null;
};

window.addEventListener(
  "scroll",
  () => {
    if (scrollFrame) return;
    scrollFrame = requestAnimationFrame(updateScrollMotion);
  },
  { passive: true },
);
updateScrollMotion();

const sections = [...document.querySelectorAll("main section[id]")];
const navLinks = [...document.querySelectorAll('.site-nav a[href^="#"]')];
if (sections.length && navLinks.length) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) =>
          link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`),
        );
      });
    },
    { rootMargin: "-25% 0px -65% 0px" },
  );
  sections.forEach((section) => sectionObserver.observe(section));
}

const canAnimate =
  matchMedia("(hover: hover) and (pointer: fine)").matches &&
  !matchMedia("(prefers-reduced-motion: reduce)").matches;
if (canAnimate) {
  document.body.classList.add("has-pointer");
  window.addEventListener(
    "pointermove",
    (event) => {
      document.documentElement.style.setProperty("--cursor-x", `${event.clientX}px`);
      document.documentElement.style.setProperty("--cursor-y", `${event.clientY}px`);
    },
    { passive: true },
  );
  document.querySelectorAll("a,button,input,textarea,[data-tilt]").forEach((element) => {
    element.addEventListener("mouseenter", () => document.body.classList.add("cursor-over"));
    element.addEventListener("mouseleave", () => document.body.classList.remove("cursor-over"));
  });
  document.querySelectorAll("[data-tilt]").forEach((element) => {
    element.addEventListener("pointermove", (event) => {
      const box = element.getBoundingClientRect();
      const x = (event.clientX - box.left) / box.width - 0.5;
      const y = (event.clientY - box.top) / box.height - 0.5;
      element.style.setProperty("--rx", `${-y * 8}deg`);
      element.style.setProperty("--ry", `${x * 8}deg`);
    });
    element.addEventListener("pointerleave", () => {
      element.style.setProperty("--rx", "0deg");
      element.style.setProperty("--ry", "0deg");
    });
  });
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.12 },
);
document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

const contactForm = document.querySelector(".contact-form");
if (contactForm) {
  const submitButton = contactForm.querySelector('button[type="submit"]');
  const note = contactForm.querySelector(".form-note");

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!contactForm.reportValidity()) return;

    submitButton.disabled = true;
    submitButton.textContent = "Mengirim...";
    note.textContent = "Pesan sedang dikirim.";
    note.removeAttribute("role");

    try {
      const response = await fetch(contactForm.action, {
        method: "POST",
        body: new FormData(contactForm),
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new Error("Pengiriman gagal");

      contactForm.reset();
      note.textContent = "Pesan berhasil dikirim. Terima kasih!";
      note.setAttribute("role", "status");
    } catch {
      note.textContent = "Pesan gagal dikirim. Coba lagi beberapa saat.";
      note.setAttribute("role", "alert");
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Kirim pesan";
    }
  });
}
