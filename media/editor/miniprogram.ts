import LunaSetting from 'luna-setting'
import safeSet from 'licia/safeSet'
import { updateText, i18n, buildSettings, def, getSpace, setI18n } from './util'
import splitPath from 'licia/splitPath'

setI18n(
  {
    projectTitle: ['Miniprogram Project Config', '小程序项目配置文件'],
    projectPrivateTitle: [
      'Miniprogram Private Project Config',
      '小程序项目私有配置文件',
    ],
    projectMiniprogramRootDesc: [
      'Specifies the directory (a relative path) of the Mini Program source code.',
      '指定小程序源码的目录(需为相对路径)。',
    ],
    projectQcloudRootDesc: [
      'Specifies the directory (a relative path) of the Tencent Cloud project.',
      '指定腾讯云项目的目录(需为相对路径)。',
    ],
    projectPluginRootDesc: [
      'Specifies the directory (a relative path) of the plug-in project.',
      '指定插件项目的目录(需为相对路径)。',
    ],
    projectCloudbaseRootDesc: '云开发代码根目录(需为相对路径)。',
    projectCloudfunctionRootDesc: '云函数代码根目录(需为相对路径)。',
    projectCloudfunctionTemplateRootDesc:
      '云函数本地调试请求模板的根目录(需为相对路径)。',
    projectCloudcontainerRootDesc: '云托管代码根目录(需为相对路径)。',
    projectCompileTypeDesc: ['Compilation type.', '编译类型。'],
    projectLibVersionDesc: ['Base library version.', '基础库版本。'],
    projectProjectNameDesc: [
      'Project name, which is **required only when a new project is created**.',
      '项目名字。',
    ],
    projectAppIdDesc: [
      "Project's AppID, which is **required only when a new project is created**.",
      '项目的 `appid`。',
    ],
    projectConditionDesc: '编译条件。',
    projectPackOptionsDesc: '打包配置选项。',
    projectDebugOptionsDesc: '调试配置选项。',
    projectWatchOptionsDesc: '文件监听配置设置。',
    projectSettingDesc: '项目的编译设置，可以指定以下设置。',
    projectSettingConditionDesc:
      '启用[条件编译](https://dev.weixin.qq.com/docs/framework/dev/framework/operation/condition-compile.html)。',
    projectEs6Desc: '是否启用 es6 转 es5。',
    projectEnhanceDesc: '是否打开增强编译。',
    projectPostcssDesc: '上传代码时样式是否自动补全。',
    projectMinifiedDesc: '上传代码时是否自动压缩脚本文件。',
    projectMinifyWXSSDesc: '上传代码时是否自动压缩样式文件。',
    projectMinifyWXMLDesc: '上传代码时是否自动压缩 WXML 文件。',
    projectUglifyFileNameDesc: '上传时进行代码保护。',
    projectIgnoreUploadUnusedFilesDesc: '上传时是否过滤无依赖文件。',
    projectAutoAuditsDesc: '是否自动运行体验评分。',
    projectUrlCheckDesc: '是否检查安全域名和 TLS 版本。',
    projectCompileHotReLoadDesc: '是否开启文件保存后自动热重载。',

    appTitle: ['Miniprogram App Config', '小程序全局配置'],
    appEntryPagePathDesc: [
      'Mini Program default start home page.',
      '小程序默认启动首页。',
    ],
    appDebug: [
      'Whether or not to open debug Mode, off by default.',
      '是否开启 debug 模式，默认关闭。',
    ],

    miniappTitle: ['Miniapp Project', '多端应用配置'],
    miniappRunArgs: ['Run Args', '运行时参数'],
    miniappBuildArgs: ['Build Args', '构建产物时参数'],
    miniappUseProjectTemplateDesc: '标记终端工程是否由终端模板工程生成。',
    miniappProjectPathDesc: '终端工程的路径。',
    miniappArchivePathDesc:
      '指定模块代码包同步到终端工程的目录。对于模板终端工程，只有一个模块的情况，这个路径不需要修改。对于多模块的项目，不同的模块可以指定不同的目录。',
    miniappBuildArchiveEverytimeDesc:
      '指定每次构建或运行终端工程时都需要编译小程序模块资源包。',
    miniappRunArgsDesc:
      '运行时使用的[编译参数配置](https://dev.weixin.qq.com/docs/framework/dev/framework/operation/project-intro.html#编译参数配置)。',
    miniappBuildArgsDesc:
      '构建产物时使用的[编译参数配置](https://dev.weixin.qq.com/docs/framework/dev/framework/operation/project-intro.html#编译参数配置)。',
    miniappMainActivityDesc:
      '仅在 runArgs 下必填。运行后 Android 的入口 Activity。对于模板终端工程，无需改动；对于自有终端工程，需要手动配置。',
    miniappVariantDesc:
      '构建变体，[详见](https://developer.android.com/studio/build/build-variants)。',
    miniappSchemeDesc:
      '[目标、配置以及要执行的测试集合的名字](https://developer.apple.com/library/archive/featuredarticles/XcodeConcepts/Concept-Schemes.html)。',
    miniappExportOptionPlistPathDesc:
      '仅在 buildArgs 下必填。编译 ipa 时需要用到的ExportOption.plist 文件, 可以自定义配置路径，支持相对和绝对路径。',
  },
  'miniprogram.'
)

