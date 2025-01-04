function setDocumentTitle(title: string) {
  document.title = `${title} - WeBuildTogether`;
}

function triggerWhenFound(elementSrc: HTMLElement, targetElement: HTMLElement, cb: (isFound: boolean, elementFound?: HTMLElement|null) => void) {
  if(elementSrc === targetElement)
    return cb(true, elementSrc);
  let parent = elementSrc.parentElement;
  while(parent && parent !== targetElement)
    parent = parent.parentElement;
  if(!parent || (parent && parent !== targetElement))
    return cb(false, parent);
}

let timer: number;
function debunce(func: ((...args: any) => any), delay: number): ((...args: any) => void) {
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, args), delay);
  }
}

export {
  setDocumentTitle,
  triggerWhenFound,
  debunce
}
