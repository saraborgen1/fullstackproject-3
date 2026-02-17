//js/registerView.js

import { FXMLHttpRequest } from "../fajax.js";

export function renderRegister(root, network) {

  root.innerHTML = `
    <div class="auth-container">
      <h2>Register</h2>

      <input id="reg-username" placeholder="Username" />
      <input id="reg-password" type="password" placeholder="Password" />
      <input id="reg-email" placeholder="Email" />
      <input id="reg-phone" placeholder="Phone" />

      <button id="reg-btn">Create Account</button>

      <p id="reg-error" class="error"></p>

      <p>
        Already have an account?
        <a href="#/login">Login</a>
      </p>
    </div>
  `;

  const usernameInput = document.getElementById("reg-username");
  const passwordInput = document.getElementById("reg-password");
  const emailInput = document.getElementById("reg-email");
  const phoneInput = document.getElementById("reg-phone");
  const regBtn = document.getElementById("reg-btn");
  const errorBox = document.getElementById("reg-error");

  regBtn.addEventListener("click", () => {
    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();

    if (!username || !password || !email || !phone) {
      errorBox.textContent = "Please fill all fields";
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
          errorBox.textContent = xhr.response.error.message;
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
