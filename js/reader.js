/* ========================================
   READER FUNCTIONALITY
   Reading page with bilingual support
   ======================================== */

let currentChapter = null;
let currentBook = null;
let allChapters = [];
let currentChapterIndex = 0;

// Reading settings
let readerSettings = LocalStorage.get('readerSettings', {
    fontSize: 100,
    lineHeight: 1.75,
    fontFamily: 'Nunito',
    textAlign: 'left',
    theme: 'light',
    language: 'bilingual' // vn, en, bilingual
});

document.addEventListener('DOMContentLoaded', async () => {
    const chapterId = URLUtils.getParam('id');
    if (!chapterId) {
        window.location.href = './index.html';
        return;
    }

    await loadChapter(chapterId);
    initReader();
});

/**
 * Load chapter content
 */
async function loadChapter(chapterId) {
    try {
        currentChapter = await dataManager.getChapterById(chapterId);
        if (!currentChapter) {
            showError('Không tìm thấy chương');
            return;
        }

        currentBook = await dataManager.getBookById(currentChapter.bookId);
        if (!currentBook) {
            showError('Không tìm thấy sách');
            return;
        }

        allChapters = await dataManager.getBookChapters(currentChapter.bookId);
        currentChapterIndex = allChapters.findIndex(ch => ch.id === chapterId);

        // Update page
        document.title = `${currentChapter.title} - ${currentBook.title}`;
        document.getElementById('bookTitle').textContent = currentBook.title;
        document.getElementById('chapterTitle').textContent =
            `Chương ${currentChapter.chapterNum}: ${currentChapter.title}`;

        // Display content
        displayContent();

        // Load comments
        await loadChapterComments();

        // Mark as read
        ReadingProgress.markChapterRead(currentBook.id, chapterId);

        // Restore scroll position
        restoreScrollPosition();

        // Show rating if final chapter
        if (currentChapter.isFinal) {
            document.getElementById('ratingSection').style.display = 'block';
        }

        // Update navigation
        updateNavigation();

        // Show content
        document.getElementById('loadingState').classList.add('hidden');
        document.getElementById('readerContent').classList.remove('hidden');

    } catch (error) {
        console.error('Error loading chapter:', error);
        showError('Lỗi khi tải chương');
    }
}

/**
 * Display chapter content based on language setting
 */
function displayContent() {
    const container = document.getElementById('chapterContent');
    const { language } = readerSettings;

    let html = '';

    if (language === 'vn') {
        // Vietnamese only
        html = currentChapter.contentVN
            .map(para => `<p class="chapter-paragraph">${para}</p>`)
            .join('');
    } else if (language === 'en') {
        // English only
        html = currentChapter.contentEN
            .map(para => `<p class="chapter-paragraph">${para}</p>`)
            .join('');
    } else {
        // Bilingual - alternating paragraphs
        const maxLength = Math.max(
            currentChapter.contentVN.length,
            currentChapter.contentEN.length
        );

        for (let i = 0; i < maxLength; i++) {
            if (currentChapter.contentVN[i]) {
                html += `<p class="chapter-paragraph lang-vn">${currentChapter.contentVN[i]}</p>`;
            }
            if (currentChapter.contentEN[i]) {
                html += `<p class="chapter-paragraph lang-en">${currentChapter.contentEN[i]}</p>`;
            }
        }
    }

    container.innerHTML = html;
}

/**
 * Initialize reader
 */
function initReader() {
    // Apply saved settings
    applyReaderSettings();

    // Setup settings panel
    setupSettingsPanel();

    // Setup progress tracking
    setupProgressTracking();

    // Setup auto-save
    setupAutoSave();

    // Setup keyboard navigation
    setupKeyboardNav();
}

/**
 * Apply reader settings
 */
