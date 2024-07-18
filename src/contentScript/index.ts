import { highlightWordInDocument } from './highlightWord';
import { updatePopup } from './popup';
import { fetchDefinition } from './fetchDefinition';
import { PopupState, HighlightOptions } from './types';

const highlightOptions: HighlightOptions = {
  color: 'rgb(245, 153, 86)'
};

let selectedText = '';

document.addEventListener('mouseup', handleTextSelection);
document.addEventListener('keydown', handleKeyDown);

function handleTextSelection(event: MouseEvent): void {
  selectedText = window.getSelection()?.toString().trim() || '';
}

async function handleKeyDown(event: KeyboardEvent): Promise<void> {
  if (event.key === 'Control' && selectedText) {
    console.log("Control + Click "+selectedText);
    await handleWordSelection();
  }
}

async function handleWordSelection(): Promise<void> {
  const selectedText = window.getSelection()?.toString().trim();
  if (selectedText) {
    let popup = document.getElementById('popup');
    if (!popup) {
      popup = createPopup();
    }

    popup.innerHTML = `
      <div id="closePopup" style="float: right; cursor: pointer;">X</div>
      <p>${new Date().toLocaleTimeString()}</p>
      <p>正在查询: ${selectedText}...</p>
    `;
    popup.style.display = 'block';

    try {
      const definition = await fetchDefinition(selectedText);
      popup.innerHTML = `
        <div id="closePopup" style="float: right; cursor: pointer;">X</div>
        <p>${new Date().toLocaleTimeString()}</p>
        <p>${definition}</p>
      `;
      highlightWordInDocument(selectedText, highlightOptions);
      setupCloseButton();
    } catch (error) {
      popup.innerHTML = `
        <div id="closePopup" style="float: right; cursor: pointer;">X</div>
        <p>查询失败: ${error instanceof Error ? error.message : 'Unknown error'}</p>
      `;
    }
  }
}

function createPopup(): HTMLElement {
  const popup = document.createElement('div');
  popup.id = 'popup';
  popup.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #202124;
    border: 1px solid #ccc;
    padding: 20px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    z-index: 1000;
    max-width: 300px;
    word-wrap: break-word;
  `;
  document.body.appendChild(popup);
  return popup;
}

function setupCloseButton(): void {
  const closeButton = document.getElementById('closePopup');
  if (closeButton) {
    closeButton.onclick = () => {
      const popup = document.getElementById('popup');
      if (popup) popup.style.display = 'none';
    };
  }
}