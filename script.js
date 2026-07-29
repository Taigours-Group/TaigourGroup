// Three.js hero canvas
(function initThree() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas || !window.THREE) return;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0xffffff, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 5;

    // Gold particles
    const count = 120;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
        pos[i * 3]     = (Math.random() - 0.5) * 14;
        pos[i * 3 + 1] = (Math.random() - 0.5) * 8;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 4;
        vel[i * 3]     = (Math.random() - 0.5) * 0.003;
        vel[i * 3 + 1] = (Math.random() - 0.5) * 0.003;
        vel[i * 3 + 2] = 0;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

    const mat = new THREE.PointsMaterial({
        color: 0xC9A84C,
        size: 0.04,
        transparent: true,
        opacity: 0.35,
        sizeAttenuation: true
    });

    const points = new THREE.Points(geo, mat);
    scene.add(points);

    // Thin gold lines connecting nearby particles
    const lineMat = new THREE.LineBasicMaterial({ color: 0xC9A84C, transparent: true, opacity: 0.08 });
    let linesMesh = null;

    function buildLines() {
        if (linesMesh) scene.remove(linesMesh);
        const lineGeo = new THREE.BufferGeometry();
        const linePos = [];
        const threshold = 2.2;
        for (let i = 0; i < count; i++) {
            for (let j = i + 1; j < count; j++) {
                const dx = pos[i*3] - pos[j*3];
                const dy = pos[i*3+1] - pos[j*3+1];
                const dz = pos[i*3+2] - pos[j*3+2];
                const d = Math.sqrt(dx*dx + dy*dy + dz*dz);
                if (d < threshold) {
                    linePos.push(pos[i*3], pos[i*3+1], pos[i*3+2]);
                    linePos.push(pos[j*3], pos[j*3+1], pos[j*3+2]);
                }
            }
        }
        lineGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(linePos), 3));
        linesMesh = new THREE.LineSegments(lineGeo, lineMat);
        scene.add(linesMesh);
    }

    let frame = 0;
    function animate() {
        requestAnimationFrame(animate);
        frame++;

        for (let i = 0; i < count; i++) {
            pos[i*3]     += vel[i*3];
            pos[i*3+1]   += vel[i*3+1];
            if (Math.abs(pos[i*3])   > 7)  vel[i*3]   *= -1;
            if (Math.abs(pos[i*3+1]) > 4)  vel[i*3+1] *= -1;
        }
        geo.attributes.position.needsUpdate = true;

        if (frame % 3 === 0) buildLines();

        points.rotation.z += 0.0003;
        renderer.render(scene, camera);
    }

    function resize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
    resize();
    window.addEventListener('resize', resize);
    animate();
})();

// App init
document.addEventListener('DOMContentLoaded', function () {
    setupNav();
    setupScroll();
    setupAOS();
    setupContactForm();
});

function setupNav() {
    const toggle = document.getElementById('nav-toggle');
    const menu   = document.getElementById('nav-menu');
    if (!toggle || !menu) return;

    toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        menu.classList.toggle('active');
    });
    document.addEventListener('click', e => {
        if (!e.target.closest('.navbar')) {
            toggle.classList.remove('active');
            menu.classList.remove('active');
        }
    });
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            toggle.classList.remove('active');
            menu.classList.remove('active');
        }
    });

    menu.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            toggle.classList.remove('active');
            menu.classList.remove('active');
            const id = link.getAttribute('href').slice(1);
            scrollToSection(id);
        });
    });
}

function scrollToSection(id) {
    const el = document.getElementById(id);
    if (!el) return;
    const offset = 80;
    window.scrollTo({ top: el.offsetTop - offset, behavior: 'smooth' });
}

function setupScroll() {
    const navbar  = document.getElementById('navbar');
    const backTop = document.getElementById('backToTop');

    function onScroll() {
        const y = window.scrollY;
        navbar && navbar.classList.toggle('scrolled', y > 60);
        backTop && backTop.classList.toggle('visible', y > 500);
        updateActiveNav();
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    backTop && backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

function updateActiveNav() {
    const sections = ['home','about','branches','leadership','contact'];
    const offset = 120;
    let current = 'home';
    sections.forEach(id => {
        const el = document.getElementById(id);
        if (el && window.scrollY >= el.offsetTop - offset) current = id;
    });
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.toggle('active', link.dataset.section === current);
    });
}

function setupAOS() {
    const els = document.querySelectorAll('[data-aos]');
    if (!els.length) return;
    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('animated'); obs.unobserve(e.target); } });
    }, { threshold: 0.12 });
    els.forEach(el => obs.observe(el));
}

// Contact form
function setupContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!validateForm()) return;

        const name    = document.getElementById('name').value.trim();
        const email   = document.getElementById('email').value.trim();
        const company = document.getElementById('company').value.trim();
        const service = document.getElementById('service').value;
        const message = document.getElementById('message').value.trim();

        const text = encodeURIComponent(
            `Hello Taigours Group!\n\nName: ${name}\nEmail: ${email}${company ? '\nCompany: ' + company : ''}\nService: ${service}\n\nMessage:\n${message}`
        );
        window.open(`https://api.whatsapp.com/send?phone=9779766115626&text=${text}`, '_blank');
        showSuccess();
        form.reset();
    });

    form.querySelectorAll('input, select, textarea').forEach(field => {
        field.addEventListener('blur', () => validateField(field));
        field.addEventListener('input', () => clearError(field));
    });
}

function validateForm() {
    let valid = true;
    ['name','email','service','message'].forEach(id => {
        const f = document.getElementById(id);
        if (f && !validateField(f)) valid = false;
    });
    return valid;
}

function validateField(field) {
    const val = field.value.trim();
    let msg = '';
    if (field.required && !val) {
        msg = 'This field is required.';
    } else if (field.type === 'email' && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        msg = 'Enter a valid email address.';
    } else if (field.id === 'name' && val && val.length < 2) {
        msg = 'Name must be at least 2 characters.';
    } else if (field.id === 'message' && val && val.length < 10) {
        msg = 'Message must be at least 10 characters.';
    }
    const err = document.getElementById(field.id + 'Error');
    if (err) {
        err.textContent = msg;
        err.classList.toggle('show', !!msg);
    }
    field.classList.toggle('border-red-400', !!msg);
    return !msg;
}

function clearError(field) {
    const err = document.getElementById(field.id + 'Error');
    if (err) { err.textContent = ''; err.classList.remove('show'); }
    field.classList.remove('border-red-400');
}

function showSuccess() {
    const el = document.createElement('div');
    el.className = 'fixed top-6 right-6 bg-white border border-gold text-gray-900 px-6 py-4 text-sm z-50 shadow-lg rounded-2xl';
    el.style.cssText = 'border-color:#C9A84C;animation:fadeInUp 0.4s ease both';
    el.innerHTML = '<i class="fas fa-check text-gold mr-2" style="color:#C9A84C"></i>Message sent via WhatsApp!';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3500);
}
