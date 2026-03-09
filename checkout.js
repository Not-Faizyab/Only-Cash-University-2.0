// ===== REFERRAL TRACKING SYSTEM =====
console.log("🔥 Checkout.js loaded");

console.log("✅ Firebase initialized");

// ✅ Capture referral code from URL
const urlParams = new URLSearchParams(window.location.search);
let referralCode = urlParams.get("ref"); // Gets "user1234" from ?ref=user1234

if (referralCode) {
  console.log("🎁 Referral code detected:", referralCode);
  localStorage.setItem("pendingReferral", referralCode);
} else {
  // Clear any old referral codes if no ref in URL
  localStorage.removeItem("pendingReferral");
}

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Increment clicks for referrer
// Increment clicks for referrer
// Increment clicks for referrer
async function incrementReferrerClicks(affiliateCode) {
  console.log("📊 incrementReferrerClicks called for:", affiliateCode);

  try {
    console.log("🔍 Searching for user with affiliate code...");
    const userQuery = await db
      .collection("users")
      .where("affiliateCode", "==", affiliateCode)
      .limit(1)
      .get();

    console.log("Query empty?", userQuery.empty);

    if (!userQuery.empty) {
      const userDoc = userQuery.docs[0];
      const userId = userDoc.id;
      const userName = userDoc.data().name;
      const currentClicks = userDoc.data().clicks || 0;
      console.log("✅ Referrer found:", userName, "(", userId, ")");

      const newClicks = currentClicks + 1;

      console.log("🔄 Incrementing clicks...");
      await db
        .collection("users")
        .doc(userId)
        .update({
          clicks: firebase.firestore.FieldValue.increment(1),
        });
      console.log("✅ Clicks incremented! +1");

      // Update conversion rate
      await updateConversionRate(userId);

      // Check for click milestones
      await checkClickMilestones(userId, userName, newClicks);
    } else {
      console.log("❌ No user found with affiliate code:", affiliateCode);
    }
  } catch (error) {
    console.error("❌ Error tracking click:", error);
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);
  }
}

// Check click milestones
async function checkClickMilestones(userId, userName, totalClicks) {
  console.log("🖱️ Checking click milestones for:", userName);

  try {
    const userDoc = await db.collection("users").doc(userId).get();
    const achievedMilestones = userDoc.data().achievedMilestones || [];

    const clickMilestones = [
      {
        count: 20,
        message: `👀 ${userName} got 20 link clicks!`,
        id: "clicks_20",
      },
      {
        count: 50,
        message: `📈 ${userName} reached 50 clicks on their referral link!`,
        id: "clicks_50",
      },
      {
        count: 100,
        message: `💯 ${userName} hit 100 clicks!`,
        id: "clicks_100",
      },
      {
        count: 500,
        message: `🔥 ${userName} got 500 clicks on their link!`,
        id: "clicks_500",
      },
      {
        count: 1000,
        message: `🔥 ${userName} GOT 1000 CLICKS ON THEIR LINK!`,
        id: "clicks_1000",
      },
    ];

    for (const milestone of clickMilestones) {
      if (
        totalClicks >= milestone.count &&
        !achievedMilestones.includes(milestone.id)
      ) {
        console.log("🎊 Click milestone achieved:", milestone.id);
        await createNotification(milestone.message, "milestone");
        achievedMilestones.push(milestone.id);
      }
    }

    await db.collection("users").doc(userId).update({
      achievedMilestones: achievedMilestones,
    });
  } catch (error) {
    console.error("❌ Error checking click milestones:", error);
  }
}

