// Demo duomenys (testiniai). Visų naudotojų slaptažodis: demo
export const KLASES = ['5a', '6b', '7a', '8c']
export const DALYKAI = ['Matematika', 'Lietuvių k.', 'Anglų k.', 'Istorija', 'Fizika']
export const DIENOS = ['Pirmadienis', 'Antradienis', 'Trečiadienis', 'Ketvirtadienis', 'Penktadienis']
export const LAIKAI = ['08:00', '08:55', '09:50', '10:55', '11:50']
export const TIPAI = ['Administratorius', 'Mokytojas', 'Mokinys']
export const SOC_STATUSAI = ['Laukia patvirtinimo', 'Patvirtinta', 'Atmesta']

export const seed = () => ({
  naudotojai: [
    { id: 1, vardas: 'Admin', pavarde: 'Adminas', email: 'admin@mokykla.lt', tipas: 'Administratorius', klase: '', dalykai: '', busena: 'Aktyvus', slaptazodis: 'demo' },
    { id: 2, vardas: 'Jonas', pavarde: 'Jonaitis', email: 'jonas@mokykla.lt', tipas: 'Mokytojas', klase: '', dalykai: 'Matematika, Fizika', busena: 'Aktyvus', slaptazodis: 'demo' },
    { id: 3, vardas: 'Laura', pavarde: 'Mockutė', email: 'laura@mokykla.lt', tipas: 'Mokytojas', klase: '', dalykai: 'Lietuvių k., Istorija, Anglų k.', busena: 'Aktyvus', slaptazodis: 'demo' },
    { id: 4, vardas: 'Ona', pavarde: 'Petraitė', email: 'ona@mokykla.lt', tipas: 'Mokinys', klase: '7a', dalykai: '', busena: 'Aktyvus', slaptazodis: 'demo' },
    { id: 5, vardas: 'Tomas', pavarde: 'Kairys', email: 'tomas@mokykla.lt', tipas: 'Mokinys', klase: '7a', dalykai: '', busena: 'Aktyvus', slaptazodis: 'demo' },
    { id: 6, vardas: 'Eglė', pavarde: 'Rimkutė', email: 'egle@mokykla.lt', tipas: 'Mokinys', klase: '8c', dalykai: '', busena: 'Aktyvus', slaptazodis: 'demo' },
  ],
  pazymiai: [
    { id: 1, mokinysId: 4, dalykas: 'Matematika', pazymys: 9, data: '2026-11-02', komentaras: '' },
    { id: 2, mokinysId: 4, dalykas: 'Matematika', pazymys: 8, data: '2026-10-26', komentaras: 'Kontrolinis' },
    { id: 3, mokinysId: 4, dalykas: 'Istorija', pazymys: 10, data: '2026-11-04', komentaras: '' },
    { id: 4, mokinysId: 5, dalykas: 'Matematika', pazymys: 7, data: '2026-11-02', komentaras: '' },
    { id: 5, mokinysId: 6, dalykas: 'Fizika', pazymys: 6, data: '2026-11-03', komentaras: '' },
  ],
  namuDarbai: [
    { id: 1, dalykas: 'Matematika', klase: '7a', uzduotis: 'Uždaviniai 45–52 psl.', terminas: '2026-11-10' },
    { id: 2, dalykas: 'Istorija', klase: '7a', uzduotis: 'Referatas apie LDK', terminas: '2026-11-14' },
    { id: 3, dalykas: 'Fizika', klase: '8c', uzduotis: 'Laboratorinio darbo ataskaita', terminas: '2026-11-12' },
  ],
  socVeiklos: [
    { id: 1, mokinysId: 4, pavadinimas: 'Savanorystė gyvūnų prieglaudoje', data: '2026-10-18', valandos: 4, aprasymas: '', statusas: 'Laukia patvirtinimo' },
    { id: 2, mokinysId: 4, pavadinimas: 'Mokyklos renginio organizavimas', data: '2026-09-30', valandos: 3, aprasymas: '', statusas: 'Patvirtinta' },
    { id: 3, mokinysId: 5, pavadinimas: 'Aplinkos tvarkymas', data: '2026-10-22', valandos: 2, aprasymas: '', statusas: 'Laukia patvirtinimo' },
  ],
  zinutes: [
    { id: 1, nuo: 'admin@mokykla.lt', kam: 'jonas@mokykla.lt', tema: 'Tėvų susirinkimas', tekstas: 'Susirinkimas vyks lapkričio 20 d. 18 val.', data: '2026-11-04' },
    { id: 2, nuo: 'ona@mokykla.lt', kam: 'jonas@mokykla.lt', tema: 'Klausimas dėl namų darbų', tekstas: 'Ar 52 uždavinys irgi privalomas?', data: '2026-11-06' },
    { id: 3, nuo: 'jonas@mokykla.lt', kam: 'ona@mokykla.lt', tema: 'Re: Klausimas dėl namų darbų', tekstas: 'Taip, visi uždaviniai privalomi.', data: '2026-11-06' },
    { id: 4, nuo: 'laura@mokykla.lt', kam: 'admin@mokykla.lt', tema: 'Kabineto keitimas', tekstas: 'Prašau trečiadienį skirti 204 kabinetą.', data: '2026-11-05' },
  ],
  pamokos: [
    ...DIENOS.flatMap((diena, d) =>
      LAIKAI.slice(0, 4).map((laikas, l) => {
        const dalykas = DALYKAI[(d * 2 + l) % DALYKAI.length]
        return { dalykas, klase: '7a', mokytojas: mokytojasFor(dalykas), diena, laikas, kabinetas: String(101 + l) }
      }),
    ),
    ...DIENOS.flatMap((diena, d) =>
      LAIKAI.slice(1, 4).map((laikas, l) => {
        const dalykas = DALYKAI[(d + l * 2) % DALYKAI.length]
        return { dalykas, klase: '8c', mokytojas: mokytojasFor(dalykas), diena, laikas, kabinetas: String(201 + l) }
      }),
    ),
  ].map((p, i) => ({ id: i + 1, ...p })),
})

export function mokytojasFor(dalykas) {
  return ['Matematika', 'Fizika'].includes(dalykas) ? 'Jonas Jonaitis' : 'Laura Mockutė'
}
