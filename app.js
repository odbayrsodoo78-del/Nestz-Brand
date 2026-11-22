document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // 1. STATE-BASED ROUTING SYSTEM
  // ==========================================
  const state = {
    currentRoute: 'home',
    lastTransaction: null
  };

  const routeTitles = {
    home: 'Welcome to NestZ Brand',
    about: 'About NestZ Brand',
    contact: 'Contact Us',
    checkout: 'Secure Checkout',
    thankyou: 'Order Confirmation'
  };

  function navigateTo(route) {
    if (!routeTitles[route]) route = 'home';
    state.currentRoute = route;

    // Update URL hash without page reload
    window.history.replaceState({ route }, '', `#${route}`);

    // Update active view
    document.querySelectorAll('.route-view').forEach(section => {
      section.classList.remove('active');
    });
    const activeSection = document.getElementById(`view-${route}`);
    if (activeSection) {
      activeSection.classList.add('active');
      triggerRevealAnimations(activeSection);
    }

    // Update sidebar active state
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.route === route);
    });

    // Update Topbar title
    const titleEl = document.getElementById('topbarTitle');
    if (titleEl) titleEl.textContent = routeTitles[route];

    // Close mobile sidebar if open
    document.getElementById('sidebar')?.classList.remove('open');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Bind all route triggers (Navbar, Footer, Buttons, Cards)
  document.querySelectorAll('[data-route]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const targetRoute = el.getAttribute('data-route');
      navigateTo(targetRoute);
    });
  });

  // Mobile Menu Toggle
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const sidebar = document.getElementById('sidebar');
  if (mobileMenuBtn && sidebar) {
    mobileMenuBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }

  // Initial route check from URL hash
  const initialHash = window.location.hash.replace('#', '');
  navigateTo(routeTitles[initialHash] ? initialHash : 'home');

  // ==========================================
  // 2. STAGGERED VIEWPORT REVEAL ANIMATIONS
  // ==========================================
  function triggerRevealAnimations(container = document) {
    const items = container.querySelectorAll('.reveal');
    items.forEach((item, index) => {
      item.classList.remove('is-visible');
      setTimeout(() => {
        item.classList.add('is-visible');
      }, index * 60);
    });
  }

  // ==========================================
  // 3. CONTACT FORM (FORMSUBMIT.CO INTEGRATION)
  // ==========================================
  const contactForm = document.getElementById('contactForm');
  const formFeedback = document.getElementById('formFeedback');
  const contactSubmitBtn = document.getElementById('contactSubmitBtn');

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(contactForm);
      // Honeypot check
      if (formData.get('_honey')) return;

      contactSubmitBtn.disabled = true;
      contactSubmitBtn.textContent = 'Илгээж байна...';
      formFeedback.className = 'form-feedback hidden';

      try {
        const response = await fetch('https://formsubmit.co/ajax/odbayrsodoo78@gmail.com', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            name: formData.get('name'),
            email: formData.get('email'),
            message: formData.get('message'),
            _captcha: 'false',
            _subject: 'NestZ Brand — Шинэ холбоо барих зурвас'
          })
        });

        if (response.ok) {
          formFeedback.textContent = 'Амжилттай илгээгдлээ! Бид тантай удахгүй холбогдох болно.';
          formFeedback.className = 'form-feedback success';
          contactForm.reset();
        } else {
          throw new Error('Submission failed');
        }
      } catch (err) {
        formFeedback.textContent = 'Алдаа гарлаа. Та дахин оролдоно уу эсвэл +9768847922* дугаарт холбогдоно уу.';
        formFeedback.className = 'form-feedback error';
      } finally {
        contactSubmitBtn.disabled = false;
        contactSubmitBtn.textContent = 'Зурвас илгээх';
      }
    });
  }

  // ==========================================
  // 4. FLOATING GEMINI CHATBOT WIDGET
  // ==========================================
  const chatToggleBtn = document.getElementById('chatToggleBtn');
  const chatCloseBtn = document.getElementById('chatCloseBtn');
  const chatWindow = document.getElementById('chatWindow');
  const chatForm = document.getElementById('chatForm');
  const chatInput = document.getElementById('chatInput');
  const chatMessages = document.getElementById('chatMessages');

  chatToggleBtn?.addEventListener('click', () => {
    chatWindow.classList.toggle('hidden');
    if (!chatWindow.classList.contains('hidden')) {
      chatInput.focus();
    }
  });

  chatCloseBtn?.addEventListener('click', () => {
    chatWindow.classList.add('hidden');
  });

  function appendChatMessage(text, sender) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-msg ${sender === 'user' ? 'user-msg' : 'bot-msg'}`;
    msgDiv.textContent = text;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return msgDiv;
  }

  chatForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = chatInput.value.trim();
    if (!message) return;

    appendChatMessage(message, 'user');
    chatInput.value = '';

    const loadingBubble = appendChatMessage('Бичиж байна...', 'bot');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });

      const data = await res.json();
      loadingBubble.textContent = data.reply || 'Уучлаарай, хариу өгөхөд алдаа гарлаа.';
    } catch (error) {
      loadingBubble.textContent = 'Холболтын алдаа гарлаа. Та түр хүлээгээд дахин оролдоно уу.';
    }
  });

  // ==========================================
  // 5. PAYPAL & QPAY CHECKOUT ($10 USD)
  // ==========================================
  function completeOrderAndRedirect(details) {
    const receiptData = {
      orderId: details.id || 'NZ-' + Date.now(),
      provider: details.provider || 'PayPal',
      amount: '$10.00 USD',
      status: 'COMPLETED',
      date: new Date().toLocaleString()
    };

    localStorage.setItem('nestz_last_transaction', JSON.stringify(receiptData));
    state.lastTransaction = receiptData;

    const receiptBox = document.getElementById('transactionReceipt');
    if (receiptBox) {
      receiptBox.innerHTML = `
        <p><strong>Захиалгын дугаар:</strong> ${receiptData.orderId}</p>
        <p><strong>Төлбөрийн хэлбэр:</strong> ${receiptData.provider}</p>
        <p><strong>Төлсөн дүн:</strong> ${receiptData.amount}</p>
        <p><strong>Огноо:</strong> ${receiptData.date}</p>
      `;
    }

    navigateTo('thankyou');
  }

  // Initialize PayPal Buttons if SDK is loaded
  if (window.paypal && document.getElementById('paypal-button-container')) {
    window.paypal.Buttons({
      createOrder: async () => {
        const res = await fetch('/api/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ provider: 'paypal', amount: '10.00' })
        });
        const order = await res.json();
        return order.id;
      },
      onApprove: async (data) => {
        const res = await fetch('/api/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'capture', orderID: data.orderID })
        });
        const captureData = await res.json();
        completeOrderAndRedirect({
          id: captureData.id || data.orderID,
          provider: 'PayPal'
        });
      },
      onError: () => {
        const statusMsg = document.getElementById('paymentStatusMsg');
        statusMsg.textContent = 'PayPal төлбөр боловсруулахад алдаа гарлаа.';
        statusMsg.className = 'form-feedback error';
      }
    }).render('#paypal-button-container');
  }

  // QPay Checkout Handler
  const qpayCheckoutBtn = document.getElementById('qpayCheckoutBtn');
  const qpayQrBox = document.getElementById('qpayQrBox');
  const confirmQpayMockBtn = document.getElementById('confirmQpayMockBtn');

  qpayCheckoutBtn?.addEventListener('click', async () => {
    qpayQrBox.classList.remove('hidden');
    try {
      await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'qpay', amount: '10.00' })
      });
    } catch (_) {
      // Fallback handled on confirmation
    }
  });

  confirmQpayMockBtn?.addEventListener('click', () => {
    completeOrderAndRedirect({
      id: 'QPAY-' + Math.floor(100000 + Math.random() * 900000),
      provider: 'QPay'
    });
  });
});
