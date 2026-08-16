export function parseShareUrl(search) {
  const params = new URLSearchParams(search)
  const versionParam = params.get('v')
  const version = versionParam === '2014' || versionParam === '2024' ? versionParam : null
  const selectedClass = params.get('class') || ''
  const preparedIds = splitIds(params.get('p'))
  const alwaysIds = splitIds(params.get('a'))

  return {
    version,
    selectedClass,
    preparedIds,
    alwaysIds,
    hasSpellList: params.has('p') || params.has('a'),
  }
}

export function mapFromShareIds(preparedIds, alwaysIds, validIds) {
  const next = new Map()
  for (const id of preparedIds) {
    if (!validIds || validIds.has(id)) next.set(id, 1)
  }
  for (const id of alwaysIds) {
    if (!validIds || validIds.has(id)) next.set(id, 2)
  }
  return next
}

export function buildShareSearch({ version, selectedClass, preparedMap }) {
  const params = new URLSearchParams()
  if (version) params.set('v', version)
  if (selectedClass) params.set('class', selectedClass)

  const preparedIds = []
  const alwaysIds = []
  for (const [id, state] of preparedMap || []) {
    if (state === 1) preparedIds.push(id)
    if (state === 2) alwaysIds.push(id)
  }
  if (preparedIds.length) params.set('p', preparedIds.join(','))
  if (alwaysIds.length) params.set('a', alwaysIds.join(','))

  return params.toString()
}

function splitIds(value) {
  if (!value) return []
  return String(value)
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)
}
