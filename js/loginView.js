// js/loginView.js
import { FXMLHttpRequest } from "../fajax.js";

export function renderLogin(root, network) {

  root.innerHTML = `
    <div class="auth-container">
      <div class="auth-card">

        <h2 class="auth-title">My Reminders</h2>
        <p class="auth-subtitle">Login to continue</p>

        <div class="auth-form">
          <input class="auth-field" id="login-username" placeholder="Username" />
          <input class="auth-field" id="login-password" type="password" placeholder="Password" />

          <button class="auth-btn" id="login-btn">Login</button>

          <p id="login-error" class="error"></p>

          <p class="auth-footer">
            Don't have an account?
            <a href="#/register">Register</a>
          </p>

        </div>
      </div>
    </div>
  `;

  const usernameInput = document.getElementById("login-username");
  const passwordInput = document.getElementById("login-password");
  const loginBtn = document.getElementById("login-btn");
  const errorBox = document.getElementById("login-error");

  function validateInputs() {
    const isInvalid = !usernameInput.value.trim() || !passwordInput.value.trim();
    loginBtn.disabled = isInvalid;
  }
  usernameInput.addEventListener("input", validateInputs);
  passwordInput.addEventListener("input", validateInputs);
  validateInputs();

  usernameInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      loginBtn.click();
    }
  });

  passwordInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      loginBtn.click();
    }
  });

  loginBtn.addEventListener("click", () => {
    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    if (!username || !password) {
      errorBox.textContent = "Please fill all fields";
      return;
    }

    errorBox.textContent = "";
    loginBtn.disabled = true;
    const xhr = new FXMLHttpRequest(network);
    xhr.open("POST", "/auth/login");

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        loginBtn.disabled = false;

        if (xhr.response.ok) {
          localStorage.setItem("currentUser", username);
          window.location.hash = "#/app";

        } else {
        errorBox.textContent =xhr.response?.error?.message || xhr.response?.error || "Login failed";        
        }
      }
    };

    xhr.send({
      username: username,
      password: password
    });
  });
}
