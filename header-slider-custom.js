// header_slider専用のカスタム処理
$(document).ready(function() {
  var slideWrapper = $('#header_slider'),
      timers = {slickNext: null};

  // play or pause video
  function playPauseVideo(slide, control) {
    if (!slide) {
      slide = slideWrapper.find('.slick-current');
    }
    // normal image item only
    if (slide.hasClass('image_item')) {
      switch (control) {
        case 'play':
          setTimeout(function () {
            if ($('html').hasClass('mobile')) {
              slide.find('.animate_item_mobile').each(function (i) {
                $(this)
                  .delay(i * 700)
                  .queue(function (next) {
                    $(this).addClass('animate_mobile');
                    next();
                  });
              });
            } else {
              slide.find('.animate_item').each(function (i) {
                $(this)
                  .delay(i * 700)
                  .queue(function (next) {
                    $(this).addClass('animate');
                    next();
                  });
              });
            }
          }, 1000);
          if (timers.slickNext) {
            clearTimeout(timers.slickNext);
            timers.slickNext = null;
          }
          timers.slickNext = setTimeout(function () {
            if (slideWrapper.hasClass('slick-initialized') && typeof slideWrapper.slick === 'function') {
              slideWrapper.slick('slickNext');
            }
          }, 7000);
          break;
        case 'pause':
          slide.find('.animate_item').removeClass('animate animate_mobile');
          break;
      }
    }
  }

  // Slickが初期化されるまで待機
  function initHeaderSliderEvents() {
    // slickメソッドが利用可能かチェック
    if (!slideWrapper.hasClass('slick-initialized') || typeof slideWrapper.slick !== 'function') {
      setTimeout(initHeaderSliderEvents, 100);
      return;
    }

    slideWrapper.on('beforeChange', function (event, slick, currentSlide, nextSlide) {
      if (currentSlide == nextSlide) return;
      slick.$slides.eq(nextSlide).addClass('animate');
      setTimeout(function () {
        playPauseVideo(slick.$slides.eq(currentSlide), 'pause');
      }, slick.options.speed);
      playPauseVideo(slick.$slides.eq(nextSlide), 'play');
    });

    slideWrapper.on('afterChange', function (event, slick, currentSlide) {
      slick.$slides.not(':eq(' + currentSlide + ')').removeClass('animate first_animate');
    });

    slideWrapper.on('swipe', function (event, slick, direction) {
      if (slideWrapper.hasClass('slick-initialized') && typeof slideWrapper.slick === 'function') {
        slideWrapper.slick('setPosition');
      }
    });

    // initialize / first animate
    $('#header_slider .item:visible:first').addClass('animate first_animate');
    playPauseVideo($('#header_slider .item:visible:first'), 'play');
  }

  // header_sliderのカスタム初期化オプション
  window.headerSliderOptions = {
    slide: '.item',
    infinite: true,
    dots: true,
    arrows: false,
    slidesToShow: 1,
    slidesToScroll: 1,
    swipe: true,
    touchMove: true,
    pauseOnFocus: false,
    pauseOnHover: false,
    autoplay: false,
    fade: true,
    autoplaySpeed: 7000,
    speed: 1500,
    easing: 'easeOutExpo',
    touchThreshold: 8,
    swipeToSlide: true,
    waitForAnimate: false,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          fade: false,
          speed: 300,
          swipe: true,
          touchMove: true,
          dots: true,
        },
      },
    ],
  };

  // 初期化を開始
  initHeaderSliderEvents();

  $(window).load(function () {
    $('#header_slider .item:visible:first').addClass('animate first_animate');
  });

  // タッチイベント処理
  let touchStartX = 0;
  let touchEndX = 0;

  $('.no_caption').on('touchstart', function (e) {
    touchStartX = e.originalEvent.touches[0].clientX;
  });

  $('.no_caption').on('touchend', function (e) {
    touchEndX = e.originalEvent.changedTouches[0].clientX;
    if (Math.abs(touchEndX - touchStartX) < 10) {
      window.location.href = $(this).attr('href');
    }
  });
});
