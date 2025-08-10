//Service for Dematic Dashboard Screwfix
//Created by: JWL
//Date: 2025/04/24
//Last modified: 2024/09/22 14:07:35
//Version: 1.0.0
const version = "1.0.0";

//imports
import "dotenv/config";

import cron from "node-cron";
import fs from "fs";

import logger from "./misc/logging.js";

import { scanAllIps } from "./scanner/scanner.js";
import deleteOldHistory from "./scanner/cleaner.js";

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);
});

//startup text
logger.info("Dematic Dashboard Micro Service - PLC Pinger to DB");
logger.info("Starting PLC Pinger To DB Service ....");

logger.info("Starting PLC Pinger To DB Service v" + version + " ....");

//every 1 minute
cron.schedule("*/1 * * * *", () => {
  logger.info("Running PLC Pinger To DB Service ....");

  scanAllIps(); //get all ips from db to scan
});

//ever night lets delete some history in the db
cron.schedule("0 0 * * *", () => {
  deleteOldHistory(); //delete old history from the db
});

deleteOldHistory();
