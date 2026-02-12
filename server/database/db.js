const Database = require("better-sqlite3")
const db = new Database("olympia.db")

db.prepare(`
  CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    score INTEGER
  )
`).run()

module.exports = {
  saveScore(name, score) {
    db.prepare(`
      INSERT INTO scores (name, score)
      VALUES (?, ?)
    `).run(name, score)
  }
}
