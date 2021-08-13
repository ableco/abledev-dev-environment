import expressAsyncHandler from "express-async-handler";
import { createServer } from "http";
import superjson from "superjson";
import createServerHandler from "./createServerHandler";
import { listenOnAvailablePort } from "./listenOnAvailablePort";

type HandleRequest = ReturnType<ReturnType<typeof createServerHandler>>;

type DevServerOptions = {
  preferredPort: number;
  handleRequest: HandleRequest;
  getPreviewData?: () => Promise<unknown>;
};

async function startDevServer({
  preferredPort,
  handleRequest,
  getPreviewData,
}: DevServerOptions) {
  if (getPreviewData) {
    handleRequest.get(
      "/dev/preview-data",
      expressAsyncHandler(async (_request, response) => {
        const data = await getPreviewData();
        response.status(200).send(superjson.stringify(data));
      }),
    );
  }

  const server = createServer((request, response) => {
    handleRequest(request, response);
  });

  const address = await listenOnAvailablePort(server, preferredPort);
  console.log("Server listening at port", address.port);
  return { server, address };
}

export default startDevServer;
