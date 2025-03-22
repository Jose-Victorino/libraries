class imageViewer{
  /**
   * @param {HTMLElement} list
   */
  constructor(list){
    this.list = list;
    this.images = [...list.querySelectorAll('[data-main-img]')];
    this.currentImg = 0;

    this.createUI();
    this.initHandlers();
  }
  createUI(){
    this.article = document.createElement('article');
    document.body.append(this.article);
    this.article.innerHTML =
      `<div class="viewerTop" style="display: flex; justify-content: center; align-items: center;">
        <div class="arrow prevCont" style="display: flex; justify-content: center; align-items: center; height: 100%; cursor: pointer;">
          <svg class="prevArrow" xmlns="http://www.w3.org/2000/svg" fill="hsl(0, 0%, 90%)" viewBox="0 0 320 512"><path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l192 192c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 246.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192z"/></svg>
        </div>
        <div class="imgCont" style="display: flex; justify-content: center; align-items: center; height: 100%; width: 100%;">
          <img class="selectedImg" style="object-fit: contain; max-height: max-content; max-width: 100%; height: 100%; width: auto; user-select: none;">
        </div>
        <div class="arrow nextCont" style="display: flex; justify-content: center; align-items: center; height: 100%; cursor: pointer;">
          <svg class="nextArrow" xmlns="http://www.w3.org/2000/svg" fill="hsl(0, 0%, 90%)" viewBox="0 0 320 512"><path d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z"/></svg>
        </div>
      </div>
      <div class="thumbnailCont"><ul style="display: flex; width: fit-content; user-select: none;"></ul></div>`;

    this.topDiv = this.article.querySelector('.viewerTop');
    this.imgSelectedDiv = this.article.querySelector('.imgCont');
    this.selectedImg = this.article.querySelector('.selectedImg');
    this.nextArrDiv = this.article.querySelector('.nextCont');
    this.prevArrDiv = this.article.querySelector('.prevCont');
    this.nextBtn = this.article.querySelector('.nextArrow');
    this.prevBtn = this.article.querySelector('.prevArrow');
    this.thumbnailDiv = this.article.querySelector('.thumbnailCont');
    this.ul = this.article.querySelector('ul');

    this.images.forEach(({src, alt}) => {
      const li = document.createElement('li');
      const img = document.createElement('img');
      
      Object.assign(li.style, {
        background: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        height: '100%',
        cursor: 'pointer',
        borderRadius: '5px',
      });
      Object.assign(img.style, {
        objectFit: 'cover',
        aspectRatio: '1',
        borderRadius: '5px',
      });
      Object.assign(img, {src, alt});
      
      li.append(img);
      this.ul.append(li);
    });
    this.thumbnails = [...this.ul.children];
    this.imgSelector = {
      height: 70,
      gap: 8,
      get imgSize(){return this.height - 2 * this.gap}
    };
    this.arrow = {
      divSize: 40,
      size: 20,
    };

    Object.assign(this.article.style, {
      background: 'hsla(0, 0%, 0%, 60%)',
      position: 'fixed',
      top: '0',
      left: '0',
      display: 'none',
      flexDirection: 'column',
      height: '100dvh',
      width: '100%',
      zIndex: '10',
    });
    Object.assign(this.topDiv.style, {
      height: `calc(100% - ${this.imgSelector.height}px)`,
    });
    Object.assign(this.ul.style, {
      gap: `${this.imgSelector.gap}px`,
      height: `${this.imgSelector.height}px`,
      paddingBlock: `${this.imgSelector.gap}px`,
    });
    Object.assign(this.nextArrDiv.style, {
      width: `${this.arrow.divSize}px`,
    });
    Object.assign(this.prevArrDiv.style, {
      width: `${this.arrow.divSize}px`,
    });
    Object.assign(this.nextBtn.style, {
      height: `${this.arrow.size}px`,
    });
    Object.assign(this.prevBtn.style, {
      height: `${this.arrow.size}px`,
    });
  }
  updateState(){
    const {thumbnails, images, currentImg, imgSelector:{imgSize, gap}} = this;
    const {src, alt} = images[currentImg];

    Object.assign(this.selectedImg, {src, alt});
    Object.assign(this.thumbnailDiv.style, {
      transform: `translateX(calc(50% - ${(imgSize + gap) * currentImg + imgSize / 2}px))`,
      transition: 'transform 0.3s',
    });
    
    thumbnails.forEach((li, i) => {
      li.children[0].style.opacity = (i === currentImg) ? '' : '0.3';
      li.classList.toggle('active', i === currentImg);
    });
    
    setTimeout(() => {
      this.thumbnailDiv.style.transition = '';
    }, 300);
  }
  changeImage(direction){
    this.currentImg = Math.max(0, Math.min(this.images.length - 1, this.currentImg + direction));
    this.updateState();
  }
  handleArrowHover(arrowDiv, btn, direction, condition){
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
  checkScreenSize(){
    if(window.innerWidth < 560){
      Object.assign(this.imgSelector, {
        height: 50,
        gap: 3,
      });
      Object.assign(this.arrow, {
        divSize: 30,
        size: 18,
      });
    }
    else{
      Object.assign(this.imgSelector, {
        height: 70,
        gap: 8,
      });
      Object.assign(this.arrow, {
        divSize: 40,
        size: 20,
    });
    }

    const {currentImg, imgSelector:{height, gap, imgSize}, arrow:{divSize, size}} = this;

    this.topDiv.style.height = `calc(100% - ${height}px)`;
    
    Object.assign(this.ul.style, {
      gap: `${gap}px`,
      height: `${height}px`,
      paddingBlock: `${gap}px`,
    });
    Object.assign(this.nextArrDiv.style, {
      width: `${divSize}px`,
    });
    Object.assign(this.prevArrDiv.style, {
      width: `${divSize}px`,
    });
    Object.assign(this.nextBtn.style, {
      height: `${size}px`,
    });
    Object.assign(this.prevBtn.style, {
      height: `${size}px`,
    });
    
    if(typeof this.currentImg !== 'undefined'){
      this.thumbnailDiv.style.transform = `translateX(calc(50% - ${(imgSize + gap) * currentImg + imgSize / 2}px))`;
    }    
  }
  initHandlers(){
    const {list, article, nextArrDiv, prevArrDiv, nextBtn, prevBtn, ul, thumbnails, images} = this;

    list.addEventListener('click', (e) => {
      const img = e.target.closest('img[data-main-img]');
      if(!img) return;

      this.currentImg = images.indexOf(img);
      article.style.display = 'flex';
      this.updateState();
    });
    article.addEventListener('click', (e) => {
      if(!e.target.closest('.selectedImg, .arrow, ul'))
        article.style.display = 'none';
    });
    
    article.addEventListener('wheel', (e) => this.changeImage(e.deltaY > 0 ? 1 : -1));
    nextArrDiv.addEventListener('click', () => this.changeImage(1));
    prevArrDiv.addEventListener('click', () => this.changeImage(-1));
    ul.addEventListener('click', (e) => {
      const target = e.target.closest('li');
      if(!target) return;

      this.currentImg = thumbnails.indexOf(target);
      this.updateState();
    });

    if(!WURFL.is_mobile){ // <script src="https://wurfl.io/wurfl.js"></script>
      this.handleArrowHover(nextArrDiv, nextBtn, '', () => this.currentImg + 1 >= images.length);
      this.handleArrowHover(prevArrDiv, prevBtn, '-', () => this.currentImg < 1);
    }
    window.addEventListener("resize", this.checkScreenSize.bind(this));
    this.checkScreenSize.call(this);
  }
}