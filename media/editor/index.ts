import LunaSetting from 'luna-setting'
import splitPath from 'licia/splitPath'
import safeSet from 'licia/safeSet'
import isJson from 'licia/isJson'
import isEmpty from 'licia/isEmpty'
import each from 'licia/each'
import truncate from 'licia/truncate'

// @ts-ignore
const vscode = acquireVsCodeApi()

const container = document.getElementById('container') as HTMLElement
const setting = new LunaSetting(container)
let curName = ''
let curText = ''
let curDir = ''

window.addEventListener('message', (event) => {
  const message = event.data // The json data that the extension sent
  switch (message.type) {
    case 'update':
      const { fileName, text } = message
      updateContent(fileName, text)
      vscode.setState({ fileName, text })
      return
  }
})

function updateContent(fileName: string, text: string) {
  const { name, dir } = splitPath(fileName)
  if (name === curName && text === curText) {
    return
  }
  setting.clear()
  setting.removeAllListeners()
  curName = name
  curText = text
  curDir = dir

  if (isJson(text)) {
    switch (name) {
      case 'project.config.json':
        updateProjectConfig()
        break
      case 'project.miniapp.json':
        updateProjectMiniapp()
        break
      case 'package.json':
        updatePackage()
        break
    }
  }
}

function updateProjectConfig() {
  const json = JSON.parse(curText)
  setting.on('change', (key, val) => {
    safeSet(json, key, val)

    const text = JSON.stringify(json, null, 2) + '\n'
    if (text !== curText) {
      curText = text
      vscode.postMessage({ type: 'update', text })
    }
  })

  setting.appendTitle('Miniprogram Project')
  setting.appendInput('appid', json.appid || '', 'AppId')
  setting.appendInput(
    'miniprogramRoot',
    json.miniprogramRoot || '',
    'Miniprogram Root'
  )
  setting.appendSelect('compileType', json.compileType, 'Compile Type', {
    Miniprogram: 'miniprogram',
    Plugin: 'plugin',
  })

  setting.appendTitle('Setting')
  setting.appendCheckbox(
    'setting.ignoreUploadUnusedFiles',
    json.setting.ignoreUploadUnusedFiles,
    'Ignore unuse files automatically when uploading code.'
  )
}

function updatePackage() {
  const json = JSON.parse(curText)
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

    const text = JSON.stringify(json, null, 2) + '\n'
    if (text !== curText) {
      curText = text
      vscode.postMessage({ type: 'update', text })
    }
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
    const {} = splitPath(curName)
    each(json.scripts, (script: string, name: string) => {
      setting.appendButton(name, truncate(script, 30), () => {
        vscode.postMessage({
          type: 'run',
          command: `cd ${curDir} && npm run ${name}`,
        })
      })
    })
  }
}

function updateProjectMiniapp() {
  const json = JSON.parse(curText)
  setting.on('change', (key, val) => {
    safeSet(json, key, val)

    const text = JSON.stringify(json, null, 2) + '\n'
    if (text !== curText) {
      curText = text
      vscode.postMessage({ type: 'update', text })
    }
  })

  setting.appendTitle('Miniapp Project')
  setting.appendInput('name', json.name, 'Name')
}

const state = vscode.getState()
if (state) {
  updateContent(state.fileName, state.text)
}
