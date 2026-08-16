import html2pdf from 'html2pdf.js'
import {
  detailedMetaHTML,
  escapeHtml,
  formatComponents,
  tocIconsHTML,
} from './spellIcons'

const PREPARED = {
  name: '#b8860b',
  border: '#d4af37',
  background: '#fff8e1',
  headerBorder: '#e6d08a',
}

const ALWAYS_PREPARED = {
  name: '#8b0000',
  border: '#8b0000',
  background: '#fdeaea',
  headerBorder: '#e0b4b4',
}

const ICON_STYLES = `
    .spell-icon {
      display: inline-block;
      width: 11px;
      height: 11px;
      vertical-align: -1px;
      color: #111;
      line-height: 0;
    }
    
    .spell-icon svg {
      width: 11px;
      height: 11px;
      display: block;
    }
    
    .toc-legend {
      font-size: 8px;
      color: #666;
      margin: 0 0 6px 0;
    }
    
    .toc-link-name {
      margin-right: 4px;
    }
    
    .toc-icons {
      display: inline-block;
      white-space: nowrap;
    }
    
    .toc-icons .spell-icon {
      margin-left: 2px;
    }
    
    .spell-icon-stats {
      margin: 2px 0 4px 0;
      overflow: hidden;
    }
    
    .spell-icon-stat {
      display: block;
      float: left;
      width: 50%;
      box-sizing: border-box;
      padding: 1px 8px 1px 0;
      font-size: 8px;
      color: #444;
      line-height: 1.35;
    }
    
    .spell-icon-stat .spell-icon {
      margin-right: 4px;
    }
`

const SHARED_STYLES = `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Georgia', serif;
      font-size: 10px;
      line-height: 1.25;
      color: #333;
    }
    
    h1 {
      font-size: 20px;
      margin-bottom: 6px;
      margin-top: 0;
      color: #1a1a2e;
      border-bottom: 2px solid #8b0000;
      padding-bottom: 4px;
      page-break-after: avoid;
    }
    
    .legend {
      margin: 0 0 10px 0;
      font-size: 9px;
      page-break-after: avoid;
    }
    
    .legend-item {
      display: inline-block;
      margin-right: 14px;
      font-weight: bold;
    }
    
    .legend-item.prepared {
      color: ${PREPARED.name};
    }
    
    .legend-item.always-prepared {
      color: ${ALWAYS_PREPARED.name};
    }
    
    .toc {
      margin: 0 0 12px 0;
      padding-bottom: 8px;
      border-bottom: 1px solid #ccc;
    }
    
    .toc-level {
      margin-bottom: 6px;
    }
    
    .toc-level-title {
      font-size: 10px;
      font-weight: bold;
      color: #2d2d44;
      margin: 0 0 2px 0;
    }
    
    .toc-list {
      overflow: hidden;
    }
    
    .toc-link {
      display: block;
      float: left;
      width: 50%;
      box-sizing: border-box;
      padding: 1px 8px 1px 0;
      font-size: 9px;
      text-decoration: underline;
      line-height: 1.35;
    }
    
    .toc-link.prepared {
      color: ${PREPARED.name};
    }
    
    .toc-link.always-prepared {
      color: ${ALWAYS_PREPARED.name};
    }
    ${ICON_STYLES}
    h2 {
      font-size: 14px;
      margin-top: 10px;
      margin-bottom: 6px;
      color: #2d2d44;
      border-bottom: 1px solid #ccc;
      padding-bottom: 2px;
      page-break-after: avoid;
      page-break-before: auto;
    }
`

function getStateClass(spell, preparedSpells) {
  return preparedSpells.get(spell.id) === 2 ? 'always-prepared' : 'prepared'
}

function getLegendHTML() {
  return '<div class="legend"><span class="legend-item prepared">Подготовлено</span><span class="legend-item always-prepared">Всегда подготовлено</span></div>'
}

