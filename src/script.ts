/* ===== EcoSachet – Interactive TypeScript ===== */

document.addEventListener('DOMContentLoaded', (): void => {
    // Preloader
    initPreloader();

    // Particles
    initParticles();

    // Navigation
    initNavbar();

    // Scroll Animations
    initScrollAnimations();

    // Progress Rings
    initProgressRings();

    // Counter Animations
    initCounters();

    // Smooth Scroll
    initSmoothScroll();
});

/* ===== PRELOADER ===== */
function initPreloader(): void {
    const preloader = document.getElementById('preloader');
    if (!preloader) return;

    window.addEventListener('load', (): void => {
        setTimeout((): void => {
            preloader.classList.add('hidden');
            document.body.style.overflow = '';
        }, 800);
    });

    // Fallback: hide preloader after 3s
    setTimeout((): void => {
        preloader.classList.add('hidden');
        document.body.style.overflow = '';
    }, 3000);
}

/* ===== PARTICLES ===== */
function initParticles(): void {
    const canvas = document.getElementById('particles-canvas') as HTMLCanvasElement | null;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: Particle[] = [];
    let animationId: number;

    function resize(): void {
        canvas!.width = window.innerWidth;
        canvas!.height = window.innerHeight;
    }

    window.addEventListener('resize', resize);
    resize();

    class Particle {
        x: number = 0;
        y: number = 0;
        size: number = 0;
        speedX: number = 0;
        speedY: number = 0;
        opacity: number = 0;
        hue: number = 0;

        constructor() {
            this.reset();
        }

        reset(): void {
            this.x = Math.random() * canvas!.width;
            this.y = Math.random() * canvas!.height;
            this.size = Math.random() * 2 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.3;
            this.speedY = (Math.random() - 0.5) * 0.3;
            this.opacity = Math.random() * 0.5 + 0.1;
            this.hue = 140 + Math.random() * 40; // Green hues
        }

        update(): void {
            this.x += this.speedX;
            this.y += this.speedY;

            if (this.x < 0 || this.x > canvas!.width) this.speedX *= -1;
            if (this.y < 0 || this.y > canvas!.height) this.speedY *= -1;
        }

        draw(): void {
            ctx!.beginPath();
            ctx!.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx!.fillStyle = `hsla(${this.hue}, 60%, 60%, ${this.opacity})`;
            ctx!.fill();
        }
    }

    // Create particles
    const particleCount: number = Math.min(80, Math.floor(window.innerWidth / 20));
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    function drawLines(): void {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx: number = particles[i].x - particles[j].x;
                const dy: number = particles[i].y - particles[j].y;
                const dist: number = Math.sqrt(dx * dx + dy * dy);

                if (dist < 120) {
                    const opacity: number = (1 - dist / 120) * 0.15;
                    ctx!.beginPath();
                    ctx!.moveTo(particles[i].x, particles[i].y);
                    ctx!.lineTo(particles[j].x, particles[j].y);
                    ctx!.strokeStyle = `rgba(82, 183, 136, ${opacity})`;
                    ctx!.lineWidth = 0.5;
                    ctx!.stroke();
                }
            }
        }
    }

    function animate(): void {
        ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

        particles.forEach((p: Particle): void => {
            p.update();
            p.draw();
        });

        drawLines();

        animationId = requestAnimationFrame(animate);
    }

    animate();

    // Pause when tab is hidden
    document.addEventListener('visibilitychange', (): void => {
        if (document.hidden) {
            cancelAnimationFrame(animationId);
        } else {
            animate();
        }
    });
}

