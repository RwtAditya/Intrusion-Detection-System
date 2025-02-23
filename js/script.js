// /js/script.js
let ws;

function initializeWebSocket() {
  ws = new WebSocket('ws://localhost:5000');

  ws.onopen = () => {
    console.log('Connected to server');
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'network_status') {
      updateNetworkStatus(data);
    }
  };

  ws.onclose = () => {
    console.log('Disconnected from server');
    setTimeout(initializeWebSocket, 5000); // Attempt to reconnect
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
}

function updateNetworkStatus(data) {
  const activeConnections = document.getElementById('active-connections');
  const bandwidthUsage = document.getElementById('bandwidth-usage');
  const threatsList = document.getElementById('threats-list');

  if (activeConnections) {
    activeConnections.textContent = data.connections;
  }
  if (bandwidthUsage) {
    bandwidthUsage.textContent = `${data.bandwidth} Mbps`;
  }
  if (threatsList && data.threats.length > 0) {
    data.threats.forEach(threat => {
      const threatElement = document.createElement('div');
      threatElement.className = 'threat-item';
      threatElement.innerHTML = `
        <h4>${threat.type}</h4>
        <p>Severity: ${threat.severity}/10</p>
        <p>Source: ${threat.source}</p>
        <p>Time: ${new Date(threat.timestamp).toLocaleTimeString()}</p>
      `;
      threatsList.insertBefore(threatElement, threatsList.firstChild);

      // Keep only the last 10 threats
      if (threatsList.children.length > 10) {
        threatsList.removeChild(threatsList.lastChild);
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Initialize WebSocket if on test-network page
  if (window.location.pathname.includes('test-network.html')) {
    initializeWebSocket();
  }

    // Navbar Toggle
    const hamburger = document.querySelector(".navbar-hamburger");
    const navLinks = document.querySelector(".navbar-links");
    if (hamburger) {
      hamburger.addEventListener("click", () => {
        hamburger.classList.toggle("open");
        navLinks.classList.toggle("active");
      });
      document.addEventListener("mousedown", (e) => {
        if (!navLinks.contains(e.target) && !hamburger.contains(e.target)) {
          hamburger.classList.remove("open");
          navLinks.classList.remove("active");
        }
      });
    }
  
    // Authentication State (Front-end only with localStorage)
    const isSignedIn = localStorage.getItem("isSignedIn") === "true";
    const updateAuthUI = () => {
      const buttonGroup = document.querySelector(".button-group");
      const logoutBtn = document.getElementById("logout-btn");
      const testNetworkBtn = document.getElementById("test-network-btn");
      const ctaButtons = document.querySelector(".cta-buttons");
      const featuresSection = document.getElementById("features-section");
      const systemInfo = document.getElementById("system-info");
  
      if (isSignedIn) {
        if (buttonGroup) buttonGroup.style.display = "none";
        if (logoutBtn) logoutBtn.style.display = "inline-block";
        if (testNetworkBtn) testNetworkBtn.style.display = "inline-block";
        if (ctaButtons) {
          ctaButtons.innerHTML = `
            <a href="/pages/test-network.html" class="cta-btn primary">Test Network</a>
          `;
        }
        if (featuresSection) featuresSection.style.display = "none";
        if (systemInfo) systemInfo.style.display = "block";
      } else {
        if (buttonGroup) buttonGroup.style.display = "flex";
        if (logoutBtn) logoutBtn.style.display = "none";
        if (testNetworkBtn) testNetworkBtn.style.display = "none";
        if (ctaButtons) {
          ctaButtons.innerHTML = `
            <a href="/pages/register.html" class="cta-btn primary">Get Started</a>
            <a href="/pages/about.html" class="cta-btn secondary">Learn More</a>
          `;
        }
        if (featuresSection) featuresSection.style.display = "flex";
        if (systemInfo) systemInfo.style.display = "none";
      }
    };
  
    // Initial UI update
    updateAuthUI();
  
    // Logout
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("isSignedIn");
        window.location.href = "/pages/index.html";
      });
    }
  
    // Login Form
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
      loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const errorDiv = document.getElementById("auth-error");
  
        if (!email || !password) {
          errorDiv.textContent = "Please fill in all fields";
          errorDiv.style.display = "block";
          return;
        }
  
        try {
          const response = await fetch('http://localhost:5000/api/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
          });
  
          const data = await response.json();
  
          if (!response.ok) {
            throw new Error(data.message || 'Login failed');
          }
  
          // Store token and update UI
          localStorage.setItem('token', data.token);
          localStorage.setItem('isSignedIn', 'true');
          window.location.href = "/pages/index.html";
        } catch (error) {
          errorDiv.textContent = error.message || 'Unable to connect to the server. Please try again later.';
          errorDiv.style.display = "block";
          console.error('Login error:', error);
        }
      });
    }
  
    // Register Form
    const registerForm = document.getElementById("register-form");
    if (registerForm) {
      registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const name = document.getElementById("name").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirm-password").value;
        const errorDiv = document.getElementById("auth-error");
  
        if (!name || !email || !password || !confirmPassword) {
          errorDiv.textContent = "Please fill in all fields";
          errorDiv.style.display = "block";
          return;
        }
  
        if (password !== confirmPassword) {
          errorDiv.textContent = "Passwords do not match";
          errorDiv.style.display = "block";
          return;
        }
  
        try {
          const response = await fetch('http://localhost:5000/api/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password })
          });
  
          const data = await response.json();
  
          if (!response.ok) {
            throw new Error(data.message || 'Registration failed');
          }
  
          window.location.href = "/pages/login.html";
        } catch (error) {
          errorDiv.textContent = error.message || 'Unable to connect to the server. Please try again later.';
          errorDiv.style.display = "block";
          console.error('Registration error:', error);
        }
      });
    }
// Function to populate test network form with default values
function populateTestNetworkForm() {
  const defaultValues = {
    duration: "0",
    protocol_type: "9",
    flag: "9",
    src_bytes: "0",
    dst_bytes: "0",
    land: "0",
    wrong_fragment: "0",
    urgent: "0",
    hot: "0",
    num_failed_logins: "0",
    logged_in: "0",
    num_compromised: "0",
    dst_host_same_src_port_rate: "9",
    dst_host_srv_diff_host_rate: "9"
  };

  // Set default values for each input field
  Object.keys(defaultValues).forEach(fieldId => {
    const inputElement = document.getElementById(fieldId);
    if (inputElement) {
      inputElement.value = defaultValues[fieldId];
    }
  });
}

// Add event listener for when the test network page loads
document.addEventListener('DOMContentLoaded', function() {
  const testNetworkForm = document.getElementById('test-network-form');
  if (testNetworkForm) {
    populateTestNetworkForm();
  }
});
});
