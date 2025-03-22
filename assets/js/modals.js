/**
 * @typedef {'text' | 'number' | 'email' | 'option'} Input
 * @typedef {'check' | 'info' | 'warning' | 'error' | 'question'} Icon
 * @typedef {'top-left' | 'bottom-left' | 'top-right' | 'bottom-right' | 'center'} Locations
 * 
 * @typedef {Object} AlertPN
 * @property {string} title - The title of the alert.
 * @property {string} text - The alert message.
 * @property {Icon} icon - The type of icon to display.
 * @property {Locations} [location] - The location of the alert on the screen (default: 'top-left').
 * @property {boolean} [animate] - Enable alert animation (default: true).
 * @property {boolean} [autoClose] - Toggle auto close (default: true).
 * @property {number} [timer] - Duration (in milliseconds) before the alert disappears (default: 2000).
 * 
 * @typedef {Object} InputPN
 * @property {string} title - The title of the input modal.
 * @property {string} text - The input prompt message.
 * @property {Icon} icon - The type of icon to display.
 * @property {Input} input - The type of input field.
 * @property {Array} options - List of options.
 * @property {string} [placeholder] - Placeholder text for the input field.
 * @property {Array<string>} options - Options for a select input (if applicable).
 * 
 * @typedef {Object} ConfirmPN
 * @property {string} title - The title of the confirmation modal.
 * @property {string} text - The confirmation prompt message.
 * @property {Icon} icon - The type of icon to display.
 * @property {string} [confirmButtonText] - Text for the confirm button.
 * @property {string} [cancelButtonText] - Text for the cancel button.
 * 
 * @typedef {Object} Results
 * @property {Boolean} isConfirmed - User confirmed input
 * @property {Boolean} isCancelled - User cancelled input
 */
class BimPN {
  constructor(){}
  #delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  #init(){
    const divPN = document.createElement('div');
    document.body.appendChild(divPN);
    divPN.innerHTML = `
    <article>
      <section class="content">
        <img class="icon center" alt="icon">
        <div class="info">
          <img class="icon side" alt="icon">
          <div class="innerCont">
            <h2 class="title"></h2>
            <p class="text"></p>
            <input required>
            <select></select>
            <span></span>
          </div>
        </div>
      </section>
      <section class="mainBtn">
        <button class="confirm"></button>
        <button class="cancel"></button>
      </section>
    </article>`;
    const confirm = divPN.querySelector('.confirm');
    const cancel = divPN.querySelector('.cancel');
    const sideImg = divPN.querySelector('.icon.side');
    const centerImg = divPN.querySelector('.icon.center');
    const titleB = divPN.querySelector('.title');
    const textP = divPN.querySelector('.text');
    const inputTag = divPN.querySelector('input');
    const selectTag = divPN.querySelector('select');
    const span = divPN.querySelector('span');
    const icons = {
      check: './assets/images/svg/circle-check.svg',
      info: './assets/images/svg/circle-info.svg',
      warning: './assets/images/svg/circle-exclamation.svg',
      error: './assets/images/svg/circle-xmark.svg',
      question: './assets/images/svg/circle-question.svg',
    }
    return {divPN, confirm, cancel, sideImg, centerImg, titleB, textP, inputTag, selectTag, span, icons};
  }
  #validate(el, data, arr){
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
          if(!Object.keys(el.icons).includes(value))
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
      if(data[item] !== undefined) return;
      throw new Error(`${item} is not defined.`);
    });
  }
  async #setElements(el, data){ 
    let {modalType, title, text, icon, location, animate, autoClose, timer, confirmBtnText, cancelBtnText} = data;
    
    el.titleB.innerText = title || '';
    el.textP.innerText = text;
    el.confirm.innerText = confirmBtnText || 'Confirm';
    el.cancel.innerText = cancelBtnText || 'Cancel';
    
    Object.assign(el.divPN.dataset, {
      bimpn: '',
      bimpnType: modalType,
      bimpnLocation: location,
    });

    if(icon){
      el.sideImg.src = el.icons[icon];
      el.centerImg.src = el.icons[icon];

      el.divPN.dataset.bimpnHasimg  = '';
    }

    if(animate) el.divPN.dataset.bimpnAnimate = 'start';
    if(modalType === 'alert'){
      if(autoClose || location !== 'center'){
        await this.#delay(timer);
        if(animate) el.divPN.dataset.bimpnAnimate = 'end';
        await this.#delay(180);
        document.body.removeChild(el.divPN);
      }
      else{
        el.divPN.dataset.bimpnAutoClose = '';
        el.confirm.innerText = 'Ok';
        el.confirm.addEventListener('click', async () => {
          if(animate){
            el.divPN.dataset.bimpnAnimate = 'end';
            await this.#delay(180);
          }
          document.body.removeChild(el.divPN);
        });
      }
    }
    
  }
  #buttonEvents(el, type, callback){
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
    })
  }
  /**
   * @param {AlertPN} data
   */
  alert(data){
    data.modalType = 'alert';
    data.location ??= 'top-left';
    data.animate ??= true;
    data.autoClose ??= true;
    data.timer = (data.timer ?? 2000) + 200;

    const el = this.#init();
    
    this.#validate(el, data, ['text']);
    this.#setElements(el, data);
  };
  /**
   * @param {InputPN} data
   * @returns {Promise<Results>}
   */
  async input(data){
    return new Promise((resolve) => {
      const {type = 'text', placeholder = '', options} = data;
      data.modalType = 'input';
      data.location = 'center';
      data.animate ??= false;
    
      const el = this.#init();
      
      if(['text', 'number', 'email'].includes(type)){
        this.#validate(el, data, ['text']);

        Object.assign(el.inputTag, {type, placeholder});
        el.inputTag.style.display = 'block';
      }
      else if(type === 'option'){
        this.#validate(el, data, ['text', 'options']);

        for(const option of options)
          el.selectTag.innerHTML += `<option value="${option}">${option}</option>`;
        
        el.selectTag.style.display = 'block';
      }
      else throw new Error(`Invalid input type: '${type}'.`);
      
      this.#setElements(el, data);
      
      this.#buttonEvents(el, type, async (result) => {
        if(result) resolve(result);
        if(data.animate){
          el.divPN.dataset.bimpnAnimate = 'end';
          await this.#delay(180);
        }
        document.body.removeChild(el.divPN);
      });
    });
  };
  /**
   * @param {ConfirmPN} data
   * @returns {Promise<Results>}
   */
  async confirm(data){
    return new Promise((resolve) => {
      data.modalType = 'confirm';
      data.location = 'center';
      data.animate ??= false;
    
      const el = this.#init();
      
      this.#validate(el, data, ['text']);
      this.#setElements(el, data);
      
      this.#buttonEvents(el, 'confirm', async (result) => {
        if(result) resolve(result);
        if(data.animate){
          el.divPN.dataset.bimpnAnimate = 'end';
          await this.#delay(180);
        }
        document.body.removeChild(el.divPN);
      });
    });
  };
}

const bimPN  = new BimPN();