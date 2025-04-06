const bimSlider = (() => {
  /**
   * @typedef {'chevron' | 'angle' | 'caret' | 'circled' | 'arrow thin' | 'arrow solid'} ArrowType
   * @typedef {'normal' | 'loop' | 'auto-scroll'} SliderType 
   * @typedef {'numbers' | 'dots' | 'line'} PaginationType
   * 
   * @typedef {Object} Data
   * @property {SliderType} type
   * @property {Boolean} spanWidth
   * @property {Boolean} arrows
   * @property {ArrowType} arrowType
   * @property {Boolean} draggable
   * @property {Boolean} scrollable
   * @property {PaginationType} pagination
   * @property {Number} perPage
   * @property {Number} perMove
   * @property {Number} interval
   */
  /** @type {HTMLDivElement} */     let sliderWrapper;
  /** @type {HTMLDivElement} */     let paginationWrapper;
  /** @type {HTMLDivElement} */     let arrowWrapper;
  /** @type {HTMLDivElement} */     let listWrapper;
  /** @type {HTMLButtonElement} */  let nextBtn;
  /** @type {HTMLButtonElement} */  let prevBtn;
  /** @type {HTMLUListElement} */   let paginationUl;
  /** @type {HTMLElement} */        let parentEl;
  /** @type {HTMLCollection} */     let cards;
  /** @type {Number} */             let maxCards;
  /** @type {HTMLCollection} */     let pages;
  /** @type {Data} */               let sliderData = {};
  /** @type {Number} */             let cardWidth;
  /** @type {Number} */             let gap;
  /** @type {Number} */             let endCard;
  /** @type {Array<Number>} */      let translateValues;
  /** @type {Number} */             let activeIndex = 0;
  /** @type {Boolean} */            const isMobile = navigator.userAgentData.mobile;

  const svgArrows = {
    'chevron': {
      prev: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l192 192c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 246.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192z"/></svg>',
      next: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z"/></svg>',
    },
    'angle': {
      prev: '',
      next: '',
    },
    'caret': {
      prev: '',
      next: '',
    },
    'circled': {
      prev: '',
      next: '',
    },
    'arrow thin': {
      prev: '',
      next: '',
    },
    'arrow solid': {
      prev: '',
      next: '',
    },
  };
  const validation = () => {
    if(!(parentEl instanceof HTMLElement || parentEl instanceof Element))
      throw new Error(`Invalid data format '${parentEl}'. Parent must be a HTMLElement`);
    
    switch(sliderData.type){
      case 'auto-scroll':
        Object.assign(sliderData, {
          draggable: false,
          arrows: false,
          scrollable: false,
          pagination: false,
        });
      break;
    }

    function validate(option, validType, validator = null){
      if(!(typeof option === validType && (validator ? validator(option) : true)))
        throw new Error(`Invalid value for option: ${option}`);
    }

    validate(sliderData.type, 'string', val => ['normal', 'loop', 'auto-scroll'].includes(val));
    validate(sliderData.spanWidth, 'boolean');
    validate(sliderData.arrows, 'boolean');
    validate(sliderData.arrowType, 'string', val => ['chevron', 'angle', 'caret', 'circled', 'arrow thin', 'arrow solid'].includes(val));
    validate(sliderData.draggable, 'boolean');
    validate(sliderData.scrollable, 'boolean');
    validate(sliderData.perPage, 'number', val => val > 0);
    validate(sliderData.perMove, 'number', val => val > 0);
    validate(sliderData.interval, 'number', val => val >= 100);

    if(sliderData.perMove > sliderData.perPage) throw new Error("perMove can't be greater than perPage");
    if(typeof sliderData.pagination === 'string')
      validate(sliderData.pagination, 'string', val => ['numbers', 'dots', 'line'].includes(val));
    else if(typeof sliderData.pagination !== 'boolean')
      throw new Error(`Invalid data format 'pagination'`);
  };
  const initElements = () => {
    sliderWrapper = document.createElement('div');
    paginationWrapper = document.createElement('div');
    listWrapper = document.createElement('div');

    sliderWrapper.classList.add('bimSlider');
    paginationWrapper.classList.add('paginationWrapper');
    listWrapper.classList.add('listWrapper');

    parentEl.replaceWith(sliderWrapper);
    sliderWrapper.append(paginationWrapper);
    paginationWrapper.append(listWrapper);
    
    listWrapper.append(parentEl);
    listWrapper.id = "slider-track";
    listWrapper.ariaLive = "polite";
    listWrapper.ariaAtomic = "true";
    listWrapper.ariaBusy = "false";
    
    parentEl.setAttribute('role','presentation');

    Array.from(cards).forEach((card, i) => {
      card.classList.add('cardItem');
      card.setAttribute('role', 'tabpanel');
      card.setAttribute('aria-roledescription', 'slide');
      card.setAttribute('aria-label', `${i + 1} of ${maxCards}`);
      card.style.minWidth = `calc((100% - ${gap * (sliderData.perPage - 1)}px) / ${sliderData.perPage})`;
      card.classList.toggle('currentSlide', (i % maxCards === 0));
      card.id = `group-1-slide-${i + 1}`;
    });

    listWrapper.style.overflow = sliderData.spanWidth ? '' : 'hidden';
    endCard = maxCards - (sliderData.perPage - 1);

    if(['loop', 'auto-scroll'].includes(sliderData.type)){
      const fragment = document.createDocumentFragment();

      activeIndex = maxCards;

      for(let i = 0; i < 2; i++){
        Array.from(cards).forEach((card, j) => {
          const clonedCard = card.cloneNode(true);
          clonedCard.id = `group-${i + 2}-slide-${j + 1}`;
          fragment.append(clonedCard);
        });
      }
      
      parentEl.append(fragment);
    }
    if(sliderData.pagination){
      paginationUl = document.createElement('ul');
      paginationUl.dataset.paginationUl = sliderData.pagination;
      paginationUl.role = 'tablist';
      paginationUl.ariaLabel = 'Select a slide to show';
      
      paginationWrapper.append(paginationUl);
    }
    if(sliderData.arrows){
      nextBtn = document.createElement('button');
      nextBtn.innerHTML = svgArrows[sliderData.arrowType].next;
      nextBtn.classList.add('nextBtn');
      nextBtn.type = 'button';
      nextBtn.ariaLabel = 'Next slide';
      nextBtn.setAttribute('aria-controls','slider-track');
      
      prevBtn = document.createElement('button');
      prevBtn.innerHTML = svgArrows[sliderData.arrowType].prev;
      prevBtn.classList.add('prevBtn');
      prevBtn.type = 'button';
      prevBtn.ariaLabel = 'Previous slide';
      prevBtn.setAttribute('aria-controls','slider-track');

      arrowWrapper = document.createElement('div');
      arrowWrapper.classList.add('arrowWrapper');
      arrowWrapper.append(prevBtn, nextBtn);

      paginationWrapper.append(arrowWrapper);
      
      if(sliderData.type === 'normal') prevBtn.style.opacity = '0.3';
    }
  };
  
  const setPaginationElements = () => {
    paginationUl.innerHTML = '';
    for(let i = 0; i < maxCards; i++){
      const jump = sliderData.perMove * i + 1;
      const t = ((jump % maxCards || maxCards) > endCard ? endCard : jump) - 1;
      if(t > endCard) break;

      const li = document.createElement('li');
      const btn = document.createElement('button');

      li.role = 'presentation';
      
      let startVisibleCard = activeIndex;
      let endVisibleCard = activeIndex + sliderData.perMove - 1;
      let ctrlArr = [];

      Array.from(cards).forEach((card, i) => {
        if(i >= startVisibleCard && i <= endVisibleCard){
          ctrlArr.push(card.id);
        }
      });

      btn.type = 'button';
      btn.role = 'tab';
      btn.ariaLabel = `Go to page ${t}`;
      btn.setAttribute('aria-controls', ctrlArr.join(' '));
      
      if(i === 0){
        btn.ariaSelected = 'true';
        btn.dataset.currentPage = 'true';
      }
      else{
        btn.tabIndex = -1;
      }
      if(sliderData.pagination === 'numbers')
        btn.innerText = i + 1;

      btn.dataset.buttonNumber = i + 1;

      li.append(btn);
      paginationUl.append(li);
    }
    pages = paginationUl.children;
  };
  const breakpointsHandler = () => {
    const queries = [
      {query: '(min-width: 681px)', gap: 14},
      {query: '(max-width: 680px)', gap: 6},
      {query: '(max-width: 560px)', gap: 6},
    ];
    queries.forEach(({query, gap: qGap}) => {
      if(window.matchMedia(query).matches){
        if(qGap !== undefined) gap = qGap;

        if(query === '(min-width: 681px)'){
          paginationWrapper.style.marginInline = (sliderData.arrows) ? '15px' : '';
        }
        else{
          paginationWrapper.style.marginInline = (sliderData.arrows) ? '12px' : '';
        }
      }
    });

    endCard = maxCards - (sliderData.perPage - 1);
    
    let startVisibleCard = activeIndex;
    let endVisibleCard = activeIndex + sliderData.perMove - 1;

    for(let i = 0; i < cards.length; i++){
      if(i >= startVisibleCard && i <= endVisibleCard){
        cards[i].removeAttribute('aria-hidden');
      }
      else{
        cards[i].setAttribute('aria-hidden', 'true');
      }
    }
    for(const card of cards){
      card.style.minWidth = `calc((100% - ${gap * (sliderData.perPage - 1)}px) / ${sliderData.perPage})`;
    }
  };
  const updateSliderConfig = () => {
    cardWidth = cards[0].getBoundingClientRect().width + gap;
    translateValues = Array.from(parentEl.children).map((_, i) => i * cardWidth);
    parentEl.style.transform = `translateX(-${translateValues[activeIndex]}px)`;
    
    if(sliderData.type === 'auto-scroll') return;
    
    if(sliderData.type === 'normal' && sliderData.arrows){
      nextBtn.style.opacity = activeIndex === endCard - 1 ? '0.3' : '1';
      prevBtn.style.opacity = activeIndex === 0 ? '0.3' : '1';
    }
    if(sliderData.pagination){
      setPaginationElements();
      updatePagination();
    }
  };
  const handleResponsive = () => {
    window.addEventListener('resize', () => {
      breakpointsHandler();
      updateSliderConfig();
    });
    breakpointsHandler();
    updateSliderConfig();
  };

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  const snapTransition = async (t, tempIndex) => {
    parentEl.style.transition = `transform ${t}ms`;
    parentEl.style.transform = `translateX(-${translateValues[tempIndex]}px)`;
    await delay(t);
    return false;
  };
  const translateSlider = async (t) => {
    let doAnimate = true;

    if(sliderData.type === 'normal'){
      activeIndex = activeIndex > endCard - 1 ? endCard - 1 : activeIndex < 1 ? 0 : activeIndex;
      
      if(sliderData.arrows){
        nextBtn.style.opacity = activeIndex === endCard - 1 ? '0.3' : '1';
        prevBtn.style.opacity = activeIndex === 0 ? '0.3' : '1';
      }
    }
    else if(sliderData.type === 'loop'){
      const maxIndex = maxCards + endCard - 1;
      
      if(activeIndex === maxIndex + sliderData.perMove){
        doAnimate = await snapTransition(t, maxCards * 2);
        activeIndex = maxCards;
      }
      else if(activeIndex === maxCards - sliderData.perMove){
        doAnimate = await snapTransition(t, maxCards - sliderData.perPage);
        activeIndex = maxCards * 2 - sliderData.perPage;
      }
      if(activeIndex > maxIndex){
        activeIndex = maxIndex;
      }
      else if(activeIndex === endCard){
        activeIndex = maxCards;
      }
    }
    else if(sliderData.type === 'auto-scroll'){
      parentEl.style.transform = `translateX(-${translateValues[activeIndex]}px)`;          
      if(activeIndex === maxCards * 2){
        parentEl.style.transition = `transform ${t}ms`;
        await delay(t);
        activeIndex = maxCards;
        doAnimate = false;
      }
    }
    parentEl.style.transform = `translateX(-${translateValues[activeIndex]}px)`;

    let startVisibleCard = activeIndex;
    let endVisibleCard = activeIndex + sliderData.perPage - 1;

    for(let i = 0; i < cards.length; i++){
      if(i >= startVisibleCard && i <= endVisibleCard){
        cards[i].removeAttribute('aria-hidden');
      }
      else{
        cards[i].setAttribute('aria-hidden', 'true');
      }
    }
    
    parentEl.style.transition = (doAnimate) ? `transform ${t}ms` : '';
    
    listWrapper.ariaBusy = "true";
    await delay(t);
    parentEl.style.transition = '';
    Array.from(cards).forEach((card, i) => {
      card.classList.toggle('currentSlide', i === activeIndex);
    });
    listWrapper.ariaBusy = "false";
  };
  const updatePagination = () => {
    let selectedBtn = Array.from(pages)
    .reduce((selected, el, i) => {
      if(el.style.display === 'none') return selected;
      let jump = sliderData.perMove * i + 1;
      return (jump > endCard ? endCard : jump) - 1 <= (activeIndex % maxCards) ? i : selected;
    }, 0);
    
    for(let i = 0; i < pages.length; i++){
      const btn = pages[i].querySelector('button');
      btn.dataset.currentPage = i === selectedBtn ? 'true' : 'false';
    }
  };
  const updateElements = (t) => {
    translateSlider(t);
    if(sliderData.pagination) updatePagination();
  };

  const handleArrowEvent = () => {
    const arrowPressed = (dir) => {
      activeIndex += dir * sliderData.perMove;
      updateElements(300);
    };
    nextBtn.addEventListener('click', () => {arrowPressed(1)});
    prevBtn.addEventListener('click', () => {arrowPressed(-1)});
  };
  const handleScrollEvent = () => {
    listWrapper.addEventListener('wheel', (e) => {
      e.preventDefault();
      activeIndex += (e.wheelDelta < 0 ? 1 : -1) * sliderData.perMove;
      updateElements(180);
    });
  };
  const handlePageEvent = () => {
    paginationUl.addEventListener('click', (e) => {
      const target = e.target.closest('button');
      if(!target || target.dataset.currentPage === 'true') return;
      const jump = sliderData.perMove * (target.dataset.buttonNumber - 1) + 1;
      activeIndex = (jump > endCard ? endCard : jump) + (sliderData.type === 'loop' ? maxCards : 0) - 1;
      updateElements(300);
    });
  };
  const handleDragEvent = () => {
    let isDragging = false;
    let dragStart, dragVal;
    let lastMouseX, velocity = 0, acceleration = 0.3;
    
    const pressStart = (e) => {
      const pageX = e.touches?.[0].pageX || e.pageX;
      isDragging = true;
      lastMouseX = dragStart = pageX;
    };
    const pressMove = (e) => {
      if(!isDragging) return;
  
      const dragEnd = cardWidth * (endCard - 1);
      const pageX = e.touches?.[0].pageX || e.pageX;
      const deltaX = pageX - lastMouseX;
  
      velocity += deltaX * acceleration;
      lastMouseX = pageX;
      dragVal = translateValues[activeIndex] - (pageX - dragStart) - velocity;
      
      if(sliderData.type === 'normal'){
        if(dragVal > dragEnd){
          dragVal = dragEnd;
          velocity = 0;
        }
        else if(dragVal < 0){
          dragVal = 0;
          velocity = 0;
        }
      }
      parentEl.style.transform = `translateX(-${dragVal}px)`;
    };
    const pressEnd = () => {
      velocity = 0;      
  
      if(isDragging && dragVal){
        const newClose = translateValues.reduce((acc, cur) => Math.abs(acc - dragVal) < Math.abs(cur - dragVal) ? acc : cur);
        
        activeIndex = translateValues.indexOf(newClose);
        dragVal = 0;
        
        updateElements(300);
      }
      isDragging = false;
    };

    listWrapper.addEventListener('mousedown', pressStart);
    listWrapper.addEventListener('mousemove', pressMove);
    document.addEventListener('mouseup', pressEnd);
    // listWrapper.addEventListener('touchstart', pressStart);
    // listWrapper.addEventListener('touchmove', pressMove);
    // document.addEventListener('touchend', pressEnd);
  };
  const handleAutoScroll = async () => {
    await delay(sliderData.interval);
    activeIndex++;
    translateSlider(300);
    handleAutoScroll();
  };
  const initEventHandlers = () => {
    if(sliderData.arrows) handleArrowEvent();
    if(sliderData.scrollable) handleScrollEvent();
    if(sliderData.pagination) handlePageEvent();
    if(sliderData.draggable) handleDragEvent();
    if(sliderData.type === 'auto-scroll') handleAutoScroll();
  };

  class slider{
    /**
     * @param {HTMLElement} parent
     * @param {Data} data
     */
    constructor(parent, {type = 'normal', spanWidth = false, arrows = false, arrowType = 'chevron', draggable = false, scrollable = false, pagination = false, perPage = 3, perMove = 1, interval = 3000}){
      parentEl = parent;
      cards = parent.children;      
      maxCards = parent.children.length;
      gap = 20;
      Object.assign(sliderData, {type, spanWidth, arrows, arrowType, draggable, scrollable, pagination, perPage, perMove, interval});

      validation();
      initElements();
      handleResponsive();
      initEventHandlers();
    }
  };
  
  return slider;
})();