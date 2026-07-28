---
title: 随想便利贴
date: 2026-04-20 16:15:00
layout: page
comments: false
description: 随想便利贴 —— 随手记录一闪而过的想法、灵感与碎碎念。
---

<div class="sticky-intro">
  <p>💡 一闪而过的念头、偶然读到的一句话、突然想通的小道理……</p>
  <p>随手贴在这里，像书桌上的便利贴一样。</p>
</div>

<!-- 便利贴输入区 -->
<div class="sticky-input-card">
  <textarea id="sticky-input" class="sticky-textarea" placeholder="写点什么吧……" maxlength="500" rows="3"></textarea>
  <div class="sticky-input-footer">
    <span id="sticky-char-count" class="sticky-char-count">0 / 500</span>
    <button id="sticky-submit-btn" class="sticky-submit-btn">
      <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 -960 960 960" width="18"><path d="M440-440H200q-17 0-28.5-11.5T160-480q0-17 11.5-28.5T200-520h240v-240q0-17 11.5-28.5T480-800q17 0 28.5 11.5T520-760v240h240q17 0 28.5 11.5T800-480q0 17-11.5 28.5T760-440H520v240q0 17-11.5 28.5T480-160q-17 0-28.5-11.5T440-200v-240Z"/></svg>
贴上去
    </button>
  </div>
</div>

<!-- 便利贴墙 -->
<div id="sticky-wall" class="sticky-wall"></div>

<!-- 空状态提示 -->
<div id="sticky-empty" class="sticky-empty">
  <div class="sticky-empty-icon">
    <svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 -960 960 960" width="48"><path d="M240-400q-33 0-56.5-23.5T160-480q0-33 23.5-56.5T240-560q33 0 56.5 23.5T320-480q0 33-23.5 56.5T240-400Zm240 0q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm240 0q-33 0-56.5-23.5T640-480q0-33 23.5-56.5T720-560q33 0 56.5 23.5T800-480q0 33-23.5 56.5T720-400Z"/></svg>
  </div>
  <p>还没有便利贴呢～写下第一条吧 ✨</p>
</div>

