// Scroll + Hero Load Animations
export function initScrollAnimations() {
    if (typeof window === "undefined") return;
  
    // ✅ Smooth Hero Section Entry
    window.addEventListener("load", () => {
      document.body.classList.add("page-loaded");
    });
  
    // ✅ Scroll Observer Options
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px"
    };
  
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
        } else {
          entry.target.classList.remove("in-view"); // Allows animation to reverse on scroll up
        }
      });
    }, observerOptions);
  
    // ✅ Animate all scroll-triggered elements with stagger
    const scrollElements = document.querySelectorAll(".scroll-trigger");
    scrollElements.forEach((el, i) => {
      el.style.transitionDelay = `${i * 100}ms`; // 100ms stagger
      observer.observe(el);
    });
  
    return () => {
      scrollElements.forEach((el) => observer.unobserve(el));
    };
  }
  
  /* CSS (add to your stylesheet):
  
  .hero-section {
    opacity: 0;
    transform: translateY(30px);
    transition: opacity 1s ease-out, transform 1s ease-out;
  }
  
  body.page-loaded .hero-section {
    opacity: 1;
    transform: translateY(0);
  }
  
  .scroll-trigger {
    opacity: 0;
    transform: translateY(40px);
    transition: opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1),
                transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
    will-change: transform, opacity;
  }
  
  .scroll-trigger.in-view {
    opacity: 1;
    transform: translateY(0);
  }
  */
  