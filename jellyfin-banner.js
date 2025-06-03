// === CONFIG ===
const API_KEY = 'YOUR_API_KEY'; // Replace with your Jellyfin API key
const SERVER_URL = window.location.origin;

// Inject CSS
(function injectCSS() {
  const css = `
    #custom-carousel-container {
      width: 100%;
      margin: 20px 0;
      overflow: hidden;
      position: relative;
      color: white;
      font-family: Arial, sans-serif;
      user-select: none;
    }

    #custom-carousel {
      position: relative;
      width: 100%;
      max-height: 360px;
      overflow: hidden;
      border-radius: 8px;
    }

    /* Blurred full background image */
    .carousel-background {
      position: absolute;
      inset: 0;
      background-size: cover;
      background-position: center;
      filter: blur(20px) brightness(0.4);
      z-index: 0;
      transition: background-image 1s ease-in-out;
    }

    /* Foreground container with main image, title, logo */
    .carousel-foreground {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      padding: 0 60px;
      z-index: 10;
      gap: 30px;
      box-sizing: border-box;
      flex-wrap: nowrap;
      flex-direction: row;
    }

    .carousel-main-image {
      max-height: 360px;
      max-width: 640px;
      object-fit: contain;
      border-radius: 4px;
      box-shadow: 0 0 20px rgba(0,0,0,0.7);
      flex-shrink: 0;
      transition: opacity 1s ease-in-out;
      cursor: pointer;
      user-select: none;
    }

    .carousel-title {
      flex: 0 1 180px;
      font-size: 1.6rem;
      font-weight: bold;
      text-shadow: 0 0 5px rgba(0,0,0,0.8);
      white-space: normal; /* Wrap text */
      text-align: center;
      overflow-wrap: break-word;
      max-width: 180px;
      order: 0;
      margin-bottom: 0;
      cursor: pointer;
    }

    .carousel-logo {
      max-height: 160px;
      max-width: 180px;
      object-fit: contain;
      user-select: none;
      order: 1;
      cursor: pointer;
      flex-shrink: 0;
      transition: opacity 0.5s ease-in-out;
    }

    .carousel-controls {
      position: absolute;
      width: 100%;
      top: 50%;
      transform: translateY(-50%);
      display: flex;
      justify-content: space-between;
      padding: 0 10px;
      z-index: 20;
      pointer-events: none;
    }

    .carousel-button {
      background-color: rgba(0, 0, 0, 0.5);
      border: none;
      color: white;
      font-size: 2.5rem;
      cursor: pointer;
      padding: 5px 15px;
      border-radius: 5px;
      pointer-events: auto;
      user-select: none;
      transition: background-color 0.3s ease;
    }

    .carousel-button:hover {
      background-color: rgba(0,0,0,0.8);
    }

    .carousel-dots {
      position: absolute;
      bottom: 12px;
      width: 100%;
      text-align: center;
      z-index: 20;
      user-select: none;
    }

    .carousel-dot {
      display: inline-block;
      width: 14px;
      height: 14px;
      margin: 0 7px;
      background-color: rgba(255, 255, 255, 0.5);
      border-radius: 50%;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }

    .carousel-dot.active {
      background-color: white;
    }

    /* Responsive: smaller widths */
    @media (max-width: 900px) {
      #custom-carousel {
        height: auto;
        min-height: 360px;
      }

      .carousel-foreground {
        flex-direction: column;
        align-items: center;
        padding: 10px 20px;
      }

      .carousel-main-image {
        max-width: 90vw;
        max-height: 360px;
      }

      .carousel-title {
        order: 2;
        max-width: 90vw;
        white-space: normal;
        text-align: center;
        margin-top: 12px;
        margin-bottom: 8px;
        font-size: 1.4rem;
      }

      .carousel-logo {
        order: 1;
        max-height: 100px;
        max-width: 60vw;
        margin-top: 8px;
        margin-bottom: 0;
        display: block; /* Will be toggled in JS */
      }
    }
  `;
  const style = document.createElement('style');
  style.innerHTML = css;
  document.head.appendChild(style);
})();

