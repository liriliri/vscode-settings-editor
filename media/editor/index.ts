import LunaSetting from 'luna-setting'
import debounce from 'licia/debounce'
import trim from 'licia/trim'
import * as npm from './npm'
import * as miniprogram from './miniprogram'
import * as prettier from './prettier'
import * as typescript from './typescript'
import { store, i18n } from './util'

const handlers = [
  prettier.handler,
  miniprogram.handler,
  npm.handler,
  typescript.handler,
]

const container = document.getElementById('container') as HTMLElement
const setting = new LunaSetting(container)

const searchInput = document
  .getElementById('search')
  ?.querySelector('input') as HTMLInputElement
searchInput.addEventListener(
  'input',
  debounce(function () {
    const filter = trim(searchInput.value)
    setting.setOption('filter', filter)
  }, 500),
  false
)

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
  searchInput.value = ''
  setting.clear()
  setting.removeAllListeners('change')

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
