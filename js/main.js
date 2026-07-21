(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // ---------- Scroll reveal ----------
  const revealEls = document.querySelectorAll(".reveal");

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("visible"));
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );

    revealEls.forEach((el) => observer.observe(el));
  }

  // ---------- Hero parallax (subtle) ----------
  const heroBg = document.querySelector(".hero__bg");
  const hero = document.querySelector(".hero");

  if (heroBg && hero && !prefersReducedMotion) {
    let ticking = false;

    const updateParallax = () => {
      const heroHeight = hero.offsetHeight;
      const scrollY = window.scrollY;

      if (scrollY <= heroHeight) {
        const offset = scrollY * 0.25;
        heroBg.style.transform = `translateY(${offset}px) scale(1.08)`;
      }
      ticking = false;
    };

    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          window.requestAnimationFrame(updateParallax);
          ticking = true;
        }
      },
      { passive: true }
    );
  }

  // ---------- Countdown ----------
  const countdownEl = document.getElementById("countdown");

  if (countdownEl) {
    const weddingDate = new Date(countdownEl.dataset.weddingDate).getTime();
    const daysEl = countdownEl.querySelector("[data-days]");
    const hoursEl = countdownEl.querySelector("[data-hours]");
    const minutesEl = countdownEl.querySelector("[data-minutes]");
    const secondsEl = countdownEl.querySelector("[data-seconds]");

    const pad = (n) => String(n).padStart(2, "0");

    const tick = () => {
      const distance = weddingDate - Date.now();

      if (Number.isNaN(weddingDate) || distance <= 0) {
        [daysEl, hoursEl, minutesEl, secondsEl].forEach((el) => {
          if (el) el.textContent = "00";
        });
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((distance / (1000 * 60)) % 60);
      const seconds = Math.floor((distance / 1000) % 60);

      if (daysEl) daysEl.textContent = pad(days);
      if (hoursEl) hoursEl.textContent = pad(hours);
      if (minutesEl) minutesEl.textContent = pad(minutes);
      if (secondsEl) secondsEl.textContent = pad(seconds);
    };

    tick();
    setInterval(tick, 1000);
  }

  // ---------- FAQ accordion ----------
  document.querySelectorAll(".faq-item").forEach((item) => {
    const question = item.querySelector(".faq-item__question");
    const icon = item.querySelector(".faq-item__icon");

    question.addEventListener("click", () => {
      const isOpen = item.classList.contains("is-open");
      item.classList.toggle("is-open", !isOpen);
      icon.textContent = isOpen ? "+" : "−";
    });
  });

  // ---------- RSVP: attending toggle ----------
  const attendButtons = document.querySelectorAll(".attend-toggle__btn");
  const attendingInput = document.getElementById("rsvp-attending");

  attendButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      attendButtons.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      attendingInput.value = btn.dataset.attend;
    });
  });

  // ---------- RSVP: submit to Google Form ----------
  //
  // TROCAR AQUI: preencha com a URL e os IDs de campo reais do seu Google Form.
  // 1. Crie o formulário em forms.google.com com os campos: Nome, E-mail,
  //    Presença, Acompanhantes, Mensagem.
  // 2. Pegue o link do formulário (Enviar > ícone de link) e troque
  //    "/viewform" por "/formResponse" abaixo em actionUrl.
  // 3. Para achar cada "entry.XXXXXXX": inspecione o HTML do formulário
  //    publicado e copie o atributo name de cada <input>/<textarea>/<select>.
  const GOOGLE_FORM_CONFIG = {
    actionUrl:
      "https://docs.google.com/forms/d/e/COLOQUE-SEU-FORM-ID-AQUI/formResponse",
    entries: {
      name: "entry.SUBSTITUA_PELO_ID_NOME",
      email: "entry.SUBSTITUA_PELO_ID_EMAIL",
      attending: "entry.SUBSTITUA_PELO_ID_PRESENCA",
      guests: "entry.SUBSTITUA_PELO_ID_ACOMPANHANTES",
      message: "entry.SUBSTITUA_PELO_ID_MENSAGEM",
    },
  };

  const rsvpForm = document.getElementById("rsvp-form");
  const rsvpSuccess = document.getElementById("rsvp-success");
  const rsvpSuccessName = document.getElementById("rsvp-success-name");

  if (rsvpForm) {
    rsvpForm.addEventListener("submit", (e) => {
      e.preventDefault();

      if (!attendingInput.value) {
        attendButtons[0].scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }

      const values = {
        name: document.getElementById("rsvp-name").value,
        email: document.getElementById("rsvp-email").value,
        attending: attendingInput.value,
        guests: document.getElementById("rsvp-guests").value,
        message: document.getElementById("rsvp-message").value,
      };

      const hiddenForm = document.createElement("form");
      hiddenForm.action = GOOGLE_FORM_CONFIG.actionUrl;
      hiddenForm.method = "POST";
      hiddenForm.target = "hidden_iframe";

      Object.entries(values).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = GOOGLE_FORM_CONFIG.entries[key];
        input.value = value;
        hiddenForm.appendChild(input);
      });

      document.body.appendChild(hiddenForm);
      hiddenForm.submit();
      hiddenForm.remove();

      rsvpSuccessName.textContent = values.name;
      rsvpForm.hidden = true;
      rsvpSuccess.hidden = false;
      rsvpSuccess.classList.add("visible");
    });
  }
})();
