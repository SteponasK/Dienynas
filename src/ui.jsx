import { useState } from 'react'
import Icon from './icons.jsx'

export function Table({ head, rows, actions, empty = 'Įrašų nėra', onRowClick, selected, title, count }) {
  return (
    <div className="card table-card">
      {title && (
        <div className="card-head">
          <h3>{title}</h3>
          {count != null && <span className="count">{count}</span>}
        </div>
      )}
      {!rows.length ? (
        <div className="empty-state small">
          <Icon name="inbox" size={26} />
          <p>{empty}</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {head.map((h) => <th key={h}>{h}</th>)}
                {actions && <th className="th-actions">Veiksmai</th>}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className={[onRowClick && 'clickable', selected === r.id && 'selected'].filter(Boolean).join(' ')} onClick={onRowClick ? () => onRowClick(r) : undefined}>
                  {r.cells.map((c, j) => <td key={j}>{c}</td>)}
                  {actions && (
                    <td className="td-actions">
                      <div className="row-actions" onClick={(e) => e.stopPropagation()}>{actions(r)}</div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// Forma su patikra (kaip sekų diagramose): tuščia / neteisinga forma -> klaidos pranešimas.
// validate(values) gali grąžinti papildomą klaidos tekstą.
export function Form({ fields, initial = {}, submitLabel = 'Išsaugoti', submitIcon = 'check', onSubmit, onCancel, validate, extraActions, narrow }) {
  const [values, setValues] = useState(() => Object.fromEntries(fields.map((f) => [f.name, initial[f.name] ?? ''])))
  const [error, setError] = useState(null)
  const [touched, setTouched] = useState(false)
  const set = (name, v) => setValues((s) => ({ ...s, [name]: v }))

  const submit = (e) => {
    e.preventDefault()
    setTouched(true)
    const empty = fields.filter((f) => !f.optional && !String(values[f.name] ?? '').trim())
    if (empty.length) return setError(`Forma neužpildyta: ${empty.map((f) => f.label).join(', ')}`)
    const custom = validate?.(values)
    if (custom) return setError(custom)
    setError(null)
    onSubmit(values)
  }

  const invalid = (f) => touched && !f.optional && !String(values[f.name] ?? '').trim()

  return (
    <form className={`card form ${narrow ? 'narrow' : ''}`} onSubmit={submit} noValidate>
      <div className="form-grid">
        {fields.map((f) => (
          <label key={f.name} className={`field ${f.type === 'textarea' || f.wide ? 'wide' : ''} ${invalid(f) ? 'invalid' : ''}`}>
            <span className="field-label">
              {f.label}
              {f.optional ? <em>neprivaloma</em> : <b>*</b>}
            </span>
            {f.type === 'select' ? (
              <select name={f.name} value={values[f.name]} onChange={(e) => set(f.name, e.target.value)}>
                <option value="">Pasirinkite…</option>
                {f.options.map((o) => {
                  const [val, lab] = Array.isArray(o) ? o : [o, o]
                  return <option key={val} value={val}>{lab}</option>
                })}
              </select>
            ) : f.type === 'textarea' ? (
              <textarea name={f.name} rows={5} value={values[f.name]} placeholder={f.placeholder} onChange={(e) => set(f.name, e.target.value)} />
            ) : (
              <input name={f.name} type={f.type || 'text'} value={values[f.name]} placeholder={f.placeholder} onChange={(e) => set(f.name, e.target.value)} />
            )}
          </label>
        ))}
      </div>
      {error && (
        <div className="alert error" role="alert">
          <Icon name="alert" size={18} />
          <span>{error}</span>
        </div>
      )}
      <div className="form-actions">
        <button type="submit" className="primary"><Icon name={submitIcon} size={16} />{submitLabel}</button>
        {onCancel && <button type="button" className="ghost" onClick={onCancel}>Atšaukti</button>}
        {extraActions}
      </div>
    </form>
  )
}

// «boundary» Patvirtinimo langas – naudojamas visuose trynimo PA.
export function ConfirmDialog({ text, onYes, onNo }) {
  return (
    <div className="modal-backdrop" onClick={onNo}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="confirm-title" onClick={(e) => e.stopPropagation()}>
        <div className="modal-icon"><Icon name="trash" size={22} /></div>
        <h2 id="confirm-title">Patvirtinimo langas</h2>
        <span className="stereo">«boundary» Patvirtinimo langas</span>
        <p>{text}</p>
        <p className="muted small">Šio veiksmo atšaukti nebus galima.</p>
        <div className="modal-actions">
          <button className="ghost" onClick={onNo}>Ne, palikti</button>
          <button className="danger-fill" onClick={onYes}><Icon name="trash" size={16} />Taip, ištrinti</button>
        </div>
      </div>
    </div>
  )
}

export function Badge({ children }) {
  const cls = { Patvirtinta: 'ok', Atmesta: 'bad', 'Laukia patvirtinimo': 'wait', Aktyvus: 'ok', Neaktyvus: 'bad', Administratorius: 'violet', Mokytojas: 'sky', Mokinys: 'amber' }[children] || ''
  return <span className={`badge ${cls}`}>{children}</span>
}

const AVATAR_TONES = ['indigo', 'emerald', 'rose', 'amber', 'sky', 'violet', 'orange']
export function Avatar({ user, size = 36 }) {
  if (!user) return null
  const initials = `${user.vardas?.[0] ?? ''}${user.pavarde?.[0] ?? ''}`.toUpperCase()
  return (
    <span className={`avatar tone-${AVATAR_TONES[user.id % AVATAR_TONES.length]}`} style={{ width: size, height: size, fontSize: size * 0.38 }}>
      {initials}
    </span>
  )
}

export function Person({ user, sub }) {
  return (
    <span className="person">
      <Avatar user={user} size={30} />
      <span>
        <span className="person-name">{fullName(user)}</span>
        {sub && <small>{sub}</small>}
      </span>
    </span>
  )
}

export function Grade({ value }) {
  const v = Number(value)
  const tone = v >= 9 ? 'ok' : v >= 7 ? 'sky' : v >= 5 ? 'wait' : 'bad'
  return <span className={`grade ${tone}`}>{value}</span>
}

const SUBJECT_TONES = { Matematika: 'indigo', 'Lietuvių k.': 'rose', 'Anglų k.': 'sky', Istorija: 'amber', Fizika: 'emerald' }
export const subjectTone = (d) => SUBJECT_TONES[d] || 'slate'
export function Subject({ name }) {
  return <span className={`subject tone-${subjectTone(name)}`}><i />{name}</span>
}

export function Toolbar({ children }) {
  return <div className="toolbar">{children}</div>
}

export const today = () => new Date().toISOString().slice(0, 10)
export const nextId = (arr) => Math.max(0, ...arr.map((x) => x.id)) + 1
export const fullName = (u) => (u ? `${u.vardas} ${u.pavarde}` : '—')
const MENESIAI = ['saus.', 'vas.', 'kov.', 'bal.', 'geg.', 'birž.', 'liep.', 'rugp.', 'rugs.', 'spal.', 'lapkr.', 'gruod.']
export const fmtDate = (s) => {
  if (!s) return '—'
  const [, m, d] = s.split('-').map(Number)
  return `${MENESIAI[m - 1]} ${d} d.`
}

// ISO savaitės raktas – PA „Kurti pažymį“ patikrai (ne daugiau vieno pažymio per savaitę tam dalykui).
export function weekKey(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  const day = (d.getDay() + 6) % 7
  d.setDate(d.getDate() - day + 3)
  const firstThu = new Date(d.getFullYear(), 0, 4)
  const week = 1 + Math.round(((d - firstThu) / 86400000 - 3 + ((firstThu.getDay() + 6) % 7)) / 7)
  return `${d.getFullYear()}-W${week}`
}
