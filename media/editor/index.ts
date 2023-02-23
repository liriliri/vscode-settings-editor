import npm from './npm'
import miniprogram from './miniprogram'
import prettier from './prettier'
import schema from './schema'
import { store, i18n } from './util'
import * as search from './search'
import * as setting from './setting'

window.process = require('process')

const handlers: any = {
  miniprogram,
  prettier,
  npm,
  schema,
}

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
      const { language, space } = message
      store.set('language', language)
      store.set('space', space)
      updateLanguage()
      break
  }
})

function updateLanguage() {
  const language = store.get('language')
  if (language) {
    i18n.locale(language)
    search.setPlaceHolder(i18n.t('searchSettings'))
  }
}

function updateContent() {
  const fileName = store.get('fileName')
  const text = store.get('text')
  const handler = store.get('handler')

  if (!fileName || !text || !handler) {
    return
  }

  search.reset()
  setting.reset()

  handlers[handler](fileName, text)
}

updateLanguage()
updateContent()
