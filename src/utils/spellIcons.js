import schoolAbjuration from '../assets/icons/school-abjuration.svg?raw'
import schoolConjuration from '../assets/icons/school-conjuration.svg?raw'
import schoolDivination from '../assets/icons/school-divination.svg?raw'
import schoolEnchantment from '../assets/icons/school-enchantment.svg?raw'
import schoolEvocation from '../assets/icons/school-evocation.svg?raw'
import schoolIllusion from '../assets/icons/school-illusion.svg?raw'
import schoolNecromancy from '../assets/icons/school-necromancy.svg?raw'
import schoolTransmutation from '../assets/icons/school-transmutation.svg?raw'
import paramCasting from '../assets/icons/param-casting.svg?raw'
import paramRange from '../assets/icons/param-range.svg?raw'
import paramComponents from '../assets/icons/param-components.svg?raw'
import paramDuration from '../assets/icons/param-duration.svg?raw'
import paramConcentration from '../assets/icons/param-concentration.svg?raw'
import paramRitual from '../assets/icons/param-ritual.svg?raw'
import paramUpcast from '../assets/icons/param-upcast.svg?raw'

const SCHOOL_ICONS = {
  'Ограждение': schoolAbjuration,
  'Воплощение': schoolEvocation,
  'Призыв': schoolConjuration,
  'Вызов': schoolConjuration,
  'Прорицание': schoolDivination,
  'Очарование': schoolEnchantment,
  'Иллюзия': schoolIllusion,
  'Некромантия': schoolNecromancy,
  'Преобразование': schoolTransmutation,
}

const PARAM_ICONS = {
  casting: paramCasting,
  range: paramRange,
  components: paramComponents,
  duration: paramDuration,
  concentration: paramConcentration,
  ritual: paramRitual,
  upcast: paramUpcast,
}

const PARAM_TITLES = {
  casting: 'Время накладывания',
  range: 'Дистанция',
  components: 'Компоненты',
  duration: 'Длительность',
  concentration: 'Концентрация',
  ritual: 'Ритуал',
  upcast: 'Повышаемое',
}

export function getSchoolKey(school) {
  return String(school || '').split('(')[0].trim()
}

export function getIconSvg(type, school) {
  if (type === 'school') {
    return SCHOOL_ICONS[getSchoolKey(school)] || null
  }
  return PARAM_ICONS[type] || null
}

export function getIconTitle(type, school) {
  if (type === 'school') return school || 'Школа'
  return PARAM_TITLES[type] || ''
}

export function isUpcastable(spell) {
  if (spell.at_higher_levels && String(spell.at_higher_levels).trim()) return true
  return /(?:^|\n)\s*На\s+(?:более\s+)?высоких\s+уровнях:/i.test(spell.description || '')
}

export function isDunamancy(spell) {
  return /дюнамантия/i.test(spell.school || '')
}

export function spellMatchesQuery(spell, query) {
  const needle = String(query || '').trim().toLowerCase()
  if (!needle) return true
  if (String(spell.name || '').toLowerCase().includes(needle)) return true
  if (String(spell.nameEn || '').toLowerCase().includes(needle)) return true
  return false
}

export function formatComponents(spell) {
  return (spell.components || [])
    .map((component) => (component === 'М' && spell.material ? `М (${spell.material})` : component))
    .join(', ') || '—'
}

function wrapIcon(svg, title, className = '') {
  if (!svg) return ''
  const classes = ['spell-icon', className].filter(Boolean).join(' ')
  return `<span class="${classes}" title="${escapeHtml(title)}" aria-label="${escapeHtml(title)}">${svg}</span>`
}

export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function compactMetaHTML(spell) {
  const schoolTitle = spell.school || 'Школа'
  let html = '<span class="spell-compact-badges">'
  html += wrapIcon(getIconSvg('school', spell.school), schoolTitle, 'spell-icon--school')
  html += `<span class="spell-compact-school">${escapeHtml(schoolTitle)}</span>`
  if (spell.concentration) {
    html += wrapIcon(getIconSvg('concentration'), PARAM_TITLES.concentration)
  }
  if (spell.ritual) {
    html += wrapIcon(getIconSvg('ritual'), PARAM_TITLES.ritual)
  }
  html += '</span>'
  return html
}

export function tocIconsHTML(spell) {
  let html = '<span class="toc-icons">'
  html += wrapIcon(getIconSvg('school', spell.school), spell.school || 'Школа', 'spell-icon--school')
  if (spell.concentration) {
    html += wrapIcon(getIconSvg('concentration'), PARAM_TITLES.concentration)
  }
  if (spell.ritual) {
    html += wrapIcon(getIconSvg('ritual'), PARAM_TITLES.ritual)
  }
  html += '</span>'
  return html
}

function statHTML(type, text, extraClass = '') {
  return `<div class="spell-icon-stat ${extraClass}">${wrapIcon(getIconSvg(type), PARAM_TITLES[type])}<span>${escapeHtml(text)}</span></div>`
}

export function detailedMetaHTML(spell, { componentsText, durationText } = {}) {
  let html = '<div class="spell-icon-stats">'
  html += `<div class="spell-icon-stat">${wrapIcon(getIconSvg('school', spell.school), spell.school || 'Школа', 'spell-icon--school')}<span>${escapeHtml(spell.school || '—')}</span></div>`
  html += statHTML('casting', spell.casting_time || '—')
  html += statHTML('range', spell.range || '—')
  html += statHTML('components', componentsText || formatComponents(spell))
  html += statHTML('duration', durationText || spell.duration || '—')
  if (spell.concentration) {
    html += statHTML('concentration', 'Концентрация')
  }
  if (spell.ritual) {
    html += statHTML('ritual', 'Ритуал')
  }
  if (isUpcastable(spell)) {
    html += statHTML('upcast', 'Повышаемое')
  }
  html += '</div>'
  return html
}

export { PARAM_TITLES }
