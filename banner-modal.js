// Banner Modal Script
(function () {
  'use strict';

  // Configuration
  const CONFIG = {
    // Display conditions
    minStayDuration: 5000, // 5 seconds
    scrollTriggerPercentage: 0.11, // 11%
    delayAfterTrigger: 3000, // 3 seconds

    // Campaign end date
    endDate: new Date('2025-09-15T23:59:59'),

    // Banner images (random selection)
    images: [
      'https://img02.shop-pro.jp/PA01008/381/etc_base64/MjAyNV9jb3Vwb24x.jpeg?cmsp_timestamp=20250913115913',
      'https://img02.shop-pro.jp/PA01008/381/etc_base64/MjAyNV9jb3Vwb24y.jpeg?cmsp_timestamp=20250913115913',
    ],

    // Banner link
    linkUrl: 'https://sitarama.jp/?mode=f390',

    // Session storage key
    sessionKey: 'bannerModalShown',
  };

  // Check if modal should be displayed
  function shouldShowModal() {
    // Check campaign period
    if (new Date() > CONFIG.endDate) {
      return false;
    }

    // Check session storage
    if (sessionStorage.getItem(CONFIG.sessionKey)) {
      return false;
    }

    return true;
  }

  // Calculate scroll percentage
  function getScrollPercentage() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    return scrollTop / scrollHeight;
  }

  // Create modal HTML
  function createModal() {
    // Select random image
    const randomImage = CONFIG.images[Math.floor(Math.random() * CONFIG.images.length)];

    // Create modal elements
    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'banner-modal-overlay';
    modalOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.7);
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;

    const modalContent = document.createElement('div');
    modalContent.id = 'banner-modal-content';
    modalContent.style.cssText = `
            position: relative;
            max-width: 90%;
            max-height: 90%;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        `;

    const closeButton = document.createElement('button');
    closeButton.innerHTML = '×';
    closeButton.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            width: 40px;
            height: 40px;
            border: none;
            background: rgba(255, 255, 255, 0.9);
            border-radius: 50%;
            font-size: 24px;
            cursor: pointer;
            z-index: 10;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background-color 0.2s;
        `;

    closeButton.onmouseover = function () {
      this.style.backgroundColor = 'rgba(255, 255, 255, 1)';
    };
    closeButton.onmouseout = function () {
      this.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
    };

    const bannerLink = document.createElement('a');
    bannerLink.href = CONFIG.linkUrl;
    bannerLink.target = '_blank';
    bannerLink.rel = 'noopener noreferrer';

    const bannerImage = document.createElement('img');
    bannerImage.src = randomImage;
    bannerImage.style.cssText = `
            display: block;
            max-width: 100%;
            max-height: 80vh;
            width: auto;
            height: auto;
        `;

    // Assemble modal
    bannerLink.appendChild(bannerImage);
    modalContent.appendChild(closeButton);
    modalContent.appendChild(bannerLink);
    modalOverlay.appendChild(modalContent);

    // Close modal function
    function closeModal() {
      modalOverlay.style.opacity = '0';
      setTimeout(() => {
        modalOverlay.remove();
      }, 300);
      sessionStorage.setItem(CONFIG.sessionKey, 'true');
    }

    // Event listeners
    closeButton.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', function (e) {
      if (e.target === modalOverlay) {
        closeModal();
      }
    });

    // Add to DOM and show
    document.body.appendChild(modalOverlay);
    setTimeout(() => {
      modalOverlay.style.opacity = '1';
    }, 10);
  }

  // Main function
  function initBannerModal() {
    if (!shouldShowModal()) {
      return;
    }

    const startTime = Date.now();
    let scrollTriggered = false;
    let modalShown = false;

    // Check conditions and show modal
    function checkAndShowModal() {
      if (modalShown) return;

      const currentTime = Date.now();
      const stayDuration = currentTime - startTime;

      // Check minimum stay duration
      if (stayDuration < CONFIG.minStayDuration) {
        return;
      }

      // Check scroll trigger
      if (!scrollTriggered) {
        return;
      }

      // Show modal after delay
      modalShown = true;
      setTimeout(createModal, CONFIG.delayAfterTrigger);
    }

    // Scroll event listener
    function handleScroll() {
      if (scrollTriggered) return;

      if (getScrollPercentage() >= CONFIG.scrollTriggerPercentage) {
        scrollTriggered = true;
        checkAndShowModal();
      }
    }

    // Add event listeners
    window.addEventListener('scroll', handleScroll);

    // Check if already scrolled on page load
    if (getScrollPercentage() >= CONFIG.scrollTriggerPercentage) {
      scrollTriggered = true;
    }

    // Check conditions periodically
    const checkInterval = setInterval(() => {
      checkAndShowModal();
      if (modalShown) {
        clearInterval(checkInterval);
      }
    }, 1000);
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBannerModal);
  } else {
    initBannerModal();
  }
})();
