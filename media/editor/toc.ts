import $ from 'licia/$'
import repeat from 'licia/repeat'
import $offset from 'licia/$offset'
import throttle from 'licia/throttle'
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
  setTimeout(() => {
    $container.find('a').rmClass('active')
    $this.addClass('active')
  }, 20)
})

window.addEventListener('scroll', () => {
  $container.css('top', window.scrollY + 'px')
  updateActive()
})

const updateActive = throttle(function () {
  const $a = $container.find('a')
  $a.rmClass('active')
  let hasFound = false
  $a.each(function (this: HTMLAnchorElement) {
    const $this = $(this)
    if (hasFound) {
      return
    }
    const top = $offset($this.attr('href')).top
    if (top >= window.scrollY) {
      hasFound = true
      $this.addClass('active')
    }
  })
  if (!hasFound) {
    $a.last().addClass('active')
  }
}, 16)

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
  let isHidden = false
  if (trim(searchInput.value) !== '') {
    isHidden = true
  } else if (window.innerWidth < 800) {
    isHidden = true
  } else {
    const lineCount = trim(markdown).split('\n').length
    if (lineCount < 2) {
      isHidden = true
    }
  }
  const $body = $(document.body)
  if (isHidden) {
    $body.addClass('hide-toc')
  } else {
    $body.rmClass('hide-toc')
  }
}

check()
window.addEventListener('resize', check)
