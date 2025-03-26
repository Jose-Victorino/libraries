const bimSlider = (() => {
  /**
   * @typedef {'normal' | 'loop' | 'auto-scroll'} SliderType 
   * @typedef {'numbers' | 'dots'} PaginationType
   * @typedef {Object} Breakpoints
   * @property {number} perPage
   * @property {number} perMove
   * @property {number} gap
   * 
   * @typedef {Object} Data
   * @property {SliderType} type
   * @property {Boolean} spanWidth
   * @property {Boolean} arrows
   * @property {Boolean} draggable
   * @property {Boolean} scrollable
   * @property {Number} perPage
   * @property {Number} perMove
   * @property {Number} gap
   * @property {Number} interval
   * @property {PaginationType} pagination
   * @property {Breakpoints} breakpoints
   */
  /** @type {HTMLDivElement} */   let paginationWrapper;
  /** @type {HTMLDivElement} */   let arrowWrapper;
  /** @type {HTMLDivElement} */   let listWrapper;
  /** @type {HTMLImageElement} */ let nextArrow;
  /** @type {HTMLImageElement} */ let prevArrow;
  /** @type {HTMLDivElement} */   let paginationCont;
  /** @type {HTMLUListElement} */ let paginationUl;
  /** @type {HTMLElement} */      let parentEl;
  /** @type {HTMLCollection} */   let cards;
  /** @type {Number} */           let maxCards;
  /** @type {HTMLCollection} */   let pages;
  /** @type {Data} */             let sliderData;
  /** @type {Number} */           let cardWidth;
  /** @type {Number} */           let currentSlide = 1;
  /** @type {Number} */           let endCard;
  /** @type {Number} */           let translateStart;
  /** @type {Number} */           let translateVal = 0;

  const validation = () => {
    if(!(parentEl instanceof HTMLElement || parentEl instanceof Element))
      throw new Error(`Invalid data format '${parentEl}'. Parent must be a HTMLElement`);
    
    for(const card of cards)
      card.dataset.cardItem = '';
    
    switch(sliderData.type){
      case 'loop':
        for(const card of cards)
          card.dataset.nthChild = Array.from(cards).indexOf(card) + 1;
        
        if(sliderData.perMove >= cards.length)
          throw new Error(`PerMove must be less than the number of cards when type = 'loop'`);
      break;
      case 'auto-scroll':
        Object.assign(data, {
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
    validate(sliderData.draggable, 'boolean');
    validate(sliderData.perPage, 'number', val => val > 0);
    validate(sliderData.perMove, 'number', val => val > 0);
    validate(sliderData.scrollable, 'boolean');
    validate(sliderData.interval, 'number', val => val >= 3000);
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
    parentEl.parentNode.insertBefore(listWrapper, parentEl);
    listWrapper.append(parentEl);
    listWrapper.parentNode.insertBefore(arrowWrapper, listWrapper);
    arrowWrapper.append(listWrapper);
    arrowWrapper.parentNode.insertBefore(paginationWrapper, arrowWrapper);
    paginationWrapper.append(arrowWrapper);
    
    Array.from(cards).forEach((card, i) => {
      card.style.minWidth = `calc((100% - ${sliderData.gap * (sliderData.perPage - 1)}px) / ${sliderData.perPage})`;
      card.classList.toggle('currentSlide', (i % maxCards === 0));
    });

    parentEl.style.gap = `${sliderData.gap}px`;
    arrowWrapper.style.marginInline = (sliderData.arrows) ? '15px' : '';
    listWrapper.style.overflow = (sliderData.spanWidth) ? '' : 'hidden';

    if(['loop', 'auto-scroll'].includes(sliderData.type)){
      const fragment = document.createDocumentFragment();
      for(let i = 0; i < 2; i++)
      for(const card of cards)
        fragment.append(card.cloneNode(true));
      
      parentEl.append(fragment);
    }
    if(sliderData.arrows){
      arrowWrapper.append(nextArrow, prevArrow);

      nextArrow.src = `./assets/images/svg/chevron-right.svg`;
      prevArrow.src = `./assets/images/svg/chevron-left.svg`;
      nextArrow.alt = 'nextArrow';
      prevArrow.alt = 'prevArrow';
      
      if(sliderData.type === 'normal') prevArrow.style.opacity = '0.3';
    }
    if(sliderData.pagination){
      paginationWrapper.append(paginationCont);
      paginationCont.append(paginationUl);

      paginationUl.dataset.paginationUl = sliderData.pagination;

      for(let i = 0; i < maxCards; i++)
        paginationUl.append(document.createElement('li'));
      
      pages = paginationUl.children;
      
      Array.from(pages).forEach((page, i) => {
        page.dataset.liPage = '';
        
        if(sliderData.pagination === 'numbers')
          page.innerText = i + 1;
      });
      pages[0].dataset.currentPage = 'true';
    }
  };
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  const translateSlider = async (t) => {
    let doAnimate = true;

    switch(sliderData.type){
      case 'normal':
        parentEl.style.transform = `translateX(-${translateVal}px)`;
        if(sliderData.arrows){
          nextArrow.style.opacity = (currentSlide === endCard) ? '0.3' : '1';
          prevArrow.style.opacity = (currentSlide === 1) ? '0.3' : '1';
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
  const initEventHandlers = () => {
    let isDragging = false;
    let dragStart, dragVal, valStart;
    let lastMouseX, velocity = 0, acceleration = 0.3;
    
    const updatePagination = () => {
      for(let i = 0; i < pages.length; i++)
        pages[i].dataset.currentPage = i === currentSlide - 1 ? 'true' : 'false';
    };
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
    const scrollUpdatePosition = (e) => {
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
          let currentCard = ((translateVal + translateStart) / cardWidth) + 1;
          
          if(e.wheelDelta < 0)
            currentCard++;
          else
            currentCard--;
          currentSlide = currentCard % maxCards || maxCards;
          translateVal = (cardWidth * (currentCard - 1)) - translateStart;
        break;
      }

      translateSlider(180);
      if(sliderData.pagination) updatePagination();
    };
    const paginationUpdatePosition = (e) => {
      const target = e.target.closest('li[data-li-page]');
      if(!target || target.dataset.currentPage === 'true') return;
      
      currentSlide = Array.from(pages).indexOf(target) + 1;
      
      switch(sliderData.type){
        case 'loop':
          let currentCard = ((translateVal + translateStart) / cardWidth) + 1;
          
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
    const autoScroll = async () => {
      await delay(sliderData.interval);
      currentSlide++;
      translateSlider(300);
      autoScroll();
    };
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
            nextArrow.style.opacity = currentSlide === currentEndCard ? '0.3' : '1';
            prevArrow.style.opacity = currentSlide === 1 ? '0.3' : '1';
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
      const closestBpVal = Object.keys(sliderData.breakpoints)
        .map(Number)
        .filter(bp => bp >= window.innerWidth)
        .sort((a, b) => a - b)[0] ?? null;

      if(closestBpVal !== null){
        const {perPage: bpPerPage, perMove: bpPerMove, gap: bpGap} = sliderData.breakpoints[closestBpVal];

        Object.assign(sliderData, {
          perPage: bpPerPage ?? sliderData.perPage,
          perMove: bpPerMove ?? sliderData.perMove,
          gap: bpGap ?? sliderData.gap,
        });
        
        if(sliderData.type === 'normal' && sliderData.arrows){
          nextArrow.style.opacity = (currentSlide === endCard) ? '0.3' : '1';
          prevArrow.style.opacity = (currentSlide === 1) ? '0.3' : '1';
        }
        parentEl.style.gap = `${sliderData.gap}px`;
        
        for(const card of cards){
          card.style.minWidth = `calc((100% - ${sliderData.gap * (sliderData.perPage - 1)}px) / ${sliderData.perPage})`;
        }
      }
    };
    if(sliderData.type === 'auto-scroll'){
      autoScroll();
    }
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
    if(sliderData.arrows){
      nextArrow.addEventListener('click', () => {arrowPressed(1)});
      prevArrow.addEventListener('click', () => {arrowPressed(-1)});
    }
    if(sliderData.scrollable){
      parentEl.addEventListener('wheel', scrollUpdatePosition);
    }
    if(sliderData.pagination){
      paginationUl.addEventListener('click', paginationUpdatePosition);
    }
    window.addEventListener('resize', () => {
      breakpointsHandler();
      updateSliderConfig();
    });
    breakpointsHandler();
    updateSliderConfig();
  };

  class slider{
    /**
     * @param {HTMLElement} parent
     * @param {Data} data
     */
    constructor(parent, data = {}){
      const {type, spanWidth, arrows, draggable, scrollable, perPage, perMove, gap, pagination, interval, breakpoints} = data;
      
      paginationWrapper = document.createElement('div');
      arrowWrapper = document.createElement('div');
      listWrapper = document.createElement('div');
      nextArrow = document.createElement('img');
      prevArrow = document.createElement('img');
      paginationCont = document.createElement('div');
      paginationUl = document.createElement('ul');
      parentEl = parent;
      cards = parent.children;      
      maxCards = parent.children.length;
      
      sliderData = {
        type: type || 'normal',
        spanWidth: spanWidth || false,
        arrows: arrows ?? false,
        draggable: draggable ?? false,
        scrollable: scrollable ?? false,
        perPage: perPage ?? 3,
        perMove: perMove ?? 1,
        gap: gap ?? 10,
        pagination: pagination ?? false,
        interval: interval ?? 3000,
        breakpoints: breakpoints ?? {},
      };
      parentEl.dataset.cardList ='';
      paginationWrapper.dataset.paginationWrapper = '';
      arrowWrapper.dataset.arrowWrapper = '';
      listWrapper.dataset.listWrapper = '';
      nextArrow.dataset.nextArrow = '';
      prevArrow.dataset.prevArrow = '';
      paginationCont.dataset.paginationCont = '';
      paginationUl.dataset.paginationUl = '';
  
      validation();
      initElements();
      initEventHandlers();
    }
  };
  
  return slider;
})();