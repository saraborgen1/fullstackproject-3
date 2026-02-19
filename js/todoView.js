// js/todoView.js
import { FXMLHttpRequest } from "../fajax.js";

export function renderTodoApp(root, network) {

  const currentUser = localStorage.getItem("currentUser");

  if (!currentUser) {
    window.location.hash = "#/login";
    return;
  }

  root.innerHTML = `
    <div class="todo-container">
      <h2>Todo App</h2>

      <div>
        <span>Hello, ${currentUser}</span>
        <button id="logoutBtn">Logout</button>
      </div>

      <hr/>

      <div>
        <input id="todoTitle" placeholder="New task..." />
        <input id="todoDueDate" type="date" />
        <button id="addBtn">Add</button>
      </div>

      <hr/>

      <div>
        <input id="searchInput" placeholder="Search..." />
        <select id="filterSelect">
          <option value="">All</option>
          <option value="true">Done</option>
          <option value="false">Not Done</option>
        </select>
        <button id="searchBtn">Search</button>
        <button id="refreshBtn">Refresh</button>
      </div>

      <hr/>

      <div>
        <button id="clearDoneBtn">Clear Completed</button>
      </div>

      <p id="errorBox" style="color:red;"></p>
      <ul id="todoList"></ul>
     <div style="margin: 8px 0;">
        <button id="tabToday">Today</button>
        <button id="tabScheduled">Scheduled</button>
        <button id="tabAll" class="active">All</button>
        <button id="tabDone">Completed</button>
     </div>

    </div>
  `;

  const logoutBtn = document.getElementById("logoutBtn");
  const addBtn = document.getElementById("addBtn");
  const titleInput = document.getElementById("todoTitle");
  const listEl = document.getElementById("todoList");
  const errorBox = document.getElementById("errorBox");
  const searchBtn = document.getElementById("searchBtn");
  const searchInput = document.getElementById("searchInput");
  const filterSelect = document.getElementById("filterSelect");
  const clearDoneBtn = document.getElementById("clearDoneBtn");
  const refreshBtn = document.getElementById("refreshBtn");
  const dueDateInput = document.getElementById("todoDueDate");
  const tabToday = document.getElementById("tabToday");
  const tabScheduled = document.getElementById("tabScheduled");
  const tabAll = document.getElementById("tabAll");
  const tabDone = document.getElementById("tabDone");

  let currentCategory = "all"; 

  function todayYYYYMMDD() {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  function isFuture(dateStr) {
    // dateStr is YYYY-MM-DD
    const today = todayYYYYMMDD();
    return dateStr > today; // lexicographic works for YYYY-MM-DD
  }

  function applyCategoryFilter(todos) {
    const list = Array.isArray(todos) ? todos : [];
    const today = todayYYYYMMDD();

    switch (currentCategory) {
      case "today":
        return list.filter(t => !t.done && t.dueDate === today);

      case "scheduled":
        return list.filter(t => !t.done && t.dueDate && isFuture(t.dueDate));

      case "done":
        return list.filter(t => t.done === true);

      case "all":
        default:
        return list;
    }
  }

  function setActiveTab() {
    [tabToday, tabScheduled, tabAll, tabDone].forEach(b => b.classList.remove("active"));
    if (currentCategory === "today") tabToday.classList.add("active");
    else if (currentCategory === "scheduled") tabScheduled.classList.add("active");
    else if (currentCategory === "done") tabDone.classList.add("active");
    else tabAll.classList.add("active");
  }

  logoutBtn.onclick = () => {
    localStorage.removeItem("currentUser");
    window.location.hash = "#/login";
  };

  function showError(msg) {
    errorBox.textContent = msg || "";
  }

  function sendRequest(method, url, body, onSuccess) {
    const xhr = new FXMLHttpRequest(network);
    xhr.open(method, url);

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (!xhr.response.ok) {
          showError(xhr.response.error?.message || "Server error");
        } else {
          showError("");
          if (onSuccess) onSuccess(xhr.response.data);
        }
      }
    };

    xhr.send(body);
  }

  function loadTodos() {
   sendRequest(
        "GET",
        `/todos?owner=${encodeURIComponent(currentUser)}`,
        null,
        (todos) => renderList(applyCategoryFilter(todos))
        );

  }

  function renderList(todos) {
    listEl.innerHTML = "";

    if (!todos || todos.length === 0) {
      listEl.innerHTML = "<li>No tasks yet</li>";
      return;
    }

    todos.forEach(t => {
      const li = document.createElement("li");

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = t.done;

      const span = document.createElement("span");
      span.textContent = t.title;
      if (t.done) span.style.textDecoration = "line-through";
      
      const due = document.createElement("small");
        if (t.dueDate) {
           due.textContent = ` (Due: ${t.dueDate})`;
        }

      const editBtn = document.createElement("button");
      editBtn.textContent = "Edit";

      const delBtn = document.createElement("button");
      delBtn.textContent = "Delete";

      // Toggle
      checkbox.onchange = () => {
        sendRequest(
          "PUT",
          `/todos/${t.id}/toggle`,
          { owner: currentUser },
          loadTodos
        );
      };

      // Edit
      editBtn.onclick = () => {
        const newTitleRaw = prompt("Edit title:", t.title);
        if (newTitleRaw === null) return;
        const newTitle = newTitleRaw.trim();
        if (!newTitle) return;
        const newDueRaw = prompt("Edit due date (YYYY-MM-DD) or empty to clear:", t.dueDate || "");
        if (newDueRaw === null) return;
        const dueDate = newDueRaw.trim() ? newDueRaw.trim() : null;

        sendRequest(
            "PUT",
            `/todos/${t.id}`,
            {
            owner: currentUser,
            title: newTitle,
            done: t.done,
            dueDate
            },
            loadTodos
        );
      };

      // Delete
      delBtn.onclick = () => {
        sendRequest(
          "DELETE",
          `/todos/${t.id}`,
          { owner: currentUser },
          loadTodos
        );
      };

      li.appendChild(checkbox);
      li.appendChild(span);
      li.appendChild(due);
      li.appendChild(editBtn);
      li.appendChild(delBtn);
      listEl.appendChild(li);
    });
  }

  // Add
  addBtn.onclick = () => {
    const title = titleInput.value.trim();
    const dueDate = dueDateInput.value; 
    if (!title) {
      showError("Please enter a title");
      return;
    }

    sendRequest(
      "POST",
      "/todos",
      { owner: currentUser, title: title, dueDate: dueDate || null },
      () => {
        titleInput.value = "";
        dueDateInput.value = "";
        loadTodos();
      }
    );
  };

  // Search
  searchBtn.onclick = () => {
    const q = searchInput.value.trim();
    const done = filterSelect.value;

    let url = `/todos/search?owner=${encodeURIComponent(currentUser)}`;

    if (q) url += `&q=${encodeURIComponent(q)}`;
    if (done !== "") url += `&done=${done}`;

    sendRequest("GET", url, null, renderList);
  };

  // Refresh
  refreshBtn.onclick = loadTodos;

  clearDoneBtn.onclick = () => { 
    sendRequest("GET", `/todos?owner=${encodeURIComponent(currentUser)}`, null, (todos) => {
        const doneTodos = (todos || []).filter(t => t.done === true);

        if (doneTodos.length === 0) {
        showError("No completed tasks to clear");
        return;
        }

        let i = 0;
        const deleteNext = () => {
        if (i >= doneTodos.length) {
            loadTodos();
            return;
        }

        const id = doneTodos[i].id;
        i++;

        sendRequest("DELETE", `/todos/${id}`, { owner: currentUser }, deleteNext);
        };
        deleteNext();
    });
  };
  
  tabToday.onclick = () => {
    currentCategory = "today";
    setActiveTab();
    loadTodos();
  };

  tabScheduled.onclick = () => {
    currentCategory = "scheduled";
    setActiveTab();
    loadTodos();
  };

  tabAll.onclick = () => {
    currentCategory = "all";
    setActiveTab();
    loadTodos();
  };

  tabDone.onclick = () => {
    currentCategory = "done";
    setActiveTab();
    loadTodos();
  };

  setActiveTab();
  loadTodos();
}
