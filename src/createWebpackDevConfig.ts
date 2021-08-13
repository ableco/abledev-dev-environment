import { Configuration, HotModuleReplacementPlugin } from "webpack";
import HtmlWebpackPlugin from "html-webpack-plugin";
import ReactRefreshWebpackPlugin from "@pmmmwh/react-refresh-webpack-plugin";
import ReactRefreshTypeScript from "react-refresh-typescript";
import createImportTransformer from "./createImportTransformer";
import webpackMerge from "webpack-merge";
import path from "path";

function createWebpackDevConfig({
  previewFolderPath,
  __internal__extendConfig,
}: {
  previewFolderPath: string;
  __internal__extendConfig?: Partial<Configuration>;
}) {
  const entry = path.join(previewFolderPath, "index.tsx");
  const template = path.join(previewFolderPath, "index.html");

  const config: Configuration = {
    mode: "development",
    entry: [entry, "webpack-hot-middleware/client"],
    stats: "errors-only",
    module: {
      rules: [
        {
          test: /\.(j|t)sx?$/,
          loader: "ts-loader",
          exclude: /node_modules/,
          options: {
            getCustomTransformers: () => {
              return {
                before: [ReactRefreshTypeScript(), createImportTransformer()],
                transpileOnly: true,
              };
            },
          },
        },
        {
          test: /\.css$/i,
          use: ["style-loader", "css-loader", "postcss-loader"],
        },
      ],
    },
    resolve: {
      extensions: [".ts", ".tsx", ".js", ".jsx"],
    },
    plugins: [
      new HtmlWebpackPlugin({ template }),
      new HotModuleReplacementPlugin(),
      new ReactRefreshWebpackPlugin(),
    ],
  };

  return __internal__extendConfig
    ? webpackMerge(config, __internal__extendConfig)
    : config;
}

export default createWebpackDevConfig;
