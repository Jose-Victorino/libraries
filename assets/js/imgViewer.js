(() => {
  const article = document.createElement('article');
  article.setAttribute('data-bimIVM', '');
  article.style.display = 'none';
  document.body.append(article);

  article.innerHTML = `
  <div class="bimivm-toolbar" style="display: flex; justify-content: space-between; align-items: center; padding-inline: 20px 30px;">
    <div class="bimivm-left" style="display: flex;">
      <div class="bimivm-counterCont" style="color: white; display: inline-flex; gap: 4px; height: fit-content; user-select: none">
        <span class="bimivm-currentCount" style="display: inline-flex; justify-content: end;"></span>
        <span>/</span>
        <span class="bimivm-maxCount" style="display: inline-flex;"></span>
      </div>
    </div>
    <div class="bimivm-right" style="display: flex;">
      <div class="bimivm-zoomCont" style="display: flex";>
        <svg class="bimivm-btn zoomBtn" style="cursor: pointer;" fill="hsl(222, 13%, 86%)" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"/></svg>
      </div>
      <div class="bimivm-slideshowCont" style="display: flex";>
        <svg class="bimivm-btn bimivm-slideshowBtn" style="cursor: pointer;" fill="hsl(222, 13%, 86%)" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80V432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"/></svg>
      </div>
      <div class="bimivm-collapseCont" style="display: flex";>
        <svg class="bimivm-btn bimivm-collapseBtn" style="cursor: pointer;" fill="hsl(222, 13%, 86%)" xmlns="http://www.w3.org/2000/svg" class="ionicon" viewBox="0 0 512 512"><path d="M104 160a56 56 0 1156-56 56.06 56.06 0 01-56 56zM256 160a56 56 0 1156-56 56.06 56.06 0 01-56 56zM408 160a56 56 0 1156-56 56.06 56.06 0 01-56 56zM104 312a56 56 0 1156-56 56.06 56.06 0 01-56 56zM256 312a56 56 0 1156-56 56.06 56.06 0 01-56 56zM408 312a56 56 0 1156-56 56.06 56.06 0 01-56 56zM104 464a56 56 0 1156-56 56.06 56.06 0 01-56 56zM256 464a56 56 0 1156-56 56.06 56.06 0 01-56 56zM408 464a56 56 0 1156-56 56.06 56.06 0 01-56 56z"/></svg>
      </div>
      <div class="bimivm-closeCont" style="display: flex";>
        <svg class="bimivm-btn bimivm-closeBtn" style="cursor: pointer;" fill="hsl(222, 13%, 86%)" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>
      </div>
    </div>
  </div>
  <div class="bimivm-middle" style="display: flex; justify-content: center; align-items: center;">
    <div class="bimivm-arrow bimivm-prevCont" style="display: flex; align-items: center; height: 100%; cursor: pointer;">
      <svg class="bimivm-btn bimivm-prevBtn" xmlns="http://www.w3.org/2000/svg" fill="hsl(0, 0%, 90%)" viewBox="0 0 320 512"><path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l192 192c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 246.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192z"/></svg>
    </div>
    <div class="bimivm-imgCont" style="display: flex; justify-content: center; align-items: center; height: 100%; width: 100%;">
      <img class="bimivm-selectedImg" style="object-fit: contain; user-select: none;" alt="Selected Image">
    </div>
    <div class="bimivm-arrow bimivm-nextCont" style="display: flex; align-items: center; height: 100%; cursor: pointer;">
      <svg class="bimivm-btn bimivm-nextBtn" xmlns="http://www.w3.org/2000/svg" fill="hsl(0, 0%, 90%)" viewBox="0 0 320 512"><path d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z"/></svg>
    </div>
  </div>
  <div class="bimivm-thumbnailWrapper">
    <div class="bimivm-thumbnailCont" style="height: 100%; transition: transform 0.3s;">
      <ul class="bimivm-thumbnails" style="display: flex; height: 100%; width: fit-content; user-select: none;"></ul>
    </div>
  </div>`;

  const currentCount = article.querySelector('.bimivm-currentCount');
  const maxCount = article.querySelector('.bimivm-maxCount');
  const selectedImg = article.querySelector('.bimivm-selectedImg');
  const nextArrDiv = article.querySelector('.bimivm-nextCont');
  const prevArrDiv = article.querySelector('.bimivm-prevCont');
  const nextBtn = article.querySelector('.bimivm-nextBtn');
  const prevBtn = article.querySelector('.bimivm-prevBtn');
  const thumbnailDiv = article.querySelector('.bimivm-thumbnailCont');
  const ul = article.querySelector('.bimivm-thumbnails');
  let images, currentImg, thumbnails;

  for(const ulIV of document.querySelectorAll('[data-bimIV]')){
    ulIV.addEventListener('click', (e) => {
      const img = e.target.closest('img[data-bimIV-mainImg]');
      if(!img) return;

      images = [...ulIV.querySelectorAll('[data-bimIV-mainImg]')];    
      currentImg = images.indexOf(img);
      ul.innerHTML = '';

      createUI();
      updateState();
    });
  }
  const createUI = () => {
    /*
      1. toggle zoom
      2. slideshow
      - revise styles on selected images (remove opacity & bg, add borders)
      - add next & prev img animations
    */
    article.style.display = 'grid';
    currentCount.style.width = maxCount.style.width = Math.floor(Math.log10(images.length)) + 1;
    currentCount.innerText = currentImg + 1;
    maxCount.innerText = images.length;

    images.forEach(({src, alt}) => {
      const li = document.createElement('li');
      const img = document.createElement('img');
      
      Object.assign(img, {src, alt});
      
      li.append(img);
      ul.append(li);
    });
    thumbnails = [...ul.children];
  };
  const updateState = () => {
    selectedImg.src = images[currentImg].src;
    currentCount.innerText = currentImg + 1;
    thumbnailDiv.style.setProperty('--currentImg', currentImg);

    thumbnails.forEach((li, i) => {
      li.children[0].style.opacity = (i === currentImg) ? '' : '0.3';
      li.classList.toggle('active', i === currentImg);
    });
  };
  const changeImage = (direction) => {
    currentImg = Math.max(0, Math.min(images.length - 1, currentImg + direction));
    updateState();
  };
  article.addEventListener('click', (e) => {
    if(!e.target.closest('.bimivm-selectedImg, .bimivm-thumbnailWrapper, .bimivm-arrow, .bimivm-left, .bimivm-zoomCont, .bimivm-slideshowCont, .bimivm-collapseCont') || e.target.closest('.bimivm-closeCont')){
      article.style.display = '';
      return;
    }
    
    const li = e.target.closest('.bimivm-thumbnails li');
    if(li){
      currentImg = thumbnails.indexOf(li);
      updateState();
    }
    else if(e.target.closest('.bimivm-collapseBtn'))
      article.classList.toggle('collapse');
    else if(e.target.closest('.bimivm-nextCont'))
      changeImage(1);
    else if(e.target.closest('.bimivm-prevCont'))
      changeImage(-1);
  });
  article.addEventListener('wheel', (e) => changeImage(e.deltaY > 0 ? 1 : -1));

  const handleArrowHover = (arrowDiv, btn, direction, condition) => {
    arrowDiv.addEventListener('mouseover', () => {
      if(condition()) return;
      Object.assign(btn.style, {
        transform: `translateX(${direction}50%)`,
        transition: 'transform 0.3s cubic-bezier(.25,1.67,.75,-0.67)',
      });
    });
    arrowDiv.addEventListener('mouseout', () => {
      Object.assign(btn.style, {
        transform: '',
        transition: 'transform 0.3s ease',
      });
    });
  };
  if(!WURFL?.is_mobile){ // <script src="https://wurfl.io/wurfl.js"></script>
    handleArrowHover(nextArrDiv, nextBtn, '', () => currentImg + 1 >= images.length);
    handleArrowHover(prevArrDiv, prevBtn, '-', () => currentImg < 1);
  }
})();