function t(path: string) {
  return i18n.t(`miniprogram.${path}`)
}

export default function handler(
  setting: LunaSetting,
  fileName: string,
  text: string
) {
  const { name } = splitPath(fileName)

  switch (name) {
    case 'project.config.json':
      project(setting, text)
      break
    case 'project.private.config.json':
      project(setting, text, true)
      break
    case 'project.miniapp.json':
      miniapp(setting, text)
      break
    case 'app.json':
      app(setting, text)
      break
    default:
      page(setting, text)
      break
  }
}

function project(setting: LunaSetting, text: string, isPrivate = false) {
  const json = JSON.parse(text)
  setting.on('change', (key, val) => {
    safeSet(json, key, val)
    updateText(JSON.stringify(json, null, getSpace()))
  })

  const staticServerOptions = json.staticServerOptions || {}
  const scripts = json.scripts || {}
  const settings = json.setting || {}

  buildSettings(setting, [
    ['title', isPrivate ? t('projectPrivateTitle') : t('projectTitle')],
    [
      'markdown',
      i18n.t('seeDoc', {
        url: 'https://developers.weixin.qq.com/miniprogram/dev/devtools/projectconfig.html',
      }),
    ],
  ])

  if (!isPrivate) {
    buildSettings(setting, [
      [
        'path',
        'miniprogramRoot',
        def(json.miniprogramRoot, ''),
        'Miniprogram Root',
        t('projectMiniprogramRootDesc'),
        {
          folder: true,
          file: false,
        },
      ],
      [
        'path',
        'qcloudRoot',
        def(json.qcloudRoot, ''),
        'Qcloud Root',
        t('projectQcloudRootDesc'),
        {
          folder: true,
          file: false,
        },
      ],
      [
        'path',
        'pluginRoot',
        def(json.pluginRoot, ''),
        'Plugin Root',
        t('projectPluginRootDesc'),
        {
          folder: true,
          file: false,
        },
      ],
      [
        'path',
        'cloudbaseRoot',
        def(json.cloudbaseRoot, ''),
        'Cloudbase Root',
        t('projectCloudbaseRootDesc'),
        {
          folder: true,
          file: false,
        },
      ],
      [
        'path',
        'cloudfunctionRoot',
        def(json.cloudfunctionRoot, ''),
        'Cloudfunction Root',
        t('projectCloudfunctionRootDesc'),
        {
          folder: true,
          file: false,
        },
      ],
      [
        'path',
        'cloudfunctionTemplateRoot',
        def(json.cloudfunctionTemplateRoot, ''),
        'Cloudfunction Template Root',
        t('projectCloudfunctionTemplateRootDesc'),
        {
          folder: true,
          file: false,
        },
      ],
      [
        'path',
        'cloudcontainerRoot',
        def(json.cloudcontainerRoot, ''),
        'Cloudcontainer Root',
        t('projectCloudcontainerRootDesc'),
        {
          folder: true,
          file: false,
        },
      ],
      [
        'select',
        'compileType',
        json.compileType,
        'Compile Type',
        t('projectCompileTypeDesc'),
        {
          Miniprogram: 'miniprogram',
          Plugin: 'plugin',
        },
      ],
      ['text', 'appid', def(json.appid, ''), 'App Id', t('projectAppIdDesc')],
    ])
  }

  buildSettings(setting, [
    [
      'text',
      'libVersion',
      def(json.libVersion, ''),
      'Lib Version',
      t('projectLibVersionDesc'),
    ],
    [
      'text',
      'projectname',
      def(json.projectname, ''),
      'Project Name',
      t('projectProjectNameDesc'),
    ],
    ['complex', 'condition', 'Condition', t('projectConditionDesc')],
  ])

  if (!isPrivate) {
    buildSettings(setting, [
      ['complex', 'packOptions', 'Pack Options', t('projectPackOptionsDesc')],
      [
        'complex',
        'debugOptions',
        'Debug Options',
        t('projectDebugOptionsDesc'),
      ],
      [
        'complex',
        'watchOptions',
        'Watch Options',
        t('projectWatchOptionsDesc'),
      ],
    ])
  }

  buildSettings(setting, [
    ['title', 'Setting'],
    ['markdown', t('projectSettingDesc')],
  ])

  if (!isPrivate) {
    buildSettings(setting, [
      [
        'checkbox',
        'setting.condition',
        def(settings.condition, false),
        'Condition',
        t('projectSettingConditionDesc'),
      ],
      [
        'checkbox',
        'setting.es6',
        def(settings.es6, false),
        'ES6',
        t('projectEs6Desc'),
      ],
      [
        'checkbox',
        'setting.enhance',
        def(settings.enhance, false),
        'Enhance',
        t('projectEnhanceDesc'),
      ],
      [
        'checkbox',
        'setting.postcss',
        def(settings.postcss, true),
        'Postcss',
        t('projectPostcssDesc'),
      ],
      [
        'checkbox',
        'setting.minified',
        def(settings.minified, true),
        'Minified',
        t('projectMinifiedDesc'),
      ],
      [
        'checkbox',
        'setting.minifyWXSS',
        def(settings.minifyWXSS, false),
        'Minify WXSS',
        t('projectMinifyWXSSDesc'),
      ],
      [
        'checkbox',
        'setting.minifyWXML',
        def(settings.minifyWXML, false),
        'Minify WXML',
        t('projectMinifyWXMLDesc'),
      ],
      [
        'checkbox',
        'setting.uglifyFileName',
        def(settings.uglifyFileName, false),
        'Uglify File Name',
        t('projectUglifyFileNameDesc'),
      ],
      [
        'checkbox',
        'setting.ignoreUploadUnusedFiles',
        def(settings.ignoreUploadUnusedFiles, true),
        'Ignore Upload Unused Files',
        t('projectIgnoreUploadUnusedFilesDesc'),
      ],
    ])
  }

  buildSettings(setting, [
    [
      'checkbox',
      'setting.autoAudits',
      def(settings.autoAudits, false),
      'Auto Audits',
      t('projectAutoAuditsDesc'),
    ],
    [
      'checkbox',
      'setting.urlCheck',
      def(settings.urlCheck, true),
      'Url Check',
      t('projectUrlCheckDesc'),
    ],
    [
      'checkbox',
      'setting.compileHotReLoad',
      def(settings.compileHotReLoad, false),
      'Compile Hot Reload',
      t('projectCompileHotReLoadDesc'),
    ],
    [
      'checkbox',
      'setting.preloadBackgroundData',
      def(settings.preloadBackgroundData, false),
      'Preload Background Data',
      '小程序加载时是否数据预拉取。',
    ],
    [
      'checkbox',
      'setting.lazyloadPlaceholderEnable',
      def(settings.lazyloadPlaceholderEnable, false),
      'lazyloadPlaceholderEnable',
      '是否启用懒注入占位组件调试。',
    ],
    [
      'checkbox',
      'setting.useStaticServer',
      def(settings.useStaticServer, false),
      'Use Static Server',
      '是否开启静态资源服务器，需要和 `staticServerOptions` 配合使用。',
    ],
    [
      'checkbox',
      'setting.bigPackageSizeSupport',
      def(settings.bigPackageSizeSupport, false),
      'Big Package Size Support',
      '预览及真机调试的时主包、分包体积上限调整为4M（小程序）、8M（小游戏）。',
    ],
  ])

  if (!isPrivate) {
    buildSettings(setting, [
      [
        'complex',
        'setting.babelSetting',
        'Babel Setting',
        '增强编译下 Babel 的配置项。',
      ],
      [
        'complex',
        'setting.useCompilerPlugins',
        'Use Compiler Plugins',
        '编译插件配置。',
      ],
      [
        'checkbox',
        'setting.disableUseStrict',
        def(settings.disableUseStrict, false),
        'Disable Use Strict',
        '将 JS 编译成 ES5 时，是否禁用严格模式。',
      ],
      [
        'checkbox',
        'setting.uploadWithSourceMap',
        def(settings.uploadWithSourceMap, true),
        'Upload With Source Map',
        '上传时是否带上 sourcemap（默认为true）。',
      ],
      [
        'checkbox',
        'setting.localPlugins',
        def(settings.localPlugins, false),
        'Local Plugins',
        '在小游戏插件项目中，是否启用 “以本地目录为插件资源来源” 特性。',
      ],
      [
        'checkbox',
        'setting.packNpmManually',
        def(settings.packNpmManually, false),
        'Pack Npm Manually',
        '是否手动配置构建 npm 的路径。',
      ],
      [
        'complex',
        'setting.packNpmRelationList',
        'Pack Npm Relation List',
        '仅 `packNpmManually` 为 true 时生效，详细参考构建 [npm 文档](https://developers.weixin.qq.com/minigame/dev/devtools/npm.html)。',
      ],
    ])
  }

  buildSettings(setting, [
    [
      'checkbox',
      'setting.coverView',
      def(settings.coverView, true),
      'Cover View',
      '是否使用工具渲染 CoverView。',
    ],
    [
      'checkbox',
      'setting.ignoreDevUnusedFiles',
      def(settings.ignoreDevUnusedFiles, true),
      'Ignore Dev Unused Files',
      '预览、真机调试和本地模拟器等开发阶段是否过滤无依赖文件（默认为true）。',
    ],
    [
      'checkbox',
      'setting.checkInvalidKey',
      def(settings.checkInvalidKey, false),
      'Check Invalid Key',
      '是否展示 JSON 文件校验错误信息。',
    ],
    [
      'checkbox',
      'setting.showShadowRootInWxmlPanel',
      def(settings.showShadowRootInWxmlPanel, true),
      'Show Shadow Root In Wxml Panel',
      '是否开启调试器 WXML 面板展示 shadow-root。',
    ],
    [
      'checkbox',
      'setting.useIsolateContext',
      def(settings.useIsolateContext, true),
      'Use Isolate Context',
      '是否开启小程序独立域调试特性。',
    ],
    [
      'checkbox',
      'setting.useMultiFrameRuntime',
      def(settings.useMultiFrameRuntime, true),
      'Use Multi Frame Runtime',
      '是否开启模拟器预先载入小程序的某些资源。此设定为 false 时会导致 `useIsolateContext` 失效。',
    ],
    [
      'checkbox',
      'setting.useApiHook',
      def(settings.useApiHook, false),
      'Use Api Hook',
      '是否启用 API Hook 功能。',
    ],
    [
      'checkbox',
      'setting.useApiHostProcess',
      def(settings.useApiHostProcess, true),
      'Use Api Host Process',
      '是否在额外的进程处理一些小程序 API。',
    ],
    [
      'checkbox',
      'setting.useLanDebug',
      def(settings.useLanDebug, false),
      'Use Lan Debug',
      '仅在小游戏有效，是否开启局域网调试服务器。',
    ],
    [
      'checkbox',
      'setting.enableEngineNative',
      def(settings.enableEngineNative, false),
      'Enable Engine Native',
      '是否在游戏引擎项目中开启支持引用 node 原生模块的底层加速特性。',
    ],
    [
      'checkbox',
      'setting.showES6CompileOption',
      def(settings.showES6CompileOption, false),
      'Show ES6 Compile Option',
      '是否在本地设置中展示传统的 ES6 转 ES5 开关（对应 es6），增强编译开关 （对应 enhance）。',
    ],
  ])

  if (!isPrivate) {
    buildSettings(setting, [
      ['title', 'Scripts'],
      ['markdown', '指定自定义预处理的命令。'],
      [
        'text',
        'scripts.beforeCompile',
        def(scripts.beforeCompile, ''),
        'Before Compile',
        '编译前预处理命令。',
      ],
      [
        'text',
        'scripts.beforePreview',
        def(scripts.beforePreview, ''),
        'Before Preview',
        '预览前预处理命令。',
      ],
      [
        'text',
        'scripts.beforeUpload',
        def(scripts.beforeUpload, ''),
        'Before Upload',
        '上传前预处理命令。',
      ],
      ['title', 'Static Server Options'],
      ['markdown', '小游戏项目本地静态资源服务器配置。'],
      [
        'path',
        'staticServerOptions.servePath',
        def(staticServerOptions.servePath, ''),
        'Serve Path',
        '路径（需要是相对路径）。',
      ],
    ])
  }
}

