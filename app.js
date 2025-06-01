// --- Signup ---
const signupForm = document.getElementById('signupForm');
if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const confirmEmail = document.getElementById('confirmEmail').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (email !== confirmEmail) {
      alert("Emails do not match");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const res = await fetch('/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();
    alert(data.message || data.error);
    if (res.ok) window.location.href = 'login.html';
  });
}

// --- Login ---
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    const res = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    alert(data.message || data.error);
    if (res.ok) window.location.href = 'home.html';
  });
}

// --- Generate Q&A ---
async function generate() {
  const topic = document.getElementById('topicInput').value;
  const res = await fetch('/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ topic })
  });

  const data = await res.json();
  document.getElementById('output').innerText = data.content || data.error;
}

//profilebtn
const profileBtn = document.getElementById("profileBtn");
if (profileBtn) {
  profileBtn.addEventListener("click", () => {
    window.location.href = "profile.html";
  });
}

// Save Q&A
async function saveQA() {
  const topic = document.getElementById('topicInput').value;
  const content = document.getElementById('output').innerText;

  const res = await fetch('/save-qa', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ topic, content })
  });

  const data = await res.json();
  alert(data.message || data.error);
  loadSavedQA();
}

// Load saved Q&A
async function loadSavedQA() {
  const res = await fetch('/saved-qa', {
    method: 'GET',
    credentials: 'include'
  });

  const data = await res.json();
  const container = document.getElementById('savedContainer');
  container.innerHTML = '';

  data.forEach(item => {
    const box = document.createElement('div');
    box.style.margin = '20px 0';
    box.style.border = '1px dashed gold';
    box.style.padding = '10px';
    box.innerHTML = `
      <strong>${item.topic}</strong>
      <pre>${item.content}</pre>
      <button onclick="deleteQA('${item.topic}')">✖ Delete</button>
    `;
    container.appendChild(box);
  });
}

// Delete saved Q&A
async function deleteQA(topic) {
  const res = await fetch('/delete-qa', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ topic })
  });

  const data = await res.json();
  alert(data.message || data.error);
  loadSavedQA();
}

// Load saved Q&A on page load
window.onload = function () {
  loadSavedQA();
};

// --- Logout ---
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    await fetch('/logout', {
      method: 'POST',
      credentials: 'include'
    });
    window.location.href = 'login.html';
  });
}

// --- Check session on home.html ---
if (window.location.pathname.includes('home.html')) {
  fetch('/check-session', {
    method: 'GET',
    credentials: 'include'
  })
    .then(res => {
      if (!res.ok) {
        window.location.href = 'login.html';
      }
      return res.json();
    })
    .then(data => {
      if (data?.user?.name && document.getElementById('welcomeName')) {
        document.getElementById('welcomeName').innerText = `Welcome, ${data.user.name}`;
      }
    })
    .catch(() => {
      window.location.href = 'login.html';
    });
}