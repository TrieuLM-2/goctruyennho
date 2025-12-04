/* ========================================
   MAIN APPLICATION
   Homepage functionality
   ======================================== */

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    initHomepage();
});

// State
let currentPage = 1;
const booksPerPage = 12;
let allBooks = [];
let filteredBooks = [];

/**
 * Initialize homepage
 */
async function initHomepage() {
    // Check if we're on homepage
    if (!document.getElementById('booksGrid')) return;

    // Load books
    await loadBooks();

    // Setup event listeners
    setupEventListeners();

    // Load sidebar data
    loadGenres();
    loadPopularBooks();
    updateCounts();
}

/**
 * Load all books
 */
async function loadBooks() {
    try {
        allBooks = await dataManager.getBooks();

        // Apply URL filters
        const urlParams = URLUtils.getAllParams();
        if (urlParams.filter) {
            applyStatusFilter(urlParams.filter);
        } else if (urlParams.genre) {
            applyGenreFilter(urlParams.genre);
        } else if (urlParams.q) {
            performSearch(urlParams.q);
        } else {
            filteredBooks = [...allBooks];
        }

        // Apply sort
        const sortBy = document.getElementById('sortSelect')?.value || 'newest';
        filteredBooks = dataManager.sortBooks(filteredBooks, sortBy);

        // Display books
        displayBooks();
        updateBookCount();
    } catch (error) {
        console.error('Error loading books:', error);
        showError('Không thể tải danh sách truyện');
    }
}

/**
 * Display books on current page
 */