// Track conversion and add commission
async function trackConversion(affiliateCode, buyerEmail, buyerName) {
  console.log("💰 trackConversion called");
  console.log("Affiliate code:", affiliateCode);
  console.log("Buyer email:", buyerEmail);
  console.log("Buyer name:", buyerName);

  try {
    console.log("🔍 Searching for referrer...");
    const userQuery = await db
      .collection("users")
      .where("affiliateCode", "==", affiliateCode)
      .limit(1)
      .get();

    console.log("Query empty?", userQuery.empty);

    if (userQuery.empty) {
      console.log("❌ No referrer found");
      return;
    }

    const referrerDoc = userQuery.docs[0];
    const referrerId = referrerDoc.id;
    const referrerName = referrerDoc.data().name;
    const currentEarnings = referrerDoc.data().pendingPayout || 0;
    const currentConversions = referrerDoc.data().conversions || 0;
    const commissionAmount = 199;

    console.log("✅ Referrer found:", referrerName, "(", referrerId, ")");
    console.log("💵 Commission amount:", commissionAmount);
    console.log("Current earnings:", currentEarnings);

    const newEarnings = currentEarnings + commissionAmount;
    const newConversions = currentConversions + 1;

    console.log("🔄 Updating referrer stats...");
    await db
      .collection("users")
      .doc(referrerId)
      .update({
        conversions: firebase.firestore.FieldValue.increment(1),
        pendingPayout:
          firebase.firestore.FieldValue.increment(commissionAmount),
      });
    console.log(
      "✅ Referrer stats updated! +1 conversion, +₹" + commissionAmount
    );

    // Update conversion rate
    await updateConversionRate(referrerId);

    console.log("🔄 Creating referral record...");
    await db.collection("referrals").add({
      affiliateCode: affiliateCode,
      referrerId: referrerId,
      referredUserEmail: buyerEmail,
      referredUserName: buyerName,
      commissionAmount: commissionAmount,
      status: "approved",
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    console.log("✅ Referral record created in database!");

    // Check for milestones
    console.log("🎯 Checking for milestones...");
    await checkMilestones(
      referrerId,
      referrerName,
      newEarnings,
      newConversions
    );

    console.log("🗑️ Clearing localStorage checkout_ref");
    localStorage.removeItem("checkout_ref");
    console.log("✅ localStorage cleared");
  } catch (error) {
    console.error("❌ Error tracking conversion:", error);
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);
  }
}

// Check and trigger milestone notifications
async function checkMilestones(
  userId,
  userName,
  totalEarnings,
  totalConversions
) {
  console.log("🎯 Checking milestones for:", userName);
  console.log("Total earnings:", totalEarnings);
  console.log("Total conversions:", totalConversions);

  try {
    // Get user's achieved milestones
    const userDoc = await db.collection("users").doc(userId).get();
    const achievedMilestones = userDoc.data().achievedMilestones || [];

    // Earnings milestones
    const earningMilestones = [
      {
        amount: 1000,
        message: `🎉 ${userName} just hit ₹1,000 in earnings!`,
        id: "earning_1k",
      },
      {
        amount: 5000,
        message: `💰 ${userName} crossed ₹5,000 in total earnings!`,
        id: "earning_5k",
      },
      {
        amount: 10000,
        message: `🚀 ${userName} reached ₹10,000 in earnings!`,
        id: "earning_10k",
      },
      {
        amount: 25000,
        message: `💎 ${userName} hit ₹25,000 milestone!`,
        id: "earning_25k",
      },
      {
        amount: 50000,
        message: `🔥 ${userName} EARNED ₹50,000+ THROUGH REFERRALS!`,
        id: "earning_50k",
      },
    ];

    for (const milestone of earningMilestones) {
      if (
        totalEarnings >= milestone.amount &&
        !achievedMilestones.includes(milestone.id)
      ) {
        console.log("🎊 New milestone achieved:", milestone.id);
        await createNotification(milestone.message, "milestone");
        achievedMilestones.push(milestone.id);
      }
    }

    // Conversion milestones
    const conversionMilestones = [
      {
        count: 5,
        message: `⚡️ ${userName} got 5 successful referrals!`,
        id: "conversion_5",
      },
      {
        count: 10,
        message: `🎯 ${userName} reached 10 conversions!`,
        id: "conversion_10",
      },
      {
        count: 25,
        message: `💪 ${userName} hit 25 total referrals!`,
        id: "conversion_25",
      },
      {
        count: 50,
        message: `🏆 ${userName} achieved 50 conversions!`,
        id: "conversion_50",
      },
      {
        count: 100,
        message: `🏆 ${userName} ACHIEVED 100 CONVERSIONS!`,
        id: "conversion_100",
      },
    ];

    for (const milestone of conversionMilestones) {
      if (
        totalConversions >= milestone.count &&
        !achievedMilestones.includes(milestone.id)
      ) {
        console.log("🎊 New milestone achieved:", milestone.id);
        await createNotification(milestone.message, "milestone");
        achievedMilestones.push(milestone.id);
      }
    }

    // Update achieved milestones
    await db.collection("users").doc(userId).update({
      achievedMilestones: achievedMilestones,
    });

    console.log("✅ Milestones checked and updated");
  } catch (error) {
    console.error("❌ Error checking milestones:", error);
  }
}

// Create notification in feed
async function createNotification(message, type) {
  console.log("📢 Creating notification:", message);

  try {
    await db.collection("notifications").add({
      message: message,
      type: type,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      createdAt: new Date().toISOString(),
    });

    console.log("✅ Notification created!");
  } catch (error) {
    console.error("❌ Error creating notification:", error);
  }
}

// Function to show message to user
function showMessage(message, type = "error") {
  console.log("📢 Showing message:", message, "(Type:", type + ")");

  const existingMessage = document.getElementById("toast-message");
  if (existingMessage) {
    existingMessage.remove();
  }

  const messageDiv = document.createElement("div");
  messageDiv.id = "toast-message";
  messageDiv.textContent = message;
  messageDiv.style.cssText = `
        position: fixed;
        top: 80px;
        left: 50%;
        transform: translateX(-50%);
        padding: 18px 36px;
        border-radius: 12px;
        font-size: 17px;
        font-weight: 600;
        z-index: 10000;
        animation: slideDown 0.4s ease-out;
        box-shadow: 0 8px 24px rgba(0,0,0,0.4);
        min-width: 300px;
        max-width: 90%;
        text-align: center;
        font-family: 'Manrope', sans-serif;
        border: 2px solid;
        ${
          type === "success"
            ? "background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border-color: #34d399;"
            : "background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; border-color: #f87171;"
        }
    `;

  document.body.appendChild(messageDiv);

  if (!document.getElementById("toast-animation-style")) {
    const style = document.createElement("style");
    style.id = "toast-animation-style";
    style.textContent = `
            @keyframes slideDown {
                from {
                    opacity: 0;
                    transform: translateX(-50%) translateY(-30px);
                }
                to {
                    opacity: 1;
                    transform: translateX(-50%) translateY(0);
                }
            }
            @keyframes slideUp {
                from {
                    opacity: 1;
                    transform: translateX(-50%) translateY(0);
                }
                to {
                    opacity: 0;
                    transform: translateX(-50%) translateY(-30px);
                }
            }
        `;
    document.head.appendChild(style);
  }

  setTimeout(() => {
    messageDiv.style.animation = "slideUp 0.4s ease-out forwards";
    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.remove();
      }
    }, 400);
  }, 4000);
}

