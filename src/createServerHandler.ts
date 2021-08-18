import cors from "cors";
import express from "express";
import asyncHandler from "express-async-handler";
import morgan from "morgan";
import path from "path";
import superjson from "superjson";
import webpack from "webpack";
import WebpackDevMiddleware from "webpack-dev-middleware";
import WebpackHotMiddleware from "webpack-hot-middleware";
import superjsonMiddleware from "./superjsonMiddleware";

type AnyFunction = (...args: any) => any;

export type LeanHostContext<HostContext> = Omit<
  Omit<HostContext, "request">,
  "response"
>;

type AppOptions<HostContext> =
  | {
      mode: "development";
      srcPath: string;
      webpackConfig: webpack.Configuration;
      hostContext: LeanHostContext<HostContext>;
    }
  | {
      mode: "production";
      srcPath?: never;
      webpackConfig?: never;
      hostContext: {} | LeanHostContext<HostContext>;
    };

type Mappings = { [key: string]: AnyFunction };

type ComponentModuleSystem = {
  importPath: (path: string) => any;
  requireCache: NodeJS.Require["cache"];
};

type FunctionType = "query" | "mutation";

function createServerHandler({
  mappings,
  componentModuleSystem,
}: {
  mappings: Mappings;
  componentModuleSystem: ComponentModuleSystem;
}) {
  return function createHandleRequest<HostContext extends object>(
    appOptions: AppOptions<HostContext> = {
      mode: "production",
      hostContext: {},
    },
  ) {
    const app = express();

    app.use(express.text({ type: "application/json" }));
    // NOTE: Replace with official superjson middleware if/when it comes out
    app.use(superjsonMiddleware);

    if (appOptions.mode === "development") {
      app.use(cors());
    }

    if (appOptions.webpackConfig) {
      const webpackCompiler = webpack(appOptions.webpackConfig);
      app.use(WebpackDevMiddleware(webpackCompiler));
      app.use(WebpackHotMiddleware(webpackCompiler));
    }

    app.use(morgan("dev"));

    app.get(
      "/abledev/call-query",
      asyncHandler(async (request, response) => {
        await handleBackendFunction<HostContext>({
          request,
          response,
          type: "query",
          mappings,
          appOptions,
          componentModuleSystem,
        });
      }),
    );

    app.post(
      "/abledev/call-mutation",
      asyncHandler(async (request, response) => {
        await handleBackendFunction<HostContext>({
          request,
          response,
          type: "mutation",
          mappings,
          appOptions,
          componentModuleSystem,
        });
      }),
    );

    return app;
  };
}

function getFunctionArguments(type: FunctionType, request: express.Request) {
  if (type === "mutation") {
    return request.body as object;
  } else {
    return request.query;
  }
}

async function handleBackendFunction<HostContext>({
  request,
  response,
  type,
  appOptions,
  mappings,
  componentModuleSystem,
}: {
  request: express.Request;
  response: express.Response;
  type: FunctionType;
  appOptions: AppOptions<HostContext>;
  mappings: Mappings;
  componentModuleSystem: ComponentModuleSystem;
}) {
  const functionName = request.query.key as string;

  let backendFunction: unknown;

  if (appOptions.mode === "development") {
    const functionPath = path.join(appOptions.srcPath, `${functionName}.ts`);
    const { requireCache, importPath } = componentModuleSystem;

    if (requireCache[functionPath]) {
      delete requireCache[functionPath];
    }

    try {
      backendFunction = (await importPath(functionPath)).default;
    } catch {
      response.status(500).json({
        message: `Error importing function: ${functionName}. Tried: ${functionPath}`,
      });
      return;
    }
  } else {
    backendFunction = mappings[functionName as keyof typeof mappings];
  }

  if (typeof backendFunction === "function") {
    const functionContext = {
      request,
      response,
    };

    console.log("APP_OPTIONS");
    console.log(appOptions);
    console.log("APP_OPTIONS");

    const result = await backendFunction(getFunctionArguments(type, request), {
      ...functionContext,
      ...appOptions.hostContext,
    });
    response.status(200).send(superjson.stringify(result));
  } else {
    response.status(500).json({
      message: `${type} is not a function: ${functionName}`,
    });
  }
}

export type CreateHandleRequest = ReturnType<typeof createServerHandler>;

export default createServerHandler;
