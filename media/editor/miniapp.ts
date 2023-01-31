import LunaSetting from 'luna-setting'
import safeSet from 'licia/safeSet'
import { store, updateText } from './util'

export function update(setting: LunaSetting) {
  const json = JSON.parse(store.get('text'))
  setting.on('change', (key, val) => {
    safeSet(json, key, val)

    updateText(JSON.stringify(json, null, 2) + '\n')
  })

  setting.appendTitle('Miniapp Project')
  setting.appendInput('name', json.name, 'Name')
}