function app(setting: LunaSetting, text: string) {
  const json = JSON.parse(text)
  setting.on('change', (key, val) => {
    safeSet(json, key, val)

    updateText(JSON.stringify(json, null, getSpace()) + '\n')
  })

  const window = json.window || {}
  const networkTimeout = json.networkTimeout || {}
  const halfPage = json.halfPage || {}
  const debugOptions = json.debugOptions || {}

  buildSettings(setting, [
    ['title', t('appTitle')],
    [
      'markdown',
      i18n.t('seeDoc', {
        url: 'https://developers.weixin.qq.com/miniprogram/dev/reference/configuration/app.html',
      }),
    ],
    [
      'text',
      'entryPagePath',
      json.entryPagePath || '',
      'Entry Page Path',
      t('appEntryPagePathDesc'),
    ],
    ['complex', 'pages', 'Pages', '页面路径列表。'],
    ['complex', 'tabBar', 'Tab Bar', '底部 `tab` 栏的表现。'],
    ['checkbox', 'debug', def(json.debug, false), 'Debug', t('appDebug')],
    [
      'complex',
      'functionalPages',
      'Functional Pages',
      '是否启用插件功能页，默认关闭。',
    ],
    ['complex', 'subpackages', 'Sub Packages', '分包结构配置。'],
    [
      'path',
      'workers',
      def(json.workers, ''),
      'Workers',
      '`Worker` 代码放置的目录。',
      {
        folder: true,
        file: false,
      },
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
      def(json.resizable, false),
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
      'text',
      'style',
      def(json.style, ''),
      'Style',
      '指定使用升级后的 weui 样式。',
    ],
    ['complex', 'useExtendedLib', 'Use Extended Lib', '指定需要引用的扩展库。'],
    [
      'checkbox',
      'darkmode',
      def(json.darkmode, false),
      'Dark Mode',
      '小程序支持 DarkMode。',
    ],
    [
      'path',
      'themeLocation',
      def(json.themeLocation, ''),
      'Theme Location',
      '指明 theme.json 的位置，darkmode 为 true 为必填。',
      {
        extensions: ['json'],
      },
    ],
    [
      'text',
      'lazyCodeLoading',
      def(json.lazyCodeLoading, ''),
      'Lazy Code Loading',
      '配置自定义组件代码按需注入。',
    ],
    ['complex', 'singlePage', 'Singe Page', '单页模式相关配置。'],
    [
      'complex',
      'supportedMaterials',
      'Supported Materials',
      '[聊天素材小程序打开](https://developers.weixin.qq.com/miniprogram/dev/framework/material/support_material.html)相关配置。',
    ],
    [
      'text',
      'serviceProviderTicket',
      def(json.serviceProviderTicket, ''),
      'Sercvice Provider Ticket',
      '[定制化型服务商](https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/operation/thirdparty/customized_service_platform_guidelines.html)票据。',
    ],
    [
      'complex',
      'embeddedAppIdList',
      'Embedded App Id List',
      '半屏小程序 appId。',
    ],
    [
      'complex',
      'enablePassiveEvent',
      'Enable Passive Event',
      'touch 事件监听是否为 passive。',
    ],
    ['complex', 'resolveAlias', 'Resolve Alias', '自定义模块映射规则。'],
    [
      'select',
      'renderer',
      def(json.renderer, 'webview'),
      'Renderer',
      '全局默认的渲染后端。',
      {
        webview: 'webview',
        skyline: 'skyline',
      },
    ],
    ['title', 'Window'],
    ['markdown', '用于设置小程序的状态栏、导航条、标题、窗口背景色。'],
    ...commonWindow(window, 'window.'),
    ['title', 'Network Timeout'],
    ['markdown', '各类网络请求的超时时间，单位均为毫秒。'],
    [
      'number',
      'networkTimeout.request',
      def(networkTimeout.request, 60000),
      'Request',
      '[wx.request](https://developers.weixin.qq.com/miniprogram/dev/api/network/request/wx.request.html) 的超时时间，单位：毫秒。',
      {
        min: 0,
      },
    ],
    [
      'number',
      'networkTimeout.connectSocket',
      def(networkTimeout.connectSocket, 60000),
      'Connect Socket',
      '[wx.connectSocket](https://developers.weixin.qq.com/miniprogram/dev/api/network/websocket/wx.connectSocket.html) 的超时时间，单位：毫秒。',
      {
        min: 0,
      },
    ],
    [
      'number',
      'networkTimeout.uploadFile',
      def(networkTimeout.uploadFile, 60000),
      'Upload File',
      '[wx.uploadFile](https://developers.weixin.qq.com/miniprogram/dev/api/network/upload/wx.uploadFile.html) 的超时时间，单位：毫秒。',
      {
        min: 0,
      },
    ],
    [
      'number',
      'networkTimeout.downloadFile',
      def(networkTimeout.downloadFile, 60000),
      'Download File',
      '[wx.downloadFile](https://developers.weixin.qq.com/miniprogram/dev/api/network/download/wx.downloadFile.html) 的超时时间，单位：毫秒。',
      {
        min: 0,
      },
    ],
    ['title', 'Half Page'],
    ['markdown', '视频号直播半屏场景设置。'],
    [
      'select',
      'halfPage.firstPageNavigationStyle',
      def(halfPage.firstPageNavigationStyle, 'default'),
      'First Page Navigation Style',
      '视频号直播打开的第一个页面的全屏状态使用自定义顶部，支持 `default` / `custom`。',
      {
        Default: 'default',
        Custom: 'custom',
      },
    ],
    ['title', 'Debug Options'],
    ['markdown', '调试相关配置'],
    [
      'checkbox',
      'debugOptions.enableFPSPanel',
      def(debugOptions.enableFPSPanel, false),
      'Enable FPS Panel',
      '是否开启 [FPS 面板](https://developers.weixin.qq.com/miniprogram/dev/framework/performance/fps_panel.html)。',
    ],
  ])
}

