import snap7 from "node-snap7";
import logger from "../../misc/logging.js";

export async function testPLCConnection(ip: string, slot: number): Promise<boolean> {
  return new Promise(async (resolve, reject) => {
    const client = new snap7.S7Client();
    await client.ConnectTo(ip, 0, slot, async (err: any) => {
      if (err) {
        // console.error("Error connecting to PLC:", err);
        resolve(false); // Connection failed
      } else {
        // console.log("Connected to PLC at IP:", ip);

        await client.GetCpuInfo(async (err: any, info: any) => {
          if (err) {
            //console.error("Error getting CPU info:", err);
            resolve(false); // Failed to get CPU info
          } else {
            // console.log("CPU Info:", info);
            await client.Disconnect();
            resolve(true); // Successfully connected and got CPU info
          }
        });
      }
    });
  });
}