// Function to validate email
function isValidEmail(email) {
  const isValid = emailRegex.test(email);
  console.log("✉️ Email validation for", email, ":", isValid);
  return isValid;
}

// Function to check if email already exists
async function emailExists(email) {
  console.log("🔍 Checking if email exists:", email);

  try {
    const querySnapshot = await db
      .collection("joinedUsers")
      .where("email", "==", email.toLowerCase())
      .get();

    const exists = !querySnapshot.empty;
    console.log("Email exists?", exists);
    return exists;
  } catch (error) {
    console.error("❌ Error checking email:", error);
    throw error;
  }
}

// Function to add email + name to database
async function addEmailToDatabase(email, name) {
  console.log("💾 Adding to database:", { email, name });

  try {
    await db.collection("joinedUsers").add({
      email: email.toLowerCase(),
      name: name.trim(),
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      joinedAt: new Date().toISOString(),
    });

    console.log("✅ User added to joinedUsers collection");

    analytics.logEvent("email_submitted", {
      email_domain: email.split("@")[1],
      name_length: name.trim().length,
    });

    return true;
  } catch (error) {
    console.error("❌ Error adding user:", error);
    throw error;
  }
}

// Replace your existing handleJoinClick function with this:
async function handleJoinClick(event) {
  console.log("🚀 handleJoinClick called");

  const joinButton = document.getElementById("joinButton");
  const originalText = joinButton.innerHTML;
  joinButton.disabled = true;
  joinButton.innerHTML = "⏳ Loading...";
  joinButton.style.opacity = "0.7";

  try {
    // Get current user from Firebase Auth
    const user = auth.currentUser; // ✅ Changed from firebase.auth()

    if (!user) {
      showMessage("Please login first!", "error");
      joinButton.disabled = false;
      joinButton.innerHTML = originalText;
      joinButton.style.opacity = "1";
      return;
    }

    const userEmail = user.email;
    const userId = user.uid;
    const userName = user.displayName || "User";

    console.log("👤 User:", userEmail);
    console.log("📡 Calling backend..."); // ADD THIS

    // Call backend to create subscription
    joinButton.innerHTML = "💳 Creating subscription...";

    // Get referral code
    const refCode = referralCode || localStorage.getItem("checkout_ref");
    const response = await fetch(
      "https://ocu-backend.onrender.com/create-subscription",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userEmail,
          name: userName,
          userId: userId,
          referralCode: refCode || null, // SEND TO BACKEND
        }),
      }
    );

    console.log("📨 Response status:", response.status); // ADD THIS

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Backend error:", errorText); // ADD THIS
      throw new Error(`Backend returned ${response.status}`);
    }

    const data = await response.json();
    console.log("📦 Response data:", data); // ADD THIS

    if (!data.success) {
      throw new Error("Failed to create subscription");
    }

    console.log("✅ Subscription created:", data.subscriptionId);

    // Open Razorpay Checkout
    openRazorpayCheckout(data.subscriptionId, userEmail, userName);
  } catch (error) {
    console.error("❌ Full error:", error); // IMPROVED
    console.error("❌ Error message:", error.message); // ADD THIS
    showMessage(`Error: ${error.message}`, "error");
    joinButton.disabled = false;
    joinButton.innerHTML = originalText;
    joinButton.style.opacity = "1";
  }
}

