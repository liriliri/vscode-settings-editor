import LunaSetting from 'luna-setting'
import safeSet from 'licia/safeSet'
import { updateText, i18n } from './util'
import endWith from 'licia/endWith'

i18n.set('en', {
  'miniprogram.miniappTitle': 'Miniapp Project',
})
i18n.set('zh-cn', {
  'miniprogram.miniappTitle': '多端应用',
})

export function handler(setting: LunaSetting, fileName: string, text: string) {
  if (endWith(fileName, 'project.config.json')) {
    project(setting, text)
    return true
  } else if (endWith(fileName, 'project.miniapp.json')) {
    miniapp(setting, text)
    return true
  }
  return false
}

function project(setting: LunaSetting, text: string) {
  const json = JSON.parse(text)
  setting.on('change', (key, val) => {
    safeSet(json, key, val)

    updateText(JSON.stringify(json, null, 2) + '\n')
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

function miniapp(setting: LunaSetting, text: string) {
  const json = JSON.parse(text)
  setting.on('change', (key, val) => {
    safeSet(json, key, val)

    updateText(JSON.stringify(json, null, 2) + '\n')
  })

  setting.appendTitle(i18n.t('miniprogram.miniappTitle'))
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
