import createServerHandler from "./createServerHandler";
import startDevServer from "./startDevServer";
import fetch from "node-fetch";
import path from "path";

describe("createServerHandler", () => {
  const createHandleRequest = createServerHandler({
    mappings: {},
    componentModuleSystem: {
      importPath: (path) => import(path),
      requireCache: require.cache,
    },
  });

  it("can create a dev server that tolerate errors", async () => {
    const { address, server } = await startDevServer({
      preferredPort: 7000,
      createHandleRequest,
      getPreviewData: async () => {
        return {};
      },
      hostContext: {},
      projectRoot: path.resolve(__dirname, "../testHelpers/fakeProject"),
    });

    const firstResponse = await fetch(
      `http://localhost:${address.port}/abledev/call-query?key=queries/with-error`,
    );
    const secondResponse = await fetch(
      `http://localhost:${address.port}/abledev/call-query?key=queries/with-error`,
    );

    expect(firstResponse.status).toEqual(secondResponse.status);

    server.close();
  });
});
