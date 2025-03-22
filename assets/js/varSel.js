class variantSelector{
  /**
   * @typedef
   * @property
   * 
   * @param
   * @param {HTMLElement} varSelCont
   * @param {Object} data
   * @param {Object} data.productList
   * @param {Array<String>} data.varNames
   */

  constructor(varSelCont, data){
    Object.assign(this, {
      varSelCont,
      data,
      varDiv: [],
    });

    this.validate();
    this.initEventHandlers();
    this.style();
  }
  validate(){
    const {varNames} = this.data;

    function validate(option, validType, validator = null){
      if(!(typeof option === validType && (validator ? validator(option) : true)))
        throw new Error(`Invalid value for option: ${option}`);
    }

    this.data.varNames = Array.isArray(varNames) ? varNames : [];

    if(!this.data.varNames.every(v => typeof v === 'string')){
      throw new Error(`Invalid data format. All names must be strings.`);
    }
    
  }
  initEventHandlers(){
    const {productList, varNames} = this.data;
    
    function buildProductTable(obj = productList, depthIndex = 0, prevKeys = {}, record = []){
      if(!obj || typeof obj !== "object") return ;
      const {price, stock} = obj;
      
      Object.entries(obj).forEach(([key, values]) => {
        if(typeof values === "object"){
          const label = varNames[depthIndex] || `Variation ${depthIndex + 1}`;
          buildProductTable(values, depthIndex + 1, {...prevKeys, [label]: key}, record); 
        }
      });

      if(price && stock > 0) record.push({...prevKeys, price, stock});
      
      return record;
    }
    
    const htmlDiv = document.querySelector('#variantSelector');
    const stockP = htmlDiv.querySelector('p[data-varSelPrice]');
    const priceP = htmlDiv.querySelector('p[data-varSelStock]');
    const productTable = buildProductTable();
    const selectedVars = {};
    
    function setP({stock, price}){
      stockP.innerText = `Stock: ${stock.min}${(stock.min === stock.max) ? '' : '-' + stock.max}`;
      priceP.innerText = `Price: ${price.min}${(price.min === price.max) ? '' : '-' + price.max}`;
    }
    function setSelectedVariations({varName, varAttributeVal}){
      selectedVars[varName] = (selectedVars[varName] === varAttributeVal) ? null : varAttributeVal;
      selectedVars[varName] === null && delete selectedVars[varName];

      const filteredList = productTable.reduce((acc, cur) => {
        if(!Object.entries(selectedVars).every(([selName, selValue]) => cur[selName] === selValue && cur.stock)) return acc;
        
        Object.entries(cur).forEach(([key, value]) => {
          if(['price', 'stock'].includes(key)){
            acc[key] ??= { min: value, max: value };
            acc[key].min = Math.min(acc[key].min, value);
            acc[key].max = Math.max(acc[key].max, value);
          }
          else{
            acc[key] ??= [];
            if(!acc[key].includes(value)) acc[key].push(value);
          }
        });
        return acc;
      }, {});
      return filteredList;
    }
    function btnAction(e){
      const filteredVars = setSelectedVariations(e.target.dataset);
      const btns = htmlDiv.querySelectorAll('button');
      const selVarLength = Object.values(selectedVars).filter(Boolean).length;

      btns.forEach(btn => {
        const {varName, varAttributeVal} = btn.dataset;
        const isSelectable = filteredVars[varName]?.includes(varAttributeVal) || (selVarLength === 1 && selectedVars[varName]);
        
        btn.classList.toggle('disabled', !isSelectable);
        btn.classList.toggle("selected", selectedVars[varName] === varAttributeVal);
        
        if(isSelectable){
          btn.addEventListener("click", btnAction);
        }
        else{
          btn.removeEventListener("click", btnAction);
        }
      });
      
      setP(filteredVars);
    }
    const variations = productTable.reduce((acc, cur) => {
      Object.entries(cur).forEach(([key, value]) => {
        if(['price', 'stock'].includes(key)){
          acc[key] ??= { min: value, max: value };
          acc[key].min = Math.min(acc[key].min, value);
          acc[key].max = Math.max(acc[key].max, value);
        }
        else{
          acc[key] ??= [];
          if(!acc[key].includes(value)) acc[key].push(value);
        }
      });
      return acc;
    }, {});
    
    setP(variations);
    
    Object.entries(variations).forEach(([mainKey, values], i) => {
      if(['price', 'stock'].includes(mainKey)) return;
      
      const div = document.createElement("div");
      const h4 = document.createElement("h4");
      const ul = document.createElement("ul");

      for(const key of values){
        const li = document.createElement("li");
        const button = document.createElement("button");
        
        Object.assign(button.dataset, {
          varName: mainKey,
          varAttributeVal: key,
          varSelectBtn: '',
        });
        button.innerText = key;
        button.addEventListener("click", btnAction);

        li.append(button);
        ul.append(li);
      }
      
      this.varDiv.push(div);

      div.classList.add(`varSelectorNo.${i + 1}`);
      h4.innerText = mainKey;
      div.append(h4, ul);
      htmlDiv.append(div);
    });
  }
  style(){
    const {varDiv} = this;
    
    for(const div of varDiv){
      const ul = div.getElementsByTagName('ul')[0];
      const btns = ul.getElementsByTagName('button');
      
      Object.assign(div.style, {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
      });
      Object.assign(ul.style, {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '6px',
      });
      for(const btn of btns){
        Object.assign(btn.style, {
          whiteSpace: 'nowrap',
        });
      }
    }
  }
}
