import html2pdf from 'html2pdf.js'

function generateHTMLList(spells) {
  // Group spells by level
  const groupedSpells = spells.reduce((groups, spell) => {
    const level = spell.level
    if (!groups[level]) {
      groups[level] = []
    }
    groups[level].push(spell)
    return groups
  }, {})

  const sortedLevels = Object.keys(groupedSpells).map(Number).sort((a, b) => a - b)

  let html = '<h1>Подготовленные заклинания</h1>'

  for (const level of sortedLevels) {
    const levelTitle = level === 0 ? 'Заговоры' : `${level} уровень`
    html += `<h2>${levelTitle}</h2>`

    for (const spell of groupedSpells[level]) {
      // Wrap each spell in a div with page-break-inside: avoid
      html += '<div class="spell-block">'
      html += `<h3>${spell.name}</h3>`
      html += '<ul>'
      html += `<li><strong>Школа:</strong> ${spell.school}</li>`
      html += `<li><strong>Время накладывания:</strong> ${spell.casting_time}</li>`
      html += `<li><strong>Дистанция:</strong> ${spell.range}</li>`
      const componentsText = spell.components
        .map(component => (component === 'M' && spell.material ? `M (${spell.material})` : component))
        .join(', ')
      html += `<li><strong>Компоненты:</strong> ${componentsText}</li>`
      html += `<li><strong>Длительность:</strong> ${spell.duration}${spell.concentration ? ' (Концентрация)' : ''}</li>`
      if (spell.ritual) {
        html += '<li><strong>Ритуал:</strong> Да</li>'
      }
      html += '</ul>'
      html += `<p class="description">${spell.description}</p>`
      
      if (spell.at_higher_levels) {
        html += `<p class="higher-levels"><strong>На более высоких уровнях:</strong> ${spell.at_higher_levels}</p>`
      }
      
      html += '</div>'
    }
  }

  return html
}

