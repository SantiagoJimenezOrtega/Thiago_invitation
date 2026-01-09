import './style.css'
import './mobile-nav.css'
import './volume.css'
import './map-style.css'

document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('overlay');
  const main = document.querySelector('main');
  const hero = document.querySelector('.hero');
  const cards = document.querySelectorAll('.card');
  const wall = document.getElementById('wall');
  const wallSection = document.querySelector('.lights-wall');

  // Volume Controls
  const muteBtn = document.getElementById('mute-btn');
  const volSlider = document.getElementById('vol-slider');
  let audio; // Global audio instance

  function initAudio() {
    audio = new Audio('/music.mp3');
    audio.loop = true;
    audio.volume = 0.2;

    // Connect controls
    if (volSlider) {
      volSlider.addEventListener('input', (e) => {
        audio.volume = e.target.value;
        updateMuteIcon();
      });
    }

    if (muteBtn) {
      muteBtn.addEventListener('click', () => {
        if (audio.muted) {
          audio.muted = false;
          if (audio.paused) audio.play();
        } else {
          audio.muted = true;
        }
        updateMuteIcon();
      });
    }
  }

  function updateMuteIcon() {
    if (!audio) return;
    if (audio.muted || audio.volume === 0) {
      muteBtn.innerText = '🔇';
    } else {
      muteBtn.innerText = '🔊';
    }
  }

  // Attempt to play as soon as possible
  initAudio();

  // Try Autoplay immediately
  const playPromise = audio.play();
  if (playPromise !== undefined) {
    playPromise.catch(error => {
      console.log("Autoplay prevented. Waiting for user interaction.");
    });
  }

  // --- Intro Sequence ---
  overlay.addEventListener('click', () => {
    // Ensure audio is playing on click (Fallback for Autoplay policy)
    if (audio && audio.paused) {
      audio.play();
    }

    overlay.style.opacity = '0';
    setTimeout(() => {
      overlay.style.display = 'none';
      main.classList.add('visible');
      // Trigger Hero Animation
      hero.classList.add('animate');
    }, 1000);
  });

  // --- Particle/Spores Effect ---
  const canvas = document.getElementById('spores');
  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  class Particle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = (Math.random() - 0.5) * 0.5;
      this.size = Math.random() * 2 + 0.5;
      this.alpha = Math.random() * 0.5 + 0.1;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > width) this.x = Math.random() * width;
      if (this.y < 0 || this.y > height) this.y = Math.random() * height;
    }
    draw() {
      ctx.fillStyle = `rgba(180, 200, 255, ${this.alpha})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  for (let i = 0; i < 100; i++) particles.push(new Particle());

  function animateParticles() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(animateParticles);
  }
  animateParticles();

  // --- Scroll Observer ---
  const scrollElements = document.querySelectorAll('.card, .fade-in, .lights-wall');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        if (entry.target.classList.contains('lights-wall')) {
          entry.target.classList.add('active');
          startLightShow();
        }
      }
    });
  }, { threshold: 0.15 });

  scrollElements.forEach(el => observer.observe(el));

  // --- Wall Lights Logic ---
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const colors = ['#e71d36', '#2ec4b6', '#ff9f1c', '#fdfffc', '#e71d36'];
  const letterMap = {};

  // Clean wall first if needed, though usually empty on load
  wall.innerHTML = '';

  // Build the wall
  alphabet.split('').forEach(char => {
    const div = document.createElement('div');
    div.className = 'wall-letter';
    div.innerText = char;

    const bulb = document.createElement('div');
    bulb.className = 'bulb';
    const color = colors[Math.floor(Math.random() * colors.length)];
    bulb.style.setProperty('--color', color);

    div.appendChild(bulb);
    wall.appendChild(div);
    letterMap[char] = div;
  });

  // Animation Sequence for lights
  const message = "THIAGO";
  let letterIndex = 0;
  let lightInterval;

  function startLightShow() {
    if (lightInterval) return; // Prevent multiple intervals

    lightInterval = setInterval(() => {
      // Turn off all
      document.querySelectorAll('.wall-letter').forEach(l => l.classList.remove('lit'));

      // Light up current letter
      const char = message[letterIndex];
      // Handle space or unknown char
      if (letterMap[char]) letterMap[char].classList.add('lit');

      letterIndex = (letterIndex + 1) % message.length;
    }, 1000);
  }

  // --- RSVP Button ---
  document.getElementById('rsvp-btn').addEventListener('click', () => {
    const phoneNumber = "573175710585";
    const text = "¡Hola! Quiero confirmar mi asistencia al cumpleaños de Thiago 🚲";
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  });

  // --- Mobile Navigation Logic ---
  const navDownBtn = document.getElementById('nav-down');
  const sections = Array.from(document.querySelectorAll('section'));

  if (navDownBtn && sections.length > 0) {
    navDownBtn.addEventListener('click', () => {
      // Check if we are in "Back to Top" mode
      if (navDownBtn.innerHTML === '↑') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // Logic for Next Section
      const currentScroll = window.scrollY + 100; // Buffer
      let nextSectionIndex = -1;

      for (let i = 0; i < sections.length; i++) {
        // Find first section whose top is significantly below current scroll
        if (sections[i].offsetTop > currentScroll) {
          nextSectionIndex = i;
          break;
        }
      }

      if (nextSectionIndex !== -1) {
        sections[nextSectionIndex].scrollIntoView({ behavior: 'smooth' });
      } else {
        // Fallback if logic fails or at end
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });

    // Toggle arrow direction based on scroll position
    window.addEventListener('scroll', () => {
      // Use documentElement.scrollHeight for better accuracy
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const clientHeight = window.innerHeight;

      // Check if we are near the bottom (within 50px)
      const isBottom = (scrollTop + clientHeight) >= (scrollHeight - 50);

      if (isBottom) {
        navDownBtn.innerHTML = '↑';
      } else {
        navDownBtn.innerHTML = '↓';
      }
    });
  }
});
