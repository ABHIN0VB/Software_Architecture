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
      width: 62px;
      height: 62px;
      border-radius: 50%;
      background: linear-gradient(135deg, #FF6B35, #FFB347);
      border: 2px solid rgba(255,255,255,0.4);
      cursor: pointer;
      box-shadow: 0 8px 30px rgba(255,107,53,0.45);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      padding: 0;
      transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      animation: chatbotPulse 3.5s infinite;
    }
    @keyframes chatbotPulse {
      0%, 100% { box-shadow: 0 8px 30px rgba(255,107,53,0.45), 0 0 0 0 rgba(255,107,53,0.35); }
      50% { box-shadow: 0 10px 36px rgba(255,107,53,0.65), 0 0 0 12px rgba(255,107,53,0); }
    }
    #ff-chatbot-toggle img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      border-radius: 50%;
      transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }
    #ff-chatbot-toggle:hover {
      transform: scale(1.12) rotate(6deg);
      box-shadow: 0 12px 38px rgba(255,107,53,0.7);
      border-color: #ffffff;
    }
    #ff-chatbot-toggle.hidden { display: none !important; }

    /* Chat Panel */
    #ff-chatbot-panel {
      width: 380px;
      height: 530px;
      background: rgba(18, 18, 26, 0.92);
      backdrop-filter: blur(28px) saturate(180%);
      -webkit-backdrop-filter: blur(28px) saturate(180%);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 24px;
      box-shadow: 0 20px 60px -10px rgba(0,0,0,0.65), 0 0 35px rgba(255,107,53,0.18), inset 0 1px 0 rgba(255,255,255,0.12);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      position: absolute;
      bottom: 0;
      right: 0;
      transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }
    #ff-chatbot-panel.minimized {
      opacity: 0;
      transform: scale(0.85) translateY(24px);
      pointer-events: none;
    }

    /* Header */
    #ff-chatbot-header {
      background: linear-gradient(135deg, #FF6B35 0%, #FF8C5A 40%, #FFB347 100%);
      color: white;
      padding: 16px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-shrink: 0;
      border-radius: 24px 24px 0 0;
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
    }
    #ff-chatbot-header .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
      font-weight: 700;
      font-size: 0.95rem;
    }
    #ff-chatbot-header .bot-avatar {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      overflow: hidden;
      border: 1.5px solid rgba(255,255,255,0.7);
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
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
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
    #ff-chatbot-minimize:hover {
      background: rgba(255,255,255,0.35);
      transform: scale(1.1);
    }

    /* Messages */
    #ff-chatbot-messages {
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 10px;
      background: rgba(14, 14, 22, 0.6);
    }
    #ff-chatbot-messages::-webkit-scrollbar { width: 4px; }
    #ff-chatbot-messages::-webkit-scrollbar-track { background: transparent; }
    #ff-chatbot-messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 4px; }

    .ff-msg {
      max-width: 85%;
      padding: 11px 16px;
      border-radius: 18px;
      font-size: 0.86rem;
      line-height: 1.5;
      white-space: pre-wrap;
      word-break: break-word;
      animation: ffMsgIn 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes ffMsgIn {
      from { opacity: 0; transform: translateY(10px) scale(0.96); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    .ff-msg.bot {
      background: rgba(255,255,255,0.08);
      backdrop-filter: blur(10px);
      color: #e0e0e5;
      align-self: flex-start;
      border-bottom-left-radius: 4px;
      border: 1px solid rgba(255,255,255,0.06);
    }
    .ff-msg.user {
      background: linear-gradient(135deg, #FF6B35, #FF8C5A);
      color: white;
      align-self: flex-end;
      border-bottom-right-radius: 4px;
      box-shadow: 0 4px 14px rgba(255,107,53,0.3);
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
      background: rgba(14, 14, 22, 0.7);
      border-top: 1px solid rgba(255,255,255,0.05);
      flex-shrink: 0;
    }
    .ff-quick-btn {
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.12);
      padding: 7px 15px;
      border-radius: 20px;
      font-size: 0.76rem;
      font-weight: 500;
      color: #ddd;
      cursor: pointer;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      font-family: inherit;
      backdrop-filter: blur(8px);
    }
    .ff-quick-btn:hover {
      background: rgba(255,107,53,0.2);
      border-color: rgba(255,107,53,0.45);
      color: #ffffff;
      transform: translateY(-2px) scale(1.02);
      box-shadow: 0 4px 12px rgba(255,107,53,0.25);
    }

    /* Input Area */
    #ff-chatbot-input-area {
      display: flex;
      padding: 12px 14px;
      background: rgba(18, 18, 26, 0.9);
      border-top: 1px solid rgba(255,255,255,0.06);
      gap: 8px;
      flex-shrink: 0;
    }
    #ff-chatbot-input {
      flex: 1;
      padding: 10px 18px;
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 24px;
      background: rgba(255,255,255,0.05);
      color: #f0f0f5;
      font-size: 0.86rem;
      outline: none;
      font-family: inherit;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    #ff-chatbot-input::placeholder { color: rgba(255,255,255,0.35); }
    #ff-chatbot-input:focus {
      border-color: rgba(255,107,53,0.5);
      background: rgba(255,255,255,0.08);
      box-shadow: 0 0 0 3px rgba(255,107,53,0.15);
    }

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
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      flex-shrink: 0;
      box-shadow: 0 4px 14px rgba(255,107,53,0.35);
    }
    #ff-chatbot-send:hover {
      transform: scale(1.12) rotate(12deg);
      box-shadow: 0 6px 20px rgba(255,107,53,0.55);
    }
    #ff-chatbot-send:active {
      transform: scale(0.92);
    }

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
    <button id="ff-chatbot-toggle" title="FeastFleet AI Assistant">
      <img src="images/chatbot-logo.jpg" alt="FeastFleet AI Chef">
    </button>
    <div id="ff-chatbot-panel" class="minimized">
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
        <button class="ff-quick-btn">🤖 Food Agent</button>
        <button class="ff-quick-btn">💰 Budget Optimizer</button>
        <button class="ff-quick-btn">🧠 My Food Profile</button>
        <button class="ff-quick-btn">📷 Visual Search</button>
        <button class="ff-quick-btn">👥 Group Order</button>
        <button class="ff-quick-btn">✨ AI Ingredients</button>
        <button class="ff-quick-btn">💡 Recommend</button>
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

  // ── ADD PLAIN TEXT MESSAGE BUBBLE ──
  function addMessage(text, sender) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `ff-msg ${sender}`;
    msgDiv.textContent = text;
    messages.appendChild(msgDiv);
    messages.scrollTop = messages.scrollHeight;
    return msgDiv;
  }

  // ── ADD HTML MESSAGE BUBBLE (supports rich cards) ──
  function addMessageHTML(html, sender) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `ff-msg ${sender}`;
    msgDiv.innerHTML = html;
    messages.appendChild(msgDiv);
    messages.scrollTop = messages.scrollHeight;
    return msgDiv;
  }

  // ── PROACTIVE AI FOOD MEMORY NUDGE ──
  setTimeout(() => {
    if (typeof FoodMemory !== 'undefined') {
      const proactive = FoodMemory.getProactiveSuggestion();
      if (proactive) {
        addMessage(proactive, 'bot');
      }
    }
  }, 1200);

  // ── SEND MESSAGE ──
  async function sendMessage(text) {
    if (!text || !text.trim()) return;

    addMessage(text, 'user');
    input.value = '';

    const low = text.toLowerCase().trim();

    // Show typing indicator
    const typing = addMessage('Typing...', 'typing');

    try {
      // ── 🤖 FOOD AGENT ──
      if (low.includes('food agent') || low.includes("i'm hungry") || low.includes('im hungry') ||
          low.includes('find me food') || low.includes('suggest something') || low.includes('i have ₹') ||
          low.includes('i have rs') || (low.includes('hungry') && (low.includes('₹') || low.includes('budget') || low.includes('spicy') || low.includes('protein')))) {
        typing.remove();
        addMessage('🤖 **Food Agent activated!** Tell me your constraints, e.g.:\n\n*"I\'m hungry. Budget ₹250. Something spicy, high protein, no chicken."*\n\nOr type your request now and I\'ll search the menus for you!', 'bot');

        // If the message already contains constraints, run the agent
        const hasConstraints = /₹\d+|rs\s*\d+|\d+\s*rupee|budget|spicy|protein|veg|beef|chicken|no\s+\w+/i.test(text);
        if (hasConstraints) {
          const agentTyping = addMessage('🔍 Analyzing menus...', 'typing');
          try {
            const res = await API.foodAgent(text);
            agentTyping.remove();
            if (res && res.success && res.data && res.data.suggestions && res.data.suggestions.length > 0) {
              const d = res.data;
              let html = `<div style="font-size:0.82rem;color:#FFB347;font-weight:700;margin-bottom:8px;">🤖 Food Agent Results <span style="color:rgba(255,255,255,0.4);font-weight:400;">(${d.reasoning})</span></div>`;
              d.suggestions.forEach((s, i) => {
                const badge = s.fitsInBudget ? '✅ Fits budget' : '⚠️ Slightly over';
                html += `<div style="background:rgba(255,255,255,0.05);border-radius:10px;padding:10px;margin-bottom:8px;border-left:3px solid ${i===0?'#FF6B35':'#2DD4A8'};">
                  <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:6px;">
                    <div>
                      <div style="font-weight:700;font-size:0.88rem;">${i===0?'⭐ ':''}${s.item.name}</div>
                      <div style="color:rgba(255,255,255,0.5);font-size:0.75rem;">@ ${s.restaurant} · ⭐${s.restaurantRating} · ${s.deliveryTime}</div>
                    </div>
                    <button onclick="if(typeof cart!=='undefined'){cart.addItem({id:'chat-'+Math.random().toString(36).substr(2,8),name:'${s.item.name.replace(/'/g, "\\'")}',price:${s.item.price},restaurant:'${s.restaurant.replace(/'/g, "\\'")}'});this.textContent='✓ Added';this.style.background='#2DD4A8';}" style="background:#FF6B35;color:#fff;border:none;border-radius:6px;padding:4px 8px;font-size:0.75rem;font-weight:700;cursor:pointer;flex-shrink:0;">
                      + Cart
                    </button>
                  </div>
                  <div style="margin-top:4px;font-size:0.82rem;">₹${s.item.price} + ₹${s.deliveryFee} delivery = <strong>₹${s.totalWithDelivery}</strong> · ${badge}</div>
                </div>`;
              });
              html += `<div style="font-size:0.75rem;color:rgba(255,255,255,0.35);margin-top:4px;"><a href="cart.html" style="color:#FFB347;text-decoration:none;">View Cart & Checkout →</a></div>`;
              addMessageHTML(html, 'bot');
            } else {
              addMessage('No perfect matches found. Try adjusting your budget or removing exclusions.', 'bot');
            }
          } catch(e) { agentTyping.remove(); addMessage('Food agent is temporarily offline. Try the menu directly!', 'bot'); }
        }
        return;
      }

      // ── 💰 BUDGET OPTIMIZER ──
      if (low.includes('budget optimizer') || low.includes('budget:') || low.includes('optimize') ||
          (low.includes('budget') && low.includes('people')) || low.includes('meal plan') || low.includes('₹') && low.includes('people')) {
        typing.remove();

        // Try to extract budget & people from message
        const budgetMatch = text.match(/₹?\s*(\d+)/);
        const peopleMatch = text.match(/(\d+)\s*(?:people|person|persons|members|friends)/i);
        const cuisineMatch = text.match(/(?:cuisine|food|prefer|want)\s*:?\s*([a-zA-Z]+)/i);

        if (budgetMatch && peopleMatch) {
          const budget = parseInt(budgetMatch[1]);
          const people = parseInt(peopleMatch[1]);
          const cuisine = cuisineMatch ? cuisineMatch[1] : null;
          const optTyping = addMessage(`💰 Optimizing meal plan for ${people} people within ₹${budget}...`, 'typing');
          try {
            const res = await API.budgetOptimize(budget, people, cuisine, ['main', 'drink']);
            optTyping.remove();
            if (res && res.success && res.data && res.data.topOptions) {
              const d = res.data;
              let html = `<div style="font-size:0.82rem;color:#2DD4A8;font-weight:700;margin-bottom:8px;">💰 Budget Optimizer — ₹${budget} for ${people} people</div>`;
              d.topOptions.forEach((opt, i) => {
                html += `<div style="background:rgba(255,255,255,0.05);border-radius:10px;padding:10px;margin-bottom:8px;border-left:3px solid ${i===0?'#FF6B35':'rgba(255,255,255,0.2)'};">
                  <div style="font-weight:700;">${i===0?'🏆 Best: ':''}${opt.restaurant} <span style="color:rgba(255,255,255,0.4);font-weight:400;">⭐${opt.restaurantRating}</span></div>
                  <div style="font-size:0.75rem;color:rgba(255,255,255,0.5);">Food: ₹${opt.foodSubtotal} · Delivery: ₹${opt.deliveryFee} · Platform: ₹${opt.platformFee}</div>
                  <div style="font-weight:700;margin-top:4px;">Total: ₹${opt.grandTotal} <span style="color:#2DD4A8;font-size:0.78rem;">(₹${opt.perPerson}/person)</span> ${opt.fitsInBudget ? '✅':'⚠️'}</div>
                </div>`;
              });
              addMessageHTML(html, 'bot');
            } else {
              addMessage('Could not find a matching plan. Try a larger budget or different cuisine.', 'bot');
            }
          } catch(e) { optTyping.remove(); addMessage('Budget optimizer offline. Please try again!', 'bot'); }
        } else {
          addMessage('💰 **Budget Optimizer** — Tell me:\n\n*"Budget ₹500, 4 people, Indian food, need main + drink"*\n\nI\'ll find the best restaurant combination for your group!', 'bot');
        }
        return;
      }

      // ── 🧠 FOOD MEMORY / PROFILE ──
      if (low.includes('food profile') || low.includes('my profile') || low.includes('food memory') ||
          low.includes('my history') || low.includes('my habits') || low.includes('i usually') || low.includes('what do i order')) {
        typing.remove();
        const insight = (typeof FoodMemory !== 'undefined') ? FoodMemory.generateInsight() : null;
        if (insight && insight.hasData) {
          let html = `<div style="font-size:0.82rem;color:#FFB347;font-weight:700;margin-bottom:8px;">🧠 Your Food Profile</div>`;
          insight.insights.forEach(ins => {
            html += `<div style="margin-bottom:5px;font-size:0.82rem;">• ${ins}</div>`;
          });
          if (insight.suggestions.length > 0) {
            html += `<div style="margin-top:8px;padding-top:8px;border-top:1px solid rgba(255,255,255,0.1);">`;
            insight.suggestions.forEach(s => { html += `<div style="color:#2DD4A8;font-size:0.8rem;margin-bottom:4px;">💡 ${s}</div>`; });
            html += `</div>`;
          }
          addMessageHTML(html, 'bot');
        } else {
          addMessage('🧠 **Food Memory**: No order history yet! Start ordering on FeastFleet and I\'ll build your personalized food profile automatically.', 'bot');
        }
        return;
      }

      // ── 📷 VISUAL SEARCH ──
      if (low.includes('visual search') || low.includes('see food') || low.includes('find food') ||
          low.includes('photo') || low.includes('picture') || low.includes('image') || low.includes('looks like')) {
        typing.remove();
        // Extract dish query from message
        const dishQuery = text.replace(/visual search|see food|find food|photo|picture|image|looks like|find|search for/gi, '').trim() || null;

        if (dishQuery && dishQuery.length > 2) {
          const vsTyping = addMessage(`📷 Searching menus for "${dishQuery}"...`, 'typing');
          try {
            const res = await API.visualSearch(dishQuery, null);
            vsTyping.remove();
            if (res && res.success && res.data && res.data.matches && res.data.matches.length > 0) {
              const d = res.data;
              let html = `<div style="font-size:0.82rem;color:#FFB347;font-weight:700;margin-bottom:8px;">📷 Visual Search — "${d.detectedDish}"</div>`;
              d.matches.forEach((m, i) => {
                html += `<div style="background:rgba(255,255,255,0.05);border-radius:10px;padding:10px;margin-bottom:8px;border-left:3px solid ${i===0?'#FF6B35':'rgba(255,255,255,0.15)'};">
                  <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:6px;">
                    <div>
                      <div style="font-weight:700;">${i===0?'🎯 Closest Match: ':'#'+(i+1)+' '}${m.item.name}</div>
                      <div style="color:rgba(255,255,255,0.5);font-size:0.75rem;">@ ${m.restaurant} · ⭐${m.restaurantRating} · ${m.deliveryTime}</div>
                      <div style="margin-top:3px;font-size:0.82rem;font-weight:700;">₹${m.item.price}</div>
                    </div>
                    <button onclick="if(typeof cart!=='undefined'){cart.addItem({id:'chat-'+Math.random().toString(36).substr(2,8),name:'${m.item.name.replace(/'/g, "\\'")}',price:${m.item.price},restaurant:'${m.restaurant.replace(/'/g, "\\'")}'});this.textContent='✓ Added';this.style.background='#2DD4A8';}" style="background:#FF6B35;color:#fff;border:none;border-radius:6px;padding:4px 8px;font-size:0.75rem;font-weight:700;cursor:pointer;flex-shrink:0;">
                      + Cart
                    </button>
                  </div>
                </div>`;
              });
              html += `<div style="font-size:0.75rem;color:rgba(255,255,255,0.35);margin-top:4px;"><a href="cart.html" style="color:#FFB347;text-decoration:none;">View Cart & Checkout →</a></div>`;
              addMessageHTML(html, 'bot');
            } else {
              addMessage('No matching dishes found. Try describing the dish differently — e.g. "spicy grilled chicken" or "creamy pasta".', 'bot');
            }
          } catch(e) { vsTyping.remove(); addMessage('Visual search offline. Try searching the menu directly!', 'bot'); }
        } else {
          addMessage('📷 **Visual Food Search** — Describe what the dish looks like:\n\n• *"grilled chicken with dark sauce"*\n• *"spicy red curry"*\n• *"creamy pasta"*\n• *"layered rice dish"*\n\nI\'ll find similar dishes at restaurants near you!', 'bot');
        }
        return;
      }

      // ── 👥 GROUP ORDER ──
      if (low.includes('group order') || low.includes('group ordering') || low.includes('for friends') ||
          low.includes('for my team') || low.includes('multiple people') || low.includes('split')) {
        typing.remove();
        addMessage('👥 **Group Order Agent** — Opening the group ordering tool!\n\nYou can also visit the dedicated page:', 'bot');
        addMessageHTML(`<a href="group-order.html" style="display:inline-block;margin-top:8px;background:linear-gradient(135deg,#FF6B35,#FFB347);color:#fff;padding:8px 16px;border-radius:20px;text-decoration:none;font-size:0.82rem;font-weight:700;">👥 Open Group Order →</a>`, 'bot');
        return;
      }

      // ── 💡 AI RECOMMENDATIONS ──
      if (low.includes('recommend') || low.includes('suggest') || low.includes('top picks') || low.includes('what is good') || low.includes('popular')) {
        typing.remove();
        const topDishes = [
          { name: 'Al Faham Chicken', rest: 'AK Take Away, Pala', price: 230, rating: '4.8', time: '30 min', icon: '🍗' },
          { name: 'Classic Smash Burger', rest: 'Burger Palace', price: 249, rating: '4.8', time: '20 min', icon: '🍔' },
          { name: 'Chicken Dum Biryani', rest: 'Royal Biryani House', price: 289, rating: '4.8', time: '35 min', icon: '🍚' },
          { name: 'Margherita Pizza', rest: 'Pizza Roma', price: 279, rating: '4.7', time: '25 min', icon: '🍕' }
        ];

        let html = `<div style="font-size:0.82rem;color:#FFB347;font-weight:700;margin-bottom:8px;">💡 AI Top Recommendations For You</div>`;
        topDishes.forEach(d => {
          html += `
            <div style="background:rgba(255,255,255,0.05);border-radius:10px;padding:10px;margin-bottom:8px;border-left:3px solid #FF6B35;">
              <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:6px;">
                <div>
                  <div style="font-weight:700;font-size:0.88rem;">${d.icon} ${d.name}</div>
                  <div style="color:rgba(255,255,255,0.5);font-size:0.75rem;">@ ${d.rest} · ⭐${d.rating} · ${d.time}</div>
                  <div style="font-weight:800;color:#FF6B35;margin-top:3px;font-size:0.85rem;">₹${d.price}</div>
                </div>
                <button onclick="if(typeof cart!=='undefined'){cart.addItem({id:'rec-'+Math.random().toString(36).substr(2,8),name:'${d.name.replace(/'/g, "\\'")}',price:${d.price},restaurant:'${d.rest.replace(/'/g, "\\'")}'});this.textContent='✓ Added';this.style.background='#2DD4A8';}" style="background:#FF6B35;color:#fff;border:none;border-radius:6px;padding:5px 10px;font-size:0.75rem;font-weight:700;cursor:pointer;flex-shrink:0;">
                  + Cart
                </button>
              </div>
            </div>`;
        });
        html += `<div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px;font-size:0.75rem;">
          <a href="cart.html" style="color:#2DD4A8;text-decoration:none;font-weight:600;">View Cart & Checkout →</a>
          <a href="restaurants.html" style="color:#FFB347;text-decoration:none;font-weight:600;">All Menus →</a>
        </div>`;
        addMessageHTML(html, 'bot');
        return;
      }

      // ── ✨ AI INGREDIENTS IN-CHAT HANDLER ──
      if (low.includes('ingredient') || low.includes('recipe') || low.includes("what's in") || low.includes('what is in') || low.includes('allergens')) {
        typing.remove();
        let html = `
          <div style="font-size:0.82rem;color:#FFB347;font-weight:700;margin-bottom:6px;">✨ AI Ingredient Predictor</div>
          <div style="font-size:0.8rem;color:rgba(255,255,255,0.7);margin-bottom:10px;">Select a dish to inspect predicted ingredients and allergen safety:</div>
          <div style="display:flex;flex-direction:column;gap:6px;">
            <a href="ai-ingredients.html" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);padding:8px 12px;border-radius:8px;color:#fff;text-decoration:none;font-size:0.8rem;display:flex;justify-content:space-between;align-items:center;">
              <span>🍗 Al Faham Chicken</span>
              <span style="color:#2DD4A8;font-size:0.75rem;">Inspect →</span>
            </a>
            <a href="ai-ingredients.html" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);padding:8px 12px;border-radius:8px;color:#fff;text-decoration:none;font-size:0.8rem;display:flex;justify-content:space-between;align-items:center;">
              <span>🍔 Classic Smash Burger</span>
              <span style="color:#2DD4A8;font-size:0.75rem;">Inspect →</span>
            </a>
            <a href="ai-ingredients.html" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);padding:8px 12px;border-radius:8px;color:#fff;text-decoration:none;font-size:0.8rem;display:flex;justify-content:space-between;align-items:center;">
              <span>🍚 Chicken Dum Biryani</span>
              <span style="color:#2DD4A8;font-size:0.75rem;">Inspect →</span>
            </a>
          </div>
          <div style="margin-top:10px;">
            <a href="ai-ingredients.html" style="display:block;text-align:center;background:linear-gradient(135deg,#FF6B35,#FFB347);color:#fff;padding:8px 12px;border-radius:18px;text-decoration:none;font-size:0.8rem;font-weight:700;">
              ✨ Open AI Ingredient Predictor →
            </a>
          </div>`;
        addMessageHTML(html, 'bot');
        return;
      }

      // ── 📍 TRACK ORDER IN-CHAT HANDLER ──
      if (low.includes('track') || low.includes('where is my order') || low.includes('order status')) {
        typing.remove();
        let ord = null;
        const lastOrderRaw = localStorage.getItem('feastfleet_last_order');
        if (lastOrderRaw) {
          try { ord = JSON.parse(lastOrderRaw); } catch(e) {}
        }

        const orderId = ord ? (ord.orderId || 'FF-ACTIVE') : 'FF-A7X9K2M1';
        const rest = (ord && ord.restaurants && ord.restaurants.length > 0) ? ord.restaurants.join(', ') : 'Burger Palace';
        const rider = (ord && ord.deliveryPartner && ord.deliveryPartner.name) ? ord.deliveryPartner.name : 'Rahul';
        const riderPhone = (ord && ord.deliveryPartner && ord.deliveryPartner.phone) ? ord.deliveryPartner.phone : '+91 9847123456';
        const total = (ord && ord.total) ? ord.total : '890.00';

        let html = `
          <div style="font-size:0.82rem;color:#2DD4A8;font-weight:700;margin-bottom:8px;">📍 Live Order Tracking</div>
          <div style="background:rgba(255,255,255,0.05);border-radius:10px;padding:12px;border-left:3px solid #2DD4A8;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
              <span style="font-weight:700;font-size:0.88rem;color:#fff;">Order #${orderId}</span>
              <span style="background:rgba(45,212,168,0.15);color:#2DD4A8;font-size:0.7rem;font-weight:700;padding:2px 8px;border-radius:10px;">ON THE WAY 🏍️</span>
            </div>
            <div style="font-size:0.78rem;color:rgba(255,255,255,0.6);margin-bottom:4px;">🍽️ ${rest} · Total ₹${total}</div>
            <div style="font-size:0.78rem;color:rgba(255,255,255,0.7);margin-bottom:10px;">🛵 Pilot: <strong>${rider}</strong> (${riderPhone})</div>
            <a href="tracking.html" style="display:block;text-align:center;background:linear-gradient(135deg,#FF6B35,#FFB347);color:#fff;padding:8px;border-radius:8px;text-decoration:none;font-size:0.8rem;font-weight:700;">
              📍 Open Live Tracking Map & Details →
            </a>
          </div>`;
        addMessageHTML(html, 'bot');
        return;
      }

      // ── FALLBACK: Send to backend chatbot ──
      if (typeof API !== 'undefined' && API.chatMessage) {
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
          addMessage(response?.message || 'I\'m here to help! Ask about food, tracking, or try the AI features above.', 'bot');
        }
      } else {
        typing.remove();
        const user = (typeof API !== 'undefined') ? API.getUser() : null;
        addMessage(user ? `Hi ${user.name}! Try the AI options above — Food Agent, Budget Optimizer, Ingredients or Tracking! 🚀` : 'Welcome to FeastFleet! Click any of the quick options above to get started! 🍽️', 'bot');
      }
    } catch (err) {
      typing.remove();
      addMessage('Something went wrong. Please try again in a moment!', 'bot');
    }
  }


  sendBtn.addEventListener('click', () => sendMessage(input.value));

  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage(input.value);
  });

  // Map quick buttons to dedicated pages or chat actions
  const PAGE_MAP = {
    'Track Order':      'tracking.html',
    'Food Agent':       'ai-agent.html',
    'Budget Optimizer': 'budget-optimizer.html',
    'My Food Profile':  'food-profile.html',
    'Visual Search':    'visual-search.html',
    'Group Order':      'group-order.html',
    'AI Ingredients':   'ai-ingredients.html',
  };

  quickBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Strip leading emoji
      const label = btn.textContent.trim().replace(/^[\p{Emoji}\s]+/u, '').trim();
      if (PAGE_MAP[label]) {
        window.location.href = PAGE_MAP[label];
      } else {
        // Recommend & other queries → run rich in-chat action
        const query = btn.textContent.replace(/^[^\s]+\s/, '');
        sendMessage(query);
      }
    });
  });
});
