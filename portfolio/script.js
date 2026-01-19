// Utility Functions
const utils = {
    throttle(func, wait) {
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
    
    isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    },
    
    lerp(start, end, factor) {
        return start + (end - start) * factor;
    }
};

// Custom Cursor
class CustomCursor {
    constructor() {
        this.cursor = document.querySelector('.cursor');
        this.follower = document.querySelector('.cursor-follower');
        this.pos = { x: 0, y: 0 };
        this.followerPos = { x: 0, y: 0 };
        
        if (!this.cursor || !this.follower) return;
        
        this.init();
    }
    
    init() {
        document.addEventListener('mousemove', (e) => {
            this.pos.x = e.clientX;
            this.pos.y = e.clientY;
        });
        
        // Add hover effects
        const hoverElements = document.querySelectorAll('a, button, [data-tilt], .project-card, .skill-category');
        hoverElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                this.cursor.style.transform = 'scale(2)';
                this.follower.style.transform = 'scale(1.5)';
            });
            
            el.addEventListener('mouseleave', () => {
                this.cursor.style.transform = 'scale(1)';
                this.follower.style.transform = 'scale(1)';
            });
        });
        
        this.animate();
    }
    
    animate() {
        this.followerPos.x = utils.lerp(this.followerPos.x, this.pos.x, 0.1);
        this.followerPos.y = utils.lerp(this.followerPos.y, this.pos.y, 0.1);
        
        this.cursor.style.left = this.pos.x + 'px';
        this.cursor.style.top = this.pos.y + 'px';
        
        this.follower.style.left = this.followerPos.x + 'px';
        this.follower.style.top = this.followerPos.y + 'px';
        
        requestAnimationFrame(() => this.animate());
    }
}

// Typewriter Effect
class TypeWriter {
    constructor(element, words, speed = 150) {
        this.element = element;
        this.words = words;
        this.speed = speed;
        this.wordIndex = 0;
        this.charIndex = 0;
        this.isDeleting = false;
        this.currentWord = '';
        
        this.type();
    }
    
    type() {
        const current = this.words[this.wordIndex];
        
        if (this.isDeleting) {
            this.currentWord = current.substring(0, this.charIndex - 1);
            this.charIndex--;
        } else {
            this.currentWord = current.substring(0, this.charIndex + 1);
            this.charIndex++;
        }
        
        this.element.textContent = this.currentWord;
        
        let typeSpeed = this.speed;
        
        if (this.isDeleting) {
            typeSpeed /= 2;
        }
        
        if (!this.isDeleting && this.charIndex === current.length) {
            typeSpeed = 2000; // Pause at end
            this.isDeleting = true;
        } else if (this.isDeleting && this.charIndex === 0) {
            this.isDeleting = false;
            this.wordIndex = (this.wordIndex + 1) % this.words.length;
            typeSpeed = 500;
        }
        
        setTimeout(() => this.type(), typeSpeed);
    }
}

// Scroll Animations
class ScrollAnimations {
    constructor() {
        this.elements = document.querySelectorAll('[data-animate], .stat-card, .project-card, .skill-category, .timeline-item');
        this.init();
    }
    
