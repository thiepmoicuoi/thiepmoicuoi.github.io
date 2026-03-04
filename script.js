(function () {
  'use strict';

  // ---------- Nhạc nền + nút nhạc nổi: thử phát khi load, nếu bị chặn thì phát khi user tương tác ----------
  var bgMusic = document.getElementById('bg-music');
  var floatingMusicBtn = document.getElementById('floating-music');
  function updateMusicButtonState() {
    if (floatingMusicBtn) {
      floatingMusicBtn.classList.toggle('is-paused', bgMusic.paused);
      floatingMusicBtn.setAttribute('aria-label', bgMusic.paused ? 'Bật nhạc nền' : 'Tắt nhạc nền');
    }
  }
  if (bgMusic) {
    if (floatingMusicBtn) {
      floatingMusicBtn.addEventListener('click', function () {
        if (bgMusic.paused) {
          bgMusic.play();
        } else {
          bgMusic.pause();
        }
        updateMusicButtonState();
      });
      bgMusic.addEventListener('play', updateMusicButtonState);
      bgMusic.addEventListener('pause', updateMusicButtonState);
    }
    var playPromise = bgMusic.play();
    if (playPromise !== undefined) {
      playPromise.then(function () { updateMusicButtonState(); }).catch(function () {
        updateMusicButtonState();
        var startOnInteraction = function () {
          bgMusic.play();
          document.removeEventListener('click', startOnInteraction);
          document.removeEventListener('touchstart', startOnInteraction);
          document.removeEventListener('keydown', startOnInteraction);
        };
        document.addEventListener('click', startOnInteraction);
        document.addEventListener('touchstart', startOnInteraction);
        document.addEventListener('keydown', startOnInteraction);
      });
    } else {
      updateMusicButtonState();
    }
  }

  // ---------- Section 1: Người nhận từ URL params (x = cách xưng hô, name = tên) ----------
  // x: a = Anh, c = Chị, b = Bạn, vc = Vợ chồng anh
  var xToLabel = { a: 'Anh', c: 'Chị', b: 'Bạn', vc: 'Vợ chồng anh' };
  var recipientEl = document.getElementById('intro-recipient');
  if (recipientEl) {
    var params = new URLSearchParams(window.location.search);
    var x = (params.get('x') || '').trim().toLowerCase();
    var name = (params.get('name') || '').trim();
    var address = xToLabel[x] || '';
    if (address || name) {
      var parts = [address, name].filter(Boolean);
      recipientEl.textContent = parts.join(' ');
      recipientEl.removeAttribute('aria-hidden');
      recipientEl.classList.add('visible');
    }
  }

  // ---------- AOS init ----------
  AOS.init({
    duration: 800,
    easing: 'ease-out',
    once: true,
    offset: 60
  });

  // ---------- Section reveal on scroll + nút cuộn xuống ----------
  var sections = document.querySelectorAll('.section');
  var floatingScrollBtn = document.getElementById('floating-scroll');
  var currentSectionIndex = 0;

  if (sections.length) {
    var observerOptions = { root: null, rootMargin: '0px', threshold: 0.35 };
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('section-visible');
          for (var i = 0; i < sections.length; i++) {
            if (sections[i] === entry.target) {
              currentSectionIndex = i;
              break;
            }
          }
        }
      });
    }, observerOptions);

    sections.forEach(function (section) {
      sectionObserver.observe(section);
    });
  }

  if (floatingScrollBtn && sections.length) {
    floatingScrollBtn.addEventListener('click', function (e) {
      e.preventDefault();
      var nextIndex = currentSectionIndex + 1;
      if (nextIndex >= sections.length) {
        nextIndex = 0;
      }
      var target = sections[nextIndex];
      if (target && typeof target.scrollIntoView === 'function') {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

})();
