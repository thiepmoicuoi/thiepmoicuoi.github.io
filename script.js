(function () {
  'use strict';

  // ---------- Nhạc nền + nút nhạc nổi ----------

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

  // ---------- Section 2 (Thông tin khách mời) ----------

  var recipientEl = document.getElementById('guest-recipient');

  function setGuestRecipient(address, name, line) {
    if (!recipientEl) return;
    var text = '';
    if (line && String(line).trim()) {
      text = String(line).trim();
    } else {
      var parts = [address, name].filter(Boolean);
      text = parts.join(' ');
    }
    if (text) {
      recipientEl.textContent = text;
      recipientEl.removeAttribute('aria-hidden');
      recipientEl.classList.add('visible');
    }
  }

  if (recipientEl) {
    var params = new URLSearchParams(window.location.search);
    var guestId = (params.get('i') || '').trim().toLowerCase();
    // Mã khách: đúng 5 ký tự a-z hoặc 0-9
    var idOk = /^[a-z0-9]{5}$/.test(guestId);

    if (idOk) {
      fetch('guests.json', { cache: 'no-store' })
        .then(function (res) {
          if (!res.ok) throw new Error('guests.json ' + res.status);
          return res.json();
        })
        .then(function (data) {
          var row = data && data[guestId];
          if (!row || typeof row !== 'object') return;
          var line = row.line;
          var address = String(row.x != null ? row.x : '').trim();
          var name = String(row.n != null ? row.n : '').trim();
          setGuestRecipient(address, name, line);
        })
        .catch(function () {
        });
    }
  }

  // ---------- Đếm ngược đến 18:00 ngày 03/07/2026 ----------

  var countdownTarget = new Date(2026, 6, 3, 18, 0, 0, 0);
  var countdownDaysEls = document.querySelectorAll('.countdown-value-days');
  var countdownHoursEls = document.querySelectorAll('.countdown-value-hours');
  var countdownMinutesEls = document.querySelectorAll('.countdown-value-minutes');
  var countdownSecondsEls = document.querySelectorAll('.countdown-value-seconds');

  function updateCountdown() {
    var now = new Date();
    var diff = countdownTarget - now;
    var days = 0;
    var hours = 0;
    var minutes = 0;
    var seconds = 0;
    if (diff > 0) {
      days = Math.floor(diff / (24 * 60 * 60 * 1000));
      hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
      minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
      seconds = Math.floor((diff % (60 * 1000)) / 1000);
    }
    countdownDaysEls.forEach(function (el) { el.textContent = days; });
    countdownHoursEls.forEach(function (el) { el.textContent = hours; });
    countdownMinutesEls.forEach(function (el) { el.textContent = minutes; });
    countdownSecondsEls.forEach(function (el) { el.textContent = seconds; });
  }

  if (countdownDaysEls.length || countdownHoursEls.length || countdownMinutesEls.length || countdownSecondsEls.length) {
    updateCountdown();
    setInterval(updateCountdown, 1000);
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