const paypalBtn = document.getElementById("paypal-subscribe-btn");

// Render PayPal buttons ONCE on page load
// Wait for both DOM and PayPal SDK
function initPayPal() {
  console.log("🔵 Checking for PayPal SDK...");

  const paypalContainer = document.getElementById("paypal-button-hidden");
  
  if (!paypalContainer) {
    console.error("❌ PayPal container not found");
    return;
  }

  if (typeof paypal === "undefined") {
    console.log("⏳ PayPal SDK not loaded yet, retrying in 500ms...");
    setTimeout(initPayPal, 500); // Check again in 500ms
    return;
  }

  console.log("✅ PayPal SDK loaded, rendering buttons...");

  paypal.Buttons({
    style: {
      shape: "pill",
      color: "gold",
      layout: "vertical",
      label: "subscribe",
    },
    createSubscription: function (data, actions) {
      console.log("🔵 createSubscription called");
      
      const user = auth.currentUser;
      if (!user) {
        alert("Please login first.");
        return Promise.reject("No user logged in");
      }

      return actions.subscription.create({
        plan_id: "P-4HW00028LU9823158NFFGTMQ",
      });
    },
    onApprove: async function (data, actions) {
      console.log("✅ PayPal subscription approved:", data);
      
      const user = auth.currentUser;
      const subscriptionId = data.subscriptionID;
      const userEmail = user.email;
      const userId = user.uid;
      const userName = user.displayName || "User";
      const refCode = referralCode || localStorage.getItem("checkout_ref");

      try {
        const res = await fetch(
          "https://ocu-backend.onrender.com/paypal-subscription-confirm",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              subscriptionId,
              email: userEmail,
              name: userName,
              userId,
              referralCode: refCode || null,
            }),
          }
        );

        const json = await res.json();

        if (json.success) {
          localStorage.removeItem("checkout_ref");
          window.location.href = "platform.html";
        } else {
          alert("Verification failed: " + (json.message || "Unknown error"));
        }
      } catch (err) {
        console.error("❌ Error verifying PayPal:", err);
        alert("Payment went through, but we could not verify. Contact support.");
      }
    },
    onError: (err) => {
      console.error("❌ PayPal onError fired:", err);
      alert("PayPal error: " + (err.message || "Unknown error"));
    },
  }).render("#paypal-button-hidden");

  console.log("✅ PayPal Buttons rendered!");
}

// Start checking when DOM loads
document.addEventListener("DOMContentLoaded", initPayPal);

const rzp = new Razorpay(options);

rzp.on("payment.failed", function (response) {
  console.log("🔴 ACTUAL ERROR:", response.error);
  alert(`Error: ${response.error.description}\nCode: ${response.error.code}`);
});

rzp.open();

// Cashfree Payment Handler
document.getElementById("joinButton").addEventListener("click", async function() {
  const user = auth.currentUser;
  
  if (!user) {
    alert("Please login first");
    return;
  }
  
  // Open Cashfree checkout (you already have this setup)
  // After user CLOSES the Cashfree popup/page, assume payment done
  
  // SET FLAG IN LOCALSTORAGE
  localStorage.setItem("payment_done", "true");
  localStorage.setItem("paymentMethod", "cashfree");
});

