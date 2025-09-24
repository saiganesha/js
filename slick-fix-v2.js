// Slickライブラリの統合管理スクリプト
(function() {
  // グローバルな初期化フラグ
  window.slickInitialized = false;
  
  // slickライブラリのロード状態を確認
  function isSlickLoaded() {
    return typeof jQuery !== 'undefined' && typeof jQuery.fn.slick !== 'undefined';
  }
  
  // slickライブラリをロード（重複防止付き）
  function loadSlickLibrary(callback) {
    if (isSlickLoaded()) {
      if (callback) callback();
      return;
    }
    
    // 既にロード中の場合はスキップ
    if (window.slickLoading) {
      setTimeout(function() {
        loadSlickLibrary(callback);
      }, 100);
      return;
    }
    
    window.slickLoading = true;
    
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.min.js';
    script.onload = function() {
      window.slickLoading = false;
      console.log('Slickライブラリが正常にロードされました');
      if (callback) callback();
    };
    script.onerror = function() {
      window.slickLoading = false;
      console.error('Slickライブラリのロードに失敗しました');
    };
    
    document.head.appendChild(script);
  }
  
  // スライダーの初期化（重複防止付き）
  window.initializeSlick = function(selector, options) {
    var $element = jQuery(selector);
    
    if ($element.length === 0) return;
    
    // 既に初期化済みの場合はスキップ
    if ($element.hasClass('slick-initialized')) {
      console.log('スライダー ' + selector + ' は既に初期化されています');
      return;
    }
    
    // slickがロードされていない場合は先にロード
    if (!isSlickLoaded()) {
      loadSlickLibrary(function() {
        window.initializeSlick(selector, options);
      });
      return;
    }
    
    try {
      $element.slick(options);
      console.log('スライダー ' + selector + ' を初期化しました');
    } catch (e) {
      console.error('スライダーの初期化エラー:', e);
    }
  };
  
  // DOMContentLoadedとjQuery readyの両方に対応
  function onReady(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
    
    // jQuery readyも使用
    if (typeof jQuery !== 'undefined') {
      jQuery(callback);
    }
  }
  
  // 全てのスライダーを初期化
  window.initializeAllSliders = function() {
    if (window.slickInitialized) return;
    window.slickInitialized = true;
    
    // common.html のスライダー
    window.initializeSlick('.js-favorite-slider', {
      lazyLoad: 'ondemand',
      autoplay: false,
      autoplaySpeed: 3000,
      arrows: true,
      dots: false,
      infinite: true,
      slidesToShow: 4,
      slidesToScroll: 1,
      responsive: [
        {
          breakpoint: 1030,
          settings: {
            slidesToShow: 3,
            slidesToScroll: 1,
          }
        },
        {
          breakpoint: 768,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 1,
          }
        }
      ]
    });
    
    window.initializeSlick('.l-side-slider', {
      lazyLoad: 'ondemand',
      autoplay: true,
      autoplaySpeed: 3000,
      fade: true,
      speed: 1500,
      arrows: false,
      dots: false,
      infinite: true,
      slidesToShow: 1,
      slidesToScroll: 1,
      responsive: [
        {
          breakpoint: 1024,
          settings: {
            fade: false,
            slidesToShow: 2,
            slidesToScroll: 1,
          }
        },
        {
          breakpoint: 768,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1,
          }
        }
      ]
    });
    
    // top_page.html のスライダー
    window.initializeSlick('.js-top-gallery-slider', {
      autoplay: true,
      autoplaySpeed: 3000,
      fade: true,
      speed: 1500,
      arrows: false,
      dots: true,
      infinite: true,
      slidesToShow: 1,
      slidesToScroll: 1,
    });
    
    window.initializeSlick('.js-ranking-slider', {
      autoplay: true,
      autoplaySpeed: 3000,
      arrows: false,
      dots: false,
      infinite: true,
      slidesToShow: 3,
      slidesToScroll: 1,
      responsive: [
        {
          breakpoint: 1030,
          settings: {
            slidesToShow: 3,
            slidesToScroll: 1,
          },
        },
        {
          breakpoint: 768,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1,
          },
        },
      ],
    });
    
    // header_sliderの特殊な初期化（カスタムオプションを使用）
    if (jQuery('#header_slider').length && !jQuery('#header_slider').hasClass('slick-initialized')) {
      // header-slider-custom.jsで定義されたオプションを使用
      var options = window.headerSliderOptions || {
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
        fade: false, // fadeをfalseに変更してcenterModeを有効化
        autoplaySpeed: 7000,
        speed: 1500,
        easing: 'easeOutExpo',
        touchThreshold: 8,
        swipeToSlide: true,
        waitForAnimate: false,
        centerMode: true, // センターモードを有効化
        centerPadding: '15%', // 左右に前後のスライドを表示
        variableWidth: false, // 固定幅を維持
        responsive: [
          {
            breakpoint: 1024,
            settings: {
              centerMode: true,
              centerPadding: '10%',
              fade: false,
              speed: 300,
            },
          },
          {
            breakpoint: 768,
            settings: {
              centerMode: false, // モバイルでは1枚表示
              centerPadding: '0',
              fade: false,
              speed: 300,
              swipe: true,
              touchMove: true,
              dots: true,
            },
          },
        ],
      };
      window.initializeSlick('#header_slider', options);
    }
    
    // product.html のスライダー（商品画像とサムネイル）
    window.initializeSlick('.js-images-slider', {
      autoplay: false,
      arrows: true,
      fade: true,
      infinite: true,
      asNavFor: '.p-product-thumb-list',
      responsive: [
        {
          breakpoint: 768,
          settings: {
            arrows: false
          }
        }
      ]
    });
    
    window.initializeSlick('.p-product-thumb-list', {
      slidesToShow: 3,
      slidesToScroll: 1,
      asNavFor: '.js-images-slider',
      focusOnSelect: true,
      responsive: [
        {
          breakpoint: 768,
          settings: {
            slidesToShow: 2
          }
        }
      ]
    });
    
    // 商品ページのbeforeChangeイベントハンドラー
    if (jQuery('.js-images-slider').length && jQuery('.p-product-thumb-list').length) {
      jQuery('.js-images-slider').on('beforeChange', function(event, slick, currentSlide, nextSlide) {
        var $thumbnailItem = jQuery('.p-product-thumb-list__item');
        $thumbnailItem.removeClass("is-current");
        $thumbnailItem.eq(nextSlide).addClass("is-current");
      });
      
      jQuery('.p-product-thumb-list').show();
    }
  };
  
  // 初期化の実行
  onReady(function() {
    setTimeout(function() {
      window.initializeAllSliders();
    }, 100); // 少し遅延させてDOMの準備を確実にする
  });
  
})();
