(function() {
  'use strict';

  // WordPress REST API URL
  const WP_CATEGORIES_API = 'https://sitarama.jp/apps/note/wp-json/wp/v2/categories';
  const CATEGORY_PAGE_URL = 'https://sitarama.jp/?mode=f397';

  // 子孫カテゴリー含む記事数を保存するMap
  let totalCountsMap = null;

  // カテゴリーデータを取得して記事数を再計算
  async function fetchAndCalculateCounts() {
    try {
      const response = await fetch(`${WP_CATEGORIES_API}?per_page=100&hide_empty=true`);
      const categoriesData = await response.json();

      // Map形式で保存
      const categoriesMap = new Map();
      categoriesData.forEach(cat => categoriesMap.set(cat.id, cat));

      // 各カテゴリーの総記事数を計算（子孫カテゴリー含む）
      totalCountsMap = new Map();
      categoriesData.forEach(cat => {
        totalCountsMap.set(cat.id, calculateTotalCount(cat.id, categoriesMap));
      });

      return totalCountsMap;
    } catch (error) {
      console.error('Error fetching categories for count recalculation:', error);
      return null;
    }
  }

  // 子孫カテゴリーの記事数を再帰的に集計
  function calculateTotalCount(categoryId, categoriesMap) {
    const category = categoriesMap.get(categoryId);
    if (!category) return 0;

    let total = category.count; // 自身の記事数

    // 子カテゴリーの記事数を再帰的に加算
    categoriesMap.forEach(cat => {
      if (cat.parent === categoryId) {
        total += calculateTotalCount(cat.id, categoriesMap);
      }
    });

    return total;
  }

  // カテゴリーを読み込んで表示
  async function loadBlogCategories() {
    const categoryList = document.getElementById('wp-blog-category-list');
    const categoryNav = document.getElementById('wp-blog-category-nav');
    const sideCategoryList = document.getElementById('wp-blog-side-category-list');
    const sideCategoryNav = document.getElementById('wp-blog-side-category-nav');

    try {
      // 親カテゴリーのみを取得
      const response = await fetch(`${WP_CATEGORIES_API}?per_page=100&parent=0&orderby=term_order&order=asc&hide_empty=true`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const categories = await response.json();

      if (!categories || categories.length === 0) {
        if (categoryNav) categoryNav.style.display = 'none';
        if (sideCategoryNav) sideCategoryNav.style.display = 'none';
        return;
      }

      // 記事数を再計算（子孫カテゴリー含む）
      await fetchAndCalculateCounts();

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

          // 再計算した記事数を使用（取得できない場合は元の値）
          const count = totalCountsMap && totalCountsMap.has(category.id)
            ? totalCountsMap.get(category.id)
            : category.count;

          link.textContent = `${category.name} (${count})`;
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

          // 再計算した記事数を使用（取得できない場合は元の値）
          const count = totalCountsMap && totalCountsMap.has(category.id)
            ? totalCountsMap.get(category.id)
            : category.count;

          link.textContent = `${category.name} (${count})`;
          li.appendChild(link);
          sideCategoryList.appendChild(li);
        });
      }

    } catch (error) {
      console.error('WordPress blog categories loading failed:', error);
      if (categoryNav) categoryNav.style.display = 'none';
      if (sideCategoryNav) sideCategoryNav.style.display = 'none';
    }
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
