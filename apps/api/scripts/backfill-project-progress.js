const mongoose = require('mongoose');

const isProduction = process.env.NODE_ENV === 'production';
const user = process.env.MONGO_USER;
const password = process.env.MONGO_PASSWORD;
const host = process.env.MONGO_HOST || 'mongodb:27017';
const database = process.env.MONGO_DB_NAME || 'uteq_prep_database';
const uri = !isProduction || !user || !password
  ? `mongodb://${host}/${database}?replicaSet=rs0`
  : `mongodb://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}/${database}?replicaSet=rs0&authSource=admin`;

async function run() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  const counts = new Map();
  const results = db.collection('activities').aggregate([
    { $match: { entityType: 'project' } },
    { $group: {
      _id: '$entityId',
      total: { $sum: 1 },
      completed: { $sum: { $cond: [{ $eq: ['$status', 'Completado'] }, 1, 0] } },
    } },
  ]);
  for await (const result of results) {
    if (result._id) counts.set(result._id.toString(), Math.round(result.completed / result.total * 100));
  }
  let batch = [];
  let updated = 0;
  for await (const project of db.collection('projects').find({}, { projection: { _id: 1 } })) {
    batch.push({ updateOne: {
      filter: { _id: project._id },
      update: { $set: { completionPercentage: counts.get(project._id.toString()) || 0 } },
    } });
    if (batch.length === 500) {
      updated += (await db.collection('projects').bulkWrite(batch)).modifiedCount;
      batch = [];
    }
  }
  if (batch.length) updated += (await db.collection('projects').bulkWrite(batch)).modifiedCount;
  console.log(`Project progress backfill complete: ${updated} projects updated.`);
}

run().catch((error) => {
  console.error('Project progress backfill failed:', error);
  process.exitCode = 1;
}).finally(() => mongoose.disconnect());
