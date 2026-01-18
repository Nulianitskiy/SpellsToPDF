import html2pdf from 'html2pdf.js'

function generateHTML(spells) {
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

export function generatePDF(spells) {
  const html = generateHTML(spells)
  
  // Create a container with styling for the PDF
  const container = document.createElement('div')
  container.innerHTML = html
  
  // Add styles via a style element for better control
  const style = document.createElement('style')
  style.textContent = `
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
      color: #1a1a2e;
      border-bottom: 2px solid #8b0000;
      padding-bottom: 4px;
    }
    
    h2 {
      font-size: 14px;
      margin-top: 10px;
      margin-bottom: 6px;
      color: #2d2d44;
      border-bottom: 1px solid #ccc;
      padding-bottom: 2px;
    }
    
    h3 {
      font-size: 11px;
      margin-bottom: 3px;
      color: #8b0000;
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
  
  // Create wrapper with inline styles
  const wrapper = document.createElement('div')
  wrapper.style.cssText = `
    font-family: 'Georgia', serif;
    font-size: 10px;
    line-height: 1.25;
    color: #333;
    padding: 10px;
  `
  wrapper.appendChild(style)
  wrapper.appendChild(container)
  
  // Apply styles directly to elements for html2pdf compatibility
  wrapper.querySelectorAll('h1').forEach(el => {
    el.style.cssText = 'font-size: 20px; margin-bottom: 12px; color: #1a1a2e; border-bottom: 2px solid #8b0000; padding-bottom: 4px;'
  })
  
  wrapper.querySelectorAll('h2').forEach(el => {
    el.style.cssText = 'font-size: 14px; margin-top: 10px; margin-bottom: 6px; color: #2d2d44; border-bottom: 1px solid #ccc; padding-bottom: 2px;'
  })
  
  wrapper.querySelectorAll('h3').forEach(el => {
    el.style.cssText = 'font-size: 11px; margin-bottom: 3px; color: #8b0000;'
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

  const opt = {
    margin: [8, 10, 8, 10], // top, right, bottom, left in mm
    filename: 'podgotovlennye-zaklinaniya.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
      scale: 2,
      useCORS: true,
      logging: false
    },
    jsPDF: { 
      unit: 'mm', 
      format: 'a4', 
      orientation: 'portrait'
    },
    pagebreak: { 
      mode: ['avoid-all', 'css', 'legacy'],
      before: '.page-break-before',
      after: '.page-break-after',
      avoid: '.spell-block'
    }
  }

  html2pdf().set(opt).from(wrapper).save()
}
