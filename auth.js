// ===== FIREBASE AUTH SYSTEM =====
let currentUser = null;
let isSigningUp = false;

// ✅ ADD THIS - Clear any invalid auth state on auth page load
auth.onAuthStateChanged((user) => {
  if (user) {
    // Verify the user's credential is still valid
    user
      .reload()
      .then(() => {
        console.log("✅ Auth token is valid");
        currentUser = user;

        if (!isSigningUp) {
          // Check if sysadmin
          if (user.email === "sysadmin@onlycashuniversity.com") {
            window.location.href = "sysadmin.html";
          }
          // Check if admin
          else if (user.email === "admin@onlycashuniversity.com") {
            window.location.href = "admin.html";
          }
        }
      })
      .catch((error) => {
        // Token is invalid/expired - sign out and clear
        console.log("❌ Invalid auth token, clearing session");
        auth.signOut();
        currentUser = null;
      });
  } else {
    currentUser = null;
  }
});

// ===== CHECK URL PARAMETER FOR TAB =====
window.addEventListener("load", function () {
  // Get URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const tabParam = urlParams.get("tab");

  console.log("🔵 Checking URL parameter:", tabParam);

  // If tab=login in URL, switch to login tab
  if (tabParam === "login") {
    console.log("🔵 Opening LOGIN tab (from URL parameter)");

    // Use correct IDs with hyphens
    const loginForm = document.getElementById("login-form");
    const signupForm = document.getElementById("signup-form");

    if (loginForm && signupForm) {
      signupForm.style.display = "none";
      loginForm.style.display = "block";
      console.log("✅ Switched to LOGIN form");
    } else {
      console.log("❌ Forms not found");
    }
  } else {
    console.log("🔵 Opening SIGNUP tab (default)");
  }
});

// ===== HANDLE FORGOT PASSWORD WITH MODAL =====
function handleForgotPassword(e) {
  e.preventDefault();

  // Create modal overlay
  const modal = document.createElement("div");
  modal.className = "forgot-password-modal";
  modal.innerHTML = `
    <div class="forgot-password-content">
      <h3>Reset Password</h3>
      <p>Enter your email to receive a password reset link</p>
      <input type="email" id="reset-email" placeholder="your@email.com" />
      <div class="modal-buttons">
        <button class="modal-btn cancel-btn" onclick="closeForgotModal()">Cancel</button>
        <button class="modal-btn send-btn" onclick="sendResetEmail()">Send Link</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
}

function closeForgotModal() {
  const modal = document.querySelector(".forgot-password-modal");
  if (modal) modal.remove();
}

async function sendResetEmail() {
  const email = document.getElementById("reset-email").value.trim();

  if (!email) {
    alert("Please enter your email");
    return;
  }

  try {
    await auth.sendPasswordResetEmail(email);
    alert("✅ Password reset link sent! Check your email.");
    closeForgotModal();
  } catch (error) {
    const errorMsg =
      error.code === "auth/user-not-found"
        ? "No account found with this email"
        : error.code === "auth/invalid-email"
        ? "Invalid email address"
        : "Failed to send reset email. Please try again.";

    alert(errorMsg);
  }
}

// ===== REFERRAL TRACKING =====

// Extract referral code from URL
function getReferralFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  const refCode = urlParams.get("ref");

  if (refCode) {
    console.log("🔵 Referral code detected:", refCode);
    // Store in sessionStorage so it persists during the session
    sessionStorage.setItem("referralCode", refCode);
    return refCode;
  } else {
    // Check if we already stored it
    const storedRef = sessionStorage.getItem("referralCode");
    if (storedRef) {
      console.log("🔵 Using stored referral code:", storedRef);
      return storedRef;
    }
  }

  console.log("🔵 No referral code found");
  return null;
}

// Get referral code on page load
const referralCode = getReferralFromURL();

// Switch between login and signup
function switchToSignup(e) {
  e.preventDefault();
  document.getElementById("login-form").style.display = "none";
  document.getElementById("signup-form").style.display = "block";
}

function switchToLogin(e) {
  e.preventDefault();
  document.getElementById("signup-form").style.display = "none";
  document.getElementById("login-form").style.display = "block";
}

// Generate unique affiliate code
function generateAffiliateCode(name) {
  const cleanName = name
    .replace(/[^a-zA-Z]/g, "")
    .toUpperCase()
    .substring(0, 6);
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${cleanName}${randomNum}`;
}

