const esbuild = require('esbuild')
const sassPlugin = require('esbuild-sass-plugin').sassPlugin

const watch = process.argv.includes('--watch')
const minify = !watch

esbuild
  .build({
    entryPoints: ['src/extension.ts'],
    tsconfig: './tsconfig.json',
    bundle: true,
    external: ['vscode'],
    sourcemap: watch,
    minify,
    watch,
    platform: 'node',
    outfile: 'dist/extension.js',
  })
  .catch(() => process.exit(1))

esbuild
  .build({
    entryPoints: ['media/editor/index.ts'],
    tsconfig: './tsconfig.json',
    bundle: true,
    external: ['vscode'],
    sourcemap: watch ? 'inline' : false,
    minify,
    watch,
    platform: 'browser',
    outfile: 'dist/editor.js',
  })
  .catch(() => process.exit(1))

esbuild
  .build({
    entryPoints: ['media/editor/style.scss'],
    bundle: true,
    minify,
    plugins: [sassPlugin()],
    watch,
    outfile: 'dist/editor.css',
  })
  .catch(() => process.exit(1))
