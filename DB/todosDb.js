//DB/todosDb.js

export class TodosDb {

  constructor() {
    this.storageKey = "db_todos";
  }

  isValidDb() {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) return true;

    let todos;
    try {
      todos = JSON.parse(raw);
    } catch (e) {
      return false;
    }

    if (!Array.isArray(todos)) return false;

    for (const t of todos) {
      if (
        !t ||
        !Number.isInteger(t.id) ||
        typeof t.owner !== "string" ||
        typeof t.title !== "string" ||
        typeof t.done !== "boolean" ||
        (t.dueDate !== undefined && t.dueDate !== null && typeof t.dueDate !== "string")
      ) {
        return false;
      }
    }
    return true;
  }

  getAll() {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) return [];

    try {
      const todos = JSON.parse(raw);
      return Array.isArray(todos) ? todos : [];
    } catch (e) {
      return [];
    }
  }

  saveAll(todos) {
    if (!Array.isArray(todos)) {
      throw new Error("todos must be an array");
    }
    localStorage.setItem(this.storageKey, JSON.stringify(todos));
  }

  getByOwner(owner) {
    owner = String(owner ?? "").trim();
    if (!owner) return [];

    const todos = this.getAll();
    return todos.filter(t => t.owner === owner);
  }

  getById(owner, id) {
    owner = String(owner ?? "").trim();

    if (!owner) return null;
    if (!Number.isInteger(id) || id <= 0) return null;

    const todos = this.getAll();
    return todos.find(t => t.owner === owner && t.id === id) || null;
  }

  add(owner, title, dueDate) {
    owner = String(owner ?? "").trim();
    title = String(title ?? "").trim();

    if (!owner) throw new Error("owner is required");
    if (!title) throw new Error("title is required");

    let due = null;
    if (dueDate !== undefined && dueDate !== null && String(dueDate).trim() !== "") {
      const s = String(dueDate).trim();
      if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) {
        throw new Error("dueDate must be YYYY-MM-DD");
      }
      due = s;
    }

    const todos = this.getAll();
    const nextId = todos.length === 0 ? 1 : Math.max(...todos.map(t => t.id)) + 1;
    const newTodo = {
      id: nextId,
      owner: owner,
      title: title,
      done: false,
      dueDate: due
    };
    todos.push(newTodo);
    this.saveAll(todos);
    return newTodo;
  }

  toggle(owner, id) {
    owner = String(owner ?? "").trim();

    if (!owner) return null;
    if (!Number.isInteger(id) || id <= 0) return null;

    const todos = this.getAll();
    const todo = todos.find(t => t.owner === owner && t.id === id);

    if (!todo) return null;

    todo.done = !todo.done;
    this.saveAll(todos);
    return todo;
  }

  updateTitle(owner, id, newTitle) {
    owner = String(owner ?? "").trim();
    newTitle = String(newTitle ?? "").trim();

    if (!owner) return null;
    if (!Number.isInteger(id) || id <= 0) return null;
    if (!newTitle) throw new Error("title is required");

    const todos = this.getAll();
    const todo = todos.find(t => t.owner === owner && t.id === id);

    if (!todo) return null;

    todo.title = newTitle;
    this.saveAll(todos);
    return todo;
  }

  update(owner, id, patch) {
    owner = String(owner ?? "").trim();

    if (!owner) return null;
    if (!Number.isInteger(id) || id <= 0) return null;

    const todos = this.getAll();
    const todo = todos.find(t => t.owner === owner && t.id === id);

    if (!todo) return null;
    if (patch && patch.title !== undefined) {
      const t = String(patch.title ?? "").trim();
      if (!t) throw new Error("title is required");
      todo.title = t;
    }

    if (patch && patch.done !== undefined) {
      if (typeof patch.done !== "boolean") {
        throw new Error("done must be boolean");
      }
      todo.done = patch.done;
    }

    if (patch && patch.dueDate !== undefined) {
      const d = patch.dueDate;
      if (d === null || d === "") {
        todo.dueDate = null;
      } else {
        const s = String(d).trim();
        if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) {
          throw new Error("dueDate must be YYYY-MM-DD");
        }
        todo.dueDate = s;
      }
    }

    this.saveAll(todos);
    return todo;
  }

  remove(owner, id) {
    owner = String(owner ?? "").trim();

    if (!owner) return false;
    if (!Number.isInteger(id) || id <= 0) return false;

    const todos = this.getAll();
    const before = todos.length;
    const afterTodos = todos.filter(t => !(t.owner === owner && t.id === id));
    this.saveAll(afterTodos);
    return afterTodos.length !== before;
  }

  clearByOwner(owner) {
    owner = String(owner ?? "").trim();

    if (!owner) return 0;

    const todos = this.getAll();
    const before = todos.length;
    const afterTodos = todos.filter(t => t.owner !== owner);
    this.saveAll(afterTodos);
    return before - afterTodos.length;
  }

  clearCompleted(owner) {
    owner = String(owner ?? "").trim();

    if (!owner) return 0;

    const todos = this.getAll();
    const before = todos.length;
    const afterTodos = todos.filter(t => !(t.owner === owner && t.done === true));
    this.saveAll(afterTodos);
    return before - afterTodos.length;
  }

  search(owner, query, done = undefined) {
    owner = String(owner ?? "").trim();

    if (!owner) return [];

    const q = String(query ?? "").trim().toLowerCase();
    let list = this.getByOwner(owner);

    if (q) {
      list = list.filter(t => t.title.toLowerCase().includes(q));
    }

    if (done !== undefined) {
      if (typeof done !== "boolean") {
        throw new Error("done filter must be boolean");
      }
      list = list.filter(t => t.done === done);
    }

    return list;
  }
}
