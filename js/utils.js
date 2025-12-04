/* ========================================
   UTILITY FUNCTIONS
   Helper functions for common operations
   ======================================== */

/**
 * Date formatting utilities
 */
const DateUtils = {
  /**
   * Format date to Vietnamese locale
   * @param {string|Date} date - Date to format
   * @returns {string} Formatted date string
   */
  formatVietnamese(date) {
    const d = new Date(date);
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return d.toLocaleDateString('vi-VN', options);
  },

  /**
   * Get relative time (e.g., "2 giờ trước")
   * @param {string|Date} date - Date to format
   * @returns {string} Relative time string
   */
  getRelativeTime(date) {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now - then;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 7) {
      return this.formatVietnamese(date);
    } else if (diffDays > 0) {
      return `${diffDays} ngày trước`;
    } else if (diffHours > 0) {
      return `${diffHours} giờ trước`;
    } else if (diffMin > 0) {
      return `${diffMin} phút trước`;
    } else {
      return 'Vừa xong';
    }
  },

  /**
   * Format date as simple string (dd/mm/yyyy)
   * @param {string|Date} date - Date to format
   * @returns {string} Formatted date
   */
  formatSimple(date) {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }
};

/**
 * String utilities
 */
const StringUtils = {
  /**
   * Truncate string with ellipsis
   * @param {string} str - String to truncate
   * @param {number} maxLength - Maximum length
   * @returns {string} Truncated string
   */
  truncate(str, maxLength = 100) {
    if (!str || str.length <= maxLength) return str;
    return str.substring(0, maxLength).trim() + '...';
  },

  /**
   * Generate slug from string
   * @param {string} str - String to convert
   * @returns {string} URL-friendly slug
   */
  slugify(str) {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  },

  /**
   * Capitalize first letter
   * @param {string} str - String to capitalize
   * @returns {string} Capitalized string
   */
  capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  },

  /**
   * Remove HTML tags
   * @param {string} html - HTML string
   * @returns {string} Plain text
   */
  stripHtml(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }
};

/**
 * URL parameter utilities
 */
const URLUtils = {
  /**
   * Get URL parameter value
   * @param {string} param - Parameter name
   * @returns {string|null} Parameter value
   */
  getParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  },

  /**
   * Get all URL parameters as object
   * @returns {Object} Parameters object
   */
  getAllParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const params = {};
    for (const [key, value] of urlParams) {
      params[key] = value;
    }
    return params;
  },

  /**
   * Set URL parameter without reload
   * @param {string} param - Parameter name
   * @param {string} value - Parameter value
   */
  setParam(param, value) {
    const url = new URL(window.location);
    url.searchParams.set(param, value);
    window.history.pushState({}, '', url);
  },

  /**
   * Remove URL parameter
   * @param {string} param - Parameter name
   */
  removeParam(param) {
    const url = new URL(window.location);
    url.searchParams.delete(param);
    window.history.pushState({}, '', url);
  }
};

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in ms
 * @returns {Function} Throttled function
 */
function throttle(func, limit = 300) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Generate unique ID
 * @returns {string} Unique ID
 */
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Simple Markdown to HTML converter
 * @param {string} markdown - Markdown text
 * @returns {string} HTML
 */
function markdownToHtml(markdown) {
  if (!markdown) return '';
  
  let html = markdown;
  
  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  
  // Bold
  html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
  
  // Italic
  html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
  
  // Links
  html = html.replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2">$1</a>');
  
  // Line breaks
  html = html.replace(/\n/gim, '<br>');
  
  return html;
}

/**
 * Sanitize HTML to prevent XSS
 * @param {string} html - HTML to sanitize
 * @returns {string} Sanitized HTML
 */
function sanitizeHtml(html) {
  const temp = document.createElement('div');
  temp.textContent = html;
  return temp.innerHTML;
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
}

/**
 * Check if element is in viewport
 * @param {HTMLElement} element - Element to check
 * @returns {boolean} Is in viewport
 */
function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Smooth scroll to element
 * @param {string|HTMLElement} target - Target element or selector
 * @param {number} offset - Offset in pixels
 */
function scrollToElement(target, offset = 0) {
  const element = typeof target === 'string' 
    ? document.querySelector(target) 
    : target;
  
  if (!element) return;
  
  const elementPosition = element.getBoundingClientRect().top;
  const offsetPosition = elementPosition + window.pageYOffset - offset;
  
  window.scrollTo({
    top: offsetPosition,
    behavior: 'smooth'
  });
}

/**
 * Format number with thousands separator
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid
 */
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Parse HTML string to DOM
 * @param {string} htmlString - HTML string
 * @returns {DocumentFragment} DOM fragment
 */
function parseHTML(htmlString) {
  const template = document.createElement('template');
  template.innerHTML = htmlString.trim();
  return template.content;
}

/**
 * Get reading time estimate
 * @param {string} text - Text content
 * @param {number} wordsPerMinute - Reading speed
 * @returns {number} Minutes to read
 */
function getReadingTime(text, wordsPerMinute = 200) {
  const words = text.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

/**
 * Format reading time
 * @param {number} minutes - Minutes
 * @returns {string} Formatted time
 */
function formatReadingTime(minutes) {
  if (minutes < 1) return 'Chưa đầy 1 phút';
  if (minutes === 1) return '1 phút';
  return `${minutes} phút`;
}

/**
 * Show toast notification
 * @param {string} message - Message to show
 * @param {string} type - Type (success, error, info)
 * @param {number} duration - Duration in ms
 */
function showToast(message, type = 'info', duration = 3000) {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type} animate-slide-down`;
  toast.textContent = message;
  
  toast.style.cssText = `
    position: fixed;
    top: calc(var(--header-height) + var(--space-4));
    right: var(--space-4);
    padding: var(--space-4) var(--space-6);
    background-color: var(--bg-primary);
    color: var(--text-primary);
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow-xl);
    z-index: 9999;
    max-width: 400px;
    border-left: 4px solid var(--accent-primary);
  `;
  
  if (type === 'success') {
    toast.style.borderLeftColor = 'var(--accent-success)';
  } else if (type === 'error') {
    toast.style.borderLeftColor = 'var(--accent-danger)';
  }
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-20px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/**
 * Confirm dialog
 * @param {string} message - Confirmation message
 * @returns {Promise<boolean>} User choice
 */
function confirmDialog(message) {
  return new Promise((resolve) => {
    const result = window.confirm(message);
    resolve(result);
  });
}

// Export utilities
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    DateUtils,
    StringUtils,
    URLUtils,
    debounce,
    throttle,
    generateId,
    markdownToHtml,
    sanitizeHtml,
    copyToClipboard,
    isInViewport,
    scrollToElement,
    formatNumber,
    isValidEmail,
    parseHTML,
    getReadingTime,
    formatReadingTime,
    showToast,
    confirmDialog
  };
}