function applyReaderSettings() {
    const content = document.getElementById('chapterContent');
    if (!content) return;

    content.style.fontSize = `${readerSettings.fontSize}%`;
    content.style.lineHeight = readerSettings.lineHeight;
    content.style.fontFamily = `var(--font-${readerSettings.fontFamily.toLowerCase()})`;
    content.style.textAlign = readerSettings.textAlign;

    // Update controls
    document.getElementById('fontSizeSlider').value = readerSettings.fontSize;
    document.getElementById('fontSizeValue').textContent = `${readerSettings.fontSize}%`;
    document.getElementById('lineHeightSlider').value = readerSettings.lineHeight;
    document.getElementById('lineHeightValue').textContent = readerSettings.lineHeight;

    // Update language buttons
    document.querySelectorAll('[data-lang]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === readerSettings.language);
    });

    // Update font buttons
    document.querySelectorAll('[data-font]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.font === readerSettings.fontFamily);
    });

    // Update align buttons
    document.querySelectorAll('[data-align]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.align === readerSettings.textAlign);
    });
}

/**
 * Setup settings panel
 */
function setupSettingsPanel() {
    const toggleBtn = document.getElementById('settingsToggle');
    const panel = document.getElementById('settingsPanel');
    const overlay = document.getElementById('settingsOverlay');

    toggleBtn.addEventListener('click', () => {
        panel.classList.toggle('open');
        overlay.classList.toggle('hidden');
    });

    overlay.addEventListener('click', () => {
        panel.classList.remove('open');
        overlay.classList.add('hidden');
    });

    // Font size
    document.getElementById('fontSizeSlider').addEventListener('input', (e) => {
        readerSettings.fontSize = parseInt(e.target.value);
        document.getElementById('fontSizeValue').textContent = `${readerSettings.fontSize}%`;
        applyReaderSettings();
        saveSettings();
    });

    // Line height
    document.getElementById('lineHeightSlider').addEventListener('input', (e) => {
        readerSettings.lineHeight = parseFloat(e.target.value);
        document.getElementById('lineHeightValue').textContent = readerSettings.lineHeight;
        applyReaderSettings();
        saveSettings();
    });

    // Language mode
    document.querySelectorAll('[data-lang]').forEach(btn => {
        btn.addEventListener('click', () => {
            readerSettings.language = btn.dataset.lang;
            displayContent();
            applyReaderSettings();
            saveSettings();
        });
    });

    // Font family
    document.querySelectorAll('[data-font]').forEach(btn => {
        btn.addEventListener('click', () => {
            readerSettings.fontFamily = btn.dataset.font;
            applyReaderSettings();
            saveSettings();
        });
    });

    // Text alignment
    document.querySelectorAll('[data-align]').forEach(btn => {
        btn.addEventListener('click', () => {
            readerSettings.textAlign = btn.dataset.align;
            applyReaderSettings();
            saveSettings();
        });
    });
}

/**
 * Save settings to localStorage
 */
function saveSettings() {
    LocalStorage.set('readerSettings', readerSettings);
}

/**
 * Setup progress tracking
 */
function setupProgressTracking() {
    const progressBar = document.getElementById('readingProgressBar');

    window.addEventListener('scroll', throttle(() => {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        const progress = (scrollTop / (documentHeight - windowHeight)) * 100;
        progressBar.style.width = `${Math.min(progress, 100)}%`;
    }, 100));
}

/**
 * Setup auto-save scroll position
 */
function setupAutoSave() {
    let saveTimeout;

    window.addEventListener('scroll', () => {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
            ReadingProgress.savePosition(
                currentBook.id,
                currentChapter.id,
                scrollPosition
            );
        }, 1000);
    });
}

/**
 * Restore scroll position
 */
function restoreScrollPosition() {
    const progress = ReadingProgress.getPosition(currentBook.id);
    if (progress && progress.chapterId === currentChapter.id && progress.scrollPosition) {
        setTimeout(() => {
            window.scrollTo({
                top: progress.scrollPosition,
                behavior: 'smooth'
            });
        }, 100);
    }
}

/**
 * Setup keyboard navigation
 */
function setupKeyboardNav() {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            goToPrevChapter();
        } else if (e.key === 'ArrowRight') {
            goToNextChapter();
        }
    });
}

/**
 * Update navigation buttons
 */
function updateNavigation() {
    const prevBtn = document.getElementById('prevChapterBtn');
    const nextBtn = document.getElementById('nextChapterBtn');

    if (currentChapterIndex > 0) {
        prevBtn.disabled = false;
        prevBtn.onclick = goToPrevChapter;
    } else {
        prevBtn.disabled = true;
    }

    if (currentChapterIndex < allChapters.length - 1) {
        nextBtn.disabled = false;
        nextBtn.onclick = goToNextChapter;
    } else {
        nextBtn.disabled = true;
    }
}

