import $ from 'licia/$'
import repeat from 'licia/repeat'
import $offset from 'licia/$offset'
import trim from 'licia/trim'
import { micromark } from 'micromark'

const container = document.getElementById('toc-container') as HTMLElement
const $container = $(container)

$container.on('click', 'a', function (this: HTMLAnchorElement, e) {
  e.preventDefault()
  e.stopPropagation()
  const $this = $(this)
  const $target = $($this.attr('href'))
  ;($target.get(0) as HTMLElement).click()
  const top = $target.offset().top - 55
  window.scrollTo(window.scrollX, top)
})

window.addEventListener('scroll', () => {
  $container.css('top', window.scrollY + 'px')
})

let markdown = ''

export function reset() {
  $container.text('')
  markdown = ''
}

export function add(title: string, id: string, level = 1) {
  const indent = repeat('  ', level - 1)
  markdown += `${indent}* [${title}](#${id})\n`
}

export function build() {
  check()
  $container.html(micromark(markdown))
}

const searchInput = document
  .getElementById('search')
  ?.querySelector('input') as HTMLInputElement

searchInput.addEventListener('input', check)

export function check() {
  let hideToc = false
  if (trim(searchInput.value) !== '') {
    hideToc = true
  } else if (window.innerWidth < 800) {
    hideToc = true
  } else {
    const lineCount = trim(markdown).split('\n').length
    if (lineCount < 2) {
      hideToc = true
    }
  }
  const $body = $(document.body)
  if (hideToc) {
    $body.addClass('hide-toc')
  } else {
    $body.rmClass('hide-toc')
  }
}

check()
window.addEventListener('resize', check)
