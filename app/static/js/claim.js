/**
 * Food Rescue - Claim Page JavaScript
 * Enhanced functionality for the claim page
 */

class ClaimPage {
  constructor() {
    this.initializeEventListeners();
    this.initializeFormValidation();
    this.initializeAnimations();
  }

  initializeEventListeners() {
    // Form submission handling
    const claimForm = document.getElementById("claimForm");
    if (claimForm) {
      claimForm.addEventListener("submit", this.handleFormSubmit.bind(this));
    }

    // Checkbox validation
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", this.validateForm.bind(this));
    });

    // Card hover effects
    this.initializeCardHoverEffects();

    // Smooth scrolling
    this.initializeSmoothScrolling();
  }

  initializeFormValidation() {
    this.validateForm();
  }

  validateForm() {
    const checkboxes = document.querySelectorAll(
      'input[type="checkbox"][required]'
    );
    const claimBtn = document.getElementById("claimBtn");

    if (!claimBtn) return;

    const allChecked = Array.from(checkboxes).every(
      (checkbox) => checkbox.checked
    );

    claimBtn.disabled = !allChecked;

    if (allChecked) {
      claimBtn.classList.remove("btn-secondary");
      claimBtn.classList.add("btn-success");
      claimBtn.style.cursor = "pointer";
    } else {
      claimBtn.classList.remove("btn-success");
      claimBtn.classList.add("btn-secondary");
      claimBtn.style.cursor = "not-allowed";
    }
  }

  handleFormSubmit(e) {
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;

    // Show loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loading"></span> Processing Claim...';

    // Add visual feedback
    submitBtn.classList.add("btn-loading");

    // Re-enable button after timeout (in case of errors)
    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
      submitBtn.classList.remove("btn-loading");
    }, 10000);
  }

  initializeCardHoverEffects() {
    const cards = document.querySelectorAll(".card");
    cards.forEach((card) => {
      card.addEventListener("mouseenter", function () {
        this.style.transform = "translateY(-3px)";
        this.style.boxShadow = "0 20px 40px rgba(0, 0, 0, 0.15)";
      });

      card.addEventListener("mouseleave", function () {
        this.style.transform = "translateY(0)";
        this.style.boxShadow = "";
      });
    });
  }

  initializeSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute("href"));
        if (target) {
          target.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      });
    });
  }

  initializeAnimations() {
    // Animate cards on scroll
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-in");
        }
      });
    }, observerOptions);

    document.querySelectorAll(".card").forEach((card) => {
      observer.observe(card);
    });
  }

  // Utility methods
  static showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.className = `alert alert-${type} notification`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 5000);
  }

  static formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  static copyToClipboard(text) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        ClaimPage.showNotification("Copied to clipboard!", "success");
      })
      .catch(() => {
        ClaimPage.showNotification("Failed to copy to clipboard", "error");
      });
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  new ClaimPage();
});

// Add additional styles for animations
const additionalStyles = `
  .animate-in {
    animation: slideInUp 0.6s ease-out;
  }

  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .btn-loading {
    position: relative;
    overflow: hidden;
  }

  .btn-loading::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    animation: loading-shimmer 2s infinite;
  }

  @keyframes loading-shimmer {
    0% { left: -100%; }
    100% { left: 100%; }
  }

  .notification {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1000;
    max-width: 300px;
    animation: slideInRight 0.3s ease-out;
  }

  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(100%);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .card {
    transition: all 0.3s ease;
    opacity: 0;
    transform: translateY(20px);
  }

  .card.animate-in {
    opacity: 1;
    transform: translateY(0);
  }

  /* Loading spinner styles */
  .loading {
    display: inline-block;
    width: 1rem;
    height: 1rem;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: spin 1s ease-in-out infinite;
    margin-right: 0.5rem;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* Improved accessibility */
  .btn:focus-visible {
    outline: 2px solid var(--primary-green);
    outline-offset: 2px;
  }

  .form-check-input:focus-visible {
    outline: 2px solid var(--primary-green);
    outline-offset: 2px;
  }

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    .card {
      border: 2px solid #000;
    }
    
    .btn {
      border: 2px solid #000;
    }
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
`;

// Inject additional styles
const styleSheet = document.createElement("style");
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);
