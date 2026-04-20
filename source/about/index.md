---
title: 关于我
date: 2026-04-20 16:30:00
layout: page
comments: false
---

<div class="about-container">

<div class="about-content">
  <div class="about-section">
    <h2>📖 个人简介</h2>
    <p>Hi, 我是 SuCarrie👋 TJU研0，是一名热爱学习的计算机小白。在这个博客里，我记录着学习过程中的点点滴滴，分享技术知识和生活感悟。日常喜欢看书、跑步和打乒乓球。</p>
    <p>梦想是成为领域专家，养一只猫，在喜欢的城市定居。</p>
    <p>相信通过持续的学习和实践，可以在技术的道路上走得更远。</p>
  </div>

  <div class="about-section">
    <h2>🎯 兴趣领域</h2>
    <div class="skills-grid">
      <div class="skill-item">
        <span class="skill-icon">🐍</span>
        <span class="skill-name">Python</span>
      </div>
      <div class="skill-item">
        <span class="skill-icon">💾</span>
        <span class="skill-name">数据科学</span>
      </div>
      <div class="skill-item">
        <span class="skill-icon">📊</span>
        <span class="skill-name">数据分析</span>
      </div>
      <div class="skill-item">
        <span class="skill-icon">🤖</span>
        <span class="skill-name">机器学习</span>
      </div>
      <div class="skill-item">
        <span class="skill-icon">🧠</span>
        <span class="skill-name">AI / LLM</span>
      </div>
    </div>
  </div>

  <div class="about-section">
    <h2>💻 博客内容</h2>
    <ul class="blog-list">
      <li>📝 <strong>学习笔记</strong> - 记录技术学习过程和心得</li>
      <li>🔧 <strong>实战项目</strong> - 分享项目开发经验和代码</li>
      <li>💡 <strong>经验总结</strong> - 提炼知识点和最佳实践</li>
      <li>🌟 <strong>生活感悟</strong> - 分享生活中的思考与收获</li>
    </ul>
  </div>

  <div class="about-section">
    <h2>📬 联系方式</h2>
    <div class="contact-links">
      <a href="https://github.com/wwCarrie" target="_blank" class="contact-item">
        <i class="fa-brands fa-github"></i>
        <span>GitHub</span>
      </a>
      <a href="mailto:sucarrie04@163.com" class="contact-item">
        <i class="fa-solid fa-envelope"></i>
        <span>Email</span>
      </a>
    </div>
  </div>
</div>

</div>

<style>
.about-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 0;
}

.about-header {
  text-align: center;
  padding: 3rem 0;
  background: linear-gradient(135deg, var(--theme-color, #667eea) 0%, rgba(102, 126, 234, 0.3) 100%);
  border-radius: 20px;
  margin-bottom: 2rem;
}

.about-avatar {
  width: 120px;
  height: 120px;
  margin: 0 auto 1.5rem;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid white;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.about-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.about-intro h1 {
  color: white;
  font-size: 2rem;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.subtitle {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.1rem;
  font-weight: 300;
}

.about-section {
  background: var(--card-bg, white);
  padding: 2rem;
  margin-bottom: 1.5rem;
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease;
}

.about-section:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
}

.about-section h2 {
  color: var(--theme-color, #667eea);
  margin-bottom: 1.2rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--theme-color, #667eea);
}

.about-section p {
  line-height: 1.8;
  color: var(--text-color, #333);
  margin-bottom: 0.8rem;
}

.skills-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
}

.skill-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1rem;
  background: linear-gradient(135deg, var(--theme-color, #667eea) 0%, rgba(102, 126, 234, 0.7) 100%);
  color: white;
  border-radius: 10px;
  transition: transform 0.3s ease;
}

.skill-item:hover {
  transform: scale(1.05);
}

.skill-icon {
  font-size: 1.3rem;
}

.skill-name {
  font-weight: 500;
}

.blog-list {
  list-style: none;
  padding: 0;
}

.blog-list li {
  padding: 0.8rem 0;
  border-bottom: 1px dashed #eee;
  color: var(--text-color, #333);
}

.blog-list li:last-child {
  border-bottom: none;
}

.contact-links {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.5rem;
  background: var(--theme-color, #667eea);
  color: white !important;
  text-decoration: none;
  border-radius: 25px;
  transition: all 0.3s ease;
}

.contact-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
  background: linear-gradient(135deg, var(--theme-color, #667eea) 0%, rgba(102, 126, 234, 0.8) 100%);
  color: white !important;
}

.contact-item i {
  font-size: 1.1rem;
  color: white !important;
}

@media (max-width: 768px) {
  .about-header {
    padding: 2rem 1rem;
  }

  .about-intro h1 {
    font-size: 1.5rem;
  }

  .about-section {
    padding: 1.5rem;
  }

  .skills-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
