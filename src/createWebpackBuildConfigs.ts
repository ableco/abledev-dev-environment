import nodeExternals from "webpack-node-externals";
import createImportTransformer from "./createImportTransformer";
import MiniCssExtractPlugin from "mini-css-extract-plugin";

function createWebpackBuildConfigs({
  entries,
  distPath,
}: {
  entries: {
    web: string;
    node: string;
  };
  distPath: string;
}) {
  return [
    createConfig("node", entries.node, distPath),
    createConfig("web", entries.web, distPath),
  ];
}

function createConfig(target: "node" | "web", entry: string, distPath: string) {
  return {
    mode: "production",
    entry: entry,
    output: {
      path: distPath,
      filename: `due-date.${target}.js`,
      library: { name: `dueDate.${target}`, type: "umd" },
      globalObject: "this",
    },
    ...(target === "node"
      ? {
          externalsPresets: { node: true },
        }
      : {}),
    target,
    externals:
      target === "web"
        ? {
            react: {
              root: "React",
              commonjs: "react",
              commonjs2: "react",
            },
            "react-dom": {
              root: "ReactDOM",
              commonjs: "react-dom",
              commonjs2: "react-dom",
            },
          }
        : [nodeExternals()],
    module: {
      rules: [
        {
          test: /\.(j|t)sx?$/,
          loader: "ts-loader",
          options: {
            compilerOptions: {
              declaration: true,
              outDir: distPath,
            },
            getCustomTransformers: () => {
              return {
                before: [createImportTransformer()],
              };
            },
          },
          exclude: /node_modules/,
        },
        {
          test: /\.css$/i,
          use: [MiniCssExtractPlugin.loader, "css-loader", "postcss-loader"],
        },
      ],
    },
    resolve: {
      extensions: [".ts", ".tsx", ".js", ".jsx"],
    },
    optimization: {
      minimize: false,
    },
    plugins: [new MiniCssExtractPlugin()],
  };
}

export default createWebpackBuildConfigs;
