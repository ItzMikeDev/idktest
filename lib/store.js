let users = [];

export function addUser(username, password) {
  users.push({ username, password });
}

export function findUser(username) {
  return users.find(u => u.username === username);
}

export function getUsers() {
  return users.map(u => u.username);
}
