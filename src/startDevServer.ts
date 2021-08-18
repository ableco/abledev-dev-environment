import expressAsyncHandler from "express-async-handler";
import { createServer } from "http";
import superjson from "superjson";
import { CreateHandleRequest } from "./createServerHandler";
import { listenOnAvailablePort } from "./listenOnAvailablePort";
import path from "path";
import createWebpackDevConfig from "./createWebpackDevConfig";

type DevServerOptions<HostContext> = {
  preferredPort?: number;
  createHandleRequest: CreateHandleRequest;
  getPreviewData: (hostContext: HostContext) => Promise<unknown>;
  hostContext: HostContext;
  projectRoot?: string;
};

async function startDevServer<HostContext extends object>({
  preferredPort = 5000,
  createHandleRequest,
  getPreviewData,
  hostContext,
  projectRoot = process.cwd(),
}: DevServerOptions<HostContext>) {
  const webpackConfig = createWebpackDevConfig({
    previewFolderPath: path.join(projectRoot, "preview"),
  });

  const handleRequest = createHandleRequest<HostContext>({
    mode: "development",
    srcPath: path.join(projectRoot, "src"),
    webpackConfig,
    hostContext,
  });

  handleRequest.get(
    "/dev/preview-data",
    expressAsyncHandler(async (_request, response) => {
      const data = await getPreviewData(hostContext);
      response.status(200).send(superjson.stringify(data));
    }),
  );

  const server = createServer((request, response) => {
    handleRequest(request, response);
  });

  const address = await listenOnAvailablePort(server, preferredPort);
  console.log("Server listening at port", address.port);
  return { server, address };
}

export default startDevServer;
