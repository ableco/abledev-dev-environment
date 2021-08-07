import { Server } from "http";
import { AddressInfo } from "net";

interface ErrorWithCode extends Error {
  code: string;
}

async function listenOnAvailablePort(
  server: Server,
  preferredPort: number
): Promise<number> {
  return new Promise((resolve, reject) => {
    server
      .once("error", (error: ErrorWithCode) => {
        if (error.code === "EADDRINUSE") {
          preferredPort = preferredPort + 1;
          server.listen(preferredPort);
        } else {
          reject(error);
        }
      })
      .once("listening", () => {
        resolve((server.address() as AddressInfo).port);
      })
      .listen(preferredPort);
  });
}

export { listenOnAvailablePort };
