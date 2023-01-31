import LunaSetting from 'luna-setting'
import splitPath from 'licia/splitPath'
import isJson from 'licia/isJson'
import * as npmPackage from './npmPackage'
import * as miniprogram from './miniprogram'
import * as miniapp from './miniapp'
import * as prettier from './prettier'
import { store } from './util'

const container = document.getElementById('container') as HTMLElement
const setting = new LunaSetting(container)

window.addEventListener('message', (event) => {
  const message = event.data // The json data that the extension sent
  switch (message.type) {
    case 'update':
      const { fileName, text } = message
      if (store.get('fileName') === fileName && store.get('text') === text) {
        return
      }
      store.set('fileName', fileName)
      store.set('text', text)
      updateContent(fileName, text)
      return
  }
})

function updateContent(fileName: string, text: string) {
  const { name } = splitPath(fileName)
  setting.clear()
  setting.removeAllListeners()

  if (isJson(text)) {
    switch (name) {
      case 'project.config.json':
        miniprogram.update(setting)
        break
      case 'project.miniapp.json':
        miniapp.update(setting)
        break
      case 'package.json':
        npmPackage.update(setting)
        break
      case '.prettierrc.json':
        prettier.update(setting)
        break
    }
  }
}

const fileName = store.get('fileName')
const text = store.get('text')
if (fileName && text) {
  updateContent(fileName, text)
}
