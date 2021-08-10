import { Configuration, HotModuleReplacementPlugin } from "webpack";
import HtmlWebpackPlugin from "html-webpack-plugin";
import ReactRefreshWebpackPlugin from "@pmmmwh/react-refresh-webpack-plugin";
import ReactRefreshTypeScript from "react-refresh-typescript";
import createImportTransformer from "./createImportTransformer";
import webpackMerge from "webpack-merge";

function createWebpackDevConfig({
  entry,
  template,
  __internal__extendConfig,
}: {
  entry: string;
  template: string;
  __internal__extendConfig?: Partial<Configuration>;
}) {
  const config: Configuration = {
    mode: "development",
    entry: [entry, "webpack-hot-middleware/client"],
    module: {
      rules: [
        {
          test: /\.tsx?$/,
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
