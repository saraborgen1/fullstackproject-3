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
    return JSON.parse(raw);
  }

  saveAll(users) {
    localStorage.setItem(this.storageKey, JSON.stringify(users));
  }

  findByUsername(username) {
    const users = this.getAll();
    return users.find(user => user.username === username) || null;
  }

 addUser(username, password, email, phone) {
    const users = this.getAll();
    const newUser = {
      username: username,
      password: password,
      email: email,
      phone: phone
    };
    users.push(newUser);
    this.saveAll(users);
    return newUser;
  }
}
