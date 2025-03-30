const bimSlider = (() => {
  /**
   * @typedef {'chevron' | 'angle' | 'caret' | 'circled' | 'arrow thin' | 'arrow solid'} ArrowType
   * @typedef {'normal' | 'loop' | 'auto-scroll'} SliderType 
   * @typedef {'numbers' | 'dots'} PaginationType
   * @typedef {Object} Breakpoints
   * @property {number} perPage
   * @property {number} perMove
   * 
   * @typedef {Object} Data
   * @property {SliderType} type
   * @property {Boolean} spanWidth
   * @property {Boolean} arrows
   * @property {ArrowType} arrowType
   * @property {Boolean} draggable
   * @property {Boolean} scrollable
   * @property {Number} perPage
   * @property {Number} perMove
   * @property {Number} gap
   * @property {Number} interval
   * @property {PaginationType} pagination
   * @property {Breakpoints} breakpoints
   */
  /** @type {HTMLDivElement} */     let sliderWrapper;
  /** @type {HTMLDivElement} */     let paginationWrapper;
  /** @type {HTMLDivElement} */     let arrowWrapper;
  /** @type {HTMLDivElement} */     let listWrapper;
  /** @type {HTMLButtonElement} */  let nextBtn;
  /** @type {HTMLButtonElement} */  let prevBtn;
  /** @type {HTMLDivElement} */     let paginationCont;
  /** @type {HTMLUListElement} */   let paginationUl;
  /** @type {HTMLElement} */        let parentEl;
  /** @type {HTMLCollection} */     let cards;
  /** @type {Number} */             let maxCards;
  /** @type {HTMLCollection} */     let pages;
  /** @type {Data} */               let sliderData;
  /** @type {Number} */             let cardWidth;
  /** @type {Number} */             let currentSlide = 1;
  /** @type {Number} */             let endCard;
  /** @type {Number} */             let translateStart;
  /** @type {Number} */             let translateVal = 0;

  /**
   * revamp per move 
   * card.setAttribute('aria-hidden', 'true');delay
   */
  
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
  }
  const validation = () => {
    if(!(parentEl instanceof HTMLElement || parentEl instanceof Element))
      throw new Error(`Invalid data format '${parentEl}'. Parent must be a HTMLElement`);
    
    switch(sliderData.type){
      case 'loop':
        if(sliderData.perMove >= cards.length)
          throw new Error(`PerMove must be less than the number of cards when type = 'loop'`);
      break;
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
    validate(sliderData.perPage, 'number', val => val > 0);
    validate(sliderData.perMove, 'number', val => val > 0);
    validate(sliderData.scrollable, 'boolean');
    validate(sliderData.interval, 'number', val => val >= 100);
    validate(sliderData.gap, 'number', val => val > 0);

    if(typeof sliderData.pagination === 'string')
      validate(sliderData.pagination, 'string', val => ['numbers', 'dots'].includes(val));
    else if(typeof sliderData.pagination !== 'boolean')
      throw new Error(`Invalid data format 'pagination'`);
    
    Object.entries(sliderData.breakpoints).forEach(([bpVal, values]) => {
      if(isNaN(bpVal) || bpVal <= 0)
        throw new Error('All breakpoint values must be a positive number.');
      
      if(Object.values(values).some(v => isNaN(v) || v <= 0))
        throw new Error(`Invalid value inside ${bpVal} breakpoint. Value must be a positive number.`);
    });
    sliderData.breakpoints[10000] = {
      perPage: sliderData.perPage,
      perMove: sliderData.perMove,
      gap: sliderData.gap,
    };
  };
  const initElements = () => {
    sliderWrapper = document.createElement('div');
    paginationWrapper = document.createElement('div');
    arrowWrapper = document.createElement('div');
    listWrapper = document.createElement('div');

    sliderWrapper.setAttribute('data-bimSlider', '');
    paginationWrapper.classList.add('paginationWrapper');
    arrowWrapper.classList.add('arrowWrapper');
    listWrapper.classList.add('listWrapper');

    parentEl.replaceWith(sliderWrapper);
    sliderWrapper.appendChild(paginationWrapper);
    paginationWrapper.appendChild(arrowWrapper);
    arrowWrapper.appendChild(listWrapper);
    listWrapper.appendChild(parentEl);
    
    parentEl.setAttribute('role','presentation');

    Array.from(cards).forEach((card, i) => {
      card.classList.add('cardItem');
      card.setAttribute('role', 'tabpanel');
      card.setAttribute('aria-roledescription', 'slide');
      card.setAttribute('aria-label', `${i + 1} of ${maxCards}`);
      card.style.minWidth = `calc((100% - ${sliderData.gap * (sliderData.perPage - 1)}px) / ${sliderData.perPage})`;
      card.classList.toggle('currentSlide', (i % maxCards === 0));
    });

    arrowWrapper.style.marginInline = (sliderData.arrows) ? '15px' : '';
    listWrapper.style.overflow = (sliderData.spanWidth) ? '' : 'hidden';

    if(sliderData.type === 'loop'){
      for(const card of cards)
        card.dataset.nthChild = Array.from(cards).indexOf(card) + 1;
    }
    if(['loop', 'auto-scroll'].includes(sliderData.type)){
      const fragment = document.createDocumentFragment();
      for(let i = 0; i < 2; i++)
      for(const card of cards)
        fragment.append(card.cloneNode(true));
      
      parentEl.append(fragment);
    }
    if(sliderData.pagination){
      paginationUl = document.createElement('ul');
      paginationUl.dataset.paginationUl = sliderData.pagination;

      paginationCont = document.createElement('div');
      paginationCont.append(paginationUl);
      paginationCont.classList.add('paginationCont');
      
      paginationWrapper.append(paginationCont);

      for(let i = 0; i < maxCards; i++){
        const li = document.createElement('li');
        const btn = document.createElement('button');
        
        if(i === 0)
          btn.dataset.currentPage = 'true';
        if(sliderData.pagination === 'numbers')
          btn.innerText = i + 1;

        btn.dataset.buttonNumber = i + 1

        li.append(btn);
        paginationUl.append(li);
      }
      pages = paginationUl.children;
    }
    if(sliderData.arrows){
      nextBtn = document.createElement('button');
      prevBtn = document.createElement('button');
      nextBtn.innerHTML = svgArrows[sliderData.arrowType].next;
      prevBtn.innerHTML = svgArrows[sliderData.arrowType].prev;
      nextBtn.classList.add('nextBtn');
      prevBtn.classList.add('prevBtn');
      arrowWrapper.append(prevBtn, nextBtn);
      
      if(sliderData.type === 'normal') prevBtn.style.opacity = '0.3';
    }
  };
  const initEventHandlers = () => {
    let isDragging = false;
    let dragStart, dragVal, valStart;
    let lastMouseX, velocity = 0, acceleration = 0.3;
    
    const pressStart = (e) => {
      const pageX = e.touches?.[0].pageX || e.pageX;
      isDragging = true;
      lastMouseX = dragStart = pageX;
      valStart = translateVal;
    };
    const pressMove = (e) => {
      if(!isDragging) return;

      const dragEnd = cardWidth * (maxCards - sliderData.perPage);
      const pageX = e.touches?.[0].pageX || e.pageX;
      const deltaX = pageX - lastMouseX;

      velocity += deltaX * acceleration;
      lastMouseX = pageX;
      dragVal = valStart - (pageX - dragStart) - velocity;
      
      switch(sliderData.type){
        case 'normal':
          if(dragVal > dragEnd){
            translateVal = dragEnd;
            velocity = 0;
          }
          else if(dragVal < 0){
            translateVal = 0;
            velocity = 0;
          }
          else translateVal = dragVal;

          parentEl.style.transform = `translateX(-${translateVal}px)`;
        break;
        case 'loop':
          parentEl.style.transform = `translateX(-${dragVal + translateStart}px)`;
          translateVal = dragVal;
        break;
      }
    };
    const pressEnd = () => {
      velocity = 0;

      if(isDragging && dragVal){
        let translatedNum = [], closestCard;

        switch(sliderData.type){
          case 'normal':
            for(let i = 0; i < endCard; i++)
              translatedNum.push(Math.abs(i * cardWidth - dragVal));
            closestCard = translatedNum.indexOf(Math.min(...translatedNum));
            currentSlide = closestCard + 1;
            translateVal = closestCard * cardWidth;
          break;
          case 'loop':
            for(let i = 0; i < cards.length; i++)
              translatedNum.push(Math.abs(i * cardWidth - (dragVal + translateStart)));
            closestCard = translatedNum.indexOf(Math.min(...translatedNum));
            currentSlide = (closestCard % maxCards) + 1;
            translateVal = (closestCard * cardWidth) - translateStart;
          break;
        }
        translateSlider(300);
        if(sliderData.pagination) updatePagination();
      }
      isDragging = false;
    };
    if(sliderData.type === 'auto-scroll') handleAutoScroll();
    else{
      parentEl.addEventListener('touchstart', pressStart);
      parentEl.addEventListener('touchmove', pressMove);
      document.addEventListener('touchend', pressEnd);
    }
    if(sliderData.draggable){
      parentEl.addEventListener('mousedown', pressStart);
      parentEl.addEventListener('mousemove', pressMove);
      document.addEventListener('mouseup', pressEnd);
    }
    if(sliderData.arrows) handleArrowEvent();
    if(sliderData.scrollable) handleScrollEvent();
    if(sliderData.pagination) handlePageEvent();
  };
  const handleResponsive = () => {
    const updateSliderConfig = () => {
      cardWidth = cards[0].getBoundingClientRect().width + sliderData.gap;
      translateVal = cardWidth * (currentSlide - 1);
      
      switch(sliderData.type){
        case 'normal':
          parentEl.style.transform = `translateX(-${translateVal}px)`;
          const currentEndCard = maxCards - (sliderData.perPage - 1);
          
          if(currentSlide > currentEndCard)
            currentSlide = currentEndCard;
          
          if(sliderData.arrows){
            nextBtn.style.opacity = currentSlide === currentEndCard ? '0.3' : '1';
            prevBtn.style.opacity = currentSlide === 1 ? '0.3' : '1';
          }
          if(sliderData.pagination){
            for(let i = 0; i < pages.length; i++){
              pages[i].style.display = i < currentEndCard ? 'flex' : 'none';
            }
            updatePagination();
          }
          endCard = currentEndCard;
        break;
        case 'loop':
          translateStart = cardWidth * (cards.length / 3);
    
          parentEl.style.transform = `translateX(-${translateStart + translateVal}px)`;
        break;
        case 'auto-scroll':
          translateStart = cardWidth * (cards.length / 3);
    
          parentEl.style.transform = `translateX(-${translateStart + translateVal}px)`;
        break;
      }
    };
    const breakpointsHandler = () => {
      const closestBpVal = Object.keys(sliderData.breakpoints).filter(bp => bp >= window.innerWidth).sort((a, b) => a - b)[0] ?? null;
      
      sliderData.gap = window.matchMedia('(max-width: 720px)').matches ? 10 : 20;
      
      if(closestBpVal !== null){
        const {perPage, perMove} = sliderData.breakpoints[closestBpVal];

        Object.assign(sliderData, {
          perPage: perPage ?? sliderData.perPage,
          perMove: perMove ?? sliderData.perMove,
        });
        
        if(sliderData.type === 'normal' && sliderData.arrows){
          nextBtn.style.opacity = currentSlide === endCard ? '0.3' : '1';
          prevBtn.style.opacity = currentSlide === 1 ? '0.3' : '1';
        }
        
        for(const card of cards){
          card.style.minWidth = `calc((100% - ${sliderData.gap * (sliderData.perPage - 1)}px) / ${sliderData.perPage})`;
        }
      }
    };
    window.addEventListener('resize', () => {
      breakpointsHandler();
      updateSliderConfig();
    });
    breakpointsHandler();
    updateSliderConfig();
  };

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  const translateSlider = async (t) => {
    let doAnimate = true;

    switch(sliderData.type){
      case 'normal':
        parentEl.style.transform = `translateX(-${translateVal}px)`;
        if(sliderData.arrows){
          nextBtn.style.opacity = (currentSlide === endCard) ? '0.3' : '1';
          prevBtn.style.opacity = (currentSlide === 1) ? '0.3' : '1';
        }
      break;
      case 'loop':
        var totalTranslate = translateVal + translateStart;

        parentEl.style.transform = `translateX(-${totalTranslate}px)`;
        if(totalTranslate <= cardWidth * (maxCards - sliderData.perPage)){
          translateVal = totalTranslate;
          parentEl.style.transition = `transform ${t}ms`;
          await delay(t);
          parentEl.style.transform = `translateX(-${totalTranslate + translateStart}px)`;
          doAnimate = false;
        }
        else if(totalTranslate >= translateStart * 2){
          translateVal -= translateStart;
          parentEl.style.transition = `transform ${t}ms`;
          await delay(t);
          parentEl.style.transform = `translateX(-${totalTranslate - translateStart}px)`;
          doAnimate = false;
        }
      break;
      case 'auto-scroll':
        translateVal = cardWidth * (currentSlide - 1);
        var totalTranslate = translateVal + translateStart;
        
        parentEl.style.transform = `translateX(-${totalTranslate}px)`;          
        if(totalTranslate >= translateStart * 2){
          translateVal = 0;
          parentEl.style.transition = `transform ${t}ms`;
          await delay(t);
          parentEl.style.transform = `translateX(-${totalTranslate - translateStart}px)`;
          doAnimate = false;
        }

        currentSlide = currentSlide % maxCards || maxCards;
      break;
    }
    parentEl.style.transition = (doAnimate) ? `transform ${t}ms` : '';
    
    await delay(t);
    parentEl.style.transition = '';
    Array.from(cards).forEach((card, i) => {
      card.classList.toggle('currentSlide', i % maxCards === currentSlide - 1);
    });
  };
  const updatePagination = () => {
    for(let i = 0; i < pages.length; i++){
      const btn = pages[i].querySelector('button');
      btn.dataset.currentPage = i === currentSlide - 1 ? 'true' : 'false';
    }
  };

  const handleArrowEvent = () => {
    const arrowPressed = (dir) => {
      currentSlide += dir * sliderData.perMove;
      translateVal += dir * cardWidth * sliderData.perMove;

      switch(sliderData.type){
        case 'normal':
          if(currentSlide > endCard){
            currentSlide = endCard;
            translateVal = cardWidth * (endCard - 1);
          }
          else if(currentSlide < 1){ 
            currentSlide = 1;
            translateVal = 0;
          }
        break;
        case 'loop':
          if(currentSlide < 1)
            currentSlide += maxCards;
          else if(currentSlide > maxCards)
            currentSlide -= maxCards;
        break;
      }

      translateSlider(300);
      if(sliderData.pagination) updatePagination();
    };
    nextBtn.addEventListener('click', () => {arrowPressed(1)});
    prevBtn.addEventListener('click', () => {arrowPressed(-1)});
  };
  const handleScrollEvent = () => {
    const handleScroll = (e) => {
      e.preventDefault();

      switch(sliderData.type){
        case 'normal':
          if(e.wheelDelta < 0 && currentSlide < endCard)
            currentSlide++;
          else if(e.wheelDelta > 0 && currentSlide > 1)
            currentSlide--;

          translateVal = cardWidth * (currentSlide - 1);
        break;
        case 'loop':
          let direction = e.wheelDelta < 0 ? 1 : -1;
          let currentCard = (translateVal + translateStart) / cardWidth + 1 + direction;
          
          currentSlide = currentCard % maxCards || maxCards;
          translateVal = (currentCard - 1) * cardWidth - translateStart;
        break;
      }

      translateSlider(180);
      if(sliderData.pagination) updatePagination();
    };
    parentEl.addEventListener('wheel', handleScroll);
  };
  const handlePageEvent = () => {
    const handlePageClick = (e) => {
      const target = e.target.closest('button');
      if(!target || target.dataset.currentPage === 'true') return;
      
      currentSlide = target.dataset.buttonNumber;
      
      switch(sliderData.type){
        case 'loop':
          let currentCard = (translateVal + translateStart) / cardWidth + 1;
          
          const targetSlide = currentSlide % maxCards || maxCards;
          const allCards = [...parentEl.children];
          
          for(let i = 0; i < maxCards / 2; i++){
            const right = allCards[currentCard + i];
            const left = allCards[currentCard - i - 2];

            if(right.dataset.nthChild === targetSlide.toString()){
              currentCard = allCards.indexOf(right);
              break;
            }
            else if(left.dataset.nthChild === targetSlide.toString()){
              currentCard = allCards.indexOf(left);
              break;
            }
          }
          translateVal = (cardWidth * currentCard) - translateStart;
        break;
        default:
          translateVal = cardWidth * (currentSlide - 1);
        break;
      }
      
      translateSlider(300);
      if(sliderData.pagination) updatePagination();
    };
    paginationUl.addEventListener('click', handlePageClick);
  };
  const handleAutoScroll = async () => {
    await delay(sliderData.interval);
    currentSlide++;
    translateSlider(300);
    handleAutoScroll();
  };

  class slider{
    /**
     * @param {HTMLElement} parent
     * @param {Data} data
     */
    constructor(parent, data = {}){
      parentEl = parent;
      cards = parent.children;      
      maxCards = parent.children.length;
      sliderData = {
        type: data.type || 'normal',
        spanWidth: data.spanWidth || false,
        arrows: data.arrows ?? false,
        arrowType: data.arrowType || 'chevron',
        draggable: data.draggable ?? false,
        scrollable: data.scrollable ?? false,
        perPage: data.perPage ?? 3,
        perMove: data.perMove ?? 1,
        gap: 20,
        pagination: data.pagination ?? false,
        interval: data.interval ?? 3000,
        breakpoints: data.breakpoints ?? {},
      };

      validation();
      initElements();
      initEventHandlers();
      handleResponsive();
    }
  };
  
  return slider;
})();