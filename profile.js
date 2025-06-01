window.addEventListener("DOMContentLoaded", async () => {
    const res = await fetch('/check-session');
    if (!res.ok) return window.location.href = 'login.html';
  
    const { user } = await res.json();
    document.getElementById("nameDisplay").innerText = user.name;
    document.getElementById("emailDisplay").innerText = user.email;
    document.getElementById("nameInput").value = user.name;
    document.getElementById("emailInput").value = user.email;
  });
  
  function toggleEdit(field) {
    const span = document.getElementById(`${field}Display`);
    const input = document.getElementById(`${field}Input`);
    if (input.style.display === "none") {
      span.style.display = "none";
      input.style.display = "inline-block";
    } else {
      span.style.display = "inline-block";
      input.style.display = "none";
    }
  }
  
  document.getElementById("profileForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("nameInput").value;
    const password = document.getElementById("passwordInput").value;
  
    const res = await fetch("/update-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: 'include',
      body: JSON.stringify({ name, password })
    });
  
    const data = await res.json();
    document.getElementById("status").innerText = data.message || data.error;
  });
  