// DOM loaded
document.addEventListener("DOMContentLoaded", function () {
  // Attach form handlers
  const loginForm = document.querySelector("#login-form .auth-form");
  const signupForm = document.querySelector("#signup-form .auth-form");

  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
  }

  if (signupForm) {
    signupForm.addEventListener("submit", handleSignup);
  }
});

document.addEventListener("DOMContentLoaded", function () {
  // Show signup by default
  document.getElementById("login-form").style.display = "none";
  document.getElementById("signup-form").style.display = "block";
});

async function handleLogin(e) {
  e.preventDefault();

  try {
    console.log("🔵 Login started");

    const emailInput = document.getElementById("login-email");
    const passwordInput = document.getElementById("login-password");

    if (!emailInput || !passwordInput) {
      console.error("❌ Login inputs not found in DOM");
      alert("Login form is broken. Check HTML IDs.");
      return;
    }

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    console.log("🔵 Email:", email);
    console.log("🔵 Password length:", password.length);

    // Firebase sign in
    console.log("🔵 Attempting Firebase signIn...");
    const userCredential = await auth.signInWithEmailAndPassword(
      email,
      password
    );
    const user = userCredential.user;

    console.log("✅ Firebase signIn successful");
    console.log("🔵 User:", user.uid, user.email);

    // Check if sysadmin
    if (user.email === "sysadmin@onlycashuniversity.com") {
      console.log("✅ Sysadmin detected, redirecting...");
      window.location.href = "sysadmin.html";
      return;
    }

    // Check if admin
    if (user.email === "admin@onlycashuniversity.com") {
      console.log("✅ Admin detected, redirecting...");
      window.location.href = "admin.html";
      return;
    }

    // Regular user - check subscription
    console.log("✅ Regular user, checking subscription status...");

    const userDoc = await db.collection("users").doc(user.uid).get();

    if (!userDoc.exists) {
      console.error("❌ User document not found");
      alert("User data not found. Please contact support.");
      return;
    }

    const userData = userDoc.data(); // ✅ Define it here
    console.log("🔵 User data:", userData);

    // Check subscription
    if (userData.subscriptionActive === true) {
      console.log("✅ subscriptionActive is true");

      if (userData.subscriptionValidTill) {
        // ✅ Handle Firestore Timestamp properly
        let validTillDate;

        if (userData.subscriptionValidTill.toDate) {
          validTillDate = userData.subscriptionValidTill.toDate();
        } else {
          validTillDate = new Date(userData.subscriptionValidTill);
        }

        const currentDate = new Date();

        console.log("🔵 Current date:", currentDate.toISOString());
        console.log("🔵 Subscription valid till:", validTillDate.toISOString());

        if (validTillDate > currentDate) {
          console.log("✅ Subscription valid, redirecting to platform");
          window.location.href = "mainplatform.html";
        } else {
          console.log("❌ Subscription expired, updating and redirecting");
          await db.collection("users").doc(user.uid).update({
            subscriptionActive: false,
          });
          window.location.href = "checkout.html";
        }
      } else {
        // No expiry date set, allow access
        console.log("✅ No expiry check, granting access");
        window.location.href = "mainplatform.html";
      }
    } else {
      console.log("❌ subscriptionActive is false, redirecting to checkout");
      window.location.href = "checkout.html";
    }
  } catch (error) {
    console.error("❌ Login error:", error);
    console.error("❌ Error code:", error.code);
    console.error("❌ Error message:", error.message);

    let errorMsg;

    if (error.code === "auth/invalid-credential") {
      errorMsg =
        "❌ Invalid email or password.\n\n💡 If you signed up with Google, please use the 'Continue with Google' button instead.";
    } else if (error.code === "auth/user-not-found") {
      errorMsg = "No account found with this email.";
    } else if (error.code === "auth/wrong-password") {
      errorMsg = "Incorrect password.";
    } else if (error.code === "auth/invalid-email") {
      errorMsg = "Invalid email address.";
    } else {
      errorMsg = "Login failed: " + error.message;
    }

    alert(errorMsg);
  }
}

