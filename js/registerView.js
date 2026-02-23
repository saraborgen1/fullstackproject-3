//js/registerView.js

import { FXMLHttpRequest } from "../fajax.js";

export function renderRegister(root, network) {

  root.innerHTML = `
    <div class="auth-container">
      <div class="auth-card">
        <h2 class="auth-title">My Reminders</h2>
        <p class="auth-subtitle">Register to continue</p>

        <div class="auth-form">
          <input class="auth-field" id="reg-username" placeholder="Username" />
          <input class="auth-field" id="reg-password" type="password" placeholder="Password" />
          <input class="auth-field" id="reg-email" placeholder="Email" />
          <input class="auth-field" id="reg-phone" placeholder="Phone" />

          <button class="auth-btn" id="reg-btn">Create Account</button>

          <p id="reg-error" class="error"></p>

          <p class="auth-footer">
            Already have an account?
            <a href="#/login">Login</a>
          </p>
        </div>
      </div>
    </div>
  `;

  const usernameInput = document.getElementById("reg-username");
  const passwordInput = document.getElementById("reg-password");
  const emailInput = document.getElementById("reg-email");
  const phoneInput = document.getElementById("reg-phone");
  const regBtn = document.getElementById("reg-btn");
  const errorBox = document.getElementById("reg-error");

  function validateRegisterInputs() {
    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();
    const isInvalid = !username || !password || !email || !phone;
    regBtn.disabled = isInvalid;
  }
  usernameInput.addEventListener("input", validateRegisterInputs);
  passwordInput.addEventListener("input", validateRegisterInputs);
  emailInput.addEventListener("input", validateRegisterInputs);
  phoneInput.addEventListener("input", validateRegisterInputs);
  validateRegisterInputs();

  regBtn.addEventListener("click", () => {
    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();

    if (!username || !password || !email || !phone) {
      errorBox.textContent = "Please fill all fields";
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errorBox.textContent = "Invalid email format";
      return;
    }

    const phoneRegex = /^\d{9,10}$/;
    if (!phoneRegex.test(phone)) {
      errorBox.textContent = "Phone must contain 9-10 digits";
      return;
    }

    if (password.length < 6) {
      errorBox.textContent = "Password must be at least 6 characters";
      return;
    }

    errorBox.textContent = "";
    regBtn.disabled = true;
    const xhr = new FXMLHttpRequest(network);
    xhr.open("POST", "/auth/register");

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        regBtn.disabled = false;

        if (xhr.response.ok) {
          window.location.hash = "#/login";
        } else {
          errorBox.textContent = xhr.response?.error?.message || xhr.response?.error || "Registration failed";        
        }
      }
    };

    xhr.send({
      username: username,
      password: password,
      email: email,
      phone: phone
    });
  });
}
