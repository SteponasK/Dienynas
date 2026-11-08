import { useState } from 'react'
import { Table, Form, Badge, Avatar, Person, Grade, Subject, Toolbar, subjectTone, today, nextId, fullName, fmtDate, weekKey } from './ui.jsx'
import Icon from './icons.jsx'
import { KLASES, DALYKAI, DIENOS, LAIKAI, TIPAI, mokytojasFor } from './data.js'

const SYSTEM_EMAIL = 'sistema@dienynas.lt'
const isTeacher = (u) => u.tipas === 'Mokytojas'
const isStudent = (u) => u.tipas === 'Mokinys'
const isAdmin = (u) => u.tipas === 'Administratorius'
const byId = (arr, id) => arr.find((x) => x.id === Number(id))
const avgOf = (list) => (list.length ? list.reduce((a, b) => a + Number(b), 0) / list.length : 0)
const fmtAvg = (n) => n.toFixed(2).replace('.', ',')

const EditBtn = ({ onClick, label = 'Redaguoti' }) => (
  <button onClick={onClick}><Icon name="edit" size={15} />{label}</button>
)
const DeleteBtn = ({ onClick, disabled, title }) => (
  <button className="danger" onClick={onClick} disabled={disabled} title={title}><Icon name="trash" size={15} />Šalinti</button>
)

/* ---------- Prisijungimo langas (PA „Prisijungti“) ---------- */
export function Prisijungimas({ db, login, go, resetDemo }) {
  const quick = (email) => {
    const u = db.naudotojai.find((x) => x.email === email)
    if (u) {
      login(u)
      go('pagrindinis')
    }
  }
  return (
    <div className="login-page">
      <aside className="login-hero">
        <div className="brand hero-brand">
          <span className="brand-logo"><Icon name="school" size={22} /></span>
          <span className="brand-text"><strong>Elektroninis dienynas</strong><small>Mokyklos informacinė sistema</small></span>
        </div>
        <div className="hero-copy">
          <h2>Visa mokyklos informacija vienoje vietoje</h2>
          <p>Pažymiai, tvarkaraštis, namų darbai, socialinė veikla ir žinutės – mokytojams, mokiniams ir administracijai.</p>
          <ul className="hero-features">
            <li><Icon name="award" size={18} /> Pažymiai ir automatiniai vidurkiai</li>
            <li><Icon name="calendar" size={18} /> Savaitės tvarkaraštis</li>
            <li><Icon name="book" size={18} /> Namų darbai su terminais</li>
            <li><Icon name="heart" size={18} /> Socialinės veiklos valandos</li>
          </ul>
        </div>
        <div className="hero-blob a" />
        <div className="hero-blob b" />
      </aside>

      <main className="login-main">
        <div className="login-card">
          <div className="page-title compact">
            <div>
              <h1>Prisijungimo langas</h1>
              <p>Prisijunkite prie savo paskyros</p>
            </div>
          </div>
          <span className="stereo">«boundary» Prisijungimo langas</span>
          <Form
            fields={[
              { name: 'email', label: 'El. paštas', type: 'email', placeholder: 'vardas@mokykla.lt', wide: true },
              { name: 'slaptazodis', label: 'Slaptažodis', type: 'password', placeholder: '••••••••', wide: true },
            ]}
            submitLabel="Prisijungti"
            submitIcon="chevron"
            validate={(v) => {
              const u = db.naudotojai.find((x) => x.email === v.email.trim() && x.slaptazodis === v.slaptazodis)
              if (!u) return 'Neteisingi prisijungimo duomenys'
              if (u.busena !== 'Aktyvus') return 'Naudotojo paskyra neaktyvi'
            }}
            onSubmit={(v) => {
              login(db.naudotojai.find((x) => x.email === v.email.trim()))
              go('pagrindinis')
            }}
          />
          <div className="demo-box">
            <div className="demo-head">
              <Icon name="info" size={16} />
              <span>Demo paskyros · slaptažodis <code>demo</code></span>
            </div>
            <div className="demo-list">
              {[
                ['admin@mokykla.lt', 'Administratorius'],
                ['jonas@mokykla.lt', 'Mokytojas'],
                ['ona@mokykla.lt', 'Mokinys'],
              ].map(([email, role]) => {
                const u = db.naudotojai.find((x) => x.email === email)
                return (
                  <button key={email} type="button" className="demo-user" onClick={() => quick(email)} disabled={!u}>
                    <Avatar user={u} size={32} />
                    <span><strong>{role}</strong><small>{email}</small></span>
                    <Icon name="chevron" size={16} />
                  </button>
                )
              })}
            </div>
            <button className="link small" onClick={resetDemo}><Icon name="refresh" size={14} />Atstatyti demo duomenis</button>
          </div>
        </div>
      </main>
    </div>
  )
}

