// Banner Modal Script v1.0.30
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
        name: '第221回グループ・ホーマ（ガーヤトリー・ジャヤンティー）',
        startDate: new Date(),
        endDate: new Date('2026-08-24T18:00:00'),
        images: [
          'https://res.cloudinary.com/djry8fkuu/image/upload/v1786178009/blog-writer/blog_1786178007963_gayatri-jayanti-group-homa-popup.webp',
        ],
        linkUrl: 'https://sitarama.jp/?mode=f368',
      },
      {
        name: 'ヴァラ・ラクシュミー・ヴラタ・プージャー',
        startDate: new Date(),
        endDate: new Date('2026-08-25T18:00:00'),
        images: [
          'https://res.cloudinary.com/djry8fkuu/image/upload/v1786177896/blog-writer/blog_1786177894335_vara-lakshmi-vratam-popup.webp',
        ],
        linkUrl: 'https://sitarama.jp/?mode=f349',
      },
      {
        name: 'サンカタハラ・チャトゥルティー・プージャー',
        startDate: new Date(),
        endDate: new Date('2026-08-28T18:00:00'),
        images: [
          'https://res.cloudinary.com/djry8fkuu/image/upload/v1786177911/blog-writer/blog_1786177909571_sankatahara-chaturthi-popup.webp',
        ],
        linkUrl: 'https://sitarama.jp/?mode=f319',
      },
      {
        name: 'クリシュナ・ジャヤンティー・プージャー',
        startDate: new Date(),
        endDate: new Date('2026-09-01T18:00:00'),
        images: [
          'https://res.cloudinary.com/djry8fkuu/image/upload/v1786177927/blog-writer/blog_1786177925434_krishna-jayanti-popup.webp',
        ],
        linkUrl: 'https://sitarama.jp/?mode=f359',
      },
      {
        name: 'ガネーシャ・チャトゥルティー・プージャー',
        startDate: new Date(),
        endDate: new Date('2026-09-11T18:00:00'),
        images: [
          'https://res.cloudinary.com/djry8fkuu/image/upload/v1786177942/blog-writer/blog_1786177940773_ganesha-chaturthi-popup.webp',
        ],
        linkUrl: 'https://sitarama.jp/?mode=f360',
      },
      {
        name: 'マハーラクシュミー・ヴラタ・プージャー',
        startDate: new Date(),
        endDate: new Date('2026-09-16T18:00:00'),
        images: [
          'https://res.cloudinary.com/djry8fkuu/image/upload/v1786177965/blog-writer/blog_1786177963826_mahalakshmi-vratam-popup.webp',
        ],
        linkUrl: 'https://sitarama.jp/?mode=f369',
      },
      {
        name: 'マハーラヤー・アマーヴァシャー・プージャー',
        startDate: new Date(),
        endDate: new Date('2026-10-07T18:00:00'),
        images: [
          'https://res.cloudinary.com/djry8fkuu/image/upload/v1786177979/blog-writer/blog_1786177977994_mahalaya-amavasya-popup.webp',
        ],
        linkUrl: 'https://sitarama.jp/?mode=f361',
      },
      {
        name: 'クリシュナ降誕祭セール（全品10%OFFクーポン）',
        startDate: new Date(),
        endDate: new Date('2026-09-06T23:59:59+09:00'),
        images: [
          'https://res.cloudinary.com/djry8fkuu/image/upload/f_auto,q_auto,w_800/v1787799909/blog-writer/blog_1787799908802_krishna-sale-popup.webp',
        ],
        linkUrl: 'https://sitarama.jp/?mode=f226',
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

  // w_800 は SP のモーダル実表示幅 351px の DPR2 相当。
  // 変換パラメータ付きの URL に重ねて付けると多重変換チェーンになるため、未変換のときだけ付与する。
  const CLD = (u) =>
    u.indexOf('/image/upload/') === -1 || u.indexOf('/image/upload/f_') !== -1
      ? u
      : u.replace('/image/upload/', '/image/upload/f_auto,q_auto,w_800/');

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

    // 商品詳細ページでは表示しない(購入検討中の全画面割り込みを避ける)
    if (urlParams.get('pid')) {
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
    modalContent.setAttribute('role', 'dialog');
    modalContent.setAttribute('aria-modal', 'true');
    modalContent.setAttribute('aria-label', selectedCampaign.name || 'キャンペーンのお知らせ');
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
    closeButton.type = 'button';
    closeButton.innerHTML = '×';
    closeButton.setAttribute('aria-label', '閉じる');
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
    bannerImage.src = CLD(randomImage);
    bannerImage.alt = selectedCampaign.name || '';
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

    // 開く前のフォーカス位置(閉じたら戻す)
    const previouslyFocused = document.activeElement;

    // Close modal function
    function closeModal() {
      document.removeEventListener('keydown', onKeydown);
      modalOverlay.style.opacity = '0';
      setTimeout(() => {
        modalOverlay.remove();
      }, 300);
      sessionStorage.setItem(CONFIG.sessionKey, 'true');
      if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
        previouslyFocused.focus();
      }
    }

    // Esc で閉じる + Tab をモーダル内に閉じ込める(フォーカストラップ)
    function onKeydown(e) {
      if (e.key === 'Escape') {
        closeModal();
        return;
      }
      if (e.key === 'Tab') {
        const focusables = [closeButton, bannerLink];
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        } else if (focusables.indexOf(document.activeElement) === -1) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    // Event listeners
    closeButton.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', function (e) {
      if (e.target === modalOverlay) {
        closeModal();
      }
    });
    document.addEventListener('keydown', onKeydown);

    // Add to DOM and show
    document.body.appendChild(modalOverlay);
    // 表示した時点でセッション抑止フラグを書く(1セッション1回。従来は閉じるまで毎ページ表示)
    try { sessionStorage.setItem(CONFIG.sessionKey, 'true'); } catch (e) {}
    setTimeout(() => {
      modalOverlay.style.opacity = '1';
      closeButton.focus({preventScroll: true});
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

    // Check conditions periodically(表示後 or 3 分経過で監視を完全に解放する)
    function cleanupWatchers() {
      clearInterval(checkInterval);
      clearTimeout(maxWaitTimer);
      window.removeEventListener('scroll', handleScroll);
    }
    const checkInterval = setInterval(() => {
      checkAndShowModal();
      if (modalShown) {
        cleanupWatchers();
      }
    }, 1000);
    const maxWaitTimer = setTimeout(cleanupWatchers, 180000);
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBannerModal);
  } else {
    initBannerModal();
  }
})();
