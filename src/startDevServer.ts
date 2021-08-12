import { createServer } from "http";
import createServerHandler from "./createServerHandler";
import { listenOnAvailablePort } from "./listenOnAvailablePort";

type HandleRequest = ReturnType<ReturnType<typeof createServerHandler>>;

type DevServerOptions = {
  preferredPort: number;
  handleRequest: HandleRequest;
};

async function startDevServer({
  preferredPort,
  handleRequest,
}: DevServerOptions) {
  const server = createServer((request, response) => {
    handleRequest(request, response);
  });

  const address = await listenOnAvailablePort(server, preferredPort);
  console.log("Server listening at port", address.port);
  return { server, address };
}

export default startDevServer;
