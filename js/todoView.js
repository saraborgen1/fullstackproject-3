// js/todoView.js
import { FXMLHttpRequest } from "../fajax.js";

export function renderTodoApp(root, network) {

  const currentUser = localStorage.getItem("currentUser");

  if (!currentUser) {
    window.location.hash = "#/login";
    return;
  }

  root.innerHTML = `
    <div class="todo-page">
      <div class="todo-card">

        <div class="todo-header">
          <div>
            <h2 class="todo-title">My Reminders</h2>
            <p class="todo-sub">Hello, ${currentUser}</p>
          </div>
            <button id="logoutBtn" class="todo-btn ghost">Logout</button>
        </div>

        <div class="todo-layout">
          <div class="todo-categories">
            <button id="tabToday" class="cat cat-today">Today</button>
            <button id="tabScheduled" class="cat cat-scheduled">Scheduled</button>
            <button id="tabAll" class="cat cat-all active">All</button>
            <button id="tabDone" class="cat cat-done">Completed</button>
          </div>

          <div class="todo-content">
            <div class="todo-add">
              <input id="todoTitle" class="todo-input" placeholder="New task..." />
              <input id="todoDueDate" class="todo-input" type="date" />
              <button id="addBtn" class="todo-btn primary">Add</button>
            </div>
          
            <div class="todo-tools">
              <input id="searchInput" class="todo-input" placeholder="Search..." />
              <select id="filterSelect" class="todo-input">
                <option value="">All</option>
                <option value="true">Done</option>
                <option value="false">Not Done</option>
              </select>
              <button id="searchBtn" class="todo-btn">Search</button>
              <button id="refreshBtn" class="todo-btn">Refresh</button>
            </div>

            <div class="todo-actions">
              <button id="clearDoneBtn" class="todo-btn danger">Clear Completed</button>
            </div>

            <p id="errorBox" class="todo-msg"></p>
            <ul id="todoList" class="todo-list"></ul>
        </div>

      </div>
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

  dueDateInput.min = todayYYYYMMDD();

  function isFuture(dateStr) {
    const today = todayYYYYMMDD();
    return dateStr > today; 
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

  let msgTimer = null;

  function showMessage(msg, type = "error") {
    errorBox.textContent = msg || "";
    errorBox.className = type === "success" ? "todo-msg success" : "todo-msg error";

    if (msgTimer) clearTimeout(msgTimer);
    if (msg) {
      msgTimer = setTimeout(() => {
        errorBox.textContent = "";
        errorBox.className = "todo-msg";
      }, 1800);
    }
  }

  function sendRequest(method, url, body, onSuccess) {
    const xhr = new FXMLHttpRequest(network);
    xhr.open(method, url);

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (!xhr.response.ok) {
          showMessage(xhr.response?.error?.message || xhr.response?.error || "Server error", "error");
        } else {
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
      listEl.innerHTML = `<li class="todo-empty">No tasks yet</li>`;
      return;
    }

    todos.forEach(t => {
      const li = document.createElement("li");
      li.className = "todo-item" + (t.done ? " is-done" : "");

      const left = document.createElement("div");
      left.className = "todo-left";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = t.done;
      checkbox.className = "todo-check";

      const textWrap = document.createElement("div");
      textWrap.className = "todo-text";
      
      const title = document.createElement("div");
      title.className = "todo-item-title";
      title.textContent = t.title;

      const meta = document.createElement("div");
      meta.className = "todo-meta";

      const due = document.createElement("span");
      due.className = "todo-due";
      due.textContent = t.dueDate ? `Due: ${t.dueDate}` : "No due date";

      meta.appendChild(due);
      textWrap.appendChild(title);
      textWrap.appendChild(meta);

      left.appendChild(checkbox);
      left.appendChild(textWrap);

      const actions = document.createElement("div");
      actions.className = "todo-actions-row";

      const editBtn = document.createElement("button");
      editBtn.className = "todo-btn small";
      editBtn.textContent = "Edit";

      const delBtn = document.createElement("button");
      delBtn.className = "todo-btn small danger";
      delBtn.textContent = "Delete";

      actions.appendChild(editBtn);
      actions.appendChild(delBtn);

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

        let dueDate = null;
        const trimmed = newDueRaw.trim();

        if (trimmed) {
          const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

          // בדיקת פורמט
          if (!dateRegex.test(trimmed)) {
            showMessage("Due date must be in format YYYY-MM-DD", "error");
            return;
          }

          const today = todayYYYYMMDD();

          // בדיקה שהתאריך אינו בעבר (היום מותר)
          if (trimmed < today) {
            showMessage("Due date cannot be in the past", "error");
            return;
          }

          dueDate = trimmed;
        }

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

      li.appendChild(left);
      li.appendChild(actions);
      listEl.appendChild(li);
    });
  }

  // Add
  addBtn.onclick = () => {
    const title = titleInput.value.trim();
    const dueDate = dueDateInput.value;

    if (!title) {
      showMessage("Please enter a title", "error");
      return;
    }

    if (dueDate && dueDate < todayYYYYMMDD()) {
      showMessage("Due date cannot be in the past", "error");
      return;
    }


    sendRequest(
      "POST",
      "/todos",
      { owner: currentUser, title: title, dueDate: dueDate || null },
      () => {
        titleInput.value = "";
        dueDateInput.value = "";
        showMessage("Task added successfully", "success");
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

    sendRequest("GET", url, null, (todos) => {
      const filtered = applyCategoryFilter(todos);

      if (!filtered || filtered.length === 0) {
        showMessage("No results found", "error");
      } else {
        showMessage("", "success");
      }

      renderList(filtered);
    });
  };

  // Refresh
  refreshBtn.onclick = () => {
    searchInput.value = "";
    filterSelect.value = "";
    showMessage("", "success");
    loadTodos();
  };
  
  clearDoneBtn.onclick = () => { 
    sendRequest("GET", `/todos?owner=${encodeURIComponent(currentUser)}`, null, (todos) => {
        const doneTodos = (todos || []).filter(t => t.done === true);

        if (doneTodos.length === 0) {
        showMessage("No completed tasks to clear", "error");
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
