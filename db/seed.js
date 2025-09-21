import db from "#db/client";

await db.connect();
await seed();
await db.end();
console.log("🌱 Database seeded.");

async function seed() {
  await db.query("DELETE FROM files");
  await db.query("DELETE FROM folders");

  const folderNames = ["Documents", "Photos", "Music"];
  const folderIds = [];
  for (const name of folderNames) {
    const res = await db.query(
      "INSERT INTO folders (name) VALUES ($1) RETURNING id",
      [name]
    );
    folderIds.push(res.rows[0].id);
  }

  for (let i = 0; i < folderIds.length; i++) {
    for (let j = 1; j <= 5; j++) {
      await db.query(
        "INSERT INTO files (name, size, folder_id) VALUES ($1, $2, $3)",
        [`file${j}_in_${folderNames[i]}`, 1000 * j, folderIds[i]]
      );
    }
  }
}