    init() {
        this.observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate-in');
                        
                        // Special handling for different elements
                        if (entry.target.classList.contains('stat-card')) {
                            this.animateCounter(entry.target);
                        }
                        
                        if (entry.target.classList.contains('skill-category')) {
                            this.animateSkillBars(entry.target);
                        }
                        
                        this.observer.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            }
        );
        
        this.elements.forEach(el => {
            el.classList.add('animate-ready');
            this.observer.observe(el);
        });
        
        // Add CSS for animations
        this.addAnimationStyles();
    }
    
    animateCounter(element) {
        const numberElement = element.querySelector('.stat-number');
        const target = parseFloat(numberElement.dataset.target);
        const increment = target / 100;
        let current = 0;
        
        const updateCounter = () => {
            if (current < target) {
                current += increment;
                numberElement.textContent = Math.floor(current * 100) / 100;
                requestAnimationFrame(updateCounter);
            } else {
                numberElement.textContent = target;
            }
        };
        
        updateCounter();
    }
    
    animateSkillBars(element) {
        const skillBars = element.querySelectorAll('.skill-progress');
        skillBars.forEach((bar, index) => {
            setTimeout(() => {
                const width = bar.dataset.width;
                bar.style.width = width + '%';
            }, index * 200);
        });
    }
    
    addAnimationStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .animate-ready {
                opacity: 0;
                transform: translateY(50px);
                transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .animate-in {
                opacity: 1;
                transform: translateY(0);
            }
            
            .stat-card.animate-ready {
                transform: translateY(30px) scale(0.9);
            }
            
            .stat-card.animate-in {
                transform: translateY(0) scale(1);
            }
            
            .skill-category.animate-ready {
                transform: translateX(-50px);
            }
            
            .skill-category.animate-in {
                transform: translateX(0);
            }
        `;
        document.head.appendChild(style);
    }
}

// 3D Tilt Effect
class TiltEffect {
    constructor() {
        this.elements = document.querySelectorAll('[data-tilt]');
        this.init();
    }
    
    init() {
        this.elements.forEach(element => {
            element.addEventListener('mousemove', (e) => {
                const rect = element.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = (y - centerY) / centerY * -10;
                const rotateY = (x - centerX) / centerX * 10;
                
                element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
            });
            
            element.addEventListener('mouseleave', () => {
                element.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
            });
        });
    }
}

// Mobile Navigation
class MobileNav {
    constructor() {
        this.hamburger = document.getElementById('hamburger');
        this.navMenu = document.getElementById('nav-menu');
        this.navLinks = document.querySelectorAll('.nav-link');
        
        this.init();
    }
    
    init() {
        this.hamburger.addEventListener('click', () => {
            this.hamburger.classList.toggle('active');
            this.navMenu.classList.toggle('active');
            document.body.style.overflow = this.navMenu.classList.contains('active') ? 'hidden' : '';
        });
        
        this.navLinks.forEach(link => {
            link.addEventListener('click', () => {
                this.hamburger.classList.remove('active');
                this.navMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }
}

// Smooth Scrolling
class SmoothScroll {
    constructor() {
        this.links = document.querySelectorAll('a[href^="#"]');
        this.init();
    }
    
    init() {
        this.links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                
                if (target) {
                    const offsetTop = target.offsetTop - 80;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
}

// Active Navigation
class ActiveNav {
    constructor() {
        this.sections = document.querySelectorAll('section');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.init();
    }
    
    init() {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const id = entry.target.getAttribute('id');
                        this.updateActiveLink(id);
                    }
                });
            },
            {
                threshold: 0.3,
                rootMargin: '-100px 0px -50% 0px'
            }
        );
        
        this.sections.forEach(section => {
            observer.observe(section);
        });
    }
    
    updateActiveLink(activeId) {
        this.navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${activeId}`) {
                link.classList.add('active');
            }
        });
    }
}

// Enhanced Form Handler
class ContactForm {
    constructor() {
        this.form = document.getElementById('contactForm');
        this.submitBtn = this.form?.querySelector('.btn-submit');
        this.init();
    }
    
    init() {
        if (!this.form) return;
        
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Add real-time validation
        const inputs = this.form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearErrors(input));
        });
    }
    
    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let message = '';
        
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            message = 'This field is required';
        } else if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                message = 'Please enter a valid email address';
            }
        }
        
        this.showFieldError(field, isValid ? '' : message);
        return isValid;
    }
    
    showFieldError(field, message) {
        let errorElement = field.parentNode.querySelector('.field-error');
        
        if (message) {
            if (!errorElement) {
                errorElement = document.createElement('span');
                errorElement.className = 'field-error';
                errorElement.style.cssText = `
                    color: #ef4444;
                    font-size: 0.85rem;
                    margin-top: 8px;
                    display: block;
                    opacity: 0;
                    transform: translateY(-10px);
                    transition: all 0.3s ease;
                `;
                field.parentNode.appendChild(errorElement);
            }
            
            errorElement.textContent = message;
            requestAnimationFrame(() => {
                errorElement.style.opacity = '1';
                errorElement.style.transform = 'translateY(0)';
            });
            
            field.style.borderBottomColor = '#ef4444';
        } else {
            if (errorElement) {
                errorElement.remove();
            }
            field.style.borderBottomColor = '';
        }
    }
    
    clearErrors(field) {
        const errorElement = field.parentNode.querySelector('.field-error');
        if (errorElement) {
            errorElement.remove();
        }
        field.style.borderBottomColor = '';
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData);
        
        // Validate all fields
        const inputs = this.form.querySelectorAll('input, textarea');
        let isFormValid = true;
        
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isFormValid = false;
            }
        });
        
        if (!isFormValid) {
            this.showNotification('Please fix the errors above', 'error');
            return;
        }
        
        // Show loading state
        this.setLoadingState(true);
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            this.showNotification('Thank you! Your message has been sent successfully. I\'ll get back to you soon.', 'success');
            this.form.reset();
        } catch (error) {
            this.showNotification('Sorry, something went wrong. Please try again.', 'error');
        } finally {
            this.setLoadingState(false);
        }
    }
    
    setLoadingState(loading) {
        if (loading) {
            this.submitBtn.classList.add('loading');
            this.submitBtn.disabled = true;
        } else {
            this.submitBtn.classList.remove('loading');
            this.submitBtn.disabled = false;
        }
    }
    
    showNotification(message, type = 'success') {
        // Remove existing notification
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();
        
        // Create new notification
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">
                    ${type === 'success' ? '✓' : type === 'error' ? '⚠' : 'ℹ'}
                </span>
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 30px;
            right: 30px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 20px 25px;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
            z-index: 10000;
            max-width: 400px;
            transform: translateX(100%);
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        requestAnimationFrame(() => {
            notification.style.transform = 'translateX(0)';
        });
        
        // Add close functionality
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        });
        
        // Auto remove
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }
}

