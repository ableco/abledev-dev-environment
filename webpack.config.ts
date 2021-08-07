import path from "path";
import { Configuration } from "webpack";
import nodeExternals from "webpack-node-externals";

const distPath = path.resolve(__dirname, "dist");

const config: Configuration = {
  mode: "production",
  entry: "./src/index.ts",
  output: {
    path: distPath,
    filename: "abledev-dev-environment.js",
    library: {
      name: "abledev-dev-environment",
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
        loader: "ts-loader",
        exclude: /node_modules/,
        options: {
          compilerOptions: {
            declaration: true,
            outDir: distPath,
          },
        },
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".tsx", ".ts", ".js"],
  },
  optimization: {
    minimize: false,
  },
};

export default config;
