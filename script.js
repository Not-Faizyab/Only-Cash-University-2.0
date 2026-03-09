const urgentMessages = [
    "⚡ Early Access Pricing Ending Soon",
    "🔥 500+ Members Already Joined",
    "💰 50% Commission For Affiliates"
];
let messageIndex = 0;

function updateCountdown() {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);

    const diff = midnight - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    const countdownEl = document.getElementById('countdown');
    if (countdownEl) {
        countdownEl.textContent = `${hours}h ${minutes}m`;
    }
}

function rotateUrgentMessage() {
    const messageEl = document.getElementById('rotating-message');
    if (!messageEl) return;

    messageIndex = (messageIndex + 1) % urgentMessages.length;
    messageEl.style.opacity = '0';

    setTimeout(() => {
        if (messageIndex === 0) {
            updateCountdown();
            messageEl.innerHTML = `⚡️ Launch Pricing Ends in <span id="countdown"></span>`;
            updateCountdown();
        } else {
            messageEl.textContent = urgentMessages[messageIndex];
        }
        messageEl.style.opacity = '1';
    }, 300);
}

function updateScrollProgress() {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    document.getElementById('scroll-progress').style.width = scrolled + '%';
}

function handleNavbarScroll() {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
}

function handleStickyCtaVisibility() {
    const stickyCta = document.getElementById('sticky-cta');
    if (window.scrollY > 800) {
        stickyCta.classList.add('visible');
    } else {
        stickyCta.classList.remove('visible');
    }
}

function updateReferralCalculator() {
    const slider = document.getElementById('referral-slider');
    const sliderValue = document.getElementById('slider-value');
    const monthlyEarning = document.getElementById('monthly-earning');
    const yearlyEarning = document.getElementById('yearly-earning');

    if (!slider) return;

    const referrals = parseInt(slider.value);
    const priceInRupees = 399;
    const commission = 0.5;

    const monthly = referrals * priceInRupees * commission;
    const yearly = monthly * 12;

    sliderValue.textContent = referrals;
    monthlyEarning.textContent = `₹${monthly.toLocaleString('en-IN')}`;
    yearlyEarning.textContent = `₹${yearly.toLocaleString('en-IN')}`;
}

function toggleFaq(element) {
    const faqItem = element.closest('.faq-item');
    const allFaqItems = document.querySelectorAll('.faq-item');

    allFaqItems.forEach(item => {
        if (item !== faqItem && item.classList.contains('active')) {
            item.classList.remove('active');
        }
    });

    faqItem.classList.toggle('active');
}

const names = [
    "Rahul from Delhi",
    "Priya from Mumbai",
    "Arjun from Bangalore",
    "Sneha from Pune",
    "Vikram from Hyderabad",
    "Ananya from Chennai",
    "Rohan from Kolkata",
    "Ishita from Jaipur",
    "Aditya from Ahmedabad",
    "Ashar from Lucknow",
    "Siddharth from Surat",
    "Meera from Kanpur",
    "Aman from Nagpur",
    "Nisha from Indore",
    "Karan from Thane",
    "Ritu from Bhopal",
    "Vivek from Visakhapatnam",
    "Simran from Pimpri-Chinchwad",
    "Ayesha from Patna",
    "Mohit from Vadodara",
    "Neha from Ghaziabad",
    "Deepak from Ludhiana",
    "Alok from Agra",
    "Bhavna from Nashik",
    "Suresh from Faridabad",
    "Komal from Meerut",
    "Rajat from Rajkot",
    "Pooja from Kalyan-Dombivli",
    "Harsh from Vasai-Virar",
    "Jyoti from Varanasi",
    "Manish from Srinagar",
    "Sunita from Aurangabad",
    "Rajesh from Dhanbad",
    "Divya from Amritsar",
    "Kunal from Navi Mumbai",
    "Swati from Allahabad",
    "Anil from Howrah",
    "Neetu from Ranchi",
    "Ajay from Coimbatore",
    "Manu from Jabalpur",
    "Rhea from Gwalior",
    "Utkarsh from Vijayawada",
    "Pallavi from Jodhpur",
    "Tarun from Madurai",
    "Sonal from Raipur",
    "Vikas from Kota",
    "Rina from Guwahati",
    "Kartik from Chandigarh",
    "Anju from Solapur",
    "Rakesh from Hubli-Dharwad",
    "Rekha from Tiruchirappalli",
    "Mohammad from Bareilly",
    "Shreya from Moradabad",
    "Akash from Mysore",
    "Rashmi from Gurgaon",
    "Kiran from Aligarh",
    "Neeraj from Jalandhar",
    "Sana from Tirupati",
    "Vandana from Bhubaneswar",
    "Harpreet from Salem",
    "Lalit from Faridkot",
    "Nidhi from Nellore",
    "Rohit from Jalgaon",
    "Yash from Ujjain",
    "Rachna from Malegaon",
    "Dinesh from Ambattur",
    "Shivani from Kolhapur",
    "Gaurav from Gandhinagar",
    "Mehul from Thrissur",
    "Sabrina from Jamshedpur",
    "Prakash from Bhavnagar",
    "Isha from Cuttack",
    "Sanjay from Firozabad",
    "Sweta from Kochi",
    "Adarsh from Bhagalpur",
    "Ankita from Gorakhpur",
    "Naveen from Kota",
];

