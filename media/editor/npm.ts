import LunaSetting from 'luna-setting'
import isEmpty from 'licia/isEmpty'
import each from 'licia/each'
import truncate from 'licia/truncate'
import safeSet from 'licia/safeSet'
import splitPath from 'licia/splitPath'
import { vscode, updateText } from './util'
import endWith from 'licia/endWith'

export function handler(setting: LunaSetting, fileName: string, text: string) {
  if (endWith(fileName, 'package.json')) {
    pack(setting, fileName, text)
    return true
  }
  return false
}

function pack(setting: LunaSetting, fileName: string, text: string) {
  const json = JSON.parse(text)
  setting.on('change', (key, val) => {
    switch (key) {
      case 'keywords':
        val = val.split(',')
        break
    }

    safeSet(json, key, val)

    if (key === 'license' && val === '') {
      delete json.license
    }

    updateText(JSON.stringify(json, null, 2) + '\n')
  })

  setting.appendTitle('NPM Package')
  setting.appendInput(
    'name',
    json.name,
    'name',
    'The name is what your thing is called.'
  )
  setting.appendInput(
    'version',
    json.version,
    'version',
    'Version must be parseable by node-semver, which is bundled with npm as a dependency. (npm install semver to use it yourself.)'
  )
  setting.appendInput(
    'description',
    json.description,
    'description',
    "This helps people discover your package, as it's listed in npm search."
  )
  setting.appendInput(
    'keywords',
    (json.keywords || []).join(','),
    'keywords',
    "This helps people discover your package as it's listed in npm search."
  )
  setting.appendInput(
    'homepage',
    json.homepage || '',
    'homepage',
    'The url to the project homepage.'
  )
  const licenseOptions: any = {
    MIT: 'MIT',
    ISC: 'ISC',
    'BSD-2-Clause': 'BSD-2-Clause',
    none: '',
  }
  if (json.license) {
    licenseOptions[json.license] = json.license
  }
  setting.appendSelect(
    'license',
    json.license || '',
    'license',
    "You should specify a license for your package so that people know how they are permitted to use it, and any restrictions you're placing on it.",
    licenseOptions
  )
  setting.appendInput(
    'main',
    json.main,
    'main',
    'The main field is a module ID that is the primary entry point to your program.'
  )

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
