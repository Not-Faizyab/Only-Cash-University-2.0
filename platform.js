// ===== SUBSCRIPTION ACTIVATION SCRIPT =====

console.log("🔵 Subscription activation page loaded");

// Check if user is logged in
auth.onAuthStateChanged(async (user) => {
  if (user) {
    console.log("✅ User logged in:", user.uid);
    
    // Activate subscription
    await activateSubscription(user);
    
    // Pay referrer commission
    const buyerDoc = await db.collection("users").doc(user.uid).get();
    const buyerName = buyerDoc.exists ? (buyerDoc.data()?.name || "User") : "User";
    await payReferrerCommission(user.uid, user.email, buyerName);
    
  } else {
    console.log("❌ No user logged in, redirecting to login");
    window.location.href = "index.html";
  }
});

async function activateSubscription(user) {
  try {
    console.log("🔵 Activating subscription...");

    // Calculate date 1 month from now
    const currentDate = new Date();
    const validTillDate = new Date(currentDate);
    validTillDate.setMonth(validTillDate.getMonth() + 1);

    console.log("🔵 Current date:", currentDate.toISOString());
    console.log("🔵 Valid until date:", validTillDate.toISOString());

    // ✅ GET PAYMENT DETAILS FROM URL OR LOCALSTORAGE
    const urlParams = new URLSearchParams(window.location.search);
    const paymentAmount =
      parseInt(urlParams.get("amount")) ||
      parseInt(localStorage.getItem("paymentAmount")) ||
      399;
    const paymentMethod =
      urlParams.get("method") ||
      localStorage.getItem("paymentMethod") ||
      "razorpay";
    const paymentCurrency =
      urlParams.get("currency") ||
      localStorage.getItem("paymentCurrency") ||
      "INR";
    const paymentAmountUSD =
      parseFloat(urlParams.get("usd")) ||
      parseFloat(localStorage.getItem("paymentAmountUSD")) ||
      null;

    console.log(
      `💰 Saving payment info: ₹${paymentAmount} via ${paymentMethod}`
    );

    // Update Firestore with subscription data + payment info
    await db.collection("users").doc(user.uid).update({
      subscriptionActive: true,
      subscriptionValidTill: validTillDate.toISOString(),
      subscriptionActivatedAt: currentDate.toISOString(),
      // ✅ ADD PAYMENT INFO
      paymentAmount: paymentAmount,
      paymentMethod: paymentMethod,
      paymentCurrency: paymentCurrency,
      paymentAmountUSD: paymentAmountUSD,
      lastPaymentDate: currentDate.toISOString(),
    });

    console.log("✅ Subscription activated successfully with payment details!");
  } catch (error) {
    console.error("❌ Error activating subscription:", error);
    alert("Failed to activate subscription. Please contact support.");
  }
}

// Display formatted date
function displayValidUntilDate(date) {
  const options = { year: "numeric", month: "long", day: "numeric" };
  const formattedDate = date.toLocaleDateString("en-US", options);
  document.getElementById("validUntilDate").textContent = formattedDate;
  console.log("✅ Displayed date:", formattedDate);
}

// Handle redirect to main platform
document.getElementById("goToPlatform").addEventListener("click", () => {
  console.log("🔵 Redirecting to main platform...");
  window.location.href = "mainplatform.html";
});

