import Store from 'licia/Store'
import I18n from 'licia/I18n'

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
    'miniapp.title': 'Miniapp Project',
  },
  'zh-cn': {
    'miniapp.title': '多端应用',
  },
})
