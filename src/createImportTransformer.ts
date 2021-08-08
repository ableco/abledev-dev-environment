import ts from "typescript";

function createImportTransformer() {
  const transformer: ts.TransformerFactory<ts.SourceFile> = (context) => {
    return (sourceFile) => {
      if (sourceFile.fileName.endsWith("backend-functions/index.ts")) {
        return sourceFile;
      }

      const visitor = (node: ts.Node): ts.Node => {
        if (ts.isImportDeclaration(node)) {
          const moduleSpecifier = node.moduleSpecifier.getText();
          const importsQueries = moduleSpecifier.includes("queries/");
          const importsMutations = moduleSpecifier.includes("mutations/");

          if ((importsQueries || importsMutations) && node.importClause) {
            const constantName = node.importClause.getText();
            const functionKey = getFunctionKeyFromSpecifier(moduleSpecifier);

            return createStringConstAssignment(constantName, functionKey);
          }
        }
        return ts.visitEachChild(node, visitor, context);
      };
      return ts.visitNode(sourceFile, visitor);
    };
  };

  return transformer;
}

function createStringConstAssignment(
  constantName: string,
  constantValue: string,
) {
  const declaration = ts.factory.createVariableDeclaration(
    ts.factory.createIdentifier(constantName),
    undefined,
    undefined,
    ts.factory.createStringLiteral(constantValue),
  );

  return ts.factory.createVariableStatement(
    [],
    ts.factory.createVariableDeclarationList([declaration], ts.NodeFlags.Const),
  );
}

function getFunctionKeyFromSpecifier(moduleSpecifier: string) {
  let typeFolder = moduleSpecifier.includes("queries/")
    ? "queries"
    : "mutations";

  return moduleSpecifier
    .slice(moduleSpecifier.indexOf(typeFolder))
    .replace('"', "");
}

export default createImportTransformer;
