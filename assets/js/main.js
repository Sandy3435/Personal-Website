/* Sandrine Ojong — portfolio interactions */
(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Header state ---------- */
  const header = $(".site-header");
  if (header) {
    const setHeader = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
    setHeader();
    window.addEventListener("scroll", setHeader, { passive: true });
  }

  /* ---------- Mobile menu ---------- */
  const menu = $("#menuDialog");
  if (menu) {
    const openBtn = $("[data-menu-open]");
    const closeBtn = $("[data-menu-close]", menu);

    const openMenu = () => {
      menu.showModal();
      document.body.style.overflow = "hidden";
      openBtn?.setAttribute("aria-expanded", "true");
      closeBtn?.focus();
    };
    const closeMenu = () => {
      menu.close();
      document.body.style.overflow = "";
      openBtn?.setAttribute("aria-expanded", "false");
      openBtn?.focus();
    };

    openBtn?.addEventListener("click", openMenu);
    closeBtn?.addEventListener("click", closeMenu);
    $$("a", menu).forEach((a) => a.addEventListener("click", closeMenu));
    menu.addEventListener("click", (e) => {
      if (e.target === menu) closeMenu();
    });
    menu.addEventListener("close", () => {
      document.body.style.overflow = "";
      openBtn?.setAttribute("aria-expanded", "false");
    });
  }

  /* ---------- Footer year ---------- */
  $$("[data-year]").forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });

  /* ---------- Reveal on scroll (used sparingly) ---------- */
  const revealEls = $$("[data-reveal]");
  if (revealEls.length) {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      revealEls.forEach((el) => el.classList.add("is-visible"));
    } else {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              io.unobserve(entry.target);
            }
          });
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
      );
      revealEls.forEach((el) => io.observe(el));
    }
  }

  /* ---------- Count-up metrics ---------- */
  const counters = $$("[data-count]");
  if (counters.length) {
    const format = (n) => n.toLocaleString("en-US");

    const run = (el) => {
      const target = Number(el.dataset.count || 0);
      const prefix = el.dataset.prefix || "";
      const suffix = el.dataset.suffix || "";
      if (reduceMotion || target === 0) {
        el.textContent = `${prefix}${format(target)}${suffix}`;
        return;
      }
      const duration = 1500;
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = `${prefix}${format(Math.round(target * eased))}${suffix}`;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    if (!("IntersectionObserver" in window)) {
      counters.forEach(run);
    } else {
      const co = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              run(entry.target);
              co.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.4 }
      );
      counters.forEach((el) => co.observe(el));
    }
  }

  /* ---------- Gallery filters ---------- */
  const filterBar = $("[data-filters]");
  const gallery = $("[data-gallery]");
  if (filterBar && gallery) {
    const buttons = $$("[data-filter]", filterBar);
    const items = $$("[data-gallery-item]", gallery);

    const apply = (value) => {
      items.forEach((item) => {
        const match = value === "all" || item.dataset.cat === value;
        item.hidden = !match;
      });
      buttons.forEach((btn) => {
        btn.setAttribute("aria-pressed", String(btn.dataset.filter === value));
      });
    };

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => apply(btn.dataset.filter));
    });
    apply("all");
  }

  /* ---------- Lightbox ---------- */
  const lightbox = $("#lightbox");
  if (lightbox && gallery) {
    const img = $("[data-lightbox-img]", lightbox);
    const title = $("[data-lightbox-title]", lightbox);
    const cat = $("[data-lightbox-cat]", lightbox);
    const closeBtn = $("[data-lightbox-close]", lightbox);
    const prevBtn = $("[data-lightbox-prev]", lightbox);
    const nextBtn = $("[data-lightbox-next]", lightbox);

    let visible = [];
    let index = 0;

    const render = () => {
      const item = visible[index];
      if (!item) return;
      img.src = item.dataset.full || $("img", item)?.src || "";
      img.alt = $("img", item)?.alt || "";
      title.textContent = item.dataset.title || "";
      cat.textContent = item.dataset.catLabel || item.dataset.cat || "";
    };

    const open = (item) => {
      visible = $$("[data-gallery-item]", gallery).filter((el) => !el.hidden);
      index = Math.max(0, visible.indexOf(item));
      render();
      lightbox.showModal();
      document.body.style.overflow = "hidden";
    };

    const close = () => {
      lightbox.close();
      document.body.style.overflow = "";
    };

    const step = (dir) => {
      if (!visible.length) return;
      index = (index + dir + visible.length) % visible.length;
      render();
    };

    $$("[data-gallery-item]", gallery).forEach((item) => {
      item.addEventListener("click", () => open(item));
      item.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open(item);
        }
      });
    });

    closeBtn?.addEventListener("click", close);
    prevBtn?.addEventListener("click", () => step(-1));
    nextBtn?.addEventListener("click", () => step(1));
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) close();
    });
    lightbox.addEventListener("close", () => {
      document.body.style.overflow = "";
    });
    lightbox.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        step(-1);
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        step(1);
      }
    });
  }

  /* ---------- Copy email ---------- */
  $$("[data-copy-email]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const email = btn.dataset.copyEmail;
      const label = $("[data-copy-label]", btn);
      const original = label ? label.textContent : "";
      try {
        await navigator.clipboard.writeText(email);
        if (label) label.textContent = "Copied";
        btn.classList.add("is-copied");
        setTimeout(() => {
          if (label) label.textContent = original;
          btn.classList.remove("is-copied");
        }, 2000);
      } catch {
        window.location.href = `mailto:${email}`;
      }
    });
  });

  /* ---------- Contact form ---------- */
  $$("form[data-contact-form]").forEach((form) => {
    const status = $("[data-form-status]", form);
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const setError = (field, message) => {
      const wrap = field.closest(".field");
      if (!wrap) return;
      wrap.classList.toggle("has-error", Boolean(message));
      const err = $(".field__error", wrap);
      if (err) err.textContent = message || "";
    };

    const validate = () => {
      let ok = true;
      $$("input[required], textarea[required], select[required]", form).forEach((field) => {
        const value = field.value.trim();
        if (!value) {
          setError(field, "Please fill this in.");
          ok = false;
        } else if (field.type === "email" && !emailRe.test(value)) {
          setError(field, "Enter a valid email address.");
          ok = false;
        } else {
          setError(field, "");
        }
      });
      return ok;
    };

    $$("input, textarea, select", form).forEach((field) => {
      field.addEventListener("input", () => {
        if (field.closest(".field")?.classList.contains("has-error")) {
          setError(field, "");
        }
      });
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!validate()) {
        const first = $(".field.has-error input, .field.has-error textarea, .field.has-error select", form);
        first?.focus();
        return;
      }

      const data = new FormData(form);
      const name = String(data.get("name") || "").trim();
      const email = String(data.get("email") || "").trim();
      const org = String(data.get("organization") || "").trim();
      const inquiry = String(data.get("inquiry") || "").trim();
      const eventDate = String(data.get("event") || "").trim();
      const message = String(data.get("message") || "").trim();

      const subject = encodeURIComponent(`Portfolio inquiry — ${inquiry || "Hello"}`);
      const body = encodeURIComponent(
        `Name: ${name}\nEmail: ${email}\nOrganization: ${org || "—"}\nType of inquiry: ${inquiry || "—"}\nEvent date: ${eventDate || "—"}\n\n${message}`
      );
      const mailto = `mailto:sandrineojongayuktabong@gmail.com?subject=${subject}&body=${body}`;

      if (status) {
        status.classList.add("is-visible");
        status.innerHTML =
          "<strong>Your note is ready to send.</strong> Your email app should open with the message filled in. If it doesn't, write to sandrineojongayuktabong@gmail.com directly.";
      }
      window.location.href = mailto;
      form.reset();
    });
  });
})();
