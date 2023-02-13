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

  buildSettings(setting, [
    ['title', 'Miniprogram Project'],
    ['input', 'appid', json.appid || '', 'AppId'],
    [
      'input',
      'miniprogramRoot',
      json.miniprogramRoot || '',
      'Miniprogram Root',
    ],
    [
      'select',
      'compileType',
      json.compileType,
      'Compile Type',
      {
        Miniprogram: 'miniprogram',
        Plugin: 'plugin',
      },
    ],
    ['title', 'Setting', 2],
    [
      'checkbox',
      'setting.ignoreUploadUnusedFiles',
      json.setting.ignoreUploadUnusedFiles,
      'Ignore unuse files automatically when uploading code.',
    ],
  ])
}

function app(setting: LunaSetting, text: string) {
  const json = JSON.parse(text)
  setting.on('change', (key, val) => {
    safeSet(json, key, val)

    updateText(JSON.stringify(json, null, 2) + '\n')
  })

  const window = json.window || {}

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
    ['complex', 'pages', 'Pages', '页面路径列表。'],
    [
      'checkbox',
      'debug',
      !!json.debug,
      'Debug',
      i18n.t('miniprogram.appDebug'),
    ],
    [
      'checkbox',
      'functionalPages',
      !!json.functionalPages,
      'Functional Pages',
      '是否启用插件功能页，默认关闭。',
    ],
    ['complex', 'subpackages', 'Sub Packages', '分包结构配置。'],
    [
      'input',
      'workers',
      json.workers || '',
      'Workers',
      '`Worker` 代码放置的目录。',
    ],
    [
      'complex',
      'requiredBackgroundModes',
      'Required Background Modes',
      '需要在后台使用的能力，如「音乐播放」。',
    ],
    [
      'complex',
      'requiredPrivateInfos',
      'Required Private Infos',
      '调用的地理位置相关隐私接口。',
    ],
    ['complex', 'plugins', 'Plugins', '使用到的插件。'],
    ['complex', 'preloadRule', 'Preload Rule', '分包预下载规则。'],
    [
      'checkbox',
      'resizable',
      !!json.resizable,
      'Resizable',
      'PC 小程序是否支持用户任意改变窗口大小（包括最大化窗口）；iPad 小程序是否支持屏幕旋转。默认关闭。',
    ],
    [
      'complex',
      'usingComponents',
      'Using Components',
      '全局[自定义组件](https://developers.weixin.qq.com/miniprogram/dev/framework/custom-component/)配置。',
    ],
    ['complex', 'permission', 'Permission', '小程序接口权限相关设置。'],
    [
      'input',
      'style',
      json.style || '',
      'Style',
      '指定使用升级后的 weui 样式。',
    ],
    ['complex', 'useExtendedLib', 'Use Extended Lib', '指定需要引用的扩展库。'],
    [
      'checkbox',
      'darkmode',
      !!json.darkmode,
      'Dark Mode',
      '小程序支持 DarkMode。',
    ],
    [
      'input',
      'themeLocation',
      json.themeLocation || '',
      'Theme Location',
      '指明 theme.json 的位置，darkmode 为 true 为必填。',
    ],
    [
      'input',
      'lazyCodeLoading',
      json.lazyCodeLoading || '',
      'Lazy Code Loading',
      '配置自定义组件代码按需注入。',
    ],
    [
      'select',
      'renderer',
      json.renderer || 'webview',
      'Renderer',
      '全局默认的渲染后端。',
      {
        webview: 'webview',
        skyline: 'skyline',
      },
    ],
    ['title', 'Window', 2],
    [
      'input',
      'navigationBarBackgroundColor',
      window.navigationBarBackgroundColor || '#000000',
      'Navigation Bar Background Color',
      '导航栏背景颜色，如 `#000000`。',
    ],
    [
      'input',
      'navigationBarTextStyle',
      window.navigationBarTextStyle || 'white',
      'Navigation Bar Text Style',
      '导航栏标题颜色，仅支持 `black` / `white`。',
    ],
  ])
}

function miniapp(setting: LunaSetting, text: string) {
  const json = JSON.parse(text)
  setting.on('change', (key, val) => {
    safeSet(json, key, val)

    updateText(JSON.stringify(json, null, 2) + '\n')
  })

  buildSettings(setting, [
    ['title', i18n.t('miniprogram.miniappTitle')],
    ['input', 'name', json.name, 'Name'],
    ['input', 'version', json.version, 'Version'],
    ['input', 'miniModuleId', json.miniModuleId, 'Mini Module Id'],
    ['input', 'description', json.description, 'Description'],
    ['input', 'icon', json.icon, 'Icon'],
    ['title', 'Android', 2],
    [
      'checkbox',
      'mini-android.useProjectTemplate',
      json['mini-android'].useProjectTemplate,
      'Use Project Template',
    ],
    [
      'input',
      'mini-android.projectPath',
      json['mini-android'].projectPath,
      'Project Path',
    ],
    [
      'input',
      'mini-android.archivePath',
      json['mini-android'].archivePath,
      'Archive Path',
    ],
    [
      'checkbox',
      'mini-android.buildArchiveEverytime',
      json['mini-android'].buildArchiveEverytime,
      'Build Archive Everytime',
    ],
    [
      'input',
      'mini-android.runArgs.mainActivity',
      json['mini-android'].runArgs.mainActivity,
      'runArgs: mainActivity',
    ],
    [
      'input',
      'mini-android.runArgs.variant',
      json['mini-android'].runArgs.variant,
      'runArgs: variant',
    ],
    [
      'input',
      'mini-android.buildArgs.mainActivity',
      json['mini-android'].buildArgs.mainActivity,
      'buildArgs: mainActivity',
    ],
    [
      'input',
      'mini-android.buildArgs.variant',
      json['mini-android'].buildArgs.variant,
      'buildArgs: variant',
    ],
    ['title', 'iOS', 2],
    [
      'checkbox',
      'mini-ios.useProjectTemplate',
      json['mini-ios'].useProjectTemplate,
      'Use Project Template',
    ],
    [
      'input',
      'mini-ios.projectPath',
      json['mini-ios'].projectPath,
      'Project Path',
    ],
    [
      'input',
      'mini-ios.archivePath',
      json['mini-ios'].archivePath,
      'Archive Path',
    ],
    [
      'checkbox',
      'mini-ios.buildArchiveEverytime',
      json['mini-ios'].buildArchiveEverytime,
      'Build Archive Everytime',
    ],
    [
      'input',
      'mini-ios.runArgs.scheme',
      json['mini-ios'].runArgs.scheme,
      'runArgs: scheme',
    ],
    [
      'input',
      'mini-ios.buildArgs.scheme',
      json['mini-ios'].buildArgs.scheme,
      'buildArgs: scheme',
    ],
    [
      'input',
      'mini-ios.buildArgs.exportOptionPlistPath',
      json['mini-ios'].buildArgs.exportOptionPlistPath,
      'buildArgs: exportOptionPlistPath',
    ],
  ])
}
