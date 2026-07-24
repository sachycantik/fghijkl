const mongoose = require("mongoose");
const connectDB = require("../lib/mongodb");
const Email = require("../lib/models/Email");
const Inbox = require("../lib/models/Inbox");

const APPLY = process.argv.includes("--apply");
const BATCH_SIZE = 500;

async function countOrphanEmails() {
  const result = await Email.aggregate([
    {
      $lookup: {
        from: Inbox.collection.name,
        localField: "inboxId",
        foreignField: "_id",
        as: "inbox"
      }
    },
    { $match: { "inbox.0": { $exists: false } } },
    { $count: "total" }
  ]);

  return result[0]?.total || 0;
}

async function deleteOrphanEmails() {
  const cursor = Email.aggregate([
    {
      $lookup: {
        from: Inbox.collection.name,
        localField: "inboxId",
        foreignField: "_id",
        as: "inbox"
      }
    },
    { $match: { "inbox.0": { $exists: false } } },
    { $project: { _id: 1 } }
  ]).cursor({ batchSize: BATCH_SIZE });

  let ids = [];
  let deleted = 0;

  for await (const email of cursor) {
    ids.push(email._id);
    if (ids.length >= BATCH_SIZE) {
      const result = await Email.deleteMany({ _id: { $in: ids } });
      deleted += result.deletedCount;
      ids = [];
    }
  }

  if (ids.length) {
    const result = await Email.deleteMany({ _id: { $in: ids } });
    deleted += result.deletedCount;
  }

  return deleted;
}

async function backfillLegacyExpiration() {
  const cursor = Email.aggregate([
    { $match: { expiresAt: { $exists: false } } },
    {
      $lookup: {
        from: Inbox.collection.name,
        localField: "inboxId",
        foreignField: "_id",
        as: "inbox"
      }
    },
    { $unwind: "$inbox" },
    { $project: { _id: 1, expiresAt: "$inbox.expiresAt" } }
  ]).cursor({ batchSize: BATCH_SIZE });

  let operations = [];
  let updated = 0;

  for await (const email of cursor) {
    operations.push({
      updateOne: {
        filter: { _id: email._id, expiresAt: { $exists: false } },
        update: { $set: { expiresAt: email.expiresAt } }
      }
    });

    if (operations.length >= BATCH_SIZE) {
      const result = await Email.bulkWrite(operations, { ordered: false });
      updated += result.modifiedCount;
      operations = [];
    }
  }

  if (operations.length) {
    const result = await Email.bulkWrite(operations, { ordered: false });
    updated += result.modifiedCount;
  }

  return updated;
}

async function main() {
  await connectDB();

  const now = new Date();
  const [orphanCount, expiredCount, legacyCount] = await Promise.all([
    countOrphanEmails(),
    Email.countDocuments({ expiresAt: { $lte: now } }),
    Email.countDocuments({ expiresAt: { $exists: false } })
  ]);

  console.log("Email cleanup report");
  console.log(`- Orphan emails: ${orphanCount}`);
  console.log(`- Already expired emails: ${expiredCount}`);
  console.log(`- Legacy emails without expiration: ${legacyCount}`);

  if (!APPLY) {
    console.log("");
    console.log("Dry run only; no data was changed.");
    console.log("Run `npm run cleanup:emails -- --apply` to apply the cleanup.");
    return;
  }

  const deletedOrphans = await deleteOrphanEmails();
  const backfilled = await backfillLegacyExpiration();
  const expiredResult = await Email.deleteMany({ expiresAt: { $lte: new Date() } });

  console.log("");
  console.log("Cleanup applied");
  console.log(`- Permanently deleted orphan emails: ${deletedOrphans}`);
  console.log(`- Added expiration to legacy emails: ${backfilled}`);
  console.log(`- Permanently deleted expired emails: ${expiredResult.deletedCount}`);
}

main()
  .catch((err) => {
    console.error("Email cleanup failed:", err.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
