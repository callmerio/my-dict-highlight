// popup.ts

import { PopupState } from './types';

export function updatePopup(state: PopupState): void {
  const popup = document.getElementById('popup');
  if (popup) {
    if (state.isLoading) {
      popup.innerHTML = `<p>正在查询: ${state.content}...</p>`;
    } else if (state.error) {
      popup.innerHTML = `
        <div id="closePopup" style="float: right; cursor: pointer;">X</div>
        <p>查询失败: ${state.error}</p>
      `;
    } else {
      popup.innerHTML = `
        <div id="closePopup" style="float: right; cursor: pointer;">X</div>
        <p>${new Date().toLocaleTimeString()}</p>
        <p>${state.content}</p>
      `;
    }
    popup.style.display = 'block';
    setupCloseButton();
  }
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