pnSettings = {
  toast: {
    icon: 'check',
    location: 'top-left',
    animate: 'true',
  },
  alert: {
    icon: 'check',
    animate: 'true',
    autoClose: 'true',
  },
  input: {
    type: 'text',
  },
  confirm: {},
};
// Array.from(document.querySelector('.pushN').children).forEach(pn => {
//   const funcName = pn.classList.toString();
  
//   Array.from(pn.querySelectorAll('.property')).forEach(property => {
//     const name = property.querySelector('p').innerText;
//     const ull = property.querySelector('ul');
//     ull.addEventListener('click', e => {
//       const target = e.target.closest('li');
//       if(!target) return;

//       const value = target.innerText;
      
//       pnSettings[funcName][name] = (pnSettings[funcName][name] === value) ? null : value;
      
//       const pasteDiv = pn.querySelector(`.paste${name}`);
//       if(pnSettings[funcName][name] === null){
//         pasteDiv.innerHTML = '';
//         return;
//       }
//       else if(pn.classList.contains('input') && value === 'option'){
//         pasteDiv.innerHTML = `<br>  <span class="lblue">${name}:</span> <span class="orange">'${value}'</span>,<br>  <span class="lblue">options:</span> <span class="dblue">[</span><span class="mint">1</span>, <span class="mint">2</span>, <span class="mint">3</span><span class="dblue">]</span>,`;
//       }
//       else if(['true', 'false'].includes(value)){
//         pasteDiv.innerHTML = `<br>  <span class="lblue">${name}:</span> <span class="dblue">${value}</span>,`;
//       }
//       else{
//         pasteDiv.innerHTML = `<br>  <span class="lblue">${name}:</span> <span class="orange">'${value}'</span>,`;
//       }
//     });
//   });
// });
function runCode(type){
  let codeContent = document.querySelector(`.pushN .${type} pre code`).textContent;

  try{
    eval(codeContent);
  }
  catch(error){
    console.error('Error executing code:', error);
  }
}

const sliderUl = document.querySelector('.cardList');
new bimSlider(sliderUl, {
  type: 'normal',
  type: 'loop',
  // type: 'auto-scroll',
  arrows: true,
  // spanWidth: true,
  draggable: true,
  scrollable: true,
  pagination: 'dots',
  pagination: 'numbers',
});

const bc = document.getElementById('breadcrumbs-list');
const bcTest = new breadcrumbs(bc, {
  setHome: {
    text: 'asd',
  },
});
bcTest.addCrumb({
  text: 'Deg 1',
  href: '#',
  clickEvent: function(){
    console.log('1');
  }
});
bcTest.addCrumb({
  text: 'Deg 2',
  href: '#',
  clickEvent: function(){
    console.log('2');
  }
});
bcTest.addCrumb({
  text: 'degadd',
  href: '#',
  clickEvent: function(){
    console.log('3');
  }
});
// bcTest.deleteCrumbs("Deg 2");
const varSel = document.querySelector('#variantSelector');
const as = new variantSelector(varSel, {
  productList: {
    "Born to Win": {
      "with Album": {
        "Aiah": {
          price: 420,
          stock: 1,
        },
        "Stacey": {
          price: 310,
          stock: 2,
        },
        "Maloi": {
          price: 350,
          stock: 3,
        },
        "Colet": {
          price: 380,
          stock: 6,
        },
        "Sheena": {
          price: 300,
          stock: 7,
        },
        "Mikha": {
          price: 405,
          stock: 8,
        },
      },
      "PC only": {
        "Stacey": {
          price: 310,
          stock: 2,
        },
        "Sheena": {
          price: 300,
          stock: 7,
        },
        "Mikha": {
          price: 405,
          stock: 8,
        },
      },
    },
    "Feel Good": {
      "with Album": {
        "Aiah": {
          price: 420,
          stock: 10,
        },
        "Stacey": {
          price: 310,
          stock: 20,
        },
        "Maloi": {
          price: 350,
          stock: 30,
        },
        "Gwen": {
          price: 375,
          stock: 50,
        },
        "Colet": {
          price: 380,
          stock: 60,
        },
      },
    },
    "Talaarawan": {
      "with Album": {
        "Aiah": {
          price: 420,
          stock: 9,
        },
        "Stacey": {
          price: 310,
          stock: 0,
        },
        "Maloi": {
          price: 350,
          stock: 12,
        },
        "Jhoanna": {
          price: 390,
          stock: 90,
        },
        "Gwen": {
          price: 375,
          stock: 14,
        },
        "Colet": {
          price: 380,
          stock: 62,
        },
        "Sheena": {
          price: 300,
          stock: 100,
        },
        "Mikha": {
          price: 450,
          stock: 8,
        },
      },
      "PC only": {
        "Aiah": {
          price: 420,
          stock: 9,
        },
        "Stacey": {
          price: 310,
          stock: 0,
        },
        "Maloi": {
          price: 350,
          stock: 12,
        },
        "Jhoanna": {
          price: 390,
          stock: 90,
        },
        "Gwen": {
          price: 375,
          stock: 0,
        },
        "Colet": {
          price: 380,
          stock: 62,
        },
        "Sheena": {
          price: 300,
          stock: 100,
        },
        "Mikha": {
          price: 405,
          stock: 0,
        },
      },
    },
  },
  varNames: ["Album", "Inclusion", "Member"],
});