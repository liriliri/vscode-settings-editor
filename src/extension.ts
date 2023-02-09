import * as vscode from 'vscode'
import splitPath from 'licia/splitPath'
import contain from 'licia/contain'
import { getDocument, setContext, setDocument } from './util'
import { SettingsEditorProvider } from './settingsEditorProvider'

const supportedFiles = [
  '.prettierrc.json',
  'package.json',
  '.npmrc',
  'app.json',
  'project.config.json',
  'project.miniapp.json',
  'tsconfig.json',
]

function reopenWith(editor: string) {
  const document = getDocument()
  let uri: vscode.Uri | undefined
  if (document) {
    uri = document.uri
  } else {
    try {
      const activeTabInput = vscode.window.tabGroups.activeTabGroup.activeTab
        ?.input as { [key: string]: any; uri: vscode.Uri | undefined }
      uri = activeTabInput.uri
    } catch (e) {}
  }
  if (uri) {
    vscode.commands.executeCommand('vscode.openWith', uri, editor)
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
