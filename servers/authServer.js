//servers/authServer.js

import { UsersDb } from "../DB/usersDb.js";

export class AuthServer {
  constructor() {
    this.db = new UsersDb();
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
    const parts = path.split("/").filter(Boolean); 

    if (parts[0] !== "auth") {
      return { status: 404, data: { error: "Not found" } };
    }

    const username = (body.username ?? "").toString().trim();
    const password = body.password;

    // POST /auth/register
    if (method === "POST" && parts.length === 2 && parts[1] === "register") {
      const email = (body.email ?? "").toString().trim();
      const phone = (body.phone ?? "").toString().trim();

      if (!username || !password || !email || !phone) {
        return { status: 400, data: { error: "Missing username, password, email or phone", code: "INVALID_INPUT" } };
      }

      if (this.db.findByUsername(username)) {
        return { status: 409, data: { error: "User already exists", code: "USER_EXISTS" } };
      }

      try {
        this.db.addUser(username, password, email, phone);
        return { status: 201, data: { username } };
      } catch (e) {
        return { status: 400, data: { error: e.message || "bad input" } };
      }
    }

    // POST /auth/login
    if (method === "POST" && parts.length === 2 && parts[1] === "login") {
      if (!username || !password) {
        return { status: 400, data: { error: "Missing username or password", code: "INVALID_INPUT" } };
      }

      const user = this.db.findByUsername(username);
      if (!user) {
        return { status: 404, data: { error: "User not found", code: "USER_NOT_FOUND" } };
      }

      if (user.password !== password) {
        return { status: 401, data: { error: "Wrong password", code: "WRONG_PASSWORD" } };
      }

      return { status: 200, data: { username } };
    }

    return { status: 404, data: { error: "Not found" } };
  }
}
