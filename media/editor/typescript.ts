import endWith from 'licia/endWith'
import safeSet from 'licia/safeSet'
import lowerCase from 'licia/lowerCase'
import json5 from 'json5'
import LunaSetting from 'luna-setting'
import { buildSettings, updateText } from './util'

export function handler(setting: LunaSetting, fileName: string, text: string) {
  if (endWith(fileName, 'tsconfig.json')) {
    config(setting, text)
    return true
  }
  return false
}

function config(setting: LunaSetting, text: string) {
  const json = json5.parse(text)
  setting.on('change', (key, val) => {
    safeSet(json, key, val)
    updateText(JSON.stringify(json, null, 2) + '\n')
  })

  const compilerOptions = json.compilerOptions || {}

  buildSettings(setting, [
    ['title', 'Typescript Config'],
    [
      'markdown',
      'Click [here](https://www.typescriptlang.org/tsconfig) to see the documentation.',
    ],
    [
      'path',
      'extends',
      json.extends || '',
      'Extends',
      'The value of `extends` is a string which contains a path to another configuration file to inherit from. The path may use Node.js style resolution.',
    ],
    ['title', 'Compiler Options', 2],
    [
      'select',
      'compilerOptions.module',
      compilerOptions.module || 'commonjs',
      'Module',
      'Sets the module system for the program. See the [Modules](https://www.typescriptlang.org/docs/handbook/modules.html) reference page for more information. You very likely want `"CommonJS"` for node projects.',
      {
        None: 'none',
        CommonJS: 'commonjs',
        AMD: 'amd',
        UMD: 'umd',
        System: 'system',
        'ES6/ES2015': 'es6/es2015',
        ES2020: 'es2020',
        ES2022: 'es2022',
        ESNext: 'esnext',
        Node16: 'node16',
        NodeNext: 'nodenext',
      },
    ],
    [
      'select',
      'compilerOptions.target',
      lowerCase(compilerOptions.target || 'es3'),
      'Target',
      'Modern browsers support all ES6 features, so `ES6` is a good choice. You might choose to set a lower target if your code is deployed to older environments, or a higher target if your code is guaranteed to run in newer environments.',
      {
        ES3: 'es3',
        ES5: 'es5',
        'ES6/ES2015': 'es6/es2015',
        ES2016: 'es2016',
        ES2017: 'es2017',
        ES2018: 'es2018',
        ES2019: 'es2019',
        ES2020: 'es2020',
        ES2021: 'es2021',
        ES2022: 'es2022',
        ESNext: 'esnext',
      },
    ],
    [
      'checkbox',
      'compilerOptions.strict',
      !!compilerOptions.strict,
      'Strict',
      'The `strict` flag enables a wide range of type checking behavior that results in stronger guarantees of program correctness. Turning this on is equivalent to enabling all of the *strict mode family* options, which are outlined below. You can then turn off individual strict mode family checks as needed.',
    ],
    [
      'checkbox',
      'compilerOptions.declaration',
      !!compilerOptions.declaration,
      'Declaration',
      'Generate `.d.ts` files for every TypeScript or JavaScript file inside your project. ',
    ],
    [
      'checkbox',
      'compilerOptions.esModuleInterop',
      !!compilerOptions.esModuleInterop,
      'ES Module Interop',
      'Emit additional JavaScript to ease support for importing CommonJS modules. This enables `allowSyntheticDefaultImports` for type compatibility.',
    ],
    [
      'complex',
      'lib',
      'Lib',
      'TypeScript includes a default set of type definitions for built-in JS APIs (like `Math`), as well as type definitions for things found in browser environments (like `document`). TypeScript also includes APIs for newer JS features matching the target you specify; for example the definition for Map is available if target is `ES6` or newer.',
    ],
    [
      'checkbox',
      'compilerOptions.sourceMap',
      !!compilerOptions.sourceMap,
      'Source Map',
      'Enables the generation of [sourcemap files](https://developer.mozilla.org/docs/Tools/Debugger/How_to/Use_a_source_map). These files allow debuggers and other tools to display the original TypeScript source code when actually working with the emitted JavaScript files. Source map files are emitted as `.js.map` (or `.jsx.map`) files next to the corresponding `.js` output file.',
    ],
  ])
}
