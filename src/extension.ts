import * as vscode from 'vscode'
import { SettingsEditorProvider } from './settingsEditorProvider'

function reopenWithSettingsEditor() {
  const activeTabInput = vscode.window.tabGroups.activeTabGroup.activeTab
    ?.input as { [key: string]: any; uri: vscode.Uri | undefined }
  if (activeTabInput.uri) {
    vscode.commands.executeCommand(
      'vscode.openWith',
      activeTabInput.uri,
      'settingsEditor.settingsedit'
    )
  }
}

export function activate(context: vscode.ExtensionContext) {
  const openWithCommand = vscode.commands.registerCommand(
    'settingsEditor.openFile',
    reopenWithSettingsEditor
  )
  context.subscriptions.push(openWithCommand)
  context.subscriptions.push(SettingsEditorProvider.register(context))
}

export function deactivate() {}
