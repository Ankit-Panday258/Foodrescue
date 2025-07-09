// Food Rescue Listing - Enhanced User Experience

document.addEventListener("DOMContentLoaded", function () {
  initializeListingFeatures();
});

function initializeListingFeatures() {
  initializeViewToggle();
  initializeScrollAnimations();
  initializeLiveSearch();
  initializeFilterToggle();
  initializeShareButtons();
  initializeLoadingStates();
  initializeKeyboardNavigation();
}

// View Toggle (Grid/List)
function initializeViewToggle() {
  const viewToggleButtons = document.querySelectorAll(".view-toggle .btn");
  const foodGrid = document.getElementById("foodGrid");

  if (!foodGrid) return;

  viewToggleButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const viewType = this.dataset.view;

      // Update button states
      viewToggleButtons.forEach((btn) => btn.classList.remove("active"));
      this.classList.add("active");

      // Update grid layout
      if (viewType === "list") {
        foodGrid.classList.add("list-view");
      } else {
        foodGrid.classList.remove("list-view");
      }

      // Store user preference
      localStorage.setItem("foodListingView", viewType);

      // Animate transition
      animateViewChange(foodGrid);
    });
  });

  // Restore saved view preference
  const savedView = localStorage.getItem("foodListingView");
  if (savedView) {
    const targetButton = document.querySelector(`[data-view="${savedView}"]`);
    if (targetButton) {
      targetButton.click();
    }
  }
}

function animateViewChange(grid) {
  const cards = grid.querySelectorAll(".food-listing-card");

  cards.forEach((card, index) => {
    card.style.opacity = "0";
    card.style.transform = "translateY(20px)";

    setTimeout(() => {
      card.style.transition = "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)";
      card.style.opacity = "1";
      card.style.transform = "translateY(0)";
    }, index * 50);
  });
}

// Scroll Animations
function initializeScrollAnimations() {
  const observerOptions = {
    root: null,
    rootMargin: "0px 0px -100px 0px",
    threshold: 0.1,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animate-in");
      }
    });
  }, observerOptions);

  // Observe all cards
  document.querySelectorAll(".animate-on-scroll").forEach((card) => {
    observer.observe(card);
  });
}

// Live Search with Debouncing
function initializeLiveSearch() {
  const searchInput = document.querySelector(".search-input");
  const filterForm = document.querySelector(".filter-form");

  if (!searchInput || !filterForm) return;

  let searchTimeout;

  searchInput.addEventListener("input", function () {
    clearTimeout(searchTimeout);

    searchTimeout = setTimeout(() => {
      // Show loading state
      showSearchLoading();

      // Submit form after delay
      setTimeout(() => {
        filterForm.submit();
      }, 300);
    }, 500);
  });

  // Enhanced search button
  const searchButton = document.querySelector(".search-button");
  if (searchButton) {
    searchButton.addEventListener("click", function (e) {
      e.preventDefault();

      // Add ripple effect
      addRippleEffect(this);

      // Submit form
      setTimeout(() => {
        filterForm.submit();
      }, 200);
    });
  }
}

function showSearchLoading() {
  const searchButton = document.querySelector(".search-button");
  if (searchButton) {
    const originalHTML = searchButton.innerHTML;
    searchButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

    setTimeout(() => {
      searchButton.innerHTML = originalHTML;
    }, 1000);
  }
}

// Filter Toggle Enhancement
function initializeFilterToggle() {
  const filterToggle = document.querySelector(".filter-toggle");
  const filterCollapse = document.getElementById("filterCollapse");

  if (!filterToggle || !filterCollapse) return;

  filterToggle.addEventListener("click", function () {
    const icon = this.querySelector("i");
    const isExpanded = filterCollapse.classList.contains("show");

    // Animate icon
    icon.style.transform = isExpanded ? "rotate(0deg)" : "rotate(180deg)";

    // Update button text
    const buttonText = this.querySelector("span") || this.childNodes[2];
    if (buttonText) {
      buttonText.textContent = isExpanded ? " Show Filters" : " Hide Filters";
    }
  });

  // Auto-collapse on mobile after filter selection
  if (window.innerWidth <= 768) {
    const filterInputs = document.querySelectorAll(".filter-control");
    filterInputs.forEach((input) => {
      input.addEventListener("change", function () {
        setTimeout(() => {
          const collapse = new bootstrap.Collapse(filterCollapse, {
            toggle: true,
          });
        }, 500);
      });
    });
  }
}