// Check subscription and track payment
auth.onAuthStateChanged(async (user) => {
  if (user) {
    console.log("✅ User accessing platform.html:", user.email);

    try {
      // Get user details
      const userDoc = await db.collection("users").doc(user.uid).get();
      if (!userDoc.exists) {
        console.log("❌ User not found in database");
        alert("❌ Account not found. Please sign up again.");
        window.location.href = "auth.html";
        return;
      }

      const userData = userDoc.data();
      const now = new Date();

      // ===== CHECK SUBSCRIPTION VALIDITY =====
      let isSubscriptionValid = false;
      if (userData.subscriptionActive && userData.subscriptionValidTill) {
        const validTillDate = new Date(userData.subscriptionValidTill);
        console.log("📅 Subscription Check:");
        console.log("   Current Date:", now.toISOString());
        console.log("   Valid Till:", validTillDate.toISOString());
        console.log("   Is Active:", userData.subscriptionActive);

        // Check if current date is BEFORE valid till date
        if (now < validTillDate) {
          isSubscriptionValid = true;
          console.log("✅ Subscription is VALID");
        } else {
          console.log("❌ Subscription EXPIRED");
        }
      } else {
        console.log("❌ No active subscription");
      }

      // ===== IF EXPIRED OR NO SUBSCRIPTION - REDIRECT TO CHECKOUT =====
      if (!isSubscriptionValid) {
        console.log("🔴 Access DENIED - Subscription expired or inactive");
        // Deactivate subscription in database
        await db.collection("users").doc(user.uid).update({
          subscriptionActive: false,
        });
        alert(
          "⚠️ Your subscription has expired!\n\nPlease renew to continue accessing the platform."
        );
        window.location.href = "checkout.html";
        return;
      }

      // ===== IF VALID - RECORD PAYMENT (if not already recorded) =====
      console.log("✅ Subscription is VALID - Granting access");

      // Check if already recorded in paidUsers
      const existingPayment = await db
        .collection("paidUsers")
        .where("userId", "==", user.uid)
        .limit(1)
        .get();

      // Only add if not already recorded (avoid duplicates)
      if (existingPayment.empty) {
        // ===== RECORD PAYMENT IN HISTORY =====
        console.log("💰 Recording payment in history...");

        // ✅ GET PAYMENT DETAILS FROM URL OR LOCALSTORAGE
        const urlParams = new URLSearchParams(window.location.search);
        const paymentAmount =
          parseInt(urlParams.get("amount")) ||
          parseInt(localStorage.getItem("paymentAmount")) ||
          399;
        const paymentMethod =
          urlParams.get("method") ||
          localStorage.getItem("paymentMethod") ||
          "razorpay";
        const paymentCurrency =
          urlParams.get("currency") ||
          localStorage.getItem("paymentCurrency") ||
          "INR";
        const paymentAmountUSD =
          parseFloat(urlParams.get("usd")) ||
          parseFloat(localStorage.getItem("paymentAmountUSD")) ||
          null;

        console.log(`💰 Payment Details:`);
        console.log(`   Amount: ₹${paymentAmount}`);
        console.log(`   Method: ${paymentMethod}`);
        console.log(`   Currency: ${paymentCurrency}`);

        // ✅ ALWAYS ADD TO PAYMENTS COLLECTION (EVERY PAYMENT)
        await db.collection("payments").add({
          userId: user.uid,
          name: userData.name || "Unknown",
          email: user.email,
          amount: paymentAmount,
          paymentMethod: paymentMethod,
          paymentCurrency: paymentCurrency,
          paymentAmountUSD: paymentAmountUSD,
          paymentDate: firebase.firestore.FieldValue.serverTimestamp(),
          subscriptionValidTill: userData.subscriptionValidTill,
          subscriptionActivatedAt: userData.subscriptionActivatedAt,
          isRenewal: false, // Will update this below
        });

        console.log("✅ Payment added to payment history!");

        // ✅ CHECK IF USER EXISTS IN PAIDUSERS (CURRENT STATUS)
        const existingUser = await db
          .collection("paidUsers")
          .where("userId", "==", user.uid)
          .limit(1)
          .get();

        if (existingUser.empty) {
          // 🆕 FIRST-TIME USER - Add to paidUsers
          console.log("🆕 First-time user - creating paidUsers record");
          await db.collection("paidUsers").add({
            userId: user.uid,
            name: userData.name || "Unknown",
            email: user.email,
            firstPaymentAmount: paymentAmount,
            firstPaymentMethod: paymentMethod,
            firstPaymentDate: firebase.firestore.FieldValue.serverTimestamp(),
            latestPaymentAmount: paymentAmount,
            latestPaymentMethod: paymentMethod,
            latestPaymentDate: firebase.firestore.FieldValue.serverTimestamp(),
            totalPayments: 1,
            totalRevenue: paymentAmount,
            subscriptionActive: userData.subscriptionActive,
            subscriptionValidTill: userData.subscriptionValidTill,
            firstAccessedAt: new Date().toISOString(),
            lastAccessedAt: new Date().toISOString(),
          });
          console.log("✅ First payment recorded in paidUsers!");
        } else {
          // 🔄 RETURNING USER - Update paidUsers + mark as renewal
          console.log("🔄 Returning user - updating paidUsers record");
          const userDoc = existingUser.docs[0];
          const existingData = userDoc.data();

          // Update the payment we just added - mark as renewal
          const recentPayment = await db
            .collection("payments")
            .where("userId", "==", user.uid)
            .orderBy("paymentDate", "desc")
            .limit(1)
            .get();

          if (!recentPayment.empty) {
            await db
              .collection("payments")
              .doc(recentPayment.docs[0].id)
              .update({
                isRenewal: true,
              });
          }

          // Update paidUsers with latest info
          await db
            .collection("paidUsers")
            .doc(userDoc.id)
            .update({
              latestPaymentAmount: paymentAmount,
              latestPaymentMethod: paymentMethod,
              latestPaymentDate:
                firebase.firestore.FieldValue.serverTimestamp(),
              totalPayments: firebase.firestore.FieldValue.increment(1),
              totalRevenue:
                firebase.firestore.FieldValue.increment(paymentAmount),
              subscriptionActive: userData.subscriptionActive,
              subscriptionValidTill: userData.subscriptionValidTill,
              lastAccessedAt: new Date().toISOString(),
            });

          console.log(
            `✅ Renewal recorded! Total payments: ${
              (existingData.totalPayments || 0) + 1
            }`
          );
          console.log(
            `✅ Total revenue from user: ₹${
              (existingData.totalRevenue || 0) + paymentAmount
            }`
          );
        }

        // ✅ CLEAR LOCALSTORAGE AFTER RECORDING
        localStorage.removeItem("paymentAmount");
        localStorage.removeItem("paymentMethod");
        localStorage.removeItem("paymentCurrency");
        localStorage.removeItem("paymentAmountUSD");
        console.log("🎉 Payment processing complete!");
      }

      console.log("🎉 Access granted to platform!");
    } catch (error) {
      console.error("❌ Error checking subscription:", error);
      alert("❌ Error verifying subscription. Please try again.");
      window.location.href = "auth.html";
    }
  } else {
    console.log("⚠️ No user logged in - redirecting to auth");
    window.location.href = "auth.html";
  }
});

