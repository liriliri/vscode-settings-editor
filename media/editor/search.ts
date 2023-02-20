import debounce from 'licia/debounce'
import trim from 'licia/trim'
import * as setting from './setting'

const searchInput = document
  .getElementById('search')
  ?.querySelector('input') as HTMLInputElement

searchInput.addEventListener(
  'input',
  debounce(function () {
    const filter = trim(searchInput.value)
    setting.setFilter(filter)
  }, 100),
  false
)

export function setPlaceHolder(placeholder: string) {
  searchInput.setAttribute('placeholder', placeholder)
}

export function reset() {
  searchInput.value = ''
}