// Share Functionality
function initializeShareButtons() {
  const shareButtons = document.querySelectorAll(".btn-share");

  shareButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const listingId = this.dataset.listingId;
      const listingCard = this.closest(".food-listing-card");
      const listingTitle = listingCard.querySelector(
        ".food-listing-title"
      ).textContent;
      const listingUrl = `${window.location.origin}/food/${listingId}`;

      // Check if Web Share API is supported
      if (navigator.share) {
        navigator
          .share({
            title: `${listingTitle} - Food Rescue`,
            text: `Check out this food listing: ${listingTitle}`,
            url: listingUrl,
          })
          .catch((err) => {
            console.log("Error sharing:", err);
            fallbackShare(listingUrl, listingTitle);
          });
      } else {
        fallbackShare(listingUrl, listingTitle);
      }

      // Add visual feedback
      addShareFeedback(this);
    });
  });
}

function fallbackShare(url, title) {
  // Copy to clipboard
  navigator.clipboard
    .writeText(url)
    .then(() => {
      showNotification("Link copied to clipboard!", "success");
    })
    .catch(() => {
      // Fallback: show share modal
      showShareModal(url, title);
    });
}

function addShareFeedback(button) {
  const originalHTML = button.innerHTML;
  button.innerHTML = '<i class="fas fa-check"></i>';
  button.classList.add("btn-success");

  setTimeout(() => {
    button.innerHTML = originalHTML;
    button.classList.remove("btn-success");
  }, 2000);
}

