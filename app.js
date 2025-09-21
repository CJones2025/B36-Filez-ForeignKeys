import express from "express";
import db from "#db/client";
const app = express();

app.use(express.json());

app.get("/files", async (req, res, next) => {
  try {
    const sql = `SELECT files.*, folders.name AS folder_name FROM files JOIN folders ON files.folder_id = folders.id`;
    const { rows } = await db.query(sql);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

app.get("/folders", async (req, res, next) => {
  try {
    const { rows } = await db.query("SELECT * FROM folders");
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

app.get("/folders/:id", async (req, res, next) => {
  try {
    const folderId = Number(req.params.id);
    const { rows: folders } = await db.query(
      "SELECT * FROM folders WHERE id = $1",
      [folderId]
    );
    if (folders.length === 0) return res.status(404).send("Folder not found");
    const folder = folders[0];
    const filesSql = `SELECT * FROM files WHERE folder_id = $1`;
    const { rows: files } = await db.query(filesSql, [folderId]);
    res.json({ ...folder, files });
  } catch (err) {
    next(err);
  }
});

app.post("/folders/:id/files", async (req, res, next) => {
  try {
    const folderId = Number(req.params.id);
    const { rows: folders } = await db.query(
      "SELECT * FROM folders WHERE id = $1",
      [folderId]
    );
    if (folders.length === 0) return res.status(404).send("Folder not found");
    if (!req.body) return res.status(400).send("Request body required");
    const { name, size } = req.body;
    if (!name || !size) return res.status(400).send("Missing required fields");
    const sql = `INSERT INTO files (name, size, folder_id) VALUES ($1, $2, $3) RETURNING *`;
    const { rows } = await db.query(sql, [name, size, folderId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message });
});

export default app;
