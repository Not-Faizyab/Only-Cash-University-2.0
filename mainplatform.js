// State management (no localStorage/sessionStorage)
let userData = null; // Make userData accessible globally
let notificationCount = 3;
let completedHabits = 2;

// Quotes database
const quotes = [
  "Systems > Motivation.",
  "Execution is the new intelligence.",
  "You're one consistent day away from momentum.",
  "Money rewards clarity, not confusion.",
  "Consistency compounds. Keep going.",
  "Daily execution = lifetime leverage.",
];

// Show notification popup
function showNotification(message) {
  const notification = document.createElement("div");
  notification.className = "notification-popup";
  notification.innerHTML = `
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div style="font-size: 2rem;">📢</div>
                    <div>
                        <div style="font-weight: bold; margin-bottom: 0.5rem;">Notification</div>
                        <div style="color: #a78bfa;">${message}</div>
                    </div>
                </div>
            `;

  document.body.appendChild(notification);

  // Play notification sound (visual feedback)
  notification.style.animation = "slideIn 0.5s ease";

  setTimeout(() => {
    notification.classList.add("fade-out");
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 500);
  }, 5000);
}

auth.onAuthStateChanged((user) => {
  if (user) {
    // existing stuff...
    initNotificationsListener(user.uid); // start listening
  }
});

// ===== REAL-TIME NOTIFICATION LISTENER =====
auth.onAuthStateChanged((user) => {
  if (user) {
    // Your existing auth code...

    // Add notification listener
    let lastNotificationId = null;

    db.collection("notifications")
      .orderBy("timestamp", "desc")
      .limit(1)
      .onSnapshot((snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            const doc = change.doc;
            const data = doc.data();

            // Skip first load (don't show old notifications)
            if (lastNotificationId === null) {
              lastNotificationId = doc.id;
              return;
            }

            // Show new notification
            if (data.message && doc.id !== lastNotificationId) {
              showNotification(data.message);
              lastNotificationId = doc.id;
            }
          }
        });
      });
  }
});

// Toggle habit completion
function toggleHabit(element) {
  const wasCompleted = element.classList.contains("completed");
  element.classList.toggle("completed");

  if (!wasCompleted) {
    completedHabits++;
    element.querySelector(".habit-checkbox").textContent = "✓";

    // Check if all habits completed
    if (completedHabits === 3) {
      setTimeout(() => {
        triggerConfetti();
        showNotification(
          "🎉 All daily tasks completed! Your streak continues!"
        );
      }, 300);
    }
  } else {
    completedHabits--;
    element.querySelector(".habit-checkbox").textContent = "";
  }
}

// Trigger confetti animation
function triggerConfetti() {
  const colors = ["#fbbf24", "#9333ea", "#c084fc", "#ef4444", "#10b981"];

  for (let i = 0; i < 50; i++) {
    setTimeout(() => {
      const confetti = document.createElement("div");
      confetti.className = "confetti";
      confetti.style.left = Math.random() * 100 + "%";
      confetti.style.background =
        colors[Math.floor(Math.random() * colors.length)];
      confetti.style.animationDelay = Math.random() * 0.5 + "s";
      document.body.appendChild(confetti);

      setTimeout(() => {
        document.body.removeChild(confetti);
      }, 3000);
    }, i * 30);
  }
}

// Animate numbers counting up
function animateValue(id, start, end, duration) {
  const obj = document.getElementById(id);
  if (!obj) return;

  const range = end - start;
  const increment = end > start ? 1 : -1;
  const stepTime = Math.abs(Math.floor(duration / range));
  let current = start;

  const timer = setInterval(() => {
    current += increment;
    obj.textContent = current;
    if (current === end) {
      clearInterval(timer);
    }
  }, stepTime);
}

// Update live feed
// Load live feed notifications

// Change daily quote
function updateQuote() {
  const quoteElement = document.getElementById("dailyQuote");
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  quoteElement.style.opacity = "0";
  setTimeout(() => {
    quoteElement.textContent = `"${randomQuote}"`;
    quoteElement.style.transition = "opacity 1s";
    quoteElement.style.opacity = "1";
  }, 500);
}

// Check if it's Sunday and show weekly banner
function checkWeeklyBanner() {
  const today = new Date().getDay();
  const banner = document.getElementById("weeklyBanner");
  if (today === 0) {
    // Sunday
    banner.style.display = "block";
  }
}

// Random notifications
function randomNotification() {
  const notifications = [];

  const randomMsg =
    notifications[Math.floor(Math.random() * notifications.length)];
  showNotification(randomMsg);
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  // Animate lesson count on load

  // Check for weekly banner
  checkWeeklyBanner();

  // Change quote every 30 seconds
  setInterval(updateQuote, 30000);

  // Random notifications every 15 seconds
  setInterval(randomNotification, 15000000000); //extra 6 zeros

  // Show welcome notification
  setTimeout(() => {
    showNotification("Welcome back! You have 3 new updates.");
  }, 2000);
});

// Add glow cursor trail effect
document.addEventListener("mousemove", (e) => {
  const trail = document.createElement("div");
  trail.style.position = "fixed";
  trail.style.left = e.clientX + "px";
  trail.style.top = e.clientY + "px";
  trail.style.width = "4px";
  trail.style.height = "4px";
  trail.style.background = "rgba(147, 51, 234, 0.5)";
  trail.style.borderRadius = "50%";
  trail.style.pointerEvents = "none";
  trail.style.zIndex = "9999";
  trail.style.transition = "all 0.5s ease";

  document.body.appendChild(trail);

  setTimeout(() => {
    trail.style.opacity = "0";
    trail.style.transform = "scale(3)";
    setTimeout(() => {
      document.body.removeChild(trail);
    }, 500);
  }, 50);
});

// Load live feed notifications
function loadLiveFeed() {
  console.log("📡 Loading live feed...");

  const feedContainer = document.querySelector(".feed-items");

  if (!feedContainer) {
    console.log("❌ feed-items container not found");
    return;
  }

  // Listen for real-time updates
  db.collection("notifications")
    .orderBy("timestamp", "desc")
    .limit(10)
    .onSnapshot(
      (snapshot) => {
        console.log("📢 Feed updated:", snapshot.size, "notifications");

        // Clear existing feed items
        feedContainer.innerHTML = "";

        if (snapshot.empty) {
          feedContainer.innerHTML =
            '<div class="feed-item">No activity yet. Be the first! 🚀</div>';
          return;
        }

        // Create new feed items for each notification
        snapshot.forEach((doc) => {
          const data = doc.data();

          const feedItem = document.createElement("div");
          feedItem.className = "feed-item";
          feedItem.textContent = data.message;

          feedContainer.appendChild(feedItem);
          console.log("✅ Created feed item:", data.message);
        });
      },
      (error) => {
        console.error("❌ Error loading feed:", error);
      }
    );
}

// Wallet glow effect on hover
const walletCard = document.querySelector(".wallet-card");
walletCard.addEventListener("mouseenter", () => {
  walletCard.style.transform = "scale(1.02)";
  walletCard.style.boxShadow = "0 20px 80px rgba(251, 191, 36, 0.4)";
});

walletCard.addEventListener("mouseleave", () => {
  walletCard.style.transform = "scale(1)";
  walletCard.style.boxShadow = "0 20px 60px rgba(147, 51, 234, 0.3)";
});

// Progress bar tooltip
document
  .querySelector(".progress-center")
  .addEventListener("mouseenter", function () {
    const tooltip = document.createElement("div");
    tooltip.style.position = "absolute";
    tooltip.style.top = "100%";
    tooltip.style.left = "50%";
    tooltip.style.transform = "translateX(-50%)";
    tooltip.style.marginTop = "10px";
    tooltip.style.padding = "10px 15px";
    tooltip.style.background = "rgba(0, 0, 0, 0.9)";
    tooltip.style.borderRadius = "8px";
    tooltip.style.border = "1px solid #9333ea";
    tooltip.style.fontSize = "0.9rem";
    tooltip.style.whiteSpace = "nowrap";
    tooltip.style.zIndex = "10000";
    tooltip.textContent = "2 Referrals away from your next milestone.";
    tooltip.id = "progressTooltip";

    this.style.position = "relative";
    this.appendChild(tooltip);
  });

document
  .querySelector(".progress-center")
  .addEventListener("mouseleave", function () {
    const tooltip = document.getElementById("progressTooltip");
    if (tooltip) {
      tooltip.remove();
    }
  });

document.querySelectorAll(".nav-item").forEach((item) => {
  item.addEventListener("click", function () {
    document.querySelectorAll(".nav-item").forEach((i) => {
      i.classList.remove("active");
    });
    this.classList.add("active");

    const target = this.getAttribute("data-section");
    const targetId = "section-" + target;

    document.querySelectorAll(".section").forEach((sec) => {
      sec.classList.remove("visible");
    });

    const sectionToShow = document.getElementById(targetId);
    if (sectionToShow) {
      sectionToShow.classList.add("visible");
    }
  });
});

document.querySelectorAll(".prog-program-cta").forEach((item) => {
  item.addEventListener("click", function () {
    document.querySelectorAll(".prog-program-cta").forEach((i) => {
      i.classList.remove("active");
    });
    this.classList.add("active");

    const target = this.getAttribute("data-section");
    const targetId = "section-" + target;

    document.querySelectorAll(".section").forEach((sec) => {
      sec.classList.remove("visible");
    });

    const sectionToShow = document.getElementById(targetId);
    if (sectionToShow) {
      sectionToShow.classList.add("visible");
    }
  });
});

function toggleDetail(element) {
  // Get all module cards
  const allCards = document.querySelectorAll(".prog-module-card");

  // Check if the clicked card is already active
  const isAlreadyActive = element.classList.contains("prog-active");

  // Close ALL cards first
  allCards.forEach((card) => {
    card.classList.remove("prog-active");
    const detail = card.querySelector(".prog-module-detail");
    if (detail) {
      detail.classList.remove("prog-active");
    }
  });

  // If the clicked card wasn't active, open it
  if (!isAlreadyActive) {
    element.classList.add("prog-active");
    const detail = element.querySelector(".prog-module-detail");
    if (detail) {
      detail.classList.add("prog-active");
    }
  }
}

// Smooth scroll for carousel
const carousel = document.querySelector(".prog-carousel");
let isDown = false;
let startX;
let scrollLeft;

// Calculator Functionality
function calculateEarnings() {
  const members =
    parseFloat(document.getElementById("affMembersReferred").value) || 0;
  const commissionRate =
    parseFloat(document.getElementById("affCommissionRate").value) || 0;

  // Assuming average sale is ₹2,490 per month
  const avgSaleAmount = 399;
  const monthly = members * avgSaleAmount * (commissionRate / 100);
  const yearly = monthly * 365;

  document.getElementById(
    "affMonthlyResult"
  ).textContent = `₹${monthly.toLocaleString("en-IN")}`;
  document.getElementById(
    "affYearlyResult"
  ).textContent = `₹${yearly.toLocaleString("en-IN")}`;
}

document
  .getElementById("affMembersReferred")
  .addEventListener("input", calculateEarnings);
document
  .getElementById("affCommissionRate")
  .addEventListener("input", calculateEarnings);

// Copy Link Functionality
document.getElementById("affCopyBtn").addEventListener("click", function () {
  const linkInput = document.getElementById("affReferralLink");
  linkInput.select();
  linkInput.setSelectionRange(0, 99999);
  document.execCommand("copy");

  const btn = this;
  btn.textContent = "✅ Copied!";
  btn.classList.add("aff-copied");

  setTimeout(() => {
    btn.textContent = "📋 Copy Link";
    btn.classList.remove("aff-copied");
  }, 2000);
});

