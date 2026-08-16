const STORAGE_KEY = 'spellstopdf:preparedSpells'
const VERSIONS = ['2014', '2024']

function emptyStore() {
  return {
    '2014': new Map(),
    '2024': new Map(),
  }
}

function isPreparedState(value) {
  return value === 1 || value === 2
}

function mapFromRecord(record, validIds) {
  const next = new Map()
  if (!record || typeof record !== 'object' || Array.isArray(record)) {
    return next
  }

  for (const [spellId, state] of Object.entries(record)) {
    if (validIds && !validIds.has(spellId)) continue
    if (isPreparedState(state)) {
      next.set(spellId, state)
    }
  }

  return next
}

function recordFromMap(map) {
  return Object.fromEntries(map)
}

export function loadPreparedByVersion(validIdsByVersion = {}) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyStore()

    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return emptyStore()

    const store = emptyStore()
    for (const version of VERSIONS) {
      store[version] = mapFromRecord(parsed[version], validIdsByVersion[version])
    }
    return store
  } catch {
    return emptyStore()
  }
}

export function savePreparedByVersion(store) {
  try {
    const payload = {}
    for (const version of VERSIONS) {
      payload[version] = recordFromMap(store[version] || new Map())
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch {
    // localStorage может быть недоступен (приватный режим, квота и т.п.)
  }
}
