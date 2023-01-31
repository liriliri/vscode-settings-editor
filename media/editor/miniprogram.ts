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

  setting.appendTitle('Miniprogram Project')
  setting.appendInput('appid', json.appid || '', 'AppId')
  setting.appendInput(
    'miniprogramRoot',
    json.miniprogramRoot || '',
    'Miniprogram Root'
  )
  setting.appendSelect('compileType', json.compileType, 'Compile Type', {
    Miniprogram: 'miniprogram',
    Plugin: 'plugin',
  })

  setting.appendTitle('Setting')
  setting.appendCheckbox(
    'setting.ignoreUploadUnusedFiles',
    json.setting.ignoreUploadUnusedFiles,
    'Ignore unuse files automatically when uploading code.'
  )
}
