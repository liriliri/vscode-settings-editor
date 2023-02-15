import * as vscode from 'vscode'
import randomId from 'licia/randomId'
import { getFileHandler, reopenWith, setContext, setDocument } from './util'

export class SettingsEditorProvider implements vscode.CustomTextEditorProvider {
  public static register(context: vscode.ExtensionContext): vscode.Disposable {
    const provider = new SettingsEditorProvider(context)
    const providerRegistration = vscode.window.registerCustomEditorProvider(
      SettingsEditorProvider.viewType,
      provider
    )
    return providerRegistration
  }
  private static readonly viewType = 'settingsEditor.settingsedit'
  constructor(private readonly context: vscode.ExtensionContext) {}
  public async resolveCustomTextEditor(
    document: vscode.TextDocument,
    webviewPanel: vscode.WebviewPanel,
    token: vscode.CancellationToken
  ): Promise<void> {
    webviewPanel.webview.options = {
      enableScripts: true,
    }
    webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview)
    webviewPanel.onDidChangeViewState(() => {
      if (webviewPanel.active) {
        setDocument(document)
      }
      this.updateOpenSourceButton(webviewPanel.active)
    })
    setDocument(document)
    this.updateOpenSourceButton(true)

    async function updateWebview() {
      webviewPanel.webview.postMessage({
        type: 'update',
        fileName: document.fileName,
        text: document.getText(),
        handler: await getFileHandler(document),
      })
    }

    const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(
      (e) => {
        if (e.document.uri.toString() === document.uri.toString()) {
          updateWebview()
        }
      }
    )

    webviewPanel.onDidDispose(() => {
      changeDocumentSubscription.dispose()
      this.updateOpenSourceButton(false)
    })

    webviewPanel.webview.onDidReceiveMessage(async (e) => {
      let result = ''
      if (e.type === 'command') {
        const { id, command, data } = e
        switch (command) {
          case 'showOpenDialog':
            const paths = await vscode.window.showOpenDialog(data)
            if (paths) {
              result = paths[0].fsPath
            }
            break
        }
        webviewPanel.webview.postMessage({
          type: 'commandCallback',
          id,
          result,
        })
        return
      }

      switch (e.type) {
        case 'update':
          this.updateTextDocument(document, e.text)
          break
        case 'run':
          this.runCommand(e.command)
          break
        case 'editSource':
          reopenWith('default')
          break
      }
    })

    webviewPanel.webview.postMessage({
      type: 'init',
      language: vscode.env.language,
    })
    updateWebview()
  }
  private updateOpenSourceButton(show: boolean) {
    setContext('settingsEditor.openSource', show)
  }
  private async updateTextDocument(document: vscode.TextDocument, text: any) {
    const edit = new vscode.WorkspaceEdit()

    edit.replace(
      document.uri,
      new vscode.Range(0, 0, document.lineCount, 0),
      text
    )

    await vscode.workspace.applyEdit(edit)
    document.save()
  }
  private runCommand(command: string) {
    const terminal = this.getTerminal()
    terminal.sendText(command)
    vscode.window.setStatusBarMessage(
      vscode.l10n.t('Running command {command} in terminal settings editor', {
        command,
      }),
      3000
    )
  }
  private getTerminal() {
    const terminals = vscode.window.terminals
    for (let i = 0, len = terminals.length; i < len; i++) {
      const terminal = terminals[i]
      if (terminal.name === 'settings editor') {
        return terminal
      }
    }
    return vscode.window.createTerminal('settings editor')
  }
  private getHtmlForWebview(webview: vscode.Webview): string {
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'editor.css')
    )
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'editor.js')
    )
    const nonce = randomId()

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <!--
          Use a content security policy to only allow loading images from https or from our extension directory,
          and only allow scripts that have a specific nonce.
        -->
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}'; img-src data:;">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="${styleUri}" rel="stylesheet">
        <title>Settings Editor</title>
      </head>
      <body>
        <div id="search">
          <div class="input-container">
            <input types="text"/>
          </div>
        </div>
        <div id="container"></div>
        <script nonce="${nonce}" src="${scriptUri}"></script>
      </body>
      </html>
    `
  }
}