<style>
  /* ===== 便利贴墙样式 ===== */
  .sticky-intro {
    text-align: center;
    margin-bottom: 24px;
    line-height: 1.8;
  }
  .sticky-intro p {
    margin: 4px 0;
    opacity: 0.7;
    font-size: 0.95rem;
  }

  /* 输入卡片 */
  .sticky-input-card {
    background: var(--card-background);
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 28px;
    border: 1px solid var(--neut-L10);
    transition: border-color 0.2s;
  }
  .sticky-input-card:focus-within {
    border-color: var(--primary);
  }
  .sticky-textarea {
    width: 100%;
    min-height: 80px;
    background: transparent;
    border: none;
    outline: none;
    resize: vertical;
    font-family: inherit;
    font-size: 0.95rem;
    color: var(--article-text);
    line-height: 1.7;
    padding: 4px 0;
  }
  .sticky-textarea::placeholder {
    color: var(--neut-L30);
  }
  .sticky-input-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 8px;
    padding-top: 10px;
    border-top: 1px solid var(--neut-L10);
  }
  .sticky-char-count {
    font-size: 0.8rem;
    color: var(--neut-L30);
    transition: color 0.2s;
  }
  .sticky-char-count.warn {
    color: #f4a261;
  }
  .sticky-char-count.over {
    color: #e76f51;
  }
  .sticky-submit-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: var(--primary);
    color: #fff;
    border: none;
    border-radius: 20px;
    padding: 7px 20px;
    font-size: 0.88rem;
    font-weight: 500;
    cursor: pointer;
    transition: opacity 0.2s, transform 0.15s;
  }
  .sticky-submit-btn:hover {
    opacity: 0.88;
    transform: scale(1.03);
  }
  .sticky-submit-btn:active {
    transform: scale(0.97);
  }
  .sticky-submit-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
  }
  .sticky-submit-btn svg {
    fill: #fff;
  }

  /* 便利贴墙网格 */
  .sticky-wall {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 16px;
  }

  /* 单张便利贴 */
  .sticky-note {
    position: relative;
    padding: 18px 16px 40px 16px;
    border-radius: 6px;
    font-size: 0.9rem;
    line-height: 1.75;
    word-break: break-word;
    white-space: pre-wrap;
    box-shadow: 2px 3px 8px rgba(0,0,0,0.12);
    transition: transform 0.2s, box-shadow 0.2s;
    animation: sticky-pop-in 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  @keyframes sticky-pop-in {
    0% { opacity: 0; transform: scale(0.85) rotate(-3deg); }
    100% { opacity: 1; transform: scale(1) rotate(var(--sticky-rotate, 0deg)); }
  }

  .sticky-note:hover {
    transform: rotate(0deg) scale(1.03) !important;
    box-shadow: 3px 5px 16px rgba(0,0,0,0.18);
    z-index: 10;
  }

  .sticky-note .sticky-time {
    position: absolute;
    bottom: 10px;
    right: 14px;
    font-size: 0.7rem;
    opacity: 0.5;
  }

  .sticky-note .sticky-delete {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 22px;
    height: 22px;
    border: none;
    border-radius: 50%;
    background: rgba(0,0,0,0.08);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s, background 0.2s;
    font-size: 12px;
  }
  .sticky-note:hover .sticky-delete {
    opacity: 1;
  }
  .sticky-note .sticky-delete:hover {
    background: rgba(0,0,0,0.18);
  }
  .sticky-note .sticky-delete svg {
    fill: currentColor;
    opacity: 0.5;
  }

  /* 便利贴颜色 — 浅色模式 */
  .sticky-yellow   { background: #fff9c4; color: #3d3d3d; --sticky-rotate: -1.5deg; }
  .sticky-pink     { background: #f8d7da; color: #3d3d3d; --sticky-rotate: 1.2deg; }
  .sticky-mint     { background: #c8e6c9; color: #3d3d3d; --sticky-rotate: -0.8deg; }
  .sticky-blue     { background: #bbdefb; color: #3d3d3d; --sticky-rotate: 1.8deg; }
  .sticky-lavender { background: #e1bee7; color: #3d3d3d; --sticky-rotate: -2deg; }
  .sticky-peach    { background: #ffe0b2; color: #3d3d3d; --sticky-rotate: 0.5deg; }

  /* 空状态 */
  .sticky-empty {
    text-align: center;
    padding: 48px 20px;
    opacity: 0.45;
    transition: opacity 0.3s;
  }
  .sticky-empty.hidden { display: none; }
  .sticky-empty-icon { margin-bottom: 12px; }
  .sticky-empty-icon svg { fill: var(--article-text); }
  .sticky-empty p { font-size: 0.95rem; color: var(--article-text); }

  /* 暗色模式适配 */
  [theme="dark"] .sticky-yellow   { background: #4a4728; color: #e8e3c0; }
  [theme="dark"] .sticky-pink     { background: #4a2d30; color: #e8c8cb; }
  [theme="dark"] .sticky-mint     { background: #2d4230; color: #c8e0ca; }
  [theme="dark"] .sticky-blue     { background: #2a3848; color: #c8daea; }
  [theme="dark"] .sticky-lavender { background: #3a2d40; color: #dcc8e4; }
  [theme="dark"] .sticky-peach    { background: #4a3828; color: #e8d4b8; }
  [theme="dark"] .sticky-note {
    box-shadow: 2px 3px 10px rgba(0,0,0,0.35);
  }
  [theme="dark"] .sticky-note .sticky-delete {
    background: rgba(255,255,255,0.08);
  }
  [theme="dark"] .sticky-note .sticky-delete:hover {
    background: rgba(255,255,255,0.18);
  }
</style>

<script>
(function() {
  var STORAGE_KEY = 'carrie-sticky-notes';
  var COLORS = ['sticky-yellow','sticky-pink','sticky-mint','sticky-blue','sticky-lavender','sticky-peach'];

  var input = document.getElementById('sticky-input');
  var charCount = document.getElementById('sticky-char-count');
  var submitBtn = document.getElementById('sticky-submit-btn');
  var wall = document.getElementById('sticky-wall');
  var emptyHint = document.getElementById('sticky-empty');

  function loadNotes() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch(e) {
      return [];
    }
  }

  function saveNotes(notes) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }

  function formatTime(ts) {
    var d = new Date(ts);
    var now = new Date();
    var diff = now - d;
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return Math.floor(diff/60000) + '分钟前';
    if (diff < 86400000) return Math.floor(diff/3600000) + '小时前';
    var mm = String(d.getMonth()+1).padStart(2,'0');
    var dd = String(d.getDate()).padStart(2,'0');
    var hh = String(d.getHours()).padStart(2,'0');
    var min = String(d.getMinutes()).padStart(2,'0');
    if (d.getFullYear() === now.getFullYear()) {
      return mm + '-' + dd + ' ' + hh + ':' + min;
    }
    return d.getFullYear() + '-' + mm + '-' + dd;
  }

  function renderNote(note) {
    var div = document.createElement('div');
    div.className = 'sticky-note ' + note.color;
    div.innerHTML = note.text +
      '<span class="sticky-time">' + formatTime(note.time) + '</span>' +
      '<button class="sticky-delete" title="撕掉"><svg xmlns="http://www.w3.org/2000/svg" height="14" viewBox="0 -960 960 960" width="14"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg></button>';

    div.querySelector('.sticky-delete').addEventListener('click', function(e) {
      e.stopPropagation();
      if (confirm('确定要撕掉这张便利贴吗？')) {
        deleteNote(note.id);
      }
    });

    return div;
  }

  function deleteNote(id) {
    var notes = loadNotes().filter(function(n) { return n.id !== id; });
    saveNotes(notes);
    renderAll();
  }

  function renderAll() {
    var notes = loadNotes();
    wall.innerHTML = '';
    if (notes.length === 0) {
      emptyHint.classList.remove('hidden');
      wall.style.display = 'none';
    } else {
      emptyHint.classList.add('hidden');
      wall.style.display = '';
      notes.forEach(function(note) {
        wall.appendChild(renderNote(note));
      });
    }
  }

  input.addEventListener('input', function() {
    var len = input.value.length;
    charCount.textContent = len + ' / 500';
    charCount.className = 'sticky-char-count';
    if (len > 450) charCount.classList.add('warn');
    if (len >= 500) charCount.classList.add('over');
    submitBtn.disabled = len === 0 || len > 500;
  });

  submitBtn.addEventListener('click', function() {
    var text = input.value.trim();
    if (!text || text.length > 500) return;

    var notes = loadNotes();
    notes.unshift({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2,6),
      text: text,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      time: Date.now()
    });
    saveNotes(notes);
    input.value = '';
    charCount.textContent = '0 / 500';
    charCount.className = 'sticky-char-count';
    submitBtn.disabled = true;
    renderAll();
  });

  input.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      submitBtn.click();
    }
  });

  renderAll();
})();
</script>
