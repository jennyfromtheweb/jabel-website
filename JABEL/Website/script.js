/* =============================================================
   JABEL Website — Main Script
   ============================================================= */

document.addEventListener('DOMContentLoaded', () => {

  // ── Mobile hamburger menu ──────────────────────────────────
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const open = mobileMenu.classList.toggle('open');
      hamburger.classList.toggle('open', open);
      hamburger.setAttribute('aria-expanded', open);
      mobileMenu.setAttribute('aria-hidden', !open);
    });
    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
        mobileMenu.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', false);
      }
    });
  }

  // ── Highlight active nav link ──────────────────────────────
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__item > a, .nav__mobile-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href && href.split('#')[0] === currentPath) {
      link.classList.add('active');
    }
  });

  // ── Donation widget ────────────────────────────────────────
  const donateWidget = document.getElementById('donate-widget');
  if (donateWidget) {
    const tabs     = donateWidget.querySelectorAll('.donate-tab');
    const amounts  = donateWidget.querySelectorAll('.donate-amount');
    const custom   = donateWidget.querySelector('.donate-custom');
    const submitBtn = donateWidget.querySelector('.donate-submit');
    let selectedAmount = 50;
    let frequency = 'one-time';

    // TODO: Replace with your PayLink/PayPal URL
    // e.g. 'https://paylink.com/jabel' or 'https://paypal.me/JABEL'
    const DONATE_URL = '#'; // ← replace with actual payment URL

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        frequency = tab.dataset.freq;
      });
    });

    amounts.forEach(btn => {
      btn.addEventListener('click', () => {
        amounts.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedAmount = parseInt(btn.dataset.amount);
        if (custom) custom.value = selectedAmount;
      });
    });

    if (custom) {
      custom.addEventListener('input', () => {
        amounts.forEach(b => b.classList.remove('active'));
        selectedAmount = parseFloat(custom.value) || 0;
      });
    }

    if (submitBtn) {
      submitBtn.addEventListener('click', () => {
        const amt = selectedAmount || parseFloat(custom?.value) || 0;
        if (amt <= 0) { alert('Please enter a donation amount.'); return; }
        // Redirect to payment page.
        // For PayLink/PayPal: append amount as query param if supported.
        const url = DONATE_URL === '#'
          ? null
          : `${DONATE_URL}?amount=${amt}&frequency=${frequency}`;
        if (url) window.location.href = url;
        else alert(`Donation of $${amt} (${frequency}) — payment link coming soon!`);
      });
    }
  }

  // ── Blog: load from Substack RSS (or show static placeholders) ──
  //
  // TO CONNECT ANABEL'S SUBSTACK:
  //   1. Replace SUBSTACK_URL below with Anabel's Substack RSS feed URL
  //      e.g. 'https://anabelvelasquez.substack.com/feed'
  //   2. Set USE_RSS = true
  //   3. The section will auto-populate with her latest posts
  //
  // TO USE A CMS INSTEAD:
  //   - Recommended: Decap CMS (free, open-source)
  //     https://decapcms.org — works with Netlify hosting + GitHub
  //   - Netlify Identity handles logins so Anabel can write posts
  //     directly from a web interface, no code knowledge needed.
  //
  const USE_RSS     = false;               // ← set true when Substack URL is ready
  const SUBSTACK_URL = '';                 // ← e.g. 'https://yoursubstack.substack.com/feed'

  const blogGrid = document.getElementById('blog-grid');
  if (blogGrid) {
    if (USE_RSS && SUBSTACK_URL) {
      loadSubstackPosts(blogGrid, SUBSTACK_URL);
    }
    // If USE_RSS is false, static placeholder posts (in HTML) stay visible.
  }

  async function loadSubstackPosts(container, feedUrl) {
    container.classList.add('loading');
    try {
      // Use RSS2JSON or a CORS proxy to fetch the feed client-side
      const proxy = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}&count=3`;
      const res = await fetch(proxy);
      const data = await res.json();
      if (data.status !== 'ok') throw new Error('Feed error');
      container.innerHTML = '';
      data.items.forEach(item => {
        const date = new Date(item.pubDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        const excerpt = item.description.replace(/<[^>]+>/g, '').slice(0, 160) + '…';
        container.innerHTML += `
          <article class="card">
            <div class="card__img">${item.thumbnail ? `<img src="${item.thumbnail}" alt="">` : '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>'}</div>
            <div class="card__body">
              <p class="card__label">Anabel's Blog</p>
              <h3 class="card__title">${item.title}</h3>
              <p class="card__excerpt">${excerpt}</p>
            </div>
            <div class="card__footer">
              <span class="card__date">${date}</span>
              <a href="${item.link}" target="_blank" rel="noopener" class="card__link">Read →</a>
            </div>
          </article>`;
      });
    } catch (err) {
      console.warn('Could not load blog feed:', err);
      // Fall back to static placeholders already in HTML
    }
    container.classList.remove('loading');
  }

  // ── Smooth scroll for anchor links ────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const id = anchor.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ── Newsletter form ────────────────────────────────────────
  const newsletterForm = document.getElementById('newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = newsletterForm.querySelector('input[type="email"]').value;
      if (email) {
        // TODO: wire up to Mailchimp / ConvertKit / etc.
        newsletterForm.innerHTML = '<p style="color:#3CCFCF;font-weight:600">✓ Thank you for subscribing!</p>';
      }
    });
  }

  // ── Contact form ───────────────────────────────────────────
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      // TODO: wire up to Formspree, Netlify Forms, or email service
      // Example with Formspree: set action="https://formspree.io/f/YOUR_ID" method="POST"
      const btn = contactForm.querySelector('[type="submit"]');
      btn.textContent = 'Message sent! ✓';
      btn.disabled = true;
    });
  }

});
