import splitPath from 'licia/splitPath'
import each from 'licia/each'
import last from 'licia/last'
import safeSet from 'licia/safeSet'
import safeGet from 'licia/safeGet'
import splitCase from 'licia/splitCase'
import isUndef from 'licia/isUndef'
import map from 'licia/map'
import upperFirst from 'licia/upperFirst'
import LunaSetting from 'luna-setting'
import json5 from 'json5'
import every from 'licia/every'
import isStr from 'licia/isStr'
import isNum from 'licia/isNum'
import isArr from 'licia/isArr'
import { buildSettings, updateText, getSpace, def } from './util'
import {
  SchemaTree,
  RootNode,
  isRegularNode,
  RegularNode,
  isRootNode,
  SchemaNode,
} from '@stoplight/json-schema-tree'

// https://github.com/stoplightio/json-schema-viewer
export default async function handler(
  setting: LunaSetting,
  fileName: string,
  text: string
) {
  const { name } = splitPath(fileName)
  let schema: any = {}
  let title = ''
  let maxLevel = 3
  let selectChoices = (node: RegularNode, val?: any) => {
    return (node.children as any)[0] as RegularNode
  }

  switch (name) {
    case 'cypress.json':
      title = 'Cypress Config'
      schema = require('./schema/cypress.json')
      maxLevel = 1
      break
    case '.eslintrc':
    case '.eslintrc.json':
      title = 'Eslint Config'
      schema = require('./schema/eslintrc.json')
      selectChoices = (node: RegularNode, val?: any) => {
        let idx = 0
        const path = propertyPathToObjectPath(node)
        if (path[0] === 'rules') {
          idx = 1
          if (!isUndef(val)) {
            if (isNum(val)) {
              idx = 0
            } else if (isArr(val)) {
              idx = 2
            }
          }
        }

        return (node.children as any)[idx] as RegularNode
      }
      break
    case 'tsconfig.json':
      title = 'Typescript Config'
      schema = require('./schema/tsconfig.json')
      maxLevel = 2
      break
    case 'lerna.json':
      title = 'Lerna Config'
      schema = require('./schema/lerna.json')
      break
    case '.nycrc':
    case '.nycrc.json':
      title = 'Nyc Config'
      schema = require('./schema/nycrc.json')
      break
    case '.babelrc':
    case '.babelrc.json':
      title = 'Babel Config'
      schema = require('./schema/babelrc.json')
      break
  }

  if (schema) {
    const tree = new SchemaTree(schema, {
      mergeAllOf: true,
    })
    tree.populate()
    buildSettingsFromSchema(setting, text, title, tree.root, {
      maxLevel,
      selectChoices,
    })
  }
}

interface IOptions {
  maxLevel: number
  selectChoices: (node: RegularNode, val?: any) => RegularNode
}