/**
 * Navigate to previous chapter
 */
function goToPrevChapter() {
    if (currentChapterIndex > 0) {
        const prevChapter = allChapters[currentChapterIndex - 1];
        window.location.href = `./read.html?id=${prevChapter.id}`;
    }
}

/**
 * Navigate to next chapter
 */
function goToNextChapter() {
    if (currentChapterIndex < allChapters.length - 1) {
        const nextChapter = allChapters[currentChapterIndex + 1];
        window.location.href = `./read.html?id=${nextChapter.id}`;
    }
}

/**
 * Go back to book detail
 */
function goToBookDetail() {
    window.location.href = `./book.html?id=${currentBook.id}`;
}

/**
 * Load chapter comments
 */
async function loadChapterComments() {
    const comments = await dataManager.getChapterComments(currentChapter.id);
    const container = document.getElementById('chapterComments');

    if (comments.length === 0) {
        container.innerHTML = '<p class="text-secondary text-center p-6">Chưa có bình luận nào</p>';
        return;
    }

    container.innerHTML = comments.map(comment => `
    <div class="comment-card">
      <div class="comment-header">
        <img src="${comment.userAvatar || './assets/avatars/default.jpg'}" alt="" class="comment-avatar">
        <div class="comment-user-info">
          <div class="comment-username">${comment.username || 'Anonymous'}</div>
          <div class="comment-meta">${DateUtils.getRelativeTime(comment.timestamp)}</div>
        </div>
      </div>
      <div class="comment-text">${comment.text}</div>
      <div class="comment-actions">
        <span class="comment-action">👍 ${comment.likes || 0}</span>
        <span class="comment-action">💬 Trả lời</span>
      </div>
    </div>
  `).join('');
}

/**
 * Submit comment
 */
async function submitComment() {
    const input = document.getElementById('commentInput');
    const text = input.value.trim();

    if (!text) {
        showToast('Vui lòng nhập bình luận', 'error');
        return;
    }

    const user = UserSession.getUser();
    if (!user) {
        showToast('Vui lòng đăng nhập để bình luận', 'error');
        return;
    }

    // Create comment (in real app, this would be sent to backend)
    const comment = {
        id: generateId(),
        userId: user.id,
        username: user.username,
        userAvatar: user.avatar,
        bookId: currentBook.id,
        chapterId: currentChapter.id,
        text: text,
        likes: 0,
        replies: [],
        timestamp: new Date().toISOString()
    };

    showToast('Bình luận đã được gửi!', 'success');
    input.value = '';

    // Reload comments
    await loadChapterComments();
}

/**
 * Submit rating
 */
async function submitRating() {
    const ratingStars = document.querySelectorAll('#ratingStars .star');
    let rating = 0;

    ratingStars.forEach((star, index) => {
        if (star.classList.contains('filled')) {
            rating = index + 1;
        }
    });

    if (rating === 0) {
        showToast('Vui lòng chọn số sao', 'error');
        return;
    }

    // Save rating (in real app, this would be sent to backend)
    LocalStorage.set(`rating_${currentBook.id}`, rating);

    document.getElementById('ratingForm').style.display = 'none';
    document.getElementById('ratingThanks').style.display = 'block';

    showToast('Cảm ơn bạn đã đánh giá!', 'success');
}

/**
 * Show error message
 */
function showError(message) {
    document.getElementById('loadingState').innerHTML = `
    <div style="text-align: center; padding: var(--space-16);">
      <p class="text-2xl mb-4">❌</p>
      <p class="text-lg text-secondary mb-6">${message}</p>
      <button class="btn btn-primary" onclick="window.location.href='./index.html'">
        Về trang chủ
      </button>
    </div>
  `;
}

// Export functions for HTML onclick handlers
if (typeof window !== 'undefined') {
    window.goToPrevChapter = goToPrevChapter;
    window.goToNextChapter = goToNextChapter;
    window.goToBookDetail = goToBookDetail;
    window.submitComment = submitComment;
    window.submitRating = submitRating;
}
