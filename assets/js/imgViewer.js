class imageViewer{
  constructor(list){
    this.list = list;
    this.images = [...list.querySelectorAll('[data-bimIV-mainImg]')];
    this.currentImg = 0;

    this.#createUI();
    this.#initHandlers();
  }
  #createUI(){
    this.article = document.createElement('article');
    this.article.setAttribute('data-bimIVM', '');
    document.body.append(this.article);
    /*
    1. counter (done)
    2. toggle zoom
    3. slideshow
    4. collapse thumbnailCont
    5. close (done)
    */
    /*
    - revise styles on selected images (remove opacity & bg, add borders)
    - add next & prev img animations
    */
   this.article.innerHTML = `
    <div class="toolbar" style="display: flex; justify-content: space-between; align-items: center; padding-inline: 20px 30px;">
      <div class="left" style="display: flex;">
        <div class="counterCont" style="color: white; display: inline-flex; gap: 4px; height: fit-content; user-select: none">
          <span class="currentCount" style="display: inline-flex; justify-content: end; width: ${Math.floor(Math.log10(this.images.length)) + 1}ch;">${this.currentImg + 1}</span>
          <span>/</span>
          <span class="maxCount" style="display: inline-flex; width: ${Math.floor(Math.log10(this.images.length)) + 1}ch;">${this.images.length}</span>
        </div>
      </div>
      <div class="right" style="display: flex;">
        <div class="zoomCont" style="display: flex";>
          <svg class="btn zoomBtn" style="cursor: pointer;" fill="hsl(222, 13%, 86%)" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"/></svg>
        </div>
        <div class="slideshowCont" style="display: flex";>
          <svg class="btn slideshowBtn" style="cursor: pointer;" fill="hsl(222, 13%, 86%)" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80V432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"/></svg>
        </div>
        <div class="collapseCont" style="display: flex";>
          <svg class="btn collapseBtn" style="cursor: pointer;" fill="hsl(222, 13%, 86%)" xmlns="http://www.w3.org/2000/svg" class="ionicon" viewBox="0 0 512 512"><path d="M104 160a56 56 0 1156-56 56.06 56.06 0 01-56 56zM256 160a56 56 0 1156-56 56.06 56.06 0 01-56 56zM408 160a56 56 0 1156-56 56.06 56.06 0 01-56 56zM104 312a56 56 0 1156-56 56.06 56.06 0 01-56 56zM256 312a56 56 0 1156-56 56.06 56.06 0 01-56 56zM408 312a56 56 0 1156-56 56.06 56.06 0 01-56 56zM104 464a56 56 0 1156-56 56.06 56.06 0 01-56 56zM256 464a56 56 0 1156-56 56.06 56.06 0 01-56 56zM408 464a56 56 0 1156-56 56.06 56.06 0 01-56 56z"/></svg>
        </div>
        <div class="closeCont" style="display: flex";>
          <svg class="btn closeBtn" style="cursor: pointer;" fill="hsl(222, 13%, 86%)" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>
        </div>
      </div>
    </div>
    <div class="middle" style="display: flex; justify-content: center; align-items: center;">
      <div class="arrow prevCont" style="display: flex; align-items: center; height: 100%; cursor: pointer;">
        <svg class="btn prevBtn" xmlns="http://www.w3.org/2000/svg" fill="hsl(0, 0%, 90%)" viewBox="0 0 320 512"><path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l192 192c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 246.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192z"/></svg>
      </div>
      <div class="imgCont" style="display: flex; justify-content: center; align-items: center; height: 100%; width: 100%;">
        <img class="selectedImg" style="object-fit: contain; user-select: none;">
      </div>
      <div class="arrow nextCont" style="display: flex; align-items: center; height: 100%; cursor: pointer;">
        <svg class="btn nextBtn" xmlns="http://www.w3.org/2000/svg" fill="hsl(0, 0%, 90%)" viewBox="0 0 320 512"><path d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z"/></svg>
      </div>
    </div>
    <div class="thumbnailWrapper">
      <div class="thumbnailCont" style="height: 100%; transition: transform 0.3s;">
        <ul class="thumbnails" style="display: flex; height: 100%; width: fit-content; user-select: none;"></ul>
      </div>
    </div>`;

    this.currentCount = this.article.querySelector('.currentCount');
    this.zoomBtn = this.article.querySelector('.zoomBtn');
    this.slideshowBtn = this.article.querySelector('.slideshowBtn');
    this.collapseBtn = this.article.querySelector('.collapseBtn');
    this.closeBtn = this.article.querySelector('.closeBtn');
    this.midDiv = this.article.querySelector('.middle');
    this.imgSelectedDiv = this.article.querySelector('.imgCont');
    this.selectedImg = this.article.querySelector('.selectedImg');
    this.nextArrDiv = this.article.querySelector('.nextCont');
    this.prevArrDiv = this.article.querySelector('.prevCont');
    this.nextBtn = this.article.querySelector('.nextBtn');
    this.prevBtn = this.article.querySelector('.prevBtn');
    this.thumbnailDiv = this.article.querySelector('.thumbnailCont');
    this.ul = this.article.querySelector('.thumbnails');

    this.images.forEach(({src, alt}) => {
      const li = document.createElement('li');
      const img = document.createElement('img');
      
      Object.assign(img, {src, alt});
      
      li.append(img);
      this.ul.append(li);
    });
    this.thumbnails = [...this.ul.children];
  }
  #initHandlers(){
    const {list, article, zoomBtn, slideshowBtn, collapseBtn, closeBtn, midDiv, nextArrDiv, prevArrDiv, nextBtn, prevBtn, ul, thumbnails, images} = this;
    const updateState = () => {
      const {thumbnails, images, currentImg} = this;
      const {src, alt} = images[currentImg];
  
      Object.assign(this.selectedImg, {src, alt});
      
      this.currentCount.innerText = currentImg + 1;
      this.thumbnailDiv.style.setProperty('--currentImg', currentImg);

      thumbnails.forEach((li, i) => {
        li.children[0].style.opacity = (i === currentImg) ? '' : '0.3';
        li.classList.toggle('active', i === currentImg);
      });
    }
    list.addEventListener('click', (e) => {
      const img = e.target.closest('img[data-bimIV-mainImg]');
      if(!img) return;

      this.currentImg = images.indexOf(img);
      article.style.display = 'grid';
      updateState();
    });
    closeBtn.addEventListener('click', () => {
      article.style.display = '';
    });
    article.addEventListener('click', (e) => {
      if(!e.target.closest('.selectedImg, .thumbnailWrapper, .arrow, .left, .zoomCont, .slideshowCont, .collapseCont'))
        article.style.display = '';
    });

    const changeImage = (direction) => {
      this.currentImg = Math.max(0, Math.min(this.images.length - 1, this.currentImg + direction));
      updateState();
    }
    article.addEventListener('wheel', (e) => changeImage(e.deltaY > 0 ? 1 : -1));
    nextArrDiv.addEventListener('click', () => changeImage(1));
    prevArrDiv.addEventListener('click', () => changeImage(-1));
    collapseBtn.addEventListener('click', () => article.classList.toggle('collapse'));

    ul.addEventListener('click', (e) => {
      const target = e.target.closest('li');
      if(!target) return;

      this.currentImg = thumbnails.indexOf(target);
      updateState();
    });

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
    }
    if(!WURFL.is_mobile){ // <script src="https://wurfl.io/wurfl.js"></script>
      handleArrowHover(nextArrDiv, nextBtn, '', () => this.currentImg + 1 >= images.length);
      handleArrowHover(prevArrDiv, prevBtn, '-', () => this.currentImg < 1);
    }
  }
} //258

document.querySelectorAll('[data-bimIV]').forEach((ul) => new imageViewer(ul));