/* ========================================
   DATA MANAGER
   Handle data loading, caching, and storage
   ======================================== */

class DataManager {
    constructor() {
        this.cache = {
            books: null,
            chapters: null,
            comments: null,
            users: null
        };
        this.basePath = './data/';
    }

    /**
     * Fetch JSON data from file
     * @param {string} filename - JSON filename
     * @returns {Promise<any>} Parsed JSON data
     */
    async fetchData(filename) {
        try {
            const response = await fetch(`${this.basePath}${filename}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error fetching ${filename}:`, error);
            return null;
        }
    }

    /**
     * Get all books
     * @param {boolean} forceRefresh - Force refresh from source
     * @returns {Promise<Array>} Books array
     */
    async getBooks(forceRefresh = false) {
        if (!forceRefresh && this.cache.books) {
            return this.cache.books;
        }

        const books = await this.fetchData('books.json');
        if (books) {
            this.cache.books = books;
        }
        return books || [];
    }

    /**
     * Get book by ID
     * @param {string} bookId - Book ID
     * @returns {Promise<Object|null>} Book object
     */
    async getBookById(bookId) {
        const books = await this.getBooks();
        return books.find(book => book.id === bookId) || null;
    }

    /**
     * Get all chapters
     * @param {boolean} forceRefresh - Force refresh from source
     * @returns {Promise<Array>} Chapters array
     */
    async getChapters(forceRefresh = false) {
        if (!forceRefresh && this.cache.chapters) {
            return this.cache.chapters;
        }

        const chapters = await this.fetchData('chapters.json');
        if (chapters) {
            this.cache.chapters = chapters;
        }
        return chapters || [];
    }

    /**
     * Get chapters for a specific book
     * @param {string} bookId - Book ID
     * @returns {Promise<Array>} Chapters array
     */
    async getBookChapters(bookId) {
        const chapters = await this.getChapters();
        return chapters.filter(chapter => chapter.bookId === bookId)
            .sort((a, b) => a.chapterNum - b.chapterNum);
    }

    /**
     * Get chapter by ID
     * @param {string} chapterId - Chapter ID
     * @returns {Promise<Object|null>} Chapter object
     */
    async getChapterById(chapterId) {
        const chapters = await this.getChapters();
        return chapters.find(chapter => chapter.id === chapterId) || null;
    }

    /**
     * Get all comments
     * @param {boolean} forceRefresh - Force refresh from source
     * @returns {Promise<Array>} Comments array
     */
    async getComments(forceRefresh = false) {
        if (!forceRefresh && this.cache.comments) {
            return this.cache.comments;
        }

        const comments = await this.fetchData('comments.json');
        if (comments) {
            this.cache.comments = comments;
        }
        return comments || [];
    }

    /**
     * Get comments for a specific chapter
     * @param {string} chapterId - Chapter ID
     * @returns {Promise<Array>} Comments array
     */
    async getChapterComments(chapterId) {
        const comments = await this.getComments();
        return comments.filter(comment => comment.chapterId === chapterId)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    /**
     * Get all comments for a book (from all chapters)
     * @param {string} bookId - Book ID
     * @returns {Promise<Array>} Comments array with chapter info
     */
    async getBookComments(bookId) {
        const comments = await this.getComments();
        const chapters = await this.getChapters();

        const bookChapterIds = chapters
            .filter(ch => ch.bookId === bookId)
            .map(ch => ch.id);

        return comments
            .filter(comment => bookChapterIds.includes(comment.chapterId))
            .map(comment => {
                const chapter = chapters.find(ch => ch.id === comment.chapterId);
                return {
                    ...comment,
                    chapterNumber: chapter ? chapter.chapterNum : 0,
                    chapterTitle: chapter ? chapter.title : ''
                };
            })
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    /**
     * Get users
     * @param {boolean} forceRefresh - Force refresh from source
     * @returns {Promise<Array>} Users array
     */
    async getUsers(forceRefresh = false) {
        if (!forceRefresh && this.cache.users) {
            return this.cache.users;
        }

        const users = await this.fetchData('users.json');
        if (users) {
            this.cache.users = users;
        }
        return users || [];
    }

    /**
     * Get user by ID
     * @param {string} userId - User ID
     * @returns {Promise<Object|null>} User object
     */
    async getUserById(userId) {
        const users = await this.getUsers();
        return users.find(user => user.id === userId) || null;
    }

    /**
     * Search books
     * @param {string} query - Search query
     * @returns {Promise<Array>} Matching books
     */
    async searchBooks(query) {
        const books = await this.getBooks();
        const lowerQuery = query.toLowerCase();

        return books.filter(book =>
            book.title.toLowerCase().includes(lowerQuery) ||
            book.author.toLowerCase().includes(lowerQuery) ||
            book.description.toLowerCase().includes(lowerQuery) ||
            book.genres.some(genre => genre.toLowerCase().includes(lowerQuery))
        );
    }

    /**
     * Filter books by genre
     * @param {string} genre - Genre name
     * @returns {Promise<Array>} Filtered books
     */
    async filterByGenre(genre) {
        const books = await this.getBooks();
        return books.filter(book => book.genres.includes(genre));
    }

    /**
     * Filter books by status
     * @param {string} status - Status (completed, ongoing)
     * @returns {Promise<Array>} Filtered books
     */
    async filterByStatus(status) {
        const books = await this.getBooks();
        return books.filter(book => book.status === status);
    }

    /**
     * Sort books
     * @param {Array} books - Books array
     * @param {string} sortBy - Sort criteria (newest, rating, views)
     * @returns {Array} Sorted books
     */
    sortBooks(books, sortBy) {
        const sorted = [...books];

        switch (sortBy) {
            case 'newest':
                return sorted.sort((a, b) =>
                    new Date(b.dateAdded) - new Date(a.dateAdded)
                );
            case 'rating':
                return sorted.sort((a, b) => b.avgRating - a.avgRating);
            case 'views':
                return sorted.sort((a, b) => b.views - a.views);
            default:
                return sorted;
        }
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.cache = {
            books: null,
            chapters: null,
            comments: null,
            users: null
        };
    }
}

// LocalStorage utilities
const LocalStorage = {
    /**
     * Get item from localStorage
     * @param {string} key - Storage key
     * @param {any} defaultValue - Default value if not found
     * @returns {any} Stored value
     */
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.warn(`Error reading from localStorage (${key}):`, e);
            return defaultValue;
        }
    },

