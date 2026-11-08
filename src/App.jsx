import { useEffect, useRef, useState } from 'react'
import { seed } from './data.js'
import { ConfirmDialog, nextId, fullName, Avatar } from './ui.jsx'
import Icon from './icons.jsx'
import * as S from './screens.jsx'

// Navigavimo planas: kiekvienas ekranas = «boundary» klasė.
// parent – langas, į kurį grįžtama; roles – kas gali atidaryti (nenurodyta = visi prisijungę).
const ADMIN = ['Administratorius']
const SCREENS = {
  prisijungimas: { title: 'Prisijungimo langas', parent: null, view: S.Prisijungimas, icon: 'lock' },
  pagrindinis: { title: 'Pagrindinis langas', parent: null, view: S.Pagrindinis, icon: 'home', tone: 'indigo' },
  naudotojai: { title: 'Naudotojų langas', sub: 'Sistemos naudotojų valdymas', parent: 'pagrindinis', view: S.Naudotojai, roles: ADMIN, icon: 'users', tone: 'violet' },
  naudotojoRegistravimas: { title: 'Naudotojo registravimo forma', sub: 'Naujo naudotojo įtraukimas į sistemą', parent: 'naudotojai', view: S.NaudotojoRegistravimas, roles: ADMIN, icon: 'users', tone: 'violet' },
  naudotojoRedagavimas: { title: 'Naudotojo redagavimo forma', sub: 'Naudotojo duomenų keitimas', parent: 'naudotojai', view: S.NaudotojoRedagavimas, roles: ADMIN, icon: 'edit', tone: 'violet' },
  pazymiai: { title: 'Pažymių langas', sub: 'Įvertinimai ir vidurkiai', parent: 'pagrindinis', view: S.Pazymiai, icon: 'award', tone: 'amber' },
  pazymiuForma: { title: 'Pažymių forma', sub: 'Pažymio įrašymas arba redagavimas', parent: 'pazymiai', view: S.PazymiuForma, roles: ['Mokytojas'], icon: 'award', tone: 'amber' },
  pastas: { title: 'El. pašto langas', sub: 'Žinutės tarp mokyklos bendruomenės narių', parent: 'pagrindinis', view: S.Pastas, icon: 'mail', tone: 'sky' },
  pastoForma: { title: 'El. pašto forma', sub: 'Naujos žinutės rašymas', parent: 'pastas', view: S.PastoForma, icon: 'send', tone: 'sky' },
  tvarkarastis: { title: 'Tvarkaraščio langas', sub: 'Savaitės pamokų tvarkaraštis', parent: 'pagrindinis', view: S.Tvarkarastis, icon: 'calendar', tone: 'emerald' },
  tvarkarascioForma: { title: 'Tvarkaraščio forma', sub: 'Automatinis tvarkaraščio generavimas', parent: 'tvarkarastis', view: S.TvarkarascioForma, roles: ADMIN, icon: 'sparkles', tone: 'emerald' },
  pamokosForma: { title: 'Pamokos forma', sub: 'Pamokos kūrimas, redagavimas ar šalinimas', parent: 'tvarkarastis', view: S.PamokosForma, roles: ADMIN, icon: 'clock', tone: 'emerald' },
  socVeikla: { title: 'Soc. veiklos langas', sub: 'Socialinės veiklos valandos', parent: 'pagrindinis', view: S.SocVeikla, icon: 'heart', tone: 'rose' },
  socVeiklosForma: { title: 'Soc. veiklos forma', sub: 'Socialinės veiklos duomenys', parent: 'socVeikla', view: S.SocVeiklosForma, roles: ['Mokinys', 'Mokytojas'], icon: 'heart', tone: 'rose' },
  namuDarbai: { title: 'Namų darbų langas', sub: 'Užduotys ir jų terminai', parent: 'pagrindinis', view: S.NamuDarbai, icon: 'book', tone: 'orange' },
  namuDarbuForma: { title: 'Namų darbų forma', sub: 'Namų darbų užduoties duomenys', parent: 'namuDarbai', view: S.NamuDarbuForma, roles: ['Mokytojas'], icon: 'book', tone: 'orange' },
  slaptazodis: { title: 'Slaptažodžio keitimo forma', sub: 'Slaptažodžio keitimas el. paštu', parent: 'pagrindinis', view: S.Slaptazodis, icon: 'key', tone: 'slate' },
  naujasSlaptazodis: { title: 'Naujo slaptažodžio forma', sub: 'Naujo slaptažodžio nustatymas', parent: 'slaptazodis', view: S.NaujasSlaptazodis, icon: 'lock', tone: 'slate' },
}

const STORE_KEY = 'el-dienynas-db-v1'
const USER_KEY = 'el-dienynas-user'
const load = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback()
  } catch {
    return fallback()
  }
}
const save = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* prototipas veikia ir be localStorage */
  }
}

function parseHash() {
  const [id, param] = window.location.hash.slice(1).split('/')
  return { id: SCREENS[id] ? id : 'pagrindinis', param: param ? decodeURIComponent(param) : null }
}

