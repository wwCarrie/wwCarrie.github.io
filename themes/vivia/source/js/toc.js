(function() {
  // Only run on post pages
  if (typeof isPost === 'undefined' || !isPost) return;

  var tocArea = document.getElementById('post-toc-area');
  var tocToggle = document.getElementById('toc-toggle');
  if (!tocArea || !tocToggle) return;

  // Mobile toggle
  tocToggle.addEventListener('click', function() {
    tocArea.classList.toggle('toc-visible');
  });

  // Close TOC when clicking outside on mobile
  document.addEventListener('click', function(e) {
    if (!tocArea.classList.contains('toc-visible')) return;
    if (!tocArea.contains(e.target) && e.target !== tocToggle && !tocToggle.contains(e.target)) {
      tocArea.classList.remove('toc-visible');
    }
  });

  // Scroll highlight
  var tocLinks = tocArea.querySelectorAll('.toc-link');
  if (tocLinks.length === 0) return;

  var headings = [];
  tocLinks.forEach(function(link) {
    var href = link.getAttribute('href');
    if (href) {
      try {
        var el = document.querySelector(decodeURIComponent(href));
        if (el) headings.push({ el: el, link: link });
      } catch(e) {}
    }
  });

  if (headings.length === 0) return;

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      var found = null;
      for (var i = 0; i < headings.length; i++) {
        if (headings[i].el === entry.target) {
          found = headings[i];
          break;
        }
      }
      if (!found) return;

      if (entry.isIntersecting) {
        // Remove active from all
        tocLinks.forEach(function(l) { l.classList.remove('active'); });
        // Add active to current
        found.link.classList.add('active');

        // Scroll TOC to keep active link visible
        var tocContainer = tocArea.querySelector('.toc-container');
        if (tocContainer) {
          var linkTop = found.link.offsetTop;
          var containerScroll = tocContainer.scrollTop;
          var containerHeight = tocContainer.clientHeight;
          if (linkTop < containerScroll || linkTop > containerScroll + containerHeight) {
            tocContainer.scrollTop = linkTop - containerHeight / 3;
          }
        }
      }
    });
  }, {
    rootMargin: '-80px 0px -60% 0px',
    threshold: 0
  });

  headings.forEach(function(h) {
    observer.observe(h.el);
  });
})();
