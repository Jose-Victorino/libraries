// (function (global, factory) {
//   typeof exports === 'object' && typeof module !== 'undefined' ?
//   module.exports = factory() : typeof define === 'function' && define.amd ?
//   define(factory) : (global = typeof globalThis !== 'undefined' ?
//   globalThis : global || self, global.BimSlider = factory());
// })
const BimSlider = (function (){
  // 'use strict';
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
  let sliderWrapper, paginationWrapper, arrowWrapper, listWrapper, nextBtn, prevBtn, paginationUl, parent, cards, maxCards, sData = {}, pages, gap, endCard, translateValues, activeIndex = 0;

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
    if(!(parent instanceof HTMLElement || parent instanceof Element))
      throw new TypeError(`Invalid data format '${parent}'. Parent must be a HTMLElement`);

    const validate = (option, validType, validator = null) => {
      if(!(typeof option === validType && (validator ? validator(option) : true)))
        throw new TypeError(`Invalid value for option: ${option}`);
    }

    validate(sData.type, 'string', val => ['normal', 'loop', 'auto-scroll'].includes(val));
    if(sData.type === 'auto-scroll'){
      Object.assign(sData, {
        draggable: false,
        arrows: false,
        scrollable: false,
        pagination: false,
      });
    }
    validate(sData.spanWidth, 'boolean');
    validate(sData.arrows, 'boolean');
    validate(sData.arrowType, 'string', val => ['chevron', 'angle', 'caret', 'circled', 'arrow thin', 'arrow solid'].includes(val));
    validate(sData.draggable, 'boolean');
    validate(sData.scrollable, 'boolean');
    validate(sData.perPage, 'number', val => val > 0);
    validate(sData.perMove, 'number', val => val > 0);
    validate(sData.interval, 'number', val => val >= 100);

    if(sData.perMove > sData.perPage) throw new TypeError("perMove can't be greater than perPage");
    if(typeof sData.pagination === 'string')
      validate(sData.pagination, 'string', val => ['numbers', 'dots', 'line'].includes(val));
    else if(typeof sData.pagination !== 'boolean')
      throw new TypeError(`Invalid data format 'pagination'`);
  };
  const initElements = () => {
    sliderWrapper = document.createElement('div');
    paginationWrapper = document.createElement('div');
    listWrapper = document.createElement('div');

    sliderWrapper.classList.add('bimSlider');
    paginationWrapper.classList.add('paginationWrapper');
    listWrapper.classList.add('listWrapper');

    parent.replaceWith(sliderWrapper);
    sliderWrapper.append(paginationWrapper);
    paginationWrapper.append(listWrapper);
    listWrapper.append(parent);
    
    listWrapper.id = "slider-track";
    listWrapper.ariaLive = "polite";
    listWrapper.ariaAtomic = "true";
    listWrapper.ariaBusy = "false";
    
    parent.setAttribute('role','presentation');

    Array.from(cards).forEach((card, i) => {
      card.classList.add('cardItem');
      card.setAttribute('role', 'tabpanel');
      card.setAttribute('aria-roledescription', 'slide');
      card.setAttribute('aria-label', `${i + 1} of ${maxCards}`);
      card.style.minWidth = `calc((100% - ${gap * (sData.perPage - 1)}px) / ${sData.perPage})`;
      card.classList.toggle('currentSlide', (i % maxCards === 0));
      card.id = `group-1-slide-${i + 1}`;
    });

    listWrapper.style.overflow = sData.spanWidth ? '' : 'hidden';

    if(['loop', 'auto-scroll'].includes(sData.type)){
      const fragment = document.createDocumentFragment();

      activeIndex = maxCards;

      for(let i = 0; i < 2; i++){
        Array.from(cards).forEach((card, j) => {
          const clonedCard = card.cloneNode(true);
          clonedCard.id = `group-${i + 2}-slide-${j + 1}`;
          fragment.append(clonedCard);
        });
      }
      
      parent.append(fragment);
    }
    if(sData.pagination){
      paginationUl = document.createElement('ul');
      paginationUl.dataset.paginationUl = sData.pagination;
      paginationUl.role = 'tablist';
      paginationUl.ariaLabel = 'Select a slide to show';
      
      paginationWrapper.append(paginationUl);
    }
    if(sData.arrows){
      nextBtn = document.createElement('button');
      nextBtn.innerHTML = svgArrows[sData.arrowType].next;
      nextBtn.classList.add('nextBtn');
      nextBtn.type = 'button';
      nextBtn.ariaLabel = 'Next slide';
      nextBtn.setAttribute('aria-controls','slider-track');
      
      prevBtn = document.createElement('button');
      prevBtn.innerHTML = svgArrows[sData.arrowType].prev;
      prevBtn.classList.add('prevBtn');
      prevBtn.type = 'button';
      prevBtn.ariaLabel = 'Previous slide';
      prevBtn.setAttribute('aria-controls','slider-track');

      arrowWrapper = document.createElement('div');
      arrowWrapper.classList.add('arrowWrapper');
      arrowWrapper.append(prevBtn, nextBtn);

      paginationWrapper.append(arrowWrapper);
      
      if(sData.type === 'normal') prevBtn.style.opacity = '0.3';
    }
  };
  
  const setPaginationElements = () => {
    paginationUl.innerHTML = '';
    const jumpVals = [];

    for(let i = 0; i < maxCards; i++){
      const jump = sData.perMove * i + 1;
      const t = ((jump % maxCards || maxCards) > endCard ? endCard : jump) - 1;
      if(jumpVals.includes(t)) break;
      jumpVals.push(t);
    }
    jumpVals.forEach((t, i) => {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      const visibleIds = Array.from(cards).slice(activeIndex, activeIndex + sData.perMove).map(card => card.id);

      li.role = 'presentation';

      btn.type = 'button';
      btn.role = 'tab';
      btn.ariaLabel = `Go to page ${t}`;
      btn.setAttribute('aria-controls', visibleIds.join(' '));
      
      if(i === 0){
        btn.ariaSelected = 'true';
        btn.dataset.currentPage = 'true';
      }
      else{
        btn.tabIndex = -1;
      }
      if(sData.pagination === 'numbers')
        btn.innerText = i + 1;

      btn.dataset.buttonNumber = i + 1;

      li.append(btn);
      paginationUl.append(li);
    });
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
          paginationWrapper.style.marginInline = (sData.arrows) ? '15px' : '';
        }
        else{
          paginationWrapper.style.marginInline = (sData.arrows) ? '12px' : '';
        }
      }
    });

    endCard = maxCards - (sData.perPage - 1);
    
    let startVisibleCard = activeIndex;
    let endVisibleCard = activeIndex + sData.perPage - 1;

    for(let i = 0; i < cards.length; i++){
      if(i >= startVisibleCard && i <= endVisibleCard){
        cards[i].removeAttribute('aria-hidden');
      }
      else{
        cards[i].setAttribute('aria-hidden', 'true');
      }
    }
    for(const card of cards){
      card.style.minWidth = `calc((100% - ${gap * (sData.perPage - 1)}px) / ${sData.perPage})`;
    }
  };
  const updateSliderConfig = () => {
    translateValues = Array.from(parent.children).map((c, i) => i * (c.getBoundingClientRect().width + gap));
    parent.style.transform = `translateX(-${translateValues[activeIndex]}px)`;
    
    if(sData.type === 'auto-scroll') return;
    
    if(sData.type === 'normal' && sData.arrows){
      nextBtn.style.opacity = activeIndex === endCard - 1 ? '0.3' : '1';
      prevBtn.style.opacity = activeIndex === 0 ? '0.3' : '1';
    }
    if(sData.pagination){
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
    parent.style.transition = `transform ${t}ms`;
    parent.style.transform = `translateX(-${translateValues[tempIndex]}px)`;
    await delay(t);
    return false;
  };
  const translateSlider = async (t) => {
    let doAnimate = true;

    if(sData.type === 'normal'){
      activeIndex = activeIndex > endCard - 1 ? endCard - 1 : activeIndex < 1 ? 0 : activeIndex;
      
      if(sData.arrows){
        nextBtn.style.opacity = activeIndex === endCard - 1 ? '0.3' : '1';
        prevBtn.style.opacity = activeIndex === 0 ? '0.3' : '1';
      }
    }
    else if(sData.type === 'loop'){
      const maxIndex = maxCards + endCard - 1;
      
      if(activeIndex === maxIndex + sData.perMove){
        activeIndex = maxCards;
        doAnimate = await snapTransition(t, maxCards * 2);
      }
      else if(activeIndex === maxCards - sData.perMove){
        activeIndex = maxCards * 2 - sData.perPage;
        doAnimate = await snapTransition(t, maxCards - sData.perPage);
      }
      if(activeIndex > maxIndex){
        activeIndex = maxIndex;
      }
      else if(activeIndex === endCard){
        activeIndex = maxCards;
      }
    }
    else if(sData.type === 'auto-scroll'){
      if(activeIndex === maxCards * 2){
        activeIndex = maxCards;
        doAnimate = await snapTransition(t, maxCards * 2);
      }
    }
    parent.style.transform = `translateX(-${translateValues[activeIndex]}px)`;

    let startVisibleCard = activeIndex;
    let endVisibleCard = activeIndex + sData.perPage - 1;

    for(let i = 0; i < cards.length; i++){
      if(i >= startVisibleCard && i <= endVisibleCard){
        cards[i].removeAttribute('aria-hidden');
      }
      else{
        cards[i].setAttribute('aria-hidden', 'true');
      }
    }
    
    parent.style.transition = (doAnimate) ? `transform ${t}ms` : '';
    
    listWrapper.ariaBusy = "true";
    await delay(t);
    parent.style.transition = '';
    Array.from(cards).forEach((card, i) => {
      card.classList.toggle('currentSlide', i === activeIndex);
    });
    listWrapper.ariaBusy = "false";
  };
  const updatePagination = () => {
    let selectedBtn = Array.from(pages)
    .reduce((selected, _, i) => {
      let jump = sData.perMove * i + 1;
      return (jump > endCard ? endCard : jump) - 1 <= (activeIndex % maxCards) ? i : selected;
    }, 0);
    
    for(let i = 0; i < pages.length; i++){
      const btn = pages[i].querySelector('button');
      if(i === selectedBtn){
        btn.dataset.currentPage = 'true';
        btn.ariaSelected = 'true';
      }
      else{
        btn.dataset.currentPage = 'false';
        btn.ariaSelected = 'false';
      }
    }
  };
  const updateElements = (t) => {
    translateSlider(t);
    if(sData.pagination) updatePagination();
  };

  const handleArrowEvent = () => {
    const arrowPressed = (dir) => {
      activeIndex += dir * sData.perMove;
      updateElements(300);
    };
    nextBtn.addEventListener('click', () => {arrowPressed(1)});
    prevBtn.addEventListener('click', () => {arrowPressed(-1)});
  };
  const handleScrollEvent = () => {
    listWrapper.addEventListener('wheel', (e) => {
      e.preventDefault();
      activeIndex += (e.wheelDelta < 0 ? 1 : -1) * sData.perMove;
      updateElements(180);
    });
  };
  const handlePageEvent = () => {
    paginationUl.addEventListener('click', (e) => {
      const target = e.target.closest('button');
      if(!target || target.dataset.currentPage === 'true') return;
      const jump = sData.perMove * (target.dataset.buttonNumber - 1) + 1;
      activeIndex = (jump > endCard ? endCard : jump) + (sData.type === 'loop' ? maxCards : 0) - 1;
      updateElements(300);
    });
  };
  const handleDragEvent = () => {
    let isDragging = false;
    let dragStart, dragVal;
    let lastMouseX, velocity = 0, acceleration = 0.3;
    
    const pressStart = (e) => {
      isDragging = true;
      lastMouseX = dragStart = e.touches?.[0].pageX || e.pageX;
    };
    const pressMove = (e) => {
      if(!isDragging) return;
  
      const dragEnd = translateValues[endCard - 1];
      const pageX = e.touches?.[0].pageX || e.pageX;
      const deltaX = pageX - lastMouseX;

      velocity += deltaX * acceleration;
      lastMouseX = pageX;
      dragVal = translateValues[activeIndex] - (pageX - dragStart) - velocity;
      
      if(sData.type === 'normal'){
        const overshoot = 500;
        if(dragVal > dragEnd){
          const excess = dragVal - dragEnd;
          dragVal = dragEnd + excess * acceleration * (1 - Math.min(excess / overshoot, 1));
          velocity *= 0.7;
        }
        else if(dragVal < 0){
          const excess = -dragVal;
          dragVal = excess * -acceleration * (1 - Math.min(excess / overshoot, 1));
          velocity *= 0.7;
        }
      }
      parent.style.transform = `translateX(${-dragVal}px)`;
    };
    const pressEnd = () => {
      if(isDragging && dragVal){
        const closestIndex = translateValues.reduce((a, c) => Math.abs(a - dragVal) < Math.abs(c - dragVal) ? a : c);
        
        activeIndex = translateValues.indexOf(closestIndex);
        dragVal = 0;
        
        updateElements(300);
      }
      
      velocity = 0;
      isDragging = false;
    };

    listWrapper.addEventListener('mousedown', pressStart);
    listWrapper.addEventListener('mousemove', pressMove);
    document.addEventListener('mouseup', pressEnd);
    listWrapper.addEventListener('touchstart', pressStart);
    listWrapper.addEventListener('touchmove', pressMove);
    document.addEventListener('touchend', pressEnd);
  };
  const handleAutoScroll = async () => {
    await delay(sData.interval);
    activeIndex++;
    translateSlider(300);
    handleAutoScroll();
  };
  const initEventHandlers = () => {
    if(sData.arrows) handleArrowEvent();
    if(sData.scrollable) handleScrollEvent();
    if(sData.pagination) handlePageEvent();
    if(sData.draggable) handleDragEvent();
    if(sData.type === 'auto-scroll') handleAutoScroll();
  };

  class slider{
    /**
     * @param {HTMLElement} cardList
     * @param {Data} data
     */
    constructor(cardList, data){
      const {
        type = 'normal',
        spanWidth = false,
        arrows = false,
        arrowType = 'chevron',
        draggable = false,
        scrollable = false,
        pagination = false,
        perPage = 3,
        perMove = 1,
        interval = 3000,
      } = data;
      parent = cardList;
      cards = cardList.children;      
      maxCards = cardList.children.length;
      Object.assign(sData, {type, spanWidth, arrows, arrowType, draggable, scrollable, pagination, perPage, perMove, interval});

      validation();
      initElements();
      handleResponsive();
      initEventHandlers();
    }
  };
  
  return slider;
})();