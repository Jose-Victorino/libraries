const radioBtns = document.querySelectorAll('[data-radioBtns]');
radioBtns.forEach((btnList) => {
  const radioBtnArr = Array.from(btnList.children);
  
  btnList.addEventListener('click', e => {
    const tag = e.target.closest(radioBtnArr[0].nodeName);
    if(!tag) return;

    radioBtnArr.forEach((btn) => {
      btn === tag ? btn.classList.toggle('selected') : btn.classList.remove('selected');
    });
  });
});