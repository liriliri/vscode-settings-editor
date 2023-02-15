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