function showLiveNotification() {
    const notification = document.getElementById('live-notification');
    const nameEl = document.getElementById('notification-name');
    const timeEl = notification.querySelector('.notification-time');

    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomMinutes = Math.floor(Math.random() * 45) + 5;

    nameEl.textContent = randomName;
    timeEl.textContent = `${randomMinutes} Minutes Ago ✔️ Verified`;

    notification.classList.add('show');

    setTimeout(() => {
        notification.classList.remove('show');
    }, 5000);
}

function startNotificationLoop() {
    function loop() {
        showLiveNotification();

        // random delay between 5s (5000 ms) and 10s (10000 ms)
        const randomDelay = Math.floor(Math.random() * 10000) + 10000;

        setTimeout(loop, randomDelay);
    }

    loop();
}

function scrollToPrice() {
    document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' });
}

window.addEventListener('scroll', () => {
    updateScrollProgress();
    handleNavbarScroll();
    handleStickyCtaVisibility();
});

document.addEventListener('DOMContentLoaded', () => {
    updateCountdown();
    setInterval(updateCountdown, 60000);

    setInterval(rotateUrgentMessage, 5000);

    const slider = document.getElementById('referral-slider');
    if (slider) {
        slider.addEventListener('input', updateReferralCalculator);
        updateReferralCalculator();
    }

    setTimeout(startNotificationLoop, 3000);
});

function handleStickyCtaVisibility() {
  const stickyCta = document.getElementById('sticky-cta');
  const windowHeight = window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight;
  const scrollTop = window.scrollY;
  
  // Show bar when user scrolls past 800px
  if (scrollTop > 800) {
    stickyCta.classList.add('visible');
  } else {
    stickyCta.classList.remove('visible');
  }
  
  // Hide bar when user reaches bottom (within 50px of bottom)
  if (scrollTop + windowHeight >= documentHeight - 50) {
    stickyCta.classList.remove('visible');
  }
}

// Keep the existing event listener
window.addEventListener('scroll', () => {
  updateScrollProgress();
  handleNavbarScroll();
  handleStickyCtaVisibility();
});

// Generate starfield that scrolls with page
function createStarfield() {
  // Find the main content container or body
  const mainContent = document.body;
  
  const starsContainer = document.createElement('div');
  starsContainer.className = 'stars';
  
  // Make it cover the entire page height
  starsContainer.style.height = document.documentElement.scrollHeight + 'px';
  
  mainContent.prepend(starsContainer);

  const starCount = 200; // More stars since it covers whole page
  
  for (let i = 0; i < starCount; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    
    // Random size
    const sizeClass = ['small', 'medium', 'large'][Math.floor(Math.random() * 3)];
    star.classList.add(sizeClass);
    
    // Random position across entire page
    star.style.left = Math.random() * 100 + '%';
    star.style.top = Math.random() * 100 + '%';
    
    // Random animation delay for natural twinkling
    star.style.animationDelay = Math.random() * 3 + 's';
    star.style.animationDuration = (Math.random() * 2 + 2) + 's';
    
    starsContainer.appendChild(star);
  }
}

// Call this when page loads
document.addEventListener('DOMContentLoaded', () => {
  createStarfield();
  
  // ... rest of your existing code
  updateCountdown();
  setInterval(updateCountdown, 60000);
  setInterval(rotateUrgentMessage, 5000);
  const slider = document.getElementById('referral-slider');
  if (slider) {
    slider.addEventListener('input', updateReferralCalculator);
    updateReferralCalculator();
  }
  setTimeout(startNotificationLoop, 3000);
});
// Referral tracking - preserves ref parameter
function getRefParameter() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('ref');
}

// Redirect with ref preservation + custom tab
function redirectToAuth(tab = 'signup') {
  const refId = getRefParameter();
  let url = 'auth.html';
  
  const params = new URLSearchParams();
  
  // Add tab parameter
  if (tab) {
    params.append('tab', tab);
  }
  
  // Add ref parameter if it exists
  if (refId) {
    params.append('ref', refId);
  }
  
  // Build final URL
  if (params.toString()) {
    url += '?' + params.toString();
  }
  
  window.location.href = url;
}

// Optional: Store ref in localStorage for persistence
function saveRefToStorage() {
  const refId = getRefParameter();
  if (refId) {
    localStorage.setItem('ocu_ref', refId);
  }
}

// Call this on page load to save ref
document.addEventListener('DOMContentLoaded', () => {
  saveRefToStorage(); // Saves ref for later use if needed
  
  createStarfield();
  updateCountdown();
  setInterval(updateCountdown, 60000);
  setInterval(rotateUrgentMessage, 5000);
  const slider = document.getElementById('referral-slider');
  if (slider) {
    slider.addEventListener('input', updateReferralCalculator);
    updateReferralCalculator();
  }
  setTimeout(startNotificationLoop, 3000);
});