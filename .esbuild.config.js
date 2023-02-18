const esbuild = require('esbuild')
const sassPlugin = require('esbuild-sass-plugin').sassPlugin

const watch = process.argv.includes('--watch')
const minify = !watch

const replaceNodeBuiltIns = () => {
  const replace = {
    path: require.resolve('path-browserify'),
  }
  const filter = RegExp(`^(${Object.keys(replace).join('|')})$`)
  return {
    name: 'replaceNodeBuiltIns',
    setup(build) {
      build.onResolve({ filter }, (arg) => ({
        path: replace[arg.path],
      }))
    },
  }
}

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
    plugins: [replaceNodeBuiltIns()],
    mainFields: ['browser', 'module', 'main'],
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