function displayBooks() {
    const grid = document.getElementById('booksGrid');
    if (!grid) return;

    const startIndex = (currentPage - 1) * booksPerPage;
    const endIndex = startIndex + booksPerPage;
    const booksToShow = filteredBooks.slice(startIndex, endIndex);

    if (booksToShow.length === 0) {
        grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: var(--space-16);">
        <p class="text-2xl text-secondary">📚</p>
        <p class="text-lg text-secondary mt-4">Không tìm thấy truyện nào</p>
      </div>
    `;
        return;
    }

    grid.innerHTML = booksToShow.map(book => createBookCard(book)).join('');

    // Update pagination
    updatePagination();

    // Add animation
    grid.classList.add('animate-fade-in');
}

/**
 * Create book card HTML
 * @param {Object} book - Book data
 * @returns {string} HTML string
 */
function createBookCard(book) {
    const statusBadge = book.status === 'completed' ?
        '<div class="book-card-badge">Hoàn thành</div>' :
        '<div class="book-card-badge" style="background-color: var(--accent-warning);">Đang cập nhật</div>';

    const rating = book.avgRating || 0;
    const stars = '⭐'.repeat(Math.floor(rating));

    return `
    <article class="book-card" data-book-id="${book.id}">
      <div class="book-card-cover">
        <img src="${book.cover}" alt="${book.title}" loading="lazy" onerror="this.src='./assets/covers/default.jpg'">
        ${statusBadge}
      </div>
      <div class="book-card-content">
        <h3 class="book-card-title line-clamp-2">${book.title}</h3>
        <p class="book-card-author">Tác giả: ${book.author}</p>
        <p class="book-card-description line-clamp-3">${book.description}</p>
        <div class="book-card-meta">
          <div class="book-card-rating">
            <span>${stars}</span>
            <span>${rating.toFixed(1)}</span>
          </div>
          <span>${formatNumber(book.views || 0)} lượt đọc</span>
        </div>
        <div class="genre-tags">
          ${book.genres.slice(0, 3).map(genre =>
        `<span class="genre-tag">${genre}</span>`
    ).join('')}
        </div>
        <div class="book-card-actions">
          <button class="btn btn-primary" onclick="goToBook('${book.id}')">
            Đọc ngay
          </button>
          <button class="btn btn-secondary" onclick="addToShelf('${book.id}')">
            Thêm vào kệ
          </button>
        </div>
      </div>
    </article>
  `;
}

/**
 * Go to book detail page
 * @param {string} bookId - Book ID
 */
function goToBook(bookId) {
    window.location.href = `./book.html?id=${bookId}`;
}

/**
 * Add book to shelf (localStorage)
 * @param {string} bookId - Book ID
 */
function addToShelf(bookId) {
    const shelf = LocalStorage.get('myShelf', []);
    if (!shelf.includes(bookId)) {
        shelf.push(bookId);
        LocalStorage.set('myShelf', shelf);
        showToast('Đã thêm vào kệ sách của bạn!', 'success');
    } else {
        showToast('Truyện đã có trong kệ sách!', 'info');
    }
}

/**
 * Update pagination
 */
function updatePagination() {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;

    const totalPages = Math.ceil(filteredBooks.length / booksPerPage);

    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }

    let html = '';

    // Previous button
    html += `
    <button class="page-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">
      ‹ Trước
    </button>
  `;

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (
            i === 1 ||
            i === totalPages ||
            (i >= currentPage - 2 && i <= currentPage + 2)
        ) {
            html += `
        <button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">
          ${i}
        </button>
      `;
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            html += '<span style="padding: 0 var(--space-2);">...</span>';
        }
    }

    // Next button
    html += `
    <button class="page-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">
      Sau ›
    </button>
  `;

    pagination.innerHTML = html;
}

/**
 * Change page
 * @param {number} page - Page number
 */
function changePage(page) {
    const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
    if (page < 1 || page > totalPages) return;

    currentPage = page;
    displayBooks();
    scrollToElement('#booksGrid', 100);
}

/**
 * Update book count display
 */
function updateBookCount() {
    const countEl = document.getElementById('bookCount');
    if (countEl) {
        countEl.textContent = `Hiển thị ${filteredBooks.length} truyện`;
    }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Search
    const searchInput = document.getElementById('searchInput');
    const searchInputMobile = document.getElementById('searchInputMobile');

    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            performSearch(e.target.value);
        }, 500));
    }

    if (searchInputMobile) {
        searchInputMobile.addEventListener('input', debounce((e) => {
            performSearch(e.target.value);
        }, 500));
    }

    // Sort
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            filteredBooks = dataManager.sortBooks(filteredBooks, e.target.value);
            currentPage = 1;
            displayBooks();
        });
    }

    // Genre filter
    const genreFilter = document.getElementById('genreFilter');
    if (genreFilter) {
        genreFilter.addEventListener('change', (e) => {
            const genre = e.target.value;
            if (genre === 'all') {
                filteredBooks = [...allBooks];
            } else {
                applyGenreFilter(genre);
            }
            currentPage = 1;
            displayBooks();
            updateBookCount();
        });
    }

    // Mobile menu toggle
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', () => {
            const navMenu = document.querySelector('.nav-menu');
            navMenu.classList.toggle('mobile-open');
        });
    }
}

/**
 * Perform search
 * @param {string} query - Search query
 */
async function performSearch(query) {
    if (!query.trim()) {
        filteredBooks = [...allBooks];
    } else {
        filteredBooks = await dataManager.searchBooks(query);
    }
    currentPage = 1;
    displayBooks();
    updateBookCount();
}

/**
 * Apply status filter
 * @param {string} status - Status to filter by
 */
async function applyStatusFilter(status) {
    filteredBooks = await dataManager.filterByStatus(status);
    currentPage = 1;
    displayBooks();
    updateBookCount();
}

/**
 * Apply genre filter
 * @param {string} genre - Genre to filter by
 */
async function applyGenreFilter(genre) {
    filteredBooks = await dataManager.filterByGenre(genre);
    currentPage = 1;
    displayBooks();
    updateBookCount();
}

/**
 * Load genres into sidebar and filter
 */
async function loadGenres() {
    const books = await dataManager.getBooks();
    const genresSet = new Set();

    books.forEach(book => {
        book.genres.forEach(genre => genresSet.add(genre));
    });

    const genres = Array.from(genresSet).sort();

    // Update sidebar
    const genreList = document.getElementById('genreList');
    if (genreList) {
        genreList.innerHTML = genres.map(genre => `
      <a href="./index.html?genre=${encodeURIComponent(genre)}" class="sidebar-link">
        <span>${genre}</span>
      </a>
    `).join('');
    }

    // Update filter dropdown
    const genreFilter = document.getElementById('genreFilter');
    if (genreFilter) {
        genreFilter.innerHTML = `
      <option value="all">Tất cả thể loại</option>
      ${genres.map(genre => `
        <option value="${genre}">${genre}</option>
      `).join('')}
    `;
    }
}

/**
 * Load popular books into sidebar
 */
async function loadPopularBooks() {
    const books = await dataManager.getBooks();
    const popular = books
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, 5);

    const container = document.getElementById('popularBooks');
    if (!container) return;

    container.innerHTML = popular.map(book => `
    <div class="flex gap-3 mb-4 cursor-pointer" onclick="goToBook('${book.id}')" style="cursor: pointer;">
      <img 
        src="${book.cover}" 
        alt="${book.title}"
        style="width: 60px; height: 84px; object-fit: cover; border-radius: var(--border-radius-md);"
        onerror="this.src='./assets/covers/default.jpg'"
      >
      <div class="flex-1">
        <h5 class="font-semibold text-sm line-clamp-2 mb-1">${book.title}</h5>
        <p class="text-xs text-secondary">${book.author}</p>
        <div class="text-xs text-tertiary mt-1">
          ⭐ ${(book.avgRating || 0).toFixed(1)} • ${formatNumber(book.views || 0)} đọc
        </div>
      </div>
    </div>
  `).join('');
}

/**
 * Update counts in sidebar
 */
async function updateCounts() {
    const books = await dataManager.getBooks();

    const allCount = document.getElementById('allCount');
    const completedCount = document.getElementById('completedCount');
    const ongoingCount = document.getElementById('ongoingCount');

    if (allCount) allCount.textContent = books.length;
    if (completedCount) {
        completedCount.textContent = books.filter(b => b.status === 'completed').length;
    }
    if (ongoingCount) {
        ongoingCount.textContent = books.filter(b => b.status === 'ongoing').length;
    }
}

/**
 * Show error message
 * @param {string} message - Error message
 */
function showError(message) {
    const grid = document.getElementById('booksGrid');
    if (grid) {
        grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: var(--space-16);">
        <p class="text-2xl">❌</p>
        <p class="text-lg text-secondary mt-4">${message}</p>
        <button class="btn btn-primary mt-6" onclick="location.reload()">
          Thử lại
        </button>
      </div>
    `;
    }
}