    /**
     * Set item in localStorage
     * @param {string} key - Storage key
     * @param {any} value - Value to store
     * @returns {boolean} Success status
     */
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.warn(`Error writing to localStorage (${key}):`, e);
            return false;
        }
    },

    /**
     * Remove item from localStorage
     * @param {string} key - Storage key
     */
    remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.warn(`Error removing from localStorage (${key}):`, e);
        }
    },

    /**
     * Clear all localStorage
     */
    clear() {
        try {
            localStorage.clear();
        } catch (e) {
            console.warn('Error clearing localStorage:', e);
        }
    },

    /**
     * Check if key exists
     * @param {string} key - Storage key
     * @returns {boolean} Exists
     */
    has(key) {
        return localStorage.getItem(key) !== null;
    }
};

// Reading progress utilities
const ReadingProgress = {
    /**
     * Save reading position
     * @param {string} bookId - Book ID
     * @param {string} chapterId - Chapter ID
     * @param {number} scrollPosition - Scroll position
     */
    savePosition(bookId, chapterId, scrollPosition) {
        const key = `reading_${bookId}`;
        LocalStorage.set(key, {
            chapterId,
            scrollPosition,
            timestamp: new Date().toISOString()
        });
    },

    /**
     * Get reading position
     * @param {string} bookId - Book ID
     * @returns {Object|null} Reading position
     */
    getPosition(bookId) {
        const key = `reading_${bookId}`;
        return LocalStorage.get(key);
    },

    /**
     * Mark chapter as read
     * @param {string} bookId - Book ID
     * @param {string} chapterId - Chapter ID
     */
    markChapterRead(bookId, chapterId) {
        const key = `read_chapters_${bookId}`;
        const readChapters = LocalStorage.get(key, []);
        if (!readChapters.includes(chapterId)) {
            readChapters.push(chapterId);
            LocalStorage.set(key, readChapters);
        }
    },

    /**
     * Check if chapter is read
     * @param {string} bookId - Book ID
     * @param {string} chapterId - Chapter ID
     * @returns {boolean} Is read
     */
    isChapterRead(bookId, chapterId) {
        const key = `read_chapters_${bookId}`;
        const readChapters = LocalStorage.get(key, []);
        return readChapters.includes(chapterId);
    },

    /**
     * Get all read chapters for a book
     * @param {string} bookId - Book ID
     * @returns {Array} Read chapter IDs
     */
    getReadChapters(bookId) {
        const key = `read_chapters_${bookId}`;
        return LocalStorage.get(key, []);
    }
};

// User session utilities
const UserSession = {
    /**
     * Set current user
     * @param {Object} user - User object
     */
    setUser(user) {
        LocalStorage.set('currentUser', user);
    },

    /**
     * Get current user
     * @returns {Object|null} User object
     */
    getUser() {
        return LocalStorage.get('currentUser');
    },

    /**
     * Check if user is logged in
     * @returns {boolean} Is logged in
     */
    isLoggedIn() {
        return this.getUser() !== null;
    },

    /**
     * Logout user
     */
    logout() {
        LocalStorage.remove('currentUser');
    },

    /**
     * Check if user is admin
     * @returns {boolean} Is admin
     */
    isAdmin() {
        const user = this.getUser();
        return user && user.role === 'admin';
    }
};

// Create global instance
const dataManager = new DataManager();

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        DataManager,
        LocalStorage,
        ReadingProgress,
        UserSession,
        dataManager
    };
}
