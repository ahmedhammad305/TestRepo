// Mobile Menu Toggle
const menuToggle = document.querySelector('.header__menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
const menuOverlay = document.querySelector('.mobile-menu__overlay');
const body = document.body;

function toggleMenu() {
  const isOpen = mobileMenu.classList.contains('active');
  
  mobileMenu.classList.toggle('active');
  menuOverlay.classList.toggle('active');
  menuToggle.classList.toggle('active');
  menuToggle.setAttribute('aria-expanded', !isOpen);
  
  if (!isOpen) {
    body.classList.add('menu-open');
  } else {
    body.classList.remove('menu-open');
  }
}

menuToggle.addEventListener('click', toggleMenu);
menuOverlay.addEventListener('click', toggleMenu);

// Close menu when clicking on a link
const mobileMenuLinks = document.querySelectorAll('.mobile-menu__nav-link');
mobileMenuLinks.forEach(link => {
  link.addEventListener('click', () => {
    if (mobileMenu.classList.contains('active')) {
      toggleMenu();
    }
  });
});

// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      const headerOffset = 80;
      const elementPosition = target.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  });
});

// Projects Slider
class ProjectsSlider {
  constructor() {
    this.track = document.querySelector('.projects-slider__track');
    this.slides = document.querySelectorAll('.projects-slider__slide');
    this.prevBtn = document.querySelector('.projects-slider__nav--prev');
    this.nextBtn = document.querySelector('.projects-slider__nav--next');
    this.pagination = document.querySelector('.projects-slider__pagination');
    this.currentIndex = 0;
    this.slidesPerView = this.getSlidesPerView();
    this.isDragging = false;
    this.startX = 0;
    this.currentX = 0;
    this.translateX = 0;

    this.init();
  }

  getSlidesPerView() {
    const width = window.innerWidth;
    if (width >= 1024) return 3; // Large screens: 3 slides
    return 2; // Medium and small screens: 2 slides
  }

  init() {
    this.createPagination();
    this.updateSlider();
    this.attachEventListeners();
    window.addEventListener('resize', () => {
      const newSlidesPerView = this.getSlidesPerView();
      if (newSlidesPerView !== this.slidesPerView) {
        this.slidesPerView = newSlidesPerView;
        this.currentIndex = 0; // Reset to first page when layout changes
        this.createPagination(); // Recreate pagination with new slide count
        this.updateSlider();
      }
    });
  }

  createPagination() {
    const totalSlides = this.slides.length;
    const totalPages = Math.ceil(totalSlides / this.slidesPerView);
    
    this.pagination.innerHTML = '';
    for (let i = 0; i < totalPages; i++) {
      const dot = document.createElement('button');
      dot.className = 'projects-slider__dot';
      if (i === 0) dot.classList.add('active');
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      dot.addEventListener('click', () => this.goToPage(i));
      this.pagination.appendChild(dot);
    }
  }

