import { createServer } from "http";
import createServerHandler from "./createServerHandler";
import { listenOnAvailablePort } from "./listenOnAvailablePort";

type HandleRequest = ReturnType<ReturnType<typeof createServerHandler>>;

type DevServerOptions = {
  preferredPort: number;
  handleRequest: HandleRequest;
};

function startDevServer({ preferredPort, handleRequest }: DevServerOptions) {
  const server = createServer((request, response) => {
    handleRequest(request, response);
  });

  listenOnAvailablePort(server, preferredPort).then((port) => {
    console.log("Server listening at port", port);
  });
}

export default startDevServer;