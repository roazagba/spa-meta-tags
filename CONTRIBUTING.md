# Contributing to spa-meta-tags

Thanks for your interest! Contributions are welcome: bug reports, ideas, documentation or code.

## Reporting a bug or suggesting an idea

Open an issue on GitHub and include:

- the version of the package and of Node;
- the server used (Express, Node `http`...) and the framework of the SPA;
- the expected and the actual behavior, ideally with the generated HTML or a minimal example.

For a social network preview issue, attach the result of the [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) or an equivalent tool.

## Submitting a change

1. Fork the repository and create a branch from `main` (`fix/...`, `feat/...`, `docs/...`).
2. Install the project:
   ```bash
   npm install
   ```
3. Make your changes, adding or updating the tests.
4. Check that everything passes:
   ```bash
   npm test
   npm run type-check
   npm run build
   ```
5. Open a pull request describing the problem and the solution.

## Project principles

- **No runtime dependency**: the package must stay lightweight.
- **Works with any Node server**: no dependency on Express or any specific framework.
- **Safe by default**: every value injected in the HTML is escaped.
- **Resilient**: a slow or failing API must never prevent the page from being served.
- **ESM and CommonJS**: the package must stay usable with both `import` and `require`.

## Commit messages

Use the [Conventional Commits](https://www.conventionalcommits.org/) format: `feat: ...`, `fix: ...`, `docs: ...`, `test: ...`, `chore: ...`.

## License

By contributing, you agree that your contributions will be licensed under the project's [MIT License](LICENSE).
