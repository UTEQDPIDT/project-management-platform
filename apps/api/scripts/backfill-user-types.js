const mongoose = require('mongoose');

async function backfillUserTypes(users, apply) {
  const eligible = { type: { $ne: 'Administrativo' } };
  const teacher = {
    ...eligible,
    email: /^\s*[a-z]/i,
    type: { $nin: ['Administrativo', 'Maestro'] },
  };
  const student = {
    ...eligible,
    email: /^\s*[0-9]/,
    type: { $nin: ['Administrativo', 'Estudiante'] },
  };
  const unclassified = {
    ...eligible,
    $nor: [{ email: /^\s*[a-z0-9]/i }],
  };
  const [teachers, students, skipped] = await Promise.all([
    users.countDocuments(teacher),
    users.countDocuments(student),
    users.countDocuments(unclassified),
  ]);
  if (!apply)
    return { dryRun: true, teachers, students, unclassified: skipped };

  const teacherResult = await users.updateMany(teacher, {
    $set: { type: 'Maestro' },
  });
  const studentResult = await users.updateMany(student, {
    $set: { type: 'Estudiante' },
  });
  return {
    dryRun: false,
    teachersUpdated: teacherResult.modifiedCount,
    studentsUpdated: studentResult.modifiedCount,
    unclassified: skipped,
  };
}

async function run() {
  const args = process.argv.slice(2);
  if (args.some((arg) => arg !== '--apply')) {
    throw new Error('Usage: pnpm --filter api migrate:user-types [--apply]');
  }
  const isProduction = process.env.NODE_ENV === 'production';
  const user = process.env.MONGO_USER;
  const password = process.env.MONGO_PASSWORD;
  const host = process.env.MONGO_HOST || 'mongodb:27017';
  const database = process.env.MONGO_DB_NAME || 'uteq_prep_database';
  const uri =
    !isProduction || !user || !password
      ? `mongodb://${host}/${database}?replicaSet=rs0`
      : `mongodb://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}/${database}?replicaSet=rs0&authSource=admin`;

  await mongoose.connect(uri);
  console.log(
    JSON.stringify(
      await backfillUserTypes(
        mongoose.connection.db.collection('users'),
        args.includes('--apply'),
      ),
      null,
      2,
    ),
  );
}

if (require.main === module) {
  run()
    .catch((error) => {
      console.error('User type backfill failed:', error);
      process.exitCode = 1;
    })
    .finally(async () => {
      await mongoose.disconnect();
    });
}

module.exports = { backfillUserTypes };
