(function () {
  'use strict';

  const COOKIE_NAME = 'sitarama_form_data';
  const COOKIE_EXPIRE_DAYS = 365;

  // Cookie操作のユーティリティ関数
  const CookieUtils = {
    set: function (name, value, days) {
      const expires = new Date();
      expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
      document.cookie = `${name}=${encodeURIComponent(JSON.stringify(value))};expires=${expires.toUTCString()};path=/`;
    },

    get: function (name) {
      const nameEQ = name + '=';
      const ca = document.cookie.split(';');
      for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) {
          try {
            return JSON.parse(decodeURIComponent(c.substring(nameEQ.length, c.length)));
          } catch (e) {
            return null;
          }
        }
      }
      return null;
    },

    delete: function (name) {
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
    },
  };

  // フォームデータの収集
  function collectFormData() {
    const formData = {};

    // product_text[1]からproduct_text[12]まで収集
    for (let i = 1; i <= 12; i++) {
      const input = document.querySelector(`input[name="product_text[${i}]"], select[name="product_text[${i}]"]`);
      if (input) {
        const value = input.value.trim();
        if (value) {
          formData[`product_text[${i}]`] = value;
        }
      }
    }

    return formData;
  }

  // フォームデータの復元
  function restoreFormData(formData) {
    if (!formData) return;

    Object.keys(formData).forEach((key) => {
      const input = document.querySelector(`input[name="${key}"], select[name="${key}"]`);
      if (input && formData[key]) {
        input.value = formData[key];

        // Angularの変更検知をトリガー
        const event = new Event('input', {bubbles: true});
        input.dispatchEvent(event);

        const changeEvent = new Event('change', {bubbles: true});
        input.dispatchEvent(changeEvent);
      }
    });
  }

  // フォーム要素の読み込み待機
  function waitForFormElements(callback, maxAttempts = 50, interval = 200) {
    let attempts = 0;

    const checkElements = () => {
      attempts++;

      // カスタムオプションコンテナが存在するかチェック
      const container = document.getElementById('custom-options-container');
      const firstInput = document.querySelector('input[name="product_text[1]"]');
      const firstSelect = document.querySelector('select[name="product_text[2]"]');

      if (container && firstInput && firstSelect) {
        callback();
        return;
      }

      if (attempts < maxAttempts) {
        setTimeout(checkElements, interval);
      } else {
        console.warn('フォーム要素の読み込みタイムアウト');
      }
    };

    checkElements();
  }

  // MutationObserverを使用してDOM変更を監視
  function observeFormChanges(callback) {
    const targetNode = document.body;
    const config = {childList: true, subtree: true};

    const observer = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
          for (const node of mutation.addedNodes) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              if (
                node.id === 'custom-options-container' ||
                (node.querySelector && node.querySelector('#custom-options-container'))
              ) {
                observer.disconnect();
                callback();
                return;
              }
            }
          }
        }
      }
    });

    observer.observe(targetNode, config);

    // 10秒後にタイムアウト
    setTimeout(() => {
      observer.disconnect();
    }, 10000);
  }

  // カートに入れるボタンのクリックハンドラ
  function setupCartButtonHandler() {
    // 複数の方法でボタンを検索
    const selectors = [
      'button.c-btn-cart:not(.is-favorite)',
      'button[type="submit"].c-btn-cart',
      '.p-product-form-btn__cart button',
    ];

    let cartButton = null;
    for (const selector of selectors) {
      cartButton = document.querySelector(selector);
      if (cartButton) break;
    }

    if (cartButton) {
      cartButton.addEventListener('click', function () {
        const formData = collectFormData();
        if (Object.keys(formData).length > 0) {
          CookieUtils.set(COOKIE_NAME, formData, COOKIE_EXPIRE_DAYS);
          //console.log('フォームデータをCookieに保存しました:', formData);
        }
      });
    }
  }

  // 自動入力の実行
  function performAutoFill() {
    const savedData = CookieUtils.get(COOKIE_NAME);
    if (savedData) {
      restoreFormData(savedData);
      //console.log('保存されたデータを復元しました:', savedData);
    }
  }

  // 初期化処理
  function initialize() {
    // 既にフォームが存在する場合
    if (document.getElementById('custom-options-container')) {
      performAutoFill();
      setupCartButtonHandler();
    } else {
      // フォームの読み込みを待機
      waitForFormElements(() => {
        performAutoFill();
        setupCartButtonHandler();
      });

      // MutationObserverでも監視
      observeFormChanges(() => {
        setTimeout(() => {
          performAutoFill();
          setupCartButtonHandler();
        }, 100);
      });
    }
  }

  // DOMが読み込まれた後に実行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }

  // ページ読み込み完了後にも実行（Angular等の遅延読み込み対応）
  window.addEventListener('load', () => {
    setTimeout(initialize, 500);
  });

  // デバッグ用のグローバル関数
  window.SitaramaFormUtils = {
    clearSavedData: () => CookieUtils.delete(COOKIE_NAME),
    getSavedData: () => CookieUtils.get(COOKIE_NAME),
    manualRestore: () => performAutoFill(),
  };
})();
