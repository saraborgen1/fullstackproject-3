// js/servers/todosServer.js
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

   
    let id = null;
    if (parts.length >= 2) {
      const maybeId = Number(parts[1]);
      if (Number.isInteger(maybeId) && maybeId > 0) id = maybeId;
    }

    if (method === "GET" && parts.length === 1 && query.owner) {
      return { status: 200, data: this.db.getByOwner(query.owner) };
    } 
    
    if (method === "GET" && parts.length === 1) {
      return { status: 200, data: this.db.getAll() };
    }

    if (method === "GET" && parts.length === 2) {
      if (!query.owner) return { status: 400, data: { error: "owner is required" } };
      if (id === null) return { status: 400, data: { error: "invalid id" } };

      const todo = this.db.getById(query.owner, id);
      if (!todo) return { status: 404, data: { error: "todo not found" } };
      return { status: 200, data: todo };
    }

   
    if (method === "GET" && parts.length === 2 && parts[1] === "search") {
      if (!query.owner) return { status: 400, data: { error: "owner is required" } };

      let done = undefined;
      if (query.done !== undefined) {
        if (query.done === "true") done = true;
        else if (query.done === "false") done = false;
        else return { status: 400, data: { error: "done must be true/false" } };
      }

      const q = query.q || "";
      const result = this.db.search(query.owner, q, done);
      return { status: 200, data: result };
    }

 
    if (method === "POST" && parts.length === 1) {
      try {
        const created = this.db.add(body.owner, body.title);
        return { status: 201, data: created };
      } catch (e) {
        return { status: 400, data: { error: e.message || "bad input" } };
      }
    }

 
    if (method === "PUT" && parts.length === 3 && parts[2] === "toggle") {
      if (id === null) return { status: 400, data: { error: "invalid id" } };
      if (!body.owner) return { status: 400, data: { error: "owner is required" } };

      const updated = this.db.toggle(body.owner, id);
      if (!updated) return { status: 404, data: { error: "todo not found" } };
      return { status: 200, data: updated };
    }

 
    if (method === "PUT" && parts.length === 2) {
      if (id === null) return { status: 400, data: { error: "invalid id" } };
      if (!body.owner) return { status: 400, data: { error: "owner is required" } };

      try {
        const updated = this.db.update(body.owner, id, { title: body.title, done: body.done });
        if (!updated) return { status: 404, data: { error: "todo not found" } };
        return { status: 200, data: updated };
      } catch (e) {
        return { status: 400, data: { error: e.message || "bad input" } };
      }
    }

  
    if (method === "DELETE" && parts.length === 2) {
      if (id === null) return { status: 400, data: { error: "invalid id" } };
      if (!body.owner) return { status: 400, data: { error: "owner is required" } };

      const ok = this.db.remove(body.owner, id);
      if (!ok) return { status: 404, data: { error: "todo not found" } };
      return { status: 200, data: { deleted: true } };
    }

    return { status: 404, data: { error: "Not found" } };
  }
}