// Live Feed Auto-update
function addFeedItem(icon, text, time, isOwn = false) {
  const feedContainer = document.getElementById("affFeedContainer");
  const feedItem = document.createElement("div");
  feedItem.className = isOwn ? "aff-feed-item aff-own" : "aff-feed-item";
  feedItem.innerHTML = `
                <span class="aff-feed-icon">${icon}</span>
                ${text}
                <span class="aff-feed-time">${time}</span>
            `;
  feedContainer.insertBefore(feedItem, feedContainer.firstChild);

  // Keep only last 5 items
  if (feedContainer.children.length > 5) {
    feedContainer.removeChild(feedContainer.lastChild);
  }
}

// Add CSS animations for notifications
const style = document.createElement("style");
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes fadeOut {
        to {
            opacity: 0;
            transform: translateX(400px);
        }
    }
`;
document.head.appendChild(style);

// Discord Button Click Handlers
document.querySelectorAll(".discord-btn, .cta-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    showNotification("🟣 Opening Discord Vault...");
    // Add your Discord link here
    // window.open('YOUR_DISCORD_LINK', '_blank');
  });
});

// Resource Button Click Handlers
document.querySelectorAll(".resource-btn").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const cardTitle = e.target
      .closest(".resource-card")
      .querySelector(".resource-title").textContent;
    showNotification(`📂 Opening ${cardTitle} in Discord...`);
    // Add specific Discord channel links here
  });
});

// Card Hover Effect Enhancement
document.querySelectorAll(".resource-card").forEach((card) => {
  card.addEventListener("mouseenter", () => {
    card.style.transform = "translateY(-10px) scale(1.02)";
  });

  card.addEventListener("mouseleave", () => {
    card.style.transform = "translateY(0) scale(1)";
  });
});

// Search functionality
const searchBox = document.querySelector(".support-search-box");
searchBox.addEventListener("focus", function () {
  this.style.transform = "scale(1.02)";
});
searchBox.addEventListener("blur", function () {
  this.style.transform = "scale(1)";
});

// Action cards click handlers
document.querySelectorAll(".support-action-card").forEach((card) => {
  card.addEventListener("click", function () {
    const title = this.querySelector(".support-card-title").textContent;
    showNotification(`Opening ${title}...`);
  });
});

// KB items click handlers
document.querySelectorAll(".support-kb-item").forEach((item) => {
  item.addEventListener("click", function () {
    const title = this.querySelector(".support-kb-item-title").textContent;
    showNotification(`Loading: ${title}`);
  });
});

// Add animations to stylesheet

// Chat button handler
document
  .querySelector(".support-zone-btn")
  .addEventListener("click", function () {
    showNotification("Opening live chat support...");
  });

// Refund button handler
document
  .querySelector(".support-refund-btn")
  .addEventListener("click", function () {
    showNotification("Opening refund request form...");
  });

// Trust strip button handler
document
  .querySelector(".support-trust-btn")
  .addEventListener("click", function () {
    showNotification("Connecting you to support team...");
  });

// Smooth scroll behavior
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  });
});

// Add hover effects for cards
document
  .querySelectorAll(".support-action-card, .support-kb-category")
  .forEach((card) => {
    card.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-5px)";
    });
    card.addEventListener("mouseleave", function () {
      this.style.transform = "translateY(0)";
    });
  });

// FAQ Section Toggle
function toggleFAQSection(header) {
  const section = header.parentElement;
  const allSections = document.querySelectorAll(".support-faq-section");

  allSections.forEach((s) => {
    if (s !== section) {
      s.classList.remove("active");
    }
  });

  section.classList.toggle("active");
}

// Individual FAQ Item Toggle
function toggleFAQ(question) {
  const item = question.parentElement;
  const allItems = document.querySelectorAll(".support-faq-item");

  allItems.forEach((i) => {
    if (i !== item) {
      i.classList.remove("active");
    }
  });

  item.classList.toggle("active");
}

// Form Submit Handler
function handleFormSubmit(event) {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);

  // Show loading state
  const submitBtn = form.querySelector(".support-form-submit");
  const originalText = submitBtn.innerHTML;
  submitBtn.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> Sending...';
  submitBtn.disabled = true;

  // Simulate form submission
  setTimeout(() => {
    alert("✅ Message sent successfully! We'll respond within 2-6 hours.");
    form.reset();
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
  }, 2000);
}

// Search functionality with suggestions
const searchSuggestions = [
  "How to reset password",
  "Refund policy",
  "Affiliate link not working",
  "Video not loading",
  "Cancel membership",
  "Discord access",
  "Payment issues",
  "Progress not saving",
];

searchBox.addEventListener("input", function (e) {
  const value = e.target.value.toLowerCase();
  if (value.length > 2) {
    const matches = searchSuggestions.filter((s) =>
      s.toLowerCase().includes(value)
    );

    if (matches.length > 0) {
      // Could show dropdown with suggestions
      console.log("Suggestions:", matches);
    }
  }
});

// Animate stats on scroll
function animateStats() {
  const statCards = document.querySelectorAll(".support-stat-card");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.animation = "supportSlideUp 0.6s ease forwards";
        }
      });
    },
    { threshold: 0.1 }
  );

  statCards.forEach((card) => observer.observe(card));
}

// WhatsApp support
const whatsappBtn = document.querySelector(
  ".support-contact-item:has(.bxl-whatsapp)"
);
if (whatsappBtn) {
  whatsappBtn.style.cursor = "pointer";
  whatsappBtn.addEventListener("click", function () {
    showNotification("📱 Opening WhatsApp...");
    // window.open('https://wa.me/YOUR_NUMBER', '_blank');
  });
}

// Email support
const emailBtn = document.querySelector(
  ".support-contact-item:has(.bx-envelope)"
);
if (emailBtn) {
  emailBtn.style.cursor = "pointer";
  emailBtn.addEventListener("click", function () {
    window.location.href = "mailto:support@onlycashuniversity.com";
    showNotification("📧 Opening email client...");
  });
}

// Auto-open first FAQ section
document.addEventListener("DOMContentLoaded", function () {
  setTimeout(() => {
    showNotification("Welcome to OCU Support Center");
  }, 1000);

  // Initialize animations
  animateStats();

  // Auto-expand first FAQ section
  const firstFAQSection = document.querySelector(".support-faq-section");
  if (firstFAQSection) {
    firstFAQSection.classList.add("active");
  }
});

// Add keyboard shortcuts
document.addEventListener("keydown", function (e) {
  // Ctrl/Cmd + K to focus search
  if ((e.ctrlKey || e.metaKey) && e.key === "k") {
    e.preventDefault();
    searchBox.focus();
    showNotification("🔍 Search activated");
  }
});

// Track scroll for animations
let hasScrolled = false;
window.addEventListener("scroll", function () {
  if (!hasScrolled && window.scrollY > 100) {
    hasScrolled = true;
    // Trigger any scroll-based animations
  }
});

// Add loading animation style
const loadingStyle = document.createElement("style");
loadingStyle.textContent = `
            @keyframes bx-spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            .bx-spin {
                animation: bx-spin 1s linear infinite;
            }
        `;
document.head.appendChild(loadingStyle);

// ===== SUPPORT SECTION JAVASCRIPT - COMPLETE =====

// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
  console.log("📞 OCU Support Center - Loading...");

  // ===== FAQ TOGGLE FUNCTIONALITY =====
  const faqItems = document.querySelectorAll(".sup-faq-item");

  if (faqItems.length > 0) {
    faqItems.forEach((item) => {
      const question = item.querySelector(".sup-faq-question");

      if (question) {
        question.addEventListener("click", function () {
          // Close all other FAQs
          faqItems.forEach((otherItem) => {
            if (otherItem !== item && otherItem.classList.contains("active")) {
              otherItem.classList.remove("active");
            }
          });

          // Toggle current FAQ
          item.classList.toggle("active");
        });
      }
    });
    console.log("✅ FAQ Toggle - Loaded");
  }

  // ===== ACTION CARD CLICK HANDLERS =====
  const actionCards = document.querySelectorAll(".sup-action-card");

  if (actionCards.length > 0) {
    actionCards.forEach((card) => {
      card.addEventListener("click", function () {
        const title = this.querySelector(".sup-action-title");
        if (title) {
          console.log("Clicked:", title.textContent);
        }
      });
    });
    console.log("✅ Action Cards - Loaded");
  }

  // ===== CHAT BUTTON HANDLER =====
  const chatBtn = document.querySelector(".sup-chat-btn");

  if (chatBtn) {
    chatBtn.addEventListener("click", function () {
      console.log("💬 Opening live chat...");
      // Add your chat widget code here
      // Example: window.open('https://your-chat-link', '_blank');
    });
    console.log("✅ Chat Button - Loaded");
  }

  // ===== REFUND BUTTON HANDLER =====
  const refundBtn = document.querySelector(".sup-refund-btn");

  if (refundBtn) {
    refundBtn.addEventListener("click", function () {
      console.log("📋 Opening refund form...");
      // Add your refund form link here
      // Example: window.location.href = '/refund-form';
    });
    console.log("✅ Refund Button - Loaded");
  }

  // ===== CONTACT BUTTON HANDLER =====
  const contactBtn = document.querySelector(".sup-contact-btn");

  if (contactBtn) {
    contactBtn.addEventListener("click", function () {
      console.log("📧 Opening contact form...");
      // Add your contact action here
      // Example: window.location.href = 'mailto:support@ocu.com';
    });
    console.log("✅ Contact Button - Loaded");
  }

  // ===== SEARCH INPUT HANDLER =====
  const searchInput = document.querySelector(".sup-search-input");

  if (searchInput) {
    searchInput.addEventListener("input", function (e) {
      const searchTerm = e.target.value.toLowerCase();

      if (searchTerm.length > 2) {
        console.log("🔍 Searching for:", searchTerm);

        // Filter FAQ items based on search
        faqItems.forEach((item) => {
          const questionText = item
            .querySelector(".sup-faq-question span")
            ?.textContent.toLowerCase();
          const answerText = item
            .querySelector(".sup-faq-answer")
            ?.textContent.toLowerCase();

          if (questionText && answerText) {
            if (
              questionText.includes(searchTerm) ||
              answerText.includes(searchTerm)
            ) {
              item.style.display = "block";
            } else {
              item.style.display = "none";
            }
          }
        });
      } else {
        // Show all FAQ items if search is cleared
        faqItems.forEach((item) => {
          item.style.display = "block";
        });
      }
    });
    console.log("✅ Search Functionality - Loaded");
  }

  // ===== HOVER EFFECTS FOR ACTION CARDS =====
  actionCards.forEach((card) => {
    card.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-8px)";
    });

    card.addEventListener("mouseleave", function () {
      this.style.transform = "translateY(0)";
    });
  });

  // ===== COPY EMAIL/WHATSAPP ON CLICK =====
  const contactValues = document.querySelectorAll(".sup-contact-value");

  contactValues.forEach((value) => {
    value.style.cursor = "pointer";

    value.addEventListener("click", function () {
      const text = this.textContent;

      // Create temporary textarea to copy text
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();

      try {
        document.execCommand("copy");
        console.log("✅ Copied:", text);

        // Visual feedback
        const originalText = this.textContent;
        this.textContent = "✅ Copied!";
        setTimeout(() => {
          this.textContent = originalText;
        }, 2000);
      } catch (err) {
        console.error("Failed to copy:", err);
      }

      document.body.removeChild(textarea);
    });
  });

  // ===== SMOOTH SCROLL FOR ANCHOR LINKS =====
  const anchorLinks = document.querySelectorAll('a[href^="#"]');

  anchorLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");
      if (targetId !== "#") {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          targetElement.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }
    });
  });

  // ===== KEYBOARD ACCESSIBILITY FOR FAQ =====
  faqItems.forEach((item) => {
    const question = item.querySelector(".sup-faq-question");
    if (question) {
      question.setAttribute("tabindex", "0");
      question.setAttribute("role", "button");
      question.setAttribute("aria-expanded", "false");

      question.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          this.click();

          // Update aria-expanded
          const isActive = item.classList.contains("active");
          question.setAttribute("aria-expanded", isActive ? "true" : "false");
        }
      });
    }
  });

  // ===== FORM VALIDATION (if forms are added) =====
  const forms = document.querySelectorAll("form");

  forms.forEach((form) => {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      console.log("Form submitted");
      // Add your form submission logic here
    });
  });

  // ===== ANALYTICS TRACKING (Optional) =====
  function trackEvent(category, action, label) {
    console.log("📊 Event:", category, action, label);
    // Add your analytics code here
    // Example: gtag('event', action, { 'event_category': category, 'event_label': label });
  }

  // Track button clicks
  chatBtn?.addEventListener("click", () =>
    trackEvent("Support", "Click", "Live Chat")
  );
  refundBtn?.addEventListener("click", () =>
    trackEvent("Support", "Click", "Refund Request")
  );
  contactBtn?.addEventListener("click", () =>
    trackEvent("Support", "Click", "Contact Team")
  );

  // ===== INITIALIZATION COMPLETE =====
  console.log("📞 OCU Support Center - Loaded Successfully ✅");
  console.log("Total FAQ Items:", faqItems.length);
  console.log("Total Action Cards:", actionCards.length);
});

// ===== UTILITY FUNCTIONS =====

// Function to check if element is in viewport
function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

// Function to add fade-in animation when scrolling
window.addEventListener("scroll", function () {
  const actionCards = document.querySelectorAll(".sup-action-card");
  const widgets = document.querySelectorAll(".sup-widget-card");

  actionCards.forEach((card) => {
    if (isInViewport(card)) {
      card.style.opacity = "1";
      card.style.transform = "translateY(0)";
    }
  });

  widgets.forEach((widget) => {
    if (isInViewport(widget)) {
      widget.style.opacity = "1";
      widget.style.transform = "translateY(0)";
    }
  });
});
// ===== END OF SUPPORT SECTION JAVASCRIPT =====

// Logout function
function handleLogout() {
  // Show confirmation before logout
  const confirmLogout = confirm("Are you sure you want to logout?");

  if (confirmLogout) {
    // Sign out from Firebase
    firebase
      .auth()
      .signOut()
      .then(() => {
        console.log("User logged out successfully");
        // Redirect to login page
        window.location.href = "auth.html?tab=login";
      })
      .catch((error) => {
        console.error("Logout error:", error);
        alert("Failed to logout. Please try again.");
      });
  }
}

// Display affiliate link
function displayAffiliateLink(affiliateCode) {
  const baseURL = window.location.origin;
  const referralLink = `${baseURL}/index.html?ref=${affiliateCode}`;

  const linkInput = document.getElementById("affReferralLink");
  if (linkInput) {
    linkInput.value = referralLink;
  }
}

// Display affiliate stats
function displayAffiliateStats(userData) {
  // Update clicks
  const clicksEl = document.querySelector(".aff-clicks-value");
  if (clicksEl) clicksEl.textContent = userData.clicks || 0;

  // Update conversions
  const conversionsEl = document.querySelector(".aff-conversions-value");
  if (conversionsEl) conversionsEl.textContent = userData.conversions || 0;

  // Update total earnings
  const earningsEl = document.querySelector(".aff-total-earnings");
  if (earningsEl) earningsEl.textContent = `₹${userData.totalEarnings || 0}`;

  // Update pending payout
  const pendingEl = document.querySelector(".aff-pending-payout");
  if (pendingEl) pendingEl.textContent = `₹${userData.pendingPayout || 0}`;
}

// Copy affiliate link
function copyAffiliateLink() {
  const linkInput = document.getElementById("affReferralLink");

  if (linkInput) {
    linkInput.select();
    linkInput.setSelectionRange(0, 99999);

    navigator.clipboard.writeText(linkInput.value).then(() => {
      const copyBtn = document.getElementById("affCopyBtn");
      if (copyBtn) {
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = "✓ Copied!";
        copyBtn.style.background = "#10b981";

        setTimeout(() => {
          copyBtn.innerHTML = originalText;
          copyBtn.style.background = "";
        }, 2000);
      }
    });
  }
}

// Display affiliate stats
function displayAffiliateStats(userData) {
  // Total Earnings
  const totalEarningsEl = document.getElementById("affTotalEarnings");
  if (totalEarningsEl) {
    totalEarningsEl.textContent = `₹${(
      userData.totalEarnings || 0
    ).toLocaleString("en-IN")}`;
  }

  // Pending Payout
  const pendingPayoutEl = document.getElementById("affPendingPayout");
  if (pendingPayoutEl) {
    pendingPayoutEl.textContent = `₹${(
      userData.pendingPayout || 0
    ).toLocaleString("en-IN")}`;
  }

  const totalEarningsEll = document.getElementById("affTotalEarningsdash");
  if (totalEarningsEll) {
    totalEarningsEll.textContent = `₹${(
      userData.totalEarnings || 0
    ).toLocaleString("en-IN")}`;
  }

  const totalEarningsEllll = document.getElementById("affTotalEarningscomm");
  if (totalEarningsEllll) {
    totalEarningsEllll.textContent = `₹${(
      userData.totalEarnings || 0
    ).toLocaleString("en-IN")}`;
  }

  // Pending Payout
  const pendingPayoutEll = document.getElementById("affPendingPayoutdash");
  if (pendingPayoutEll) {
    pendingPayoutEll.textContent = `₹${(
      userData.pendingPayout || 0
    ).toLocaleString("en-IN")}`;
  }

  const totalEarningsElll = document.getElementById("affTotalEarningsprog");
  if (totalEarningsElll) {
    totalEarningsElll.textContent = `₹${(
      userData.totalEarnings || 0
    ).toLocaleString("en-IN")}`;
  }

  // Total Referrals (conversions)
  const totalReferralsEl = document.getElementById("affTotalReferrals");
  if (totalReferralsEl) {
    totalReferralsEl.textContent = userData.conversions || 0;
  }

  // Clicks
  const clicksEl = document.querySelector(".aff-clicks-value");
  if (clicksEl) {
    clicksEl.textContent = userData.clicks || 0;
  }

  // Conversion Rate
  const conversionRateEl = document.getElementById("affConversionRate");
  if (conversionRateEl) {
    const rate = userData.conversionRate || 0;
    conversionRateEl.textContent = rate.toFixed(2) + "%";
  }
}

// Calculate this month's earnings
async function calculateMonthlyEarnings(userId) {
  // 🔥 ADD THIS CHECK FIRST
  if (!userId) {
    console.error("❌ calculateMonthlyEarnings: userId is undefined");
    return;
  }

  try {
    // Get first day of current month
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Query referrals from this month
    const referralsQuery = await db
      .collection("referrals")
      .where("referrerId", "==", userId)
      .where("createdAt", ">=", firstDayOfMonth)
      .get();

    let monthlyTotal = 0;
    referralsQuery.forEach((doc) => {
      monthlyTotal += doc.data().commissionAmount || 0;
    });

    // Update display
    const monthEarningsEl = document.getElementById("affMonthEarnings");
    if (monthEarningsEl) {
      monthEarningsEl.textContent = monthlyTotal.toLocaleString("en-IN");
    }
  } catch (error) {
    console.error("Error calculating monthly earnings:", error);
  }
}

// Load and save UPI ID
document.addEventListener("DOMContentLoaded", () => {
  loadUpiId();

  const saveUpiBtn = document.getElementById("affSaveUpiBtn");
  if (saveUpiBtn) {
    saveUpiBtn.addEventListener("click", saveUpiId);
  }
});

// Load UPI ID from Firestore
async function loadUpiId() {
  if (!userData || !userData.uid) return;

  try {
    const userDoc = await db.collection("users").doc(userData.uid).get();
    const data = userDoc.data();

    if (data.upiId) {
      const upiInput = document.getElementById("affUpiId");
      if (upiInput) {
        upiInput.value = data.upiId;
      }
    }
  } catch (error) {
    console.error("Error loading UPI ID:", error);
  }
}

// Save UPI ID to Firestore
async function saveUpiId() {
  const upiInput = document.getElementById("affUpiId");
  const upiStatus = document.getElementById("affUpiStatus");
  const saveBtn = document.getElementById("affSaveUpiBtn");

  if (!upiInput || !userData || !userData.uid) return;

  const upiId = upiInput.value.trim();

  if (!upiId) {
    alert("Please enter a valid UPI ID");
    return;
  }

  // Basic UPI validation
  const upiRegex = /^[\w.-]+@[\w.-]+$/;
  if (!upiRegex.test(upiId)) {
    alert("Please enter a valid UPI ID format (e.g., name@paytm)");
    return;
  }

  try {
    saveBtn.textContent = "⏳ Saving...";
    saveBtn.disabled = true;

    await db.collection("users").doc(userData.uid).update({
      upiId: upiId,
      upiUpdatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    if (upiStatus) {
      upiStatus.style.display = "block";
      setTimeout(() => {
        upiStatus.style.display = "none";
      }, 3000);
    }

    saveBtn.textContent = "💾 Save UPI ID";
    saveBtn.disabled = false;
  } catch (error) {
    console.error("Error saving UPI ID:", error);
    alert("Failed to save UPI ID. Please try again.");
    saveBtn.textContent = "💾 Save UPI ID";
    saveBtn.disabled = false;
  }
}

// Function to update progress bar
function updateProgress() {
  console.log("🚀 updateProgress called");

  // Get the element - it's affTotalEarningsprog, NOT affPendingEarningsprog
  const earnedElement = document.getElementById("affTotalEarningsprog");

  if (!earnedElement) {
    console.error("❌ affTotalEarningsprog element NOT FOUND");
    return;
  }

  console.log("✅ Element found:", earnedElement.textContent);

  // Get text content, remove rupee symbol and commas, then parse
  const earnedText = earnedElement.textContent.replace(/₹|,/g, "").trim();
  const earned = parseFloat(earnedText) || 0;
  const goal = 10000;

  // Calculate percentage
  const percentage = Math.min((earned / goal) * 100, 100);

  console.log(
    "💰 Earned:",
    earned,
    "Goal:",
    goal,
    "Percentage:",
    percentage + "%"
  );

  // Get ALL progress bars and update the THIRD one (index 2)
  const progressBars = document.querySelectorAll(".progress-bar-fill");
  console.log("📊 Found", progressBars.length, "progress bars");

  if (progressBars[2]) {
    progressBars[2].style.width = percentage + "%";
    console.log("✅ Progress bar updated to", percentage + "%");
  } else {
    console.error("❌ Third progress bar not found");
  }
}

// Call on DOM load
document.addEventListener("DOMContentLoaded", function () {
  console.log("🎯 DOM Loaded");
  displayAffiliateStats(userData || {});
  updateProgress();
});

// Display user's current tier
async function displayUserTier(userData) {
  console.log("🏆 Calculating user tier...");

  const conversions = userData.conversions || 0;
  console.log("Total conversions:", conversions);

  // Determine tier based on conversions
  let currentTier = null;

  if (conversions >= 100) {
    currentTier = {
      badge: "💎",
      name: "OCU Partner Pro",
      level: 4,
      className: "tier-pro",
    };
  } else if (conversions >= 50) {
    currentTier = {
      badge: "🥇",
      name: "Elite Partner",
      level: 3,
      className: "tier-elite",
    };
  } else if (conversions >= 10) {
    currentTier = {
      badge: "🥈",
      name: "Hustler",
      level: 2,
      className: "tier-hustler",
    };
  } else {
    currentTier = {
      badge: "🥉",
      name: "Starter",
      level: 1,
      className: "tier-starter",
    };
  }

  console.log("Current tier:", currentTier.name);

  // Update current tier display
  const tierBadge = document.querySelector(".aff-tier-badge");
  const tierText = document.querySelector(".aff-current-tier div");

  if (tierBadge) {
    tierBadge.textContent = currentTier.badge;
  }

  if (tierText) {
    tierText.innerHTML = `You're currently: <strong style="color: #00ff88;">${currentTier.name} (Level ${currentTier.level})</strong>`;
  }

  // Highlight active tier card
  const tierCards = document.querySelectorAll(".aff-tier-card");
  tierCards.forEach((card, index) => {
    card.classList.remove("aff-active");
    if (index === currentTier.level - 1) {
      card.classList.add("aff-active");
    }
  });

  console.log("✅ Tier display updated");
}

