window.addEventListener('DOMContentLoaded', function () {

  // NAVBAR SCROLL
  var navbar = document.getElementById('navbar');
  window.addEventListener('scroll', function () {
    if (window.scrollY > 50) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  });

  // HAMBURGER
  document.getElementById('hamburger').addEventListener('click', function () {
    document.getElementById('nav-links').classList.toggle('open');
  });

  // NAV SMOOTH SCROLL
  document.querySelectorAll('.nav-links a').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var target = document.querySelector(this.getAttribute('href'));
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
      document.getElementById('nav-links').classList.remove('open');
    });
  });

  // HIRE ME — open modal
  var modal = document.getElementById('hire-modal');
  var hireBtn = document.getElementById('hire-btn');
  if (hireBtn && modal) {
    hireBtn.addEventListener('click', function () {
      modal.classList.add('open');
    });
  }
  var modalClose = document.getElementById('modal-close');
  if (modalClose) {
    modalClose.addEventListener('click', function () {
      modal.classList.remove('open');
    });
  }
  if (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target === modal) modal.classList.remove('open');
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal) modal.classList.remove('open');
  });

  // VIEW WORK
  var viewWorkBtn = document.getElementById('view-work-btn');
  if (viewWorkBtn) {
    viewWorkBtn.addEventListener('click', function () {
      document.getElementById('projects').scrollIntoView({ behavior: 'smooth' });
    });
  }

  // SCROLL DOWN ARROW
  var scrollDown = document.querySelector('.scroll-down');
  if (scrollDown) {
    scrollDown.addEventListener('click', function (e) {
      e.preventDefault();
      document.getElementById('about').scrollIntoView({ behavior: 'smooth' });
    });
  }

  // TYPING EFFECT
  var roles = ['Software Developer', 'Problem Solver', 'CS Graduate', 'Web Developer', 'Tech Enthusiast'];
  var roleIndex = 0, charIndex = 0, isDeleting = false;
  var roleText = document.getElementById('role-text');
  function type() {
    var current = roles[roleIndex];
    roleText.textContent = isDeleting ? current.substring(0, charIndex--) : current.substring(0, charIndex++);
    var delay = isDeleting ? 60 : 100;
    if (!isDeleting && charIndex === current.length + 1) { delay = 1800; isDeleting = true; }
    else if (isDeleting && charIndex === 0) { isDeleting = false; roleIndex = (roleIndex + 1) % roles.length; delay = 400; }
    setTimeout(type, delay);
  }
  type();

  // SKILL BARS
  var barObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.style.width = entry.target.dataset.width + '%';
        barObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  document.querySelectorAll('.bar-fill').forEach(function (bar) { barObserver.observe(bar); });

  // HIRE FORM SUBMIT
  document.getElementById('hire-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    var note = document.getElementById('hire-form-note');
    var btn = this.querySelector('button[type="submit"]');
    var original = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    btn.disabled = true;
    note.textContent = '';
    note.style.color = 'var(--accent)';
    var data = {
      name: document.getElementById('h-name').value.trim(),
      email: document.getElementById('h-email').value.trim(),
      subject: document.getElementById('h-subject').value.trim(),
      message: document.getElementById('h-message').value.trim(),
    };
    try {
      var res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      var json = await res.json();
      if (json.success) {
        note.textContent = 'Message sent! I will get back to you soon.';
        this.reset();
        setTimeout(function () { modal.classList.remove('open'); }, 2500);
      } else {
        note.style.color = 'var(--secondary)';
        note.textContent = json.error || 'Something went wrong.';
      }
    } catch (err) {
      note.style.color = 'var(--secondary)';
      note.textContent = 'Network error. Make sure the server is running.';
    } finally {
      btn.innerHTML = original;
      btn.disabled = false;
    }
  });

  // CONTACT FORM SUBMIT
  document.getElementById('contact-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    var note = document.getElementById('form-note');
    var btn = this.querySelector('button[type="submit"]');
    var original = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    btn.disabled = true;
    note.textContent = '';
    note.style.color = 'var(--accent)';
    var data = {
      name: document.getElementById('name').value.trim(),
      email: document.getElementById('email').value.trim(),
      subject: document.getElementById('subject').value.trim(),
      message: document.getElementById('message').value.trim(),
    };
    try {
      var res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      var json = await res.json();
      if (json.success) {
        note.textContent = 'Message sent successfully. I will get back to you soon!';
        this.reset();
      } else {
        note.style.color = 'var(--secondary)';
        note.textContent = json.error || 'Something went wrong.';
      }
    } catch (err) {
      note.style.color = 'var(--secondary)';
      note.textContent = 'Network error. Make sure the server is running.';
    } finally {
      btn.innerHTML = original;
      btn.disabled = false;
      setTimeout(function () { note.textContent = ''; }, 5000);
    }
  });

});