function getHigherLevelsText(spell) {
  if (spell.at_higher_levels && spell.at_higher_levels.trim()) {
    return spell.at_higher_levels.trim()
  }

  // Fallback for entries where higher-level scaling stayed in description.
  const description = spell.description || ''
  const markerRegex = /(?:^|\n)\s*На\s+(?:более\s+)?высоких\s+уровнях:\s*([\s\S]*)$/i
  const match = description.match(markerRegex)
  return match?.[1]?.trim() || ''
}

function getHigherLevelsLabel(spell) {
  return spell.level === 0 ? 'Усиление заговора:' : 'На более высоких уровнях:'
}

function spellAnchorId(spell) {
  return `spell-${String(spell.id).replace(/[^a-zA-Z0-9_-]/g, '')}`
}

function getLevelTitle(level) {
  return level === 0 ? 'Заговоры' : `${level} уровень`
}

function groupSpellsByLevel(spells) {
  return spells.reduce((groups, spell) => {
    const level = spell.level
    if (!groups[level]) {
      groups[level] = []
    }
    groups[level].push(spell)
    return groups
  }, {})
}

function generateTocHTML(spells, preparedSpells) {
  const groupedSpells = groupSpellsByLevel(spells)
  const sortedLevels = Object.keys(groupedSpells).map(Number).sort((a, b) => a - b)

  let html = '<div class="toc">'
  html += '<h2>Краткий список</h2>'
  html += '<div class="toc-legend">Иконки: школа, концентрация, ритуал</div>'

  for (const level of sortedLevels) {
    html += '<div class="toc-level">'
    html += `<div class="toc-level-title">${getLevelTitle(level)}</div>`
    html += '<div class="toc-list">'
    for (const spell of groupedSpells[level]) {
      const stateClass = getStateClass(spell, preparedSpells)
      html += `<a class="toc-link ${stateClass}" href="#${spellAnchorId(spell)}"><span class="toc-link-name">${escapeHtml(spell.name)}</span>${tocIconsHTML(spell)}</a>`
    }
    html += '</div></div>'
  }

  html += '</div>'
  return html
}

function pxToPdfUnit(px, k) {
  return px * 72 / 96 / k
}

function collectInternalLinks(container, pageSize, margin) {
  const k = pageSize.k
  const innerHeight = pageSize.inner.height
  const containerRect = container.getBoundingClientRect()
  const targets = new Map()

  container.querySelectorAll('[id^="spell-"]').forEach((el) => {
    const rect = el.getBoundingClientRect()
    const top = pxToPdfUnit(rect.top - containerRect.top, k)
    const page = Math.floor(top / innerHeight) + 1
    targets.set(el.id, {
      page,
      top: margin[0] + (top % innerHeight),
    })
  })

  const links = []
  container.querySelectorAll('a.toc-link[href^="#spell-"]').forEach((link) => {
    const id = decodeURIComponent(link.getAttribute('href').slice(1))
    const target = targets.get(id)
    if (!target) return

    Array.from(link.getClientRects()).forEach((rect) => {
      const top = pxToPdfUnit(rect.top - containerRect.top, k)
      const left = pxToPdfUnit(rect.left - containerRect.left, k)
      links.push({
        page: Math.floor(top / innerHeight) + 1,
        x: margin[1] + left,
        y: margin[0] + (top % innerHeight),
        width: pxToPdfUnit(rect.width, k),
        height: pxToPdfUnit(rect.height, k),
        target,
      })
    })
  })

  return links
}

function applyInternalLinks(pdf, links) {
  const pageHeight = pdf.internal.pageSize.getHeight()
  const nPages = pdf.internal.getNumberOfPages()

  links.forEach((link) => {
    if (link.page < 1 || link.page > nPages) return
    if (link.target.page < 1 || link.target.page > nPages) return

    pdf.setPage(link.page)
    pdf.link(link.x, link.y, link.width, link.height, {
      pageNumber: link.target.page,
      magFactor: 'XYZ',
      top: pageHeight - link.target.top,
      left: 0,
      zoom: 0,
    })
  })

  pdf.setPage(nPages)
}

