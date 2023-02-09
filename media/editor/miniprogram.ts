import LunaSetting from 'luna-setting'
import safeSet from 'licia/safeSet'
import { updateText, i18n, buildSettings } from './util'
import splitPath from 'licia/splitPath'

i18n.set('en', {
  'miniprogram.appTitle': 'Miniprogram App Config',
  'miniprogram.appSeeDoc':
    'Click [here](https://developers.weixin.qq.com/miniprogram/en/dev/reference/configuration/app.html) to see the documentation.',
  'miniprogram.appEntryPagePathDesc': 'Mini Program default start home page.',
  'miniprogram.appDebug': 'Whether or not to open debug Mode, off by default.',

  'miniprogram.miniappTitle': 'Miniapp Project',
})
i18n.set('zh-cn', {
  'miniprogram.appTitle': '小程序全局配置',
  'miniprogram.appSeeDoc':
    '点击[此处](https://developers.weixin.qq.com/miniprogram/dev/reference/configuration/app.html)查看文档。',
  'miniprogram.appEntryPagePathDesc': '小程序默认启动首页。',
  'miniprogram.appDebug': '是否开启 debug 模式，默认关闭。',

  'miniprogram.miniappTitle': '多端应用',
})

export function handler(setting: LunaSetting, fileName: string, text: string) {
  const { name } = splitPath(fileName)

  switch (name) {
    case 'project.config.json':
      project(setting, text)
      return true
    case 'project.miniapp.json':
      miniapp(setting, text)
      return true
    case 'app.json':
      app(setting, text)
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

function app(setting: LunaSetting, text: string) {
  const json = JSON.parse(text)
  setting.on('change', (key, val) => {
    safeSet(json, key, val)

    updateText(JSON.stringify(json, null, 2) + '\n')
  })

  buildSettings(setting, [
    ['title', 'Miniprogram App Config'],
    ['markdown', i18n.t('miniprogram.appSeeDoc')],
    [
      'input',
      'entryPagePath',
      json.entryPagePath || '',
      'Entry Page Path',
      i18n.t('miniprogram.appEntryPagePathDesc'),
    ],
    [
      'checkbox',
      'debug',
      !!json.debug,
      'Debug',
      i18n.t('miniprogram.appDebug'),
    ],
  ])
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
