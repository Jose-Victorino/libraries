class Filter{
  /**
   * @param {HTMLElement[]} list
   * @param {Object} setFilters
   */
  constructor(list, setFilters){
    this.list = list;
    this.setFilters = setFilters;
  }
  filterList(filters){
    const {list, setFilters} = this;
    let filteredList = list;
    
    Object.keys(filters).forEach((category) => {
      if(setFilters[category] === filters[category])
        setFilters[category] = null;
      else
        setFilters[category] = filters[category];
    });
    Object.keys(setFilters).forEach((category) => {
      filteredList = filteredList.filter((item) => {
        const val = JSON.parse(item.dataset.filter)[category];
        if(setFilters[category] === null) return true;
        
        if(typeof setFilters[category] === 'object'){
          if(category.toLowerCase().includes('numrange')){
            const {min, max} = setFilters[category];
            if((min !== null && val < min) || (max !== null && val > max))
              return false;
            return true;
          }
          for(let i = 0; i < setFilters[category].length; i++){
            if(val === setFilters[category][i]) return true;
          }
        }
        else return val === setFilters[category];
      });
    });
    return filteredList;
  }
}

class FilterSQL{
  /**
   * @param {String} tableName
   * @param {Object} setFilters
   */
  constructor(tableName, setFilters){
    this.tableName = tableName
    this.setFilters = setFilters;
  }
  tableFilter(filters){
    const {tableName, setFilters} = this;
    let sqlStr = [];
    
    Object.keys(filters).forEach((category) => {
      setFilters[category] = (setFilters[category] === filters[category]) ? null : filters[category];
    });
    Object.keys(setFilters).forEach((category) => {
      if(setFilters[category] === null) return;
      if(typeof setFilters[category] === 'object'){
        if(category.toLowerCase().includes('range')){
          const {min, max} = setFilters[category];
          if(min !== null && max !== null)
            sqlStr.push(`${category} BETWEEN ${max} AND ${min}`);
          else if(min !== null)
            sqlStr.push(`${category} < ${min}`);
          else if(max !== null)
            sqlStr.push(`${category} > ${max}`);
        }
        else{
          let content = `${category} IN (`;
          for(let i = 0; i < setFilters[category].length; i++){
            if(i + 1 !== setFilters[category].length)
              content += `"${setFilters[category][i]}", `;
            else
              content += `"${setFilters[category][i]}")`;
          }
          sqlStr.push(content);
        }
      }
      else if(typeof setFilters[category] === "string"){
        sqlStr.push(`${category} = "${setFilters[category]}"`);
      }
      else sqlStr.push(`${category} = ${setFilters[category]}`);
    });
    return `SELECT * FROM ${tableName}${(sqlStr.length > 0) ? ' WHERE ' : ''}${sqlStr.join(' AND ')};`;
  }
}