document.addEventListener("DOMContentLoaded", function () {
  const observer = new MutationObserver(() => {
    const myMediaSection = document.querySelector('.section0');
    if (myMediaSection && !document.querySelector('#custom-carousel-container')) {
      insertCarousel(myMediaSection);
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  async function insertCarousel(myMediaSection) {
    const container = document.createElement('div');
    container.id = 'custom-carousel-container';

    const carousel = document.createElement('div');
    carousel.id = 'custom-carousel';
    container.appendChild(carousel);

    const bgDiv = document.createElement('div');
    bgDiv.className = 'carousel-background';
    carousel.appendChild(bgDiv);

    const fgDiv = document.createElement('div');
    fgDiv.className = 'carousel-foreground';
    carousel.appendChild(fgDiv);

    const mainImage = document.createElement('img');
    mainImage.className = 'carousel-main-image';
    fgDiv.appendChild(mainImage);

    const titleEl = document.createElement('div');
    titleEl.className = 'carousel-title';
    fgDiv.insertBefore(titleEl, mainImage);

    const logoImg = document.createElement('img');
    logoImg.className = 'carousel-logo';
    logoImg.style.display = 'none';
    fgDiv.appendChild(logoImg);

    const controls = document.createElement('div');
    controls.className = 'carousel-controls';

    const prevButton = document.createElement('button');
    prevButton.className = 'carousel-button';
    prevButton.innerHTML = '&#10094;';
    controls.appendChild(prevButton);

    const nextButton = document.createElement('button');
    nextButton.className = 'carousel-button';
    nextButton.innerHTML = '&#10095;';
    controls.appendChild(nextButton);

    const dots = document.createElement('div');
    dots.className = 'carousel-dots';

    container.appendChild(controls);
    container.appendChild(dots);

    myMediaSection.parentElement.insertBefore(container, myMediaSection);

    try {
      const moviesUrl = `${SERVER_URL}/Items?IncludeItemTypes=Movie&SortBy=DateCreated&SortOrder=Descending&Limit=15&Recursive=true&Fields=BackdropImageTags,ImageTags&api_key=${API_KEY}`;
      const seriesUrl = `${SERVER_URL}/Items?IncludeItemTypes=Series&SortBy=DateCreated&SortOrder=Descending&Limit=5&Recursive=true&Fields=BackdropImageTags,ImageTags&api_key=${API_KEY}`;

      const [moviesResp, seriesResp] = await Promise.all([
        fetch(moviesUrl, { headers: { 'X-Emby-Token': API_KEY } }),
        fetch(seriesUrl, { headers: { 'X-Emby-Token': API_KEY } }),
      ]);

      if (!moviesResp.ok || !seriesResp.ok) {
        throw new Error(`HTTP Error fetching items: Movies ${moviesResp.status}, Series ${seriesResp.status}`);
      }

      const moviesData = await moviesResp.json();
      const seriesData = await seriesResp.json();

      const combinedItems = [...(moviesData.Items || []), ...(seriesData.Items || [])];
      const selectedItems = shuffleArray(combinedItems).slice(0, 5);

      const slides = [];
      const dotEls = [];
      let current = 0;

      selectedItems.forEach((item, index) => {
        const backdropUrl = `${SERVER_URL}/Items/${item.Id}/Images/Backdrop?quality=80&fillWidth=888&fillHeight=360&api_key=${API_KEY}`;
        const logoUrl = item.ImageTags?.Logo ? `${SERVER_URL}/Items/${item.Id}/Images/Logo?maxHeight=200&tag=${item.ImageTags.Logo}&api_key=${API_KEY}` : null;

        slides.push({
          id: item.Id,
          name: item.Name,
          backdropUrl,
          logoUrl,
        });

        const dot = document.createElement('span');
        dot.className = 'carousel-dot';
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => {
          showSlide(index);
          resetTimer();
        });
        dots.appendChild(dot);
        dotEls.push(dot);
      });

      function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
      }

      function showSlide(index) {
        if (index < 0 || index >= slides.length) return;

        const slide = slides[index];
        bgDiv.style.backgroundImage = `url("${slide.backdropUrl}")`;
        mainImage.src = slide.backdropUrl;
        mainImage.alt = slide.name;
        titleEl.textContent = slide.name;

        if (slide.logoUrl) {
          logoImg.src = slide.logoUrl;
          logoImg.alt = `${slide.name} logo`;

          if (window.innerWidth <= 900) {

            logoImg.style.display = 'none'; 

            logoImg.onload = () => {
              const maxLogoWidth = window.innerWidth * 0.6;
              if (logoImg.naturalWidth <= maxLogoWidth) {
                logoImg.style.display = 'block';
              } else {
                logoImg.style.display = 'none';
              }
            };
          } else {
            logoImg.style.display = 'block';
          }
        } else {
          logoImg.style.display = 'none';
          logoImg.src = '';
          logoImg.alt = '';
        }

        dotEls[current].classList.remove('active');
        dotEls[index].classList.add('active');

        current = index;
      }

      function nextSlide() {
        showSlide((current + 1) % slides.length);
      }

      function prevSlide() {
        showSlide((current - 1 + slides.length) % slides.length);
      }

      let interval = setInterval(nextSlide, 7000);

      function resetTimer() {
        clearInterval(interval);
        interval = setInterval(nextSlide, 7000);
      }

      nextButton.onclick = () => {
        nextSlide();
        resetTimer();
      };

      prevButton.onclick = () => {
        prevSlide();
        resetTimer();
      };

      [mainImage, titleEl, logoImg].forEach(el => {
        el.style.cursor = 'pointer';
        el.onclick = () => {
          if (!slides[current]) return;
          window.location.href = `#!/details?id=${slides[current].id}`;
        };
      });

      if (slides.length > 0) {
        showSlide(0);
      }
    } catch (err) {
      console.error("Failed to fetch recent items:", err);
    }
  }
});