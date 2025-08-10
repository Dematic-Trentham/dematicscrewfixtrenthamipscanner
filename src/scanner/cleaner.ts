import db from "../db/db.js";
import logger from "../misc/logging.js";

async function deleteOldHistory() {
  logger.info("Running PLC Pinger To DB Service - Cleanup ....");
  console.log("Running PLC Pinger To DB Service - Cleanup ....");

  //for 30 days for 100 rows ever minute we have over 4 million rows

  //older than 1 days we should only keep 1 data point per hour rather than every minute

  //older than 30 days we should delete all data points

  //this would mean we keep 24 data points per day for 1 days and then delete all data points older than 30 days
  // 100 IPs, 1 record per minute
  // 60 minutes per hour
  // 24 hours per day
  // 7 days in a week
  // 30 days in a month

  // Records for 1 week: 100 IPs * 60 minutes/hour * 24 hours/day * 1 days = 144,000
  // Records for 30 days at 1 record per hour: 100 IPs * 24 hours/day * (30 - 1) days = 69,600
  //total records for 30 days: 144,000 + 69,600 = 213,600

  const oneDaysAgo = new Date();
  oneDaysAgo.setDate(oneDaysAgo.getDate() - 1);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  logger.info("Deleting all history older than 30 days");

  //delete all history older than 30 days
  const deletedCount1 = await db.pingHistory.deleteMany({
    where: {
      createdAt: {
        lt: thirtyDaysAgo,
      },
    },
  });

  logger.info("Deleted all history older than 30 days: " + deletedCount1.count + " rows");

  logger.info("Deleting all history older than 1 days , that is not on the hour");

  // Delete all history older than 7 days where the minute is not 00
  const deletedCount2 = await db.$executeRawUnsafe(`
    DELETE FROM pingHistory
    WHERE MINUTE(createdAt) <> 0
      AND createdAt < NOW() - INTERVAL 1 DAY
  `);

  logger.info("Deleted all history older than 1 days, that is not on the hour " + deletedCount2 + " rows");
}
export default deleteOldHistory;
