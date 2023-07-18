import splitPath from 'licia/splitPath'
import * as vscode from 'vscode'
import endWith from 'licia/endWith'
import path from 'path'

export function setContext(name: string, value: any) {
  vscode.commands.executeCommand('setContext', name, value)
}

let document: vscode.TextDocument | undefined
export function setDocument(doc: vscode.TextDocument) {
  document = doc
}

export function getDocument() {
  return document
}

let textEditor: vscode.TextEditor | undefined
export function setTextEditor(editor: vscode.TextEditor) {
  textEditor = editor
}

export function getTextEditor() {
  return textEditor
}

export function reopenWith(editor: string) {
  let uri: vscode.Uri | undefined
  try {
    const activeTabInput = vscode.window.tabGroups.activeTabGroup.activeTab
      ?.input as { [key: string]: any; uri: vscode.Uri | undefined }
    uri = activeTabInput.uri
  } catch (e) {
    const document = getDocument()
    if (document) {
      uri = document.uri
    }
  }
  if (uri) {
    vscode.commands.executeCommand('vscode.openWith', uri, editor)
  }
}

export async function getFileHandler(document: vscode.TextDocument) {
  const fileName = document.fileName
  const { name, dir } = splitPath(fileName)

  switch (name) {
    case 'package.json':
    case '.npmrc':
      return 'npm'
    case '.prettierrc':
    case '.prettierrc.json':
      return 'prettier'
    case 'tsconfig.json':
    case 'cypress.json':
    case '.eslintrc':
    case '.eslintrc.json':
    case 'lerna.json':
    case '.nycrc':
    case '.nycrc.json':
    case '.babelrc':
    case '.babelrc.json':
      return 'schema'
  }

  return ''
}
