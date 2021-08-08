import path from "path";
import glob from "glob";

export type FunctionType = "query" | "mutation";

export type FunctionDefinition = {
  fileName: string;
  sourcePath: string;
  productionImportPath?: string;
  functionName: string;
  type: FunctionType;
};

export type FunctionMappings = {
  [functionName: string]: FunctionDefinition;
};

function filterFileNames(fileNames: Array<string>, type: FunctionType) {
  const plural = type === "query" ? "queries" : "mutations";
  return fileNames.filter((fileName) => fileName.startsWith(plural));
}

function createFunctionsMapping(
  fileNames: Array<string>,
  type: FunctionType,
  srcPath: string,
) {
  const mapping: { [relativeFileName: string]: FunctionDefinition } = {};
  fileNames.forEach((fileName) => {
    const [functionName, _extension] = fileName.split(".");

    mapping[functionName] = {
      fileName,
      sourcePath: path.join(srcPath, fileName),
      functionName,
      type,
    };
  });
  return mapping;
}

function buildFunctionMappings(fileNames: Array<string>, srcPath: string) {
  const queries = filterFileNames(fileNames, "query");
  const mutations = filterFileNames(fileNames, "mutation");

  const functionMappings: FunctionMappings = {
    ...createFunctionsMapping(queries, "query", srcPath),
    ...createFunctionsMapping(mutations, "mutation", srcPath),
  };

  return functionMappings;
}

function getFunctionMappings(srcPath: string) {
  const fileNames = glob.sync("**/{mutations,queries}/**.ts", { cwd: srcPath });
  return buildFunctionMappings(fileNames, srcPath);
}

export default getFunctionMappings;
