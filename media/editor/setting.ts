import LunaSetting from 'luna-setting'
import each from 'licia/each'
import $class from 'licia/$class'
import isUndef from 'licia/isUndef'
import toEl from 'licia/toEl'
import splitPath from 'licia/splitPath'
import path from 'path'
import startWith from 'licia/startWith'
import { micromark } from 'micromark'
import h from 'licia/h'
import types from 'licia/types'
import * as toc from './toc'
import { store, vscode, i18n, sendCommand } from './util'
import uniqId from 'licia/uniqId'

const container = document.getElementById('settings-container') as HTMLElement
const setting = new LunaSetting(container)

export function setFilter(filter: string) {
  window.scrollTo(window.scrollX, 0)
  setting.setOption('filter', filter)
}

export function onChange(handler: types.AnyFn) {
  setting.on('change', handler)
}

export function reset() {
  toc.reset()
  setting.clear()
  setting.removeAllListeners('change')
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
    return isUndef(this.val) ? this.def : this.val
  }
  get isModified() {
    return !isUndef(this.val) && this.val !== this.def
  }
}

export function def(val: any, def: any) {
  return new Def(val, def)
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
        i18n.t('editIn', { name })
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

export function build(config: any) {
  each(config, (value: any) => {
    if (!value) {
      return
    }
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
        const titleId = uniqId('title-')
        item = setting.appendTitle.apply(setting, value)
        toc.add(value[0], titleId, value[1])
        item.container.id = titleId
        break
      case 'markdown':
        item = setting.appendMarkdown.apply(setting, value)
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
      case 'text':
        item = setting.appendText.apply(setting, value)
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

  toc.build()
}