  updateSlider() {
    const slideWidth = 100 / this.slidesPerView;
    const offset = -this.currentIndex * slideWidth;
    this.track.style.transform = `translateX(${offset}%)`;

    // Update active slide
    this.slides.forEach((slide, index) => {
      slide.classList.remove('active');
      if (index >= this.currentIndex && index < this.currentIndex + this.slidesPerView) {
        slide.classList.add('active');
      }
    });

    // Update pagination
    const totalPages = Math.ceil(this.slides.length / this.slidesPerView);
    const currentPage = Math.min(Math.floor(this.currentIndex / this.slidesPerView), totalPages - 1);
    const dots = this.pagination.querySelectorAll('.projects-slider__dot');
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === currentPage);
    });
  }

  goToSlide(index) {
    const maxIndex = this.slides.length - this.slidesPerView;
    this.currentIndex = Math.max(0, Math.min(index, maxIndex));
    this.updateSlider();
  }

  goToPage(page) {
    const totalPages = Math.ceil(this.slides.length / this.slidesPerView);
    const targetPage = Math.max(0, Math.min(page, totalPages - 1));
    this.currentIndex = targetPage * this.slidesPerView;

    // Ensure we don't exceed the available slides
    if (this.currentIndex >= this.slides.length) {
      this.currentIndex = 0;
    }

    this.updateSlider();
  }

  next() {
    const totalPages = Math.ceil(this.slides.length / this.slidesPerView);
    const currentPage = Math.floor(this.currentIndex / this.slidesPerView);
    const nextPage = currentPage + 1;

    // Only loop back to first page when we reach the last page
    if (nextPage >= totalPages) {
      this.goToPage(0); // Go back to first page
    } else {
      this.goToPage(nextPage);
    }
  }

  prev() {
    const totalPages = Math.ceil(this.slides.length / this.slidesPerView);
    const currentPage = Math.floor(this.currentIndex / this.slidesPerView);
    const prevPage = currentPage - 1;

    // Only loop to last page when we're at the first page
    if (prevPage < 0) {
      this.goToPage(totalPages - 1); // Go to last page
    } else {
      this.goToPage(prevPage);
    }
  }

  attachEventListeners() {
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => this.prev());
    }
    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => this.next());
    }

    // Touch and drag support
    this.track.addEventListener('mousedown', (e) => this.startDrag(e));
    this.track.addEventListener('touchstart', (e) => this.startDrag(e));
    window.addEventListener('mousemove', (e) => this.drag(e));
    window.addEventListener('touchmove', (e) => this.drag(e));
    window.addEventListener('mouseup', () => this.endDrag());
    window.addEventListener('touchend', () => this.endDrag());
  }

  startDrag(e) {
    this.isDragging = true;
    this.startX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
    this.translateX = -this.currentIndex * (100 / this.slidesPerView);
  }

  drag(e) {
    if (!this.isDragging) return;
    e.preventDefault();
    this.currentX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
    const diff = this.currentX - this.startX;
    const slideWidth = window.innerWidth / this.slidesPerView;
    const dragOffset = (diff / slideWidth) * 100;
    const newTranslateX = this.translateX + dragOffset;
    this.track.style.transform = `translateX(${newTranslateX}%)`;
  }

  endDrag() {
    if (!this.isDragging) return;
    this.isDragging = false;
    
    const slideWidth = 100 / this.slidesPerView;
    const diff = this.currentX - this.startX;
    const threshold = window.innerWidth * 0.1;

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        this.prev();
      } else {
        this.next();
      }
    } else {
      this.updateSlider();
    }
  }
}

// Initialize slider when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new ProjectsSlider();
  });
} else {
  new ProjectsSlider();
}

// Scroll Reveal Animation
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, observerOptions);

document.querySelectorAll('.fade-in').forEach(el => {
  observer.observe(el);
});

// Active Navigation Link
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.header__nav-link, .mobile-menu__nav-link');

