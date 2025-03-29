const nav = document.querySelector('nav');
const barsBtn = nav.querySelector('.barsBtn');
const closeBtn = nav.querySelector('.closeBtn');
const end = nav.querySelector('.end');
const navLinks = end.querySelector('.navLinks');

[...navLinks.querySelectorAll(':scope > li')].filter(li => li.querySelector('ul')).forEach(firstLI => {
  const ul = firstLI.querySelector(':scope > ul');
  ul.classList.add('firstDepthSubNav', 'subNav');
  
  [firstLI, ...[...ul.querySelectorAll('li')].filter(li => li.querySelector('ul'))].forEach(li => li.classList.add('hasSubNav'));
  
  ul.querySelectorAll('ul').forEach(deepUL => deepUL.classList.add('nthDepthSubNav', 'subNav'));
});

const hasSubNav = navLinks.querySelectorAll('.hasSubNav');
const navA = navLinks.querySelectorAll('li:not(.hasSubNav) a');

const handleOpen = () => {
  end.classList.add('show');
  end.removeAttribute('inert');
  barsBtn.setAttribute('aria-expanded', 'true');
}
const handleClose = () => {
  end.classList.remove('show');
  end.setAttribute('inert', '');
  barsBtn.setAttribute('aria-expanded', 'false');
}
const documentClick = (e) => {
  if(e.target.closest('nav') === nav) return;
  handleClose();
}
const toggleSubNav = (event) => {
  const li = event.currentTarget.closest('li');
  const ul = li.querySelector(':scope > ul');

  li.classList.toggle('show');

  if(li.classList.contains('show'))
    ul.removeAttribute('inert');
  else
    ul.setAttribute('inert', '');
}
const setSvgMargin = (isDesktop) => {
  const allULs = nav.querySelectorAll('ul');

  allULs.forEach((ul, i) => {
    const svgs = ul.querySelectorAll(':scope > li > a > svg');
    
    if(i === 0 && isDesktop){
      svgs.forEach(svg => svg.style.marginRight = '');
      return;
    }
    
    let maxWidth = 0;

    svgs.forEach(svg => {
      const width = svg.getBoundingClientRect().width;
      if(width > maxWidth) maxWidth = width;
    });
    svgs.forEach(svg => {
      const width = svg.getBoundingClientRect().width;
      svg.style.marginRight = `${maxWidth - width}px`
    });
  });
}

const queryMatched = (e) => {
  if(e.matches){
    document.addEventListener('click', documentClick);
    navA.forEach(a => a.addEventListener('click', handleClose));
    hasSubNav.forEach(li => li.querySelector(':scope > a').addEventListener('click', toggleSubNav));
    navLinks.querySelectorAll('ul').forEach(ul => ul.setAttribute('inert', ''));

    handleClose();
    setSvgMargin();
  }
  else{
    document.removeEventListener('click', documentClick);
    navA.forEach(a => a.removeEventListener('click', handleClose));
    hasSubNav.forEach(li => li.querySelector(':scope > a').removeEventListener('click', toggleSubNav));
    navLinks.querySelectorAll('ul').forEach(ul => ul.removeAttribute('inert'));

    end.classList.remove('show');
    end.removeAttribute('inert');
    barsBtn.removeAttribute('aria-expanded');
    setSvgMargin(true);
  }

  hasSubNav.forEach(li => li.classList.remove('show'));
}

const mediaQuery = window.matchMedia('(max-width: 720px)');
queryMatched(mediaQuery);
mediaQuery.addEventListener('change', queryMatched);