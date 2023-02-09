import Store from 'licia/Store'
import I18n from 'licia/I18n'
import LunaSetting from 'luna-setting'
import { micromark } from 'micromark'
import each from 'licia/each'

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
  en: {},
  'zh-cn': {},
})

export function appendMarkdown(setting: LunaSetting, markdown: string) {
  setting.appendHtml(
    `<div class="item-markdown markdown">${micromark(markdown)}</div>`
  )
}

export function buildSettings(setting: LunaSetting, config: any) {
  each(config, (value: any) => {
    const type = value.shift()
    switch (type) {
      case 'title':
        setting.appendTitle.apply(setting, value)
        break
      case 'markdown':
        appendMarkdown(setting, value[0])
        break
      case 'number':
        setting.appendNumber.apply(setting, value)
        break
      case 'checkbox':
        setting.appendCheckbox.apply(setting, value)
        break
      case 'select':
        setting.appendSelect.apply(setting, value)
        break
      case 'input':
        setting.appendInput.apply(setting, value)
        break
    }
  })
}
