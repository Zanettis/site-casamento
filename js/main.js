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

  // ---------- Presentes: contribuição via Pix ----------
  //
  // TROCAR AQUI: preencha com a chave Pix real de vocês antes de publicar o
  // site. Recomendamos usar uma chave aleatória (gerada no próprio app do
  // banco) em vez do CPF, já que essa chave fica visível no código-fonte
  // público do site. "nome" e "cidade" seguem o padrão do Banco Central:
  // sem acentos, nome com até 25 caracteres, cidade com até 15 caracteres.
  const PIX_CONFIG = {
    chave: "TROCAR-AQUI-CHAVE-PIX",
    nome: "Marina e Pedro",
    cidade: "ILHABELA",
  };

  const normalizePixText = (str, maxLen) =>
    (str || "")
      .normalize("NFD")
      .replace(/[^\x20-\x7E]/g, "")
      .slice(0, maxLen)
      .trim();

  const pixTlv = (id, value) =>
    `${id}${String(value.length).padStart(2, "0")}${value}`;

  const pixCrc16 = (payload) => {
    let crc = 0xffff;
    for (let i = 0; i < payload.length; i++) {
      crc ^= payload.charCodeAt(i) << 8;
      for (let j = 0; j < 8; j++) {
        crc =
          (crc & 0x8000) !== 0 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
      }
    }
    return crc.toString(16).toUpperCase().padStart(4, "0");
  };

  const buildPixPayload = (valor, descricao) => {
    const nome = normalizePixText(PIX_CONFIG.nome, 25) || "RECEBEDOR";
    const cidade = normalizePixText(PIX_CONFIG.cidade, 15) || "CIDADE";
    const info = normalizePixText(descricao, 35);

    const merchantAccount =
      pixTlv("00", "br.gov.bcb.pix") +
      pixTlv("01", PIX_CONFIG.chave) +
      (info ? pixTlv("02", info) : "");

    const additionalData = pixTlv("05", "***");

    const payload =
      pixTlv("00", "01") +
      pixTlv("01", "11") +
      pixTlv("26", merchantAccount) +
      pixTlv("52", "0000") +
      pixTlv("53", "986") +
      pixTlv("54", Number(valor).toFixed(2)) +
      pixTlv("58", "BR") +
      pixTlv("59", nome) +
      pixTlv("60", cidade) +
      pixTlv("62", additionalData) +
      "6304";

    return payload + pixCrc16(payload);
  };

  const formatBRL = (valor) =>
    Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const presentesGrid = document.getElementById("presentes-grid");
  const presentesTemplate = document.getElementById("presentes-card-template");

  const renderPresenteCard = (presente) => {
    const node = presentesTemplate.content.cloneNode(true);
    const card = node.querySelector(".presentes-card");

    card.querySelector(".presentes-card__photo span").textContent =
      presente.categoria || "presente";
    card.querySelector(".presentes-card__category").textContent =
      presente.categoria || "";
    card.querySelector(".presentes-card__title").textContent = presente.titulo;
    card.querySelector(".presentes-card__text").textContent =
      presente.descricao || "";

    const amountsWrap = card.querySelector(".presentes-card__amounts");
    const chipsWrap = card.querySelector(".presentes-card__chips");
    const customInput = card.querySelector(".presentes-card__custom input");
    const cta = card.querySelector(".presentes-card__cta");
    const pixWrap = card.querySelector(".presentes-card__pix");
    const qrWrap = card.querySelector(".presentes-card__qr");
    const amountLabel = card.querySelector(".presentes-card__amount-label");
    const copyInput = card.querySelector(".presentes-card__copy-input");
    const copyBtn = card.querySelector(".presentes-card__copy-btn");
    const copyFeedback = card.querySelector(".presentes-card__copy-feedback");

    const ctaDefaultText =
      presente.tipo === "fixo"
        ? `Presentear · ${formatBRL(presente.valor)}`
        : "Escolher valor e presentear";
    cta.textContent = ctaDefaultText;

    let valorEscolhido = presente.tipo === "fixo" ? presente.valor : null;

    if (presente.tipo === "flexivel") {
      amountsWrap.hidden = false;

      (presente.valoresSugeridos || []).forEach((valor) => {
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "presentes-card__chip";
        chip.textContent = formatBRL(valor);
        chip.addEventListener("click", () => {
          valorEscolhido = valor;
          customInput.value = "";
          chipsWrap
            .querySelectorAll(".presentes-card__chip")
            .forEach((b) => b.classList.remove("is-active"));
          chip.classList.add("is-active");
        });
        chipsWrap.appendChild(chip);
      });

      customInput.addEventListener("input", () => {
        chipsWrap
          .querySelectorAll(".presentes-card__chip")
          .forEach((b) => b.classList.remove("is-active"));
        valorEscolhido = customInput.value ? Number(customInput.value) : null;
      });
    }

    cta.addEventListener("click", () => {
      const minimo = presente.valorMinimo || 1;

      if (!valorEscolhido || valorEscolhido < minimo) {
        cta.classList.add("presentes-card__cta--error");
        cta.textContent = `Escolha um valor de pelo menos ${formatBRL(minimo)}`;
        return;
      }

      cta.classList.remove("presentes-card__cta--error");
      cta.textContent = ctaDefaultText;

      const payload = buildPixPayload(valorEscolhido, presente.titulo);
      const qr = qrcode(0, "M");
      qr.addData(payload);
      qr.make();

      qrWrap.innerHTML = qr.createSvgTag({ cellSize: 5, margin: 2, scalable: true });
      amountLabel.textContent = `Valor: ${formatBRL(valorEscolhido)}`;
      copyInput.value = payload;
      copyFeedback.hidden = true;
      pixWrap.hidden = false;
      pixWrap.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });

    copyBtn.addEventListener("click", () => {
      copyInput.select();
      navigator.clipboard
        .writeText(copyInput.value)
        .then(() => {
          copyFeedback.textContent = "Código copiado!";
          copyFeedback.hidden = false;
        })
        .catch(() => {
          copyFeedback.textContent = "Selecione e copie manualmente.";
          copyFeedback.hidden = false;
        });
    });

    presentesGrid.appendChild(node);
  };

  if (presentesGrid && presentesTemplate && typeof qrcode === "function") {
    fetch("data/presentes.json")
      .then((res) => res.json())
      .then((presentes) => presentes.forEach(renderPresenteCard))
      .catch(() => {
        presentesGrid.textContent =
          "Não foi possível carregar a lista de presentes no momento.";
      });
  }
})();
