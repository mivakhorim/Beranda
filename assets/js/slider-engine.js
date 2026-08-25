/**
 * DUTAMIK.ID - Pure Click-to-Drag & Touch Scroll Engine
 * Duta Media Informasi berKarya
 * 
 * Rules:
 * 1. ZERO Auto-Slide / Auto-Move: Never scrolls on its own before or without user interaction.
 * 2. Pure Click & Drag (Mouse Grab-to-Scroll): Click and drag horizontally to slide sideways smoothly.
 * 3. Prevents Accidental Clicks: Links/buttons are not triggered during a drag gesture.
 * 4. Touch & Trackpad Friendly: Seamless horizontal swipe on mobile and trackpads.
 */

class DutamikDragSlider {
  constructor(container) {
    this.slider = typeof container === 'string' ? document.getElementById(container) : container;
    if (!this.slider) return;

    this.isDown = false;
    this.startX = 0;
    this.scrollLeft = 0;
    this.hasMoved = false;
    this.moveDistance = 0;
    this.velX = 0;
    this.momentumID = null;

    this.init();
  }

  init() {
    // Reset scroll to left origin on load
    this.slider.scrollLeft = 0;

    // Apply grab cursor
    this.slider.style.cursor = 'grab';
    this.slider.style.userSelect = 'none';
    this.slider.style.webkitUserSelect = 'none';

    // Mouse Events for Click & Drag
    this.slider.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    window.addEventListener('mouseup', () => this.handleMouseUp());
    this.slider.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.slider.addEventListener('mouseleave', () => this.handleMouseLeave());

    // Prevent click on links/cards when dragging
    this.slider.addEventListener('click', (e) => this.handleClickCapture(e), true);

    // Mouse wheel horizontal scroll helper
    this.slider.addEventListener('wheel', (e) => this.handleWheel(e), { passive: false });
  }

  handleMouseDown(e) {
    // Ignore right click
    if (e.button !== 0) return;

    this.isDown = true;
    this.hasMoved = false;
    this.moveDistance = 0;
    this.startX = e.pageX - this.slider.offsetLeft;
    this.scrollLeft = this.slider.scrollLeft;
    this.slider.style.cursor = 'grabbing';
    this.slider.classList.add('is-dragging');

    // Cancel any active momentum
    if (this.momentumID) {
      cancelAnimationFrame(this.momentumID);
      this.momentumID = null;
    }
  }

  handleMouseMove(e) {
    if (!this.isDown) return;
    e.preventDefault();

    const x = e.pageX - this.slider.offsetLeft;
    const walk = (x - this.startX) * 1.5; // Drag speed multiplier
    this.moveDistance = Math.abs(walk);

    if (this.moveDistance > 6) {
      this.hasMoved = true;
    }

    const prevScroll = this.slider.scrollLeft;
    this.slider.scrollLeft = this.scrollLeft - walk;
    this.velX = this.slider.scrollLeft - prevScroll;
  }

  handleMouseUp() {
    if (!this.isDown) return;
    this.isDown = false;
    this.slider.style.cursor = 'grab';
    this.slider.classList.remove('is-dragging');

    // Smooth momentum deceleration if dragged fast
    if (Math.abs(this.velX) > 2) {
      this.applyMomentum();
    }
  }

  handleMouseLeave() {
    if (this.isDown) {
      this.handleMouseUp();
    }
  }

  applyMomentum() {
    const decay = 0.92;
    const step = () => {
      if (Math.abs(this.velX) < 0.5 || this.isDown) {
        cancelAnimationFrame(this.momentumID);
        this.momentumID = null;
        return;
      }
      this.slider.scrollLeft += this.velX;
      this.velX *= decay;
      this.momentumID = requestAnimationFrame(step);
    };
    this.momentumID = requestAnimationFrame(step);
  }

  handleClickCapture(e) {
    // If user dragged more than 6px, block the click event to prevent accidental link opening
    if (this.hasMoved) {
      e.preventDefault();
      e.stopPropagation();
      this.hasMoved = false;
    }
  }

  handleWheel(e) {
    // Only intercept horizontal trackpad/shift+wheel or pure wheel if hovering slider
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      // Natural horizontal scrolling
      return;
    }
  }
}

// Global Slider Init
function initAllDragSliders() {
  document.querySelectorAll('.dutamik-slider-container').forEach(el => {
    if (!el._dutamikDragInstance) {
      el._dutamikDragInstance = new DutamikDragSlider(el);
    }
  });
}

// Initializer
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAllDragSliders);
} else {
  initAllDragSliders();
}