function generateHTMLList(spells, preparedSpells) {
  const groupedSpells = groupSpellsByLevel(spells)
  const sortedLevels = Object.keys(groupedSpells).map(Number).sort((a, b) => a - b)

  let html = '<h1>Подготовленные заклинания</h1>'
  html += getLegendHTML()
  html += generateTocHTML(spells, preparedSpells)

  for (const level of sortedLevels) {
    html += `<h2>${getLevelTitle(level)}</h2>`

    for (const spell of groupedSpells[level]) {
      // Wrap each spell in a div with page-break-inside: avoid
      html += `<div class="spell-block ${getStateClass(spell, preparedSpells)}" id="${spellAnchorId(spell)}">`
      html += `<h3>${escapeHtml(spell.name)}</h3>`
      html += detailedMetaHTML(spell, {
        componentsText: formatComponents(spell),
        durationText: spell.duration,
      })
      html += `<p class="description">${escapeHtml(spell.description || '')}</p>`
      
      const higherLevelsText = getHigherLevelsText(spell)
      if (higherLevelsText) {
        html += `<p class="higher-levels"><strong>${escapeHtml(getHigherLevelsLabel(spell))}</strong> ${escapeHtml(higherLevelsText)}</p>`
      }
      
      html += '</div>'
    }
  }

  return html
}

function generateHTMLCards(spells, preparedSpells) {
  let html = '<h1>Подготовленные заклинания</h1>'
  html += getLegendHTML()
  html += generateTocHTML(spells, preparedSpells)
  html += '<h2>Описания заклинаний</h2>'
  html += '<div class="cards-container">'

  for (let i = 0; i < spells.length; i++) {
    const spell = spells[i]
    const componentsText = formatComponents(spell)

    // Start a new row every 2 cards
    if (i % 2 === 0) {
      html += '<div class="card-row">'
    }

    html += `<div class="spell-card ${getStateClass(spell, preparedSpells)}" id="${spellAnchorId(spell)}">`
    html += '<div class="card-header">'
    html += `<span class="card-name">${escapeHtml(spell.name)}</span>`
    html += '</div>'
    html += detailedMetaHTML(spell, {
      componentsText,
      durationText: spell.duration,
    })
    
    html += `<p class="card-description">${escapeHtml(spell.description || '')}</p>`
    
    const higherLevelsText = getHigherLevelsText(spell)
    if (higherLevelsText) {
      html += `<p class="card-higher-levels"><strong>${escapeHtml(getHigherLevelsLabel(spell))}</strong> ${escapeHtml(higherLevelsText)}</p>`
    }
    
    html += '</div>'
    
    // Close row every 2 cards or at the end
    if ((i + 1) % 2 === 0 || i === spells.length - 1) {
      // If odd number and last card, add empty cell to complete row
      if ((i + 1) % 2 !== 0 && i === spells.length - 1) {
        html += '<div class="spell-card-empty"></div>'
      }
      html += '</div>'
    }
  }

  html += '</div>'
  return html
}

function filenamePart(value) {
  const slug = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9а-яё-]/gi, '')
    .slice(0, 48)
  return slug || 'all'
}

