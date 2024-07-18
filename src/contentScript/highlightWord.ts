import { HighlightOptions } from './types';

export function highlightWordInDocument(word: string, options: HighlightOptions): void {
  const bodyElement = document.body;
  highlightTextNode(bodyElement, word, options);
}

function highlightTextNode(node: Node, word: string, options: HighlightOptions): void {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent;
    if (text) {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = text.match(regex);
      if (matches) {
        const fragment = document.createDocumentFragment();
        let lastIndex = 0;
        text.split(regex).forEach((part, index) => {
          fragment.appendChild(document.createTextNode(part));
          if (index < matches.length) {
            const markElement = document.createElement('xt-mark');
            markElement.setAttribute('w', matches[index]);
            markElement.setAttribute('style', `color: ${options.color} !important;`);
            markElement.setAttribute('data-darkreader-inline-color', '');
            markElement.textContent = matches[index];
            fragment.appendChild(markElement);
          }
        });
        node.parentNode?.replaceChild(fragment, node);
      }
    }
  } else if (node.nodeType === Node.ELEMENT_NODE && node.nodeName !== 'XT-MARK' && node.nodeName !== 'SCRIPT' && node.nodeName !== 'STYLE') {
    Array.from(node.childNodes).forEach(child => highlightTextNode(child, word, options));
  }
}