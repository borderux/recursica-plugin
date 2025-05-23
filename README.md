# Recursica JSON exporter for Figma

This is a simple plugin for Figma that exports all the local variables in a Figma file to a JSON file. This is useful for exporting design tokens to be used in code.

## Development

To develop this plugin, you need to have Node.js and PNPM installed. Then, you can run the following commands:

[node]: https://nodejs.org/
[pnpm]: https://pnpm.io/

```bash
# Install dependencies
pnpm install

# Start the development server
pnpm watch
```

This will start a development server that will watch for changes in the `src` directory and automatically build the plugin for Figma.

### Debug the plugin in Figma

To install the plugin locally read this [guide](/PLUGIN.MD/).

## Structure

The plugin is using [React](https://reactjs.org/) for the UI and [TypeScript](https://www.typescriptlang.org/) for the logic.

To modify the UI, you can edit the file located at `src/App.tsx` directory. To modify the logic, you can edit the files in the `src/plugin` directory.

More details at [Figma Plugin API](https://www.figma.com/plugin-docs/intro/).
