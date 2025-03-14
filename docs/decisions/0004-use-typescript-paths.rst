4. Simplifying imports with TypeScript paths
--------------------------------------------

Status
------

Accepted (March 2025)

Context
-------

This is a new project, and from the outset, we aim to simplify the process of importing components, hooks, functions, and other modules by using TypeScript path aliases instead of relative paths. This approach is recommended for scalable and maintainable codebases, allowing for clearer, shorter, and more manageable imports, especially as the project grows.

Decision
--------

We will configure TypeScript to use path aliases for imports. This will be accomplished by setting up custom aliases in the `tsconfig.json` file.

Example `tsconfig.json` configuration:

.. code-block:: json

  {
    "extends": "@edx/typescript-config",
    "compilerOptions": {
      ...
      "paths": {
        "@/components/*": ["./src/components/*"],
        "@/hooks/*": ["./src/hooks/*"],
        "@/constants/*": ["./src/constants/*"]
      }
    },
    ...
  }


Consequences
------------

- **Benefits:**
  - **Simplified Imports:** By using path aliases, import statements become more concise and easier to read, avoiding the clutter of relative paths.
  - **Scalability:** This approach scales well as the project grows. It prevents issues with deeply nested relative paths and makes it easier to reorganize the file structure without affecting import statements.
  - **Consistency:** With path aliases defined globally, the codebase maintains consistent and easily adjustable import paths, reducing the likelihood of human error in writing or updating imports.
  - **Easier Refactoring:** Refactoring the directory structure is simpler because the alias paths remain unaffected, while with relative imports, changes in folder hierarchy require updating multiple import paths.

- **Downsides:**
  - **Initial Setup Complexity:** Setting up the aliasing in ``tsconfig.json``, as well as configuring Webpack and ESLint to support the aliases, requires additional effort upfront. As of this writing, by default, ``@openedx/frontend-build`` does not parse the ``tsconfig.json`` file to extract the paths, so we will need to extend the base Webpack configuration to utilize ``tsconfig-paths-webpack-plugin`` in addition to extending the base ESLint config's settings for the ``import/resolver``.
  - **Learning Curve:** Developers who are unfamiliar with path aliases may face a learning curve, and there could be initial confusion when transitioning from traditional relative imports in other projects to this system.

By adopting this approach early on, the project will benefit from a more maintainable, scalable, and readable codebase as it grows, while minimizing the risk of common import-related issues.

