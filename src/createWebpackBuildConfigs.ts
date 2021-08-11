import path from "path";
import nodeExternals from "webpack-node-externals";
import createImportTransformer from "./createImportTransformer";

function createWebpackBuildConfigs({
  entries,
}: {
  entries: {
    web: string;
    node: string;
  };
}) {
  return [createConfig("node", entries.node), createConfig("web", entries.web)];
}

function createConfig(target: "node" | "web", entry: string) {
  const distPath = path.resolve(__dirname, "dist");

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
          use: ["style-loader", "css-loader", "postcss-loader"],
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
}

export default createWebpackBuildConfigs;