function showShareModal(url, title) {
  const modal = `
        <div class="modal fade" id="shareModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Share Food Listing</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <p><strong>${title}</strong></p>
                        <div class="input-group mb-3">
                            <input type="text" class="form-control" value="${url}" readonly>
                            <button class="btn btn-outline-secondary" type="button" onclick="copyToClipboard('${url}')">
                                <i class="fas fa-copy"></i> Copy
                            </button>
                        </div>
                        <div class="share-buttons">
                            <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(
                              title
                            )}&url=${encodeURIComponent(url)}" 
                               target="_blank" class="btn btn-primary me-2">
                                <i class="fab fa-twitter"></i> Twitter
                            </a>
                            <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                              url
                            )}" 
                               target="_blank" class="btn btn-primary me-2">
                                <i class="fab fa-facebook"></i> Facebook
                            </a>
                            <a href="mailto:?subject=${encodeURIComponent(
                              title
                            )}&body=${encodeURIComponent(url)}" 
                               class="btn btn-outline-primary">
                                <i class="fas fa-envelope"></i> Email
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

  document.body.insertAdjacentHTML("beforeend", modal);
  const shareModal = new bootstrap.Modal(document.getElementById("shareModal"));
  shareModal.show();

  // Clean up modal after hide
  document
    .getElementById("shareModal")
    .addEventListener("hidden.bs.modal", function () {
      this.remove();
    });
}

// Loading States
function initializeLoadingStates() {
  const claimButtons = document.querySelectorAll(".btn-claim");

  claimButtons.forEach((button) => {
    button.addEventListener("click", function (e) {
      e.preventDefault();

      const originalHTML = this.innerHTML;
      this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Claiming...';
      this.disabled = true;

      // Simulate loading time
      setTimeout(() => {
        window.location.href = this.href;
      }, 1000);
    });
  });
}

// Keyboard Navigation
function initializeKeyboardNavigation() {
  const cards = document.querySelectorAll(".food-listing-card");

  cards.forEach((card, index) => {
    card.setAttribute("tabindex", "0");
    card.setAttribute("role", "article");
    card.setAttribute(
      "aria-label",
      `Food listing: ${card.querySelector(".food-listing-title").textContent}`
    );

    card.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const viewButton = this.querySelector(".btn-primary");
        if (viewButton) {
          viewButton.click();
        }
      }

      // Arrow key navigation
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        const nextCard = cards[index + 1];
        if (nextCard) {
          nextCard.focus();
        }
      }

      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        const prevCard = cards[index - 1];
        if (prevCard) {
          prevCard.focus();
        }
      }
    });
  });
}

// Utility Functions
function addRippleEffect(element) {
  const ripple = document.createElement("span");
  ripple.classList.add("ripple");

  const rect = element.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);

  ripple.style.width = ripple.style.height = size + "px";
  ripple.style.left = event.clientX - rect.left - size / 2 + "px";
  ripple.style.top = event.clientY - rect.top - size / 2 + "px";

  element.appendChild(ripple);

  setTimeout(() => {
    ripple.remove();
  }, 600);
}

function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
  notification.style.cssText = `
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        animation: slideInRight 0.3s ease;
    `;

  notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

  document.body.appendChild(notification);

  // Auto-dismiss after 5 seconds
  setTimeout(() => {
    notification.remove();
  }, 5000);
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showNotification("Link copied to clipboard!", "success");
  });
}

// Responsive Enhancements
function handleResponsiveChanges() {
  const mediaQuery = window.matchMedia("(max-width: 768px)");

  function handleTabletChange(e) {
    if (e.matches) {
      // Mobile-specific enhancements
      enableSwipeGestures();
      adjustCardSpacing();
    } else {
      // Desktop-specific enhancements
      disableSwipeGestures();
      resetCardSpacing();
    }
  }

  mediaQuery.addListener(handleTabletChange);
  handleTabletChange(mediaQuery);
}

function enableSwipeGestures() {
  const cards = document.querySelectorAll(".food-listing-card");

  cards.forEach((card) => {
    let startX, startY, distX, distY;

    card.addEventListener("touchstart", function (e) {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    });

    card.addEventListener("touchmove", function (e) {
      if (!startX || !startY) return;

      distX = e.touches[0].clientX - startX;
      distY = e.touches[0].clientY - startY;

      if (Math.abs(distX) > Math.abs(distY) && Math.abs(distX) > 50) {
        e.preventDefault();

        if (distX > 0) {
          // Swipe right - show share options
          showQuickActions(card);
        } else {
          // Swipe left - quick claim
          quickClaim(card);
        }
      }
    });

    card.addEventListener("touchend", function () {
      startX = startY = distX = distY = null;
    });
  });
}

function disableSwipeGestures() {
  const cards = document.querySelectorAll(".food-listing-card");
  cards.forEach((card) => {
    card.ontouchstart = null;
    card.ontouchmove = null;
    card.ontouchend = null;
  });
}

function showQuickActions(card) {
  const actions = card.querySelector(".food-listing-actions");
  if (actions) {
    actions.style.transform = "translateX(0)";
    actions.style.opacity = "1";

    setTimeout(() => {
      actions.style.transform = "translateX(-100%)";
      actions.style.opacity = "0";
    }, 3000);
  }
}

function quickClaim(card) {
  const claimButton = card.querySelector(".btn-claim");
  if (claimButton) {
    claimButton.click();
  }
}

function adjustCardSpacing() {
  const grid = document.getElementById("foodGrid");
  if (grid) {
    grid.style.gap = "1rem";
  }
}

function resetCardSpacing() {
  const grid = document.getElementById("foodGrid");
  if (grid) {
    grid.style.gap = "1.5rem";
  }
}

// Initialize responsive enhancements
document.addEventListener("DOMContentLoaded", handleResponsiveChanges);

// Performance Optimization
function optimizeImages() {
  const images = document.querySelectorAll(".food-listing-image img");

  images.forEach((img) => {
    img.addEventListener("load", function () {
      this.style.opacity = "1";
    });

    img.addEventListener("error", function () {
      this.src = "/static/image/placeholder.jpg";
      this.alt = "Food image unavailable";
    });
  });
}

// Initialize image optimization
document.addEventListener("DOMContentLoaded", optimizeImages);

// Add CSS for animations
const style = document.createElement("style");
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: rippleEffect 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes rippleEffect {
        to { transform: scale(4); opacity: 0; }
    }
`;
document.head.appendChild(style);
