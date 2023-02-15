import Store from 'licia/Store'
import I18n from 'licia/I18n'
import LunaSetting from 'luna-setting'
import { micromark } from 'micromark'
import h from 'licia/h'
import each from 'licia/each'
import uniqId from 'licia/uniqId'
import toEl from 'licia/toEl'
import splitPath from 'licia/splitPath'
import isUndef from 'licia/isUndef'
import path from 'path'
import $class from 'licia/$class'
import startWith from 'licia/startWith'

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
  },
  'zh-cn': {
    browse: '浏览',
    searchSettings: '搜索设置',
  },
})

export function appendMarkdown(setting: LunaSetting, markdown: string) {
  return setting.appendHtml(
    `<div class="item-markdown markdown">${micromark(markdown)}</div>`
  )
}

export function appendComplex(
  setting: LunaSetting,
  key: string,
  title: string,
  description: string
) {
  const fileName = store.get('fileName')
  const { name } = splitPath(fileName)
  return setting.appendHtml(
    h(
      'div',
      {
        class: 'item-complex',
      },
      h(
        'div',
        {
          class: 'luna-setting-title',
        },
        title
      ),
      h(
        'div',
        {
          class: 'luna-setting-description',
        },
        toEl(`<div>${micromark(description)}</div>`) as HTMLElement
      ),
      h(
        'a',
        {
          class: 'edit-source',
          onclick() {
            vscode.postMessage({ type: 'editSource' })
          },
        },
        `Edit in ${name}`
      )
    )
  )
}

interface IPathOptions {
  folder?: boolean
  file?: boolean
  cwd?: string
  extensions?: string[]
  absolute?: boolean
}

export function appendPath(
  setting: LunaSetting,
  key: string,
  val: string,
  title: string,
  description: string = '',
  options: IPathOptions = {}
) {
  let value = val
  const input = h('input', { type: 'text' }) as HTMLInputElement
  input.value = value
  function onChange() {
    ;(item as any).onChange(input.value)
  }
  input.onchange = onChange
  const button = h('button', {}, i18n.t('browse')) as HTMLButtonElement
  const canSelectFolders = !!options.folder
  const canSelectFile = isUndef(options.file) ? true : options.file
  const extensions = options.extensions || []
  const cwd = options.cwd || splitPath(store.get('fileName')).dir
  const absolute = !!options.absolute
  button.onclick = async function () {
    let result = await sendCommand('showOpenDialog', {
      canSelectFolders,
      canSelectFile,
      filters: {
        Files: extensions,
      },
      canSelectMany: false,
    })
    if (result) {
      if (!absolute) {
        if (startWith(result, cwd)) {
          result = path.relative(cwd, result)
        }
      }
      input.value = result
      onChange()
    }
  }

  const item = setting.appendHtml(
    h(
      'div',
      { class: 'item-path' },
      h(
        'div',
        {
          class: 'luna-setting-title',
        },
        title
      ),
      h(
        'div',
        {
          class: 'luna-setting-description',
        },
        toEl(`<div>${micromark(description)}</div>`) as HTMLElement
      ),
      h('div', { class: 'luna-setting-control' }, input, button)
    )
  )
  item.key = key
  item.value = value

  return item
}

export function buildSettings(setting: LunaSetting, config: any) {
  each(config, (value: any) => {
    const type = value.shift()
    let def: Def | undefined
    each(value, (val, idx) => {
      if (val instanceof Def) {
        def = val
        value[idx] = val.value
      }
    })
    let item: any
    switch (type) {
      case 'title':
        item = setting.appendTitle.apply(setting, value)
        break
      case 'markdown':
        item = appendMarkdown(setting, value[0])
        break
      case 'number':
        item = setting.appendNumber.apply(setting, value)
        break
      case 'checkbox':
        item = setting.appendCheckbox.apply(setting, value)
        break
      case 'select':
        item = setting.appendSelect.apply(setting, value)
        break
      case 'input':
        item = setting.appendInput.apply(setting, value)
        break
      case 'complex':
        item = appendComplex.apply(null, [setting, ...value] as any)
        break
      case 'path':
        item = appendPath.apply(null, [setting, ...value] as any)
        break
      case 'button':
        item = setting.appendButton.apply(setting, value)
        break
    }

    if (def) {
      const onChange = (item as any).onChange
      item.onChange = function (value: any) {
        onChange.call(item, value)
        def?.update(value)
        updateModified()
      }
      function updateModified() {
        if (def?.isModified) {
          $class.add(item.container, 'modified')
        } else {
          $class.remove(item.container, 'modified')
        }
      }
      updateModified()
    }
  })
}

class Def {
  private val: any
  private def: any
  constructor(val: any, def: any) {
    this.val = val
    this.def = def
  }
  update(val: any) {
    this.val = val
  }
  get value() {
    return isUndef(this.val) ? def : this.val
  }
  get isModified() {
    return !isUndef(this.val) && this.val !== this.def
  }
}

export function def(val: any, def: any) {
  return new Def(val, def)
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
