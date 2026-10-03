# site-casamento

Site de casamento de página única (Marina & Pedro, 20/02/2027, Casa de Canoa — Praia do Curral, Ilhabela/SP). Estático, sem build, hospedável em qualquer servidor de arquivos.

## Stack

- HTML + CSS + JavaScript puro (vanilla, IIFE em `js/main.js`). Sem `package.json`, sem bundler, sem framework.
- `js/vendor/qrcode.js` — lib de terceiros (Kazuhiko Arase) vendorizada para gerar QR code do Pix no navegador.
- Google Fonts via CDN (Cormorant Garamond + Jost). Google Maps embutido via `<iframe>` (sem API key).
- Idioma do conteúdo, comentários e commits: português (`lang="pt-BR"`).

## Estrutura

- `index.html` — todo o markup, seção por seção (ver abaixo).
- `css/style.css` — estilos, incluindo as classes de placeholder de foto (`.ph`, `.ph--cream/green/terracotta/dark`, `.photo-placeholder`).
- `js/main.js` — toda a lógica do site (ver "Funcionalidades").
- `data/presentes.json` — conteúdo da lista de presentes, consumido via `fetch` em `main.js`.
- `assets/images/` — fotos do site. Ver [assets/images/README.md](assets/images/README.md) para o mapeamento de qual placeholder fica em cada seção e como trocá-lo por uma foto real.
- `assets/video/hero.mp4` — vídeo de fundo do hero (versão comprimida, versionada). `hero-original.mp4` e `hero-previous.mp4` são versões grandes/backup, ignoradas via `.gitignore`.

## Seções do `index.html`

`#inicio` (hero com vídeo + nomes) → quote → `#historia` (2 fotos + countdown) → `#data-local` (horários, traje, mapa) → `#rsvp` (formulário) → `#presentes` (lista de presentes/Pix) → `#hospedagem` (hospedagem dos noivos + 3 opções) → `#balsa` (guia da balsa, hora marcada, câmeras ao vivo, TPA e dicas) → `#galeria` (6 fotos) → `#faq` (accordion) → footer.

A maior parte das fotos ainda é placeholder CSS (`div.ph.ph--cor.photo-placeholder`). O hero já usa vídeo/poster reais.

## Funcionalidades (`js/main.js`)

- **Scroll reveal**: `IntersectionObserver` adiciona `.visible` em elementos `.reveal` (com fallback instantâneo se `prefers-reduced-motion` ou sem suporte a `IntersectionObserver`).
- **Parallax do hero**: leve `translateY`/`scale` em `.hero__bg` no scroll, com `requestAnimationFrame`.
- **Countdown**: lê `data-wedding-date` em `#countdown`, atualiza dias/horas/min/seg a cada segundo (`tick()`).
- **Accordion FAQ**: toggle de `.is-open` por `.faq-item`, troca ícone `+`/`−`.
- **RSVP**: toggle de presença (`.attend-toggle__btn`) e submissão via `GOOGLE_FORM_CONFIG` (POST para um Google Form através de um `<iframe>` oculto, evitando problema de CORS).
- **Lista de presentes / Pix**: busca `data/presentes.json`, renderiza o presente em destaque (`renderPresenteHero`) e os demais (`renderPresenteCard`) a partir de `<template>` no HTML. Gera o payload Pix (padrão EMV/BR Code do Banco Central) inteiramente no cliente via `buildPixPayload`/`pixTlv`/`pixCrc16`, desenha o QR code com a lib vendorizada e oferece "Pix copia e cola". Também renderiza a barra de progresso de arrecadação (`renderProgresso`) a partir de `progresso` no JSON.
- **Botão flutuante "Presentear"**: aparece após passar do hero, some quando a seção `#presentes` está visível.

## `data/presentes.json` — schema

```
progresso: { arrecadado, meta, atualizadoEm }
presentes: [
  { id, categoria, destaque (bool — só um presente deve ter true, vira o "hero"),
    titulo, descricao, porque?, tipo: "flexivel" | "fixo",
    imagem (path ou null), valoresSugeridos: number[], valorSugeridoIndex,
    valorMinimo, agradecimento? }
]
```

## Estado atual / pendências conhecidas

- **RSVP funcional**: Formulário integrado diretamente ao Google Forms (`1FAIpQLSfGcgDMAFCDySuMogu74N8HLmCFb6yXr0PSsM-FzZ9x8EojEQ`) com campos Nome, E-mail, Presença (Sim/Não), Acompanhantes, Hospedagem e Mensagem via iframe oculto (sem backend/sem CORS).
- Seção `#historia` já usa fotos reais e comprimidas (`assets/images/historia-1.jpg`, `historia-2.jpg`, ~150–460 KB). As versões originais em resolução total ficam como `assets/images/*-original.jpg`, gitignoradas (mesmo padrão do vídeo do hero).
- Nenhum presente em `data/presentes.json` tem `imagem` definida (todos `null`) — ainda usam placeholder.
- **Chave Pix real está hardcoded** em `js/main.js` (`PIX_CONFIG.chave`), visível no código-fonte client-side — é intencional (não há backend), mas o próprio comentário no código recomenda usar uma chave aleatória em vez do CPF.

## Convenções

- Sem processo de build/lint/test — edite os arquivos diretamente e abra `index.html`.
- Mantenha o conteúdo e os comentários de código em português, seguindo o padrão já usado no projeto.
