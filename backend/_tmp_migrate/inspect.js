const { MongoClient } = require("mongodb");

const OLD_URI = process.env.OLD_URI;

async function main() {
  const client = new MongoClient(OLD_URI, { serverSelectionTimeoutMS: 8000 });
  await client.connect();
  const admin = client.db().admin();
  const { databases } = await admin.listDatabases();
  console.log("Databases on OLD cluster:");
  for (const d of databases) {
    console.log(` - ${d.name} (${(d.sizeOnDisk / 1024).toFixed(1)} KB)`);
  }

  const testDb = client.db("test");
  const cols = await testDb.listCollections().toArray();
  console.log("\nCollections in 'test' db:");
  for (const c of cols) {
    const count = await testDb.collection(c.name).countDocuments();
    console.log(` - ${c.name}: ${count} docs`);
  }

  await client.close();
}

main().catch((err) => {
  console.error("ERROR:", err.message);
  process.exit(1);
});
