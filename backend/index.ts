import { Database } from "bun:sqlite";
const DB_PATH = "db/personal_budget.db";
const db = new Database("db/personal_budget.db", {create:true});

// Ensure table exists
db.run(`
  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    description TEXT NOT NULL,
    amount REAL NOT NULL,
    category TEXT NOT NULL,
    date TEXT NOT NULL
  )
`);