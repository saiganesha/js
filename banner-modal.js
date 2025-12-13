// Banner Modal Script
(function () {
  'use strict';

  // Configuration
  const CONFIG = {
    // Display conditions
    minStayDuration: 5000, // 5 seconds
    scrollTriggerPercentage: 0.11, // 11%
    delayAfterTrigger: 3000, // 3 seconds

    // Campaign array - each campaign has its own period, images, and link
    campaigns: [
      {
        name: '歳末感謝セール',
        startDate: new Date('2025-11-22T00:00:00'),
        endDate: new Date('2025-12-26T23:59:59'),
        images: [
          'https://res.cloudinary.com/djry8fkuu/image/upload/v1765608070/banner-images/deity_banner_text_durga_1765608042366.webp',
          'https://res.cloudinary.com/djry8fkuu/image/upload/v1765608077/banner-images/deity_banner_text_ganesha_1765607956175.webp',
          'https://res.cloudinary.com/djry8fkuu/image/upload/v1765608079/banner-images/deity_banner_text_krishna_1765608026653.webp',
          'https://res.cloudinary.com/djry8fkuu/image/upload/v1765608081/banner-images/deity_banner_text_lakshmi_1765607974848.webp',
          'https://res.cloudinary.com/djry8fkuu/image/upload/v1765608082/banner-images/deity_banner_text_saraswati_1765607993140.webp',
          'https://res.cloudinary.com/djry8fkuu/image/upload/v1765608084/banner-images/deity_banner_text_shiva_1765608011263.webp',
        ],
        linkUrl: 'https://sitarama.jp/?mode=f390',
      },
      {
        name: 'ラクシュミー・クベーラ・マンスリー・プージャー',
        startDate: new Date('2025-12-13T00:00:00'),
        endDate: new Date('2025-12-16T18:00:00'),
        images: [
          'https://res.cloudinary.com/djry8fkuu/image/upload/v1765611304/banner-images/banner_lakshmi_kubera.webp',
        ],
        linkUrl: 'https://sitarama.jp/?mode=f365',
      },
      {
        name: 'ハヌマーン・ジャヤンティー・プージャー',
        startDate: new Date('2025-12-13T00:00:00'),
        endDate: new Date('2025-12-16T18:00:00'),
        images: [
          'https://res.cloudinary.com/djry8fkuu/image/upload/v1765611846/banner-images/banner_hanuman_jayanti_v2.webp',
        ],
        linkUrl: 'https://sitarama.jp/?mode=f404',
      },
      // Add more campaigns here as needed
      // {
      //   name: '新春キャンペーン',
      //   startDate: new Date('2026-01-01T00:00:00'),
      //   endDate: new Date('2026-01-31T23:59:59'),
      //   images: ['https://example.com/new-year-banner.webp'],
      //   linkUrl: 'https://sitarama.jp/?mode=newyear',
      // },
    ],

    // Session storage key
    sessionKey: 'bannerModalShown',
  };

  // Get active campaigns based on current date
  function getActiveCampaigns() {
    const now = new Date();
    return CONFIG.campaigns.filter(
      (campaign) => now >= campaign.startDate && now <= campaign.endDate
    );
  }

  // Check if modal should be displayed
  function shouldShowModal() {
    // Check if there are any active campaigns
    const activeCampaigns = getActiveCampaigns();
    if (activeCampaigns.length === 0) {
      return false;
    }

    // Check if accessed from banner link
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('from_banner') === '1') {
      return false;
    }

    // Check if current page is the link destination of any active campaign
    const currentMode = urlParams.get('mode');
    if (currentMode) {
      const isOnCampaignPage = activeCampaigns.some((campaign) => {
        const linkUrl = new URL(campaign.linkUrl);
        const linkMode = linkUrl.searchParams.get('mode');
        return linkMode && currentMode === linkMode;
      });
      if (isOnCampaignPage) {
        return false;
      }
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
    // Get active campaigns and select one randomly
    const activeCampaigns = getActiveCampaigns();
    if (activeCampaigns.length === 0) return;

    const selectedCampaign = activeCampaigns[Math.floor(Math.random() * activeCampaigns.length)];

    // Select random image from the selected campaign
    const randomImage = selectedCampaign.images[Math.floor(Math.random() * selectedCampaign.images.length)];

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
    const linkUrl = selectedCampaign.linkUrl + (selectedCampaign.linkUrl.includes('?') ? '&' : '?') + 'from_banner=1';
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
