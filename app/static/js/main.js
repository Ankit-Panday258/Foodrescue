// ===== FOOD RESCUE APP - MAIN JAVASCRIPT =====

/**
 * Main JavaScript file for Food Rescue application
 * Handles UI interactions, form validation, search, and other dynamic features
 */

// ===== APPLICATION NAMESPACE =====
const FoodRescue = {
    // Configuration
    config: {
        apiDelay: 300,
        animationSpeed: 300,
        searchMinLength: 2,
        toastDuration: 5000,
        imageLoadTimeout: 10000
    },

    // State management
    state: {
        isSearching: false,
        currentUser: null,
        filters: {},
        searchQuery: '',
        isLoading: false
    },

    // Initialize the application
    init() {
        this.setupEventListeners();
        this.initializeComponents();
        this.setupNavbarEffects();
        this.initializeSearch();
        this.setupFormValidation();
        this.initializeLazyLoading();
        this.setupAnimations();
        this.checkAuthStatus();
    },

    // ===== EVENT LISTENERS =====
    setupEventListeners() {
        // DOM Content Loaded
        document.addEventListener('DOMContentLoaded', () => {
            this.init();
        });

        // Window resize
        window.addEventListener('resize', this.utils.debounce(() => {
            this.handleResize();
        }, 250));

        // Window scroll
        window.addEventListener('scroll', this.utils.throttle(() => {
            this.handleScroll();
        }, 16));

        // Form submissions
        document.addEventListener('submit', (e) => {
            if (e.target.classList.contains('needs-validation')) {
                this.handleFormSubmit(e);
            }
        });

        // Search inputs
        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('search-input')) {
                this.handleSearchInput(e);
            }
        });

        // Filter changes
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('filter-control')) {
                this.handleFilterChange(e);
            }
        });

        // Button clicks
        document.addEventListener('click', (e) => {
            this.handleButtonClick(e);
        });
    },

    // ===== NAVBAR EFFECTS =====
    setupNavbarEffects() {
        const navbar = document.querySelector('.navbar');
        if (!navbar) return;

        let lastScrollY = window.scrollY;
        let ticking = false;

        const updateNavbar = () => {
            const scrollY = window.scrollY;

            // Add scrolled class for styling
            if (scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }

            // Hide/show navbar on scroll
            if (scrollY > lastScrollY && scrollY > 100) {
                navbar.classList.add('navbar-scroll-hidden');
            } else {
                navbar.classList.remove('navbar-scroll-hidden');
            }

            lastScrollY = scrollY;
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateNavbar);
                ticking = true;
            }
        });
    },

    // ===== SEARCH FUNCTIONALITY =====
    initializeSearch() {
        const searchInputs = document.querySelectorAll('.search-input');

        searchInputs.forEach(input => {
            const container = input.closest('.search-container');
            const suggestionsContainer = container?.querySelector('.search-suggestions');

            if (suggestionsContainer) {
                this.setupSearchSuggestions(input, suggestionsContainer);
            }
        });
    },

    setupSearchSuggestions(input, container) {
        let searchTimeout;

        input.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            const query = e.target.value.trim();

            if (query.length < this.config.searchMinLength) {
                this.hideSearchSuggestions(container);
                return;
            }

            searchTimeout = setTimeout(() => {
                this.fetchSearchSuggestions(query, container);
            }, this.config.apiDelay);
        });

        input.addEventListener('blur', () => {
            setTimeout(() => {
                this.hideSearchSuggestions(container);
            }, 150);
        });

        input.addEventListener('focus', () => {
            if (input.value.trim().length >= this.config.searchMinLength) {
                this.showSearchSuggestions(container);
            }
        });
    },

    async fetchSearchSuggestions(query, container) {
        try {
            this.state.isSearching = true;
            this.showLoadingSpinner(container);

            // Simulate API call - replace with actual endpoint
            await this.utils.delay(300);

            const suggestions = [
                { text: `Search for "${query}"`, type: 'search' },
                { text: 'Fresh vegetables', type: 'category' },
                { text: 'Bread and pastries', type: 'category' },
                { text: 'Fruits', type: 'category' }
            ];

            this.displaySearchSuggestions(suggestions, container);
        } catch (error) {
            console.error('Search suggestions error:', error);
            this.hideSearchSuggestions(container);
        } finally {
            this.state.isSearching = false;
        }
    },

    displaySearchSuggestions(suggestions, container) {
        const html = suggestions.map(suggestion =>
            `<div class="search-suggestion" data-type="${suggestion.type}">
                <i class="fas fa-${suggestion.type === 'search' ? 'search' : 'tag'}"></i>
                ${suggestion.text}
            </div>`
        ).join('');

        container.innerHTML = html;
        this.showSearchSuggestions(container);

        // Add click handlers
        container.querySelectorAll('.search-suggestion').forEach(item => {
            item.addEventListener('click', () => {
                const input = container.parentElement.querySelector('.search-input');
                input.value = item.textContent.trim();
                this.hideSearchSuggestions(container);
                input.form?.submit();
            });
        });
    },

    showSearchSuggestions(container) {
        container.style.display = 'block';
        container.classList.add('fade-in');
    },

    hideSearchSuggestions(container) {
        container.style.display = 'none';
        container.classList.remove('fade-in');
    },

    showLoadingSpinner(container) {
        container.innerHTML = '<div class="loading-spinner"></div>';
        this.showSearchSuggestions(container);
    },

    // ===== FORM VALIDATION =====
    setupFormValidation() {
        const forms = document.querySelectorAll('.needs-validation');

        forms.forEach(form => {
            this.initializeFormValidation(form);
        });
    },

    initializeFormValidation(form) {
        const inputs = form.querySelectorAll('input, select, textarea');

        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });

            input.addEventListener('input', () => {
                if (input.classList.contains('is-invalid')) {
                    this.validateField(input);
                }
            });
        });
    },

    validateField(field) {
        const value = field.value.trim();
        const type = field.type;
        const required = field.required;
        let isValid = true;
        let errorMessage = '';

        // Required field validation
        if (required && !value) {
            isValid = false;
            errorMessage = 'This field is required';
        }

        // Email validation
        if (type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address';
            }
        }

        // Phone validation
        if (field.name === 'phone' && value) {
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
                isValid = false;
                errorMessage = 'Please enter a valid phone number';
            }
        }

        // Password validation
        if (type === 'password' && value) {
            if (value.length < 6) {
                isValid = false;
                errorMessage = 'Password must be at least 6 characters long';
            }
        }

        // Password confirmation
        if (field.name === 'confirm_password' && value) {
            const passwordField = field.form.querySelector('input[name="password"]');
            if (passwordField && value !== passwordField.value) {
                isValid = false;
                errorMessage = 'Passwords do not match';
            }
        }

        // Date validation
        if (type === 'date' && value) {
            const selectedDate = new Date(value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (selectedDate < today) {
                isValid = false;
                errorMessage = 'Date cannot be in the past';
            }
        }

        this.updateFieldValidation(field, isValid, errorMessage);
        return isValid;
    },

    updateFieldValidation(field, isValid, errorMessage) {
        field.classList.remove('is-valid', 'is-invalid');

        let feedbackElement = field.nextElementSibling;
        if (feedbackElement && feedbackElement.classList.contains('invalid-feedback')) {
            feedbackElement.remove();
        }

        if (isValid) {
            field.classList.add('is-valid');
        } else {
            field.classList.add('is-invalid');

            const feedback = document.createElement('div');
            feedback.className = 'invalid-feedback';
            feedback.textContent = errorMessage;
            field.parentNode.insertBefore(feedback, field.nextSibling);
        }
    },

    handleFormSubmit(e) {
        e.preventDefault();

        const form = e.target;
        const inputs = form.querySelectorAll('input, select, textarea');
        let isFormValid = true;

        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isFormValid = false;
            }
        });

        if (isFormValid) {
            this.showLoadingButton(form.querySelector('button[type="submit"]'));
            form.submit();
        } else {
            this.showToast('Please fix the errors in the form', 'error');
        }
    },

    // ===== FILTER FUNCTIONALITY =====
    handleFilterChange(e) {
        const filterName = e.target.name;
        const filterValue = e.target.value;

        this.state.filters[filterName] = filterValue;
        this.applyFilters();
    },

    applyFilters() {
        const listings = document.querySelectorAll('.food-listing-card');
        const activeFilters = Object.entries(this.state.filters)
            .filter(([key, value]) => value && value !== 'all');

        listings.forEach(listing => {
            let shouldShow = true;

            activeFilters.forEach(([filterName, filterValue]) => {
                const listingValue = listing.dataset[filterName];
                if (listingValue && listingValue !== filterValue) {
                    shouldShow = false;
                }
            });

            if (shouldShow) {
                listing.style.display = 'block';
                listing.classList.add('fade-in');
            } else {
                listing.style.display = 'none';
                listing.classList.remove('fade-in');
            }
        });

        this.updateFilterResults();
    },

    updateFilterResults() {
        const visibleListings = document.querySelectorAll('.food-listing-card[style*="block"]');
        const resultsCount = document.querySelector('.results-count');

        if (resultsCount) {
            resultsCount.textContent = `${visibleListings.length} items found`;
        }
    },

    clearFilters() {
        this.state.filters = {};

        // Reset filter controls
        document.querySelectorAll('.filter-control').forEach(control => {
            control.value = '';
        });

        // Show all listings
        document.querySelectorAll('.food-listing-card').forEach(listing => {
            listing.style.display = 'block';
            listing.classList.add('fade-in');
        });

        this.updateFilterResults();
    },

    // ===== BUTTON HANDLERS =====
    handleButtonClick(e) {
        const button = e.target.closest('button');
        if (!button) return;

        // Handle different button types
        if (button.classList.contains('btn-claim')) {
            this.handleClaimButton(button);
        } else if (button.classList.contains('btn-favorite')) {
            this.handleFavoriteButton(button);
        } else if (button.classList.contains('btn-share')) {
            this.handleShareButton(button);
        } else if (button.classList.contains('filter-clear')) {
            this.clearFilters();
        }
    },

    handleClaimButton(button) {
        const listingId = button.dataset.listingId;
        if (!listingId) return;

        if (!this.state.currentUser) {
            this.showToast('Please login to claim this item', 'warning');
            return;
        }

        this.showLoadingButton(button);

        // Redirect to claim page
        window.location.href = `/claim-now/${listingId}`;
    },

    handleFavoriteButton(button) {
        const isFavorited = button.classList.contains('favorited');

        if (isFavorited) {
            button.classList.remove('favorited');
            button.innerHTML = '<i class="far fa-heart"></i> Favorite';
        } else {
            button.classList.add('favorited');
            button.innerHTML = '<i class="fas fa-heart"></i> Favorited';
        }

        this.showToast(
            isFavorited ? 'Removed from favorites' : 'Added to favorites',
            'success'
        );
    },

    handleShareButton(button) {
        const url = window.location.href;
        const title = document.title;

        if (navigator.share) {
            navigator.share({
                title: title,
                url: url
            });
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(url).then(() => {
                this.showToast('Link copied to clipboard', 'success');
            });
        }
    },

    // ===== LAZY LOADING =====
    initializeLazyLoading() {
        const images = document.querySelectorAll('img[data-src]');

        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.loadImage(entry.target);
                        imageObserver.unobserve(entry.target);
                    }
                });
            });

            images.forEach(img => imageObserver.observe(img));
        } else {
            // Fallback for older browsers
            images.forEach(img => this.loadImage(img));
        }
    },

    loadImage(img) {
        const src = img.dataset.src;
        if (!src) return;

        const imageLoader = new Image();

        imageLoader.onload = () => {
            img.src = src;
            img.classList.add('loaded');
            img.removeAttribute('data-src');
        };

        imageLoader.onerror = () => {
            img.src = '/static/img/placeholder.jpg';
            img.classList.add('error');
        };

        imageLoader.src = src;
    },

    // ===== ANIMATIONS =====
    setupAnimations() {
        // Fade in elements on scroll
        const animateElements = document.querySelectorAll('.animate-on-scroll');

        if ('IntersectionObserver' in window) {
            const animationObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('fade-in');
                        animationObserver.unobserve(entry.target);
                    }
                });
            });

            animateElements.forEach(el => animationObserver.observe(el));
        }
    },

    // ===== TOAST NOTIFICATIONS =====
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `alert alert-${type} alert-dismissible fade show`;
        toast.innerHTML = `
            <i class="fas fa-${this.getToastIcon(type)}"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        const container = document.querySelector('.flash-messages') || this.createToastContainer();
        container.appendChild(toast);

        // Auto remove after duration
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, this.config.toastDuration);
    },

    getToastIcon(type) {
        const icons = {
            'success': 'check-circle',
            'error': 'exclamation-triangle',
            'warning': 'exclamation-triangle',
            'info': 'info-circle'
        };
        return icons[type] || 'info-circle';
    },

    createToastContainer() {
        const container = document.createElement('div');
        container.className = 'flash-messages';
        document.body.appendChild(container);
        return container;
    },

    // ===== LOADING STATES =====
    showLoadingButton(button) {
        if (!button) return;

        const originalText = button.textContent;
        button.dataset.originalText = originalText;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
        button.disabled = true;
    },

    hideLoadingButton(button) {
        if (!button) return;

        const originalText = button.dataset.originalText || 'Submit';
        button.textContent = originalText;
        button.disabled = false;
        delete button.dataset.originalText;
    },

    // ===== AUTH STATUS =====
    async checkAuthStatus() {
        try {
            const response = await fetch('/check-auth');
            const data = await response.json();

            if (data.authenticated) {
                this.state.currentUser = data.user;
                this.updateAuthUI(true);
            } else {
                this.state.currentUser = null;
                this.updateAuthUI(false);
            }
        } catch (error) {
            console.error('Auth check error:', error);
        }
    },

    updateAuthUI(isAuthenticated) {
        const authElements = document.querySelectorAll('[data-auth-required]');
        const guestElements = document.querySelectorAll('[data-guest-only]');

        authElements.forEach(el => {
            el.style.display = isAuthenticated ? 'block' : 'none';
        });

        guestElements.forEach(el => {
            el.style.display = isAuthenticated ? 'none' : 'block';
        });

        if (isAuthenticated && this.state.currentUser) {
            this.updateUserInfo(this.state.currentUser);
        }
    },

    updateUserInfo(user) {
        const userNameElements = document.querySelectorAll('[data-user-name]');
        const userTypeElements = document.querySelectorAll('[data-user-type]');

        userNameElements.forEach(el => {
            el.textContent = user.username;
        });

        userTypeElements.forEach(el => {
            el.textContent = user.type;
        });
    },

    // ===== EVENT HANDLERS =====
    handleResize() {
        // Handle responsive behavior
        this.updateLayoutOnResize();
    },

    handleScroll() {
        // Handle scroll effects
        this.updateScrollEffects();
    },

    updateLayoutOnResize() {
        const isMobile = window.innerWidth < 768;
        document.body.classList.toggle('mobile-view', isMobile);
    },

    updateScrollEffects() {
        const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
        const progressBar = document.querySelector('.scroll-progress');

        if (progressBar) {
            progressBar.style.width = `${scrollPercent}%`;
        }
    },

    // ===== UTILITY FUNCTIONS =====
    utils: {
        debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },

        throttle(func, limit) {
            let inThrottle;
            return function() {
                const args = arguments;
                const context = this;
                if (!inThrottle) {
                    func.apply(context, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        },

        delay(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        },

        formatDate(date) {
            return new Date(date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        },

        formatTime(date) {
            return new Date(date).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });
        },

        formatRelativeTime(date) {
            const now = new Date();
            const diff = now - new Date(date);
            const seconds = Math.floor(diff / 1000);
            const minutes = Math.floor(seconds / 60);
            const hours = Math.floor(minutes / 60);
            const days = Math.floor(hours / 24);

            if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
            if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
            if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
            return 'Just now';
        },

        sanitizeHTML(str) {
            const div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
        }
    }
};

// ===== INITIALIZE APPLICATION =====
FoodRescue.init();

// ===== GLOBAL FUNCTIONS =====
window.FoodRescue = FoodRescue;

// Expose commonly used functions globally
window.showToast = FoodRescue.showToast.bind(FoodRescue);
window.showLoadingButton = FoodRescue.showLoadingButton.bind(FoodRescue);
window.hideLoadingButton = FoodRescue.hideLoadingButton.bind(FoodRescue);
