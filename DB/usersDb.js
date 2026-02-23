//DB/usersDb.js

export class UsersDb {

  constructor() {
    this.storageKey = "db_users";
  }

  getAll() {
    const raw = localStorage.getItem(this.storageKey);

    if (!raw) {
      return [];
    }
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      localStorage.removeItem(this.storageKey);
      return [];
    }
  }

  saveAll(users) {
    const newusers = Array.isArray(users) ? users : [];
    localStorage.setItem(this.storageKey, JSON.stringify(newusers));
  }

  findByUsername(username) {
    const u = String(username ?? "").trim();
    if (!u) return null;
    const users = this.getAll();
    return users.find(user => user.username === u) || null;
  }

 addUser(username, password, email, phone) {
    const u = String(username ?? "").trim();
    if (this.findByUsername(u)) {
      throw new Error("User already exists");
    }

    const users = this.getAll();
    const newUser = {
      username: u,
      password: password,
      email: String(email ?? "").trim(),
      phone: String(phone ?? "").trim()
    };
    
    users.push(newUser);
    this.saveAll(users);
    return newUser;
  }
}
