# Imagens

O hero já usa um vídeo real (`assets/video/hero.mp4`) com `hero-poster.jpg` como
capa/fallback (gerado automaticamente a partir de um frame do vídeo — pode substituir
por outra imagem se quiser uma capa diferente). A seção "Nossa história" também já
usa fotos reais (`historia-1.jpg`, `historia-2.jpg`). As demais seções ainda usam
placeholders visuais em CSS (padrão listrado com uma legenda no meio).

## Onde cada placeholder está no `index.html`

| Seção | Placeholder(s) | Nome de arquivo |
|---|---|---|
| Nossa história (`#historia`) | ✅ já usa fotos reais | `historia-1.jpg` (primeiro encontro), `historia-2.jpg` (pedido) |
| Presentes (`#presentes`) | ✅ Hero e Cota Livre usam fotos reais | `presente-puerto-escondido.jpg`, `presente-cota-livre.jpg` |
| Data e local (`#data-local`) | 1 mapa (ou screenshot do Google Maps) | `mapa.jpg` |
| Hospedagem (`#hospedagem`) | 3 fotos (uma por hospedagem) | `hospedagem-1.jpg`, `hospedagem-2.jpg`, `hospedagem-3.jpg` |
| Galeria (`#galeria`) | 6 fotos | `galeria-1.jpg` … `galeria-6.jpg` |

## Como trocar um placeholder por uma foto real

Cada placeholder é uma `<div>` com classes `ph ph--cor photo-placeholder`. Para trocar
por uma foto, substitua a `div` por uma `<img>` (ou adicione a imagem como
`background-image` na mesma div) e remova as classes `ph`/`ph--cor` e o `<span>` de
legenda. Exemplo, na seção história:

```html
<!-- antes -->
<div class="ph ph--cream photo-placeholder reveal" style="aspect-ratio:4/5;">
  <span>foto — primeiro encontro</span>
</div>

<!-- depois -->
<img class="reveal" style="aspect-ratio:4/5;object-fit:cover;" src="assets/images/historia-1.jpg" alt="">
```

## Recomendações

- Comprima as fotos (JPEG qualidade ~75–80%) para manter o carregamento rápido.
- Fotos de seção cheia (hero) até ~2000px de largura já são suficientes.
- Use `loading="lazy"` em fotos abaixo da dobra (hospedagem, galeria) para melhorar performance.
