import * as vscode from 'vscode'

export function setContext(name: string, value: any) {
  vscode.commands.executeCommand('setContext', name, value)
}
