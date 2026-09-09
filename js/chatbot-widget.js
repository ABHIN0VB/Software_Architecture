/* ============================================
   FEASTFLEET — AI Chatbot Widget
   Auto-opens on page load, minimizable, user-aware
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {

  // ── INJECT STYLES ──
  const style = document.createElement('style');
  style.textContent = `
    #ff-chatbot-widget {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 10000;
      font-family: 'Inter', -apple-system, sans-serif;
    }

    /* Floating toggle button */
    #ff-chatbot-toggle {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: #12121a;
      border: 2px solid #FF6B35;
      cursor: pointer;
      box-shadow: 0 6px 24px rgba(255,107,53,0.45);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      padding: 0;
      transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
    }
    #ff-chatbot-toggle img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      border-radius: 50%;
    }
    #ff-chatbot-toggle:hover {
      transform: scale(1.1);
      box-shadow: 0 8px 32px rgba(255,107,53,0.6);
      border-color: #FFB347;
    }
    #ff-chatbot-toggle.hidden { display: none !important; }

    /* Chat Panel */
    #ff-chatbot-panel {
      width: 370px;
      height: 520px;
      background: #12121a;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 16px;
      box-shadow: 0 12px 48px rgba(0,0,0,0.5);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      position: absolute;
      bottom: 0;
      right: 0;
      transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
    }
    #ff-chatbot-panel.minimized {
      opacity: 0;
      transform: scale(0.8) translateY(20px);
      pointer-events: none;
    }

    /* Header */
    #ff-chatbot-header {
      background: linear-gradient(135deg, #FF6B35, #FFB347);
      color: white;
      padding: 14px 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-shrink: 0;
    }
    #ff-chatbot-header .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
      font-weight: 700;
      font-size: 0.95rem;
    }
    #ff-chatbot-header .bot-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      overflow: hidden;
      border: 1.5px solid rgba(255,255,255,0.6);
      box-shadow: 0 2px 8px rgba(0,0,0,0.25);
      display: flex;
      align-items: center;
      justify-content: center;
      background: #12121a;
      flex-shrink: 0;
    }
    #ff-chatbot-header .bot-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    #ff-chatbot-header .header-status {
      font-size: 0.75rem;
      font-weight: 400;
      opacity: 0.9;
    }
    #ff-chatbot-minimize {
      background: rgba(255,255,255,0.2);
      border: none;
      color: white;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }
    #ff-chatbot-minimize:hover {
      background: rgba(255,255,255,0.35);
    }

    /* Messages */
    #ff-chatbot-messages {
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 10px;
      background: #0e0e16;
    }
    #ff-chatbot-messages::-webkit-scrollbar { width: 4px; }
    #ff-chatbot-messages::-webkit-scrollbar-track { background: transparent; }
    #ff-chatbot-messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }

    .ff-msg {
      max-width: 85%;
      padding: 11px 15px;
      border-radius: 14px;
      font-size: 0.85rem;
      line-height: 1.5;
      white-space: pre-wrap;
      word-break: break-word;
      animation: ffMsgIn 0.3s ease;
    }
    @keyframes ffMsgIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .ff-msg.bot {
      background: rgba(255,255,255,0.07);
      color: #e0e0e5;
      align-self: flex-start;
      border-bottom-left-radius: 4px;
    }
    .ff-msg.user {
      background: linear-gradient(135deg, #FF6B35, #e05a2d);
      color: white;
      align-self: flex-end;
      border-bottom-right-radius: 4px;
    }
    .ff-msg.typing {
      background: rgba(255,255,255,0.05);
      color: rgba(255,255,255,0.4);
      font-style: italic;
    }

    /* Quick Replies */
    #ff-chatbot-quick-replies {
      padding: 10px 16px;
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      background: #0e0e16;
      border-top: 1px solid rgba(255,255,255,0.05);
      flex-shrink: 0;
    }
    .ff-quick-btn {
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.1);
      padding: 7px 14px;
      border-radius: 20px;
      font-size: 0.75rem;
      color: #ccc;
      cursor: pointer;
      transition: all 0.2s;
      font-family: inherit;
    }
    .ff-quick-btn:hover {
      background: rgba(255,107,53,0.15);
      border-color: rgba(255,107,53,0.3);
      color: #FF6B35;
    }

    /* Input Area */
    #ff-chatbot-input-area {
      display: flex;
      padding: 12px 14px;
      background: #12121a;
      border-top: 1px solid rgba(255,255,255,0.06);
      gap: 8px;
      flex-shrink: 0;
    }
    #ff-chatbot-input {
      flex: 1;
      padding: 10px 16px;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 24px;
      background: rgba(255,255,255,0.05);
      color: #f0f0f5;
      font-size: 0.85rem;
      outline: none;
      font-family: inherit;
      transition: border-color 0.2s;
    }
    #ff-chatbot-input::placeholder { color: rgba(255,255,255,0.3); }
    #ff-chatbot-input:focus { border-color: rgba(255,107,53,0.4); }

    #ff-chatbot-send {
      background: linear-gradient(135deg, #FF6B35, #FFB347);
      border: none;
      color: white;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s;
      flex-shrink: 0;
    }
    #ff-chatbot-send:hover { transform: scale(1.08); }

    /* Mobile */
    @media (max-width: 480px) {
      #ff-chatbot-panel {
        width: calc(100vw - 32px);
        height: calc(100vh - 100px);
        bottom: 0;
        right: -8px;
      }
    }
  `;
  document.head.appendChild(style);

  // Check login state for customized initial message
  const currentUser = (typeof API !== 'undefined') ? API.getUser() : null;
  const initialGreeting = currentUser
    ? `👋 Welcome back, ${currentUser.name}! I'm ready to assist. You can ask me to track your order, explore recommendations, or view menus.`
    : `👋 Hey there! I'm the FeastFleet AI assistant. Ask me anything — order status, menu suggestions, delivery info, or just say hi!`;

  // ── INJECT HTML ──
  const widget = document.createElement('div');
  widget.id = 'ff-chatbot-widget';
  widget.innerHTML = `
    <button id="ff-chatbot-toggle" class="hidden" title="FeastFleet AI Assistant">
      <img src="images/chatbot-logo.jpg" alt="FeastFleet AI Chef">
    </button>
    <div id="ff-chatbot-panel">
      <div id="ff-chatbot-header">
        <div class="header-left">
          <div class="bot-avatar">
            <img src="images/chatbot-logo.jpg" alt="FeastFleet AI Assistant">
          </div>
          <div>
            <div>FeastFleet AI</div>
            <div class="header-status">${currentUser ? `● Signed in as ${currentUser.name.split(' ')[0]}` : '● Smart Food Assistant'}</div>
          </div>
        </div>
        <button id="ff-chatbot-minimize" title="Minimize Chatbot">▾</button>
      </div>
      <div id="ff-chatbot-messages">
        <div class="ff-msg bot">${initialGreeting}</div>
      </div>
      <div id="ff-chatbot-quick-replies">
        <button class="ff-quick-btn">📍 Track Order</button>
        <button class="ff-quick-btn">✨ AI Ingredients</button>
        <button class="ff-quick-btn">🍔 View Menu</button>
        <button class="ff-quick-btn">💡 Recommend</button>
        <button class="ff-quick-btn">❓ Help</button>
      </div>
      <div id="ff-chatbot-input-area">
        <input type="text" id="ff-chatbot-input" placeholder="Ask anything about food or orders...">
        <button id="ff-chatbot-send">➤</button>
      </div>
    </div>
  `;
  document.body.appendChild(widget);

  // ── ELEMENTS ──
  const toggleBtn = document.getElementById('ff-chatbot-toggle');
  const panel = document.getElementById('ff-chatbot-panel');
  const minimizeBtn = document.getElementById('ff-chatbot-minimize');
  const messages = document.getElementById('ff-chatbot-messages');
  const input = document.getElementById('ff-chatbot-input');
  const sendBtn = document.getElementById('ff-chatbot-send');
  const quickBtns = document.querySelectorAll('.ff-quick-btn');

  // ── MINIMIZE: hide panel, show toggle button ──
  function minimize() {
    panel.classList.add('minimized');
    toggleBtn.classList.remove('hidden');
  }

  // ── OPEN: show panel, hide toggle button ──
  function openChat() {
    panel.classList.remove('minimized');
    toggleBtn.classList.add('hidden');
    input.focus();
  }

  // Expose globally for AI food prediction & other pages
  window.openFeastFleetChatbot = function(initialText) {
    openChat();
    if (initialText) {
      setTimeout(() => {
        sendMessage(initialText);
      }, 150);
    }
  };

  minimizeBtn.addEventListener('click', minimize);
  toggleBtn.addEventListener('click', openChat);

  // ── ADD MESSAGE BUBBLE ──
  function addMessage(text, sender) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `ff-msg ${sender}`;
    msgDiv.textContent = text;
    messages.appendChild(msgDiv);
    messages.scrollTop = messages.scrollHeight;
    return msgDiv;
  }

  // ── SEND MESSAGE ──
  async function sendMessage(text) {
    if (!text || !text.trim()) return;

    addMessage(text, 'user');
    input.value = '';

    // Show typing indicator
    const typing = addMessage('Typing...', 'typing');

    try {
      if (typeof API !== 'undefined' && API.chatMessage) {
        // Retrieve local active order if available to provide live tracking context
        let currentActiveOrder = null;
        const lastOrderRaw = localStorage.getItem('feastfleet_last_order');
        if (lastOrderRaw) {
          try { currentActiveOrder = JSON.parse(lastOrderRaw); } catch(e) {}
        }

        const response = await API.chatMessage(text, currentActiveOrder);
        typing.remove();

        if (response && response.success && response.data) {
          const replyText = response.data.reply || response.data.message || (typeof response.data === 'string' ? response.data : JSON.stringify(response.data));
          addMessage(replyText, 'bot');
        } else {
          // If server reported error, fallback with local order state
          const user = API.getUser();
          if (text.toLowerCase().includes('track')) {
            if (user) {
              const lastOrder = localStorage.getItem('feastfleet_last_order');
              if (lastOrder) {
                const ord = JSON.parse(lastOrder);
                const rider = ord.deliveryPartner ? ord.deliveryPartner.name : 'Aditya';
                const phone = ord.deliveryPartner ? ord.deliveryPartner.phone : '+91 9847123456';
                addMessage(`📦 **Order #${ord.orderId || 'FF-ACTIVE'}**\n📍 Status: **ON THE WAY** 🏍️\n🛵 Delivery Partner: **${rider}** (${phone})\n⏱️ Time left: ~20 app mins (~4 min real-time)\n💰 Total: ₹${ord.total}\n\nDelivery is mapped at 5:1 speed!`, 'bot');
              } else {
                addMessage(`Hey ${user.name}! You don't have an active order right now. Head over to our restaurants page to order some delicious food! 🍕`, 'bot');
              }
            } else {
              addMessage("Please sign in first so I can find your order! 🔑 Click 'Sign In' at the top right.", 'bot');
            }
          } else {
            addMessage(response?.message || 'I am right here to help with your food and orders!', 'bot');
          }
        }
      } else {
        // Fallback responses when backend is offline
        typing.remove();
        const user = (typeof API !== 'undefined') ? API.getUser() : null;
        const low = text.toLowerCase();

        if (low.includes('track')) {
          if (user) {
            const lastOrder = localStorage.getItem('feastfleet_last_order');
            if (lastOrder) {
              const ord = JSON.parse(lastOrder);
              const rider = ord.deliveryPartner ? ord.deliveryPartner.name : 'Rohit';
              const phone = ord.deliveryPartner ? ord.deliveryPartner.phone : '+91 9847123456';
              const createdTime = ord.createdAt ? new Date(ord.createdAt).getTime() : Date.now();
              const elapsedRealSec = Math.max(0, Math.floor((Date.now() - createdTime) / 1000));
              const TOTAL_REAL_SECONDS = 300;
              const realSecondsLeft = Math.max(0, TOTAL_REAL_SECONDS - elapsedRealSec);
              const appMinutesRemaining = Math.max(0, Math.ceil((realSecondsLeft / 60) * 5));
              const realMin = Math.floor(realSecondsLeft / 60);
              const realSec = realSecondsLeft % 60;
              const formattedRealTimer = `${String(realMin).padStart(2, '0')}:${String(realSec).padStart(2, '0')}`;

              let currentStatus = 'Confirmed';
              if (realSecondsLeft <= 0) currentStatus = 'DELIVERED 🎉';
              else if (elapsedRealSec >= 180) currentStatus = 'OUT FOR DELIVERY 🏍️';
              else if (elapsedRealSec >= 60) currentStatus = 'PREPARING FOOD 👨‍🍳';
              else currentStatus = 'ORDER CONFIRMED 📋';

              const timeMsg = realSecondsLeft <= 0 ? 'Delivered! 🎉' : `~${appMinutesRemaining} app mins (${formattedRealTimer} real-time remaining)`;

              addMessage(`📦 **Order #${ord.orderId || 'FF-ACTIVE'}**\n📍 Status: **${currentStatus}**\n🛵 Delivery Partner: **${rider}** (${phone})\n⏱️ Time remaining: **${timeMsg}**\n💰 Total: ₹${ord.total}`, 'bot');
            } else {
              addMessage(`Hello ${user.name}! You haven't placed an order yet. Browse restaurants to get started! 🍔`, 'bot');
            }
          } else {
            addMessage("Please sign in first so I can find your order! 🔑 Click the 'Sign In' button on top.", 'bot');
          }
        } else if (low.includes('ingredient') || low.includes('what is in') || low.includes('recipe')) {
          addMessage("✨ **FeastFleet AI Ingredient Predictor:**\nOur AI analyzes any dish to predict its complete recipe, fresh ingredients, allergen warnings, and dietary info!\n\nTry clicking any '✨ AI Ingredients' pill on the menu cards or ask: 'What are the ingredients in Smash Burger?'", 'bot');
        } else if (low.includes('menu') || low.includes('recommend')) {
          addMessage("🌟 Highly Recommended:\n• Smash Burger at Burger Palace (₹249)\n• Chicken Dum Biryani at Royal Biryani House (₹289)\n• Dragon Noodles at Dragon Wok (₹219)", 'bot');
        } else if (low.includes('help')) {
          addMessage("I can assist with:\n• Tracking your order with assigned delivery partner\n• Suggesting popular food\n• Delivery times and fees in Kerala\nFeel free to ask!", 'bot');
        } else {
          addMessage(user ? `Glad to help you, ${user.name}! Ask me about tracking or menus anytime.` : "Hello! Welcome to FeastFleet. Ask me about food, menus, or your orders!", 'bot');
        }
      }
    } catch (err) {
      typing.remove();
      // Graceful local fallback for order tracking
      const user = (typeof API !== 'undefined') ? API.getUser() : null;
      if (text.toLowerCase().includes('track')) {
        if (user) {
          const lastOrder = localStorage.getItem('feastfleet_last_order');
          if (lastOrder) {
            const ord = JSON.parse(lastOrder);
            const rider = ord.deliveryPartner ? ord.deliveryPartner.name : 'Karthik';
            const phone = ord.deliveryPartner ? ord.deliveryPartner.phone : '+91 9847123456';
            addMessage(`📦 **Order #${ord.orderId || 'FF-ACTIVE'}**\n📍 Status: **PREPARING / OUT FOR DELIVERY** 🏍️\n🛵 Delivery Partner: **${rider}** (${phone})\n⏱️ Real-time delivery ETA: 4-5 minutes\n💰 Total: ₹${ord.total}`, 'bot');
          } else {
            addMessage(`Hey ${user.name}! You are signed in, but no orders were found yet. Check out our menu! 🍕`, 'bot');
          }
        } else {
          addMessage("Please sign in first so I can find your order! 🔑", 'bot');
        }
      } else {
        addMessage("I'm connected! How can I help you today? Ask about menus or order tracking. 🚀", 'bot');
      }
    }
  }

  sendBtn.addEventListener('click', () => sendMessage(input.value));
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage(input.value);
  });

  quickBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const query = btn.textContent.replace(/^[^\s]+\s/, '');
      sendMessage(query);
    });
  });
});