export async function generatePDF(spells, format = 'list', preparedSpells = new Map(), meta = {}) {
  const html = format === 'cards' ? generateHTMLCards(spells, preparedSpells) : generateHTMLList(spells, preparedSpells)
  
  // Create a container with styling for the PDF
  const container = document.createElement('div')
  container.innerHTML = html
  
  // Add styles via a style element for better control
  const style = document.createElement('style')
  
  const listStyles = `
    ${SHARED_STYLES}
    h3 {
      font-size: 11px;
      margin-bottom: 3px;
      page-break-after: avoid;
    }
    
    .spell-block {
      page-break-inside: avoid;
      break-inside: avoid;
      margin-bottom: 8px;
      padding: 6px 8px;
    }
    
    .spell-block.prepared {
      background: ${PREPARED.background};
      border-left: 3px solid ${PREPARED.border};
    }
    
    .spell-block.always-prepared {
      background: ${ALWAYS_PREPARED.background};
      border-left: 3px solid ${ALWAYS_PREPARED.border};
    }
    
    .spell-block.prepared h3 {
      color: ${PREPARED.name};
    }
    
    .spell-block.always-prepared h3 {
      color: ${ALWAYS_PREPARED.name};
    }
    
    ul {
      margin: 2px 0;
      padding-left: 14px;
      list-style: none;
    }
    
    li {
      margin: 1px 0;
      font-size: 9px;
    }
    
    li strong {
      color: #444;
    }
    
    .description {
      margin: 4px 0;
      font-size: 9px;
      text-align: justify;
      white-space: pre-line;
    }
    
    .higher-levels {
      margin-top: 3px;
      font-size: 9px;
      font-style: italic;
      color: #555;
      white-space: pre-line;
    }
  `
  
  const cardsStyles = `
    ${SHARED_STYLES}
    .cards-container {
      display: block;
      width: 100%;
    }
    
    .card-row {
      display: table;
      width: 100%;
      table-layout: fixed;
      margin-bottom: 12px;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      -webkit-region-break-inside: avoid;
      orphans: 2;
      widows: 2;
    }
    
    .spell-card {
      display: table-cell;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      -webkit-region-break-inside: avoid;
      border-radius: 4px;
      padding: 10px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      width: 49%;
      vertical-align: top;
      box-sizing: border-box;
    }
    
    .spell-card.prepared {
      background: ${PREPARED.background};
      border: 1px solid ${PREPARED.border};
    }
    
    .spell-card.always-prepared {
      background: ${ALWAYS_PREPARED.background};
      border: 2px solid ${ALWAYS_PREPARED.border};
    }
    
    .spell-card:first-child {
      padding-right: 12px;
    }
    
    .spell-card-empty {
      display: table-cell;
      width: 49%;
      visibility: hidden;
    }
    
    .card-header {
      display: block;
      margin-bottom: 8px;
      padding-bottom: 6px;
      overflow: hidden;
    }
    
    .spell-card.prepared .card-header {
      border-bottom: 1px solid ${PREPARED.headerBorder};
    }
    
    .spell-card.always-prepared .card-header {
      border-bottom: 1px solid ${ALWAYS_PREPARED.headerBorder};
    }
    
    .card-name {
      font-size: 12px;
      font-weight: bold;
      float: left;
      max-width: 75%;
    }
    
    .spell-card.prepared .card-name {
      color: ${PREPARED.name};
    }
    
    .spell-card.always-prepared .card-name {
      color: ${ALWAYS_PREPARED.name};
    }
    
    .card-tags {
      float: right;
      display: inline-block;
    }
    
    .tag {
      color: #fff;
      font-size: 7px;
      padding: 2px 5px;
      border-radius: 3px;
      font-weight: bold;
      display: inline-block;
      margin-left: 4px;
    }
    
    .spell-card.prepared .tag {
      background: ${PREPARED.border};
    }
    
    .spell-card.always-prepared .tag {
      background: ${ALWAYS_PREPARED.border};
    }
    
    .card-meta {
      display: block;
      font-size: 8px;
      color: #666;
      margin-bottom: 8px;
    }
    
    .card-meta span {
      display: inline-block;
      margin-right: 8px;
    }
    
    .card-school {
      color: #5a4fcf;
      font-weight: 500;
    }
    
    .card-description {
      font-size: 9px;
      line-height: 1.4;
      color: #444;
      margin-bottom: 8px;
      text-align: justify;
      white-space: pre-line;
    }
    
    .card-footer {
      display: block;
      font-size: 8px;
      color: #666;
      padding-top: 6px;
      border-top: 1px solid #eee;
      overflow: hidden;
    }
    
    .card-components {
      float: left;
    }
    
    .card-duration {
      float: right;
    }
    
    .card-higher-levels {
      margin-top: 6px;
      font-size: 8px;
      font-style: italic;
      color: #555;
      white-space: pre-line;
    }
  `
  
  style.textContent = format === 'cards' ? cardsStyles : listStyles
  
  // Create wrapper with inline styles
  const wrapper = document.createElement('div')
  wrapper.style.cssText = `
    font-family: 'Georgia', serif;
    font-size: 10px;
    line-height: 1.25;
    color: #333;
    padding: 0;
    width: 100%;
    min-height: auto;
  `
  wrapper.appendChild(style)
  wrapper.appendChild(container)
  
  // Apply styles directly to elements for html2pdf compatibility
  wrapper.querySelectorAll('h1').forEach(el => {
    el.style.cssText = 'font-size: 20px; margin-bottom: 6px; margin-top: 0; color: #1a1a2e; border-bottom: 2px solid #8b0000; padding-bottom: 4px; page-break-after: avoid;'
  })

  wrapper.querySelectorAll('.legend').forEach(el => {
    el.style.cssText = 'margin: 0 0 10px 0; font-size: 9px; page-break-after: avoid;'
  })

  wrapper.querySelectorAll('.legend-item').forEach(el => {
    const colors = el.classList.contains('always-prepared') ? ALWAYS_PREPARED : PREPARED
    el.style.cssText = `display: inline-block; margin-right: 14px; font-weight: bold; color: ${colors.name};`
  })

  wrapper.querySelectorAll('.toc').forEach(el => {
    el.style.cssText = 'margin: 0 0 12px 0; padding-bottom: 8px; border-bottom: 1px solid #ccc;'
  })

  wrapper.querySelectorAll('.toc-level').forEach(el => {
    el.style.cssText = 'margin-bottom: 6px;'
  })

  wrapper.querySelectorAll('.toc-level-title').forEach(el => {
    el.style.cssText = 'font-size: 10px; font-weight: bold; color: #2d2d44; margin: 0 0 2px 0;'
  })

  wrapper.querySelectorAll('.toc-list').forEach(el => {
    el.style.cssText = 'overflow: hidden;'
  })

  wrapper.querySelectorAll('.toc-link').forEach(el => {
    const colors = el.classList.contains('always-prepared') ? ALWAYS_PREPARED : PREPARED
    el.style.cssText = `display: block; float: left; width: 50%; box-sizing: border-box; padding: 1px 8px 1px 0; font-size: 9px; text-decoration: underline; line-height: 1.35; color: ${colors.name};`
  })

  wrapper.querySelectorAll('.toc-legend').forEach(el => {
    el.style.cssText = 'font-size: 8px; color: #666; margin: 0 0 6px 0;'
  })

  wrapper.querySelectorAll('.spell-icon').forEach(el => {
    el.style.cssText = 'display: inline-block; width: 11px; height: 11px; vertical-align: -1px; color: #111; line-height: 0;'
  })

  wrapper.querySelectorAll('.spell-icon svg').forEach(el => {
    el.style.cssText = 'width: 11px; height: 11px; display: block;'
  })

  wrapper.querySelectorAll('.spell-icon-stats').forEach(el => {
    el.style.cssText = 'margin: 2px 0 4px 0; overflow: hidden;'
  })

  wrapper.querySelectorAll('.spell-icon-stat').forEach(el => {
    el.style.cssText = 'display: block; float: left; width: 50%; box-sizing: border-box; padding: 1px 8px 1px 0; font-size: 8px; color: #444; line-height: 1.35;'
  })

  wrapper.querySelectorAll('h2').forEach(el => {
    el.style.cssText = 'font-size: 14px; margin-top: 10px; margin-bottom: 6px; color: #2d2d44; border-bottom: 1px solid #ccc; padding-bottom: 2px; page-break-after: avoid; page-break-before: auto;'
  })
  
  if (format === 'list') { 
    wrapper.querySelectorAll('.spell-block').forEach(el => {
      const colors = el.classList.contains('always-prepared') ? ALWAYS_PREPARED : PREPARED
      el.style.cssText = `page-break-inside: avoid; break-inside: avoid; margin-bottom: 8px; padding: 6px 8px; background: ${colors.background}; border-left: 3px solid ${colors.border};`
    })

    wrapper.querySelectorAll('h3').forEach(el => {
      const colors = el.closest('.spell-block')?.classList.contains('always-prepared') ? ALWAYS_PREPARED : PREPARED
      el.style.cssText = `font-size: 11px; margin-bottom: 3px; color: ${colors.name}; page-break-after: avoid;`
    })
    
    wrapper.querySelectorAll('ul').forEach(el => {
      el.style.cssText = 'margin: 2px 0; padding-left: 14px; list-style: none;'
    })
    
    wrapper.querySelectorAll('li').forEach(el => {
      el.style.cssText = 'margin: 1px 0; font-size: 9px;'
    })
    
    wrapper.querySelectorAll('.description').forEach(el => {
      el.style.cssText = 'margin: 4px 0; font-size: 9px; text-align: justify; white-space: pre-line;'
    })
    
    wrapper.querySelectorAll('.higher-levels').forEach(el => {
      el.style.cssText = 'margin-top: 3px; font-size: 9px; font-style: italic; color: #555; white-space: pre-line;'
    })
  } else {
    // Apply card-specific styles using float for better PDF compatibility
    wrapper.querySelectorAll('.cards-container').forEach(el => {
      el.style.cssText = 'display: block; width: 100%;'
    })
    
    wrapper.querySelectorAll('.card-row').forEach(el => {
      el.style.cssText = 'display: table; width: 100%; table-layout: fixed; margin-bottom: 12px; page-break-inside: avoid !important; break-inside: avoid !important; -webkit-region-break-inside: avoid; orphans: 2; widows: 2;'
    })
    
    const cards = wrapper.querySelectorAll('.spell-card')
    cards.forEach((el, index) => {
      const isFirstInRow = index % 2 === 0
      const colors = el.classList.contains('always-prepared') ? ALWAYS_PREPARED : PREPARED
      const borderWidth = el.classList.contains('always-prepared') ? '2px' : '1px'
      el.style.cssText = `display: table-cell; page-break-inside: avoid !important; break-inside: avoid !important; -webkit-region-break-inside: avoid; border: ${borderWidth} solid ${colors.border}; border-radius: 4px; padding: 10px; background: ${colors.background}; box-shadow: 0 1px 3px rgba(0,0,0,0.1); width: 49%; vertical-align: top; box-sizing: border-box;` + (isFirstInRow ? ' padding-right: 12px;' : '')
    })
    
    wrapper.querySelectorAll('.spell-card-empty').forEach(el => {
      el.style.cssText = 'display: table-cell; width: 49%; visibility: hidden;'
    })
    
    wrapper.querySelectorAll('.card-header').forEach(el => {
      const colors = el.closest('.spell-card')?.classList.contains('always-prepared') ? ALWAYS_PREPARED : PREPARED
      el.style.cssText = `display: block; margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px solid ${colors.headerBorder}; overflow: hidden;`
    })
    
    wrapper.querySelectorAll('.card-name').forEach(el => {
      const colors = el.closest('.spell-card')?.classList.contains('always-prepared') ? ALWAYS_PREPARED : PREPARED
      el.style.cssText = `font-size: 12px; font-weight: bold; color: ${colors.name}; float: left; max-width: 75%;`
    })
    
    wrapper.querySelectorAll('.card-tags').forEach(el => {
      el.style.cssText = 'float: right; display: inline-block;'
    })
    
    wrapper.querySelectorAll('.tag').forEach(el => {
      const colors = el.closest('.spell-card')?.classList.contains('always-prepared') ? ALWAYS_PREPARED : PREPARED
      el.style.cssText = `background: ${colors.border}; color: #fff; font-size: 7px; padding: 2px 5px; border-radius: 3px; font-weight: bold; display: inline-block; margin-left: 4px;`
    })
    
    wrapper.querySelectorAll('.card-meta').forEach(el => {
      el.style.cssText = 'display: block; font-size: 8px; color: #666; margin-bottom: 8px;'
    })
    
    wrapper.querySelectorAll('.card-meta span').forEach(el => {
      el.style.cssText = 'display: inline-block; margin-right: 8px;'
    })
    
    wrapper.querySelectorAll('.card-school').forEach(el => {
      el.style.cssText = 'color: #5a4fcf; font-weight: 500;'
    })
    
    wrapper.querySelectorAll('.card-description').forEach(el => {
      el.style.cssText = 'font-size: 9px; line-height: 1.4; color: #444; margin-bottom: 8px; text-align: justify; white-space: pre-line;'
    })
    
    wrapper.querySelectorAll('.card-footer').forEach(el => {
      el.style.cssText = 'display: block; font-size: 8px; color: #666; padding-top: 6px; border-top: 1px solid #eee; overflow: hidden;'
    })
    
    wrapper.querySelectorAll('.card-components').forEach(el => {
      el.style.cssText = 'float: left;'
    })
    
    wrapper.querySelectorAll('.card-duration').forEach(el => {
      el.style.cssText = 'float: right;'
    })
    
    wrapper.querySelectorAll('.card-higher-levels').forEach(el => {
      el.style.cssText = 'margin-top: 6px; font-size: 8px; font-style: italic; color: #555; white-space: pre-line;'
    })
  }

  const now = new Date()
  const dateStr = now.toISOString().split('T')[0]
  const classPart = filenamePart(meta.selectedClass)
  const versionPart = meta.version === '2014' ? '2014' : '2024'
  const filename = `spells-${classPart}-${versionPart}-${dateStr}.pdf`

  const opt = {
    margin: [10, 12, 10, 12], // top, right, bottom, left in mm
    filename: filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
      scale: 2,
      useCORS: true,
      logging: false,
      windowWidth: 794, // A4 width in pixels at 96 DPI
      windowHeight: 1123 // A4 height in pixels at 96 DPI
    },
    jsPDF: { 
      unit: 'mm', 
      format: 'a4', 
      orientation: 'portrait'
    },
    enableLinks: false,
    pagebreak: format === 'cards' ? { 
      mode: ['avoid-all', 'css', 'legacy'],
      before: '.page-break-before',
      after: '.page-break-after',
      avoid: ['.spell-card', '.card-row']
    } : {
      mode: ['avoid-all', 'css'],
      before: '.page-break-before',
      after: '.page-break-after',
      avoid: '.spell-block'
    }
  }

  let internalLinks = []

  const blob = await new Promise((resolve, reject) => {
    html2pdf()
      .set(opt)
      .from(wrapper)
      .toContainer()
      .then(function captureInternalLinks() {
        internalLinks = collectInternalLinks(
          this.prop.container,
          this.prop.pageSize,
          this.opt.margin
        )
      })
      .toPdf()
      .get('pdf')
      .then((pdf) => {
        applyInternalLinks(pdf, internalLinks)
        resolve(pdf.output('blob'))
      })
      .catch(reject)
  })
  const file = new File([blob], filename, { type: 'application/pdf' })
  const url = URL.createObjectURL(file)

  return { url, filename }
}
