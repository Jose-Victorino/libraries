class slider{
  /**
   * @param {HTMLElement} parent
   * @param {Object} data
   * @param {'normal' | 'loop' | 'auto-scroll'} data.type
   * @param {Boolean} data.spanWidth
   * @param {Boolean} data.arrows
   * @param {Boolean} data.draggable
   * @param {Boolean} data.scrollable
   * @param {Number} data.perPage
   * @param {Number} data.perMove
   * @param {Number} data.gap
   * @param {Number} data.interval
   * @param {'numbers' | 'dots'} data.pagination
   * @param {Object} data.breakpoints
   * @param {number} data.breakpoints.perPage
   * @param {number} data.breakpoints.perMove
   * @param {number} data.breakpoints.gap
   */
  #paginationWrapper; #arrowWrapper; #listWrapper; #nextArrow; #prevArrow; #paginationCont; #paginationUl; #parent; #cards; #maxCards; #pages; #data;
  constructor(parent, data = {}){
    const {type, spanWidth, arrows, draggable, scrollable, perPage, perMove, gap, pagination, interval, breakpoints} = data;
    
    this.#paginationWrapper = document.createElement('div');
    this.#arrowWrapper = document.createElement('div');
    this.#listWrapper = document.createElement('div');
    this.#nextArrow = document.createElement('img');
    this.#prevArrow = document.createElement('img');
    this.#paginationCont = document.createElement('div');
    this.#paginationUl = document.createElement('ul');
    this.#parent = parent;
    this.#cards = parent.children;
    this.#maxCards = parent.children.length;
    this.#data = {
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
    this.#parent.dataset.cardList ='';
    this.#paginationWrapper.dataset.paginationWrapper = '';
    this.#arrowWrapper.dataset.arrowWrapper = '';
    this.#listWrapper.dataset.listWrapper = '';
    this.#nextArrow.dataset.nextArrow = '';
    this.#prevArrow.dataset.prevArrow = '';
    this.#paginationCont.dataset.paginationCont = '';
    this.#paginationUl.dataset.paginationUl = '';

    this.#validation();
    this.#styles();
    this.#initEventHandlers();
  }
  #validation(){
    if(!(this.#parent instanceof HTMLElement))
      throw new Error(`Invalid data format '${this.#parent}'. Parent must be a HTMLElement`);
    
    for(const card of this.#cards)
      card.dataset.cardItem = '';
    
    switch(this.#data.type){
      case 'loop':
        for(const card of this.#cards)
          card.dataset.nthChild = Array.from(this.#cards).indexOf(card) + 1;
        
        if(this.#data.perMove >= this.#cards.length)
          throw new Error(`PerMove must be less than the number of cards when type = 'loop'`);
      break;
      case 'auto-scroll':
        Object.assign(this.#data, {
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

    validate(this.#data.type, 'string', val => ['normal', 'loop', 'auto-scroll'].includes(val));
    validate(this.#data.spanWidth, 'boolean');
    validate(this.#data.arrows, 'boolean');
    validate(this.#data.draggable, 'boolean');
    validate(this.#data.perPage, 'number', val => val > 0);
    validate(this.#data.perMove, 'number', val => val > 0);
    validate(this.#data.scrollable, 'boolean');
    validate(this.#data.interval, 'number', val => val >= 3000);
    validate(this.#data.gap, 'number', val => val > 0);

    if(typeof this.#data.pagination === 'string')
      validate(this.#data.pagination, 'string', val => ['numbers', 'dots'].includes(val));
    else if(typeof this.#data.pagination !== 'boolean')
      throw new Error(`Invalid data format 'pagination'`);
    
    Object.entries(this.#data.breakpoints).forEach(([bpVal, values]) => {
      if(isNaN(bpVal) || bpVal <= 0)
        throw new Error('All breakpoint values must be a positive number.');
      
      if(Object.values(values).some(v => isNaN(v) || v <= 0))
        throw new Error(`Invalid value inside ${bpVal} breakpoint. Value must be a positive number.`);
    });
    this.#data.breakpoints[10000] = {
      perPage: this.#data.perPage,
      perMove: this.#data.perMove,
      gap: this.#data.gap,
    };
  }
  #styles(){
    this.#parent.parentNode.insertBefore(this.#listWrapper, this.#parent);
    this.#listWrapper.append(this.#parent);
    this.#listWrapper.parentNode.insertBefore(this.#arrowWrapper, this.#listWrapper);
    this.#arrowWrapper.append(this.#listWrapper, this.#nextArrow, this.#prevArrow);
    this.#arrowWrapper.parentNode.insertBefore(this.#paginationWrapper, this.#arrowWrapper);
    this.#paginationWrapper.append(this.#arrowWrapper, this.#paginationCont);
    this.#paginationCont.append(this.#paginationUl);
    
    for(const card of this.#cards)
      card.style.minWidth = `calc((100% - ${this.#data.gap * (this.#data.perPage - 1)}px) / ${this.#data.perPage})`;
    
    if(['loop', 'auto-scroll'].includes(this.#data.type)){
      const fragment = document.createDocumentFragment();
      for(let i = 0; i < 2; i++)
      for(const card of this.#cards)
        fragment.append(card.cloneNode(true));
      
      this.#parent.append(fragment);
    }
    if(this.#data.arrows){
      this.#nextArrow.src = `./assets/images/svg/chevron-right.svg`;
      this.#prevArrow.src = `./assets/images/svg/chevron-left.svg`;
      this.#nextArrow.alt = 'nextArrow';
      this.#prevArrow.alt = 'prevArrow';
      
      if(this.#data.type === 'normal') this.#prevArrow.style.opacity = '0.3';
    }
    else{
      this.#prevArrow.style.display = 'none';
      this.#nextArrow.style.display = 'none';
    }

    if(this.#data.pagination){
      this.#paginationUl.dataset.paginationUl = this.#data.pagination;

      for(let i = 0; i < this.#maxCards; i++)
        this.#paginationUl.append(document.createElement('li'));
      
      this.#pages = this.#paginationUl.children;
      
      Array.from(this.#pages).forEach((page, i) => {
        page.dataset.liPage = "";
        
        if(this.#data.pagination === 'numbers')
          page.innerText = i + 1;
      });
      this.#pages[0].dataset.currentPage = 'true';
    }
    else this.#paginationCont.style.display = 'none';
    
    Array.from(this.#cards).forEach((card, i) => {
      card.classList.toggle('currentSlide', (i % this.#maxCards === 0));
    });

    this.#parent.style.gap = `${this.#data.gap}px`;
    this.#arrowWrapper.style.marginInline = (this.#data.arrows) ? '15px' : '';
    this.#listWrapper.style.overflow = (this.#data.spanWidth) ? '' : 'hidden';
  }
  #initEventHandlers(){
    let isDragging = false;
    let dragStart, dragVal, valStart;
    let lastMouseX, velocity = 0, acceleration = 0.3;
    let cardWidth, currentSlide = 1, endCard, translateStart, translateVal = 0;
    
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    const updateSliderTranslate = async (duration = 300) => {
      let doAnimate = true;
      switch(this.#data.type){
        case 'normal':
          this.#parent.style.transform = `translateX(-${translateVal}px)`;
          if(this.#data.arrows){
            this.#nextArrow.style.opacity = (currentSlide === endCard) ? '0.3' : '1';
            this.#prevArrow.style.opacity = (currentSlide === 1) ? '0.3' : '1';
          }
        break;
        case 'loop':
          var totalTranslate = translateVal + translateStart;

          this.#parent.style.transform = `translateX(-${totalTranslate}px)`;
          if(totalTranslate <= cardWidth * (this.#maxCards - this.#data.perPage)){
            translateVal = totalTranslate;
            this.#parent.style.transition = `transform ${duration}ms`;
            await delay(duration);
            this.#parent.style.transform = `translateX(-${totalTranslate + translateStart}px)`;
            doAnimate = false;
          }
          else if(totalTranslate >= translateStart * 2){
            translateVal -= translateStart;
            this.#parent.style.transition = `transform ${duration}ms`;
            await delay(duration);
            this.#parent.style.transform = `translateX(-${totalTranslate - translateStart}px)`;
            doAnimate = false;
          }
        break;
        case 'auto-scroll':
          translateVal = cardWidth * (currentSlide - 1);
          var totalTranslate = translateVal + translateStart;
          
          this.#parent.style.transform = `translateX(-${totalTranslate}px)`;          
          if(totalTranslate >= translateStart * 2){
            translateVal = 0;
            this.#parent.style.transition = `transform ${duration}ms`;
            await delay(duration);
            this.#parent.style.transform = `translateX(-${totalTranslate - translateStart}px)`;
            doAnimate = false;
          }

          currentSlide = currentSlide % this.#maxCards || this.#maxCards;
        break;
      }
      this.#parent.style.transition = (doAnimate) ? `transform ${duration}ms` : '';
      
      await delay(duration);
      this.#parent.style.transition = '';
      Array.from(this.#cards).forEach((card, i) => {
        card.classList.toggle('currentSlide', i % this.#data.maxCards === currentSlide - 1);
      });
    };
    const updatePagination = () => {
      for(let i = 0; i < this.#pages.length; i++)
        this.#pages[i].dataset.currentPage = i === (currentSlide - 1) ? 'true' : 'false';
    };
    const pressStart = (e) => {
      const event = (e.type === 'touchstart') ? e.touches[0] : e;
      isDragging = true;
      dragStart = event.pageX;
      lastMouseX = event.pageX;
      valStart = translateVal;
    };
    const pressMove = (e) => {
      if(!isDragging) return;

      const dragEnd = cardWidth * (this.#maxCards - this.#data.perPage);
      const event = (e.type === 'touchmove') ? e.touches[0] : e;
      const deltaX = event.pageX - lastMouseX;

      velocity += deltaX * acceleration;
      lastMouseX = event.pageX;
      dragVal = valStart - (event.pageX - dragStart) - velocity;
      
      switch(this.#data.type){
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

          this.#parent.style.transform = `translateX(-${translateVal}px)`;
        break;
        case 'loop':
          this.#parent.style.transform = `translateX(-${dragVal + translateStart}px)`;
          translateVal = dragVal;
        break;
      }
    };
    const pressEnd = () => {
      velocity = 0;

      if(isDragging){
        let translatedNum = [], closestCard;

        switch(this.#data.type){
          case 'normal':
            for(let i = 0; i < endCard; i++)
              translatedNum.push(Math.abs(i * cardWidth - dragVal));
            closestCard = translatedNum.indexOf(Math.min(...translatedNum));
            currentSlide = closestCard + 1;
            translateVal = closestCard * cardWidth;
          break;
          case 'loop':
            for(let i = 0; i < this.#cards.length; i++)
              translatedNum.push(Math.abs(i * cardWidth - (dragVal + translateStart)));
            closestCard = translatedNum.indexOf(Math.min(...translatedNum));
            currentSlide = (closestCard % this.#maxCards) + 1;
            translateVal = (closestCard * cardWidth) - translateStart;
          break;
        }

        updateSliderTranslate();
        if(this.#data.pagination) updatePagination();
      }
      isDragging = false;
    };
    const arrowPressed = (btn) => {
      if(btn === 'nextArrow'){
        currentSlide += this.#data.perMove;
        translateVal += cardWidth * this.#data.perMove;
      }
      else if(btn === 'prevArrow'){
        currentSlide -= this.#data.perMove;
        translateVal -= cardWidth * this.#data.perMove;
      }

      switch(this.#data.type){
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
            currentSlide += this.#maxCards;
          else if(currentSlide > this.#maxCards)
            currentSlide -= this.#maxCards;
        break;
      }

      updateSliderTranslate();
      if(this.#data.pagination) updatePagination();
    };
    const scrollUpdatePosition = (e) => {
      e.preventDefault();

      switch(this.#data.type){
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
          currentSlide = currentCard % this.#maxCards || this.#maxCards;
          translateVal = (cardWidth * (currentCard - 1)) - translateStart;
        break;
      }

      updateSliderTranslate(150);
      if(this.#data.pagination) updatePagination();
    };
    const paginationUpdatePosition = (e) => {
      const target = e.target.closest('li');
      if(!target) return;
      currentSlide = Array.from(this.#pages).indexOf(target) + 1;
      
      switch(this.#data.type){
        case 'loop':
          let currentCard = ((translateVal + translateStart) / cardWidth) + 1;
          
          const targetSlide = currentSlide % this.#maxCards || this.#maxCards;
          const allCards = this.#parent.children;
          
          for(let i = 0; i < this.#maxCards / 2; i++){
            const right = allCards[currentCard + i];
            const left = allCards[currentCard - i - 2];

            if(right.dataset.nthChild === targetSlide.toString()){
              currentCard = Array.from(allCards).indexOf(right);
              break;
            }
            else if(left.dataset.nthChild === targetSlide.toString()){
              currentCard = Array.from(allCards).indexOf(left);
              break;
            }
          }
          translateVal = (cardWidth * currentCard) - translateStart;
        break;
        default:
          translateVal = cardWidth * (currentSlide - 1);
        break;
      }
      
      updateSliderTranslate();
      if(this.#data.pagination) updatePagination();
    };
    const autoScroll = async () => {
      await delay(this.#data.interval);
      currentSlide++;
      updateSliderTranslate();
      autoScroll();
    };
    const updateSliderConfig = () => {
      cardWidth = this.#cards[0].getBoundingClientRect().width + this.#data.gap;
      translateVal = cardWidth * (currentSlide - 1);
      
      switch(this.#data.type){
        case 'normal':
          this.#parent.style.transform = `translateX(-${translateVal}px)`;
          const currentEndCard = this.#maxCards - (this.#data.perPage - 1);
          
          if(currentSlide > currentEndCard)
            currentSlide = currentEndCard;
          
          if(this.#data.arrows){
            this.#nextArrow.style.opacity = currentSlide === currentEndCard ? '0.3' : '1';
            this.#prevArrow.style.opacity = currentSlide === 1 ? '0.3' : '1';
          }
          if(this.#data.pagination){
            for(let i = 0; i < this.#pages.length; i++){
              this.#pages[i].style.display = i < currentEndCard ? 'flex' : 'none';
            }
            updatePagination();
          }
          endCard = currentEndCard;
        break;
        case 'loop':
          translateStart = cardWidth * (this.#cards.length / 3);
    
          this.#parent.style.transform = `translateX(-${translateStart + translateVal}px)`;
        break;
        case 'auto-scroll':
          translateStart = cardWidth * (this.#cards.length / 3);
    
          this.#parent.style.transform = `translateX(-${translateStart + translateVal}px)`;
        break;
      }
    };
    const breakpointsHandler = () => {
      const closestBpVal = Object.keys(this.#data.breakpoints)
        .map(Number)
        .filter(bp => bp >= window.innerWidth)
        .sort((a, b) => a - b)[0] ?? null;

      if(closestBpVal !== null){
        const {perPage: bpPerPage, perMove: bpPerMove, gap: bpGap} = this.#data.breakpoints[closestBpVal];

        Object.assign(this.#data, {
          perPage: bpPerPage ?? this.#data.perPage,
          perMove: bpPerMove ?? this.#data.perMove,
          gap: bpGap ?? this.#data.gap,
        });
        
        if(this.#data.type === 'normal' && this.#data.arrows){
          this.#nextArrow.style.opacity = (currentSlide === endCard) ? '0.3' : '1';
          this.#prevArrow.style.opacity = (currentSlide === 1) ? '0.3' : '1';
        }
        this.#parent.style.gap = `${this.#data.gap}px`;
        
        for(const card of this.#cards){
          card.style.minWidth = `calc((100% - ${this.#data.gap * (this.#data.perPage - 1)}px) / ${this.#data.perPage})`;
        }
      }
    };
    if(this.#data.type === 'auto-scroll'){
      autoScroll();
    }
    else{
      this.#parent.addEventListener('touchstart', pressStart);
      this.#parent.addEventListener('touchmove', pressMove);
      document.addEventListener('touchend', pressEnd);
    }
    if(this.#data.draggable){
      this.#parent.addEventListener('mousedown', pressStart);
      this.#parent.addEventListener('mousemove', pressMove);
      document.addEventListener('mouseup', pressEnd);
    }
    if(this.#data.arrows){
      this.#nextArrow.addEventListener('click', () => {arrowPressed('nextArrow')});
      this.#prevArrow.addEventListener('click', () => {arrowPressed('prevArrow')});
    }
    if(this.#data.scrollable){
      this.#parent.addEventListener('wheel', scrollUpdatePosition);
    }
    if(this.#data.pagination){
      this.#paginationUl.addEventListener('click', paginationUpdatePosition);
    }
    window.addEventListener('resize', () => {
      breakpointsHandler();
      updateSliderConfig();
    });
    breakpointsHandler();
    updateSliderConfig();
  }
} //557