const mongoose = require('mongoose');

const validationStatus = 'FIRST_VALIDATION';
const isProduction = process.env.NODE_ENV === 'production';
const user = process.env.MONGO_USER;
const password = process.env.MONGO_PASSWORD;
const host = process.env.MONGO_HOST || 'mongodb:27017';
const database = process.env.MONGO_DB_NAME || 'uteq_prep_database';

const uri =
  !isProduction || !user || !password
    ? `mongodb://${host}/${database}?replicaSet=rs0`
    : `mongodb://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}/${database}?replicaSet=rs0&authSource=admin`;

async function run() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;

  const [projects, events, users] = await Promise.all([
    db.collection('projects').updateMany(
      { $or: [{ validationStatus: { $exists: false } }, { validationStatus: null }] },
      { $set: { validationStatus } },
    ),
    db.collection('events').updateMany(
      { $or: [{ validationStatus: { $exists: false } }, { validationStatus: null }] },
      { $set: { validationStatus } },
    ),
    db.collection('users').updateMany(
      {
        $or: [
          { canValidateProjets: { $exists: true } },
          { canValidateProjects: { $exists: true } },
          { canValidateElements: { $exists: true } },
          { canCloseProject: { $exists: true } },
          { canCloseElement: { $exists: true } },
        ],
      },
      [
        {
          $set: {
            canValidateElements: {
              $ifNull: [
                '$canValidateElements',
                { $ifNull: ['$canValidateProjects', '$canValidateProjets'] },
              ],
            },
            canCloseElements: {
              $ifNull: [
                '$canCloseElements',
                { $ifNull: ['$canCloseElement', '$canCloseProject'] },
              ],
            },
          },
        },
        {
          $unset: [
            'canValidateProjets',
            'canValidateProjects',
            'canCloseElement',
            'canCloseProject',
          ],
        },
      ],
    ),
  ]);

  console.log(
    JSON.stringify(
      {
        projectsUpdated: projects.modifiedCount,
        eventsUpdated: events.modifiedCount,
        usersUpdated: users.modifiedCount,
      },
      null,
      2,
    ),
  );
}

run()
  .catch((error) => {
    console.error('Validation status backfill failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
