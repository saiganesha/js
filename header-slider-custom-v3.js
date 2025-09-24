// header_slider専用のカスタム処理
$(document).ready(function() {
  var slideWrapper = $('#header_slider'),
      timers = {slickNext: null};

  // Auto advance slides
  function startAutoPlay() {
    if (timers.slickNext) {
      clearTimeout(timers.slickNext);
      timers.slickNext = null;
    }
    timers.slickNext = setTimeout(function () {
      if (slideWrapper.hasClass('slick-initialized') && typeof slideWrapper.slick === 'function') {
        slideWrapper.slick('slickNext');
      }
    }, 7000);
  }

  // Slickが初期化されるまで待機
  function initHeaderSliderEvents() {
    // slickメソッドが利用可能かチェック
    if (!slideWrapper.hasClass('slick-initialized') || typeof slideWrapper.slick !== 'function') {
      setTimeout(initHeaderSliderEvents, 100);
      return;
    }

    slideWrapper.on('afterChange', function (event, slick, currentSlide) {
      startAutoPlay();
    });

    slideWrapper.on('swipe', function (event, slick, direction) {
      if (slideWrapper.hasClass('slick-initialized') && typeof slideWrapper.slick === 'function') {
        slideWrapper.slick('setPosition');
      }
    });

    // initialize auto play
    startAutoPlay();
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
    fade: false,
    centerMode: true,
    centerPadding: '18%',
    autoplaySpeed: 7000,
    speed: 500,
    easing: 'ease',
    touchThreshold: 8,
    swipeToSlide: true,
    waitForAnimate: false,
    adaptiveHeight: false,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          centerMode: false,
          centerPadding: '0',
          fade: false,
          speed: 400,
          swipe: true,
          touchMove: true,
          dots: true,
          adaptiveHeight: false,
        },
      },
      {
        breakpoint: 768,
        settings: {
          centerMode: false,
          centerPadding: '0',
          fade: false,
          speed: 300,
          swipe: true,
          touchMove: true,
          dots: true,
          adaptiveHeight: false,
        },
      },
    ],
  };

  // 初期化を開始
  initHeaderSliderEvents();
});
