//servers/todosServer.js
import { TodosDb } from "../DB/todosDb.js";

export class TodosServer {
  constructor() {
    this.db = new TodosDb();
  }

  handle(request) {
   
    if (!request || typeof request !== "object") {
      return { status: 400, data: { error: "Bad request" } };
    }

    const method = String(request.method || "").toUpperCase();
    const url = String(request.url || "");
    const body = request.body || {};
    const headers = request.headers || {};
    const authUser = (headers["x-user"] ?? headers["X-User"] ?? "").toString().trim();

    if (!authUser) return { status: 401, data: { error: "Unauthorized" } };

    if (!method || !url.startsWith("/")) {
      return { status: 400, data: { error: "Bad request" } };
    }

    const [path, queryString = ""] = url.split("?");
    const parts = path.split("/").filter(Boolean); // e.g. "/todos/5/toggle" -> ["todos","5","toggle"]
   
    if (parts[0] !== "todos") {
      return { status: 404, data: { error: "Not found" } };
    }

    const query = {};
    if (queryString) {
      const pairs = queryString.split("&");
      for (const p of pairs) {
        if (!p) continue;
        const [k, v = ""] = p.split("=");
        const key = decodeURIComponent(k || "").trim();
        const val = decodeURIComponent(v || "").trim();
        if (key) query[key] = val;
      }
    }

    if (method === "GET" && parts.length === 1) {
      return { status: 200, data: this.db.getByOwner(authUser) };
    } 

    if (method === "GET" && parts.length === 2 && parts[1] === "search") {
      let done = undefined;
      if (query.done !== undefined) {
        if (query.done === "true") done = true;
        else if (query.done === "false") done = false;
        else return { status: 400, data: { error: "done must be true/false" } };
      }

      const q = query.q || "";
      const result = this.db.search(authUser, q, done);
      return { status: 200, data: result };
    }

    let id = null;
    if (parts.length >= 2) {
      const maybeId = Number(parts[1]);
      if (Number.isInteger(maybeId) && maybeId > 0) id = maybeId;
    }

    if (method === "GET" && parts.length === 2) {
      if (id === null) return { status: 400, data: { error: "invalid id" } };

      const todo = this.db.getById(authUser, id);

      if (!todo) return { status: 404, data: { error: "todo not found" } };
      return { status: 200, data: todo };
    }

    if (method === "POST" && parts.length === 1) {
      try {
        const created = this.db.add(authUser, body.title, body.dueDate);

        return { status: 201, data: created };
      } catch (e) {
        return { status: 400, data: { error: e.message || "bad input" } };
      }
    }

    if (method === "PUT" && parts.length === 3 && parts[2] === "toggle") {
      if (id === null) return { status: 400, data: { error: "invalid id" } };

      const updated = this.db.toggle(authUser, id);
      if (!updated) return { status: 404, data: { error: "todo not found" } };
      return { status: 200, data: updated };
    }

    if (method === "PUT" && parts.length === 2) {
      if (id === null) return { status: 400, data: { error: "invalid id" } };

      try {
        const updated = this.db.update(authUser, id, { title: body.title, done: body.done, dueDate: body.dueDate });
        if (!updated) return { status: 404, data: { error: "todo not found" } };
        return { status: 200, data: updated };
      } catch (e) {
        return { status: 400, data: { error: e.message || "bad input" } };
      }
    }

    if (method === "DELETE" && parts.length === 2) {
      if (id === null) return { status: 400, data: { error: "invalid id" } };

      const ok = this.db.remove(authUser, id);
      if (!ok) return { status: 404, data: { error: "todo not found" } };
      return { status: 200, data: { deleted: true } };
    }

    return { status: 404, data: { error: "Not found" } };
  }
}
