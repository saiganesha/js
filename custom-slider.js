// カスタムスライダーの実装
class CustomSlider {
  constructor(container, options = {}) {
    this.container = container;
    this.slider = container.querySelector('.slider');
    this.slides = Array.from(this.slider.querySelectorAll('.slide'));
    this.originalSlides = this.slides.slice();
    this.totalSlides = this.originalSlides.length;
    this.currentIndex = 0;
    this.desktopPositionIndex = 1;
    this.isDesktop = window.innerWidth >= 1024;
    this.isInfiniteReady = false;
    this.boundHandleTransitionEnd = this.handleTransitionEnd.bind(this);

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
    if (this.totalSlides <= 1) {
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
    const firstSlide = this.originalSlides[0];
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

    for (let index = 0; index < this.totalSlides; index += 1) {
      const dot = document.createElement('button');
      dot.className = 'pager-dot';
      dot.setAttribute('aria-label', `スライド ${index + 1} へ移動`);
      if (index === 0) dot.classList.add('active');

      dot.addEventListener('click', () => {
        this.goToSlide(index);
      });

      pager.appendChild(dot);
    }

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
    this.prepareSliderStructure();
    if (this.isDesktop) {
      this.updateDesktopSlider();
    } else {
      this.updateMobileSlider();
    }
    this.updatePager();
  }

  prepareSliderStructure() {
    if (this.isDesktop) {
      this.ensureDesktopStructure();
    } else {
      this.teardownDesktopStructure();
    }
  }

  updateDesktopSlider() {
    if (!this.slides.length) return;
    this.applyDesktopTransform(false);
  }

  updateMobileSlider() {
    // sliderのtransformをリセット（デスクトップからの切り替え時の対応）
    this.slider.style.transform = 'translateX(0)';
    this.slider.style.transition = 'none';

    this.slides.forEach((slide, index) => {
      slide.style.opacity = index === this.currentIndex ? '1' : '0';
      slide.style.zIndex = index === this.currentIndex ? '1' : '0';
      slide.style.transition = `opacity ${this.options.speed}ms ease`;
    });
  }

  goToSlide(index) {
    let targetIndex = index;
    if (targetIndex < 0) {
      targetIndex = this.totalSlides - 1;
    } else if (targetIndex >= this.totalSlides) {
      targetIndex = 0;
    }

    this.currentIndex = targetIndex;

    if (this.isDesktop && this.isInfiniteReady) {
      this.desktopPositionIndex = targetIndex + 1;
    }

    this.updateSlider();
    this.resetAutoPlay();
  }

  nextSlide() {
    if (this.isDesktop && this.isInfiniteReady) {
      this.desktopPositionIndex += 1;
      this.currentIndex = (this.currentIndex + 1) % this.totalSlides;
      this.updateSlider();
      this.resetAutoPlay();
      return;
    }
    this.goToSlide(this.currentIndex + 1);
  }

  prevSlide() {
    if (this.isDesktop && this.isInfiniteReady) {
      this.desktopPositionIndex -= 1;
      this.currentIndex = (this.currentIndex - 1 + this.totalSlides) % this.totalSlides;
      this.updateSlider();
      this.resetAutoPlay();
      return;
    }
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
    this.slider.addEventListener('transitionend', this.boundHandleTransitionEnd);

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
          this.desktopPositionIndex = this.isDesktop ? this.currentIndex + 1 : this.currentIndex;
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
    this.slider.removeEventListener('transitionend', this.boundHandleTransitionEnd);
    this.teardownDesktopStructure();
  }

  refreshSlides() {
    this.slides = Array.from(this.slider.querySelectorAll('.slide'));
  }

  ensureDesktopStructure() {
    if (this.isInfiniteReady || this.totalSlides < 2) {
      return;
    }

    const firstSlide = this.originalSlides[0];
    const lastSlide = this.originalSlides[this.totalSlides - 1];
    if (!firstSlide || !lastSlide) {
      return;
    }

    const firstClone = firstSlide.cloneNode(true);
    const lastClone = lastSlide.cloneNode(true);
    firstClone.dataset.clone = 'true';
    lastClone.dataset.clone = 'true';
    firstClone.setAttribute('aria-hidden', 'true');
    lastClone.setAttribute('aria-hidden', 'true');

    this.slider.appendChild(firstClone);
    this.slider.insertBefore(lastClone, this.slider.firstElementChild);

    this.isInfiniteReady = true;
    this.refreshSlides();
    this.desktopPositionIndex = this.currentIndex + 1;
    this.applyDesktopTransform(true);
  }

  teardownDesktopStructure() {
    if (!this.isInfiniteReady) {
      return;
    }

    const clones = this.slider.querySelectorAll('.slide[data-clone="true"]');
    clones.forEach(clone => clone.remove());

    this.isInfiniteReady = false;
    this.refreshSlides();
    this.desktopPositionIndex = this.currentIndex;
    this.slider.style.transition = 'none';
    this.slider.style.transform = 'translateX(0)';
  }

  applyDesktopTransform(skipAnimation) {
    if (!this.slides.length) {
      return;
    }

    const slideWidth = this.slides[0].offsetWidth;
    const sliderLeft = this.getDesktopBaseOffset();
    const containerWidth = this.container.offsetWidth || window.innerWidth;
    const containerCenterOffset = (containerWidth - slideWidth) / 2;
    const baseCorrection = containerCenterOffset - sliderLeft;
    const relativeIndex = this.isInfiniteReady ? this.desktopPositionIndex : this.currentIndex;
    const offset = baseCorrection - relativeIndex * slideWidth;

    if (skipAnimation) {
      this.slider.style.transition = 'none';
      this.slider.style.transform = `translateX(${offset}px)`;
      // Reflow to ensure the browser acknowledges the new position before restoring transition
      this.slider.getBoundingClientRect();
      this.slider.style.transition = `transform ${this.options.speed}ms ease`;
      return;
    }

    this.slider.style.transition = `transform ${this.options.speed}ms ease`;
    this.slider.style.transform = `translateX(${offset}px)`;
  }

  handleTransitionEnd(event) {
    if (event.propertyName !== 'transform') {
      return;
    }
    this.handleDesktopLoopEdges();
  }

  handleDesktopLoopEdges() {
    if (!this.isDesktop || !this.isInfiniteReady) {
      return;
    }

    const totalTrackLength = this.totalSlides + 2;
    if (this.desktopPositionIndex === totalTrackLength - 1) {
      this.desktopPositionIndex = 1;
      this.applyDesktopTransform(true);
    } else if (this.desktopPositionIndex === 0) {
      this.desktopPositionIndex = this.totalSlides;
      this.applyDesktopTransform(true);
    }
  }

  getDesktopBaseOffset() {
    if (!this.isDesktop) {
      return 0;
    }

    const sliderStyles = window.getComputedStyle(this.slider);
    const leftValue = sliderStyles.getPropertyValue('left');

    if (!leftValue || leftValue === 'auto') {
      return this.slider.offsetLeft || 0;
    }

    const numericValue = parseFloat(leftValue);
    if (Number.isNaN(numericValue)) {
      return 0;
    }

    if (leftValue.trim().endsWith('vw')) {
      return (numericValue / 100) * window.innerWidth;
    }

    if (leftValue.trim().endsWith('%')) {
      const parentWidth = this.slider.offsetParent ? this.slider.offsetParent.offsetWidth : window.innerWidth;
      return (numericValue / 100) * parentWidth;
    }

    return numericValue;
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