function buildSettingsFromSchema(
  setting: LunaSetting,
  text: string,
  title: string,
  root: RootNode,
  options: IOptions
) {
  const maxLevel = options.maxLevel
  const selectChoices = options.selectChoices
  const json = json5.parse(text)
  setting.on('change', (key, val) => {
    safeSet(json, key, val)
    updateText(JSON.stringify(json, null, getSpace()) + '\n')
  })

  const config: any[] = []

  function val(path: string, type: string, node: SchemaNode) {
    const val = safeGet(json, path)
    if (!isUndef(node.fragment.default)) {
      return def(val, node.fragment.default)
    } else {
      let defVal: any = ''
      switch (type) {
        case 'string':
          defVal = ''
          break
        case 'boolean':
          defVal = false
          break
        case 'number':
          defVal = 0
          break
        case 'enum':
          defVal = ((node as RegularNode).enum as any)[0]
          break
      }
      return isUndef(val) ? defVal : val
    }
  }
  function buildConfig(node: RegularNode, title: string, level: number = 0) {
    if (level >= maxLevel) {
      return
    }
    if (!node.children) {
      return
    }
    if (shouldShowChildSelector(node)) {
      buildConfig(selectChoices(node), title)
      return
    }
    config.push(['title', title, level === 0 ? 1 : level])
    const description = getDescription(node)
    if (description) {
      config.push(['markdown', description])
    }
    const pureObjectNodes: RegularNode[] = []
    each(node.children, (node) => {
      if (!isRegularNode(node)) {
        return
      }
      if (isPureObjectNode(node)) {
        pureObjectNodes.push(node)
        return
      }

      const path = propertyPathToObjectPath(node).join('.')
      const title = propertyPathToTitle(node)

      if (shouldShowChildSelector(node)) {
        node = selectChoices(node, safeGet(json, path))
      }

      const description = getDescription(node)

      if (node.enum && every(node.enum, isStr)) {
        const options: any = {}
        each(node.enum, (val: any) => {
          options[titleCase(val)] = val
        })
        config.push([
          'select',
          path,
          val(path, 'enum', node),
          title,
          description,
          options,
        ])
      } else {
        switch (node.primaryType) {
          case 'string':
            config.push([
              'text',
              path,
              val(path, 'string', node),
              title,
              description,
            ])
            break
          case 'boolean':
            config.push([
              'checkbox',
              path,
              val(path, 'boolean', node),
              title,
              description,
            ])
            break
          case 'integer':
          case 'number':
            config.push([
              'number',
              path,
              val(path, 'number', node),
              title,
              description,
            ])
            break
          default:
            config.push(['complex', path, title, description])
        }
      }
    })
    each(pureObjectNodes, (node) => {
      buildConfig(node, propertyPathToTitle(node), level + 1)
    })
  }
  buildConfig(root.children[0] as RegularNode, title)

  buildSettings(setting, config)
}

function getDescription(node: SchemaNode) {
  const fragment: any = node.fragment
  let desctription = ''
  if (fragment.description) {
    desctription = fragment.description.replace(/\n/g, '\n\n')
  }
  if (fragment.markdownDescription) {
    desctription = fragment.markdownDescription
  }

  return desctription.length > 1 ? desctription : ''
}

function propertyPathToTitle(node: SchemaNode) {
  return titleCase(last(node.subpath))
}

function titleCase(name: string) {
  const words = map(splitCase(name), upperFirst)

  const ret = []
  let word = ''
  for (let i = 0, len = words.length; i < len; i++) {
    if (words[i].length === 1 || word.length === 1) {
      word += words[i]
    } else {
      if (word) {
        ret.push(word)
        word = ''
      }
      ret.push(words[i])
    }
  }

  if (word) {
    ret.push(word)
  }

  return ret.join(' ')
}

function isPureObjectNode(schemaNode: RegularNode) {
  return schemaNode.primaryType === 'object' && schemaNode.types?.length === 1
}

function propertyPathToObjectPath(node: SchemaNode) {
  const objectPath: string[] = []

  let currentNode: SchemaNode | null = node
  while (currentNode && !isRootNode(currentNode)) {
    if (isRegularNode(currentNode)) {
      const pathPart = currentNode.subpath[currentNode.subpath.length - 1]

      if (currentNode.primaryType === 'array') {
        const key = `${pathPart || ''}[]`
        if (objectPath[objectPath.length - 1]) {
          objectPath[objectPath.length - 1] = key
        } else {
          objectPath.push(key)
        }
      } else if (
        pathPart &&
        (currentNode.subpath.length !== 2 ||
          !['allOf', 'oneOf', 'anyOf'].includes(currentNode.subpath[0]))
      ) {
        objectPath.push(currentNode.subpath[currentNode.subpath.length - 1])
      }
    }

    currentNode = currentNode.parent
  }

  return objectPath.reverse()
}

const shouldShowChildSelector = (schemaNode: SchemaNode) =>
  isNonEmptyParentNode(schemaNode) &&
  ['anyOf', 'oneOf'].includes(schemaNode.combiners?.[0] ?? '')

const isNonEmptyParentNode = (
  node: SchemaNode
): node is RegularNode & {
  children: ChildNode[] & { 0: ChildNode }
} => isRegularNode(node) && !!node.children && node.children.length > 0
