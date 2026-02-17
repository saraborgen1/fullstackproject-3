// js/loginView.js

import { FXMLHttpRequest } from "../fajax.js";


export function renderLogin(root, network) {

  root.innerHTML = `
    <div class="auth-container">
      <h2>Login</h2>

      <input id="login-username" placeholder="Username" />
      <input id="login-password" type="password" placeholder="Password" />

      <button id="login-btn">Login</button>

      <p id="login-error" class="error"></p>

      <p>
        Don't have an account?
        <a href="#/register">Register</a>
      </p>
    </div>
  `;

  const usernameInput = document.getElementById("login-username");
  const passwordInput = document.getElementById("login-password");
  const loginBtn = document.getElementById("login-btn");
  const errorBox = document.getElementById("login-error");

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
          errorBox.textContent = xhr.response.error.message;
        }
      }
    };

    xhr.send({
      username: username,
      password: password
    });
  });
}