// Sidebar toggle functionality
const menuToggleBtn = document.getElementById("menuToggleBtn");
const sidebar = document.querySelector(".sidebar");

// Create overlay element
const overlay = document.createElement("div");
overlay.className = "sidebar-overlay";
document.body.appendChild(overlay);

// Toggle sidebar function
function toggleSidebar() {
  sidebar.classList.toggle("active");
  overlay.classList.toggle("active");
  menuToggleBtn.classList.toggle("active");
}

// Event listeners
menuToggleBtn.addEventListener("click", toggleSidebar);
overlay.addEventListener("click", toggleSidebar);

// Close sidebar when clicking nav items on mobile
const navItems = document.querySelectorAll(".nav-item");
navItems.forEach((item) => {
  item.addEventListener("click", () => {
    if (window.innerWidth <= 768) {
      toggleSidebar();
    }
  });
});

// Close sidebar on window resize if > 768px
window.addEventListener("resize", () => {
  if (window.innerWidth > 768) {
    sidebar.classList.remove("active");
    overlay.classList.remove("active");
    menuToggleBtn.classList.remove("active");
  }
});

// Load payout history for the logged-in user
async function loadPayoutHistory() {
  console.log("🔵 Loading payout history...");

  const user = auth.currentUser;

  if (!user) {
    console.error("❌ No user logged in");
    return;
  }

  try {
    const userDoc = await db.collection("users").doc(user.uid).get();

    if (!userDoc.exists) {
      console.error("❌ User document not found");
      return;
    }

    const userData = userDoc.data();
    const payoutHistory = userData.payoutHistory || [];

    console.log("✅ Payout history:", payoutHistory);

    const tbody = document.querySelector(".aff-payout-table tbody");

    if (!tbody) {
      console.error("❌ Payout table tbody not found");
      return;
    }

    tbody.innerHTML = "";

    if (payoutHistory.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="4" style="text-align:center">No payout history yet</td></tr>';
      return;
    }

    // Sort by date (newest first)
    payoutHistory.sort((a, b) => {
      const dateA = a.date.toDate ? a.date.toDate() : new Date(a.date);
      const dateB = b.date.toDate ? b.date.toDate() : new Date(b.date);
      return dateB - dateA;
    });

    // Populate table
    payoutHistory.forEach((payout) => {
      console.log("🔵 Processing payout:", payout);

      // Handle Firestore Timestamp or plain Date
      let date;
      if (payout.date && payout.date.toDate) {
        // Firestore Timestamp
        date = payout.date.toDate();
      } else if (payout.date) {
        // Plain Date string or object
        date = new Date(payout.date);
      } else {
        date = new Date();
      }

      const formattedDate = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      console.log("✅ Formatted date:", formattedDate);

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${formattedDate}</td>
        <td>${payout.upiId || "N/A"}</td>
        <td>₹${(payout.amount || 0).toLocaleString()}</td>
        <td class="aff-status-paid">${payout.status}</td>
      `;
      tbody.appendChild(tr);
    });

    console.log("✅ Payout history loaded successfully");
  } catch (error) {
    console.error("❌ Error loading payout history:", error);
  }
}

async function loadMonthlyEarnings() {
  console.log("🔵 Loading monthly earnings...");

  const user = auth.currentUser;

  if (!user) {
    console.error("❌ No user logged in");
    return;
  }

  try {
    const userDoc = await db.collection("users").doc(user.uid).get();

    if (!userDoc.exists) {
      console.error("❌ User document not found");
      return;
    }

    const userData = userDoc.data();
    const payoutHistory = userData.payoutHistory || [];

    console.log("✅ Payout history for monthly calc:", payoutHistory);

    // Get current month and year
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    console.log("🔵 Current month:", currentMonth, "Year:", currentYear);

    // Calculate earnings for current month
    let monthlyEarnings = 0;

    payoutHistory.forEach((payout) => {
      let payoutDate;

      // Handle Firestore Timestamp or plain Date
      if (payout.date && payout.date.toDate) {
        payoutDate = payout.date.toDate();
      } else if (payout.date) {
        payoutDate = new Date(payout.date);
      } else {
        return; // Skip if no valid date
      }

      // Check if payout is from current month
      if (
        payoutDate.getMonth() === currentMonth &&
        payoutDate.getFullYear() === currentYear
      ) {
        monthlyEarnings += payout.amount || 0;
        console.log("✅ Added to monthly earnings:", payout.amount);
      }
    });

    console.log("✅ Total monthly earnings:", monthlyEarnings);

    // Update the HTML element
    const monthlyEarningsElement = document.getElementById("monthlyearrrnings");
    const monthlyEarningsElementt =
      document.getElementById("monthlyearrrrnings");

    if (monthlyEarningsElement) {
      monthlyEarningsElement.textContent = `₹${monthlyEarnings.toLocaleString()}`;
      monthlyEarningsElementt.textContent = `₹${monthlyEarnings.toLocaleString()}`;
      console.log("✅ Monthly earnings displayed");
    } else {
      console.error('❌ Element with id "monthlyearrrnings" not found');
    }
  } catch (error) {
    console.error("❌ Error loading monthly earnings:", error);
  }
}

// MAIN PLATFORM ACCESS CONTROL
console.log("🔵 Main platform loaded, checking access...");

// ===== MAIN PLATFORM ACCESS CONTROL =====
console.log("🚀 Main platform loaded, checking access...");

auth.onAuthStateChanged(async (user) => {
  if (user) {
    console.log("✅ User logged in:", user.uid);

    try {
      console.log("📡 Fetching user subscription data...");
      const userDoc = await db.collection("users").doc(user.uid).get();

      if (userDoc.exists) {
        userData = userDoc.data();
        console.log("📦 User data:", userData);

        // ✅ SIMPLIFIED CHECK - JUST CHECK IF subscriptionActive IS TRUE
        if (userData.subscriptionActive === true) {
          console.log("✅ Subscription is ACTIVE - Access granted!");
          
          // Load everything
          displayAffiliateLink(userData.affiliateCode);
          displayAffiliateStats(userData);
          displayUserTier(userData);
          loadLiveFeed();
          loadPayoutHistory();
          loadMonthlyEarnings();
          calculateMonthlyEarnings(user.uid);

          const copyBtn = document.getElementById("affCopyBtn");
          if (copyBtn) {
            copyBtn.addEventListener("click", copyAffiliateLink);
          }
        } else {
          console.log("❌ Subscription NOT active");
          window.location.href = "checkout.html";
        }
      } else {
        console.error("❌ User document not found");
        alert("❌ User data not found. Please contact support.");
        window.location.href = "index.html";
      }
    } catch (error) {
      console.error("❌ Error checking subscription:", error);
      alert("❌ Error loading platform. Please try again.");
      window.location.href = "checkout.html";
    }
  } else {
    console.log("❌ No user logged in");
    window.location.href = "index.html";
  }
});

// ========================================
// PROGRAM CLICK HANDLER - FIXED VERSION
// ========================================
document.addEventListener("DOMContentLoaded", function () {
  console.log("🚀 ========== DOM CONTENT LOADED ==========");
  console.log("📅 Time:", new Date().toLocaleTimeString());

  updateAllProgramCards();

  updateOverallCourseProgress();

  // Update overall stats on page load
  console.log("🔄 Calling updateOverallStats...");
  updateOverallStats();
  const programButtons = document.querySelectorAll(".prog-program-cta");

  console.log("✅ Found", programButtons.length, "program buttons");

  programButtons.forEach((button) => {
    button.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();

      const card = this.closest(".prog-program-card");
      const programId = card ? card.getAttribute("data-program-id") : null;

      console.log("🔥 Clicked program ID:", programId);

      if (!programId) {
        alert("❌ Error: Missing program ID on this card!");
        return;
      }

      if (!programsData[programId]) {
        alert("❌ Program data not found for: " + programId);
        return;
      }

      // Load program data
      loadProgram(programId);

      // Switch sections properly
      document.querySelectorAll(".section").forEach((sec) => {
        sec.classList.remove("visible");
      });

      const programSection = document.getElementById(
        "section-affiliateprogram"
      );
      if (programSection) {
        programSection.classList.add("visible");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  });
});

// ========================================
// LOAD PROGRAM DATA INTO UI
// ========================================
function loadProgram(programId) {
  console.log("📂 Loading program:", programId);

  const program = programsData[programId];

  if (!program) {
    console.error("❌ Program not found:", programId);
    return;
  }

  // Update header
  const titleEl = document.querySelector(
    "#section-affiliateprogram .prog-program-title"
  );
  const descEl = document.querySelector(
    "#section-affiliateprogram .prog-program-desc"
  );
  const statsEl = document.querySelector(
    "#section-affiliateprogram .prog-program-stats"
  );
  const progressEl = document.querySelector(
    "#section-affiliateprogram .prog-progress-tracker"
  );

  if (titleEl) titleEl.textContent = program.title;
  if (descEl) descEl.textContent = program.description;
  if (statsEl) {
    statsEl.innerHTML = `
            <span class="prog-stat">🎯 ${program.totalModules} Modules</span>
            <span class="prog-stat">🎓 ${program.totalLessons} Lessons</span>
        `;
  }
  if (progressEl) progressEl.textContent = `📊 ${program.progress}% Complete`;

  // Update current lesson
  const lessonIndicator = document.querySelector(
    "#section-affiliateprogram .prog-lesson-indicator"
  );
  const lessonTitle = document.querySelector(
    "#section-affiliateprogram .prog-lesson-title"
  );
  const lessonSummary = document.querySelector(
    "#section-affiliateprogram .prog-lesson-summary"
  );

  if (lessonIndicator)
    lessonIndicator.textContent = `Lesson ${program.currentLesson.number} of ${program.totalLessons}`;
  if (lessonTitle) lessonTitle.textContent = program.currentLesson.title;
  if (lessonSummary) lessonSummary.textContent = program.currentLesson.summary;

  // Render modules
  renderModules(program.modules);

  console.log("✅ Program loaded successfully!");
}

// ========================================
// RENDER MODULES LIST
// ========================================
function renderModules(modules) {
  const modulesPanel = document.querySelector(
    "#section-affiliateprogram .prog-modules-panel"
  );

  if (!modulesPanel) {
    console.error("❌ Modules panel not found!");
    return;
  }

  // Keep title, remove old cards
  const existingCards = modulesPanel.querySelectorAll(".prog-module-card");
  existingCards.forEach((card) => card.remove());

  // Create new module cards
  modules.forEach((module) => {
    const moduleCard = createModuleCard(module);
    modulesPanel.appendChild(moduleCard);
  });

  console.log("✅ Rendered", modules.length, "modules");
}

// ========================================
// CREATE MODULE CARD ELEMENT
// ========================================
function createModuleCard(module) {
  const card = document.createElement("div");
  card.className = `prog-module-card ${
    module.status === "in-progress" ? "prog-active" : ""
  }`;
  card.onclick = function () {
    toggleDetail(this);
  };

  let statusHTML = "";
  if (module.status === "completed") {
    statusHTML =
      '<div class="prog-status-icon prog-completed">✓</div><span>Completed</span>';
  } else if (module.status === "in-progress") {
    statusHTML = "<span>In Progress</span>";
  } else {
    statusHTML = '<span style="color: #666;">Not Started</span>';
  }

  let resourcesHTML = "";
  if (module.resources && module.resources.length > 0) {
    const resourceItems = module.resources
      .map((r) => `<div class="prog-resource-item">${r.icon} ${r.name}</div>`)
      .join("");

    resourcesHTML = `
            <div class="prog-module-detail ${
              module.status === "in-progress" ? "prog-active" : ""
            }">
                <div class="prog-resources">
                    <h4 style="margin-bottom: 0.5rem; font-size: 0.9rem;">📎 Resources</h4>
                    ${resourceItems}
                </div>
            </div>
        `;
  }

  card.innerHTML = `
        <div class="prog-module-number">${module.number}</div>
        <div class="prog-module-content">
            <div class="prog-module-title">${module.title}</div>
            <div class="prog-module-status">
                ${statusHTML}
            </div>
        </div>
        ${resourcesHTML}
    `;

  return card;
}

// ========================================
// TOGGLE MODULE DETAILS
// ========================================

// ========================================
// PROGRAMS DATABASE - ALL 12 PROGRAMS
// ========================================
const programsData = {
  "6-figure-store": {
    title: "The 6-Figure Store (Dropshipping/E-commerce)",
    description:
      "Build a high-converting e-commerce system that generates consistent revenue through proven dropshipping and e-commerce strategies.",
    totalModules: 7,
    totalLessons: 20,
    progress: 0,
    currentLesson: {
      number: 1,
      title: "Unleashing Facebook Ads Power",
      summary:
        "Dive deep into Facebook Ads scaling principles — how to find, test, and dominate winning creatives to grow your revenue without guesswork.",
      videoUrl: "Modules/Dropshipping/Module_1/lesson1.mp4",
    },
    modules: [
      {
        number: 1,
        title: "Unleashing Facebook Ads Power",
        status: "not-started",
        videoUrl: "Modules/Dropshipping/Module_1/lesson1.mp4",
        resources: [],
      },
      {
        number: 2,
        title: "Product Testing Mastery",
        status: "not-started",
        videoUrl: "Modules/Dropshipping/Module_2/lesson2.mp4",
        resources: [],
      },
      {
        number: 3,
        title: "Audience Targeting Matrix",
        status: "not-started",
        videoUrl: "Modules/Dropshipping/Module_3/lesson3.mp4",
        resources: [],
      },
      {
        number: 4,
        title: "Scaling Systems 101",
        status: "not-started",
        videoUrl: "Modules/Dropshipping/Module_4/lesson4.mp4",
        resources: [],
      },
      {
        number: 5,
        title: "Automating Your Store",
        status: "not-started",
        videoUrl: "Modules/Dropshipping/Module_5/lesson5.mp4",
        resources: [],
      },
    ],
  },

  "zero-to-sales": {
    title: "Zero-to-Sales Launchpad (Digital Products Selling)",
    description:
      "Learn to launch digital products that sell like crazy using proven marketing funnels and automation.",
    totalModules: 6,
    totalLessons: 18,
    progress: 0,
    currentLesson: {
      number: 1,
      title: "Digital Product Foundations",
      summary:
        "Build your first digital product from scratch using proven frameworks and strategies.",
      videoUrl: "Modules/Digital_Products/Module_1/lesson1.mp4",
    },
    modules: [
      {
        number: 1,
        title: "Digital Product Foundations",
        status: "not-started",
        videoUrl: "Modules/Digital_Products/Module_1/lesson1.mp4",
        resources: [],
      },
      {
        number: 2,
        title: "Creating Your Asset",
        status: "not-started",
        videoUrl: "Modules/Digital_Products/Module_2/lesson2.mp4",
        resources: [],
      },
      {
        number: 3,
        title: "Product Launch Formula",
        status: "not-started",
        videoUrl: "Modules/Digital_Products/Module_3/lesson3.mp4",
        resources: [],
      },
      {
        number: 4,
        title: "Sales Funnel Architecture",
        status: "not-started",
        videoUrl: "Modules/Digital_Products/Module_4/lesson4.mp4",
        resources: [],
      },
      {
        number: 5,
        title: "Email Automation Systems",
        status: "not-started",
        videoUrl: "Modules/Digital_Products/Module_5/lesson5.mp4",
        resources: [],
      },
      {
        number: 6,
        title: "Scaling Digital Sales",
        status: "not-started",
        videoUrl: "Modules/Digital_Products/Module_6/lesson6.mp4",
        resources: [],
      },
    ],
  },

  "high-ticket-client": {
    title: "High-Ticket Client Machine (Freelancing)",
    description:
      "Master freelancing and secure high-paying clients using proven outreach and positioning strategies.",
    totalModules: 5,
    totalLessons: 20,
    progress: 0,
    currentLesson: {
      number: 1,
      title: "Profile Optimization",
      summary:
        "Learn how to optimize your profile and personal brand to attract high-ticket clients effortlessly.",
      videoUrl: "Modules/Freelancing/Module_1/lesson1.mp4",
    },
    modules: [
      {
        number: 1,
        title: "Profile Optimization",
        status: "not-started",
        videoUrl: "Modules/Freelancing/Module_1/lesson1.mp4",
        resources: [],
      },
      {
        number: 2,
        title: "Outreach Strategy Mastery",
        status: "not-started",
        videoUrl: "Modules/Freelancing/Module_2/lesson2.mp4",
        resources: [],
      },
      {
        number: 3,
        title: "Pricing & Positioning",
        status: "not-started",
        videoUrl: "Modules/Freelancing/Module_3/lesson3.mp4",
        resources: [],
      },
      {
        number: 4,
        title: "Closing High-Ticket Deals",
        status: "not-started",
        videoUrl: "Modules/Freelancing/Module_4/lesson4.mp4",
        resources: [],
      },
      {
        number: 5,
        title: "Client Retention Systems",
        status: "not-started",
        videoUrl: "Modules/Freelancing/Module_5/lesson5.mp4",
        resources: [],
      },
    ],
  },

  "wealth-pages": {
    title: "Wealth Pages Formula (IG Theme Pages)",
    description:
      "Turn Instagram theme pages into passive income machines with proven monetization strategies.",
    totalModules: 8,
    totalLessons: 25,
    progress: 0,
    currentLesson: {
      number: 1,
      title: "Theme Page Setup",
      summary:
        "Learn how to set up a high-converting Instagram theme page from scratch and pick the right niche.",
      videoUrl: "Modules/Instagram/Module_1/lesson1.mp4",
    },
    modules: [
      {
        number: 1,
        title: "Theme Page Setup",
        status: "not-started",
        videoUrl: "Modules/Instagram/Module_1/lesson1.mp4",
        resources: [],
      },
      {
        number: 2,
        title: "Content Strategy",
        status: "not-started",
        videoUrl: "Modules/Instagram/Module_2/lesson2.mp4",
        resources: [],
      },
      {
        number: 3,
        title: "Growth Hacking IG",
        status: "not-started",
        videoUrl: "Modules/Instagram/Module_3/lesson3.mp4",
        resources: [],
      },
      {
        number: 4,
        title: "Monetization Methods",
        status: "not-started",
        videoUrl: "Modules/Instagram/Module_4/lesson4.mp4",
        resources: [],
      },
      {
        number: 5,
        title: "Automation Tools",
        status: "not-started",
        videoUrl: "Modules/Instagram/Module_5/lesson5.mp4",
        resources: [],
      },
      {
        number: 6,
        title: "Brand Deals & Sponsorships",
        status: "not-started",
        videoUrl: "Modules/Instagram/Module_6/lesson6.mp4",
        resources: [],
      },
      {
        number: 7,
        title: "Scaling Multiple Pages",
        status: "not-started",
        videoUrl: "Modules/Instagram/Module_7/lesson7.mp4",
        resources: [],
      },
    ],
  },

  "no-product-profit": {
    title: "No-Product Profit (Affiliate Marketing)",
    description:
      "Crack the code on affiliate marketing without inventory hassles using proven traffic and conversion strategies.",
    totalModules: 6,
    totalLessons: 12,
    progress: 0,
    currentLesson: {
      number: 1,
      title: "Finding Hot Offers",
      summary:
        "Discover the most profitable affiliate offers and learn how to identify winners before testing.",
      videoUrl: "Modules/Affiliate/Module_1/lesson1.mp4",
    },
    modules: [
      {
        number: 1,
        title: "Finding Hot Offers",
        status: "not-started",
        videoUrl: "Modules/Affiliate/Module_1/lesson1.mp4",
        resources: [],
      },
      {
        number: 2,
        title: "Funnel Building Mastery",
        status: "not-started",
        videoUrl: "Modules/Affiliate/Module_2/lesson2.mp4",
        resources: [],
      },
      {
        number: 3,
        title: "Traffic Source Domination",
        status: "not-started",
        videoUrl: "Modules/Affiliate/Module_3/lesson3.mp4",
        resources: [],
      },
      {
        number: 4,
        title: "Scaling Winning Campaigns",
        status: "not-started",
        videoUrl: "Modules/Affiliate/Module_4/lesson4.mp4",
        resources: [],
      },
      {
        number: 5,
        title: "Advanced Media Buying",
        status: "not-started",
        videoUrl: "Modules/Affiliate/Module_5/lesson5.mp4",
        resources: [],
      },
      {
        number: 6,
        title: "Conversion Rate Optimization",
        status: "not-started",
        videoUrl: "Modules/Affiliate/Module_6/lesson6.mp4",
        resources: [],
      },
    ],
  },

  "client-acquisition": {
    title: "Client Acquisition Mastery (SMMA)",
    description:
      "Become a pro at securing clients for social media marketing agencies using proven outreach systems.",
    totalModules: 6,
    totalLessons: 16,
    progress: 0,
    currentLesson: {
      number: 1,
      title: "SMMA Foundations",
      summary:
        "Build your foundation as a social media marketing agency owner and understand the business model.",
      videoUrl: "Modules/Client/Module_1/lesson1.mp4",
    },
    modules: [
      {
        number: 1,
        title: "SMMA Foundations",
        status: "not-started",
        videoUrl: "Modules/Client/Module_1/lesson1.mp4",
        resources: [],
      },
      {
        number: 2,
        title: "Niche Selection & Positioning",
        status: "not-started",
        videoUrl: "Modules/Client/Module_2/lesson2.mp4",
        resources: [],
      },
      {
        number: 3,
        title: "Lead Generation Systems",
        status: "not-started",
        videoUrl: "Modules/Client/Module_3/lesson3.mp4",
        resources: [],
      },
      {
        number: 4,
        title: "Sales Call Mastery",
        status: "not-started",
        videoUrl: "Modules/Client/Module_4/lesson4.mp4",
        resources: [],
      },
      {
        number: 5,
        title: "Service Delivery Excellence",
        status: "not-started",
        videoUrl: "Modules/Client/Module_5/lesson5.mp4",
        resources: [],
      },
      {
        number: 6,
        title: "Scaling Your SMMA Agency",
        status: "not-started",
        videoUrl: "Modules/Client/Module_6/lesson6.mp4",
        resources: [],
      },
    ],
  },

  "creators-monetization": {
    title: "Creators Monetization (Content Creation)",
    description:
      "Monetize your content and turn followers into income streams using multiple revenue models.",
    totalModules: 7,
    totalLessons: 22,
    progress: 0,
    currentLesson: {
      number: 1,
      title: "Creator Foundations",
      summary:
        "Learn the fundamentals of being a content creator and building a personal brand that monetizes.",
      videoUrl: "Modules/Content/Module_1/lesson1.mp4",
    },
    modules: [
      {
        number: 1,
        title: "Creator Foundations",
        status: "not-started",
        videoUrl: "Modules/Content/Module_1/lesson1.mp4",
        resources: [],
      },
      {
        number: 2,
        title: "Content Strategy Blueprint",
        status: "not-started",
        videoUrl: "Modules/Content/Module_2/lesson2.mp4",
        resources: [],
      },
      {
        number: 3,
        title: "Audience Building",
        status: "not-started",
        videoUrl: "Modules/Content/Module_3/lesson3.mp4",
        resources: [],
      },
      {
        number: 4,
        title: "Monetization Models",
        status: "not-started",
        videoUrl: "Modules/Content/Module_4/lesson4.mp4",
        resources: [],
      },
      {
        number: 5,
        title: "Brand Partnerships",
        status: "not-started",
        videoUrl: "Modules/Content/Module_5/lesson5.mp4",
        resources: [],
      },
      {
        number: 6,
        title: "Scaling Your Brand",
        status: "not-started",
        videoUrl: "Modules/Content/Module_6/lesson6.mp4",
        resources: [],
      },
      {
        number: 7,
        title: "Content Automation & Systems",
        status: "not-started",
        videoUrl: "Modules/Content/Module_7/lesson7.mp4",
        resources: [],
      },
    ],
  },

  "prints-to-profits": {
    title: "Prints to Profits (Print on Demand)",
    description:
      "Build a print-on-demand business that sells custom designs worldwide without holding inventory.",
    totalModules: 7,
    totalLessons: 18,
    progress: 0,
    currentLesson: {
      number: 1,
      title: "POD Business Model",
      summary:
        "Understand the print-on-demand business model and how to leverage it for passive income.",
      videoUrl: "Modules/Print/Module_1/lesson1.mp4",
    },
    modules: [
      {
        number: 1,
        title: "POD Business Model",
        status: "not-started",
        videoUrl: "Modules/Print/Module_1/lesson1.mp4",
        resources: [],
      },
      {
        number: 2,
        title: "Design Creation",
        status: "not-started",
        videoUrl: "Modules/Print/Module_2/lesson2.mp4",
        resources: [],
      },
      {
        number: 3,
        title: "Product Research",
        status: "not-started",
        videoUrl: "Modules/Print/Module_3/lesson3.mp4",
        resources: [],
      },
      {
        number: 4,
        title: "Marketing Your Designs",
        status: "not-started",
        videoUrl: "Modules/Print/Module_4/lesson4.mp4",
        resources: [],
      },
      {
        number: 5,
        title: "Scaling POD Empire",
        status: "not-started",
        videoUrl: "Modules/Print/Module_5/lesson5.mp4",
        resources: [],
      },
      {
        number: 6,
        title: "Advanced POD Strategies",
        status: "not-started",
        videoUrl: "Modules/Print/Module_6/lesson6.mp4",
        resources: [],
      },
      {
        number: 7,
        title: "Automation & Outsourcing",
        status: "not-started",
        videoUrl: "Modules/Print/Module_7/lesson7.mp4",
        resources: [],
      },
    ],
  },

  "compounding-wealth": {
    title: "Compounding Wealth Formula (Investing, Trading & Crypto)",
    description:
      "Learn wealth-building strategies in investing, trading, and crypto to grow your capital exponentially.",
    totalModules: 7,
    totalLessons: 20,
    progress: 0,
    currentLesson: {
      number: 1,
      title: "Wealth Fundamentals",
      summary:
        "Understand the core principles of wealth building and how to leverage investing, trading, and crypto.",
      videoUrl: "Modules/Trading/Module_1/lesson1.mp4",
    },
    modules: [
      {
        number: 1,
        title: "Wealth Fundamentals",
        status: "not-started",
        videoUrl: "Modules/Trading/Module_1/lesson1.mp4",
        resources: [],
      },
      {
        number: 2,
        title: "Stock Market Basics",
        status: "not-started",
        videoUrl: "Modules/Trading/Module_2/lesson2.mp4",
        resources: [],
      },
      {
        number: 3,
        title: "Crypto Trading Fundamentals",
        status: "not-started",
        videoUrl: "Modules/Trading/Module_3/lesson3.mp4",
        resources: [],
      },
      {
        number: 4,
        title: "Risk Management Mastery",
        status: "not-started",
        videoUrl: "Modules/Trading/Module_4/lesson4.mp4",
        resources: [],
      },
      {
        number: 5,
        title: "Portfolio Building",
        status: "not-started",
        videoUrl: "Modules/Trading/Module_5/lesson5.mp4",
        resources: [],
      },
      {
        number: 6,
        title: "Advanced Trading Strategies",
        status: "not-started",
        videoUrl: "Modules/Trading/Module_6/lesson6.mp4",
        resources: [],
      },
      {
        number: 7,
        title: "Passive Income Investments",
        status: "not-started",
        videoUrl: "Modules/Trading/Module_7/lesson7.mp4",
        resources: [],
      },
    ],
  },

  "peak-body": {
    title: "Peak Body Transformation (Fitness & Bodybuilding)",
    description:
      "Achieve your best body with proven fitness and bodybuilding strategies for maximum results.",
    totalModules: 9,
    totalLessons: 18,
    progress: 0,
    currentLesson: {
      number: 1,
      title: "Training Principles",
      summary:
        "Master the fundamental training principles that drive muscle growth and body transformation.",
      videoUrl: "Modules/Body/Module_1/lesson1.mp4",
    },
    modules: [
      {
        number: 1,
        title: "Training Principles",
        status: "not-started",
        videoUrl: "Modules/Body/Module_1/lesson1.mp4",
        resources: [],
      },
      {
        number: 2,
        title: "Nutrition Fundamentals",
        status: "not-started",
        videoUrl: "Modules/Body/Module_2/lesson2.mp4",
        resources: [],
      },
      {
        number: 3,
        title: "Program Design",
        status: "not-started",
        videoUrl: "Modules/Body/Module_3/lesson3.mp4",
        resources: [],
      },
      {
        number: 4,
        title: "Supplement Guide",
        status: "not-started",
        videoUrl: "Modules/Body/Module_4/lesson4.mp4",
        resources: [],
      },
      {
        number: 5,
        title: "Recovery Optimization",
        status: "not-started",
        videoUrl: "Modules/Body/Module_5/lesson5.mp4",
        resources: [],
      },
      {
        number: 6,
        title: "Advanced Techniques",
        status: "not-started",
        videoUrl: "Modules/Body/Module_6/lesson6.mp4",
        resources: [],
      },
      {
        number: 7,
        title: "Muscle Building Mastery",
        status: "not-started",
        videoUrl: "Modules/Body/Module_7/lesson7.mp4",
        resources: [],
      },
      {
        number: 8,
        title: "Fat Loss Strategies",
        status: "not-started",
        videoUrl: "Modules/Body/Module_8/lesson8.mp4",
        resources: [],
      },
      {
        number: 9,
        title: "Peak Performance Mindset",
        status: "not-started",
        videoUrl: "Modules/Body/Module_9/lesson9.mp4",
        resources: [],
      },
    ],
  },

  "mental-rewire": {
    title: "Mental Rewire Program (Mindset & Development)",
    description:
      "Reprogram your mind for success with cutting-edge mindset development hacks and psychology.",
    totalModules: 9,
    totalLessons: 20,
    progress: 0,
    currentLesson: {
      number: 1,
      title: "Mindset Foundations",
      summary:
        "Build a rock-solid mindset foundation that supports all your goals and ambitions.",
      videoUrl: "Modules/Mental/Module_1/lesson1.mp4",
    },
    modules: [
      {
        number: 1,
        title: "Mindset Foundations",
        status: "not-started",
        videoUrl: "Modules/Mental/Module_1/lesson1.mp4",
        resources: [],
      },
      {
        number: 2,
        title: "Neuroplasticity Hacks",
        status: "not-started",
        videoUrl: "Modules/Mental/Module_2/lesson2.mp4",
        resources: [],
      },
      {
        number: 3,
        title: "Breaking Limiting Beliefs",
        status: "not-started",
        videoUrl: "Modules/Mental/Module_3/lesson3.mp4",
        resources: [],
      },
      {
        number: 4,
        title: "Daily Habits & Systems",
        status: "not-started",
        videoUrl: "Modules/Mental/Module_4/lesson4.mp4",
        resources: [],
      },
      {
        number: 5,
        title: "Peak Performance State",
        status: "not-started",
        videoUrl: "Modules/Mental/Module_5/lesson5.mp4",
        resources: [],
      },
      {
        number: 6,
        title: "Emotional Intelligence Mastery",
        status: "not-started",
        videoUrl: "Modules/Mental/Module_6/lesson6.mp4",
        resources: [],
      },
      {
        number: 7,
        title: "Mental Toughness Training",
        status: "not-started",
        videoUrl: "Modules/Mental/Module_7/lesson7.mp4",
        resources: [],
      },
      {
        number: 8,
        title: "Focus & Concentration Hacks",
        status: "not-started",
        videoUrl: "Modules/Mental/Module_8/lesson8.mp4",
        resources: [],
      },
      {
        number: 9,
        title: "Identity Transformation",
        status: "not-started",
        videoUrl: "Modules/Mental/Module_9/lesson9.mp4",
        resources: [],
      },
    ],
  },

  "ultimate-optimization": {
    title: "Ultimate Human Optimization (Life Mastery)",
    description:
      "Level up every area of your life with this ultimate optimization program covering health, wealth, and relationships.",
    totalModules: 10,
    totalLessons: 25,
    progress: 0,
    currentLesson: {
      number: 1,
      title: "Life Assessment & Goal Setting",
      summary:
        "Conduct a complete life assessment and set clear, actionable goals across all major life domains.",
      videoUrl: "Modules/Human/Module_1/lesson1.mp4",
    },
    modules: [
      {
        number: 1,
        title: "Life Assessment & Goal Setting",
        status: "not-started",
        videoUrl: "Modules/Human/Module_1/lesson1.mp4",
        resources: [],
      },
      {
        number: 2,
        title: "Health Optimization",
        status: "not-started",
        videoUrl: "Modules/Human/Module_2/lesson2.mp4",
        resources: [],
      },
      {
        number: 3,
        title: "Wealth Building Systems",
        status: "not-started",
        videoUrl: "Modules/Human/Module_3/lesson3.mp4",
        resources: [],
      },
      {
        number: 4,
        title: "Relationship Mastery",
        status: "not-started",
        videoUrl: "Modules/Human/Module_4/lesson4.mp4",
        resources: [],
      },
      {
        number: 5,
        title: "Time Management",
        status: "not-started",
        videoUrl: "Modules/Human/Module_5/lesson5.mp4",
        resources: [],
      },
      {
        number: 6,
        title: "Energy Management",
        status: "not-started",
        videoUrl: "Modules/Human/Module_6/lesson6.mp4",
        resources: [],
      },
      {
        number: 7,
        title: "Legacy Building",
        status: "not-started",
        videoUrl: "Modules/Human/Module_7/lesson7.mp4",
        resources: [],
      },
      {
        number: 8,
        title: "Social Dynamics & Influence",
        status: "not-started",
        videoUrl: "Modules/Human/Module_8/lesson8.mp4",
        resources: [],
      },
      {
        number: 9,
        title: "Spiritual Growth & Purpose",
        status: "not-started",
        videoUrl: "Modules/Human/Module_9/lesson9.mp4",
        resources: [],
      },
      {
        number: 10,
        title: "Complete Life Integration",
        status: "not-started",
        videoUrl: "Modules/Human/Module_10/lesson10.mp4",
        resources: [],
      },
    ],
  },
};

// Global variables for video management
let currentProgramId = null;
let currentModuleIndex = 0;
let autoplayEnabled = false;

// ========================================
// LOAD PROGRAM WITH VIDEO SUPPORT
// ========================================
function loadProgram(programId) {
  console.log("📂 Loading program:", programId);

  const program = programsData[programId];

  if (!program) {
    console.error("❌ Program not found:", programId);
    return;
  }

  // Store current program
  currentProgramId = programId;
  currentModuleIndex = 0;

  // Update header
  const titleEl = document.querySelector(
    "#section-affiliateprogram .prog-program-title"
  );
  const descEl = document.querySelector(
    "#section-affiliateprogram .prog-program-desc"
  );
  const statsEl = document.querySelector(
    "#section-affiliateprogram .prog-program-stats"
  );
  const progressEl = document.querySelector(
    "#section-affiliateprogram .prog-progress-tracker"
  );

  if (titleEl) titleEl.textContent = program.title;
  if (descEl) descEl.textContent = program.description;
  if (statsEl) {
    statsEl.innerHTML = `
            <span class="prog-stat">🎯 ${program.totalModules} Modules</span>
            <span class="prog-stat">🎓 ${program.totalLessons} Lessons</span>
        `;
  }
  if (progressEl) progressEl.textContent = `📊 ${program.progress}% Complete`;

  // Load first video
  loadVideo(program.currentLesson);

  // Update lesson info
  const lessonIndicator = document.querySelector(
    "#section-affiliateprogram .prog-lesson-indicator"
  );
  const lessonTitle = document.querySelector(
    "#section-affiliateprogram .prog-lesson-title"
  );
  const lessonSummary = document.querySelector(
    "#section-affiliateprogram .prog-lesson-summary"
  );

  if (lessonIndicator)
    lessonIndicator.textContent = `Lesson ${program.currentLesson.number} of ${program.totalLessons}`;
  if (lessonTitle) lessonTitle.textContent = program.currentLesson.title;
  if (lessonSummary) lessonSummary.textContent = program.currentLesson.summary;

  // Render modules with click handlers
  renderModules(program.modules);

  console.log("✅ Program loaded successfully!");
}

// ========================================
// LOAD VIDEO INTO PLAYER
// ========================================
function loadVideo(lessonData) {
  const videoPlayer = document.getElementById("prog-video-player");

  if (!videoPlayer) {
    console.error("❌ Video player not found!");
    return;
  }

  if (!lessonData.videoUrl) {
    console.warn("⚠️ No video URL for this lesson");
    return;
  }

  // Update video source
  const source = videoPlayer.querySelector("source");
  if (source) {
    source.src = lessonData.videoUrl;
    videoPlayer.load();
  }

  // Update lesson info
  const lessonTitle = document.querySelector(".prog-lesson-title");
  const lessonSummary = document.querySelector(".prog-lesson-summary");

  if (lessonTitle) lessonTitle.textContent = lessonData.title;
  if (lessonSummary) lessonSummary.textContent = lessonData.summary;

  console.log("🎥 Loaded video:", lessonData.videoUrl);
}

// ========================================
// RENDER MODULES WITH CLICK HANDLERS
// ========================================
function renderModules(modules) {
  const modulesPanel = document.querySelector(
    "#section-affiliateprogram .prog-modules-panel"
  );

  if (!modulesPanel) {
    console.error("❌ Modules panel not found!");
    return;
  }

  // Keep title, remove old cards
  const existingCards = modulesPanel.querySelectorAll(".prog-module-card");
  existingCards.forEach((card) => card.remove());

  // Create new module cards
  modules.forEach((module, index) => {
    const moduleCard = createModuleCard(module, index);
    modulesPanel.appendChild(moduleCard);
  });

  console.log("✅ Rendered", modules.length, "modules");
}

// ========================================
// CREATE MODULE CARD WITH VIDEO CLICK
// ========================================
function createModuleCard(module, index) {
  const card = document.createElement("div");
  card.className = `prog-module-card ${
    module.status === "in-progress" ? "prog-active" : ""
  }`;

  // Add click handler to toggle AND load video
  card.onclick = function () {
    toggleDetail(this);
    playModuleVideo(index);
  };

  let statusHTML = "";
  if (module.status === "completed") {
    statusHTML =
      '<div class="prog-status-icon prog-completed">✓</div><span>Completed</span>';
  } else if (module.status === "in-progress") {
    statusHTML = "<span>In Progress</span>";
  } else {
    statusHTML = '<span style="color: #666;">Not Started</span>';
  }

  let resourcesHTML = "";
  if (module.resources && module.resources.length > 0) {
    const resourceItems = module.resources
      .map((r) => `<div class="prog-resource-item">${r.icon} ${r.name}</div>`)
      .join("");

    resourcesHTML = `
            <div class="prog-module-detail ${
              module.status === "in-progress" ? "prog-active" : ""
            }">
                <div class="prog-resources">
                    <h4 style="margin-bottom: 0.5rem; font-size: 0.9rem;">📎 Resources</h4>
                    ${resourceItems}
                </div>
            </div>
        `;
  }

  card.innerHTML = `
        <div class="prog-module-number">${module.number}</div>
        <div class="prog-module-content">
            <div class="prog-module-title">${module.title}</div>
            <div class="prog-module-status">
                ${statusHTML}
            </div>
        </div>
        ${resourcesHTML}
    `;

  return card;
}

// ========================================
// PLAY MODULE VIDEO WHEN CLICKED
// ========================================
function playModuleVideo(moduleIndex) {
  if (!currentProgramId) return;

  const program = programsData[currentProgramId];
  const module = program.modules[moduleIndex];

  if (!module || !module.videoUrl) {
    console.warn("⚠️ No video for this module");
    return;
  }

  currentModuleIndex = moduleIndex;

  // Mark as in-progress if not already completed
  if (module.status === "not-started") {
    module.status = "in-progress";
    console.log(`🔄 Module ${module.number} marked as in-progress`);

    // Save to Firestore
    saveProgressToFirestore(currentProgramId, module.number, "in-progress");

    // Update UI
    renderModules(program.modules);
    updateAllProgramCards();
  }

  // Update lesson indicator
  const lessonIndicator = document.querySelector(".prog-lesson-indicator");
  if (lessonIndicator) {
    lessonIndicator.textContent = `Lesson ${moduleIndex + 1} of ${
      program.totalLessons
    }`;
  }

  // Load the video
  loadVideo(module);

  console.log(`🎬 Playing module ${moduleIndex + 1}: ${module.title}`);
}

// ========================================
// MARK AS COMPLETED
// ========================================
function markAsCompleted() {
  console.log("🎯 markAsCompleted called");

  if (!currentProgramId) {
    console.error("❌ No current program ID!");
    return;
  }

  const program = programsData[currentProgramId];
  const module = program.modules[currentModuleIndex];

  if (module) {
    // Update local state
    module.status = "completed";
    console.log("✅ Module marked as completed:", module.title);

    // Save to Firestore
    console.log("💾 Saving to Firestore...");
    saveProgressToFirestore(currentProgramId, module.number, "completed");

    // Update UI
    renderModules(program.modules);
    updateOverallStats();
    updateAllProgramCards();
    updateOverallCourseProgress();

    showNotification(`✅ "${module.title}" marked as completed!`);

    // Autoplay next if enabled
    if (autoplayEnabled && currentModuleIndex < program.modules.length - 1) {
      setTimeout(() => {
        playModuleVideo(currentModuleIndex + 1);
      }, 1500);
    }
  } else {
    console.error("❌ Module not found!");
  }
}

// ========================================
// TOGGLE AUTOPLAY
// ========================================
function toggleAutoplay(element) {
  element.classList.toggle("active");
  autoplayEnabled = element.classList.contains("active");

  console.log("🔄 Autoplay:", autoplayEnabled ? "ON" : "OFF");
}

// ========================================
// AUTO-PLAY NEXT VIDEO ON COMPLETION
// ========================================
document.addEventListener("DOMContentLoaded", function () {
  const videoPlayer = document.getElementById("prog-video-player");

  if (videoPlayer) {
    videoPlayer.addEventListener("ended", function () {
      if (autoplayEnabled && currentProgramId) {
        const program = programsData[currentProgramId];

        if (currentModuleIndex < program.modules.length - 1) {
          console.log("🎬 Auto-playing next video...");
          playModuleVideo(currentModuleIndex + 1);
        } else {
          showNotification("🎉 Congratulations! You completed all lessons!");
        }
      }
    });
  }
});

// ========================================
// CALCULATE AND UPDATE OVERALL PROGRESS STATS
// ========================================
// ========================================
// CALCULATE AND UPDATE OVERALL PROGRESS STATS - WITH DEBUG LOGS
// ========================================
function updateOverallStats() {
  console.log("🔍 Starting updateOverallStats...");

  let programsStarted = 0;
  let totalPrograms = Object.keys(programsData).length;
  let lessonsCompleted = 0;
  let totalWatchTimeMinutes = 0;

  console.log("📚 Total programs in database:", totalPrograms);

  // Loop through all programs
  Object.entries(programsData).forEach(([programId, program]) => {
    console.log(`\n📂 Checking program: ${programId}`);
    let programHasStarted = false;

    // Check each module
    program.modules.forEach((module, index) => {
      console.log(
        `  Module ${index + 1}: "${module.title}" - Status: ${module.status}`
      );

      if (module.status === "completed") {
        lessonsCompleted++;
        totalWatchTimeMinutes += 15;
        programHasStarted = true;
        console.log(`    ✅ Completed! Total completed: ${lessonsCompleted}`);
      } else if (module.status === "in-progress") {
        totalWatchTimeMinutes += 7;
        programHasStarted = true;
        console.log(`    🔄 In progress! Added 7 min watch time`);
      }
    });

    if (programHasStarted) {
      programsStarted++;
      console.log(`  ✨ Program "${programId}" has been started!`);
    }
  });

  // Convert minutes to hours and minutes
  const hours = Math.floor(totalWatchTimeMinutes / 60);
  const minutes = totalWatchTimeMinutes % 60;

  console.log("\n📊 FINAL STATS:");
  console.log(`  Programs Started: ${programsStarted}/${totalPrograms}`);
  console.log(`  Lessons Completed: ${lessonsCompleted}`);
  console.log(
    `  Watch Time: ${hours}h ${minutes}m (${totalWatchTimeMinutes} total minutes)`
  );

  // Update the DOM - Overall Stats Section
  const programsStartedEl = document.getElementById("programs-started-stat");
  const lessonsCompletedEl = document.getElementById("lessons-completed-stat");
  const watchTimeEl = document.getElementById("watch-time-stat");

  console.log("\n🎯 Searching for DOM elements...");
  console.log("  programs-started-stat:", programsStartedEl);
  console.log("  lessons-completed-stat:", lessonsCompletedEl);
  console.log("  watch-time-stat:", watchTimeEl);

  if (programsStartedEl) {
    programsStartedEl.textContent = `${programsStarted}/${totalPrograms}`;
    console.log("  ✅ Updated programs started in DOM");
  } else {
    console.error("  ❌ Could not find programs-started-stat element!");
  }

  if (lessonsCompletedEl) {
    lessonsCompletedEl.textContent = lessonsCompleted;
    console.log("  ✅ Updated lessons completed in DOM");
  } else {
    console.error("  ❌ Could not find lessons-completed-stat element!");
  }

  if (watchTimeEl) {
    watchTimeEl.textContent = `${hours}h ${minutes}m`;
    console.log("  ✅ Updated watch time in DOM");
  } else {
    console.error("  ❌ Could not find watch-time-stat element!");
  }

  // ========================================
  // ADD THIS NEW SECTION - Update Snapshot Card
  // ========================================
  const snapshotLessonsEl = document.getElementById("lessonsCount");

  console.log("\n📸 Updating snapshot card...");
  console.log("  lessonsCount element:", snapshotLessonsEl);

  if (snapshotLessonsEl) {
    snapshotLessonsEl.textContent = lessonsCompleted;
    console.log("  ✅ Updated snapshot card lessons count:", lessonsCompleted);
  } else {
    console.error("  ❌ Could not find lessonsCount element!");
  }

  console.log("✅ updateOverallStats completed!\n");
}

// ========================================
// UPDATE ALL PROGRAM CARDS WITH REAL PROGRESS
// ========================================
function updateAllProgramCards() {
  console.log("🔄 Updating all program cards with real data...");

  // Get all program cards
  const programCards = document.querySelectorAll(".prog-program-card");

  programCards.forEach((card) => {
    const programId = card.getAttribute("data-program-id");

    if (!programId) {
      console.warn("⚠️ Card missing data-program-id:", card);
      return;
    }

    const program = programsData[programId];

    if (!program) {
      console.error(`❌ No data found for program: ${programId}`);
      return;
    }

    console.log(`\n📊 Updating card for: ${programId}`);

    // Calculate progress
    const totalModules = program.modules.length;
    const completedModules = program.modules.filter(
      (m) => m.status === "completed"
    ).length;
    const inProgressModules = program.modules.filter(
      (m) => m.status === "in-progress"
    ).length;

    // Calculate percentage (completed + half credit for in-progress)
    const progressPercentage = Math.round(
      ((completedModules + inProgressModules * 0.5) / totalModules) * 100
    );

    console.log(`  Total modules: ${totalModules}`);
    console.log(`  Completed: ${completedModules}`);
    console.log(`  In progress: ${inProgressModules}`);
    console.log(`  Progress: ${progressPercentage}%`);

    // Update progress badge
    const progressBadge = card.querySelector("[data-progress-badge]");
    if (progressBadge) {
      progressBadge.textContent = `${progressPercentage}% Complete`;

      // Add "hot" class if progress > 50%
      if (progressPercentage > 50) {
        progressBadge.classList.add("prog-hot");
      } else {
        progressBadge.classList.remove("prog-hot");
      }

      console.log(`  ✅ Updated badge: ${progressPercentage}%`);
    }

    // Update progress bar fill
    const progressFill = card.querySelector("[data-progress-fill]");
    if (progressFill) {
      progressFill.style.width = `${progressPercentage}%`;
      console.log(`  ✅ Updated progress bar: ${progressPercentage}%`);
    }

    // Update modules count
    const modulesCount = card.querySelector("[data-modules-count]");
    if (modulesCount) {
      modulesCount.textContent = `🎯 ${totalModules} Modules`;
      console.log(`  ✅ Updated modules count: ${totalModules}`);
    }

    // Update lessons count
    const lessonsCount = card.querySelector("[data-lessons-count]");
    if (lessonsCount) {
      lessonsCount.textContent = `🎓 ${program.totalLessons} Lessons`;
      console.log(`  ✅ Updated lessons count: ${program.totalLessons}`);
    }

    // Update button text based on progress
    const ctaButton = card.querySelector(".prog-program-cta");
    if (ctaButton) {
      if (progressPercentage === 0) {
        ctaButton.textContent = "Start Program →";
      } else if (progressPercentage === 100) {
        ctaButton.textContent = "Review Course ✓";
      } else {
        ctaButton.textContent = "Continue Learning →";
      }
      console.log(`  ✅ Updated button text`);
    }
  });

  console.log("\n✅ All program cards updated!\n");
}

// ========================================
// UPDATE OVERALL COURSE PROGRESS CARD
// ========================================
function updateOverallCourseProgress() {
  console.log("\n🎯 Calculating overall course progress...");

  let totalModulesAcrossAllPrograms = 0;
  let completedModulesAcrossAllPrograms = 0;
  let inProgressModulesAcrossAllPrograms = 0;

  // Loop through ALL programs
  Object.entries(programsData).forEach(([programId, program]) => {
    const totalModules = program.modules.length;
    const completedModules = program.modules.filter(
      (m) => m.status === "completed"
    ).length;
    const inProgressModules = program.modules.filter(
      (m) => m.status === "in-progress"
    ).length;

    totalModulesAcrossAllPrograms += totalModules;
    completedModulesAcrossAllPrograms += completedModules;
    inProgressModulesAcrossAllPrograms += inProgressModules;

    console.log(
      `  ${programId}: ${completedModules}/${totalModules} completed`
    );
  });

  // Calculate percentage (completed + half credit for in-progress)
  const overallProgressPercentage = Math.round(
    ((completedModulesAcrossAllPrograms +
      inProgressModulesAcrossAllPrograms * 0.5) /
      totalModulesAcrossAllPrograms) *
      100
  );

  console.log(`\n📊 OVERALL COURSE PROGRESS:`);
  console.log(
    `  Total modules across all programs: ${totalModulesAcrossAllPrograms}`
  );
  console.log(`  Completed: ${completedModulesAcrossAllPrograms}`);
  console.log(`  In Progress: ${inProgressModulesAcrossAllPrograms}`);
  console.log(`  Overall Progress: ${overallProgressPercentage}%`);

  // Update the DOM
  const progressText = document.getElementById("overall-progress-text");
  const progressBar = document.getElementById("overall-progress-bar");
  const motivationText = document.getElementById("progress-motivation");

  console.log("\n🎨 Updating progress card DOM...");
  console.log("  overall-progress-text:", progressText);
  console.log("  overall-progress-bar:", progressBar);
  console.log("  progress-motivation:", motivationText);

  if (progressText) {
    progressText.textContent = `${overallProgressPercentage}% Complete — Keep Building.`;
    console.log("  ✅ Updated progress text");
  } else {
    console.error("  ❌ Could not find overall-progress-text element!");
  }

  if (progressBar) {
    progressBar.style.width = `${overallProgressPercentage}%`;
    console.log("  ✅ Updated progress bar width");
  } else {
    console.error("  ❌ Could not find overall-progress-bar element!");
  }

  // Dynamic motivation message based on progress
  if (motivationText) {
    let motivationMessage = "";

    if (overallProgressPercentage === 0) {
      motivationMessage =
        "Start your journey. Every expert was once a beginner.";
    } else if (overallProgressPercentage < 25) {
      motivationMessage = "Great start! Consistency compounds. Keep going.";
    } else if (overallProgressPercentage < 50) {
      motivationMessage = "You're building momentum! Keep pushing forward.";
    } else if (overallProgressPercentage < 75) {
      motivationMessage = "Halfway there! The grind is paying off. 🔥";
    } else if (overallProgressPercentage < 100) {
      motivationMessage = "Almost done! Finish strong. You got this! 💪";
    } else {
      motivationMessage =
        "🎉 All courses completed! You're a beast! Time to execute!";
    }

    motivationText.textContent = motivationMessage;
    console.log("  ✅ Updated motivation text:", motivationMessage);
  } else {
    console.error("  ❌ Could not find progress-motivation element!");
  }

  console.log("✅ Overall course progress updated!\n");
}

// ========================================
// SAVE USER PROGRESS TO FIRESTORE
// ========================================
async function saveProgressToFirestore(programId, moduleNumber, status) {
  console.log("💾 Saving progress to Firestore...");
  console.log(`  Program: ${programId}`);
  console.log(`  Module: ${moduleNumber}`);
  console.log(`  Status: ${status}`);

  // Check if user is logged in
  const user = firebase.auth().currentUser;

  if (!user) {
    console.error("❌ No user logged in! Cannot save progress.");
    return;
  }

  console.log(`  User ID: ${user.uid}`);

  try {
    // Reference to user's progress document for this program
    const progressRef = db
      .collection("users")
      .doc(user.uid)
      .collection("progress")
      .doc(programId);

    // Get current program data from programsData
    const program = programsData[programId];

    // Build arrays of completed and in-progress module numbers
    const completedModules = [];
    const inProgressModules = [];

    program.modules.forEach((module, index) => {
      if (module.status === "completed") {
        completedModules.push(module.number);
      } else if (module.status === "in-progress") {
        inProgressModules.push(module.number);
      }
    });

    console.log(`  Completed modules: [${completedModules.join(", ")}]`);
    console.log(`  In-progress modules: [${inProgressModules.join(", ")}]`);

    // Save to Firestore
    await progressRef.set({
      completedModules: completedModules,
      inProgressModules: inProgressModules,
      lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
    });

    console.log("✅ Progress saved to Firestore successfully!");
  } catch (error) {
    console.error("❌ Error saving progress to Firestore:", error);
    showNotification("⚠️ Failed to save progress. Please try again.");
  }
}

// ========================================
// LOAD USER PROGRESS FROM FIRESTORE
// ========================================
async function loadProgressFromFirestore() {
  console.log("📥 Loading user progress from Firestore...");

  const user = firebase.auth().currentUser;

  if (!user) {
    console.error("❌ No user logged in! Cannot load progress.");
    return;
  }

  console.log(`  User ID: ${user.uid}`);

  try {
    // Get all progress documents for this user
    const progressSnapshot = await db
      .collection("users")
      .doc(user.uid)
      .collection("progress")
      .get();

    console.log(`  Found ${progressSnapshot.size} program progress documents`);

    if (progressSnapshot.empty) {
      console.log("  No saved progress found. Starting fresh!");
      return;
    }

    // Loop through each program's progress
    progressSnapshot.forEach((doc) => {
      const programId = doc.id;
      const progressData = doc.data();

      console.log(`\n📂 Loading progress for: ${programId}`);
      console.log(
        `  Completed: [${progressData.completedModules?.join(", ") || "none"}]`
      );
      console.log(
        `  In Progress: [${
          progressData.inProgressModules?.join(", ") || "none"
        }]`
      );

      // Update programsData with saved progress
      if (programsData[programId]) {
        programsData[programId].modules.forEach((module) => {
          // Reset status first
          module.status = "not-started";

          // Check if completed
          if (progressData.completedModules?.includes(module.number)) {
            module.status = "completed";
            console.log(`    Module ${module.number}: ✅ completed`);
          }
          // Check if in-progress
          else if (progressData.inProgressModules?.includes(module.number)) {
            module.status = "in-progress";
            console.log(`    Module ${module.number}: 🔄 in-progress`);
          }
        });
      }
    });

    console.log("\n✅ All progress loaded from Firestore!");

    // Update UI after loading progress
    updateAllProgramCards();
    updateOverallStats();
    updateOverallCourseProgress();
  } catch (error) {
    console.error("❌ Error loading progress from Firestore:", error);
  }
}