function updateActiveNav() {
  const scrollY = window.pageYOffset;

  sections.forEach(section => {
    const sectionHeight = section.offsetHeight;
    const sectionTop = section.offsetTop - 100;
    const sectionId = section.getAttribute('id');

    if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${sectionId}`) {
          link.classList.add('active');
        }
      });
    }
  });
}

window.addEventListener('scroll', updateActiveNav);

// Testimonials Carousel
class TestimonialsCarousel {
  constructor() {
    this.track = document.querySelector('.testimonials-carousel__track');
    this.slides = document.querySelectorAll('.testimonials-carousel__slide');
    this.pagination = document.querySelector('.testimonials-carousel__pagination');
    this.currentIndex = 0;
    this.isDragging = false;
    this.startX = 0;
    this.currentX = 0;
    this.translateX = 0;

    if (this.track && this.slides.length > 0) {
      this.init();
    }
  }

  init() {
    this.createPagination();
    this.updateSlider();
    this.attachEventListeners();
  }

  createPagination() {
    if (!this.pagination) return;
    
    // Always create exactly 3 dots (one for each testimonial)
    const totalDots = Math.min(3, this.slides.length);
    this.pagination.innerHTML = '';
    
    for (let i = 0; i < totalDots; i++) {
      const dot = document.createElement('button');
      dot.className = 'testimonials-carousel__dot';
      if (i === 0) dot.classList.add('active');
      dot.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
      dot.addEventListener('click', () => this.goToSlide(i));
      this.pagination.appendChild(dot);
    }
  }

  updateSlider() {
    if (!this.track) return;
    
    const offset = -this.currentIndex * 100;
    this.track.style.transform = `translateX(${offset}%)`;

    // Update pagination dots - each dot corresponds directly to a slide
    const dots = this.pagination?.querySelectorAll('.testimonials-carousel__dot');
    if (dots) {
      dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === this.currentIndex);
      });
    }
  }

  goToSlide(index) {
    // Direct mapping: dot index = slide index (0, 1, 2)
    this.currentIndex = Math.max(0, Math.min(index, this.slides.length - 1));
    this.updateSlider();
  }

  next() {
    this.currentIndex = (this.currentIndex + 1) % this.slides.length;
    this.updateSlider();
  }

  prev() {
    this.currentIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
    this.updateSlider();
  }

  attachEventListeners() {
    if (!this.track) return;

    // Touch and drag support
    this.track.addEventListener('mousedown', (e) => this.startDrag(e));
    this.track.addEventListener('touchstart', (e) => this.startDrag(e), { passive: false });
    window.addEventListener('mousemove', (e) => this.drag(e));
    window.addEventListener('touchmove', (e) => this.drag(e), { passive: false });
    window.addEventListener('mouseup', () => this.endDrag());
    window.addEventListener('touchend', () => this.endDrag());
  }

  startDrag(e) {
    this.isDragging = true;
    this.startX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
    this.translateX = -this.currentIndex * 100;
    this.track.style.cursor = 'grabbing';
  }

  drag(e) {
    if (!this.isDragging) return;
    e.preventDefault();
    this.currentX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
    const diff = this.currentX - this.startX;
    const slideWidth = this.track.offsetWidth;
    const dragOffset = (diff / slideWidth) * 100;
    const newTranslateX = this.translateX + dragOffset;
    this.track.style.transform = `translateX(${newTranslateX}%)`;
    this.track.style.transition = 'none';
  }

  endDrag() {
    if (!this.isDragging) return;
    this.isDragging = false;
    this.track.style.cursor = 'grab';
    this.track.style.transition = 'transform 400ms cubic-bezier(0.4, 0, 0.2, 1)';
    
    const slideWidth = this.track.offsetWidth;
    const diff = this.currentX - this.startX;
    const threshold = slideWidth * 0.15; // 15% threshold

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        this.prev();
      } else {
        this.next();
      }
    } else {
      this.updateSlider();
    }
  }
}

// Initialize testimonials carousel when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new TestimonialsCarousel();
  });
} else {
  new TestimonialsCarousel();
}

// Projects Category Slider
class ProjectsCategorySlider {
  constructor() {
    this.categorySelect = document.getElementById('project-category');
    this.slides = document.querySelectorAll('.projects-slider__slide');
    this.prevBtn = document.querySelector('.projects-slider__nav--prev');
    this.nextBtn = document.querySelector('.projects-slider__nav--next');
    this.pagination = document.querySelector('.projects-slider__pagination');
    this.currentCategory = 'residential';
    this.currentIndex = 0;
    this.categorySlides = {};
    this.autoPlayInterval = null;
    this.autoPlayDelay = 5000; // 5 seconds

    this.init();
  }

  init() {
    if (!this.categorySelect || !this.slides.length) return;

    this.groupSlidesByCategory();
    this.createPagination();
    this.attachEventListeners();
    this.showCategory(this.currentCategory);
    this.startAutoPlay();
  }

  groupSlidesByCategory() {
    this.categorySlides = {};
    this.slides.forEach(slide => {
      const category = slide.dataset.category;
      if (!this.categorySlides[category]) {
        this.categorySlides[category] = [];
      }
      this.categorySlides[category].push(slide);
    });
  }

  createPagination() {
    if (!this.pagination) return;

    const slidesInCategory = this.categorySlides[this.currentCategory];
    if (!slidesInCategory) return;

    this.pagination.innerHTML = '';
    slidesInCategory.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.className = 'projects-slider__dot';
      if (index === 0) dot.classList.add('active');
      dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
      dot.addEventListener('click', () => this.goToSlide(index));
      this.pagination.appendChild(dot);
    });
  }

  attachEventListeners() {
    if (this.categorySelect) {
      this.categorySelect.addEventListener('change', (e) => {
        this.showCategory(e.target.value);
      });
    }

    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => this.prevSlide());
    }

    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => this.nextSlide());
    }

    // Pause autoplay on hover
    const sliderContainer = document.querySelector('.projects-slider__container');
    if (sliderContainer) {
      sliderContainer.addEventListener('mouseenter', () => this.stopAutoPlay());
      sliderContainer.addEventListener('mouseleave', () => this.startAutoPlay());
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        this.prevSlide();
      } else if (e.key === 'ArrowRight') {
        this.nextSlide();
      }
    });

    // Touch support
    this.attachTouchEvents();
  }

  attachTouchEvents() {
    const track = document.querySelector('.projects-slider__track');
    if (!track) return;

    let startX = 0;
    let currentX = 0;
    let isDragging = false;

    track.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      isDragging = true;
      this.stopAutoPlay();
    }, { passive: true });

    track.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      currentX = e.touches[0].clientX;
    }, { passive: true });

    track.addEventListener('touchend', () => {
      if (!isDragging) return;
      isDragging = false;

      const diff = startX - currentX;
      const threshold = 50;

      if (Math.abs(diff) > threshold) {
        if (diff > 0) {
          this.nextSlide();
        } else {
          this.prevSlide();
        }
      }

      this.startAutoPlay();
    }, { passive: true });
  }

  showCategory(category) {
    this.currentCategory = category;
    this.currentIndex = 0;

    // Hide all slides
    this.slides.forEach(slide => {
      slide.classList.remove('active');
      slide.style.display = 'none';
    });

    // Show slides for selected category
    const categorySlides = this.categorySlides[category];
    if (categorySlides) {
      categorySlides.forEach((slide, index) => {
        slide.style.display = index === 0 ? 'block' : 'none';
        if (index === 0) {
          setTimeout(() => slide.classList.add('active'), 50);
        }
      });
    }

    this.createPagination();
    this.updatePagination();
    this.resetAutoPlay();
  }

  goToSlide(index) {
    const categorySlides = this.categorySlides[this.currentCategory];
    if (!categorySlides || index >= categorySlides.length) return;

    // Hide current slide
    categorySlides[this.currentIndex].classList.remove('active');
    categorySlides[this.currentIndex].style.display = 'none';

    // Show new slide
    this.currentIndex = index;
    categorySlides[this.currentIndex].style.display = 'block';
    setTimeout(() => categorySlides[this.currentIndex].classList.add('active'), 50);

    this.updatePagination();
    this.resetAutoPlay();
  }

  nextSlide() {
    const categorySlides = this.categorySlides[this.currentCategory];
    if (!categorySlides) return;

    const nextIndex = (this.currentIndex + 1) % categorySlides.length;
    this.goToSlide(nextIndex);
  }

  prevSlide() {
    const categorySlides = this.categorySlides[this.currentCategory];
    if (!categorySlides) return;

    const prevIndex = this.currentIndex === 0 ? categorySlides.length - 1 : this.currentIndex - 1;
    this.goToSlide(prevIndex);
  }

  updatePagination() {
    const dots = this.pagination?.querySelectorAll('.projects-slider__dot');
    if (!dots) return;

    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === this.currentIndex);
    });
  }

  startAutoPlay() {
    this.stopAutoPlay();
    this.autoPlayInterval = setInterval(() => {
      this.nextSlide();
    }, this.autoPlayDelay);
  }

  stopAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = null;
    }
  }

  resetAutoPlay() {
    this.stopAutoPlay();
    this.startAutoPlay();
  }
}

// Initialize projects category slider when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new ProjectsCategorySlider();
  });
} else {
  new ProjectsCategorySlider();
}