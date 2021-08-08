import { Configuration, HotModuleReplacementPlugin } from "webpack";
import HtmlWebpackPlugin from "html-webpack-plugin";
import ReactRefreshWebpackPlugin from "@pmmmwh/react-refresh-webpack-plugin";
import ReactRefreshTypeScript from "react-refresh-typescript";
import createImportTransformer from "./createImportTransformer";

function createWebpackDevConfig({
  entry,
  template,
}: {
  entry: string;
  template: string;
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

  return config;
}

export default createWebpackDevConfig;
