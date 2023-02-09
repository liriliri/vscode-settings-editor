import LunaSetting from 'luna-setting'
import isEmpty from 'licia/isEmpty'
import each from 'licia/each'
import truncate from 'licia/truncate'
import safeSet from 'licia/safeSet'
import splitPath from 'licia/splitPath'
import ini from 'licia/ini'
import { vscode, updateText, appendMarkdown, buildSettings } from './util'

export function handler(setting: LunaSetting, fileName: string, text: string) {
  const { name } = splitPath(fileName)

  switch (name) {
    case 'package.json':
      pack(setting, fileName, text)
      return true
    case '.npmrc':
      config(setting, text)
      return true
  }

  return false
}

function pack(setting: LunaSetting, fileName: string, text: string) {
  const json = JSON.parse(text)
  setting.on('change', (key, val) => {
    safeSet(json, key, val)

    if (key === 'license' && val === '') {
      delete json.license
    }

    updateText(JSON.stringify(json, null, 2) + '\n')
  })

  buildSettings(setting, [
    ['title', 'Npm Package'],
    [
      'markdown',
      'Click [here](https://docs.npmjs.com/cli/v9/configuring-npm/package-json) to see the documentation.',
    ],
    [
      'input',
      'name',
      json.name,
      'Name',
      'The name is what your thing is called.',
    ],
    [
      'input',
      'version',
      json.version,
      'Version',
      'Version must be parseable by node-semver, which is bundled with npm as a dependency. (npm install semver to use it yourself.)',
    ],
    [
      'input',
      'description',
      json.description,
      'Description',
      "This helps people discover your package, as it's listed in npm search.",
    ],
    [
      'editSource',
      'Keywords',
      "This helps people discover your package as it's listed in npm search.",
    ],
    [
      'input',
      'homepage',
      json.homepage || '',
      'Homepage',
      'The url to the project homepage.',
    ],
  ])
  const licenseOptions: any = {
    MIT: 'MIT',
    ISC: 'ISC',
    'BSD-2-Clause': 'BSD-2-Clause',
    none: '',
  }
  if (json.license) {
    licenseOptions[json.license] = json.license
  }
  buildSettings(setting, [
    [
      'select',
      'license',
      json.license || '',
      'License',
      "You should specify a license for your package so that people know how they are permitted to use it, and any restrictions you're placing on it.",
      licenseOptions,
    ],
    [
      'input',
      'main',
      json.main,
      'Main',
      'The main field is a module ID that is the primary entry point to your program.',
    ],
  ])

  if (json.scripts && !isEmpty(json.scripts)) {
    setting.appendTitle('Scripts')
    const { dir } = splitPath(fileName)
    each(json.scripts, (script: string, name: string) => {
      setting.appendButton(name, truncate(script, 30), () => {
        vscode.postMessage({
          type: 'run',
          command: `cd ${dir} && npm run ${name}`,
        })
      })
    })
  }
}

function config(setting: LunaSetting, text: string) {
  const obj = ini.parse(text)

  setting.on('change', (key, val) => {
    safeSet(obj, key, val)

    updateText(ini.stringify(obj))
  })

  setting.appendTitle('Npm Config')
  appendMarkdown(
    setting,
    'Click [here](https://docs.npmjs.com/cli/v9/using-npm/config) to see the documentation.'
  )
  setting.appendInput(
    'registry',
    obj.registry || 'https://registry.npmjs.org/',
    'Registry',
    'The base URL of the npm registry.'
  )
  setting.appendInput(
    'cache',
    obj.cache || '',
    'Cache',
    "The location of npm's cache directory."
  )
  setting.appendInput(
    'prefix',
    obj.prefix || '',
    'Prefix',
    'In global mode, the folder where the node executable is installed. In local mode, the nearest parent folder containing either a package.json file or a node_modules folder.'
  )
  setting.appendInput(
    'proxy',
    obj.proxy || '',
    'Proxy',
    'A proxy to use for outgoing http requests. If the `HTTP_PROXY` or `http_proxy` environment variables are set, proxy settings will be honored by the underlying `request` library.'
  )
}
