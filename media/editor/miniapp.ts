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
  setting.appendInput('version', json.version, 'Version')
  setting.appendInput('miniModuleId', json.miniModuleId, 'Mini Module Id')
  setting.appendInput('description', json.description, 'Description')
  setting.appendInput('icon', json.icon, 'Icon')

  setting.appendTitle('Android')
  setting.appendCheckbox(
    'mini-android.useProjectTemplate',
    json['mini-android'].useProjectTemplate,
    'Use Project Template'
  )
  setting.appendInput(
    'mini-android.projectPath',
    json['mini-android'].projectPath,
    'Project Path'
  )
  setting.appendInput(
    'mini-android.archivePath',
    json['mini-android'].archivePath,
    'Archive Path'
  )
  setting.appendCheckbox(
    'mini-android.buildArchiveEverytime',
    json['mini-android'].buildArchiveEverytime,
    'Build Archive Everytime'
  )
  setting.appendInput(
    'mini-android.runArgs.mainActivity',
    json['mini-android'].runArgs.mainActivity,
    'runArgs: mainActivity'
  )
  setting.appendInput(
    'mini-android.runArgs.variant',
    json['mini-android'].runArgs.variant,
    'runArgs: variant'
  )
  setting.appendInput(
    'mini-android.buildArgs.mainActivity',
    json['mini-android'].buildArgs.mainActivity,
    'buildArgs: mainActivity'
  )
  setting.appendInput(
    'mini-android.buildArgs.variant',
    json['mini-android'].buildArgs.variant,
    'buildArgs: variant'
  )

  setting.appendTitle('iOS')
  setting.appendCheckbox(
    'mini-ios.useProjectTemplate',
    json['mini-ios'].useProjectTemplate,
    'Use Project Template'
  )
  setting.appendInput(
    'mini-ios.projectPath',
    json['mini-ios'].projectPath,
    'Project Path'
  )
  setting.appendInput(
    'mini-ios.archivePath',
    json['mini-ios'].archivePath,
    'Archive Path'
  )
  setting.appendCheckbox(
    'mini-ios.buildArchiveEverytime',
    json['mini-ios'].buildArchiveEverytime,
    'Build Archive Everytime'
  )
  setting.appendInput(
    'mini-ios.runArgs.scheme',
    json['mini-ios'].runArgs.scheme,
    'runArgs: scheme'
  )
  setting.appendInput(
    'mini-ios.buildArgs.scheme',
    json['mini-ios'].buildArgs.scheme,
    'buildArgs: scheme'
  )
  setting.appendInput(
    'mini-ios.buildArgs.exportOptionPlistPath',
    json['mini-ios'].buildArgs.exportOptionPlistPath,
    'buildArgs: exportOptionPlistPath'
  )
}
