# Imagens

O hero já usa um vídeo real (`assets/video/hero.mp4`) com `hero-poster.jpg` como
capa/fallback. A seção "Nossa história" também já usa fotos reais (`historia-1.jpg`, `historia-2.jpg`).
A seção "Presentes" usa fotos reais para o destaque de Puerto Escondido e Cota Livre.
A seção "Momentos" agora conta com uma galeria de fotos reais e visualizador Lightbox em tela cheia!

## Onde cada imagem está organizada

| Seção | Status | Diretório e Arquivos |
|---|---|---|
| Nossa história (`#historia`) | ✅ Fotos reais | `assets/images/historia-1.jpg`, `historia-2.jpg` |
| Presentes (`#presentes`) | ✅ Fotos reais | `assets/images/presente-puerto-escondido.jpg`, `presente-cota-livre.jpg` |
| Momentos / Galeria (`#galeria`) | ✅ Fotos reais + Lightbox | `assets/images/galeria/momento-01.jpg` até `momento-05.jpg` (controlado em `data/momentos.json` e `index.html`) |
| Data e local (`#data-local`) | Mapa interativo Google Maps | Incorporado via iframe |
| Hospedagem (`#hospedagem`) | Destaque Casa di Sirena + Pousadas | Links diretos |

## Como adicionar novas fotos na seção de Momentos

1. **Salvar a foto:** Salve o arquivo de imagem na pasta `assets/images/galeria/` (ex: `momento-06.jpg`, `momento-07.jpg`).
2. **Adicionar no `data/momentos.json`:** Adicione um item com título e legenda:
   ```json
   {
     "id": 6,
     "src": "assets/images/galeria/momento-06.jpg",
     "alt": "Descrição da foto",
     "titulo": "Título do momento",
     "legenda": "Pequena frase ou local"
   }
   ```
3. **Adicionar no `index.html`:** Dentro de `<div class="gallery-grid" id="gallery-grid">`:
   ```html
   <figure class="gallery-item reveal" data-index="5" tabindex="0" role="button" aria-label="Ver foto: Título">
     <img src="assets/images/galeria/momento-06.jpg" alt="Descrição da foto" loading="lazy">
     <figcaption class="gallery-item__caption">
       <span class="gallery-item__title">Título do momento</span>
       <span class="gallery-item__subtitle">Pequena frase ou local</span>
     </figcaption>
   </figure>
   ```

## Recomendações
- Prefira fotos verticais (proporção 4:5 ou 3:4) para manter a harmonia visual da grade.
- Comprima as fotos (JPEG qualidade ~75–80%, entre 150KB e 300KB) para garantir carregamento instantâneo no celular.
- O lightbox em tela cheia funciona automaticamente com qualquer foto adicionada com a classe `.gallery-item`.
