import isEmpty from 'licia/isEmpty'
import map from 'licia/map'
import truncate from 'licia/truncate'
import safeSet from 'licia/safeSet'
import splitPath from 'licia/splitPath'
import ini from 'licia/ini'
import { def } from './setting'
import * as setting from './setting'
import { vscode, updateText, i18n, getSpace } from './util'

export default function handler(fileName: string, text: string) {
  const { name } = splitPath(fileName)

  switch (name) {
    case 'package.json':
      pack(fileName, text)
      break
    case '.npmrc':
      config(text)
      break
  }
}

function pack(fileName: string, text: string) {
  const json = JSON.parse(text)
  setting.onChange((key, val) => {
    safeSet(json, key, val)

    if (key === 'license' && val === '') {
      delete json.license
    }

    updateText(JSON.stringify(json, null, getSpace()) + '\n')
  })

  setting.build([
    ['title', 'Npm Package'],
    [
      'markdown',
      i18n.t('seeDoc', {
        url: 'https://docs.npmjs.com/cli/v9/configuring-npm/package-json',
      }),
    ],
    [
      'text',
      'name',
      json.name,
      'Name',
      'The name is what your thing is called.',
    ],
    [
      'text',
      'version',
      json.version,
      'Version',
      'Version must be parseable by node-semver, which is bundled with npm as a dependency. (npm install semver to use it yourself.)',
    ],
    [
      'text',
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
      'text',
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
  setting.build([
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
    setting.build([
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

function config(text: string) {
  const obj = ini.parse(text)

  setting.onChange((key, val) => {
    safeSet(obj, key, val)

    updateText(ini.stringify(obj))
  })

  setting.build([
    ['title', 'Npm Config'],
    [
      'markdown',
      i18n.t('seeDoc', {
        url: 'https://docs.npmjs.com/cli/v9/using-npm/config',
      }),
    ],
    [
      'text',
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
      'text',
      'prefix',
      def(obj.prefix, ''),
      'Prefix',
      'In global mode, the folder where the node executable is installed. In local mode, the nearest parent folder containing either a package.json file or a node_modules folder.',
    ],
    [
      'text',
      'proxy',
      def(obj.proxy, ''),
      'Proxy',
      'A proxy to use for outgoing http requests. If the `HTTP_PROXY` or `http_proxy` environment variables are set, proxy settings will be honored by the underlying `request` library.',
    ],
  ])
}
