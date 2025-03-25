const bimPN = (() => {
  const icons = {
    check: './assets/images/svg/circle-check.svg',
    info: './assets/images/svg/circle-info.svg',
    warning: './assets/images/svg/circle-exclamation.svg',
    error: './assets/images/svg/circle-xmark.svg',
    question: './assets/images/svg/circle-question.svg',
  }
  /**
   * @typedef {'text' | 'number' | 'email' | 'option'} Type
   * @typedef {'check' | 'info' | 'warning' | 'error' | 'question'} Icon
   * @typedef {'top-left' | 'top-middle' | 'top-right' | 'bottom-left' | 'bottom-middle' | 'bottom-right'} Locations
   * @typedef {'toast' | 'alert' | 'input' | 'confirm'} ModalType
   * 
   * @typedef {Object} Results
   * @property {Boolean} isConfirmed - User confirmed input
   * @property {Boolean} isCancelled - User cancelled input
   * 
   * @typedef {Object} modalHTMLElements 
   * @property {HTMLDivElement} divPN 
   * @property {HTMLElement} article 
   * @property {HTMLElement} content 
   * @property {HTMLDivElement} info 
   * @property {HTMLImageElement} centerImg 
   * @property {HTMLHeadingElement} titleH1 
   * @property {HTMLParagraphElement} textP 
   * @property {HTMLInputElement} inputTag 
   * @property {HTMLSelectElement} selectTag 
   * @property {HTMLSpanElement} span 
   * @property {HTMLDivElement} btnCont 
   * @property {HTMLButtonElement} confirm 
   * @property {HTMLButtonElement} cancel
   */
  /**
   * @param {Number} ms 
   * @returns {Promise<Results>}
   */
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  /**
   * @param {ModalType} modalType 
   * @param {ModalData | String} data 
   * @returns {ModalData}
   */
  const setDefaultValues = (modalType, data) => {
    if(typeof data === 'string') data = {text: data};
    
    const config = {
      toast: {
        location: 'top-left',
        animate: true,
        autoClose: true,
        timer: (data?.timer ?? 2000) + 200
      },
      alert: {
        location: 'center',
        animate: true,
        autoClose: true,
        timer: (data?.timer ?? 2000) + 200
      },
      input: {
        location: 'center',
        type: 'text',
        placeholder: '',
        animate: false
      },
      confirm: {
        location: 'center',
        animate: false
      },
    };
    return {modalType, ...config[modalType], ...data};
  };
  /**
   * @param {ModalData} data
   * @param {Array<string>} arr
   */
  const validate = (data, arr) => {
    Object.entries(data).forEach(([key, value]) => {
      switch(key){
        case 'timer':
          if(isNaN(value) || value < 1)
            throw new Error(`Invalid timer: '${value}', timer must be a positive number`)
          break;
        case 'options':
          if(!Array.isArray(value))
            throw new Error(`Invalid options: '${value}', options must be an array.`);
          break;
        case 'icon':
          if(!Object.keys(icons).includes(value))
            throw new Error(`Invalid icon: '${value}'.`);
          break;
        case 'animate':
          if(typeof value !== 'boolean')
            throw new Error(`Invalid animate: '${value}', animate must be a boolean`)
          break;
        case 'autoClose':
          if(typeof value !== 'boolean')
            throw new Error(`Invalid autoClose: '${value}', autoClose must be a boolean`)
          break;
        default:
          if(typeof value !== 'string')
            throw new Error(`Invalid ${key}: '${value}', ${key} must be a string`)
          break;
      }
    });
    
    arr.forEach(item => {
      item
      if(data[item] !== undefined) return;
      throw new Error(`${item} is not defined.`);
    });
  };
  /**
   * @param {HTMLElement} parent 
   * @param {String} tagName 
   * @param {String | Array<String> | undefined} classNames 
   * @returns {HTMLElement}
   */
  const createSetElement = (parent, tagName, classNames) => {
    const child = document.createElement(tagName);
    if(Array.isArray(classNames)){
      child.classList.add(...classNames);
    }
    else if(typeof classNames === 'string'){
      child.classList.add(classNames);
    }
    parent.append(child);
    
    return child;
  };
  /**
   * @param {ModalData} data 
   * @returns {modalHTMLElements}
   */
  const init = ({modalType, icon, type, autoClose}) => {    
    const divPN = createSetElement(document.body, 'div');
    const article = createSetElement(divPN, 'article');
    const asda = document.createElement('section');
    let content, info, centerImg, titleH1, textP, inputTag, selectTag, span, btnCont, confirm, cancel;

    switch(modalType){
      case 'toast':
        content = createSetElement(article, 'section', 'content');
        info = createSetElement(content, 'div', 'info');

        TinnerCont = createSetElement(info, 'div', 'innerCont');
        textP = createSetElement(TinnerCont, 'p', 'text');
      break;
      case 'alert':
        content = createSetElement(article, 'section', 'content');
        if(icon) centerImg = createSetElement(content, 'img', ['icon', 'center']);
        info = createSetElement(content, 'div', 'info');
        
        TinnerCont = createSetElement(info, 'div', 'innerCont');
        titleH1 = createSetElement(TinnerCont, 'h1', 'title');
        textP = createSetElement(TinnerCont, 'p', 'text');
        
        if(!autoClose){
          btnCont = createSetElement(article, 'section', 'mainBtn');
          confirm = createSetElement(btnCont, 'button', 'confirm');
        }
      break;
      case 'input':
        content = createSetElement(article, 'section', 'content');
        info = createSetElement(content, 'div', 'info');

        TinnerCont = createSetElement(info, 'div', 'innerCont');
        titleH1 = createSetElement(TinnerCont, 'h1', 'title');
        textP = createSetElement(TinnerCont, 'p', 'text');
        if(['text', 'number', 'email'].includes(type)){
          inputTag = createSetElement(TinnerCont, 'input');
          span = createSetElement(TinnerCont, 'span');
        }
        else if(type === 'option'){
          selectTag = createSetElement(TinnerCont, 'select');
        }

        btnCont = createSetElement(article, 'section', 'mainBtn');
        confirm = createSetElement(btnCont, 'button', 'confirm');
        cancel = createSetElement(btnCont, 'button', 'cancel');
      break;
      case 'confirm':
        content = createSetElement(article, 'section', 'content');
        if(icon) centerImg = createSetElement(content, 'img', ['icon', 'center']);
        info = createSetElement(content, 'div', 'info');

        TinnerCont = createSetElement(info, 'div', 'innerCont');
        titleH1 = createSetElement(TinnerCont, 'h1', 'title');
        textP = createSetElement(TinnerCont, 'p', 'text');
        
        btnCont = createSetElement(article, 'section', 'mainBtn');
        confirm = createSetElement(btnCont, 'button', 'confirm');
        cancel = createSetElement(btnCont, 'button', 'cancel');
      break;
    }

    // divPN.innerHTML =
    // `<article>
    //   <section class="content">
    //     <img class="icon center" alt="icon">
    //     <div class="info">
    //       <img class="icon side" alt="icon">
    //       <div class="innerCont">
    //         <h2 class="title"></h2>
    //         <p class="text"></p>
    //         <input required>
    //         <select></select>
    //         <span></span>
    //       </div>
    //     </div>
    //   </section>
    //   <section class="mainBtn">
    //     <button class="confirm"></button>
    //     <button class="cancel"></button>
    //   </section>
    // </article>`;
    return {divPN, article, content, info, centerImg, titleH1, textP, inputTag, selectTag, span, btnCont, confirm, cancel};
  };
  /**
   * @param {modalHTMLElements} el 
   * @param {Object} data 
   */
  const setElements = async (el, data) => { 
    const {modalType, title, text, icon, location, type, placeholder, options, confirmBtnText, cancelBtnText, animate, autoClose, timer} = data;
    const {divPN, article, content, info, centerImg, titleH1, textP, inputTag, selectTag, span, btnCont, confirm, cancel} = el;
    
    textP.innerText = text;
    if(titleH1) titleH1.innerText = title || '';
    if(confirm) confirm.innerText = confirmBtnText || 'Confirm';
    if(cancel) cancel.innerText = cancelBtnText || 'Cancel';
    
    Object.assign(el.divPN.dataset, {
      bimpn: '',
      bimpnType: modalType,
      bimpnLocation: location,
    });

    if(icon && centerImg){
      centerImg.src = icons[icon];
      centerImg.alt = 'icon';
    }

    if(animate) divPN.dataset.bimpnAnimate = 'start';
    if(modalType === 'toast' || autoClose){
      await delay(timer);
      if(animate) divPN.dataset.bimpnAnimate = 'end';
      await delay(290);
      document.body.contains(divPN) && document.body.removeChild(divPN);
    }
    else if(modalType === 'toast'){
      divPN.dataset.bimpnAutoClose = '';
      confirm.innerText = 'Ok';
      confirm.addEventListener('click', async () => {
        if(animate){
          divPN.dataset.bimpnAnimate = 'end';
          await delay(290);
        }
        document.body.contains(divPN) && document.body.removeChild(divPN);
      });
    }
    if(modalType === 'input' && ['text', 'number', 'email'].includes(type)){
      Object.assign(inputTag, {type, placeholder, required: true});
    }
    else if(modalType === 'input' && type === 'option'){
      selectTag.innerHTML = options.map(option => `<option value="${option}">${option}</option>`).join('');
    }
  };
  /**
   * @param {Object<string, HTMLElement>} el 
   * @param {String} type  
   * @param {(result: Results | null) => void} callback
   */
  const buttonEvents = (el, type, callback) => {
    el.divPN.addEventListener('click', e => {
      const tArticle = e.target.closest('article');
      const tButton = e.target.closest('button');
      
      if(!tArticle) return callback(null);
      if(!tButton) return; 

      const isConfirmed = tButton.classList.contains('confirm');
      const isCancelled = tButton.classList.contains('cancel');
      const result = {isConfirmed, isCancelled};
      
      if(!isConfirmed || type === 'confirm') return callback(result);
      
      const tag = type === 'option' ? el.selectTag : el.inputTag;
      
      if(type === 'option' || el.inputTag.checkValidity()){
        result.value = tag.value;
        return callback(result);
      }
      else if(tag.validationMessage !== ''){
        el.span.innerText = 'Invalid Input';
        el.span.style.display = 'inline';
      }
    });
  };
  
  class BimPushNotifications {
    constructor(){}
    /**
     * @typedef {Object} ToastPN
     * @property {string} text - The toast message.
     * @property {Locations} [location] - The location of the toast on the screen (default: 'top-left').
     * @property {boolean} [animate] - Enable toast animation (default: true).
     * @property {number} [timer] - Duration (in milliseconds) before the toast disappears (default: 2000).
     * 
     * @param {ToastPN} data
     */
    toast = (data) => {
      data = setDefaultValues('toast', data);
      validate(data, ['text']);
      
      const el = init(data);
      setElements(el, data);
    };
    /**
     * @typedef {Object} AlertPN
     * @property {string} title - The title of the alert.
     * @property {string} text - The alert message.
     * @property {Icon} icon - The type of icon to display.
     * @property {boolean} [animate] - Enable alert animation (default: true).
     * @property {boolean} [autoClose] - Toggle auto close (default: true).
     * @property {number} [timer] - Duration (in milliseconds) before the alert disappears (default: 2000).
     * 
     * @param {AlertPN} data
     */
    alert = (data) => {
      data = setDefaultValues('alert', data);
      validate(data, ['text']);

      const el = init(data);
      setElements(el, data);
    };
    /**
     * @typedef {Object} InputPN
     * @property {string} title - The title of the input modal.
     * @property {string} text - The input prompt message.
     * @property {Icon} icon - The type of icon to display.
     * @property {Type} type - The type of input field.
     * @property {Array} options - List of options.
     * @property {string} [placeholder] - Placeholder text for the input field.
     * @property {Array<string>} options - Options for a select input (if applicable).
     * 
     * @param {InputPN} data
     * @returns {Promise<Results>}
     */
    input = (data) => {
      data = setDefaultValues('input', data);
      
      ['text', 'number', 'email'].includes(data.type) ? validate(data, ['text']) :
      data.type === 'option' ? validate(data, ['text', 'options']) :
      (() => {throw new Error(`Invalid input type: '${data.type}'.`)})();
      
      const el = init(data);
      setElements(el, data);
      
      return new Promise((resolve) => {
        buttonEvents(el, data.type, async (result) => {
          if(result) resolve(result);
          if(data.animate){
            el.divPN.dataset.bimpnAnimate = 'end';
            await delay(290);
          }
          if(document.body.contains(el.divPN))
            document.body.removeChild(el.divPN);
        });
      });
    };
    /**
     * @typedef {Object} ConfirmPN
     * @property {string} title - The title of the confirmation modal.
     * @property {string} text - The confirmation prompt message.
     * @property {Icon} icon - The type of icon to display.
     * @property {string} [confirmButtonText] - Text for the confirm button.
     * @property {string} [cancelButtonText] - Text for the cancel button.
     * 
     * @param {ConfirmPN} data
     * @returns {Promise<Results>}
     */
    confirm = (data) => {
      data = setDefaultValues('confirm', data);
      validate(data, ['text']);
  
      const el = init(data);
      setElements(el, data);
  
      return new Promise((resolve) => {
        buttonEvents(el, 'confirm', async (result) => {
          if(result) resolve(result);
          if(data.animate){
            el.divPN.dataset.bimpnAnimate = 'end';
            await delay(290);
          }
          if(document.body.contains(el.divPN))
            document.body.removeChild(el.divPN);
        });
      });
    };
  };

  return new BimPushNotifications();
})();