/**
 * Food Rescue - Show Page JavaScript
 * Simple functionality focused on image clarity and basic interactions
 */

class ShowPageController {
  constructor() {
    this.init();
  }

  init() {
    this.setupImageHandling();
    this.setupDateHandling();
    this.setupFavoriteButton();
    this.setupShareButton();
    this.setupFormHandling();
  }

  setupImageHandling() {
    const mainImage = document.getElementById("mainImage");

    if (mainImage) {
      // Check if image is already loaded (cached)
      if (mainImage.complete && mainImage.naturalHeight !== 0) {
        mainImage.style.opacity = "1";
      } else {
        // Set initial opacity to 0 only if not already loaded
        mainImage.style.opacity = "0";

        // Ensure image loads with maximum quality
        mainImage.addEventListener("load", () => {
          mainImage.style.opacity = "1";
        });

        mainImage.addEventListener("error", () => {
          // Fallback image
          mainImage.src = "/static/image/placeholder.jpg";
          mainImage.alt = "Food item placeholder";
          mainImage.style.opacity = "1";
        });
      }
    }

    // Handle all images for crystal clarity
    const allImages = document.querySelectorAll("img");
    allImages.forEach((img) => {
      // Prevent drag and context menu for better UX
      img.addEventListener("dragstart", (e) => e.preventDefault());
      img.addEventListener("contextmenu", (e) => e.preventDefault());
    });
  }

  setupDateHandling() {
    const expiryDateElement = document.querySelector(".expiry-date");

    if (expiryDateElement) {
      const expiryText = expiryDateElement.textContent;
      const expiryDate = new Date(expiryText);
      const now = new Date();
      const diffTime = expiryDate - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Add urgency classes based on time remaining
      if (diffDays <= 1) {
        expiryDateElement.classList.add("urgent");
      } else if (diffDays <= 3) {
        expiryDateElement.classList.add("warning");
      }
    }
  }

  setupFavoriteButton() {
    const favoriteBtn = document.querySelector(".btn-favorite");

    if (favoriteBtn) {
      favoriteBtn.addEventListener("click", (e) => {
        e.preventDefault();

        const isActive = favoriteBtn.classList.contains("active");
        const icon = favoriteBtn.querySelector("i");

        if (isActive) {
          favoriteBtn.classList.remove("active");
          icon.classList.remove("fas");
          icon.classList.add("far");
          this.showMessage("Removed from favorites");
        } else {
          favoriteBtn.classList.add("active");
          icon.classList.remove("far");
          icon.classList.add("fas");
          this.showMessage("Added to favorites");
        }
      });
    }
  }

  setupShareButton() {
    const shareBtn = document.querySelector(".btn-share");

    if (shareBtn) {
      shareBtn.addEventListener("click", (e) => {
        e.preventDefault();

        if (navigator.share) {
          // Use native share API if available
          navigator
            .share({
              title: document.querySelector(".food-title").textContent,
              text: "Check out this food item on Food Rescue!",
              url: window.location.href,
            })
            .catch((err) => {
              console.log("Error sharing:", err);
              this.fallbackShare();
            });
        } else {
          this.fallbackShare();
        }
      });
    }
  }

  fallbackShare() {
    // Simple fallback - copy URL to clipboard
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => {
        this.showMessage("Link copied to clipboard!");
      })
      .catch(() => {
        // If clipboard API fails, show the URL in a simple alert
        prompt("Copy this link:", window.location.href);
      });
  }

  setupFormHandling() {
    const forms = document.querySelectorAll("form");

    forms.forEach((form) => {
      form.addEventListener("submit", (e) => {
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = "Processing...";

          // Re-enable after 5 seconds as a fallback
          setTimeout(() => {
            submitBtn.disabled = false;
            submitBtn.innerHTML =
              submitBtn.getAttribute("data-original-text") || "Submit";
          }, 5000);
        }
      });
    });
  }

  showMessage(message) {
    // Create a simple message display
    const messageDiv = document.createElement("div");
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            z-index: 9999;
            font-size: 14px;
            font-weight: 500;
        `;

    document.body.appendChild(messageDiv);

    // Remove message after 3 seconds
    setTimeout(() => {
      messageDiv.remove();
    }, 3000);
  }
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  new ShowPageController();
});