/* ---------- Pagrindinis langas ---------- */
function todayLabel() {
  const d = new Date()
  const weekday = d.toLocaleDateString('lt-LT', { weekday: 'long' })
  const month = d.toLocaleDateString('lt-LT', { month: 'long', day: 'numeric' })
  return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)}, ${month}`
}

export function Pagrindinis({ go, user, db }) {
  const unread = db.zinutes.filter((z) => z.kam === user.email).length
  const myGrades = db.pazymiai.filter((g) => g.mokinysId === user.id)
  const pendingSoc = db.socVeiklos.filter((s) => s.statusas === 'Laukia patvirtinimo').length
  const hw = isStudent(user) ? db.namuDarbai.filter((h) => h.klase === user.klase) : db.namuDarbai

  const stats = isAdmin(user)
    ? [
        ['Naudotojai', db.naudotojai.length, 'users', 'violet'],
        ['Pamokos per savaitę', db.pamokos.length, 'calendar', 'emerald'],
        ['Klasės', KLASES.length, 'school', 'indigo'],
        ['Gauti laiškai', unread, 'mail', 'sky'],
      ]
    : isTeacher(user)
      ? [
          ['Įrašyti pažymiai', db.pazymiai.length, 'award', 'amber'],
          ['Laukia patvirtinimo', pendingSoc, 'heart', 'rose'],
          ['Namų darbai', hw.length, 'book', 'orange'],
          ['Gauti laiškai', unread, 'mail', 'sky'],
        ]
      : [
          ['Bendras vidurkis', myGrades.length ? fmtAvg(avgOf(myGrades.map((g) => g.pazymys))) : '—', 'trend', 'amber'],
          ['Soc. valandos', db.socVeiklos.filter((s) => s.mokinysId === user.id && s.statusas === 'Patvirtinta').reduce((a, s) => a + Number(s.valandos), 0), 'heart', 'rose'],
          ['Namų darbai', hw.length, 'book', 'orange'],
          ['Gauti laiškai', unread, 'mail', 'sky'],
        ]

  const tiles = [
    ['naudotojai', 'Naudotojai', 'Registruoti, redaguoti ir šalinti naudotojus', 'users', 'violet', isAdmin(user)],
    ['pazymiai', 'Pažymiai', isTeacher(user) ? 'Įrašyti, redaguoti ir šalinti pažymius' : 'Peržiūrėti pažymius ir vidurkius', 'award', 'amber', true],
    ['tvarkarastis', 'Tvarkaraštis', isAdmin(user) ? 'Generuoti tvarkaraštį ir valdyti pamokas' : 'Savaitės pamokų tvarkaraštis', 'calendar', 'emerald', true],
    ['namuDarbai', 'Namų darbai', isTeacher(user) ? 'Užduoti ir valdyti namų darbus' : 'Užduotys ir terminai', 'book', 'orange', true],
    ['socVeikla', 'Soc. veikla', isStudent(user) ? 'Registruoti savo socialines veiklas' : isTeacher(user) ? 'Tvirtinti mokinių socialines veiklas' : 'Peržiūrėti socialines veiklas', 'heart', 'rose', true],
    ['pastas', 'El. paštas', 'Skaityti ir siųsti žinutes', 'mail', 'sky', true],
    ['slaptazodis', 'Keisti slaptažodį', 'Slaptažodžio keitimas el. paštu', 'key', 'slate', true],
  ].filter((t) => t[5])

  const hour = new Date().getHours()
  const hello = hour < 12 ? 'Labas rytas' : hour < 18 ? 'Laba diena' : 'Labas vakaras'

  return (
    <>
      <section className="welcome">
        <div>
          <span className="stereo light">«boundary» Pagrindinis langas</span>
          <h1>{hello}, {user.vardas}!</h1>
          <p>{todayLabel()} · {user.tipas}{user.klase ? `, ${user.klase} klasė` : ''}</p>
        </div>
        <Avatar user={user} size={64} />
      </section>

      <section className="stats">
        {stats.map(([label, value, icon, tone]) => (
          <div key={label} className="card stat">
            <span className={`stat-icon tone-${tone}`}><Icon name={icon} size={20} /></span>
            <div>
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          </div>
        ))}
      </section>

      <h2 className="section-title">Sistemos dalys</h2>
      <section className="tiles">
        {tiles.map(([id, name, desc, icon, tone]) => (
          <button key={id} className={`tile tone-${tone}`} onClick={() => go(id)}>
            <span className={`tile-icon tone-${tone}`}><Icon name={icon} size={22} /></span>
            <strong>{name}</strong>
            <span>{desc}</span>
            <Icon name="chevron" size={18} className="tile-arrow" />
          </button>
        ))}
      </section>
    </>
  )
}

/* ---------- Naudotojai (Sistemos valdymo posistemė) ---------- */
export function Naudotojai({ db, act, go, confirm, notify, user }) {
  const [filter, setFilter] = useState('')
  const list = db.naudotojai.filter((u) => !filter || u.tipas === filter)
  return (
    <>
      <Toolbar>
        <button className="primary" onClick={() => go('naudotojoRegistravimas')}><Icon name="plus" size={16} />Registruoti naudotoją</button>
        <div className="segmented">
          {[['', 'Visi'], ...TIPAI.map((t) => [t, t])].map(([v, l]) => (
            <button key={l} className={filter === v ? 'active' : ''} onClick={() => setFilter(v)}>{l}</button>
          ))}
        </div>
      </Toolbar>
      <Table
        title="Naudotojai"
        count={list.length}
        head={['Naudotojas', 'Tipas', 'Klasė / dalykai', 'Būsena']}
        rows={list.map((u) => ({ id: u.id, cells: [<Person user={u} sub={u.email} />, <Badge>{u.tipas}</Badge>, u.klase || u.dalykai || '—', <Badge>{u.busena}</Badge>] }))}
        actions={(r) => (
          <>
            <EditBtn onClick={() => go('naudotojoRedagavimas', r.id)} />
            <DeleteBtn
              disabled={r.id === user.id}
              title={r.id === user.id ? 'Negalima ištrinti savęs' : undefined}
              onClick={() =>
                confirm(`Ar tikrai norite ištrinti naudotoją „${fullName(byId(db.naudotojai, r.id))}“?`, () => {
                  act.remove('naudotojai', r.id)
                  notify('Naudotojas ištrintas iš duomenų bazės')
                })
              }
            />
          </>
        )}
      />
    </>
  )
}

const naudotojoLaukai = [
  { name: 'vardas', label: 'Vardas' },
  { name: 'pavarde', label: 'Pavardė' },
  { name: 'email', label: 'El. paštas', type: 'email', placeholder: 'vardas@mokykla.lt' },
  { name: 'tipas', label: 'Naudotojo tipas', type: 'select', options: TIPAI },
  { name: 'klase', label: 'Klasė (mokiniui)', type: 'select', options: KLASES, optional: true },
  { name: 'dalykai', label: 'Dalykai (mokytojui)', optional: true, placeholder: 'pvz. Matematika, Fizika' },
]

const emailTaken = (db, email, exceptId) => db.naudotojai.some((u) => u.email === email.trim() && u.id !== exceptId)

export function NaudotojoRegistravimas({ db, act, go, notify }) {
  return (
    <Form
      fields={naudotojoLaukai}
      submitLabel="Registruoti"
      submitIcon="plus"
      validate={(v) => {
        if (emailTaken(db, v.email)) return 'Naudotojas su tokiu el. paštu jau egzistuoja'
        if (v.tipas === 'Mokinys' && !v.klase) return 'Mokiniui privaloma nurodyti klasę'
      }}
      onSubmit={(v) => {
        act.add('naudotojai', { ...v, email: v.email.trim(), busena: 'Aktyvus', slaptazodis: 'demo' })
        notify('Naujas naudotojas įrašytas į duomenų bazę')
        go('naudotojai')
      }}
      onCancel={() => go('naudotojai')}
    />
  )
}

export function NaudotojoRedagavimas({ db, act, go, notify, param }) {
  const u = byId(db.naudotojai, param)
  if (!u) return <NotFound go={go} back="naudotojai" />
  return (
    <Form
      fields={[...naudotojoLaukai, { name: 'busena', label: 'Būsena', type: 'select', options: ['Aktyvus', 'Neaktyvus'] }]}
      initial={u}
      validate={(v) => (emailTaken(db, v.email, u.id) ? 'Naudotojas su tokiu el. paštu jau egzistuoja' : null)}
      onSubmit={(v) => {
        act.update('naudotojai', u.id, { ...v, email: v.email.trim() })
        notify('Naudotojo pakeitimai išsaugoti')
        go('naudotojai')
      }}
      onCancel={() => go('naudotojai')}
    />
  )
}

/* ---------- Pažymiai ---------- */
export function Pazymiai({ db, act, go, confirm, notify, user }) {
  const students = db.naudotojai.filter(isStudent)
  const grades = isStudent(user) ? db.pazymiai.filter((g) => g.mokinysId === user.id) : db.pazymiai
  const sorted = [...grades].sort((a, b) => b.data.localeCompare(a.data))

  // Vidurkių skaičiavimas (funkcija „Vidutinio pažymio skaičiavimas“)
  const avg = {}
  grades.forEach((g) => {
    const k = `${g.mokinysId}|${g.dalykas}`
    ;(avg[k] ||= []).push(Number(g.pazymys))
  })

  return (
    <>
      {isTeacher(user) && (
        <Toolbar>
          <button className="primary" onClick={() => go('pazymiuForma')}><Icon name="plus" size={16} />Įrašyti pažymį</button>
        </Toolbar>
      )}
      <div className="split">
        <Table
          title={isStudent(user) ? 'Mano pažymiai' : 'Visi pažymiai'}
          count={sorted.length}
          head={['Mokinys', 'Dalykas', 'Pažymys', 'Data', 'Komentaras']}
          rows={sorted.map((g) => ({ id: g.id, cells: [<Person user={byId(students, g.mokinysId)} />, <Subject name={g.dalykas} />, <Grade value={g.pazymys} />, fmtDate(g.data), g.komentaras || <span className="muted">—</span>] }))}
          actions={
            isTeacher(user)
              ? (r) => (
                  <>
                    <EditBtn onClick={() => go('pazymiuForma', r.id)} />
                    <DeleteBtn
                      onClick={() =>
                        confirm('Ar tikrai norite ištrinti šį pažymį?', () => {
                          const g = byId(db.pazymiai, r.id)
                          act.remove('pazymiai', r.id)
                          sendSystemMail(act, db, g.mokinysId, 'Pažymys pašalintas', `Pašalintas ${g.dalykas} pažymys (${g.pazymys}), įrašytas ${g.data}.`)
                          notify('Pažymys ištrintas, pranešimas apie trynimą išsiųstas')
                        })
                      }
                    />
                  </>
                )
              : null
          }
        />
        <div className="card averages">
          <div className="card-head"><h3>Vidurkiai</h3></div>
          {Object.keys(avg).length === 0 && <p className="muted pad">Pažymių dar nėra</p>}
          <ul>
            {Object.entries(avg).map(([k, list]) => {
              const [sid, dalykas] = k.split('|')
              const a = avgOf(list)
              return (
                <li key={k}>
                  <div className="avg-row">
                    <span>
                      <strong>{dalykas}</strong>
                      {!isStudent(user) && <small>{fullName(byId(students, sid))}</small>}
                    </span>
                    <span className="avg-value">{fmtAvg(a)}</span>
                  </div>
                  <div className="bar"><i className={`tone-${subjectTone(dalykas)}`} style={{ width: `${a * 10}%` }} /></div>
                  <small className="muted">{list.length} pažym.</small>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </>
  )
}

function sendSystemMail(act, db, userId, tema, tekstas) {
  const u = byId(db.naudotojai, userId)
  if (u) act.add('zinutes', { nuo: SYSTEM_EMAIL, kam: u.email, tema, tekstas, data: today() })
}

export function PazymiuForma({ db, act, go, notify, param }) {
  const editing = param ? byId(db.pazymiai, param) : null
  if (param && !editing) return <NotFound go={go} back="pazymiai" />
  const students = db.naudotojai.filter(isStudent)
  return (
    <Form
      fields={[
        { name: 'mokinysId', label: 'Mokinys', type: 'select', options: students.map((s) => [String(s.id), `${fullName(s)} (${s.klase})`]) },
        { name: 'dalykas', label: 'Dalykas', type: 'select', options: DALYKAI },
        { name: 'pazymys', label: 'Pažymys', type: 'select', options: ['10', '9', '8', '7', '6', '5', '4', '3', '2', '1'] },
        { name: 'data', label: 'Data', type: 'date' },
        { name: 'komentaras', label: 'Komentaras', optional: true, wide: true, placeholder: 'pvz. Kontrolinis darbas' },
      ]}
      initial={editing ? { ...editing, mokinysId: String(editing.mokinysId), pazymys: String(editing.pazymys) } : { data: today() }}
      validate={(v) => {
        const clash = db.pazymiai.some(
          (g) => g.id !== editing?.id && g.mokinysId === Number(v.mokinysId) && g.dalykas === v.dalykas && weekKey(g.data) === weekKey(v.data),
        )
        if (clash) return 'Šiam mokiniui per šią savaitę šio dalyko pažymys jau įrašytas'
      }}
      onSubmit={(v) => {
        const rec = { ...v, mokinysId: Number(v.mokinysId), pazymys: Number(v.pazymys) }
        if (editing) {
          act.update('pazymiai', editing.id, rec)
          notify('Pažymio pakeitimai išsaugoti')
        } else {
          act.add('pazymiai', rec)
          sendSystemMail(act, db, rec.mokinysId, `Naujas pažymys: ${rec.dalykas}`, `Įrašytas pažymys ${rec.pazymys} (${rec.data}).`)
          notify('Pažymys išsaugotas, pranešimas išsiųstas mokiniui ir tėvams')
        }
        go('pazymiai')
      }}
      onCancel={() => go('pazymiai')}
    />
  )
}

/* ---------- El. paštas ---------- */
export function Pastas({ db, go, user }) {
  const [tab, setTab] = useState('gauti')
  const [open, setOpen] = useState(null)
  const list = db.zinutes
    .filter((z) => (tab === 'gauti' ? z.kam === user.email : z.nuo === user.email))
    .sort((a, b) => b.data.localeCompare(a.data) || b.id - a.id)
  const msg = list.find((z) => z.id === open)
  const userOf = (email) => db.naudotojai.find((x) => x.email === email)
  const who = (email) => (email === SYSTEM_EMAIL ? 'Dienyno sistema' : userOf(email) ? fullName(userOf(email)) : email)
  const AvatarFor = ({ email }) =>
    userOf(email) ? <Avatar user={userOf(email)} size={36} /> : <span className="avatar tone-slate" style={{ width: 36, height: 36 }}><Icon name="school" size={16} /></span>

  return (
    <>
      <Toolbar>
        <button className="primary" onClick={() => go('pastoForma')}><Icon name="plus" size={16} />Naujas laiškas</button>
        <div className="segmented">
          <button className={tab === 'gauti' ? 'active' : ''} onClick={() => { setTab('gauti'); setOpen(null) }}><Icon name="inbox" size={15} />Gauti</button>
          <button className={tab === 'isiusti' ? 'active' : ''} onClick={() => { setTab('isiusti'); setOpen(null) }}><Icon name="send" size={15} />Išsiųsti</button>
        </div>
      </Toolbar>
      <div className="mail">
        <div className="card mail-list">
          {list.length === 0 && (
            <div className="empty-state small"><Icon name="inbox" size={26} /><p>Laiškų nėra</p></div>
          )}
          {list.map((z) => {
            const other = tab === 'gauti' ? z.nuo : z.kam
            return (
              <button key={z.id} className={`mail-item ${open === z.id ? 'active' : ''}`} onClick={() => setOpen(z.id)}>
                <AvatarFor email={other} />
                <span className="mail-item-body">
                  <span className="mail-item-top"><strong>{who(other)}</strong><small>{fmtDate(z.data)}</small></span>
                  <span className="mail-subject">{z.tema}</span>
                  <span className="mail-preview">{z.tekstas}</span>
                </span>
              </button>
            )
          })}
        </div>
        <div className="card mail-view">
          {msg ? (
            <>
              <h3>{msg.tema}</h3>
              <div className="mail-meta">
                <AvatarFor email={msg.nuo} />
                <span>
                  <strong>{who(msg.nuo)}</strong>
                  <small>Kam: {who(msg.kam)} · {msg.data}</small>
                </span>
              </div>
              <p className="mail-text">{msg.tekstas}</p>
              {tab === 'gauti' && msg.nuo !== SYSTEM_EMAIL && (
                <button onClick={() => go('pastoForma', msg.id)}><Icon name="reply" size={16} />Atsakyti</button>
              )}
            </>
          ) : (
            <div className="empty-state"><Icon name="mail" size={30} /><p>Pasirinkite laišką, kad jį perskaitytumėte</p></div>
          )}
        </div>
      </div>
    </>
  )
}

export function PastoForma({ db, act, go, notify, user, param }) {
  const reply = param ? byId(db.zinutes, param) : null
  return (
    <Form
      fields={[
        { name: 'kam', label: 'Gavėjo el. paštas', type: 'email', placeholder: 'vardas@mokykla.lt', wide: true },
        { name: 'tema', label: 'Tema', wide: true },
        { name: 'tekstas', label: 'Žinutė', type: 'textarea', placeholder: 'Jūsų žinutė…' },
      ]}
      initial={reply ? { kam: reply.nuo, tema: reply.tema.startsWith('Re:') ? reply.tema : `Re: ${reply.tema}` } : {}}
      submitLabel="Siųsti"
      submitIcon="send"
      validate={(v) => (db.naudotojai.some((u) => u.email === v.kam.trim()) ? null : 'Adresatas neegzistuoja')}
      onSubmit={(v) => {
        act.add('zinutes', { ...v, kam: v.kam.trim(), nuo: user.email, data: today() })
        notify('Laiškas išsiųstas')
        go('pastas')
      }}
      onCancel={() => go('pastas')}
    />
  )
}

/* ---------- Tvarkaraštis ---------- */
export function Tvarkarastis({ db, go, user }) {
  const [klase, setKlase] = useState(isStudent(user) ? user.klase : '7a')
  const lessons = db.pamokos.filter((p) => p.klase === klase)
  const at = (diena, laikas) => lessons.find((p) => p.diena === diena && p.laikas === laikas)
  const me = fullName(user)
  return (
    <>
      <Toolbar>
        {isAdmin(user) && (
          <>
            <button className="primary" onClick={() => go('tvarkarascioForma')}><Icon name="sparkles" size={16} />Generuoti tvarkaraštį</button>
            <button onClick={() => go('pamokosForma')}><Icon name="plus" size={16} />Nauja pamoka</button>
          </>
        )}
        <div className="segmented push-right">
          {KLASES.map((k) => (
            <button key={k} className={klase === k ? 'active' : ''} onClick={() => setKlase(k)} disabled={isStudent(user) && k !== user.klase}>{k}</button>
          ))}
        </div>
      </Toolbar>
      <div className="card table-card">
        <div className="card-head">
          <h3>{klase} klasės tvarkaraštis</h3>
          <span className="count">{lessons.length} pamokos</span>
        </div>
        <div className="table-wrap">
          <table className="schedule">
            <thead>
              <tr><th className="time-col">Laikas</th>{DIENOS.map((d) => <th key={d}>{d}</th>)}</tr>
            </thead>
            <tbody>
              {LAIKAI.map((l, i) => (
                <tr key={l}>
                  <td className="time-col"><strong>{i + 1}.</strong> {l}</td>
                  {DIENOS.map((d) => {
                    const p = at(d, l)
                    if (!p) return <td key={d}><div className="lesson empty" /></td>
                    const mine = isTeacher(user) && p.mokytojas === me
                    const inner = (
                      <>
                        <strong>{p.dalykas}</strong>
                        <small>{p.mokytojas}</small>
                        {p.kabinetas && <small className="room">kab. {p.kabinetas}</small>}
                      </>
                    )
                    return (
                      <td key={d}>
                        {isAdmin(user) ? (
                          <button className={`lesson tone-${subjectTone(p.dalykas)}`} onClick={() => go('pamokosForma', p.id)} title="Redaguoti pamoką">{inner}</button>
                        ) : (
                          <div className={`lesson tone-${subjectTone(p.dalykas)} ${isTeacher(user) && !mine ? 'dim' : ''}`}>{inner}</div>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {isAdmin(user) && <p className="hint"><Icon name="info" size={14} />Paspauskite pamoką, kad ją redaguotumėte ar pašalintumėte.</p>}
      {isTeacher(user) && <p className="hint"><Icon name="info" size={14} />Ryškiai pažymėtos jūsų vedamos pamokos.</p>}
    </>
  )
}

export function TvarkarascioForma({ db, act, go, notify }) {
  return (
    <Form
      narrow
      fields={[
        { name: 'klase', label: 'Klasė', type: 'select', options: KLASES },
        { name: 'pamokuSk', label: 'Pamokų per dieną', type: 'select', options: ['3', '4', '5'] },
      ]}
      submitLabel="Generuoti"
      submitIcon="sparkles"
      onSubmit={(v) => {
        const n = Number(v.pamokuSk)
        const other = db.pamokos.filter((p) => p.klase !== v.klase)
        let id = nextId(db.pamokos)
        const gen = DIENOS.flatMap((diena, d) =>
          LAIKAI.slice(0, n).map((laikas, l) => {
            const dalykas = DALYKAI[(d * 3 + l + v.klase.charCodeAt(0)) % DALYKAI.length]
            return { id: id++, dalykas, klase: v.klase, mokytojas: mokytojasFor(dalykas), diena, laikas, kabinetas: String(100 + l + 1) }
          }),
        )
        act.set('pamokos', [...other, ...gen])
        notify(`Tvarkaraštis ${v.klase} klasei sugeneruotas (${gen.length} pamokos)`)
        go('tvarkarastis')
      }}
      onCancel={() => go('tvarkarastis')}
    />
  )
}

export function PamokosForma({ db, act, go, notify, confirm, param }) {
  const editing = param ? byId(db.pamokos, param) : null
  if (param && !editing) return <NotFound go={go} back="tvarkarastis" />
  const teachers = db.naudotojai.filter(isTeacher).map(fullName)
  return (
    <Form
      fields={[
        { name: 'dalykas', label: 'Dalykas', type: 'select', options: DALYKAI },
        { name: 'klase', label: 'Klasė', type: 'select', options: KLASES },
        { name: 'mokytojas', label: 'Mokytojas', type: 'select', options: teachers },
        { name: 'kabinetas', label: 'Kabinetas', optional: true, placeholder: 'pvz. 204' },
        { name: 'diena', label: 'Savaitės diena', type: 'select', options: DIENOS },
        { name: 'laikas', label: 'Laikas', type: 'select', options: LAIKAI },
      ]}
      initial={editing || {}}
      validate={(v) =>
        db.pamokos.some((p) => p.id !== editing?.id && p.klase === v.klase && p.diena === v.diena && p.laikas === v.laikas)
          ? 'Šiuo laiku klasė jau turi pamoką'
          : null
      }
      onSubmit={(v) => {
        if (editing) act.update('pamokos', editing.id, v)
        else act.add('pamokos', v)
        notify(editing ? 'Pamokos pakeitimai išsaugoti' : 'Nauja pamoka išsaugota')
        go('tvarkarastis')
      }}
      onCancel={() => go('tvarkarastis')}
      extraActions={
        editing && (
          <button
            type="button"
            className="danger push-right"
            onClick={() =>
              confirm(`Ar tikrai norite ištrinti pamoką „${editing.dalykas}“ (${editing.klase}, ${editing.diena} ${editing.laikas})?`, () => {
                act.remove('pamokos', editing.id)
                notify('Pamoka ištrinta iš duomenų bazės')
                go('tvarkarastis')
              })
            }
          >
            <Icon name="trash" size={16} />Šalinti pamoką
          </button>
        )
      }
    />
  )
}

/* ---------- Soc. veikla ---------- */
export function SocVeikla({ db, act, go, confirm, notify, user }) {
  const students = db.naudotojai.filter(isStudent)
  const list = isStudent(user) ? db.socVeiklos.filter((s) => s.mokinysId === user.id) : db.socVeiklos
  const approvedHours = list.filter((s) => s.statusas === 'Patvirtinta').reduce((a, s) => a + Number(s.valandos), 0)
  const pending = list.filter((s) => s.statusas === 'Laukia patvirtinimo').length
  const GOAL = 10
  return (
    <>
      <Toolbar>
        {isStudent(user) && <button className="primary" onClick={() => go('socVeiklosForma')}><Icon name="plus" size={16} />Nauja soc. veikla</button>}
      </Toolbar>
      {isStudent(user) ? (
        <div className="card progress-card">
          <div>
            <span className="muted">Patvirtinta valandų</span>
            <strong className="big">{approvedHours} <small>/ {GOAL} val.</small></strong>
          </div>
          <div className="bar large"><i className="tone-rose" style={{ width: `${Math.min(100, (approvedHours / GOAL) * 100)}%` }} /></div>
          <span className="muted small">{pending} veikl. laukia mokytojo patvirtinimo</span>
        </div>
      ) : isTeacher(user) && pending > 0 ? (
        <div className="alert info"><Icon name="info" size={18} /><span>{pending} soc. veikl. laukia jūsų patvirtinimo</span></div>
      ) : null}
      <Table
        title="Socialinės veiklos"
        count={list.length}
        head={['Mokinys', 'Veikla', 'Data', 'Valandos', 'Būsena']}
        rows={list.map((s) => ({ id: s.id, cells: [<Person user={byId(students, s.mokinysId)} />, <strong>{s.pavadinimas}</strong>, fmtDate(s.data), `${s.valandos} val.`, <Badge>{s.statusas}</Badge>] }))}
        actions={
          isStudent(user)
            ? (r) => (
                <>
                  <EditBtn onClick={() => go('socVeiklosForma', r.id)} />
                  <DeleteBtn
                    onClick={() =>
                      confirm('Ar tikrai norite ištrinti šią soc. veiklą?', () => {
                        act.remove('socVeiklos', r.id)
                        notify('Soc. veikla ištrinta')
                      })
                    }
                  />
                </>
              )
            : isTeacher(user)
              ? (r) => <button onClick={() => go('socVeiklosForma', r.id)}><Icon name="eye" size={15} />Peržiūrėti / tvirtinti</button>
              : null
        }
      />
    </>
  )
}

export function SocVeiklosForma({ db, act, go, notify, user, param }) {
  const editing = param ? byId(db.socVeiklos, param) : null
  if (param && !editing) return <NotFound go={go} back="socVeikla" />

  // Mokytojas: individuali soc. veikla su patvirtinimo / atmetimo mygtukais (PA „Patvirtinti soc. veiklą“)
  if (isTeacher(user)) {
    if (!editing) return <NotFound go={go} back="socVeikla" />
    const student = byId(db.naudotojai, editing.mokinysId)
    const setStatus = (statusas) => {
      act.update('socVeiklos', editing.id, { statusas })
      notify(`Soc. veiklos statusas pakeistas į „${statusas}“`)
      go('socVeikla')
    }
    return (
      <div className="card form narrow">
        <div className="review-head">
          <Person user={student} sub={`${student?.klase ?? ''} klasė`} />
          <Badge>{editing.statusas}</Badge>
        </div>
        <h2 className="review-title">{editing.pavadinimas}</h2>
        <dl className="details">
          <dt><Icon name="calendar" size={15} />Data</dt><dd>{editing.data}</dd>
          <dt><Icon name="clock" size={15} />Valandos</dt><dd>{editing.valandos} val.</dd>
          <dt><Icon name="info" size={15} />Aprašymas</dt><dd>{editing.aprasymas || <span className="muted">Aprašymo nėra</span>}</dd>
        </dl>
        <div className="form-actions">
          <button className="success" onClick={() => setStatus('Patvirtinta')}><Icon name="check" size={16} />Patvirtinti</button>
          <button className="danger" onClick={() => setStatus('Atmesta')}><Icon name="x" size={16} />Atmesti</button>
          <button className="ghost" onClick={() => go('socVeikla')}>Atšaukti</button>
        </div>
      </div>
    )
  }

  return (
    <Form
      fields={[
        { name: 'pavadinimas', label: 'Veiklos pavadinimas', wide: true, placeholder: 'pvz. Savanorystė gyvūnų prieglaudoje' },
        { name: 'data', label: 'Data', type: 'date' },
        { name: 'valandos', label: 'Valandų skaičius', type: 'number' },
        { name: 'aprasymas', label: 'Aprašymas', type: 'textarea', optional: true },
      ]}
      initial={editing || { data: today() }}
      validate={(v) => (Number(v.valandos) > 0 ? null : 'Valandų skaičius turi būti teigiamas')}
      onSubmit={(v) => {
        const rec = { ...v, valandos: Number(v.valandos), statusas: 'Laukia patvirtinimo' }
        if (editing) act.update('socVeiklos', editing.id, rec)
        else act.add('socVeiklos', { ...rec, mokinysId: user.id })
        notify(editing ? 'Soc. veiklos pakeitimai išsaugoti' : 'Soc. veikla išsaugota ir laukia patvirtinimo')
        go('socVeikla')
      }}
      onCancel={() => go('socVeikla')}
    />
  )
}

/* ---------- Namų darbai ---------- */
export function NamuDarbai({ db, act, go, confirm, notify, user }) {
  const list = (isStudent(user) ? db.namuDarbai.filter((h) => h.klase === user.klase) : db.namuDarbai).sort((a, b) => a.terminas.localeCompare(b.terminas))
  const daysLeft = (d) => Math.ceil((new Date(d + 'T00:00:00') - new Date(today() + 'T00:00:00')) / 86400000)
  return (
    <>
      {isTeacher(user) && (
        <Toolbar>
          <button className="primary" onClick={() => go('namuDarbuForma')}><Icon name="plus" size={16} />Nauji namų darbai</button>
        </Toolbar>
      )}
      {list.length === 0 ? (
        <div className="card empty-state"><Icon name="book" size={30} /><p>Namų darbų nėra</p></div>
      ) : (
        <div className="hw-grid">
          {list.map((h) => {
            const left = daysLeft(h.terminas)
            const due = left < 0 ? ['Terminas praėjo', 'bad'] : left === 0 ? ['Šiandien', 'bad'] : left <= 3 ? [`Liko ${left} d.`, 'wait'] : [`Liko ${left} d.`, 'ok']
            return (
              <article key={h.id} className={`card hw tone-${subjectTone(h.dalykas)}`}>
                <div className="hw-top">
                  <Subject name={h.dalykas} />
                  <span className="chip">{h.klase}</span>
                </div>
                <p className="hw-task">{h.uzduotis}</p>
                <div className="hw-bottom">
                  <span className="muted small"><Icon name="calendar" size={14} />{h.terminas}</span>
                  <span className={`badge ${due[1]}`}>{due[0]}</span>
                </div>
                {isTeacher(user) && (
                  <div className="row-actions hw-actions">
                    <EditBtn onClick={() => go('namuDarbuForma', h.id)} />
                    <DeleteBtn
                      onClick={() =>
                        confirm('Ar tikrai norite ištrinti šiuos namų darbus?', () => {
                          act.remove('namuDarbai', h.id)
                          notify('Namų darbai ištrinti iš duomenų bazės')
                        })
                      }
                    />
                  </div>
                )}
              </article>
            )
          })}
        </div>
      )}
    </>
  )
}

export function NamuDarbuForma({ db, act, go, notify, param }) {
  const editing = param ? byId(db.namuDarbai, param) : null
  if (param && !editing) return <NotFound go={go} back="namuDarbai" />
  return (
    <Form
      fields={[
        { name: 'dalykas', label: 'Dalykas', type: 'select', options: DALYKAI },
        { name: 'klase', label: 'Klasė', type: 'select', options: KLASES },
        { name: 'uzduotis', label: 'Užduotis', type: 'textarea', placeholder: 'Užduoties aprašymas…' },
        { name: 'terminas', label: 'Terminas', type: 'date' },
      ]}
      initial={editing || {}}
      onSubmit={(v) => {
        if (editing) act.update('namuDarbai', editing.id, v)
        else act.add('namuDarbai', v)
        notify(editing ? 'Namų darbų pakeitimai išsaugoti' : 'Namų darbai išsaugoti')
        go('namuDarbai')
      }}
      onCancel={() => go('namuDarbai')}
    />
  )
}

/* ---------- Slaptažodžio keitimas paštu ---------- */
export function Slaptazodis({ db, act, go, user }) {
  const [sentTo, setSentTo] = useState(null)
  if (sentTo) {
    return (
      <div className="card form narrow center">
        <div className="success-icon"><Icon name="mail" size={26} /></div>
        <h2>Patikrinkite el. paštą</h2>
        <p>Slaptažodžio keitimo nuoroda išsiųsta adresu <strong>{sentTo.email}</strong>.</p>
        <p className="muted small">Prototipe el. laiško nuorodą imituoja mygtukas žemiau.</p>
        <div className="form-actions center">
          <button className="primary" onClick={() => go('naujasSlaptazodis', sentTo.id)}><Icon name="key" size={16} />Atidaryti nuorodą iš el. laiško</button>
          <button className="ghost" onClick={() => go('pagrindinis')}>Grįžti</button>
        </div>
      </div>
    )
  }
  return (
    <Form
      narrow
      fields={[{ name: 'email', label: 'El. paštas', type: 'email', wide: true }]}
      initial={{ email: user.email }}
      submitLabel="Siųsti nuorodą"
      submitIcon="send"
      validate={(v) => (db.naudotojai.some((u) => u.email === v.email.trim()) ? null : 'Naudotojas su tokiu el. paštu neegzistuoja')}
      onSubmit={(v) => {
        const u = db.naudotojai.find((x) => x.email === v.email.trim())
        act.add('zinutes', { nuo: SYSTEM_EMAIL, kam: u.email, tema: 'Slaptažodžio keitimas', tekstas: 'Norėdami pakeisti slaptažodį, atidarykite nuorodą.', data: today() })
        setSentTo(u)
      }}
      onCancel={() => go('pagrindinis')}
    />
  )
}

export function NaujasSlaptazodis({ db, act, go, notify, param }) {
  const u = byId(db.naudotojai, param)
  if (!u) return <NotFound go={go} back="slaptazodis" />
  return (
    <Form
      narrow
      fields={[
        { name: 'naujas', label: 'Naujas slaptažodis', type: 'password', wide: true, placeholder: 'Bent 4 simboliai' },
        { name: 'pakartoti', label: 'Pakartokite slaptažodį', type: 'password', wide: true },
      ]}
      submitLabel="Pakeisti slaptažodį"
      submitIcon="lock"
      validate={(v) => {
        if (v.naujas.length < 4) return 'Slaptažodis turi būti bent 4 simbolių'
        if (v.naujas !== v.pakartoti) return 'Slaptažodžiai nesutampa'
      }}
      onSubmit={(v) => {
        act.update('naudotojai', u.id, { slaptazodis: v.naujas })
        notify('Slaptažodis pakeistas')
        go('pagrindinis')
      }}
      onCancel={() => go('pagrindinis')}
    />
  )
}

function NotFound({ go, back }) {
  return (
    <div className="card empty-state">
      <Icon name="alert" size={28} />
      <p>Įrašas nerastas.</p>
      <button onClick={() => go(back)}>Grįžti</button>
    </div>
  )
}
