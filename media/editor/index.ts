import LunaSetting from 'luna-setting'
import splitPath from 'licia/splitPath'
import safeSet from 'licia/safeSet'
import isJson from 'licia/isJson'

// @ts-ignore
const vscode = acquireVsCodeApi()

const container = document.getElementById('container') as HTMLElement
const setting = new LunaSetting(container)
let curName = ''
let curText = ''

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
  const { name } = splitPath(fileName)
  if (name === curName && text === curText) {
    return
  }
  setting.clear()
  setting.removeAllListeners()
  curName = name
  curText = text

  if (isJson(text)) {
    switch (name) {
      case 'project.config.json':
        updateProjectConfig()
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
    console.log(key, val)
    safeSet(json, key, val)

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
}

const state = vscode.getState()
if (state) {
  updateContent(state.fileName, state.text)
}
