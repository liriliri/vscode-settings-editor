import LunaSetting from 'luna-setting'
import safeSet from 'licia/safeSet'
import { store, vscode } from './util'

export function update(setting: LunaSetting) {
  const json = JSON.parse(store.get('text'))
  setting.on('change', (key, val) => {
    safeSet(json, key, val)

    const text = JSON.stringify(json, null, 2) + '\n'
    if (text !== store.get('text')) {
      store.set('text', text)
      vscode.postMessage({ type: 'update', text })
    }
  })

  setting.appendTitle('Miniapp Project')
  setting.appendInput('name', json.name, 'Name')
}
