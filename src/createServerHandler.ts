import path from "path";
import express from "express";
import cors from "cors";
import asyncHandler from "express-async-handler";
import webpack from "webpack";
import WebpackDevMiddleware from "webpack-dev-middleware";
import WebpackHotMiddleware from "webpack-hot-middleware";

type AnyFunction = (...args: any) => any;

type AppOptions =
  | {
      mode: "development";
      srcPath: string;
      webpackConfig: webpack.Configuration;
    }
  | { mode: "production"; srcPath?: never; webpackConfig?: never };

type Mappings = { [key: string]: AnyFunction };

type ComponentModuleSystem = {
  importPath: (path: string) => any;
  requireCache: NodeJS.Require["cache"];
};

function createServerHandler({
  mappings,
  componentModuleSystem,
}: {
  mappings: Mappings;
  componentModuleSystem: ComponentModuleSystem;
}) {
  return function createHandleRequest(
    appOptions: AppOptions = { mode: "production" },
  ) {
    const app = express();

    app.use(express.json());

    if (appOptions.mode === "development") {
      app.use(cors());
    }

    if (appOptions.webpackConfig) {
      const webpackCompiler = webpack(appOptions.webpackConfig);
      app.use(WebpackDevMiddleware(webpackCompiler));
      app.use(WebpackHotMiddleware(webpackCompiler));
    }

    app.get(
      "/abledev/call-query",
      asyncHandler(async (request, response) => {
        handleBackendFunction({
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
        handleBackendFunction({
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

async function handleBackendFunction({
  request,
  response,
  type,
  appOptions,
  mappings,
  componentModuleSystem,
}: {
  request: express.Request;
  response: express.Response;
  type: "query" | "mutation";
  appOptions: AppOptions;
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
      console.log("ERROR IMPORTING !!!", functionPath, require.cache);
    }
  } else {
    backendFunction = mappings[functionName as keyof typeof mappings];
  }

  if (typeof backendFunction === "function") {
    const result = backendFunction({
      request,
      response,
    });
    response.status(200).json(result);
  } else {
    response.status(500).json({
      message: `${type} is not a function: ${functionName}`,
    });
  }
}

export default createServerHandler;
