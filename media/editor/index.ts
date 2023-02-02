import LunaSetting from 'luna-setting'
import splitPath from 'licia/splitPath'
import isJson from 'licia/isJson'
import * as npm from './npm'
import * as miniprogram from './miniprogram'
import * as miniapp from './miniapp'
import * as prettier from './prettier'
import { store, i18n } from './util'

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
      break
    case 'init':
      i18n.locale(message.language)
      store.set('language', message.language)
      break
  }
})

function updateContent(fileName: string, text: string) {
  const { name } = splitPath(fileName)
  setting.clear()
  setting.removeAllListeners()

  if (isJson(text)) {
    switch (name) {
      case 'project.config.json':
        miniprogram.project(setting)
        break
      case 'project.miniapp.json':
        miniapp.project(setting)
        break
      case 'package.json':
        npm.pack(setting)
        break
      case '.prettierrc.json':
        prettier.config(setting)
        break
    }
  }
}

const fileName = store.get('fileName')
const text = store.get('text')
const language = store.get('language')
if (language) {
  i18n.locale(language)
}
if (fileName && text) {
  updateContent(fileName, text)
}
