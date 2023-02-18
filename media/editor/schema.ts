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

  switch (name) {
    case 'cypress.json':
      title = 'Cypress Config'
      schema = require('./schema/cypress.json')
      maxLevel = 1
      break
    case '.eslintrc.json':
      title = 'Eslint Config'
      schema = require('./schema/eslintrc.json')
      break
    case 'tsconfig.json':
      title = 'Typescript Config'
      schema = require('./schema/tsconfig.json')
      maxLevel = 2
      break
  }

  if (schema) {
    const tree = new SchemaTree(schema, {
      mergeAllOf: true,
    })
    tree.populate()
    buildSettingsFromSchema(setting, text, title, tree.root, maxLevel)
  }
}

function buildSettingsFromSchema(
  setting: LunaSetting,
  text: string,
  title: string,
  root: RootNode,
  maxLevel: number
) {
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
      buildConfig(node.children[0] as RegularNode, title)
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
      const description = getDescription(node)

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

  return fragment.markdownDescription || fragment.description || ''
}

function propertyPathToTitle(node: SchemaNode) {
  return map(splitCase(last(node.subpath)), upperFirst).join(' ')
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
