import LunaSetting from 'luna-setting'
import safeSet from 'licia/safeSet'
import isUndef from 'licia/isUndef'
import { store, vscode } from './util'

export function config(setting: LunaSetting) {
  const json = JSON.parse(store.get('text'))

  setting.on('change', (key, val) => {
    safeSet(json, key, val)

    const text = JSON.stringify(json, null, 2) + '\n'
    if (text !== store.get('text')) {
      store.set('text', text)
      vscode.postMessage({ type: 'update', text })
    }
  })

  setting.appendTitle('Prettier')
  setting.appendNumber(
    'printWidth',
    json.printWidth || 80,
    'Print Width',
    'Specify the line length that the printer will wrap on.',
    { min: 0, step: 1, max: Infinity }
  )
  setting.appendNumber(
    'tabWidth',
    json.tabWidth || 2,
    'Tab Width',
    'Specify the number of spaces per indentation-level.',
    {
      min: 0,
      step: 1,
      max: 16,
    }
  )
  setting.appendCheckbox(
    'useTabs',
    !!json.useTabs,
    'Tabs',
    'Indent lines with tabs instead of spaces.'
  )
  setting.appendCheckbox(
    'semi',
    isUndef(json.semi) ? true : json.semi,
    'Semicolons',
    'Print semicolons at the ends of statements.'
  )
  setting.appendCheckbox(
    'singleQuote',
    !!json.singleQuote,
    'Quotes',
    'Use single quotes instead of double quotes.'
  )
  setting.appendSelect(
    'quoteProps',
    json.quoteProps || 'as-needed',
    'Quote Props',
    'Change when properties in objects are quoted.',
    {
      'Only add quotes around object properties where required': 'as-needed',
      'If at least one property in an object requires quotes, quote all properties':
        'consistent',
      'Respect the input use of quotes in object properties': 'preserve',
    }
  )
  setting.appendCheckbox(
    'jsxSingleQuote',
    !!json.jsxSingleQuote,
    'JSX Quotes',
    'Use single quotes instead of double quotes in JSX.'
  )
  setting.appendSelect(
    'trailingComma',
    json.trailingComma || 'es5',
    'Trailing Commas',
    'Print trailing commas wherever possible in multi-line comma-separated syntactic structures. (A single-line array, for example, never gets trailing commas.)',
    {
      'Trailing commas where valid in ES5 (objects, arrays, etc.)': 'es5',
      'No trailing commas': 'none',
      'Trailing commas wherever possible (including function parameters and calls)':
        'all',
    }
  )
  setting.appendCheckbox(
    'bracketSpacing',
    isUndef(json.bracketSpacing) ? true : json.bracketSpacing,
    'Bracket Spacing',
    'Print spaces between brackets in object literals.'
  )
  setting.appendCheckbox(
    'bracketSameLine',
    !!json.bracketSameLine,
    'Bracket Line',
    'Put the `>` of a multi-line HTML (HTML, JSX, Vue, Angular) element at the end of the last line instead of being alone on the next line (does not apply to self closing elements).'
  )
  setting.appendSelect(
    'arrowParens',
    json.arrowParens || 'always',
    'Arrow Function Parentheses',
    'Include parentheses around a sole arrow function parameter.',
    {
      'Always include parens': 'always',
      'Omit parens when possible': 'avoid',
    }
  )
  setting.appendSelect(
    'proseWrap',
    json.proseWrap || 'preserve',
    'Prose Wrap',
    'To have Prettier wrap prose to the print width, change this option to "always". If you want Prettier to force all prose blocks to be on a single line and rely on editor/viewer soft wrapping instead, you can use "never".',
    {
      'Wrap prose if it exceeds the print width': 'always',
      'Un-wrap each block of prose into one line': 'never',
      'Do nothing, leave prose as-is': 'preserve',
    }
  )
  setting.appendSelect(
    'htmlWhitespaceSensitivity',
    json.htmlWhitespaceSensitivity || 'css',
    'HTML Whitespace Sensitivity',
    'Specify the global whitespace sensitivity for HTML, Vue, Angular, and Handlebars. See [whitespace-sensitive formatting](https://prettier.io/blog/2018/11/07/1.15.0.html#whitespace-sensitive-formatting) for more info.',
    {
      'Respect the default value of CSS display property': 'css',
      'Whitespace (or the lack of it) around all tags is considered significant':
        'strict',
      'Whitespace (or the lack of it) around all tags is considered insignificant':
        'ignore',
    }
  )
  setting.appendCheckbox(
    'vueIndentScriptAndStyle',
    !!json.vueIndentScriptAndStyle,
    'Vue files script and style tags indentation',
    'Whether or not to indent the code inside `<script>` and `<style>` tags in Vue files.'
  )
  setting.appendSelect(
    'endOfLine',
    json.endOfLine || 'lf',
    'End of Line',
    'For historical reasons, there exist two common flavors of line endings in text files. That is `\\n` (or `LF` for Line Feed) and `\\r\\n` (or `CRLF` for Carriage Return + Line Feed). The former is common on Linux and macOS, while the latter is prevalent on Windows. Some details explaining why it is so [can be found on Wikipedia](https://en.wikipedia.org/wiki/Newline).',
    {
      'Line Feed only (\\n), common on Linux and macOS as well as inside git repos':
        'lf',
      'Carriage Return + Line Feed characters (\\r\\n), common on Windows':
        'crlf',
      'Carriage Return character only (\\r), used very rarely': 'cr',
      'Maintain existing line endings': 'auto',
    }
  )
  setting.appendSelect(
    'embeddedLanguageFormatting',
    json.embeddedLanguageFormatting || 'auto',
    'Embedded Language Formatting',
    'Control whether Prettier formats quoted code embedded in the file.',
    {
      'Format embedded code if Prettier can automatically identify it': 'auto',
      'Never automatically format embedded code': 'off',
    }
  )
  setting.appendCheckbox(
    'singleAttributePerLine',
    !!json.singleAttributePerLine,
    'Single Attribute Per Line',
    'Enforce single attribute per line in HTML, Vue and JSX.'
  )
}
