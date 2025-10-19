(function() {
  'use strict';

  // WordPress REST API URL
  const WP_CATEGORIES_API = 'https://sitarama.jp/apps/note/wp-json/wp/v2/categories';
  const CATEGORY_PAGE_URL = 'https://sitarama.jp/?mode=f397';

  // カテゴリーを読み込んで表示
  function loadBlogCategories() {
    const categoryList = document.getElementById('wp-blog-category-list');
    const categoryNav = document.getElementById('wp-blog-category-nav');
    const sideCategoryList = document.getElementById('wp-blog-side-category-list');
    const sideCategoryNav = document.getElementById('wp-blog-side-category-nav');

    fetch(`${WP_CATEGORIES_API}?per_page=100&parent=0&orderby=term_order&order=asc&hide_empty=true`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(categories => {
        if (!categories || categories.length === 0) {
          if (categoryNav) categoryNav.style.display = 'none';
          if (sideCategoryNav) sideCategoryNav.style.display = 'none';
          return;
        }

        // ヘッダーナビゲーション用カテゴリーリストを構築
        if (categoryList) {
          categoryList.innerHTML = '';

          // 「すべての記事」リンク
          const allItem = document.createElement('li');
          allItem.className = 'l-dropdown-menu-list__item';
          allItem.innerHTML = `<a class="l-dropdown-menu-list__link" href="${CATEGORY_PAGE_URL}">すべての記事</a>`;
          categoryList.appendChild(allItem);

          // 各カテゴリーを追加
          categories.forEach(category => {
            const li = document.createElement('li');
            li.className = 'l-dropdown-menu-list__item';
            const link = document.createElement('a');
            link.className = 'l-dropdown-menu-list__link';
            link.href = `${CATEGORY_PAGE_URL}&category_id=${category.id}`;
            link.textContent = `${category.name} (${category.count})`;
            li.appendChild(link);
            categoryList.appendChild(li);
          });
        }

        // サイドバー用カテゴリーリストを構築
        if (sideCategoryList) {
          sideCategoryList.innerHTML = '';

          // 「すべての記事」リンク
          const allItem = document.createElement('li');
          allItem.className = 'l-side-navi-list__item';
          const allLink = document.createElement('a');
          allLink.className = 'l-side-navi-list__link is-link';
          allLink.href = CATEGORY_PAGE_URL;
          allLink.textContent = 'すべての記事';
          allItem.appendChild(allLink);
          sideCategoryList.appendChild(allItem);

          // 各カテゴリーを追加
          categories.forEach(category => {
            const li = document.createElement('li');
            li.className = 'l-side-navi-list__item';
            const link = document.createElement('a');
            link.className = 'l-side-navi-list__link is-link';
            link.href = `${CATEGORY_PAGE_URL}&category_id=${category.id}`;
            link.textContent = category.name;
            li.appendChild(link);
            sideCategoryList.appendChild(li);
          });
        }
      })
      .catch(error => {
        console.error('WordPress blog categories loading failed:', error);
        if (categoryNav) categoryNav.style.display = 'none';
        if (sideCategoryNav) sideCategoryNav.style.display = 'none';
      });
  }

  // 月別アーカイブを読み込んで表示
  function loadBlogArchive() {
    const archiveList = document.getElementById('wp-blog-archive-list');
    const archiveNav = document.getElementById('wp-blog-archive-nav');

    if (!archiveList || !archiveNav) {
      return;
    }

    // 過去12ヶ月分のアーカイブを生成
    const currentDate = new Date();
    const archives = [];

    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      archives.push({
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        label: `${date.getFullYear()}年${date.getMonth() + 1}月`
      });
    }

    // アーカイブリストを構築
    archiveList.innerHTML = '';

    archives.forEach(archive => {
      const li = document.createElement('li');
      li.className = 'l-side-navi-list__item';
      const link = document.createElement('a');
      link.className = 'l-side-navi-list__link is-link';
      link.href = `https://sitarama.jp/?mode=f400&year=${archive.year}&month=${archive.month}`;
      link.textContent = archive.label;
      li.appendChild(link);
      archiveList.appendChild(li);
    });
  }

  // ページ読み込み時に実行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      loadBlogCategories();
      loadBlogArchive();
    });
  } else {
    loadBlogCategories();
    loadBlogArchive();
  }
})();