function page(setting: LunaSetting, text: string) {
  const json = JSON.parse(text)
  setting.on('change', (key, val) => {
    safeSet(json, key, val)
    updateText(JSON.stringify(json, null, getSpace()) + '\n')
  })

  buildSettings(setting, [
    ['title', '页面配置'],
    [
      'markdown',
      i18n.t('seeDoc', {
        url: 'https://developers.weixin.qq.com/miniprogram/dev/reference/configuration/page.html',
      }),
    ],
    ...commonWindow(json),
    [
      'checkbox',
      'disableScroll',
      def(json.disableScroll, false),
      'Disable Scroll',
      '设置为 `true` 则页面整体不能上下滚动。只在页面配置中有效，无法在 `app.json` 中设置。',
    ],
    [
      'complex',
      'usingComponents',
      'Using Components',
      '页面[自定义组件](https://developers.weixin.qq.com/miniprogram/dev/framework/custom-component/)配置。',
    ],
    [
      'text',
      'style',
      def(json.style, 'default'),
      'Style',
      '启用新版的组件样式。',
    ],
    ['complex', 'singlePage', 'Singe Page', '单页模式相关配置。'],
    [
      'complex',
      'enablePassiveEvent',
      'Enable Passive Event',
      '事件监听是否为 passive，若对页面单独设置则会覆盖全局的配置，详见 [全局配置](https://developers.weixin.qq.com/miniprogram/dev/reference/configuration/app.html)。',
    ],
    [
      'select',
      'renderer',
      def(json.renderer, 'webview'),
      'Renderer',
      '全局默认的渲染后端。',
      {
        webview: 'webview',
        skyline: 'skyline',
      },
    ],
  ])
}