// ===== HANDLE SIGNUP =====
async function handleSignup(e) {
  e.preventDefault();
  console.log("🔵 Signup started");

  isSigningUp = true;

  const name = e.target.querySelector('input[type="text"]').value;
  const email = e.target.querySelector('input[type="email"]').value;
  const password = e.target.querySelector('input[type="password"]').value;

  console.log("🔵 Name:", name);
  console.log("🔵 Email:", email);

  try {
    console.log("🔵 Creating Firebase user...");
    const userCredential = await auth.createUserWithEmailAndPassword(
      email,
      password
    );
    const user = userCredential.user;
    console.log("✅ Firebase user created:", user.uid);

    // Generate affiliate code
    const affiliateCode = generateAffiliateCode(name);
    console.log("🔵 Generated affiliate code:", affiliateCode);

    // Store affiliate code directly (not UID)
    let referralAffiliateCode = null;
    if (referralCode) {
      console.log("🎁 Referral code detected:", referralCode);
      referralAffiliateCode = referralCode.trim(); // Just use the code itself
    }

    // Create user document with referredBy field
    const userData = {
      name: name,
      email: email,
      affiliateCode: affiliateCode,
      clicks: 0,
      conversions: 0,
      pendingPayout: 0,
      paidPayout: 0,
      conversionRate: 0,
      role: "user",
      subscriptionActive: false,
      createdAt: new Date().toISOString(),
    };

    // Add referredBy field (affiliate code)
    if (referralAffiliateCode) {
      userData.referredBy = referralAffiliateCode; // ← STORES AFFILIATE CODE (CORRECT)
      console.log(
        "✅ Adding referredBy (affiliate code):",
        referralAffiliateCode
      );
    }

    console.log("🔵 Creating Firestore document...");
    await db.collection("users").doc(user.uid).set(userData);
    console.log("✅ User document created successfully");
    isSigningUp = false;
    console.log("✅ Signup complete, redirecting to checkout");

    // Redirect to checkout with ref code if exists
    const checkoutURL = referralCode
      ? `checkout.html?ref=${referralCode}`
      : "checkout.html";
    window.location.href = checkoutURL;
  } catch (error) {
    isSigningUp = false;
    console.error("❌ Signup error:", error);

    const errorMsg =
      error.code === "auth/email-already-in-use"
        ? "This email is already registered! Please try switching to the login page"
        : error.code === "auth/weak-password"
        ? "Password should be at least 6 characters"
        : error.code === "auth/invalid-email"
        ? "Invalid email address"
        : "Signup failed. Please try again.";
    alert(errorMsg);
  }
}

// ===== HANDLE GOOGLE LOGIN =====
async function handleGoogleLogin(e) {
  e.preventDefault();

  const provider = new firebase.auth.GoogleAuthProvider();

  try {
    const result = await auth.signInWithPopup(provider);
    const user = result.user;

    const userDoc = await db.collection("users").doc(user.uid).get();

    if (!userDoc.exists) {
      const affiliateCode = generateAffiliateCode(user.displayName);

      await db.collection("users").doc(user.uid).set({
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        affiliateCode: affiliateCode,
        referredBy: null,
        clicks: 0,
        conversions: 0,
        conversionRate: 0,
        totalEarnings: 0,
        pendingPayout: 0,
        achievedMilestones: [],
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        programs: [],
        completedLessons: [],
      });
    }
  } catch (error) {
    alert("Google login failed. Please try again.");
  }
}

function updateLiveText() {
  const names = [
    "Suryansh",
    "Aarav",
    "Meera",
    "Priya",
    "Ananya",
    "Ravi",
    "Karan",
    "Zara",
    "Neha",
    "Arjun",
    "Divya",
    "Vihaan",
    "Isha",
    "Riya",
    "Tanvi",
    "Mohit",
    "Aditi",
    "Rahul",
    "Nisha",
    "Aditya",
    "Ishaan",
    "Kriti",
    "Saanvi",
    "Dev",
    "Anika",
    "Riyaan",
    "Ansh",
    "Naveen",
    "Kiran",
    "Sneha",
    "Pranav",
    "Tara",
    "Vidya",
    "Jiya",
    "Kabir",
    "Aria",
    "Mehul",
    "Luna",
    "Daksh",
    "Sara",
    "Ojas",
  ];
  const cities = [
    "Pune",
    "Mumbai",
    "Bengaluru",
    "Delhi",
    "Chennai",
    "Kolkata",
    "Ahmedabad",
    "Hyderabad",
    "Jaipur",
    "Panchkula",
    "Chandigarh",
    "Ahmedabad",
    "Kochi",
    "Coimbatore",
    "Vizag",
    "Lucknow",
    "Nagpur",
    "Indore",
    "Surat",
    "Vadodara",
    "Ghaziabad",
    "Noida",
    "Guwahati",
    "Hyderabad",
  ];

  const name = names[Math.floor(Math.random() * names.length)];
  const city = cities[Math.floor(Math.random() * cities.length)];

  const span = document.querySelector(".live-text");
  if (span) {
    span.textContent = `${name} from ${city} joined OnlyCashUniversity 3 mins ago`;
  }
}

updateLiveText();
