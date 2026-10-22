(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.TouchControls = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  let container = null;
  let isEnabled = false;

  function init(options = {}) {
    if (typeof document === 'undefined') return;

    // Check if touch device or forced
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    const mode = options.mode || 'auto'; // 'auto', 'always', 'never'

    if (mode === 'never' || (mode === 'auto' && !isTouchDevice)) {
      if (container) container.style.display = 'none';
      return;
    }

    if (!container) {
      createControls();
    }
    container.style.display = 'flex';
    isEnabled = true;
  }

  function vibrate() {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(12); } catch (e) {}
    }
  }

  function simulateKey(key, isDown) {
    const eventType = isDown ? 'keydown' : 'keyup';
    const event = new KeyboardEvent(eventType, {
      key: key,
      bubbles: true,
      cancelable: true
    });
    window.dispatchEvent(event);
  }

  function createControls() {
    container = document.createElement('div');
    container.id = 'touchControlsContainer';
    container.style.cssText = `
      position: absolute;
      bottom: 12px;
      left: 12px;
      right: 12px;
      pointer-events: none;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      z-index: 99;
      user-select: none;
      -webkit-user-select: none;
    `;

    // --- Left D-Pad ---
    const dpad = document.createElement('div');
    dpad.id = 'touchDpad';
    dpad.style.cssText = `
      width: 140px;
      height: 140px;
      position: relative;
      pointer-events: auto;
      background: rgba(30, 30, 30, 0.45);
      border-radius: 50%;
      border: 2px solid rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(4px);
      touch-action: none;
    `;

    const makeBtn = (dir, style, key) => {
      const btn = document.createElement('div');
      btn.style.cssText = `
        position: absolute;
        width: 44px;
        height: 44px;
        background: rgba(255, 255, 255, 0.85);
        color: #111;
        font-weight: bold;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        box-shadow: 0 3px 6px rgba(0,0,0,0.3);
        font-size: 18px;
        cursor: pointer;
        ${style}
      `;
      btn.innerHTML = dir === 'up' ? '▲' : dir === 'down' ? '▼' : dir === 'left' ? '◀' : '▶';

      const handlePress = (e) => {
        e.preventDefault();
        vibrate();
        btn.style.background = '#FFD700';
        simulateKey(key, true);
      };

      const handleRelease = (e) => {
        e.preventDefault();
        btn.style.background = 'rgba(255, 255, 255, 0.85)';
        simulateKey(key, false);
      };

      btn.addEventListener('touchstart', handlePress, { passive: false });
      btn.addEventListener('touchend', handleRelease, { passive: false });
      btn.addEventListener('mousedown', handlePress);
      btn.addEventListener('mouseup', handleRelease);
      btn.addEventListener('mouseleave', handleRelease);

      return btn;
    };

    const upBtn = makeBtn('up', 'top: 6px; left: 48px;', 'ArrowUp');
    const downBtn = makeBtn('down', 'bottom: 6px; left: 48px;', 'ArrowDown');
    const leftBtn = makeBtn('left', 'top: 48px; left: 6px;', 'ArrowLeft');
    const rightBtn = makeBtn('right', 'top: 48px; right: 6px;', 'ArrowRight');

    dpad.append(upBtn, downBtn, leftBtn, rightBtn);

    // --- Right Action Buttons (A, B, Run, Menu) ---
    const actionGroup = document.createElement('div');
    actionGroup.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 10px;
      align-items: flex-end;
      pointer-events: auto;
    `;

    const topRow = document.createElement('div');
    topRow.style.cssText = 'display: flex; gap: 10px;';

    const bottomRow = document.createElement('div');
    bottomRow.style.cssText = 'display: flex; gap: 14px;';

    const makeActionBtn = (label, bg, color, key, onClick) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.style.cssText = `
        width: 54px;
        height: 54px;
        border-radius: 50%;
        background: ${bg};
        color: ${color};
        font-family: 'Press Start 2P', monospace;
        font-size: 13px;
        border: 3px solid rgba(255, 255, 255, 0.6);
        box-shadow: 0 4px 8px rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        touch-action: none;
      `;
      btn.textContent = label;

      const handlePress = (e) => {
        e.preventDefault();
        vibrate();
        btn.style.transform = 'scale(0.92)';
        if (key) simulateKey(key, true);
        if (onClick) onClick();
      };

      const handleRelease = (e) => {
        e.preventDefault();
        btn.style.transform = 'scale(1)';
        if (key) simulateKey(key, false);
      };

      btn.addEventListener('touchstart', handlePress, { passive: false });
      btn.addEventListener('touchend', handleRelease, { passive: false });
      btn.addEventListener('mousedown', handlePress);
      btn.addEventListener('mouseup', handleRelease);
      btn.addEventListener('mouseleave', handleRelease);

      return btn;
    };

    const aBtn = makeActionBtn('A', '#E53935', '#FFF', 'Enter');
    const bBtn = makeActionBtn('B', '#1E88E5', '#FFF', 'Escape');
    const menuBtn = makeActionBtn('HUD', '#43A047', '#FFF', null, () => {
      if (root.ModalManager) root.ModalManager.toggleQuickMenu();
    });
    const runBtn = makeActionBtn('RUN', '#FB8C00', '#FFF', 'Shift');

    menuBtn.style.width = '48px';
    menuBtn.style.height = '48px';
    menuBtn.style.fontSize = '9px';
    runBtn.style.width = '48px';
    runBtn.style.height = '48px';
    runBtn.style.fontSize = '9px';

    topRow.append(runBtn, menuBtn);
    bottomRow.append(bBtn, aBtn);
    actionGroup.append(topRow, bottomRow);

    container.append(dpad, actionGroup);

    const gameWrapper = document.querySelector('#gameContainer') || document.body;
    gameWrapper.appendChild(container);
  }

  function setVisible(visible) {
    if (container) {
      container.style.display = visible ? 'flex' : 'none';
    }
  }

  return {
    init,
    setVisible,
    isEnabled: () => isEnabled
  };
});
