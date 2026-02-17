//js/app.js
import { Network } from "../network.js";
import { AuthServer } from "../servers/authServer.js";
import { renderLogin } from "./loginView.js";
import { renderRegister } from "./registerView.js";
//import { renderTodoApp } from "./todoView.js"; 

export function startRouter(root, network) {

  function render() {
    const hash = window.location.hash;

    if (hash === "#/register") {
      renderRegister(root, network);
      return;
    }

    //if (hash === "#/app") {
      //renderTodoApp(root, network);
      //return;
    //}

    renderLogin(root, network);
  }

  window.addEventListener("hashchange", render);
  render();
}

const root = document.getElementById("root");
const network = new Network();
network.registerServer("/auth", new AuthServer());
startRouter(root, network);