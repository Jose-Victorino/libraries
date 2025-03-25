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
   * @typedef {'top-left' | 'bottom-left' | 'top-right' | 'bottom-right' | 'center'} Locations
   * @typedef {'alert' | 'input' | 'confirm'} ModalType
   * 
   * @typedef {Object} Results
   * @property {Boolean} isConfirmed - User confirmed input
   * @property {Boolean} isCancelled - User cancelled input
   */
  /**
   * @param {Number} ms 
   * @returns {Promise<Results>}
   */
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  /**
   * @param {ModalType} modalType 
   * @param {ModalData} data 
   */
  const setDefaultValues = (modalType, data) => {
    data.modalType = modalType;
    switch(modalType){
      case 'alert':
        data.location ??= 'top-left';
        data.animate ??= true;
        data.autoClose ??= true;
        data.timer = (data.timer ?? 2000) + 200;
      break;
      case 'input':
        data.location = 'center';
        data.type ??= 'text';
        data.placeholder ??= '';
        data.animate ??= false;
      break;
      case 'confirm':
        data.location = 'center';
        data.animate ??= false;
      break;
    }
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
   * @returns {Object<string, HTMLElement>}
   */
  const init = ({modalType, location, icon, type, autoClose}) => {    
    const divPN = createSetElement(document.body, 'div');
    const article = createSetElement(divPN, 'article');
    let content, info, sideImg, centerImg, titleB, textP, inputTag, selectTag, span, btnCont, confirm, cancel;

    switch(modalType){
      case 'alert':
        content = createSetElement(article, 'section', 'content');

        if(location === 'center'){
          if(icon) centerImg = createSetElement(content, 'img', ['icon', 'center']);
          info = createSetElement(content, 'div', 'info');
        }
        else{
          info = createSetElement(content, 'div', 'info');
          if(icon) sideImg = createSetElement(info, 'img', ['icon', 'side']);
        }
        
        TinnerCont = createSetElement(info, 'div', 'innerCont');

        if(location === 'center'){
          titleB = createSetElement(TinnerCont, 'h2', 'title');
          if(!autoClose){
            btnCont = createSetElement(article, 'section', 'mainBtn');
            confirm = createSetElement(btnCont, 'button', 'confirm');
          }
        }
        textP = createSetElement(TinnerCont, 'p', 'text');
      break;
      case 'input':
        content = createSetElement(article, 'section', 'content');
        info = createSetElement(content, 'div', 'info');
        TinnerCont = createSetElement(info, 'div', 'innerCont');
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
        titleB = createSetElement(TinnerCont, 'h2', 'title');
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
    return {divPN, article, content, info, sideImg, centerImg, titleB, textP, inputTag, selectTag, span, btnCont, confirm, cancel};
  };
  /**
   * @param {Object<string, HTMLElement>} el 
   * @param {Object} data 
   */
  const setElements = async (el, data) => { 
    const {modalType, title, text, icon, location, type, placeholder, options, confirmBtnText, cancelBtnText, animate, autoClose, timer} = data;
    const {divPN, confirm, cancel, sideImg, centerImg, titleB, textP, inputTag, selectTag, span} = el;
    
    textP.innerText = text;
    if(titleB) titleB.innerText = title || '';
    if(confirm) confirm.innerText = confirmBtnText || 'Confirm';
    if(cancel) cancel.innerText = cancelBtnText || 'Cancel';
    
    Object.assign(el.divPN.dataset, {
      bimpn: '',
      bimpnType: modalType,
      bimpnLocation: location,
    });

    if(icon){
      if(sideImg){
        sideImg.src = icons[icon];
        sideImg.alt = 'icon';
      }
      if(centerImg){
        centerImg.src = icons[icon];
        centerImg.alt = 'icon';
      }
    }

    if(animate) el.divPN.dataset.bimpnAnimate = 'start';
    if(modalType === 'alert'){
      if(autoClose || location !== 'center'){
        await delay(timer);
        if(animate) el.divPN.dataset.bimpnAnimate = 'end';
        await delay(180);
        document.body.removeChild(divPN);
      }
      else{
        el.divPN.dataset.bimpnAutoClose = '';
        el.confirm.innerText = 'Ok';
        el.confirm.addEventListener('click', async () => {
          if(animate){
            el.divPN.dataset.bimpnAnimate = 'end';
            await delay(180);
          }
          document.body.removeChild(divPN);
        });
      }
    }
    else if(modalType === 'input'){
      if(['text', 'number', 'email'].includes(type)){
        Object.assign(el.inputTag, {
          type,
          placeholder,
          required: true,
        });
      }
      else if(type === 'option'){
        for(const option of options)
          el.selectTag.innerHTML += `<option value="${option}">${option}</option>`;
      }
    }
  };
  /**
   * @param {Object<string, HTMLElement>} el 
   * @param {String} type  
   * @param {(result: Results) => void} callback
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
     * @typedef {Object} AlertPN
     * @property {string} title - The title of the alert.
     * @property {string} text - The alert message.
     * @property {Icon} icon - The type of icon to display.
     * @property {Locations} [location] - The location of the alert on the screen (default: 'top-left').
     * @property {boolean} [animate] - Enable alert animation (default: true).
     * @property {boolean} [autoClose] - Toggle auto close (default: true).
     * @property {number} [timer] - Duration (in milliseconds) before the alert disappears (default: 2000).
     * 
     * @param {AlertPN} data
     */
    alert = (data) => {
      setDefaultValues('alert', data);
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
    input = async (data) => {
      setDefaultValues('input', data);
      
      (['text', 'number', 'email'].includes(data.type)) ? validate(data, ['text']) :
      (data.type === 'option') ? validate(data, ['text', 'options']) :
      (() => {throw new Error(`Invalid input type: '${data.type}'.`)})();
      
      const el = init(data);
      setElements(el, data);
      
      return new Promise((resolve) => {
        buttonEvents(el, data.type, async (result) => {
          if(result) resolve(result);
          if(data.animate){
            el.divPN.dataset.bimpnAnimate = 'end';
            await delay(180);
          }
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
    confirm = async (data) => {
      setDefaultValues('confirm', data);
      validate(data, ['text']);
  
      const el = init(data);
      setElements(el, data);
  
      return new Promise((resolve) => {
        buttonEvents(el, 'confirm', async (result) => {
          if(result) resolve(result);
          if(data.animate){
            el.divPN.dataset.bimpnAnimate = 'end';
            await delay(180);
          }
          document.body.removeChild(el.divPN);
        });
      });
    };
  };

  return new BimPushNotifications();
})();