// ===== AUTO-PAY REFERRER COMMISSION (RECURRING - EVERY MONTH) =====
async function payReferrerCommission(buyerUID, buyerEmail, buyerName) {
  console.log("💰 Checking for referrer to pay commission...");

  try {
    // 1) Get buyer's referral code (affiliate code string) from Firestore
    const buyerSnap = await db.collection("users").doc(buyerUID).get();
    if (!buyerSnap.exists) {
      console.log("❌ Buyer user doc not found:", buyerUID);
      return;
    }

    const buyerData = buyerSnap.data() || {};
    const referralCode = (buyerData.referredBy || "").trim(); // IMPORTANT: safe trim

    if (!referralCode) {
      console.log("ℹ️ No referredBy on buyer doc - user came directly");
      return;
    }

    console.log("🎁 referredBy (affiliate code):", referralCode);

    // 2) Find referrer by affiliateCode == referralCode
    const referrerQuery = await db
      .collection("users")
      .where("affiliateCode", "==", referralCode)
      .limit(1)
      .get();

    if (referrerQuery.empty) {
      console.log("❌ No referrer found with affiliateCode:", referralCode);
      return;
    }

    const referrerDoc = referrerQuery.docs[0];
    const referrerId = referrerDoc.id;
    const referrerData = referrerDoc.data() || {};
    const referrerName = referrerData.name || "Referrer";

    console.log("✅ Referrer found:", referrerName, "(", referrerId, ")");

    // 3) Prevent double-pay for the same month
    const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"

    const existingCommission = await db
      .collection("referrals")
      .where("referrerId", "==", referrerId)
      .where("referredUserId", "==", buyerUID)
      .where("paymentMonth", "==", currentMonth)
      .limit(1)
      .get();

    if (!existingCommission.empty) {
      console.log("⚠️ Commission already paid for this month, skipping...");
      return;
    }

    // 4) Pay commission
    const commissionAmount = 199;

    await db.collection("users").doc(referrerId).update({
      pendingPayout: firebase.firestore.FieldValue.increment(commissionAmount),
      conversions: firebase.firestore.FieldValue.increment(1),
    });

    console.log("✅ Referrer earnings updated! +₹199");

    // 5) Record the commission
    await db.collection("referrals").add({
      affiliateCode: referralCode,
      referrerId: referrerId,
      referredUserId: buyerUID,
      referredUserEmail: buyerEmail || null,
      referredUserName: buyerName || "User",
      commissionAmount: commissionAmount,
      status: "approved",
      paymentMonth: currentMonth,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    // 6) Optional notification
    await db.collection("notifications").add({
      message: `${referrerName} earned ₹${commissionAmount} from ${
        buyerName || "a user"
      }'s payment (${currentMonth}).`,
      type: "conversion",
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    });

    console.log("✅ Referral record + notification created");
  } catch (error) {
    console.error("❌ Error paying referrer commission:", error);
  }
}