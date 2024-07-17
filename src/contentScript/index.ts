let triggerKey: string = 'Ctrl'; // 默认触发键
let selectedText: string = '';
let popup: HTMLDivElement | null = null;

// 使用防抖函数优化selectionchange事件处理
const debounce = <F extends (...args: any[]) => void>(func: F, delay: number): F => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return ((...args: Parameters<F>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  }) as F;
};

// 优化选中文本事件监听
document.addEventListener('selectionchange', debounce(() => {
  const selection = window.getSelection();
  selectedText = selection ? selection.toString().trim() : '';
}, 200));

// 优化键盘事件监听
document.addEventListener('keydown', (event: KeyboardEvent) => {
  if (event.ctrlKey && selectedText) {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      showPopup(selectedText, rect.left, rect.bottom);
    }
  }
  if (event.key === 'Escape' && popup) {
    popup.style.display = 'none';
  }
});

// 点击其他区域关闭弹出窗口
document.addEventListener('click', (event: MouseEvent) => {
  if (popup && !popup.contains(event.target as Node)) {
    popup.style.display = 'none';
  }
});

function showPopup(word: string, x: number, y: number): void {
  if (!popup) {
    popup = document.createElement('div');
    popup.id = 'extension-popup';
    popup.style.cssText = `
      position: fixed;
      z-index: 9999;
      background: white;
      border: 1px solid #ccc;
      border-radius: 4px;
      padding: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      max-width: 300px;
      font-family: Arial, sans-serif;
      display: none;
    `;
    document.body.appendChild(popup);
  }

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const popupWidth = 300;
  const popupHeight = 150;

  let left = Math.min(x, viewportWidth - popupWidth - 10);
  let top = Math.min(y, viewportHeight - popupHeight - 10);

  popup.style.left = `${left}px`;
  popup.style.top = `${top}px`;

  popup.innerHTML = `<p>正在查询: ${word}...</p>`;
  popup.style.display = 'block';

  fetchDefinition(word)
    .then(definition => {
      if (popup) {
        popup.innerHTML = `
          <h3>${word}</h3>
          <p>${definition}</p>
          <button id="closePopup">关闭</button>
        `;
        const closeButton = document.getElementById('closePopup');
        if (closeButton) {
          closeButton.onclick = () => {
            if (popup) popup.style.display = 'none';
          };
        }
      }
    })
    .catch(error => {
      if (popup) {
        popup.innerHTML = `<p>查询失败: ${error.message}</p>`;
      }
    });
}

async function fetchDefinition(word: string): Promise<string> {
  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    if (!response.ok) throw new Error('词典查询失败');
    const data = await response.json();
    return data[0].meanings[0].definitions[0].definition;
  } catch (error) {
    console.error('获取定义时出错:', error);
    throw error;
  }
}

// 从storage中获取配置的触发键
chrome.storage.sync.get('triggerKey', (data: { triggerKey?: string }) => {
  if (data.triggerKey) {
    triggerKey = data.triggerKey;
  }
});

// 监听来自popup或options的消息,更新触发键
chrome.runtime.onMessage.addListener((request: { action: string; key: string }, sender, sendResponse) => {
  if (request.action === 'updateTriggerKey') {
    triggerKey = request.key;
  }
});
