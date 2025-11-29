// Banner Modal Script
(function () {
  'use strict';

  // Configuration
  const CONFIG = {
    // Display conditions
    minStayDuration: 5000, // 5 seconds
    scrollTriggerPercentage: 0.11, // 11%
    delayAfterTrigger: 3000, // 3 seconds

    // Campaign period
    startDate: new Date('2025-11-22T00:00:00'),
    endDate: new Date('2025-11-30T23:59:59'),

    // Banner images (random selection)
    images: [
      'https://res.cloudinary.com/djry8fkuu/image/upload/v1764388925/banner-images/gitasale1.webp',
      'https://res.cloudinary.com/djry8fkuu/image/upload/v1764388926/banner-images/gitasale2.webp',
      'https://res.cloudinary.com/djry8fkuu/image/upload/v1764388927/banner-images/gitasale3.webp',
    ],

    // Banner link
    linkUrl: 'https://sitarama.jp/?mode=f302',

    // Session storage key
    sessionKey: 'bannerModalShown',
  };

  // Check if modal should be displayed
  function shouldShowModal() {
    const now = new Date();

    // Check campaign period
    if (now < CONFIG.startDate || now > CONFIG.endDate) {
      return false;
    }

    // Check if accessed from banner link
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('from_banner') === '1') {
      return false;
    }

    // Check if current page is the link destination (compare 'mode' parameter)
    const currentMode = urlParams.get('mode');
    const linkUrl = new URL(CONFIG.linkUrl);
    const linkMode = linkUrl.searchParams.get('mode');
    if (currentMode && linkMode && currentMode === linkMode) {
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
    const linkUrl = CONFIG.linkUrl + (CONFIG.linkUrl.includes('?') ? '&' : '?') + 'from_banner=1';
    bannerLink.href = linkUrl;
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
