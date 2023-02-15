import LunaSetting from 'luna-setting'
import debounce from 'licia/debounce'
import trim from 'licia/trim'
import npm from './npm'
import miniprogram from './miniprogram'
import prettier from './prettier'
import typescript from './typescript'
import { store, i18n } from './util'

const handlers: any = {
  prettier,
  miniprogram,
  npm,
  typescript,
}

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
      const { fileName, text, handler } = message
      if (store.get('fileName') === fileName && store.get('text') === text) {
        return
      }
      store.set('fileName', fileName)
      store.set('text', text)
      store.set('handler', handler)
      updateContent()
      break
    case 'init':
      store.set('language', message.language)
      updateLanguage()
      break
  }
})

function updateLanguage() {
  const language = store.get('language')
  if (language) {
    i18n.locale(language)
    searchInput.setAttribute('placeholder', i18n.t('searchSettings'))
  }
}

function updateContent() {
  const fileName = store.get('fileName')
  const text = store.get('text')
  const handler = store.get('handler')

  if (!fileName || !text || !handler) {
    return
  }

  searchInput.value = ''
  setting.clear()
  setting.removeAllListeners('change')

  handlers[handler](setting, fileName, text)
}

updateLanguage()
updateContent()
