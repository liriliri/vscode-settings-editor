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
  'miniporgram.miniappSeeDoc':
    'Click [here](https://dev.weixin.qq.com/docs/framework/dev/framework/operation/project-intro.html#project-miniapp-json) to see the documentation.',
  'miniprogram.miniappRunArgs': 'Run Args',
  'miniprogram.miniappBuildArgs': 'Build Args',
})
i18n.set('zh-cn', {
  'miniprogram.appTitle': '小程序全局配置',
  'miniprogram.appSeeDoc':
    '点击[此处](https://developers.weixin.qq.com/miniprogram/dev/reference/configuration/app.html)查看文档。',
  'miniprogram.appEntryPagePathDesc': '小程序默认启动首页。',
  'miniprogram.appDebug': '是否开启 debug 模式，默认关闭。',

  'miniprogram.miniappTitle': '多端应用配置',
  'miniprogram.miniappSeeDoc':
    '点击[此处](https://dev.weixin.qq.com/docs/framework/dev/framework/operation/project-intro.html#project-miniapp-json)查看文档。',
  'miniprogram.miniappRunArgs': '运行时参数',
  'miniprogram.miniappBuildArgs': '构建产物时参数',
})

const all = {
  'miniprogram.miniappUseProjectTemplateDesc':
    '标记终端工程是否由终端模板工程生成。',
  'miniprogram.miniappProjectPathDesc': '终端工程的路径。',
  'miniprogram.miniappArchivePathDesc':
    '指定模块代码包同步到终端工程的目录。对于模板终端工程，只有一个模块的情况，这个路径不需要修改。对于多模块的项目，不同的模块可以指定不同的目录。',
  'miniprogram.miniappBuildArchiveEverytimeDesc':
    '指定每次构建或运行终端工程时都需要编译小程序模块资源包。',
  'miniprogram.miniappRunArgsDesc':
    '运行时使用的[编译参数配置](https://dev.weixin.qq.com/docs/framework/dev/framework/operation/project-intro.html#编译参数配置)。',
  'miniprogram.miniappBuildArgsDesc':
    '构建产物时使用的 [编译参数配置](https://dev.weixin.qq.com/docs/framework/dev/framework/operation/project-intro.html#编译参数配置)。',
  'miniprogram.miniappMainActivityDesc':
    '仅在 runArgs 下必填。运行后 Android 的入口 Activity。对于模板终端工程，无需改动；对于自有终端工程，需要手动配置。',
  'miniprogram.miniappVariantDesc':
    '构建变体，[详见](https://developer.android.com/studio/build/build-variants)。',
  'miniprogram.miniappSchemeDesc':
    '[目标、配置以及要执行的测试集合的名字](https://developer.apple.com/library/archive/featuredarticles/XcodeConcepts/Concept-Schemes.html)。',
  'miniprogram.miniappExportOptionPlistPathDesc':
    '仅在 buildArgs 下必填。编译 ipa 时需要用到的ExportOption.plist 文件, 可以自定义配置路径，支持相对和绝对路径。',
}
i18n.set('en', all)
i18n.set('zh-cn', all)

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
    ['title', 'Setting'],
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
    ['title', i18n.t('miniprogram.appTitle')],
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
    ['title', 'Window'],
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

  const android = json['mini-android'] || {}
  const ios = json['mini-ios'] || {}

  buildSettings(setting, [
    ['title', i18n.t('miniprogram.miniappTitle')],
    ['markdown', i18n.t('miniprogram.miniappSeeDoc')],
    [
      'input',
      'version',
      json.version,
      'Version',
      '`project.miniapp.json` 的版本号。',
    ],
    [
      'input',
      'description',
      json.description,
      'Description',
      '`project.miniapp.json` 的描述说明。',
    ],
    [
      'input',
      'miniModuleId',
      json.miniModuleId,
      'Mini Module Id',
      '开发平台上申请的模块 ID。',
    ],
    ['input', 'name', json.name, 'Name', '应用名称。'],
    [
      'path',
      'icon',
      json.icon,
      'Icon',
      '应用启动图标。',
      { extensions: ['png', 'jpg'] },
    ],
    ['title', 'Android'],
    [
      'checkbox',
      'mini-android.useProjectTemplate',
      android.useProjectTemplate,
      'Use Project Template',
      i18n.t('miniprogram.miniappUseProjectTemplateDesc'),
    ],
    [
      'path',
      'mini-android.projectPath',
      android.projectPath,
      'Project Path',
      i18n.t('miniprogram.miniappUseProjectTemplateDesc'),
    ],
    [
      'input',
      'mini-android.archivePath',
      android.archivePath,
      'Archive Path',
      i18n.t('miniprogram.miniappArchivePathDesc'),
    ],
    [
      'checkbox',
      'mini-android.buildArchiveEverytime',
      android.buildArchiveEverytime,
      'Build Archive Everytime',
      i18n.t('miniprogram.miniappBuildArchiveEverytimeDesc'),
    ],
    ['title', i18n.t('miniprogram.miniappRunArgs'), 2],
    ['markdown', i18n.t('miniprogram.miniappRunArgsDesc')],
    [
      'input',
      'mini-android.runArgs.mainActivity',
      android.runArgs.mainActivity,
      'Main Activity',
      i18n.t('miniprogram.miniappMainActivityDesc'),
    ],
    [
      'select',
      'mini-android.runArgs.variant',
      android.runArgs.variant,
      'Variant',
      i18n.t('miniprogram.miniappVariantDesc'),
      {
        ArmRelease: 'ArmRelease',
        ArmDebug: 'ArmDebug',
      },
    ],
    ['title', i18n.t('miniprogram.miniappBuildArgs'), 2],
    ['markdown', i18n.t('miniprogram.miniappBuildArgsDesc')],
    [
      'input',
      'mini-android.buildArgs.mainActivity',
      android.buildArgs.mainActivity,
      'Main Activity',
      i18n.t('miniprogram.miniappMainActivityDesc'),
    ],
    [
      'select',
      'mini-android.buildArgs.variant',
      android.buildArgs.variant,
      'Variant',
      i18n.t('miniprogram.miniappVariantDesc'),
      {
        ArmRelease: 'ArmRelease',
        ArmDebug: 'ArmDebug',
      },
    ],
    ['title', 'iOS'],
    [
      'checkbox',
      'mini-ios.useProjectTemplate',
      ios.useProjectTemplate,
      'Use Project Template',
      i18n.t('miniprogram.miniappUseProjectTemplateDesc'),
    ],
    [
      'path',
      'mini-ios.projectPath',
      ios.projectPath,
      'Project Path',
      i18n.t('miniprogram.miniappUseProjectTemplateDesc'),
    ],
    [
      'input',
      'mini-ios.archivePath',
      ios.archivePath,
      'Archive Path',
      i18n.t('miniprogram.miniappArchivePathDesc'),
    ],
    [
      'checkbox',
      'mini-ios.buildArchiveEverytime',
      ios.buildArchiveEverytime,
      'Build Archive Everytime',
      i18n.t('miniprogram.miniappBuildArchiveEverytimeDesc'),
    ],
    ['title', i18n.t('miniprogram.miniappRunArgs'), 2],
    ['markdown', i18n.t('miniprogram.miniappRunArgsDesc')],
    [
      'input',
      'mini-ios.runArgs.scheme',
      ios.runArgs.scheme,
      'Scheme',
      i18n.t('miniprogram.miniappSchemeDesc'),
    ],
    ['title', i18n.t('miniprogram.miniappBuildArgs'), 2],
    ['markdown', i18n.t('miniprogram.miniappBuildArgsDesc')],
    [
      'input',
      'mini-ios.buildArgs.scheme',
      ios.buildArgs.scheme,
      'Scheme',
      i18n.t('miniprogram.miniappSchemeDesc'),
    ],
    [
      'path',
      'mini-ios.buildArgs.exportOptionPlistPath',
      ios.buildArgs.exportOptionPlistPath,
      'Export Option Plist Path',
      i18n.t('miniprogram.miniappExportOptionPlistPathDesc'),
    ],
  ])
}
