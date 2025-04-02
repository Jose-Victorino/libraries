const bimSlider = (() => {
  /**
   * @typedef {'chevron' | 'angle' | 'caret' | 'circled' | 'arrow thin' | 'arrow solid'} ArrowType
   * @typedef {'normal' | 'loop' | 'auto-scroll'} SliderType 
   * @typedef {'numbers' | 'dots'} PaginationType
   * 
   * @typedef {Object} Data
   * @property {SliderType} type
   * @property {Boolean} spanWidth
   * @property {Boolean} arrows
   * @property {ArrowType} arrowType
   * @property {Boolean} draggable
   * @property {Boolean} scrollable
   * @property {PaginationType} pagination
   * @property {Number} interval
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
  /** @type {Data} */               let sliderData = {};
  /** @type {Number} */             let cardWidth;
  /** @type {Number} */             let gap;
  /** @type {Number} */             let perPage;
  /** @type {Number} */             let endCard;
  /** @type {Array<Number>} */      let testVals;
  /** @type {Number} */             let activeCard = 0;
  
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
      case 'loop':
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
    validate(sliderData.scrollable, 'boolean');
    validate(sliderData.interval, 'number', val => val >= 100);

    if(typeof sliderData.pagination === 'string')
      validate(sliderData.pagination, 'string', val => ['numbers', 'dots'].includes(val));
    else if(typeof sliderData.pagination !== 'boolean')
      throw new Error(`Invalid data format 'pagination'`);
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
      card.style.minWidth = `calc((100% - ${gap * (perPage - 1)}px) / ${perPage})`;
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

      activeCard = maxCards;

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

        btn.dataset.buttonNumber = i + 1;

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
  
  const breakpointsHandler = () => {
    [
      {query: '(min-width: 921px)', gap: 20, perPage: 3},
      {query: '(max-width: 920px)', gap: 20, perPage: 2},
      {query: '(max-width: 680px)', gap: 10, perPage: 2},
      {query: '(max-width: 560px)', gap: 10, perPage: 2},
    ]
    .forEach(({ query, gap: qGap, perPage: qPerPage }) => {
      if(window.matchMedia(query).matches){
        if(gap !== undefined) gap = qGap;
        if(perPage !== undefined) perPage = qPerPage;
      }
    });

    endCard = maxCards - (perPage - 1);
    
    let startVisibleCard = activeCard;
    let endVisibleCard = activeCard + perPage - 1;

    for(let i = 0; i < cards.length; i++){
      if(i >= startVisibleCard && i <= endVisibleCard){
        cards[i].removeAttribute('aria-hidden');
      }
      else{
        cards[i].setAttribute('aria-hidden', 'true');
      }
    }
    for(const card of cards){
      card.style.minWidth = `calc((100% - ${gap * (perPage - 1)}px) / ${perPage})`;
    }
  };
  const updateSliderConfig = () => {
    cardWidth = cards[0].getBoundingClientRect().width + gap;
    testVals = Array.from(parentEl.children).map((_, i) => i * cardWidth);
    
    parentEl.style.transform = `translateX(-${testVals[activeCard]}px)`;
    switch(sliderData.type){
      case 'normal':
        if(sliderData.arrows){
          nextBtn.style.opacity = activeCard === endCard ? '0.3' : '1';
          prevBtn.style.opacity = activeCard === 0 ? '0.3' : '1';
        }
        if(sliderData.pagination){
          for(let i = 0; i < pages.length; i++){
            pages[i].style.display = i < Math.ceil(maxCards / perPage) ? 'flex' : 'none';
          }
          updatePagination();
        }
      break;
      case 'loop':
        if(sliderData.pagination){
          for(let i = 0; i < pages.length; i++){
            pages[i].style.display = i < Math.ceil(maxCards / perPage) ? 'flex' : 'none';
          }
          updatePagination();
        }
      break;
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

  const translateSlider = async (t) => {
    let doAnimate = true;

    switch(sliderData.type){
      case 'normal':
        activeCard = activeCard > endCard - 1 ? endCard - 1 : activeCard < 1 ? activeCard = 0 : activeCard;
        
        if(sliderData.arrows){
          nextBtn.style.opacity = activeCard === endCard - 1 ? '0.3' : '1';
          prevBtn.style.opacity = activeCard === 0 ? '0.3' : '1';
        }
      break;
      case 'loop':
        parentEl.style.transform = `translateX(-${testVals[activeCard]}px)`;
        if(activeCard === maxCards * 2){
          parentEl.style.transition = `transform ${t}ms`;
          activeCard = maxCards;
          await delay(t);
          doAnimate = false;
        }
        else if(activeCard === endCard - 1){
          parentEl.style.transition = `transform ${t}ms`;
          activeCard = maxCards + endCard - 1;
          await delay(t);
          doAnimate = false;
        }
        if(activeCard === endCard){
          activeCard = maxCards;
        }
        else if(activeCard > maxCards + endCard - 1){
          activeCard = maxCards + endCard - 1;
        }
      break;
      case 'auto-scroll':
        parentEl.style.transform = `translateX(-${testVals[activeCard]}px)`;          
        if(activeCard === maxCards * 2){
          parentEl.style.transition = `transform ${t}ms`;
          activeCard = maxCards;
          await delay(t);
          doAnimate = false;
        }
      break;
    }
    parentEl.style.transform = `translateX(-${testVals[activeCard]}px)`;

    let startVisibleCard = activeCard;
    let endVisibleCard = activeCard + perPage - 1;

    for(let i = 0; i < cards.length; i++){
      if(i >= startVisibleCard && i <= endVisibleCard){
        cards[i].removeAttribute('aria-hidden');
      }
      else{
        cards[i].setAttribute('aria-hidden', 'true');
      }
    }
    
    parentEl.style.transition = (doAnimate) ? `transform ${t}ms` : '';
    
    await delay(t);
    parentEl.style.transition = '';
    Array.from(cards).forEach((card, i) => {
      card.classList.toggle('currentSlide', i === activeCard);
    });
  };
  const updatePagination = () => {
    let selectedBtn = Array.from(pages)
    .reduce((selected, el, i) => {
      if(el.style.display === 'none') return selected;
      
      let jump = perPage * i + 1;
      
      return (jump > endCard ? endCard : jump) - 1 <= (activeCard % maxCards) ? i : selected;
    }, 0);
    
    for(let i = 0; i < pages.length; i++){
      const btn = pages[i].querySelector('button');
      btn.dataset.currentPage = i === selectedBtn ? 'true' : 'false';
    }
  };

  const handleArrowEvent = () => {
    const arrowPressed = (dir) => {
      activeCard += dir * perPage;
      
      translateSlider(300);
      if(sliderData.pagination) updatePagination();
    };
    nextBtn.addEventListener('click', () => {arrowPressed(1)});
    prevBtn.addEventListener('click', () => {arrowPressed(-1)});
  };
  const handleScrollEvent = () => {
    listWrapper.addEventListener('wheel', (e) => {
      e.preventDefault();

      activeCard += (e.wheelDelta < 0 ? 1 : -1) * perPage;

      translateSlider(180);
      if(sliderData.pagination) updatePagination();
    });
  };
  const handlePageEvent = () => {
    paginationUl.addEventListener('click', (e) => {
      const target = e.target.closest('button');
      if(!target || target.dataset.currentPage === 'true') return;

      const jump = perPage * (target.dataset.buttonNumber - 1) + 1;
      const t = (jump > endCard ? endCard : jump) - 1;
      
      switch(sliderData.type){
        case 'normal':
          activeCard = t;
        break;
        case 'loop':
          for(let i = 0; i < Math.ceil(maxCards / 2); i++){
            const left = activeCard - i - 1;
            const right = activeCard + i + 1;
            
            if(t === right % maxCards){
              activeCard = right;
              break;
            }
            if(t === left % maxCards){
              activeCard = left;
              break;
            }
          }
        break;
      }
      
      translateSlider(300);
      if(sliderData.pagination) updatePagination();
    });
  };
  const handleAutoScroll = async () => {
    await delay(sliderData.interval);
    activeCard++;
    translateSlider(300);
    handleAutoScroll();
  };
  const initEventHandlers = () => {
    let isDragging = false;
    let dragStart, dragVal, valStart, translateVal;
    let lastMouseX, velocity = 0, acceleration = 0.3;
    
    const pressStart = (e) => {
      const pageX = e.touches?.[0].pageX || e.pageX;
      isDragging = true;
      lastMouseX = dragStart = pageX;
      valStart = testVals[activeCard];
    };
    const pressMove = (e) => {
      if(!isDragging) return;

      const dragEnd = cardWidth * (endCard - 1);
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
          parentEl.style.transform = `translateX(-${dragVal}px)`;
        break;
      }
    };
    const pressEnd = () => {
      velocity = 0;      

      if(isDragging && dragVal){
        let closestCard, reduceJumpVals;
        const maxJump = Math.ceil(maxCards / perPage);
        const jumpValues = Array.from({ length: maxJump }, (_, i) => Math.min(perPage * i, endCard - 1));
        const getReducedJumpVals = (values) => {
          return values.reduce((acc, cur, i) => {
            if(jumpValues.includes(i % maxCards)) acc[i] = cur;
            return acc;
          }, {});
        };
        
        switch(sliderData.type){
          case 'normal':
            reduceJumpVals = getReducedJumpVals(testVals);
          break;
          case 'loop':
            const vals = [...testVals];
            
            for(let i = 0; i < maxCards; i++){
              vals.pop();
              vals.unshift(-vals[(i * 2) + 1])
            }
            
            reduceJumpVals = getReducedJumpVals(vals);
          break;
        }
        
        closestCard = Object.entries(reduceJumpVals).reduce((prev, [i, transVal]) =>
          Math.abs(transVal - dragVal) < Math.abs(prev[1] - dragVal) ? [i, transVal] : prev
        )[0];
        activeCard = parseInt(closestCard);
        dragVal = 0;
        
        translateSlider(300);
        if(sliderData.pagination) updatePagination();
      }
      isDragging = false;
    };
    if(sliderData.arrows) handleArrowEvent();
    if(sliderData.scrollable) handleScrollEvent();
    if(sliderData.pagination) handlePageEvent();
    if(sliderData.type === 'auto-scroll') handleAutoScroll();
    if(sliderData.draggable){
      listWrapper.addEventListener('mousedown', pressStart);
      listWrapper.addEventListener('mousemove', pressMove);
      document.addEventListener('mouseup', pressEnd);
    }
    // listWrapper.addEventListener('touchstart', pressStart);
    // listWrapper.addEventListener('touchmove', pressMove);
    // document.addEventListener('touchend', pressEnd);
  };

  class slider{
    /**
     * @param {HTMLElement} parent
     * @param {Data} data
     */
    constructor(parent, {type = 'normal', spanWidth = false, arrows = false, arrowType = 'chevron', draggable = false, scrollable = false, pagination = false, interval = 3000}){
      parentEl = parent;
      cards = parent.children;      
      maxCards = parent.children.length;
      gap = 20;
      perPage = 3;
      Object.assign(sliderData, {type, spanWidth, arrows, arrowType, draggable, scrollable, pagination, interval});

      validation();
      initElements();
      handleResponsive();
      initEventHandlers();
    }
  };
  
  return slider;
})();//599