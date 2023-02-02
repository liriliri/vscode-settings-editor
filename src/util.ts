import * as vscode from 'vscode'

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