// NEW FUNCTION: Open Razorpay Subscription Checkout
function openRazorpayCheckout(subscriptionId, email, name, keyId) {
  console.log("💳 Opening Razorpay checkout...");

  const options = {
    key: keyId,
    subscription_id: subscriptionId,
    name: "OnlyCashUniversity",
    description: "Monthly Membership - ₹399/month",
    image: "https://onlycashuniversity.com/logo.png", // Your logo

    handler: function (response) {
      console.log("Payment successful!");
      console.log("Payment ID:", response.razorpay_payment_id);
      console.log("Subscription ID:", response.razorpay_subscription_id);

      // Show success message
      showMessage("Payment successful! Redirecting...", "success");

      // Clear referral code from localStorage
      localStorage.removeItem("checkoutref");
      localStorage.removeItem("pendingReferral");

      // ✅ SAVE PAYMENT DETAILS TO LOCALSTORAGE
      localStorage.setItem("paymentAmount", "399");
      localStorage.setItem("paymentMethod", "razorpay");
      localStorage.setItem("paymentCurrency", "INR");
      console.log("💰 Saved payment details: ₹399 via Razorpay");

      // 🚀 REDIRECT TO PLATFORM WITH URL PARAMS
      setTimeout(() => {
        window.location.href =
          "platform.html?amount=399&method=razorpay&currency=INR";
      }, 2000);
    },

    prefill: {
      email: email,
      name: name,
    },

    theme: {
      color: "#FF6B00", // Your brand color
    },

    modal: {
      ondismiss: function () {
        console.log("❌ Checkout closed by user");
        showMessage("Payment cancelled", "error");

        // Re-enable button
        const joinButton = document.getElementById("joinButton");
        joinButton.disabled = false;
        joinButton.innerHTML = "Subscribe Now";
        joinButton.style.opacity = "1";
      },
    },
  };

  const rzp = new Razorpay(options);
  rzp.open();
}

console.log("🔥 Checkout.js loaded");

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", async function () {
  console.log("📄 DOM Content Loaded");

  // Check URL for ref parameter
  const urlParams = new URLSearchParams(window.location.search);
  const refCode = urlParams.get("ref");

  console.log("🔍 Checking URL for ref parameter...");
  console.log("Ref code from URL:", refCode || "none");

  if (refCode) {
    console.log("🎁 Referral code found!");
    referralCode = refCode;

    console.log("💾 Saving to localStorage...");
    localStorage.setItem("checkout_ref", refCode);
    console.log("✅ Saved to localStorage");

    console.log("📊 Tracking click...");
    await incrementReferrerClicks(refCode);
  } else {
    console.log("🔍 Checking localStorage for saved ref code...");
    referralCode = localStorage.getItem("checkout_ref");
    console.log("Ref code from localStorage:", referralCode || "none");
  }

  // Get the checkout form
  const checkoutForm = document.getElementById("checkoutForm");

  if (checkoutForm) {
    checkoutForm.addEventListener("submit", handleJoinClick);
    console.log("✅ Form handler attached");
  } else {
    console.error("❌ Checkout form not found!");
  }

  // Log page view
  analytics.logEvent("page_view", {
    page_title: document.title,
    page_location: window.location.href,
  });
  console.log("✅ Page view logged to analytics");
});

// Save referral code into the logged-in user's doc (affiliate code string)
(() => {
  const params = new URLSearchParams(window.location.search);
  const refCode = params.get("ref"); // checkout.html?ref=AFFILIATE_CODE

  auth.onAuthStateChanged(async (user) => {
    if (!user || !refCode) return;

    const userRef = db.collection("users").doc(user.uid);
    const snap = await userRef.get();

    // LOCK IT: if referredBy already exists, don't overwrite
    const existing = snap.exists ? (snap.data()?.referredBy || "") : "";
    if (existing) {
      console.log("ℹ️ referredBy already set, not overwriting:", existing);
      return;
    }

    await userRef.set(
      {
        referredBy: refCode.trim(), // ✅ STORE AFFILIATE CODE, NOT UID
        referredBySetAt: firebase.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    console.log("✅ referredBy stored as affiliate code:", refCode);
  });
})();

// Calculate and update conversion rate
async function updateConversionRate(userId) {
  console.log("📊 Updating conversion rate for user:", userId);

  try {
    const userDoc = await db.collection("users").doc(userId).get();

    if (!userDoc.exists) {
      console.log("❌ User not found");
      return;
    }

    const userData = userDoc.data();
    const clicks = userData.clicks || 0;
    const conversions = userData.conversions || 0;

    // Calculate conversion rate (avoid division by zero)
    const conversionRate =
      clicks > 0 ? ((conversions / clicks) * 100).toFixed(2) : 0;

    console.log("Clicks:", clicks);
    console.log("Conversions:", conversions);
    console.log("Calculated conversion rate:", conversionRate + "%");

    // Update the conversion rate in database
    await db
      .collection("users")
      .doc(userId)
      .update({
        conversionRate: parseFloat(conversionRate),
      });

    console.log("✅ Conversion rate updated!");
  } catch (error) {
    console.error("❌ Error updating conversion rate:", error);
  }
}

console.log("✅ All functions defined, ready to rock! 🔥");
