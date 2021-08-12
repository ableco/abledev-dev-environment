# Abledev Dev Environment

Tools to manage a environment that follows the abledev isolated component
framework. Its work is to answer 2 questions:

1. How can we build a package out of an isolated component folder?
2. How can we make sure a good developer experience for a developer working on
   an abledev isolated component?

We currently expose one central tool for both use cases:

- `createServerHandler`, which creates a function that can be plugged into a
  NodeJS server and, given enough information, can execute both `mutations` and
  `queries` through a regular signature.

For the second use case, we have 2 tools:

- `startDevServer`, which runs a webpack-powered development server with hmr and
  react-refresh enabled. It also serves mutations and queries by importing them
  directly from the disk.
- `createWebpackDevConfig`, which exposes a webpack configuration tailored for
  development. We may want to abstract this away into `startDevServer` at some
  point, but for now it helps that it makes the webpack configuration extendable
  from the isolated component point of view.

Finally, we have 2 tools that help with the building process:

- The `build-backend-functions` CLI utility, which transforms all queries and
  mutations into regular javascript and build a mapping file that will be used
  by the handler in the host application.
- `createWebpackBuildConfigs`, which exposes a webpack configuration tailored
  for building a package. It's in plural because it generates 2 entry points:

  1. One for NodeJS, which it's the `createServerHandler` that uses the mapping
     file created by `build-backend-functions`. It's meant to be used on the
     host application server side.
  2. Another one for the browser, which it's the rest of the package, and which
     should expose one or more React components.

## How to develop?

1. Clone this repository and `cd` into it.
2. Install the dependencies: `yarn`.
3. Play with the tests: `yarn test --watch`.
4. To deploy:
   1. Change the version in the `package.json`'s `version` field. As we're in a
      very alpha state, just increase the number next to alpha there.
   2. Commit the `package.json` change.
   3. Go to github and create a release. It will publish the package to
      `@ableco/abledev-dev-environment`.
