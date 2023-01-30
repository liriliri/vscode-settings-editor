import LunaSetting from 'luna-setting'

// @ts-ignore
const vscode = acquireVsCodeApi()

const container = document.getElementById('container') as HTMLElement
const setting = new LunaSetting(container)

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
  setting.clear()
  setting.appendTitle(fileName)
}

const state = vscode.getState()
if (state) {
  updateContent(state.fileName, state.text)
}
