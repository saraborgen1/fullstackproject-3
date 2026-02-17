//servers/authServer.js

import { UsersDb } from "../db/usersDb.js";

export class AuthServer {
  constructor() {
    this.db = new UsersDb();
  }

  handle(method, url, body) {
    const username = body?.username?.trim();
    const password = body?.password;

    if (method === "POST" && url === "/auth/register") {
      const email = body?.email?.trim();
      const phone = body?.phone?.trim();

      if (!username || !password || !email || !phone) {
        return { ok: false, error: { code: "INVALID_INPUT", message: "Missing username, password, email or phone" } };
      }
  
      if (this.db.findByUsername(username)) {
        return { ok: false, error: { code: "USER_EXISTS", message: "User already exists" } };
      }

      this.db.addUser(username, password, email, phone);
      return { ok: true, data: { username } };
    }


    if (method === "POST" && url === "/auth/login") {
     
      if (!username || !password) {
        return { ok: false, error: { code: "INVALID_INPUT", message: "Missing username or password" } };
      }

      const user = this.db.findByUsername(username);

      if (!user) {
        return { ok: false, error: { code: "USER_NOT_FOUND", message: "User not found" } };
      }

      if (user.password !== password) {
        return { ok: false, error: { code: "WRONG_PASSWORD", message: "Wrong password" } };
      }

      return { ok: true, data: { username } };
    }

    return { ok: false, error: { code: "BAD_ROUTE", message: "Unknown route" } };
  }
}
