class breadcrumbs{
  /**
   * Creates a quick and easy breadcrumb settings
   * 
   * @typedef {Object} Crumb
   * @property {string} text
   * @property {string} href
   * @property {Function} clickEvent
   * 
   * @typedef {Object} Divider
   * @property {'slash' | 'chevron' | 'caret' | 'double'} type
   * @property {string} size
   * @property {string} spacing
   * @property {string} customDivider
   * 
   * @param {HTMLElement} crumbsCont - The DOM element where the variant selector is initialized.
   * @param {Object} data
   * @param {Crumb} data.setHome - Sets the root breadcrumb.
   * @param {Divider} data.divider - Sets the divider between the breadcrumbs. [slash, chevron, caret, double] or customDivider
   * @param {string} data.textPadding - Sets the padding around the text.
   */
 constructor(crumbsCont, data){
    this.crumbsCont = crumbsCont;
    this.data = data;
    this.dividers = {
      chevron: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z"/></svg>',
      caret: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M246.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-9.2-9.2-22.9-11.9-34.9-6.9s-19.8 16.6-19.8 29.6l0 256c0 12.9 7.8 24.6 19.8 29.6s25.7 2.2 34.9-6.9l128-128z"/></svg>',
      double: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M470.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L402.7 256 265.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160zm-352 160l160-160c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L210.7 256 73.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0z"/></svg>',
      slash: '/',
    }
    this.#validation();
    this.crumbsDetails = [data.setHome];
    this.updateCrumbs();
  }
  #validation(){
    const {crumbsCont, crumbsDetails, data} = this;
    const {setHome, textPadding, divider} = data;

    function setOption(option, defaultValue, validType, validator = null){
      if(!option)
        return defaultValue;
      else if(typeof option === validType && (validator ? validator(option) : true))
        return option;
      else throw new Error(`Invalid value for option: ${option}`);
    }

    if(!(crumbsCont instanceof HTMLElement))
      throw new TypeError(`Invalid data format '${crumbsCont}'. Must be a HTMLElement`);
    if(typeof data !== 'object' || typeof setHome !== 'object')
      throw new Error('home object must be defined.');
    if(typeof setHome.text !== 'string')
      throw new TypeError("home.text must be a string.");

    this.data.textPadding = setOption(textPadding, '10px 5px', 'string');

    if(typeof divider === 'undefined' || typeof divider !== 'object') {
      this.data.divider = {
        type: 'chevron',
        size: '15px',
        spacing: '5px',
      };
    }
    else{
      this.data.divider.type = setOption(divider.type, 'chevron', 'string', val => ['slash', 'chevron', 'caret', 'double'].includes(val));
      this.data.divider.customDivider = setOption(divider.customDivider, null, 'string');
      this.data.divider.size = setOption(divider.size, '12px', 'string');
      this.data.divider.spacing = setOption(divider.spacing, '5px', 'string');
    }
  }
  updateCrumbs(){
    const {crumbsCont, crumbsDetails, dividers, data} = this;
    const {setHome, textPadding, divider} = data;
    const {type, size, spacing, customDivider} = divider;
    
    crumbsCont.innerHTML = '';
    
    Object.assign(crumbsCont.style, {
      display: 'flex',
    });

    for(const crumb of crumbsDetails){
      const {text, href, clickEvent} = crumb;
      const li = document.createElement('li');
      const a = document.createElement('a');

      crumbsCont.appendChild(li);
      li.appendChild(a);
      a.classList.add('breadcrumb-item');
      a.innerText = text;
      
      Object.assign(li.style, {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
      });
      Object.assign(a.style, {
        padding: textPadding,
      });
      if(crumbsDetails.indexOf(crumb) !== crumbsDetails.length - 1){
        let img;
        let span = document.createElement('span');
        span.classList.add('breadcrumb-divider');

        a.after(span);
        if(customDivider){
          img = document.createElement('img');
          img.src = customDivider;
          img.alt = 'divider';

          span.appendChild(img);
        }
        else if(type === 'slash'){
          span.innerHTML = dividers[type];
          Object.assign(span.style, {
            fontSize: size,
            color: 'hsl(222, 10%, 50%)',
            userSelect: 'none',
            marginInline: spacing,
          });
        }
        else{
          span.innerHTML = dividers[type];

          const svg = span.querySelector('svg');
          
          svg.style.fill = 'hsl(222, 10%, 50%)';
          Object.assign((img) ? img.style : null || svg.style, {
            userSelect: 'none',
            height: size,
            marginInline: spacing,
          });
        }
      }
      const handleBtnEvent = (e) => {
        const aTags = Array.from(crumbsCont.querySelectorAll("a"));
        const index = aTags.indexOf(e.target) + 1;
        crumbsDetails.splice(index, crumbsDetails.length);
        this.updateCrumbs();
      }
      a.addEventListener('click', handleBtnEvent);

      if(href)
        a.href = href;
      if(clickEvent)
        a.addEventListener('click', clickEvent);
    }

    crumbsCont.lastChild.classList.add('highlighted-crumb');
  }
  /**
   * @param {Crumb} crumb
   */
  addCrumb(crumb){
    if(typeof crumb.text !== 'string')
      throw new TypeError("text must be a string.");
    if(typeof crumb.clickEvent !== 'function' && typeof crumb.clickEvent !== 'undefined')
      throw new TypeError("clickEvent must be a function.");

    this.crumbsDetails.push(crumb);
    this.updateCrumbs();
  }
  /**
   * @param {string} text
   */
  deleteCrumbs(text){
    if(typeof text !== 'string')
      throw new TypeError("text must be a string.");

    const {crumbsDetails} = this;
    let index;

    for(const crumb of crumbsDetails){
      if(crumb.text === text){
        index = crumbsDetails.indexOf(crumb) + 1;
      }
    }
    if(index) crumbsDetails.splice(index, crumbsDetails.length);

    this.updateCrumbs();
  }
}