import LunaSetting from 'luna-setting'
import splitPath from 'licia/splitPath'
import safeSet from 'licia/safeSet'

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
  if (name === 'project.config.json') {
    updateProjectConfig()
  }
}

function updateProjectConfig() {
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
  setting.appendTitle('General')
  setting.appendInput('appid', json.appid || '', 'AppId', 'Miniprogram appid.')
}

const state = vscode.getState()
if (state) {
  updateContent(state.fileName, state.text)
}
