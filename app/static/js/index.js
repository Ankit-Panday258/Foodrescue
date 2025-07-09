// Index page specific JavaScript
document.addEventListener("DOMContentLoaded", function () {
  // Smooth scroll animation for elements
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
      }
    });
  }, observerOptions);

  // Observe all elements with animate-on-scroll class
  const animateElements = document.querySelectorAll(".animate-on-scroll");
  animateElements.forEach((element) => {
    observer.observe(element);
  });

  // Counter animation for statistics
  const counters = document.querySelectorAll(".stat-number");
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const counter = entry.target;
          const finalValue = counter.textContent.replace(/[^0-9.]/g, "");
          const increment = parseFloat(finalValue) / 100;
          let currentValue = 0;

          const timer = setInterval(() => {
            currentValue += increment;
            if (currentValue >= finalValue) {
              currentValue = finalValue;
              clearInterval(timer);
            }

            // Format the number
            if (finalValue >= 1000) {
              counter.textContent = (currentValue / 1000).toFixed(1) + "k";
            } else {
              counter.textContent = Math.ceil(currentValue).toLocaleString();
            }
          });

          counterObserver.unobserve(counter);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((counter) => {
    counterObserver.observe(counter);
  });
});