export default function App() {
  const [route, setRoute] = useState(parseHash)
  const [db, setDb] = useState(() => load(STORE_KEY, seed))
  const [userId, setUserId] = useState(() => load(USER_KEY, () => null))
  const [toast, setToast] = useState(null)
  const [dialog, setDialog] = useState(null)
  const toastTimer = useRef(null)

  useEffect(() => {
    const onHash = () => {
      setRoute(parseHash())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  useEffect(() => save(STORE_KEY, db), [db])
  useEffect(() => save(USER_KEY, userId), [userId])

  const user = db.naudotojai.find((u) => u.id === userId) || null
  const go = (id, param) => {
    window.location.hash = param != null ? `${id}/${encodeURIComponent(param)}` : id
  }
  const notify = (msg) => {
    setToast(msg)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 2800)
  }
  const confirm = (text, onYes) => setDialog({ text, onYes })
  const act = {
    add: (col, item) => setDb((d) => ({ ...d, [col]: [...d[col], { ...item, id: nextId(d[col]) }] })),
    update: (col, id, patch) => setDb((d) => ({ ...d, [col]: d[col].map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
    remove: (col, id) => setDb((d) => ({ ...d, [col]: d[col].filter((x) => x.id !== id) })),
    set: (col, arr) => setDb((d) => ({ ...d, [col]: arr })),
  }
  const login = (u) => setUserId(u.id)
  const logout = () => {
    setUserId(null)
    go('prisijungimas')
  }
  const resetDemo = () => {
    setDb(seed())
    notify('Demo duomenys atstatyti')
  }

  const overlays = (
    <>
      {dialog && (
        <ConfirmDialog
          text={dialog.text}
          onYes={() => {
            dialog.onYes()
            setDialog(null)
          }}
          onNo={() => {
            setDialog(null)
            notify('Trynimas atšauktas')
          }}
        />
      )}
      {toast && (
        <div className="toast" role="status">
          <span className="toast-icon"><Icon name="check" size={14} /></span>
          {toast}
        </div>
      )}
    </>
  )

  // Neprisijungus visada rodomas Prisijungimo langas
  if (!user) {
    return (
      <>
        <S.Prisijungimas db={db} login={login} go={go} resetDemo={resetDemo} />
        {overlays}
      </>
    )
  }

  const routeId = route.id === 'prisijungimas' ? 'pagrindinis' : route.id
  const screen = SCREENS[routeId]
  const allowed = !screen.roles || screen.roles.includes(user.tipas)
  const View = screen.view

  const crumbs = []
  for (let cur = routeId; cur; cur = SCREENS[cur].parent) crumbs.unshift(cur)

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-inner">
          <button className="brand" onClick={() => go('pagrindinis')}>
            <span className="brand-logo"><Icon name="school" size={20} /></span>
            <span className="brand-text">
              <strong>Elektroninis dienynas</strong>
              <small>Mokyklos informacinė sistema</small>
            </span>
          </button>
          <div className="user-chip">
            <Avatar user={user} />
            <span className="user-meta">
              <strong>{fullName(user)}</strong>
              <small>{user.tipas}</small>
            </span>
            <button className="icon-btn" onClick={logout} title="Atsijungti" aria-label="Atsijungti">
              <Icon name="logout" size={18} />
            </button>
          </div>
        </div>
      </header>

      <nav className="crumbs" aria-label="Kelias">
        <div className="crumbs-inner">
          {crumbs.map((id, i) => (
            <span key={id} className="crumb">
              {i > 0 && <Icon name="chevron" size={14} className="crumb-sep" />}
              {i < crumbs.length - 1 ? <button className="crumb-link" onClick={() => go(id)}>{SCREENS[id].title}</button> : <span className="crumb-current">{SCREENS[id].title}</span>}
            </span>
          ))}
        </div>
      </nav>

      <main className="content" key={routeId + (route.param ?? '')}>
        {routeId !== 'pagrindinis' && (
          <div className="page-head">
            {screen.parent && (
              <button className="back-link" onClick={() => go(screen.parent)}>
                <Icon name="back" size={16} /> {SCREENS[screen.parent].title}
              </button>
            )}
            <div className="page-title">
              <span className={`page-icon tone-${screen.tone}`}><Icon name={screen.icon} size={24} /></span>
              <div>
                <h1>{screen.title}</h1>
                {screen.sub && <p>{screen.sub}</p>}
              </div>
              <span className="stereo">«boundary» {screen.title}</span>
            </div>
          </div>
        )}
        {allowed ? (
          <View db={db} act={act} user={user} go={go} param={route.param} notify={notify} confirm={confirm} />
        ) : (
          <div className="card empty-state">
            <Icon name="lock" size={28} />
            <p>Neturite teisių šiam langui.</p>
            <button className="btn" onClick={() => go('pagrindinis')}>Į pagrindinį langą</button>
          </div>
        )}
      </main>
      {overlays}
    </div>
  )
}
