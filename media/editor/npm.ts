import LunaSetting from 'luna-setting'
import isEmpty from 'licia/isEmpty'
import map from 'licia/map'
import truncate from 'licia/truncate'
import safeSet from 'licia/safeSet'
import splitPath from 'licia/splitPath'
import ini from 'licia/ini'
import { vscode, updateText, buildSettings, def, i18n } from './util'

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
      i18n.t('seeDoc', {
        url: 'https://docs.npmjs.com/cli/v9/configuring-npm/package-json',
      }),
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
      'complex',
      'keywords',
      'Keywords',
      "This helps people discover your package as it's listed in npm search.",
    ],
    [
      'input',
      'homepage',
      def(json.homepage, ''),
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
      'path',
      'main',
      json.main,
      'Main',
      'The main field is a module ID that is the primary entry point to your program.',
      {
        extensions: ['js'],
      },
    ],
  ])

  if (json.scripts && !isEmpty(json.scripts)) {
    const { dir } = splitPath(fileName)
    buildSettings(setting, [
      ['title', 'Scripts'],
      ...map(json.scripts, (script: string, name: string) => {
        return [
          'button',
          name,
          truncate(script, 30),
          () => {
            vscode.postMessage({
              type: 'run',
              command: `cd ${dir} && npm run ${name}`,
            })
          },
        ]
      }),
    ])
  }
}

function config(setting: LunaSetting, text: string) {
  const obj = ini.parse(text)

  setting.on('change', (key, val) => {
    safeSet(obj, key, val)

    updateText(ini.stringify(obj))
  })

  buildSettings(setting, [
    ['title', 'Npm Config'],
    [
      'markdown',
      i18n.t('seeDoc', {
        url: 'https://docs.npmjs.com/cli/v9/using-npm/config',
      }),
    ],
    [
      'input',
      'registry',
      def(obj.registry, 'https://registry.npmjs.org/'),
      'Registry',
      'The base URL of the npm registry.',
    ],
    [
      'path',
      'cache',
      def(obj.cache, ''),
      'Cache',
      "The location of npm's cache directory.",
      {
        folder: true,
        file: false,
        absolute: true,
      },
    ],
    [
      'input',
      'prefix',
      def(obj.prefix, ''),
      'Prefix',
      'In global mode, the folder where the node executable is installed. In local mode, the nearest parent folder containing either a package.json file or a node_modules folder.',
    ],
    [
      'input',
      'proxy',
      def(obj.proxy, ''),
      'Proxy',
      'A proxy to use for outgoing http requests. If the `HTTP_PROXY` or `http_proxy` environment variables are set, proxy settings will be honored by the underlying `request` library.',
    ],
  ])
}
