import endWith from 'licia/endWith'
import safeSet from 'licia/safeSet'
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
      'input',
      'extends',
      json.extends || '',
      'Extends',
      'The value of `extends` is a string which contains a path to another configuration file to inherit from. The path may use Node.js style resolution.',
    ],
    ['title', 'Compiler Options'],
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
      'checkbox',
      'compilerOptions.declaration',
      !!compilerOptions.declaration,
      'Declaration',
      'Generate `.d.ts` files for every TypeScript or JavaScript file inside your project. ',
    ],
    [
      'editSource',
      'Lib',
      'TypeScript includes a default set of type definitions for built-in JS APIs (like `Math`), as well as type definitions for things found in browser environments (like `document`). TypeScript also includes APIs for newer JS features matching the target you specify; for example the definition for Map is available if target is `ES6` or newer.',
    ],
  ])
}
