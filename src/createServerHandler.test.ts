import { createServer, Server } from "http";
import fetch from "node-fetch";
import createServerHandler from "./createServerHandler";
import { listenOnAvailablePort } from "./listenOnAvailablePort";
import superjson from "superjson";

describe("createServerHandler", () => {
  const mappings = {
    "queries/simple": () => ({
      simpleBoolean: true,
      simpleString: "string",
      simpleNumber: 9999,
    }),
    "mutations/complex": ({ date }: { date: Date }) => {
      return {
        date,
        simpleBoolean: true,
      };
    },
  } as const;

  const createHandleRequest = createServerHandler({
    mappings,
    componentModuleSystem: {
      importPath: (path) => import(path),
      requireCache: require.cache,
    },
  });

  const handleRequest = createHandleRequest();

  let server: Server;

  beforeEach(() => {
    server = createServer((request, response) => {
      handleRequest(request, response);
    });
  });

  afterEach(() => {
    server.close();
  });

  it("allows returning superjson", async () => {
    const { port } = await listenOnAvailablePort(server, 3000);
    const response = await fetch(
      `http://localhost:${port}/abledev/call-query?key=queries/simple`,
    );
    const textResponse = await response.text();
    expect(superjson.parse(textResponse)).toEqual({
      simpleBoolean: true,
      simpleString: "string",
      simpleNumber: 9999,
    });
  });

  it("allows passing superjson", async () => {
    const { port } = await listenOnAvailablePort(server, 3000);
    const date = new Date();

    const response = await fetch(
      `http://localhost:${port}/abledev/call-mutation?key=mutations/complex`,
      {
        method: "POST",
        body: superjson.stringify({ date }),
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      },
    );
    const textResponse = await response.text();
    expect(superjson.parse(textResponse)).toEqual({
      simpleBoolean: true,
      date,
    });
  });
});
