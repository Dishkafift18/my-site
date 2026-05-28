/* =========================================================
   НАТАЛЬЯ ПОГОРЕЛОВА — студия наращивания ресниц
   Логика сайта (без сторонних библиотек)
   ========================================================= */
(function () {
  'use strict';

  /* ---- 1. Плейсхолдеры для отсутствующих фото -------------
     Если файл фотографии ещё не добавлен в папку images,
     блок .ph покажет аккуратную подпись вместо «битой» картинки. */
  document.addEventListener(
    'error',
    function (e) {
      var el = e.target;
      if (el.tagName !== 'IMG' || el.classList.contains('lightbox-img')) return;
      var box = el.closest('.ph');
      if (box) box.classList.add('ph--empty');
      else el.style.display = 'none';
    },
    true
  );

  document.addEventListener('DOMContentLoaded', function () {
    /* ---- 1b. Проверка уже загрузившихся (битых) картинок ---
       На случай, если фото не найдено ещё до запуска скрипта. */
    document.querySelectorAll('img').forEach(function (img) {
      if (
        img.complete &&
        img.naturalWidth === 0 &&
        !img.classList.contains('lightbox-img')
      ) {
        var box = img.closest('.ph');
        if (box) box.classList.add('ph--empty');
        else img.style.display = 'none';
      }
    });

    /* ---- 2. Текущий год в подвале ------------------------- */
    var yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    /* ---- 3. Активный пункт меню по имени страницы --------- */
    var page = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-list a').forEach(function (a) {
      var href = a.getAttribute('href');
      if (href === page || (page === '' && href === 'index.html')) {
        a.classList.add('active');
      }
    });

    /* ---- 4. Тень шапки при прокрутке ---------------------- */
    var header = document.getElementById('siteHeader');
    var toTop = document.getElementById('toTop');
    function onScroll() {
      var y = window.scrollY;
      if (header) header.classList.toggle('scrolled', y > 20);
      if (toTop) toTop.classList.toggle('show', y > 480);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (toTop) {
      toTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    /* ---- 5. Мобильное меню -------------------------------- */
    var toggle = document.getElementById('navToggle');
    var nav = document.getElementById('mainNav');
    var overlay = document.getElementById('navOverlay');

    function setMenu(open) {
      if (!nav || !toggle) return;
      nav.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.classList.toggle('nav-open', open);
      if (overlay) overlay.classList.toggle('show', open);
    }
    if (toggle) {
      toggle.addEventListener('click', function () {
        setMenu(!nav.classList.contains('open'));
      });
    }
    if (overlay) overlay.addEventListener('click', function () { setMenu(false); });
    document.querySelectorAll('.nav-list a, .nav-cta').forEach(function (a) {
      a.addEventListener('click', function () { setMenu(false); });
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 900) setMenu(false);
    });

    /* ---- 6. Появление блоков при прокрутке ---------------- */
    var revealEls = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (en) {
            if (en.isIntersecting) {
              en.target.classList.add('in-view');
              io.unobserve(en.target);
            }
          });
        },
        { threshold: 0.12 }
      );
      revealEls.forEach(function (el) { io.observe(el); });
    } else {
      revealEls.forEach(function (el) { el.classList.add('in-view'); });
    }

    /* ---- 7. Анимированные счётчики ------------------------ */
    function animateCount(el) {
      var target = parseInt(el.dataset.target, 10) || 0;
      var dur = 1600;
      var start = null;
      function step(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.floor(eased * target).toLocaleString('ru-RU');
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = target.toLocaleString('ru-RU');
      }
      requestAnimationFrame(step);
    }
    var counters = document.querySelectorAll('[data-target]');
    if (counters.length && 'IntersectionObserver' in window) {
      var co = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (en) {
            if (en.isIntersecting) {
              animateCount(en.target);
              co.unobserve(en.target);
            }
          });
        },
        { threshold: 0.5 }
      );
      counters.forEach(function (el) { co.observe(el); });
    } else {
      counters.forEach(function (el) {
        el.textContent = (parseInt(el.dataset.target, 10) || 0).toLocaleString('ru-RU');
      });
    }

    /* ---- 8. Карусель отзывов ------------------------------ */
    var reviewsBox = document.querySelector('.reviews');
    if (reviewsBox) {
      var slides = reviewsBox.querySelectorAll('.review');
      var dotsBox = reviewsBox.querySelector('.review-dots');
      var current = 0;
      var timer = null;

      slides.forEach(function (_, i) {
        var dot = document.createElement('button');
        dot.className = 'review-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', 'Отзыв ' + (i + 1));
        dot.addEventListener('click', function () { go(i); });
        dotsBox.appendChild(dot);
      });
      var dots = dotsBox.querySelectorAll('.review-dot');

      function go(n) {
        slides[current].classList.remove('active');
        dots[current].classList.remove('active');
        current = (n + slides.length) % slides.length;
        slides[current].classList.add('active');
        dots[current].classList.add('active');
      }
      function start() { timer = setInterval(function () { go(current + 1); }, 6000); }
      function stop() { clearInterval(timer); }

      var prev = reviewsBox.querySelector('.review-arrow.prev');
      var next = reviewsBox.querySelector('.review-arrow.next');
      if (prev) prev.addEventListener('click', function () { go(current - 1); stop(); start(); });
      if (next) next.addEventListener('click', function () { go(current + 1); stop(); start(); });
      reviewsBox.addEventListener('mouseenter', stop);
      reviewsBox.addEventListener('mouseleave', start);
      if (slides.length > 1) start();
    }

    /* ---- 9. FAQ-аккордеон --------------------------------- */
    document.querySelectorAll('.faq-q').forEach(function (q) {
      q.addEventListener('click', function () {
        var item = q.closest('.faq-item');
        var answer = item.querySelector('.faq-a');
        var isOpen = item.classList.contains('open');
        document.querySelectorAll('.faq-item.open').forEach(function (op) {
          op.classList.remove('open');
          op.querySelector('.faq-a').style.maxHeight = null;
        });
        if (!isOpen) {
          item.classList.add('open');
          answer.style.maxHeight = answer.scrollHeight + 'px';
        }
      });
    });

    /* ---- 10. Фильтр галереи ------------------------------- */
    var filterBtns = document.querySelectorAll('.filter-btn');
    var galleryItems = document.querySelectorAll('.gallery-item');
    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        filterBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        var cat = btn.dataset.filter;
        galleryItems.forEach(function (item) {
          var match = cat === 'all' || item.dataset.category === cat;
          item.classList.toggle('hide', !match);
        });
      });
    });

    /* ---- 11. Лайтбокс галереи ----------------------------- */
    var lightbox = document.getElementById('lightbox');
    if (lightbox && galleryItems.length) {
      var lbImg = lightbox.querySelector('.lightbox-img');
      var lbIndex = 0;
      var visible = [];

      function openLightbox(i) {
        visible = Array.prototype.filter.call(galleryItems, function (el) {
          return !el.classList.contains('hide');
        });
        lbIndex = visible.indexOf(galleryItems[i]);
        if (lbIndex < 0) lbIndex = 0;
        showLightbox();
        lightbox.classList.add('open');
        document.body.classList.add('nav-open');
      }
      function showLightbox() {
        var src = visible[lbIndex].dataset.full;
        lbImg.setAttribute('src', src);
        lbImg.setAttribute('alt', visible[lbIndex].dataset.caption || 'Работа мастера');
      }
      function closeLightbox() {
        lightbox.classList.remove('open');
        document.body.classList.remove('nav-open');
      }
      function shift(d) {
        lbIndex = (lbIndex + d + visible.length) % visible.length;
        showLightbox();
      }

      galleryItems.forEach(function (item, i) {
        item.addEventListener('click', function () { openLightbox(i); });
      });
      lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
      lightbox.querySelector('.lightbox-arrow.prev').addEventListener('click', function () { shift(-1); });
      lightbox.querySelector('.lightbox-arrow.next').addEventListener('click', function () { shift(1); });
      lightbox.addEventListener('click', function (e) {
        if (e.target === lightbox) closeLightbox();
      });
      document.addEventListener('keydown', function (e) {
        if (!lightbox.classList.contains('open')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') shift(-1);
        if (e.key === 'ArrowRight') shift(1);
      });
    }

    /* ---- 12. Проверка формы записи ------------------------ */
    var form = document.getElementById('bookingForm');
    if (form) {
      var success = form.querySelector('.form-success');

      function showError(field, on) {
        field.closest('.form-field').classList.toggle('invalid', on);
      }

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var ok = true;

        var name = form.querySelector('#fName');
        if (!name.value.trim() || name.value.trim().length < 2) {
          showError(name, true); ok = false;
        } else showError(name, false);

        var phone = form.querySelector('#fPhone');
        var digits = phone.value.replace(/\D/g, '');
        if (digits.length < 10) {
          showError(phone, true); ok = false;
        } else showError(phone, false);

        var service = form.querySelector('#fService');
        if (service && !service.value) {
          showError(service, true); ok = false;
        } else if (service) showError(service, false);

        if (ok) {
          form.querySelectorAll('input, select, textarea').forEach(function (el) {
            if (el.type !== 'submit') el.value = '';
          });
          if (success) {
            success.classList.add('show');
            success.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(function () { success.classList.remove('show'); }, 7000);
          }
        }
      });

      /* живая очистка ошибки при вводе */
      form.querySelectorAll('input, select, textarea').forEach(function (el) {
        el.addEventListener('input', function () {
          el.closest('.form-field').classList.remove('invalid');
        });
      });

      /* мягкое форматирование телефона */
      var phoneInput = form.querySelector('#fPhone');
      if (phoneInput) {
        phoneInput.addEventListener('input', function () {
          var d = phoneInput.value.replace(/\D/g, '').slice(0, 11);
          if (d.startsWith('8')) d = '7' + d.slice(1);
          if (d && d[0] !== '7') d = '7' + d;
          var out = '+7';
          if (d.length > 1) out += ' (' + d.slice(1, 4);
          if (d.length >= 4) out += ') ' + d.slice(4, 7);
          if (d.length >= 7) out += '-' + d.slice(7, 9);
          if (d.length >= 9) out += '-' + d.slice(9, 11);
          phoneInput.value = out;
        });
      }
    }

    /* ---- 13. Слайдер работ на главной --------------------- */
    var pf = document.querySelector('.portfolio-slider');
    if (pf) {
      var pfTrack = pf.querySelector('.portfolio-track');
      var pfSlides = pf.querySelectorAll('.portfolio-slide');
      var pfDots = pf.querySelector('.slider-dots');
      var pfPrev = pf.querySelector('.slider-arrow.prev');
      var pfNext = pf.querySelector('.slider-arrow.next');
      var pfIndex = 0;
      var pfTimer = null;

      function pfPerView() {
        if (window.innerWidth <= 680) return 1;
        if (window.innerWidth <= 1024) return 2;
        return 3;
      }
      function pfMax() {
        return Math.max(0, pfSlides.length - pfPerView());
      }
      function pfRender() {
        pf.style.setProperty('--per', pfPerView());
        var step = pfSlides.length ? 100 / pfSlides.length : 0;
        pfTrack.style.transform = 'translateX(-' + pfIndex * step + '%)';
        if (pfDots) {
          pfDots.querySelectorAll('.slider-dot').forEach(function (d, i) {
            d.classList.toggle('active', i === pfIndex);
          });
        }
      }
      function pfBuildDots() {
        if (!pfDots) return;
        pfDots.innerHTML = '';
        for (var i = 0; i <= pfMax(); i++) {
          var dot = document.createElement('button');
          dot.type = 'button';
          dot.className = 'slider-dot';
          dot.setAttribute('aria-label', 'Показать работы — группа ' + (i + 1));
          (function (n) {
            dot.addEventListener('click', function () {
              pfIndex = n;
              pfRender();
              pfRestart();
            });
          })(i);
          pfDots.appendChild(dot);
        }
      }
      function pfGo(n) {
        var max = pfMax();
        pfIndex = n > max ? 0 : n < 0 ? max : n;
        pfRender();
      }
      function pfStart() {
        if (pfSlides.length > pfPerView()) {
          pfTimer = setInterval(function () { pfGo(pfIndex + 1); }, 5000);
        }
      }
      function pfStop() { clearInterval(pfTimer); }
      function pfRestart() { pfStop(); pfStart(); }

      if (pfPrev) {
        pfPrev.addEventListener('click', function () { pfGo(pfIndex - 1); pfRestart(); });
      }
      if (pfNext) {
        pfNext.addEventListener('click', function () { pfGo(pfIndex + 1); pfRestart(); });
      }
      pf.addEventListener('mouseenter', pfStop);
      pf.addEventListener('mouseleave', pfStart);
      window.addEventListener('resize', function () {
        if (pfIndex > pfMax()) pfIndex = pfMax();
        pfBuildDots();
        pfRender();
      });

      pfBuildDots();
      pfRender();
      pfStart();
    }
  });
})();
