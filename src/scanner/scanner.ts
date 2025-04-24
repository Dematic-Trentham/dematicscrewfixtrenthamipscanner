import db from "../db/db.js";
import logger from "../misc/logging.js";
import { pingIp } from "./utils/ping.js";
import { testPLCConnection } from "./utils/plc.js";

export async function scanAllIps() {
  //get all ips from db to scan
  const ips = await db.ipsToPing.findMany({});

  //do we have any ips to scan?
  if (ips.length === 0) {
    logger.log("info", "No IPs to scan, exiting ....");
    return;
  }

  //loop through all ips and scan them
  for (const ip of ips) {
    //should just be a ping or also a plc scan?
    if (ip.plc == true && ip.plcSlot != null) {
      //Ping
      const pingStatus = await pingIp(ip.ipAddress, 1000); //ping the ip

      //test plc connection
      const plcStatus = await testPLCConnection(ip.ipAddress, ip.plcSlot); //test the plc connection

      //update the db with the results
      await db.ipsToPing.update({
        where: { id: ip.id },
        data: {
          pingStatus: pingStatus.isAlive,
          pingTimeMS: pingStatus.responseTime,
          plcStatus: plcStatus,
          lastUpdated: new Date(),
        },
      });

      //insert into history table
      await db.pingHistory.create({
        data: {
          ipAddress: ip.ipAddress,
          pingStatus: pingStatus.isAlive,
          pingTimeMS: pingStatus.responseTime,
          plcStatus: plcStatus,
          createdAt: new Date(),
          machineName: ip.machineName,
        },
      });

      logger.log(
        "info",
        ip.machineName +
          " - IP: " +
          ip.ipAddress +
          " - PLC Slot: " +
          ip.plcSlot +
          " - Ping Status: " +
          pingStatus.isAlive +
          " - Ping Time: " +
          pingStatus.responseTime +
          "ms - PLC Status: " +
          plcStatus
      );
    } else {
      //just a ping

      //Ping
      const ping = await pingIp(ip.ipAddress, 1000); //ping the ip

      //update the db with the ping result
      await db.ipsToPing.update({
        where: { id: ip.id },
        data: {
          pingStatus: ping.isAlive,
          pingTimeMS: ping.responseTime,
          lastUpdated: new Date(),
        },
      });

      //insert into history table
      await db.pingHistory.create({
        data: {
          ipAddress: ip.ipAddress,
          pingStatus: ping.isAlive,
          pingTimeMS: ping.responseTime,
          createdAt: new Date(),
          machineName: ip.machineName,
        },
      });

      logger.log("info", ip.machineName + " - IP: " + ip.ipAddress + " - Ping Status: " + ping.isAlive + " - Ping Time: " + ping.responseTime + "ms");
    }
  }
}
