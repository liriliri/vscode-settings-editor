import Store from 'licia/Store'

// @ts-ignore
export const vscode = acquireVsCodeApi()

class StateStore extends Store {
  constructor() {
    super(vscode.getState() || {})
  }
  save(data: any) {
    vscode.setState(data)
  }
}

export const store = new StateStore()