// Navbar Effects
class NavbarEffects {
    constructor() {
        this.navbar = document.querySelector('.navbar');
        this.init();
    }
    
    init() {
        const handleScroll = utils.throttle(() => {
            if (window.scrollY > 100) {
                this.navbar.style.background = 'rgba(248, 250, 252, 0.95)';
                this.navbar.style.boxShadow = '0 4px 20px rgba(15, 23, 42, 0.1)';
                this.navbar.style.backdropFilter = 'blur(20px)';
            } else {
                this.navbar.style.background = 'rgba(248, 250, 252, 0.8)';
                this.navbar.style.boxShadow = 'none';
            }
        }, 10);
        
        window.addEventListener('scroll', handleScroll);
    }
}

// Particle Background
class ParticleBackground {
    constructor() {
        this.canvas = this.createCanvas();
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.init();
    }
    
    createCanvas() {
        const canvas = document.createElement('canvas');
        canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: -1;
            opacity: 0.5;
        `;
        document.body.appendChild(canvas);
        return canvas;
    }
    
    init() {
        this.resize();
        this.createParticles();
        this.animate();
        
        window.addEventListener('resize', () => this.resize());
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    createParticles() {
        const particleCount = Math.floor((window.innerWidth * window.innerHeight) / 15000);
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                radius: Math.random() * 2 + 1,
                opacity: Math.random() * 0.5 + 0.2
            });
        }
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach(particle => {
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Bounce off edges
            if (particle.x < 0 || particle.x > this.canvas.width) particle.vx *= -1;
            if (particle.y < 0 || particle.y > this.canvas.height) particle.vy *= -1;
            
            // Draw particle
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(102, 126, 234, ${particle.opacity})`;
            this.ctx.fill();
        });
        
        // Connect nearby particles
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 100) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.strokeStyle = `rgba(102, 126, 234, ${(100 - distance) / 100 * 0.2})`;
                    this.ctx.lineWidth = 1;
                    this.ctx.stroke();
                }
            }
        }
        
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if device supports hover (not touch-only)
    const supportsHover = window.matchMedia('(hover: hover)').matches;
    
    if (supportsHover) {
        new CustomCursor();
        new TiltEffect();
        new ParticleBackground();
    }
    
    // Initialize other components
    new MobileNav();
    new SmoothScroll();
    new ActiveNav();
    new ScrollAnimations();
    new ContactForm();
    new NavbarEffects();
    
    // Initialize typewriter effect
    const typewriterElement = document.querySelector('.typewriter');
    if (typewriterElement) {
        const words = typewriterElement.dataset.words.split(',');
        new TypeWriter(typewriterElement, words);
    }
    
    // Add loading animation
    document.body.classList.add('loaded');
    
    // Console message
    console.log(`
    🚀 Portfolio loaded successfully!
    
    Features:
    • Custom cursor with interactions
    • Smooth scroll animations
    • 3D tilt effects on cards
    • Particle background
    • Responsive design
    • Form validation
    • And much more!
    
    Built with ❤️ by Vivek Shah
    `);
});

// Additional utility styles
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
    .notification-content {
        display: flex;
        align-items: center;
        gap: 12px;
        font-weight: 500;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
        margin-left: auto;
        opacity: 0.8;
        transition: opacity 0.2s ease;
    }
    
    .notification-close:hover {
        opacity: 1;
    }
    
    body.loaded {
        opacity: 1;
    }
    
    body {
        opacity: 0;
        transition: opacity 0.5s ease;
    }
`;
document.head.appendChild(additionalStyles);
