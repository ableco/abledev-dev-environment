import path from "path";
import webpack from "webpack";
import { Configuration } from "webpack";
import nodeExternals from "webpack-node-externals";

const distPath = path.resolve(__dirname, "dist");

function buildConfig(
  entry: string,
  filename: string,
  name: string,
  plugins?: Configuration["plugins"]
) {
  const config: Configuration = {
    mode: "production",
    entry,
    output: {
      path: distPath,
      filename,
      library: {
        name,
        type: "umd",
      },
      globalObject: "this",
    },
    externalsPresets: { node: true },
    target: "node",
    externals: [nodeExternals()],
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: [
            {
              loader: "ts-loader",
              options: {
                compilerOptions: {
                  declaration: true,
                  outDir: distPath,
                },
              },
            },
            {
              loader: "shebang-loader",
            },
          ],
        },
      ],
    },
    resolve: {
      extensions: [".ts", ".tsx", ".ts", ".js"],
    },
    optimization: {
      minimize: false,
    },
    plugins,
  };

  return config;
}

export default [
  buildConfig(
    "./src/index.ts",
    "abledev-dev-environment.js",
    "abledev-dev-environment"
  ),
  buildConfig(
    "./src/buildBackendFunctions.ts",
    "build-backend-functions.js",
    "build-backend-functions",
    [new webpack.BannerPlugin({ banner: "#!/usr/bin/env node", raw: true })]
  ),
];
