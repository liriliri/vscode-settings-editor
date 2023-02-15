import * as vscode from 'vscode'
import { setContext, setDocument, reopenWith, getFileHandler } from './util'
import { SettingsEditorProvider } from './settingsEditorProvider'

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

async function updateOpenEditorButton(
  textEditor: vscode.TextEditor | undefined
) {
  const key = 'settingsEditor.openEditor'
  if (textEditor) {
    const document = textEditor.document
    if (await getFileHandler(document)) {
      setDocument(document)
      setContext(key, true)
    } else {
      setContext(key, false)
    }
  } else {
    setContext(key, false)
  }
}

updateOpenEditorButton(vscode.window.activeTextEditor)
