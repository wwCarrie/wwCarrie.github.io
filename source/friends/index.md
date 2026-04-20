---
title: 友情链接
date: 2026-04-20 16:20:00
layout: page
---

欢迎交换友情链接！如果你也想添加友链，可以在留言板留言联系我~

---

<div class="friends-grid">

### 技术博主

<div class="friend-card">
  <a href="https://panda-l1.github.io/" target="_blank">
    <div class="friend-avatar">
      <img src="https://github.com/Panda-L1.png" />
    </div>
    <div class="friend-info">
      <div class="friend-name">PandaLi</div>
      <div class="friend-desc">我的朋友</div>
    </div>
  </a>
</div>

</div>

<style>
.friends-grid {
  margin-top: 2rem;
}

.friends-grid h3 {
  font-size: 1.2rem;
  margin: 2rem 0 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--theme-color);
}

.friend-card {
  display: inline-block;
  width: calc(50% - 20px);
  margin: 10px;
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  transition: all 0.3s ease;
  background: var(--card-bg);
}

.friend-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  border-color: var(--theme-color);
}

.friend-card a {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: inherit;
}

.friend-avatar {
  width: 60px;
  height: 60px;
  margin-right: 15px;
  border-radius: 50%;
  overflow: hidden;
  background: #f0f0f0;
}

.friend-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.friend-info {
  flex: 1;
}

.friend-name {
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 5px;
  color: var(--text-color);
}

.friend-desc {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .friend-card {
    width: calc(100% - 20px);
  }
}
</style>
