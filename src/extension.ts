import * as vscode from 'vscode'
import splitPath from 'licia/splitPath'
import contain from 'licia/contain'
import { setContext } from './util'
import { SettingsEditorProvider } from './settingsEditorProvider'

const supportedFiles = ['package.json']

function reopenWith(editor: string) {
  const activeTabInput = vscode.window.tabGroups.activeTabGroup.activeTab
    ?.input as { [key: string]: any; uri: vscode.Uri | undefined }
  if (activeTabInput.uri) {
    vscode.commands.executeCommand(
      'vscode.openWith',
      activeTabInput.uri,
      editor
    )
  }
}

export function activate(context: vscode.ExtensionContext) {
  const openEditorCommand = vscode.commands.registerCommand(
    'settingsEditor.openEditor',
    () => reopenWith('settingsEditor.settingsedit')
  )
  const openSourceCommand = vscode.commands.registerCommand(
    'settingsEditor.openSource',
    () => reopenWith('default')
  )
  context.subscriptions.push(openEditorCommand)
  context.subscriptions.push(openSourceCommand)
  context.subscriptions.push(SettingsEditorProvider.register(context))
}

export function deactivate() {}

vscode.window.onDidChangeActiveTextEditor(updateOpenEditorButton)

function updateOpenEditorButton(textEditor: vscode.TextEditor | undefined) {
  const key = 'settingsEditor.openEditor'
  if (textEditor) {
    const document = textEditor.document
    const fileName = document.fileName
    const { name } = splitPath(fileName)
    if (contain(supportedFiles, name)) {
      setContext(key, true)
    } else {
      setContext(key, false)
    }
  } else {
    setContext(key, false)
  }
}

updateOpenEditorButton(vscode.window.activeTextEditor)