function commonWindow(window: any, prefix: string = '') {
  return [
    [
      'text',
      `${prefix}navigationBarBackgroundColor`,
      def(window.navigationBarBackgroundColor, '#000000'),
      'Navigation Bar Background Color',
      '导航栏背景颜色，如 `#000000`。',
    ],
    [
      'select',
      `${prefix}navigationBarTextStyle`,
      def(window.navigationBarTextStyle, 'white'),
      'Navigation Bar Text Style',
      '导航栏标题颜色，仅支持 `black` / `white`。',
      {
        White: 'white',
        Black: 'black',
      },
    ],
    [
      'text',
      `${prefix}navigationBarTitleText`,
      def(window.navigationBarTitleText, ''),
      'Navigation Bar Title Text',
      '导航栏标题文字内容。',
    ],
    [
      'select',
      `${prefix}navigationStyle`,
      def(window.navigationStyle, 'default'),
      'Navigation Style',
      '导航栏样式，仅支持以下值：\n\ndefault 默认样式\n\ncustom 自定义导航栏，只保留右上角胶囊按钮',
      {
        Default: 'default',
        Custom: 'custom',
      },
    ],
    [
      'checkbox',
      `${prefix}homeButton`,
      def(window.homeButton, false),
      'Home Button',
      '在非首页、非页面栈最底层页面或非 tabbar 内页面中的导航栏展示 home 键。',
    ],
    [
      'text',
      `${prefix}backgroundColor`,
      def(window.backgroundColor, '#ffffff'),
      'Background Color',
      '窗口的背景色。',
    ],
    [
      'select',
      `${prefix}backgroundTextStyle`,
      def(window.backgroundTextStyle, 'dark'),
      'Background Text Style',
      '下拉 loading 的样式，仅支持 `dark` / `light`。',
      {
        Dark: 'dark',
        Light: 'light',
      },
    ],
    [
      'text',
      `${prefix}backgroundColorTop`,
      def(window.backgroundColorTop, '#ffffff'),
      'Background Color Top',
      '顶部窗口的背景色，仅 iOS 支持。',
    ],
    [
      'text',
      `${prefix}backgroundColorBottom`,
      def(window.backgroundColorBottom, '#ffffff'),
      'Background Color Bottom',
      '底部窗口的背景色，仅 iOS 支持。',
    ],
    [
      'checkbox',
      `${prefix}.enablePullDownRefresh`,
      def(window.enablePullDownRefresh, false),
      'Enable Pull Down Refresh',
      '是否开启当前页面下拉刷新，详见 [Page.onPullDownRefresh](https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#onpulldownrefresh)。',
    ],
    [
      'number',
      `${prefix}onReachBottomDistance`,
      def(window.onReachBottomDistance, 50),
      'On Reach Bottom Distance',
      '页面上拉触底事件触发时距页面底部距离，单位为px，详见 [Page.onReachBottom](https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#onreachbottom)。',
      {
        min: 0,
      },
    ],
    [
      'select',
      `${prefix}pageOrientation`,
      def(window.pageOrientation, 'portrait'),
      'Page Orientation',
      '屏幕旋转设置，支持 `auto` / `portrait` / `landscape`，详见 [响应显示区域变化](https://developers.weixin.qq.com/miniprogram/dev/framework/view/resizable.html)。',
      {
        Auto: 'auto',
        Portrait: 'portrait',
        Landscape: 'landscape',
      },
    ],
    [
      'select',
      `${prefix}initialRenderingCache`,
      def(window.initialRenderingCache, ''),
      'Initial Rendering Cache',
      '页面[初始渲染缓存](https://developers.weixin.qq.com/miniprogram/dev/framework/view/initial-rendering-cache.html)配置，支持 `static` / `dynamic`。',
      {
        None: '',
        Static: 'static',
        Dynamic: 'dynamic',
      },
    ],
    [
      'text',
      `${prefix}restartStrategy`,
      def(window.restartStrategy, 'homePage'),
      'Restart Strategy',
      '重新启动策略配置。',
    ],
    [
      'checkbox',
      `${prefix}handleWebviewPreload`,
      def(window.handleWebviewPreload, 'static'),
      'Handle Webview Preload',
      '控制预加载下个页面的时机，支持 `static` / `manual` / `auto`。',
      {
        Static: 'static',
        Manual: 'manual',
        Auto: 'auto',
      },
    ],
    [
      'select',
      `${prefix}visualEffectInBackground`,
      def(window.visualEffectInBackground, 'none'),
      'Visual Effect in Background',
      '切入系统后台时，隐藏页面内容，保护用户隐私。支持 `hidden` / `none`，若对页面单独设置则会覆盖全局的配置，详见 [全局配置](https://developers.weixin.qq.com/miniprogram/dev/reference/configuration/app.html)。',
      {
        None: 'none',
        Hidden: 'hidden',
      },
    ],
  ]
}