function generateHTMLCards(spells) {
  let html = '<h1>Подготовленные заклинания</h1>'
  html += '<div class="cards-container">'

  for (let i = 0; i < spells.length; i++) {
    const spell = spells[i]
    const tags = []
    if (spell.concentration) tags.push('К')
    if (spell.ritual) tags.push('Р')
    
    const componentsText = spell.components
      .map(component => (component === 'M' && spell.material ? `M (${spell.material})` : component))
      .join(', ')

    // Start a new row every 2 cards
    if (i % 2 === 0) {
      html += '<div class="card-row">'
    }

    html += '<div class="spell-card">'
    html += '<div class="card-header">'
    html += `<span class="card-name">${spell.name}</span>`
    if (tags.length > 0) {
      html += '<span class="card-tags">'
      tags.forEach(tag => {
        html += `<span class="tag">${tag}</span>`
      })
      html += '</span>'
    }
    html += '</div>'
    
    html += '<div class="card-meta">'
    html += `<span class="card-school">${spell.school}</span>`
    html += `<span class="card-casting-time">${spell.casting_time}</span>`
    html += `<span class="card-range">${spell.range}</span>`
    html += '</div>'
    
    html += `<p class="card-description">${spell.description}</p>`
    
    html += '<div class="card-footer">'
    html += `<span class="card-components">${componentsText}</span>`
    html += `<span class="card-duration">${spell.duration}</span>`
    html += '</div>'
    
    if (spell.at_higher_levels) {
      html += `<p class="card-higher-levels"><strong>На более высоких уровнях:</strong> ${spell.at_higher_levels}</p>`
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

export function generatePDF(spells, format = 'list') {
  const html = format === 'cards' ? generateHTMLCards(spells) : generateHTMLList(spells)
  
  // Create a container with styling for the PDF
  const container = document.createElement('div')
  container.innerHTML = html
  
  // Add styles via a style element for better control
  const style = document.createElement('style')
  
  const listStyles = `
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
      margin-bottom: 12px;
      margin-top: 0;
      color: #1a1a2e;
      border-bottom: 2px solid #8b0000;
      padding-bottom: 4px;
      page-break-after: avoid;
    }
    
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
    
    h3 {
      font-size: 11px;
      margin-bottom: 3px;
      color: #8b0000;
      page-break-after: avoid;
    }
    
    .spell-block {
      page-break-inside: avoid;
      break-inside: avoid;
      margin-bottom: 8px;
      padding: 6px 8px;
      background: #fafafa;
      border-left: 2px solid #8b0000;
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
    }
    
    .higher-levels {
      margin-top: 3px;
      font-size: 9px;
      font-style: italic;
      color: #555;
    }
  `
  
  const cardsStyles = `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Georgia', serif;
      font-size: 10px;
      line-height: 1.4;
      color: #333;
    }
    
    h1 {
      font-size: 20px;
      margin-bottom: 12px;
      margin-top: 0;
      color: #1a1a2e;
      border-bottom: 2px solid #8b0000;
      padding-bottom: 4px;
      page-break-after: avoid;
    }
    
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
      border: 1px solid #ccc;
      border-radius: 4px;
      padding: 10px;
      background: #fafafa;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      width: 49%;
      vertical-align: top;
      box-sizing: border-box;
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
      border-bottom: 1px solid #ddd;
      overflow: hidden;
    }
    
    .card-name {
      font-size: 12px;
      font-weight: bold;
      color: #8b0000;
      float: left;
      max-width: 75%;
    }
    
    .card-tags {
      float: right;
      display: inline-block;
    }
    
    .tag {
      background: #8b0000;
      color: #fff;
      font-size: 7px;
      padding: 2px 5px;
      border-radius: 3px;
      font-weight: bold;
      display: inline-block;
      margin-left: 4px;
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
    el.style.cssText = 'font-size: 20px; margin-bottom: 12px; margin-top: 0; color: #1a1a2e; border-bottom: 2px solid #8b0000; padding-bottom: 4px; page-break-after: avoid;'
  })
  
  if (format === 'list') {
    wrapper.querySelectorAll('h2').forEach(el => {
      el.style.cssText = 'font-size: 14px; margin-top: 10px; margin-bottom: 6px; color: #2d2d44; border-bottom: 1px solid #ccc; padding-bottom: 2px; page-break-after: avoid; page-break-before: auto;'
    })
    
    wrapper.querySelectorAll('h3').forEach(el => {
      el.style.cssText = 'font-size: 11px; margin-bottom: 3px; color: #8b0000; page-break-after: avoid;'
    })
    
    wrapper.querySelectorAll('.spell-block').forEach(el => {
      el.style.cssText = 'page-break-inside: avoid; break-inside: avoid; margin-bottom: 8px; padding: 6px 8px; background: #fafafa; border-left: 2px solid #8b0000;'
    })
    
    wrapper.querySelectorAll('ul').forEach(el => {
      el.style.cssText = 'margin: 2px 0; padding-left: 14px; list-style: none;'
    })
    
    wrapper.querySelectorAll('li').forEach(el => {
      el.style.cssText = 'margin: 1px 0; font-size: 9px;'
    })
    
    wrapper.querySelectorAll('.description').forEach(el => {
      el.style.cssText = 'margin: 4px 0; font-size: 9px; text-align: justify;'
    })
    
    wrapper.querySelectorAll('.higher-levels').forEach(el => {
      el.style.cssText = 'margin-top: 3px; font-size: 9px; font-style: italic; color: #555;'
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
      el.style.cssText = 'display: table-cell; page-break-inside: avoid !important; break-inside: avoid !important; -webkit-region-break-inside: avoid; border: 1px solid #ccc; border-radius: 4px; padding: 10px; background: #fafafa; box-shadow: 0 1px 3px rgba(0,0,0,0.1); width: 49%; vertical-align: top; box-sizing: border-box;' + (isFirstInRow ? ' padding-right: 12px;' : '')
    })
    
    wrapper.querySelectorAll('.spell-card-empty').forEach(el => {
      el.style.cssText = 'display: table-cell; width: 49%; visibility: hidden;'
    })
    
    wrapper.querySelectorAll('.card-header').forEach(el => {
      el.style.cssText = 'display: block; margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px solid #ddd; overflow: hidden;'
    })
    
    wrapper.querySelectorAll('.card-name').forEach(el => {
      el.style.cssText = 'font-size: 12px; font-weight: bold; color: #8b0000; float: left; max-width: 75%;'
    })
    
    wrapper.querySelectorAll('.card-tags').forEach(el => {
      el.style.cssText = 'float: right; display: inline-block;'
    })
    
    wrapper.querySelectorAll('.tag').forEach(el => {
      el.style.cssText = 'background: #8b0000; color: #fff; font-size: 7px; padding: 2px 5px; border-radius: 3px; font-weight: bold; display: inline-block; margin-left: 4px;'
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
      el.style.cssText = 'font-size: 9px; line-height: 1.4; color: #444; margin-bottom: 8px; text-align: justify;'
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
      el.style.cssText = 'margin-top: 6px; font-size: 8px; font-style: italic; color: #555;'
    })
  }

  const opt = {
    margin: [10, 12, 10, 12], // top, right, bottom, left in mm
    filename: format === 'cards' ? 'zaklinaniya-kartochkami.pdf' : 'podgotovlennye-zaklinaniya.pdf',
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

  html2pdf().set(opt).from(wrapper).save()
}
