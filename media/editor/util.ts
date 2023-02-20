import Store from 'licia/Store'
import I18n from 'licia/I18n'
import each from 'licia/each'
import isStr from 'licia/isStr'
import uniqId from 'licia/uniqId'

// @ts-ignore
export const vscode = acquireVsCodeApi()

class StateStore extends Store {
  constructor() {
    super(vscode.getState() || {})
  }
  save(data: any) {
    vscode.setState(data)
  }
}

export const store = new StateStore()

export function updateText(text: string) {
  if (text !== store.get('text')) {
    store.set('text', text)
    vscode.postMessage({ type: 'update', text })
  }
}

export const i18n = new I18n('en', {
  en: {
    browse: 'Browse',
    searchSettings: 'Search settings',
    seeDoc: 'Click [here]({{url}}) to see the documentation.',
    editIn: 'Edit in {{name}}',
  },
  'zh-cn': {
    browse: '浏览',
    searchSettings: '搜索设置',
    seeDoc: '点击[此处]({{url}})查看文档。',
    editIn: '在 {{name}} 中编辑',
  },
})

export function setI18n(lang: any, prefix = '') {
  const enLang: any = {}
  const zhCnLang: any = {}
  each(lang, (val: any, key: string) => {
    key = prefix + key
    if (isStr(val)) {
      enLang[key] = val
      zhCnLang[key] = val
    } else {
      const [en, zhCn] = val
      enLang[key] = en
      zhCnLang[key] = zhCn
    }
  })
  i18n.set('en', enLang)
  i18n.set('zh-cn', zhCnLang)
}

export function getSpace() {
  return store.get('space') || 2
}

export async function sendCommand(command: string, data: any): Promise<any> {
  const id = uniqId()
  return new Promise((resolve) => {
    function callback(event: any) {
      const message = event.data
      if (message.type === 'commandCallback') {
        const { id } = message
        if (message.id === id) {
          window.removeEventListener('message', callback)
          resolve(message.result)
        }
      }
    }
    window.addEventListener('message', callback)
    vscode.postMessage({ type: 'command', id, command, data })
  })
}