function miniapp(setting: LunaSetting, text: string) {
  const json = JSON.parse(text)
  setting.on('change', (key, val) => {
    safeSet(json, key, val)

    updateText(JSON.stringify(json, null, getSpace()) + '\n')
  })

  const android = json['mini-android'] || {}
  const ios = json['mini-ios'] || {}

  buildSettings(setting, [
    ['title', t('miniappTitle')],
    [
      'markdown',
      i18n.t('seeDoc', {
        url: 'https://dev.weixin.qq.com/docs/framework/dev/framework/operation/project-intro.html#project-miniapp-json',
      }),
    ],
    [
      'text',
      'version',
      json.version,
      'Version',
      '`project.miniapp.json` 的版本号。',
    ],
    [
      'text',
      'description',
      json.description,
      'Description',
      '`project.miniapp.json` 的描述说明。',
    ],
    [
      'text',
      'miniModuleId',
      json.miniModuleId,
      'Mini Module Id',
      '开发平台上申请的模块 ID。',
    ],
    ['text', 'name', json.name, 'Name', '应用名称。'],
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
      t('miniappUseProjectTemplateDesc'),
    ],
    [
      'path',
      'mini-android.projectPath',
      android.projectPath,
      'Project Path',
      t('miniappUseProjectTemplateDesc'),
    ],
    [
      'text',
      'mini-android.archivePath',
      android.archivePath,
      'Archive Path',
      t('miniappArchivePathDesc'),
    ],
    [
      'checkbox',
      'mini-android.buildArchiveEverytime',
      android.buildArchiveEverytime,
      'Build Archive Everytime',
      t('miniappBuildArchiveEverytimeDesc'),
    ],
    ['title', t('miniappRunArgs'), 2],
    ['markdown', t('miniappRunArgsDesc')],
    [
      'text',
      'mini-android.runArgs.mainActivity',
      android.runArgs.mainActivity,
      'Main Activity',
      t('miniappMainActivityDesc'),
    ],
    [
      'select',
      'mini-android.runArgs.variant',
      android.runArgs.variant,
      'Variant',
      t('miniappVariantDesc'),
      {
        ArmRelease: 'ArmRelease',
        ArmDebug: 'ArmDebug',
      },
    ],
    ['title', t('miniappBuildArgs'), 2],
    ['markdown', t('miniappBuildArgsDesc')],
    [
      'text',
      'mini-android.buildArgs.mainActivity',
      android.buildArgs.mainActivity,
      'Main Activity',
      t('miniappMainActivityDesc'),
    ],
    [
      'select',
      'mini-android.buildArgs.variant',
      android.buildArgs.variant,
      'Variant',
      t('miniappVariantDesc'),
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
      t('miniappUseProjectTemplateDesc'),
    ],
    [
      'path',
      'mini-ios.projectPath',
      ios.projectPath,
      'Project Path',
      t('miniappUseProjectTemplateDesc'),
    ],
    [
      'text',
      'mini-ios.archivePath',
      ios.archivePath,
      'Archive Path',
      t('miniappArchivePathDesc'),
    ],
    [
      'checkbox',
      'mini-ios.buildArchiveEverytime',
      ios.buildArchiveEverytime,
      'Build Archive Everytime',
      t('miniappBuildArchiveEverytimeDesc'),
    ],
    ['title', t('miniappRunArgs'), 2],
    ['markdown', t('miniappRunArgsDesc')],
    [
      'text',
      'mini-ios.runArgs.scheme',
      ios.runArgs.scheme,
      'Scheme',
      t('miniappSchemeDesc'),
    ],
    ['title', t('miniappBuildArgs'), 2],
    ['markdown', t('miniappBuildArgsDesc')],
    [
      'text',
      'mini-ios.buildArgs.scheme',
      ios.buildArgs.scheme,
      'Scheme',
      t('miniappSchemeDesc'),
    ],
    [
      'path',
      'mini-ios.buildArgs.exportOptionPlistPath',
      ios.buildArgs.exportOptionPlistPath,
      'Export Option Plist Path',
      t('miniappExportOptionPlistPathDesc'),
    ],
  ])
}
