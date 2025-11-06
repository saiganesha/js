// カスタムスライダーの実装
class CustomSlider {
  constructor(container, options = {}) {
    this.container = container;
    this.slider = container.querySelector('.slider');
    this.slides = Array.from(this.slider.querySelectorAll('.slide'));
    this.currentIndex = 0;
    this.isDesktop = window.innerWidth >= 1024;

    // オプション
    this.options = {
      autoPlay: options.autoPlay !== false,
      interval: options.interval || 5000,
      speed: options.speed || 400,
      showPager: options.showPager !== false,
      ...options
    };

    // タッチ関連
    this.touchStartX = 0;
    this.touchEndX = 0;
    this.isDragging = false;
    this.startPos = 0;
    this.currentTranslate = 0;
    this.prevTranslate = 0;
    this.animationID = null;

    // タイマー
    this.autoPlayTimer = null;

    this.init();
  }

  init() {
    // スライドが1枚以下の場合は何もしない
    if (this.slides.length <= 1) {
      return;
    }

    // 1枚目の画像のloading属性を削除（即座に読み込み）
    this.optimizeFirstSlideImage();

    // ページャーの作成
    if (this.options.showPager && this.isDesktop) {
      this.createPager();
    }

    // 初期表示の設定
    this.updateSlider();

    // イベントリスナーの設定
    this.addEventListeners();

    // 自動再生の開始
    if (this.options.autoPlay) {
      this.startAutoPlay();
    }
  }

  optimizeFirstSlideImage() {
    // 1枚目のスライドの画像のloading属性を削除
    const firstSlide = this.slides[0];
    if (firstSlide) {
      const firstImage = firstSlide.querySelector('img');
      if (firstImage && firstImage.hasAttribute('loading')) {
        firstImage.removeAttribute('loading');
      }
    }
  }

  createPager() {
    const pager = document.createElement('div');
    pager.className = 'custom-slider-pager';

    this.slides.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.className = 'pager-dot';
      dot.setAttribute('aria-label', `スライド ${index + 1} へ移動`);
      if (index === 0) dot.classList.add('active');

      dot.addEventListener('click', () => {
        this.goToSlide(index);
      });

      pager.appendChild(dot);
    });

    this.container.appendChild(pager);
    this.pager = pager;
  }

  updatePager() {
    if (!this.pager) return;

    const dots = this.pager.querySelectorAll('.pager-dot');
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === this.currentIndex);
    });
  }

  updateSlider() {
    if (this.isDesktop) {
      this.updateDesktopSlider();
    } else {
      this.updateMobileSlider();
    }
    this.updatePager();
  }

  updateDesktopSlider() {
    const slideWidth = this.slider.offsetWidth;
    const offset = -this.currentIndex * slideWidth;
    this.slider.style.transform = `translateX(${offset}px)`;
    this.slider.style.transition = `transform ${this.options.speed}ms ease`;
  }

  updateMobileSlider() {
    this.slides.forEach((slide, index) => {
      slide.style.opacity = index === this.currentIndex ? '1' : '0';
      slide.style.zIndex = index === this.currentIndex ? '1' : '0';
      slide.style.transition = `opacity ${this.options.speed}ms ease`;
    });
  }

  goToSlide(index) {
    if (index < 0) {
      this.currentIndex = this.slides.length - 1;
    } else if (index >= this.slides.length) {
      this.currentIndex = 0;
    } else {
      this.currentIndex = index;
    }

    this.updateSlider();
    this.resetAutoPlay();
  }

  nextSlide() {
    this.goToSlide(this.currentIndex + 1);
  }

  prevSlide() {
    this.goToSlide(this.currentIndex - 1);
  }

  addEventListeners() {
    // タッチイベント（モバイル/タブレット）
    this.slider.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
    this.slider.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    this.slider.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });

    // マウスイベント（デスクトップ）
    this.slider.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.slider.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.slider.addEventListener('mouseup', this.handleMouseUp.bind(this));
    this.slider.addEventListener('mouseleave', this.handleMouseLeave.bind(this));

    // リサイズイベント
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const wasDesktop = this.isDesktop;
        this.isDesktop = window.innerWidth >= 1024;

        if (wasDesktop !== this.isDesktop) {
          // デスクトップ⇔モバイル切り替え時
          if (this.isDesktop && this.options.showPager && !this.pager) {
            this.createPager();
          } else if (!this.isDesktop && this.pager) {
            this.pager.remove();
            this.pager = null;
          }
          this.updateSlider();
        }
      }, 250);
    });
  }

  handleTouchStart(e) {
    this.touchStartX = e.touches[0].clientX;
    this.isDragging = true;
    this.stopAutoPlay();
  }

  handleTouchMove(e) {
    if (!this.isDragging) return;

    const touchCurrentX = e.touches[0].clientX;
    const diff = touchCurrentX - this.touchStartX;

    // 横スワイプが検出された場合、縦スクロールを防止
    if (Math.abs(diff) > 10) {
      e.preventDefault();
    }
  }

  handleTouchEnd(e) {
    this.touchEndX = e.changedTouches[0].clientX;
    this.handleSwipe();
    this.isDragging = false;
    this.startAutoPlay();
  }

  handleMouseDown(e) {
    if (!this.isDesktop) return;
    this.touchStartX = e.clientX;
    this.isDragging = true;
    this.slider.style.cursor = 'grabbing';
    this.stopAutoPlay();
  }

  handleMouseMove(e) {
    if (!this.isDragging || !this.isDesktop) return;
    e.preventDefault();
  }

  handleMouseUp(e) {
    if (!this.isDesktop) return;
    this.touchEndX = e.clientX;
    this.handleSwipe();
    this.isDragging = false;
    this.slider.style.cursor = 'grab';
    this.startAutoPlay();
  }

  handleMouseLeave() {
    if (this.isDragging && this.isDesktop) {
      this.isDragging = false;
      this.slider.style.cursor = 'grab';
      this.startAutoPlay();
    }
  }

  handleSwipe() {
    const diff = this.touchStartX - this.touchEndX;
    const threshold = 50;

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        this.nextSlide();
      } else {
        this.prevSlide();
      }
    }
  }

  startAutoPlay() {
    if (!this.options.autoPlay) return;

    this.stopAutoPlay();
    this.autoPlayTimer = setInterval(() => {
      this.nextSlide();
    }, this.options.interval);
  }

  stopAutoPlay() {
    if (this.autoPlayTimer) {
      clearInterval(this.autoPlayTimer);
      this.autoPlayTimer = null;
    }
  }

  resetAutoPlay() {
    if (this.options.autoPlay) {
      this.stopAutoPlay();
      this.startAutoPlay();
    }
  }

  destroy() {
    this.stopAutoPlay();
    if (this.pager) {
      this.pager.remove();
    }
  }
}

// スライダーの初期化
$(function() {
  const sliderContainer = document.querySelector('.p-main-slider');
  if (sliderContainer) {
    const slider = new CustomSlider(sliderContainer, {
      autoPlay: true,
      interval: 5000,
      speed: 400,
      showPager: true
    });

    // グローバルに保存（必要に応じて）
    window.mainSlider = slider;
  }
});
