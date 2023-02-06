import LunaSetting from 'luna-setting'
import * as npm from './npm'
import * as miniprogram from './miniprogram'
import * as miniapp from './miniapp'
import * as prettier from './prettier'
import { store, i18n } from './util'

const handlers = [
  prettier.handler,
  miniapp.handler,
  miniprogram.handler,
  npm.handler,
]

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
  setting.clear()
  setting.removeAllListeners()

  for (let i = 0, len = handlers.length; i < len; i++) {
    if (handlers[i](setting, fileName, text)) {
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
