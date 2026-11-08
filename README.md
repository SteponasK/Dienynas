# Elektroninis dienynas

Elektroninio dienyno grafinės sąsajos prototipas (React + Vite). Veikia naršyklėje, serverio ir duomenų bazės nereikia: duomenys testiniai ir saugomi naršyklėje (localStorage).

## Paleidimas

### 1. Įsidiek Node.js (vieną kartą)

Parsisiųsk ir įdiek **Node.js LTS** (20 ar naujesnę versiją): https://nodejs.org

- **Windows:** paleisk `.msi` diegimo failą, viską palik pagal nutylėjimą.
- **Linux (Ubuntu/Debian):**
  ```bash
  curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
  sudo apt install -y nodejs
  ```

Patikrink: `node -v` turi parodyti `v20` ar daugiau.

### 2. Paleisk

**Paprasčiausia:**
- **Windows:** du kartus spausk `start.bat`.
- **Linux:** terminale projekto aplanke paleisk `./start.sh`.

Programa atsidarys naršyklėje adresu http://localhost:5173. Sustabdyti: terminale `Ctrl+C`.

**Arba rankiniu būdu** (veikia abiejose sistemose):
```bash
npm install
npm run dev
```

### Kaip sukompiliuoti (nebūtina)

```bash
npm install
npm run build
npm run preview
```

`npm run build` sudeda paruoštą svetainę į `dist/` aplanką, `npm run preview` ją parodo adresu http://localhost:4173.

## Demo paskyros

Visų paskyrų slaptažodis: `demo`.

| El. paštas | Rolė |
|---|---|
| admin@mokykla.lt | Administratorius |
| jonas@mokykla.lt | Mokytojas |
| ona@mokykla.lt | Mokinys |

Jei pristatant duomenys susimaišė, prisijungimo lange spausk **„Atstatyti demo duomenis“**.

## Pristatymo gidas

Kiekvienas langas ar forma yra «boundary» klasė iš navigavimo plano. Klasės pavadinimas rodomas prie lango antraštės. Realizuoti visi 23 panaudojimo atvejai su patikromis iš sekų diagramų (tuščia forma, neteisingi duomenys, adresatas neegzistuoja ir t. t.).

### Navigavimo planas

Navigacijos ryšiai (`↔` reiškia, kad pereiti galima abiem kryptimis):

```
Prisijungimo langas        → Pagrindinis langas   (Atsijungti: Pagrindinis → Prisijungimo langas)
Pagrindinis langas         ↔ Naudotojų langas (tik admin)
                           ↔ Pažymių langas
                           ↔ El. pašto langas
                           ↔ Tvarkaraščio langas
                           ↔ Soc. veiklos langas
                           ↔ Namų darbų langas
                           ↔ Slaptažodžio keitimo forma
Naudotojų langas           ↔ Naudotojo registravimo forma
                           ↔ Naudotojo redagavimo forma
                           ↔ Patvirtinimo langas
Pažymių langas             ↔ Pažymių forma
                           ↔ Patvirtinimo langas
El. pašto langas           ↔ El. pašto forma
Tvarkaraščio langas        ↔ Tvarkaraščio forma
                           ↔ Pamokos forma
Pamokos forma              ↔ Patvirtinimo langas
Soc. veiklos langas        ↔ Soc. veiklos forma
                           ↔ Patvirtinimo langas
Namų darbų langas          ↔ Namų darbų forma
                           ↔ Patvirtinimo langas
Slaptažodžio keitimo forma → Naujo slaptažodžio forma → Pagrindinis langas
```

## Panaudojimo atvejai → kaip parodyti prototipe

| PA | Rolė | Kelias |
|---|---|---|
| Prisijungti | visi | Prisijungimo langas. Įvedus blogus duomenis rodoma klaida |
| Peržiūrėti paštą | visi | El. paštas → paspausti laišką → „+ Naujas laiškas“ arba „Atsakyti“. Neegzistuojantis adresatas → klaida |
| Keisti slaptažodį paštu | visi | Keisti slaptažodį → Siųsti nuorodą → Atidaryti nuorodą → Naujo slaptažodžio forma |
| Peržiūrėti tvarkaraštį / pažymius / soc. veiklas / namų darbus | visi | Atitinkama plytelė Pagrindiniame lange. Mokinys mato tik savo duomenis |
| Kurti / redaguoti / trinti pažymį | mokytojas | Pažymiai → „+ Įrašyti pažymį“ / Redaguoti / Šalinti → Patvirtinimo langas. Antras to paties dalyko pažymys per savaitę → klaida |
| Patvirtinti soc. veiklą | mokytojas | Soc. veikla → Peržiūrėti / tvirtinti → Patvirtinti arba Atmesti |
| Kurti / redaguoti / trinti namų darbus | mokytojas | Namų darbai → „+ Nauji“ / Redaguoti / Šalinti |
| Kurti / redaguoti / trinti soc. veiklą | mokinys | Soc. veikla → „+ Nauja“ / Redaguoti / Šalinti |
| Registruoti / redaguoti / trinti naudotoją | admin | Naudotojai → „+ Registruoti“ / Redaguoti / Šalinti |
| Kurti / redaguoti / trinti pamoką | admin | Tvarkaraštis → „+ Nauja pamoka“ / paspausti pamoką → Išsaugoti arba „Šalinti pamoką“ |
| Tvarkaraščio generavimas | admin | Tvarkaraštis → Generuoti tvarkaraštį |

Papildomai realizuota:
- pažymio pranešimas mokiniui el. paštu (laiškas atsiranda mokinio pašto dėžutėje);
- vidurkių skaičiavimas Pažymių lange.

## Dažnos problemos

- **`npm` nerastas** – Node.js neįdiegtas arba reikia perkrauti terminalą / kompiuterį po įdiegimo.
- **Windows: „running scripts is disabled“ PowerShell'e** – naudok `start.bat` arba paleisk komandas per `cmd`.
- **Linux: `./start.sh: Permission denied`** – paleisk `chmod +x start.sh` arba `bash start.sh`.
- **Portas 5173 užimtas** – Vite pats paims kitą (pvz. 5174), adresas parodomas terminale.