/* ===== NAVBAR ===== */
function initNavbar(): void {
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('nav-toggle');
    const navLinks = document.getElementById('nav-links');

    if (!navbar || !navToggle || !navLinks) return;

    // Scroll behavior
    window.addEventListener('scroll', (): void => {
        const scrollY: number = window.scrollY;

        if (scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile toggle
    navToggle.addEventListener('click', (): void => {
        navToggle.classList.toggle('active');
        navLinks.classList.toggle('open');

        // Overlay
        let overlay = document.querySelector('.nav-overlay') as HTMLElement | null;
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.classList.add('nav-overlay');
            document.body.appendChild(overlay);
            overlay.addEventListener('click', (): void => {
                navToggle.classList.remove('active');
                navLinks.classList.remove('open');
                overlay!.classList.remove('show');
            });
        }
        overlay.classList.toggle('show');
    });

    // Close nav on link click (mobile)
    navLinks.querySelectorAll('.nav-link').forEach((link: Element): void => {
        link.addEventListener('click', (): void => {
            navToggle.classList.remove('active');
            navLinks.classList.remove('open');
            const overlay = document.querySelector('.nav-overlay') as HTMLElement | null;
            if (overlay) overlay.classList.remove('show');
        });
    });

    // Active link tracking
    const sections = document.querySelectorAll<HTMLElement>('section[id]');

    window.addEventListener('scroll', (): void => {
        const scrollPos: number = window.scrollY + 100;

        sections.forEach((section: HTMLElement): void => {
            const top: number = section.offsetTop;
            const height: number = section.offsetHeight;
            const id: string | null = section.getAttribute('id');
            const link = navLinks.querySelector(`a[href="#${id}"]`) as HTMLElement | null;

            if (link) {
                if (scrollPos >= top && scrollPos < top + height) {
                    navLinks.querySelectorAll('.nav-link').forEach((l: Element): void => l.classList.remove('active'));
                    link.classList.add('active');
                }
            }
        });
    });
}

/* ===== SCROLL ANIMATIONS ===== */
function initScrollAnimations(): void {
    const elements = document.querySelectorAll<HTMLElement>('[data-animate]');

    const observer = new IntersectionObserver((entries: IntersectionObserverEntry[]): void => {
        entries.forEach((entry: IntersectionObserverEntry): void => {
            if (entry.isIntersecting) {
                const target = entry.target as HTMLElement;
                const delay: string = target.dataset.delay || '0';
                setTimeout((): void => {
                    target.classList.add('visible');
                }, parseInt(delay));
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    elements.forEach((el: HTMLElement): void => observer.observe(el));
}

/* ===== PROGRESS RINGS ===== */
function initProgressRings(): void {
    const rings = document.querySelectorAll<HTMLElement>('.progress-ring');

    const observer = new IntersectionObserver((entries: IntersectionObserverEntry[]): void => {
        entries.forEach((entry: IntersectionObserverEntry): void => {
            if (entry.isIntersecting) {
                const ring = entry.target as HTMLElement;
                const progress: number = parseInt(ring.dataset.progress || '0');
                const circle = ring.querySelector('.ring-fill') as SVGCircleElement | null;
                if (!circle) return;

                const circumference: number = 2 * Math.PI * 52; // r=52
                const offset: number = circumference * (progress / 100);

                setTimeout((): void => {
                    circle.style.strokeDasharray = `${offset} ${circumference}`;
                }, 300);

                observer.unobserve(ring);
            }
        });
    }, { threshold: 0.5 });

    rings.forEach((ring: HTMLElement): void => observer.observe(ring));
}

/* ===== COUNTER ANIMATIONS ===== */
function initCounters(): void {
    const counters = document.querySelectorAll<HTMLElement>('[data-count]');

    const observer = new IntersectionObserver((entries: IntersectionObserverEntry[]): void => {
        entries.forEach((entry: IntersectionObserverEntry): void => {
            if (entry.isIntersecting) {
                const el = entry.target as HTMLElement;
                const target: number = parseInt(el.dataset.count || '0');
                animateCount(el, 0, target, 1500);
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach((counter: HTMLElement): void => observer.observe(counter));
}

function animateCount(el: HTMLElement, start: number, end: number, duration: number): void {
    const startTime: number = performance.now();

    function update(currentTime: number): void {
        const elapsed: number = currentTime - startTime;
        const progress: number = Math.min(elapsed / duration, 1);
        const eased: number = 1 - Math.pow(1 - progress, 3); // easeOutCubic

        const current: number = Math.round(start + (end - start) * eased);
        el.textContent = current.toString();

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

/* ===== SMOOTH SCROLL ===== */
function initSmoothScroll(): void {
    document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((link: HTMLAnchorElement): void => {
        link.addEventListener('click', (e: Event): void => {
            const href = link.getAttribute('href');
            if (!href) return;
            const target = document.querySelector(href) as HTMLElement | null;
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

/* ===== PARALLAX EFFECT (subtle) ===== */
window.addEventListener('scroll', (): void => {
    const scrollY: number = window.scrollY;

    const shapes = document.querySelectorAll<HTMLElement>('.shape');
    shapes.forEach((shape: HTMLElement, i: number): void => {
        const speed: number = 0.05 * (i + 1);
        shape.style.transform = `translateY(${scrollY * speed}px)`;
    });
});
