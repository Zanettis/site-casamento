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
      { threshold: 0.02, rootMargin: "0px 0px 80px 0px" }
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

  // ---------- RSVP: attending toggle & field visibility ----------
  const attendButtons = document.querySelectorAll(".attend-toggle__btn");
  const attendingInput = document.getElementById("rsvp-attending");
  const fieldGuests = document.getElementById("rsvp-field-guests");
  const fieldLodging = document.getElementById("rsvp-field-lodging");
  const rsvpSubmitBtn = document.getElementById("rsvp-submit-btn");

  attendButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      attendButtons.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      const status = btn.dataset.attend;
      attendingInput.value = status;

      if (status === "nao") {
        if (fieldGuests) fieldGuests.hidden = true;
        if (fieldLodging) fieldLodging.hidden = true;
        if (rsvpSubmitBtn) rsvpSubmitBtn.textContent = "Enviar resposta";
      } else {
        if (fieldGuests) fieldGuests.hidden = false;
        if (fieldLodging) fieldLodging.hidden = false;
        if (rsvpSubmitBtn) rsvpSubmitBtn.textContent = "Confirmar presença";
      }
    });
  });

  // ---------- RSVP: submit to Google Sheets (via Apps Script) ----------
  const GOOGLE_SHEETS_CONFIG = {
    scriptUrl: "https://script.google.com/macros/s/AKfycbx20Alb36RKCwOZRG1ic_kIJr8U1D8wMT2py-UFHUddBqGThysm-Dr4Tpvki3IadGjMow/exec",
  };

  const rsvpForm = document.getElementById("rsvp-form");
  const rsvpSuccess = document.getElementById("rsvp-success");
  const rsvpSuccessTitle = rsvpSuccess ? rsvpSuccess.querySelector(".rsvp-success__title") : null;
  const rsvpSuccessText = rsvpSuccess ? rsvpSuccess.querySelector(".rsvp-success__text") : null;
  const rsvpSuccessName = document.getElementById("rsvp-success-name");

  if (rsvpForm) {
    rsvpForm.addEventListener("submit", (e) => {
      e.preventDefault();

      if (!attendingInput.value) {
        attendButtons[0].scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }

      const isAttending = attendingInput.value === "sim";
      const lodgingInput = document.getElementById("rsvp-lodging");
      const values = {
        name: document.getElementById("rsvp-name").value.trim(),
        email: document.getElementById("rsvp-email").value.trim(),
        attending: isAttending ? "Sim, estarei lá" : "Não poderei ir",
        guests: isAttending ? document.getElementById("rsvp-guests").value : "0",
        lodging: isAttending && lodgingInput ? lodgingInput.value.trim() : "-",
        message: document.getElementById("rsvp-message").value.trim(),
      };

      const submitBtn = rsvpForm.querySelector("button[type='submit']");
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Enviando...";
      }

      // Envia os dados para a planilha Google Sheets
      if (GOOGLE_SHEETS_CONFIG.scriptUrl) {
        fetch(GOOGLE_SHEETS_CONFIG.scriptUrl, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(values),
        }).catch((err) => {
          console.warn("Erro ao enviar para Google Sheets:", err);
        });
      }

      // Feedback imediato e amigável para o convidado
      if (rsvpSuccessName) rsvpSuccessName.textContent = values.name;
      if (rsvpSuccessTitle && rsvpSuccessText) {
        if (isAttending) {
          rsvpSuccessTitle.textContent = "Presença confirmada!";
          rsvpSuccessText.innerHTML = `Obrigado, <span id="rsvp-success-name">${values.name}</span>. Mal podemos esperar para celebrar com você!`;
        } else {
          rsvpSuccessTitle.textContent = "Resposta enviada!";
          rsvpSuccessText.innerHTML = `Obrigado por nos avisar, <span id="rsvp-success-name">${values.name}</span>. Sentiremos sua falta!`;
        }
      }

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
    chave: "11910612305",
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

  const gerarAgradecimento = (presente) =>
    presente.agradecimento ||
    `Obrigado por ajudar a realizar "${presente.titulo}"! Isso significa muito pra gente.`;

  const indiceSugerido = (presente) =>
    Number.isInteger(presente.valorSugeridoIndex)
      ? presente.valorSugeridoIndex
      : Math.max(0, (presente.valoresSugeridos || []).length - 2);

  const aplicarFoto = (card, presente, photoSelector) => {
    if (!presente.imagem) return;

    const placeholder = card.querySelector(photoSelector);
    if (!placeholder) return;

    const img = document.createElement("img");
    img.className = photoSelector.slice(1);
    img.src = presente.imagem;
    img.alt = presente.titulo;
    img.loading = "lazy";
    img.style.aspectRatio = placeholder.style.aspectRatio;
    img.style.width = "100%";
    img.style.display = "block";
    img.style.objectFit = "cover";
    img.onerror = () => img.replaceWith(placeholder);

    placeholder.replaceWith(img);
  };

  const presentesProgress = document.getElementById("presentes-progress");

  const renderProgresso = (progresso) => {
    if (!presentesProgress || !progresso || !progresso.meta) return;

    const pct = Math.min(
      100,
      Math.max(0, (progresso.arrecadado / progresso.meta) * 100)
    );

    presentesProgress.querySelector(".presentes-progress__fill").style.width = `${pct}%`;
    presentesProgress.querySelector(".presentes-progress__text").textContent =
      `${formatBRL(progresso.arrecadado)} arrecadados de ${formatBRL(progresso.meta)}`;
    presentesProgress.hidden = false;
  };

  const presentesGrid = document.getElementById("presentes-grid");
  const presentesCardTemplate = document.getElementById("presentes-card-template");
  const presentesHeroContainer = document.getElementById("presentes-hero");
  const presentesHeroTemplate = document.getElementById("presentes-hero-template");

  const renderPresente = (presente, { template, container, photoSelector, titleSelector, textSelector }) => {
    const node = template.content.cloneNode(true);
    const card = node.querySelector(".presentes-card, .presentes-hero");

    aplicarFoto(card, presente, photoSelector);

    const photoSpan = card.querySelector(`${photoSelector} span`);
    if (photoSpan) photoSpan.textContent = presente.categoria || "presente";

    card.querySelector(".presentes-card__category").textContent =
      presente.categoria || "";
    card.querySelector(titleSelector).textContent = presente.titulo;
    card.querySelector(textSelector).textContent = presente.descricao || "";

    if (presente.categoria && presente.categoria.includes("Premium")) {
      card.classList.add("is-premium");
    }

    const whyEl = card.querySelector(".presentes-hero__why");
    if (whyEl) whyEl.textContent = presente.porque || "";

    const amountsWrap = card.querySelector(".presentes-card__amounts");
    const chipsWrap = card.querySelector(".presentes-card__chips");
    const customInput = card.querySelector(".presentes-card__custom input");
    const cta = card.querySelector(".presentes-card__cta");
    const pixWrap = card.querySelector(".presentes-card__pix");
    const qrWrap = card.querySelector(".presentes-card__qr");
    const amountLabel = card.querySelector(".presentes-card__amount-label");
    const thanksEl = card.querySelector(".presentes-card__thanks");
    const copyInput = card.querySelector(".presentes-card__copy-input");
    const copyBtn = card.querySelector(".presentes-card__copy-btn");
    const copyFeedback = card.querySelector(".presentes-card__copy-feedback");

    let valorEscolhido = presente.tipo === "fixo" ? presente.valor : null;

    const atualizarRotuloCta = () => {
      cta.textContent =
        presente.tipo === "fixo"
          ? `Presentear · ${formatBRL(presente.valor)}`
          : valorEscolhido
          ? `Presentear · ${formatBRL(valorEscolhido)}`
          : "Escolher valor e presentear";
    };

    if (presente.tipo === "flexivel") {
      amountsWrap.hidden = false;

      const valores = presente.valoresSugeridos || [];
      const sugeridoIdx = indiceSugerido(presente);

      valores.forEach((valor, idx) => {
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "presentes-card__chip";
        chip.textContent = formatBRL(valor);

        if (idx === sugeridoIdx) {
          chip.classList.add("is-suggested", "is-active");
          valorEscolhido = valor;
        }

        chip.addEventListener("click", () => {
          valorEscolhido = valor;
          customInput.value = "";
          chipsWrap
            .querySelectorAll(".presentes-card__chip")
            .forEach((b) => b.classList.remove("is-active"));
          chip.classList.add("is-active");
          atualizarRotuloCta();
        });
        chipsWrap.appendChild(chip);
      });

      customInput.addEventListener("input", () => {
        chipsWrap
          .querySelectorAll(".presentes-card__chip")
          .forEach((b) => b.classList.remove("is-active"));
        valorEscolhido = customInput.value ? Number(customInput.value) : null;
        atualizarRotuloCta();
      });
    }

    atualizarRotuloCta();

    cta.addEventListener("click", () => {
      const minimo = presente.valorMinimo || 1;

      if (!valorEscolhido || valorEscolhido < minimo) {
        cta.classList.add("presentes-card__cta--error");
        cta.textContent = `Escolha um valor de pelo menos ${formatBRL(minimo)}`;
        return;
      }

      cta.classList.remove("presentes-card__cta--error");
      atualizarRotuloCta();

      const payload = buildPixPayload(valorEscolhido, presente.titulo);
      if (typeof qrcode === "function") {
        try {
          const qr = qrcode(0, "M");
          qr.addData(payload);
          qr.make();
          qrWrap.innerHTML = qr.createSvgTag({ cellSize: 5, margin: 2, scalable: true });
        } catch (_) {
          qrWrap.innerHTML = "";
        }
      } else {
        qrWrap.innerHTML = "";
      }

      amountLabel.textContent = `Valor: ${formatBRL(valorEscolhido)}`;
      if (thanksEl) thanksEl.textContent = gerarAgradecimento(presente);
      copyInput.value = payload;
      copyFeedback.hidden = true;
      pixWrap.hidden = false;
      pixWrap.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });

    copyBtn.addEventListener("click", () => {
      copyInput.select();
      copyInput.setSelectionRange(0, 99999);

      const setSuccess = () => {
        copyFeedback.textContent = "✓ Código copiado com sucesso! Cole no app do seu banco.";
        copyFeedback.hidden = false;
      };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard
          .writeText(copyInput.value)
          .then(setSuccess)
          .catch(() => {
            try {
              document.execCommand("copy");
              setSuccess();
            } catch (_) {
              copyFeedback.textContent = "Selecione o código acima e copie manualmente.";
              copyFeedback.hidden = false;
            }
          });
      } else {
        try {
          document.execCommand("copy");
          setSuccess();
        } catch (_) {
          copyFeedback.textContent = "Selecione o código acima e copie manualmente.";
          copyFeedback.hidden = false;
        }
      }
    });

    container.appendChild(node);
  };

  const renderPresenteCard = (presente) =>
    renderPresente(presente, {
      template: presentesCardTemplate,
      container: presentesGrid,
      photoSelector: ".presentes-card__photo",
      titleSelector: ".presentes-card__title",
      textSelector: ".presentes-card__text",
    });

  const renderPresenteHero = (presente) =>
    renderPresente(presente, {
      template: presentesHeroTemplate,
      container: presentesHeroContainer,
      photoSelector: ".presentes-hero__photo",
      titleSelector: ".presentes-hero__title",
      textSelector: ".presentes-hero__text",
    });

  const FALLBACK_PRESENTES = {
    progresso: { arrecadado: 0, meta: 50000, atualizadoEm: "2026-10-07" },
    presentes: [
      {
        id: "estadia-puerto-escondido",
        categoria: "Puerto Escondido · Destaque",
        destaque: true,
        titulo: "Hospedagem à Beira-Mar em Puerto Escondido",
        descricao: "Nosso refúgio dos sonhos na costa do Pacífico: acordar ouvindo o mar, relaxar sob os coqueiros em La Punta e assistir ao pôr do sol inesquecível da praia nos nossos primeiros dias de casados.",
        porque: "É o nosso momento de desacelerar juntos, viver a praia e celebrar o início desse novo capítulo com a essência acolhedora e charmosa de Oaxaca.",
        tipo: "flexivel",
        imagem: "assets/images/presente-puerto-escondido.jpg",
        valoresSugeridos: [500, 1500, 3000, 5000],
        valorSugeridoIndex: 1,
        valorMinimo: 100,
        agradecimento: "¡Muchas gracias! Você está nos ajudando a viver dias mágicos em Puerto Escondido. Vamos brindar com você no coração!"
      },
      {
        id: "passagens-aereas-mexico",
        categoria: "Experiência Premium",
        destaque: false,
        titulo: "Passagens Aéreas dos Noivos — Voo México",
        descricao: "As passagens que dão asas à nossa lua de mel: o embarque rumo ao México logo após o grande dia em Ilhabela, iniciando a viagem da nossa vida com todo o conforto e carinho.",
        tipo: "flexivel",
        imagem: null,
        valoresSugeridos: [1000, 2500, 5000, 8000],
        valorSugeridoIndex: 2,
        valorMinimo: 200,
        agradecimento: "¡Muchas gracias! Você está tornando o voo dos noivos realidade! Vamos brindar a você lá no alto das nuvens!"
      },
      {
        id: "suite-master-pacifico",
        categoria: "Experiência Premium",
        destaque: false,
        titulo: "Semana em Suíte Master com Vista para o Pacífico",
        descricao: "Nossa estadia completa em suíte privativa de frente para o mar aberto, com piscina privativa, mordomia e vista cinematográfica para o pôr do sol de Puerto Escondido.",
        tipo: "flexivel",
        imagem: null,
        valoresSugeridos: [1200, 2500, 5000, 7500],
        valorSugeridoIndex: 2,
        valorMinimo: 250,
        agradecimento: "¡Qué regalo increíble! Você proporcionou momentos inesquecíveis da nossa lua de mel. Nosso eterno agradecimento!"
      },
      {
        id: "barco-snorkel-puerto-escondido",
        categoria: "Puerto Escondido",
        destaque: false,
        titulo: "Passeio de Barco & Snorkel no Pacífico",
        descricao: "Um dia navegando pela deslumbrante costa de Puerto Escondido, com snorkel nas enseadas de corais e observação de golfinhos e vida marinha.",
        tipo: "flexivel",
        imagem: null,
        valoresSugeridos: [200, 380, 600, 950],
        valorSugeridoIndex: 1,
        valorMinimo: 50,
        agradecimento: "¡Muchas gracias! Esse dia navegando pelas águas do Pacífico em Puerto Escondido vai ser inesquecível!"
      },
      {
        id: "cultura-coyoacan-frida",
        categoria: "Cidade do México",
        destaque: false,
        titulo: "Tarde na Casa Azul de Frida Kahlo & Coyoacán",
        descricao: "Passeio cultural pelas ruas floridas e charmosas de Coyoacán, visita à icônica Casa Azul de Frida Kahlo e parada para churros tradicionais e café.",
        tipo: "flexivel",
        imagem: null,
        valoresSugeridos: [200, 360, 580, 900],
        valorSugeridoIndex: 1,
        valorMinimo: 50,
        agradecimento: "¡Gracias! Mal podemos esperar para viver a história e a arte mexicana de perto."
      },
      {
        id: "tour-gastronomico-moles-oaxaca",
        categoria: "Oaxaca",
        destaque: false,
        titulo: "Tour Gastronômico de Moles & Mercados de Oaxaca",
        descricao: "Explorar a capital gastronômica do México: provar os lendários moles oaxaquenhos, tlayudas crocantes e o tradicional chocolate artesanal no Mercado 20 de Noviembre.",
        tipo: "flexivel",
        imagem: null,
        valoresSugeridos: [250, 420, 680, 1100],
        valorSugeridoIndex: 1,
        valorMinimo: 50,
        agradecimento: "¡Muchas gracias! Esse sabor autêntico de Oaxaca vai ficar marcado na nossa memória."
      },
      {
        id: "hierve-el-agua-mezcal",
        categoria: "Oaxaca",
        destaque: false,
        titulo: "Hierve el Agua & Degustação em Palenque de Mezcal",
        descricao: "Banho nas piscinas naturais infinitas de calcário com vista panorâmica para as montanhas e visita a uma destilaria artesanal com degustação de mezcal.",
        tipo: "flexivel",
        imagem: null,
        valoresSugeridos: [250, 450, 750, 1200],
        valorSugeridoIndex: 1,
        valorMinimo: 50,
        agradecimento: "Um brinde com mezcal artesanal à sua saúde e ao seu carinho!"
      },
      {
        id: "soltura-tartarugas-marinhas",
        categoria: "Puerto Escondido",
        destaque: false,
        titulo: "Soltura de Tartaruguinhas Marinhas no Pacífico",
        descricao: "Participar de um projeto de preservação ecológica ajudando filhotinhos de tartaruga marinha a darem seus primeiros passos rumo ao mar ao entardecer.",
        tipo: "flexivel",
        imagem: null,
        valoresSugeridos: [180, 350, 550, 850],
        valorSugeridoIndex: 1,
        valorMinimo: 50,
        agradecimento: "Obrigado por nos ajudar a viver esse momento tão puro e especial na natureza!"
      },
      {
        id: "jantar-romantico-pujol",
        categoria: "Cidade do México",
        destaque: false,
        titulo: "Jantar a Dois no Pujol — Alta Gastronomia Mexicana",
        descricao: "Uma noite memorável a dois no aclamado Pujol, considerado um dos melhores restaurantes do mundo, degustando o famoso Mole Madre e menu degustação contemporâneo.",
        tipo: "flexivel",
        imagem: null,
        valoresSugeridos: [250, 440, 750, 1300],
        valorSugeridoIndex: 1,
        valorMinimo: 50,
        agradecimento: "¡Muchísimas gracias! Um brinde muito especial a você nessa noite inesquecível na Cidade do México!"
      },
      {
        id: "cota-livre",
        categoria: "Contribuição livre",
        destaque: false,
        titulo: "Cota Livre — ¡Viva México!",
        descricao: "Se preferir presentear com outro valor, escolha a quantia que fizer sentido pra você. Toda ajuda constrói essa lua de mel dos nossos sonhos.",
        tipo: "flexivel",
        imagem: "assets/images/presente-cota-livre.jpg",
        valoresSugeridos: [200, 400, 1500, 5000],
        valorSugeridoIndex: 1,
        valorMinimo: 50,
        agradecimento: "Muito obrigado pelo carinho! Cada contribuição faz parte dessa viagem inesquecível."
      }
    ]
  };

  const carregarPresentes = (data) => {
    if (!data) return;
    renderProgresso(data.progresso);

    const presentes = data.presentes || [];
    const presenteDestaque = presentes.find((p) => p.destaque);
    const presentesRegulares = presentes.filter((p) => !p.destaque);

    if (presentesHeroContainer) {
      presentesHeroContainer.innerHTML = "";
      if (presenteDestaque && presentesHeroTemplate) {
        renderPresenteHero(presenteDestaque);
      }
    }

    if (presentesGrid) {
      presentesGrid.innerHTML = "";
      presentesRegulares.forEach(renderPresenteCard);
    }
  };

  if (presentesGrid && presentesCardTemplate) {
    fetch("data/presentes.json")
      .then((res) => {
        if (!res.ok) throw new Error("Status " + res.status);
        return res.json();
      })
      .then((data) => carregarPresentes(data))
      .catch((err) => {
        console.warn("Carregando lista de presentes pelo fallback:", err);
        carregarPresentes(FALLBACK_PRESENTES);
      });
  }

  // ---------- Presentes: botão fixo "Presentear" ----------
  const presentearFloater = document.getElementById("presentear-floater");
  const presentesSection = document.getElementById("presentes");

  if (presentearFloater && hero && presentesSection) {
    let floaterTicking = false;

    const updateFloater = () => {
      const pastHero = window.scrollY > hero.offsetHeight;
      const rect = presentesSection.getBoundingClientRect();
      const inPresentesView = rect.top < window.innerHeight && rect.bottom > 0;
      presentearFloater.hidden = !pastHero || inPresentesView;
      floaterTicking = false;
    };

    window.addEventListener(
      "scroll",
      () => {
        if (!floaterTicking) {
          window.requestAnimationFrame(updateFloater);
          floaterTicking = true;
        }
      },
      { passive: true }
    );
  }

  // ---------- Galeria / Momentos & Lightbox ----------
  const galleryGrid = document.getElementById("gallery-grid");
  const lightbox = document.getElementById("gallery-lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxTitle = document.getElementById("lightbox-title");
  const lightboxSubtitle = document.getElementById("lightbox-subtitle");
  const lightboxCounter = document.getElementById("lightbox-counter");

  if (galleryGrid && lightbox) {
    let galleryItems = [];
    let currentIndex = 0;

    const coletarItensGaleria = () => {
      const figures = galleryGrid.querySelectorAll(".gallery-item");
      galleryItems = Array.from(figures).map((fig) => {
        const img = fig.querySelector("img");
        const title = fig.querySelector(".gallery-item__title");
        const subtitle = fig.querySelector(".gallery-item__subtitle");
        return {
          src: img ? img.src : "",
          alt: img ? img.alt : "",
          title: title ? title.textContent : "",
          subtitle: subtitle ? subtitle.textContent : "",
        };
      });
    };

    coletarItensGaleria();

    const atualizarLightbox = (idx) => {
      if (idx < 0) idx = galleryItems.length - 1;
      if (idx >= galleryItems.length) idx = 0;
      currentIndex = idx;

      const item = galleryItems[currentIndex];
      if (!item) return;

      lightboxImg.src = item.src;
      lightboxImg.alt = item.alt;
      lightboxTitle.textContent = item.title;
      lightboxSubtitle.textContent = item.subtitle;
      lightboxCounter.textContent = `${currentIndex + 1} / ${galleryItems.length}`;
    };

    const abrirLightbox = (idx) => {
      coletarItensGaleria();
      atualizarLightbox(idx);
      lightbox.hidden = false;
      lightbox.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    };

    const fecharLightbox = () => {
      lightbox.hidden = true;
      lightbox.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    };

    galleryGrid.addEventListener("click", (e) => {
      const fig = e.target.closest(".gallery-item");
      if (!fig) return;
      const idx = Array.from(galleryGrid.querySelectorAll(".gallery-item")).indexOf(fig);
      if (idx !== -1) abrirLightbox(idx);
    });

    galleryGrid.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        const fig = e.target.closest(".gallery-item");
        if (fig) {
          e.preventDefault();
          const idx = Array.from(galleryGrid.querySelectorAll(".gallery-item")).indexOf(fig);
          if (idx !== -1) abrirLightbox(idx);
        }
      }
    });

    lightbox.addEventListener("click", (e) => {
      const action = e.target.dataset.action;
      if (action === "close") fecharLightbox();
      else if (action === "prev") atualizarLightbox(currentIndex - 1);
      else if (action === "next") atualizarLightbox(currentIndex + 1);
    });

    window.addEventListener("keydown", (e) => {
      if (lightbox.hidden) return;
      if (e.key === "Escape") fecharLightbox();
      else if (e.key === "ArrowLeft") atualizarLightbox(currentIndex - 1);
      else if (e.key === "ArrowRight") atualizarLightbox(currentIndex + 1);
    });

    let touchStartX = 0;
    let touchEndX = 0;
    lightbox.addEventListener(
      "touchstart",
      (e) => {
        touchStartX = e.changedTouches[0].screenX;
      },
      { passive: true }
    );
    lightbox.addEventListener(
      "touchend",
      (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchEndX - touchStartX;
        if (Math.abs(diff) > 40) {
          if (diff > 0) atualizarLightbox(currentIndex - 1);
          else atualizarLightbox(currentIndex + 1);
        }
      },
      { passive: true }
    );
  }
})();
