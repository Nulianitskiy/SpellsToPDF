function SpellCard({ spell, isPrepared, onToggle }) {
  const tags = []
  if (spell.concentration) tags.push('К') // Концентрация
  if (spell.ritual) tags.push('Р') // Ритуал
  const componentsText = spell.components
    .map(component => (component === 'M' && spell.material ? `M (${spell.material})` : component))
    .join(', ')

  return (
    <div className={`spell-card ${isPrepared ? 'prepared' : ''}`}>
      <label className="spell-card-header">
        <input
          type="checkbox"
          checked={isPrepared}
          onChange={onToggle}
        />
        <span className="spell-name">{spell.name}</span>
        {tags.length > 0 && (
          <span className="spell-tags">
            {tags.map(tag => (
              <span key={tag} className="tag" title={tag === 'К' ? 'Концентрация' : 'Ритуал'}>{tag}</span>
            ))}
          </span>
        )}
      </label>
      <div className="spell-meta">
        <span className="school">{spell.school}</span>
        <span className="casting-time">{spell.casting_time}</span>
        <span className="range">{spell.range}</span>
      </div>
      <p className="spell-description">{spell.description}</p>
      <div className="spell-footer">
        <span className="components">{componentsText}</span>
        <span className="duration">{spell.duration}</span>
      </div>
    </div>
  )
}

export default SpellCard
