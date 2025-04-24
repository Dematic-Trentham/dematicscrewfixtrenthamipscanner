import ping from "ping";
import logger from "../../misc/logging.js";

export async function pingIp(ip: string, timeout: number): Promise<{ isAlive: boolean; responseTime: number | null }> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const timer = setTimeout(() => {
      resolve({ isAlive: false, responseTime: null });
    }, timeout);

    ping.sys.probe(ip, (isAlive: boolean | null) => {
      clearTimeout(timer);
      const responseTime = isAlive ? Date.now() - startTime : null;
      resolve({ isAlive: isAlive ?? false, responseTime });
    });
  });
}
