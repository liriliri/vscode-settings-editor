import * as vscode from 'vscode'
import splitPath from 'licia/splitPath'
import contain from 'licia/contain'
import { setContext, setDocument, reopenWith } from './util'
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
