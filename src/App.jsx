import { useState, useEffect, useCallback, useRef } from "react"

import datiGrezzi from './domande_patente.json'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

const BASE_IMG = 'https://raw.githubusercontent.com/Ed0ardo/QuizPatenteB/main'
const STORAGE_KEY = 'quiz_patente_stats'

function preparaDomande(dati) {
  const tutte = []
  for (const [argomento, segnali] of Object.entries(dati)) {
    for (const [segnale, domande] of Object.entries(segnali)) {
      for (const d of domande) tutte.push({ ...d, argomento, segnale })
    }
  }
  return tutte
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function loadStats() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {} }
  catch { return {} }
}

function saveStats(stats) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats))
}

const ARGOMENTI_NOMI = {
  'definizioni-generali-doveri-strada': 'Definizioni generali',
  'segnali-pericolo': 'Segnali di pericolo',
  'segnali-divieto': 'Segnali di divieto',
  'segnali-obbligo': 'Segnali di obbligo',
  'segnali-precedenza': 'Segnali di precedenza',
  'segnaletica-orizzontale-ostacoli': 'Segnaletica orizzontale',
  'semafori-vigili': 'Semafori e vigili',
  'segnali-indicazione': 'Segnali di indicazione',
  'segnali-complementari-cantiere': 'Segnali complementari',
  'pannelli-integrativi': 'Pannelli integrativi',
  'limiti-di-velocita': 'Limiti di velocità',
  'distanza-di-sicurezza': 'Distanza di sicurezza',
  'norme-di-circolazione': 'Norme di circolazione',
  'precedenza-incroci': 'Precedenza agli incroci',
  'sorpasso': 'Norme sul sorpasso',
  'fermata-sosta-arresto': 'Fermata e sosta',
  'norme-varie-autostrade-pannelli': 'Norme varie',
  'luci-dispositivi-acustici': 'Luci e dispositivi',
  'cinture-casco-sicurezza': 'Cinture e casco',
  'patente-punti-documenti': 'Patente e documenti',
  'incidenti-stradali-comportamenti': 'Incidenti stradali',
  'alcool-droga-primo-soccorso': 'Alcool e primo soccorso',
  'responsabilita-civile-penale-e-assicurazione': 'Responsabilità e assicurazione',
  'consumi-ambiente-inquinamento': 'Ambiente e consumi',
  'elementi-veicolo-manutenzione-comportamenti': 'Elementi del veicolo',
}

const TUTTE = preparaDomande(datiGrezzi)

function scheduleNotifica() {
  if (!('Notification' in window)) return
  const ora = new Date()
  const domani = new Date()
  domani.setDate(ora.getDate() + 1)
  domani.setHours(9, 0, 0, 0)
  setTimeout(() => {
    if (Notification.permission === 'granted') {
      new Notification('🚗 Quiz Patente B', {
        body: "Hai studiato oggi? Fai una simulazione d'esame!",
        icon: '/vite.svg',
      })
    }
    scheduleNotifica()
  }, domani - ora)
}

function richiediNotifiche() {
  if (!('Notification' in window)) return
  if (Notification.permission === 'default') {
    Notification.requestPermission().then(p => { if (p === 'granted') scheduleNotifica() })
  } else if (Notification.permission === 'granted') {
    scheduleNotifica()
  }
}


// ── PRIVACY POLICY ─────────────────────────────────────────
function PrivacyPolicy({ onBack }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-800 text-white p-4 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={onBack} className="text-2xl px-1">←</button>
        <h2 className="text-lg font-bold">Privacy Policy</h2>
      </div>
      <div className="p-6 max-w-2xl mx-auto space-y-4 text-gray-700 text-sm leading-relaxed">
        <h3 className="font-bold text-lg text-gray-900">PatentaFacile – Privacy Policy</h3>
        <p>Ultimo aggiornamento: marzo 2026</p>
        <h4 className="font-bold text-gray-800">1. Dati raccolti</h4>
        <p>PatentaFacile non raccoglie né trasmette dati personali a server esterni. Tutti i dati (statistiche, progressi) sono salvati localmente sul dispositivo dell'utente tramite localStorage.</p>
        <h4 className="font-bold text-gray-800">2. Dati di terze parti</h4>
        <p>L'app non utilizza servizi di analisi, tracciamento o pubblicità di terze parti.</p>
        <h4 className="font-bold text-gray-800">3. Notifiche</h4>
        <p>L'app può richiedere il permesso per inviare notifiche di promemoria studio. Le notifiche sono gestite localmente e non comportano trasmissione di dati.</p>
        <h4 className="font-bold text-gray-800">4. Contenuti</h4>
        <p>Le domande del quiz provengono dalla banca dati ministeriale pubblica del Ministero delle Infrastrutture e dei Trasporti italiano.</p>
        <h4 className="font-bold text-gray-800">5. Contatti</h4>
        <p>Per qualsiasi informazione sulla privacy: patentafacile.app@gmail.com</p>
        <h4 className="font-bold text-gray-800">6. Modifiche</h4>
        <p>Ci riserviamo il diritto di aggiornare questa privacy policy. Le modifiche saranno pubblicate all'interno dell'app.</p>
      </div>
    </div>
  )
}

// ── BENVENUTO ───────────────────────────────────────────────
function Benvenuto({ onInizia, onPrivacy }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 flex flex-col items-center justify-between p-8">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="bg-white rounded-3xl p-6 shadow-2xl mb-8 w-32 h-32 flex items-center justify-center">
          <span className="text-7xl">🚗</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white mb-3 tracking-tight">
          Patenta<span className="text-yellow-400">Facile</span>
        </h1>
        <p className="text-blue-200 text-lg mb-2">Preparati all'esame della patente B</p>
        <div className="flex gap-4 mt-4 text-blue-300 text-sm">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">7139</p>
            <p>Domande</p>
          </div>
          <div className="w-px bg-blue-600"></div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">25</p>
            <p>Argomenti</p>
          </div>
          <div className="w-px bg-blue-600"></div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">100%</p>
            <p>Gratuito</p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-sm space-y-3">
        <button
          onClick={onInizia}
          className="w-full bg-yellow-400 text-yellow-900 font-black text-xl py-5 rounded-2xl shadow-xl active:scale-95 transition-transform"
        >
          🚀 Inizia a studiare
        </button>
        <p className="text-center text-blue-200 text-sm">
          Continuando accetti la nostra{' '}
          <button onClick={onPrivacy} className="underline text-blue-200">
            Privacy Policy
          </button>
        </p>
      </div>
    </div>
  )
}

// ── HOME ────────────────────────────────────────────────────
function Home({ onEsame, onArgomento, onLacune }) {
  useEffect(() => { richiediNotifiche() }, [])
  const stats = loadStats()
  const totArg = Object.keys(stats).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex flex-col items-center justify-center p-6">
      <div className="text-center mb-8">
        <div className="text-5xl sm:text-7xl mb-3">🚗</div>
        <h1 className="text-3xl sm:text-5xl font-bold text-white mb-1">Quiz Patente B</h1>
        <p className="text-blue-200 text-sm sm:text-base">{TUTTE.length} domande disponibili</p>
      </div>
      <div className="w-full max-w-md space-y-3">
        <button onClick={onEsame} className="w-full bg-white text-blue-900 font-bold text-lg py-5 rounded-2xl shadow-lg active:scale-95 transition-transform">
          🎯 Simulazione Esame
          <p className="text-sm font-normal text-blue-600 mt-1">30 domande · 20 minuti</p>
        </button>
        <button onClick={onArgomento} className="w-full bg-blue-500 text-white font-bold text-lg py-5 rounded-2xl shadow-lg active:scale-95 transition-transform">
          📚 Quiz per Argomento
          <p className="text-sm font-normal text-blue-100 mt-1">{Object.keys(ARGOMENTI_NOMI).length} argomenti disponibili</p>
        </button>
        <button onClick={onLacune} className="w-full bg-yellow-400 text-yellow-900 font-bold text-lg py-5 rounded-2xl shadow-lg active:scale-95 transition-transform">
          📊 Le mie Lacune
          <p className="text-sm font-normal text-yellow-700 mt-1">
            {totArg > 0 ? `${totArg} argomenti analizzati` : 'Fai dei quiz per vedere le lacune'}
          </p>
        </button>
      </div>
      <p className="text-blue-300 text-xs mt-8">Aggiornato con integrazioni quiz e spiegazioni</p>
    </div>
  )
}

// ── SCELTA ARGOMENTO ────────────────────────────────────────
function SceltaArgomento({ onScegli, onBack }) {
  const stats = loadStats()
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-800 text-white p-4 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={onBack} className="text-2xl px-1">←</button>
        <h2 className="text-lg sm:text-xl font-bold">Quiz per Argomento</h2>
      </div>
      <div className="p-4 space-y-2 max-w-2xl mx-auto">
        {Object.entries(ARGOMENTI_NOMI).map(([key, nome]) => {
          const count = Object.values(datiGrezzi[key] || {}).reduce((s, d) => s + d.length, 0)
          const s = stats[key]
          const perc = s ? Math.round((s.corrette / s.totale) * 100) : null
          return (
            <button
              key={key}
              onClick={() => onScegli(key)}
              className="w-full bg-white rounded-xl p-4 shadow-sm active:bg-blue-50 transition-colors text-left"
            >
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-800 text-sm sm:text-base">{nome}</span>
                <div className="flex items-center gap-2 ml-2 shrink-0">
                  {perc !== null && (
                    <span className={`text-xs font-bold px-2 py-1 rounded-lg ${perc >= 80 ? 'bg-green-100 text-green-700' : perc >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                      {perc}%
                    </span>
                  )}
                  <span className="text-xs text-blue-600 font-bold">{count} dom.</span>
                </div>
              </div>
              {perc !== null && (
                <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all ${perc >= 80 ? 'bg-green-500' : perc >= 50 ? 'bg-yellow-400' : 'bg-red-500'}`}
                    style={{ width: `${perc}%` }}
                  />
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}


// ── GRAFICO PROGRESSI ───────────────────────────────────────
function GraficoProgressi() {
  const sessioni = JSON.parse(localStorage.getItem('patente_sessioni') || '[]')

  if (sessioni.length < 2) {
    return (
      <div className="bg-white rounded-2xl p-5 shadow-sm text-center">
        <p className="text-4xl mb-2">📈</p>
        <p className="font-bold text-gray-700">Grafico progressi</p>
        <p className="text-sm text-gray-400 mt-1">Fai almeno 2 quiz per vedere il grafico</p>
      </div>
    )
  }

  const media = Math.round(sessioni.reduce((s, x) => s + x.perc, 0) / sessioni.length)

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <p className="font-bold text-gray-800">📈 Andamento progressi</p>
        <span className="text-sm bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded-xl">
          Media: {media}%
        </span>
      </div>

      {/* Grafico linea % corrette */}
      <p className="text-xs text-gray-500 mb-1">% risposte corrette per sessione</p>
      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={sessioni} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
          <XAxis dataKey="data" tick={{ fontSize: 10 }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
          <Tooltip
            formatter={(val) => [`${val}%`, 'Percentuale corrette']}
            contentStyle={{ fontSize: 12, borderRadius: 8 }}
          />
          <ReferenceLine y={90} stroke="#22c55e" strokeDasharray="4 4" label={{ value: '90%', fontSize: 10, fill: '#22c55e' }}/>
          <ReferenceLine y={media} stroke="#3b82f6" strokeDasharray="4 4" label={{ value: `media`, fontSize: 10, fill: '#3b82f6' }}/>
          <Line type="monotone" dataKey="perc" stroke="#3b82f6" strokeWidth={2.5} dot={{ fill: '#3b82f6', r: 4 }} activeDot={{ r: 6 }}/>
        </LineChart>
      </ResponsiveContainer>

      {/* Statistiche rapide */}
      <div className="flex gap-2 mt-3">
        <div className="flex-1 bg-green-50 rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-green-700">{Math.max(...sessioni.map(s => s.perc))}%</p>
          <p className="text-xs text-green-600">Miglior risultato</p>
        </div>
        <div className="flex-1 bg-blue-50 rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-blue-700">{sessioni.length}</p>
          <p className="text-xs text-blue-600">Quiz totali</p>
        </div>
        <div className="flex-1 bg-yellow-50 rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-yellow-700">{sessioni.filter(s => s.perc >= 90).length}</p>
          <p className="text-xs text-yellow-600">Promosso (&ge;90%)</p>
        </div>
      </div>
    </div>
  )
}

// ── LE MIE LACUNE ────────────────────────────────────────────
function Lacune({ onAllenati, onBack }) {
  const stats = loadStats()
  const [confermaReset, setConfermaReset] = useState(false)

  const argomenti = Object.entries(ARGOMENTI_NOMI).map(([key, nome]) => {
    const s = stats[key]
    if (!s) return { key, nome, perc: null, corrette: 0, totale: 0 }
    return { key, nome, perc: Math.round((s.corrette / s.totale) * 100), corrette: s.corrette, totale: s.totale }
  })

  const analizzati = argomenti.filter(a => a.perc !== null)
  const nonAnalizzati = argomenti.filter(a => a.perc === null)

  const ordinati = [...analizzati].sort((a, b) => a.perc - b.perc)

  const mediaTotale = analizzati.length
    ? Math.round(analizzati.reduce((s, a) => s + a.perc, 0) / analizzati.length)
    : null

  function colore(perc) {
    if (perc >= 80) return { bar: 'bg-green-500', badge: 'bg-green-100 text-green-700', emoji: '🟢' }
    if (perc >= 50) return { bar: 'bg-yellow-400', badge: 'bg-yellow-100 text-yellow-700', emoji: '🟡' }
    return { bar: 'bg-red-500', badge: 'bg-red-100 text-red-700', emoji: '🔴' }
  }

  function resetStats() {
    localStorage.removeItem(STORAGE_KEY)
    setConfermaReset(false)
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-yellow-500 text-white p-4 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={onBack} className="text-2xl px-1">←</button>
        <h2 className="text-lg sm:text-xl font-bold">📊 Le mie Lacune</h2>
      </div>

      <div className="p-4 max-w-2xl mx-auto space-y-4">

        <GraficoProgressi />

        {/* Media generale */}
        {mediaTotale !== null ? (
          <div className={`rounded-2xl p-5 text-center text-white ${mediaTotale >= 80 ? 'bg-green-500' : mediaTotale >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}>
            <p className="text-sm opacity-90 mb-1">Media generale</p>
            <p className="text-5xl font-bold">{mediaTotale}%</p>
            <p className="text-sm opacity-80 mt-1">{analizzati.length} argomenti su 25 analizzati</p>
          </div>
        ) : (
          <div className="bg-blue-50 rounded-2xl p-5 text-center text-blue-700">
            <p className="text-4xl mb-2">📝</p>
            <p className="font-bold">Nessun dato ancora</p>
            <p className="text-sm mt-1">Fai dei quiz per vedere le tue lacune</p>
          </div>
        )}

        {/* Peggiori argomenti */}
        {ordinati.length > 0 && (
          <>
            <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wide px-1">
              Argomenti da migliorare
            </h3>
            {ordinati.map(({ key, nome, perc, corrette, totale }) => {
              const c = colore(perc)
              return (
                <div key={key} className="bg-white rounded-2xl p-4 shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <span>{c.emoji}</span>
                      <span className="font-medium text-gray-800 text-sm sm:text-base">{nome}</span>
                    </div>
                    <span className={`text-sm font-bold px-3 py-1 rounded-xl ${c.badge}`}>{perc}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                    <div className={`${c.bar} h-2 rounded-full transition-all`} style={{ width: `${perc}%` }} />
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-400">{corrette} corrette su {totale} domande</p>
                    <button
                      onClick={() => onAllenati(key)}
                      className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-xl font-bold active:scale-95 transition-transform"
                    >
                      Allenati →
                    </button>
                  </div>
                </div>
              )
            })}
          </>
        )}

        {/* Argomenti non ancora fatti */}
        {nonAnalizzati.length > 0 && (
          <>
            <h3 className="font-bold text-gray-400 text-sm uppercase tracking-wide px-1 mt-2">
              Non ancora studiati ({nonAnalizzati.length})
            </h3>
            {nonAnalizzati.map(({ key, nome }) => (
              <div key={key} className="bg-white rounded-2xl p-4 shadow-sm flex justify-between items-center opacity-60">
                <span className="text-sm text-gray-600">⬜ {nome}</span>
                <button
                  onClick={() => onAllenati(key)}
                  className="text-xs bg-gray-200 text-gray-700 px-3 py-1.5 rounded-xl font-bold active:scale-95 transition-transform"
                >
                  Inizia →
                </button>
              </div>
            ))}
          </>
        )}

        {/* Reset */}
        {analizzati.length > 0 && (
          <div className="pt-2">
            {!confermaReset ? (
              <button onClick={() => setConfermaReset(true)} className="w-full text-red-400 text-sm py-3 rounded-xl border border-red-200">
                🗑 Azzera statistiche
              </button>
            ) : (
              <div className="bg-red-50 rounded-2xl p-4 text-center">
                <p className="text-red-700 font-bold mb-3">Sei sicuro? I dati verranno cancellati.</p>
                <div className="flex gap-3">
                  <button onClick={resetStats} className="flex-1 bg-red-500 text-white font-bold py-2 rounded-xl">Sì, azzera</button>
                  <button onClick={() => setConfermaReset(false)} className="flex-1 bg-gray-200 text-gray-700 font-bold py-2 rounded-xl">Annulla</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ── RIEPILOGO FINALE ─────────────────────────────────────────
function Riepilogo({ storico, isEsame, onRicomincia, onHome }) {
  const errori = storico.filter(s => s.risposta !== s.corretta).length
  const corretti = storico.filter(s => s.risposta === s.corretta).length
  const promosso = isEsame ? errori <= 3 : null
  const [filtro, setFiltro] = useState('tutti')

  const filtrate = storico.filter(s => {
    if (filtro === 'errate') return s.risposta !== s.corretta
    if (filtro === 'corrette') return s.risposta === s.corretta
    return true
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className={`p-6 text-center ${isEsame ? (promosso ? 'bg-green-500' : 'bg-red-500') : 'bg-blue-600'}`}>
        <div className="text-5xl mb-2">{isEsame ? (promosso ? '🎉' : '😞') : '✅'}</div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white">
          {isEsame ? (promosso ? 'PROMOSSO!' : 'BOCCIATO') : 'Completato!'}
        </h2>
        <div className="flex justify-center gap-6 mt-3 text-white">
          <div className="text-center"><p className="text-2xl font-bold">{corretti}</p><p className="text-xs opacity-80">Corrette</p></div>
          <div className="text-center"><p className="text-2xl font-bold">{errori}</p><p className="text-xs opacity-80">Errori {isEsame && '(max 3)'}</p></div>
          <div className="text-center"><p className="text-2xl font-bold">{storico.length}</p><p className="text-xs opacity-80">Totale</p></div>
        </div>
        <div className="flex gap-3 mt-4 justify-center">
          <button onClick={onRicomincia} className="bg-white text-blue-800 font-bold py-3 px-6 rounded-xl text-base active:scale-95 transition-transform">Ricomincia</button>
          <button onClick={onHome} className="bg-white text-blue-800 font-bold py-2 px-5 rounded-xl text-sm active:scale-95 transition-transform">🏠 Home</button>
        </div>
      </div>

      <div className="flex gap-2 p-4 max-w-2xl mx-auto">
        {['tutti', 'errate', 'corrette'].map(f => (
          <button key={f} onClick={() => setFiltro(f)} className={`flex-1 py-2 rounded-xl text-sm font-bold transition-colors ${filtro === f ? 'bg-blue-700 text-white' : 'bg-white text-gray-600'}`}>
            {f === 'tutti' ? '📋 Tutte' : f === 'errate' ? '❌ Errate' : '✅ Corrette'}
          </button>
        ))}
      </div>

      <div className="px-4 pb-8 space-y-3 max-w-2xl mx-auto">
        {filtrate.map((s, i) => {
          const giusta = s.risposta === s.corretta
          return (
            <div key={i} className={`bg-white rounded-2xl p-4 shadow-sm border-l-4 ${giusta ? 'border-green-500' : 'border-red-500'}`}>
              <div className="flex items-start gap-2">
                <span className="text-lg shrink-0">{giusta ? '✅' : '❌'}</span>
                <p className="text-gray-800 text-sm sm:text-base leading-snug">{s.domanda}</p>
              </div>
              {!giusta && (
                <div className="mt-2 ml-7 bg-red-50 rounded-xl p-3">
                  <p className="text-xs text-red-600 font-medium">La tua risposta: <strong>{s.risposta ? 'VERO' : 'FALSO'}</strong></p>
                  <p className="text-xs text-green-700 font-medium mt-1">Risposta corretta: <strong>{s.corretta ? 'VERO' : 'FALSO'}</strong></p>
                </div>
              )}
              {s.spiegazione && (
                <div className={`mt-2 ml-7 rounded-xl p-3 ${giusta ? 'bg-blue-50' : 'bg-amber-50'}`}>
                  <p className="text-xs font-bold text-gray-700">Spiegazione</p>
                  <p className="text-xs text-gray-700 mt-1 leading-relaxed">{s.spiegazione}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── QUIZ ────────────────────────────────────────────────────
function Quiz({ domande, isEsame, argomentoKey, onFine, onBack }) {
  const [idx, setIdx] = useState(0)
  const [risposta, setRisposta] = useState(null)
  const [storico, setStorico] = useState([])
  const [secondi, setSecondi] = useState(isEsame ? 1200 : null)
  const [finito, setFinito] = useState(false)
  const [imgError, setImgError] = useState(false)
  const bannerRef = useRef(null)

  const d = domande[idx]
  const errori = storico.filter(s => s.risposta !== s.corretta).length

  useEffect(() => {
    if (!isEsame || finito) return
    if (secondi <= 0) { setFinito(true); return }
    const t = setTimeout(() => setSecondi(s => s - 1), 1000)
    return () => clearTimeout(t)
  }, [secondi, isEsame, finito])

  useEffect(() => { setImgError(false) }, [idx])

  // Salva stats quando finisce
  useEffect(() => {
    if (!finito || storico.length === 0) return
    const stats = loadStats()
    const perArgomento = {}
    storico.forEach(s => {
      const key = s.argomento
      if (!perArgomento[key]) perArgomento[key] = { corrette: 0, totale: 0 }
      perArgomento[key].totale++
      if (s.risposta === s.corretta) perArgomento[key].corrette++
    })
    for (const [key, dati] of Object.entries(perArgomento)) {
      if (!stats[key]) stats[key] = { corrette: 0, totale: 0 }
      stats[key].corrette += dati.corrette
      stats[key].totale += dati.totale
    }
    // Salva sessione per grafico progressi
    const corrette = storico.filter(s => s.risposta === s.corretta).length
    const sessioni = JSON.parse(localStorage.getItem('patente_sessioni') || '[]')
    sessioni.push({
      data: new Date().toLocaleDateString('it-IT', {day:'2-digit', month:'2-digit'}),
      perc: Math.round((corrette / storico.length) * 100),
      corrette,
      errori: storico.length - corrette,
      totale: storico.length,
      esame: isEsame
    })
    // Mantieni solo ultime 20 sessioni
    if (sessioni.length > 20) sessioni.splice(0, sessioni.length - 20)
    localStorage.setItem('patente_sessioni', JSON.stringify(sessioni))
    saveStats(stats)
  }, [finito])



  const rispondi = useCallback(async (scelta) => {
    if (risposta !== null || finito) return
    setRisposta(scelta)
    setStorico(prev => [...prev, { domanda: d.q, risposta: scelta, corretta: d.a, argomento: d.argomento, spiegazione: d.spiegazione || '' }])
    setTimeout(() => bannerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100)
    if (scelta !== d.a) {
    }
  }, [risposta, finito, d])

  const avanti = useCallback(() => {
    if (idx + 1 >= domande.length) { setFinito(true); return }
    setIdx(i => i + 1)
    setRisposta(null)
  }, [idx, domande.length])

  const minuti = secondi ? Math.floor(secondi / 60) : 0
  const secsRim = secondi ? secondi % 60 : 0

  if (finito) {
    return <Riepilogo storico={storico} isEsame={isEsame} onRicomincia={() => onFine(false)} onHome={() => onFine(true)} />
  }

  const sbagliata = risposta !== null && risposta !== d.a

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-blue-800 text-white p-3 sm:p-4 sticky top-0 z-10">
        <div className="flex justify-between items-center mb-2 max-w-2xl mx-auto">
          <button onClick={onBack} className="text-lg px-1">← Esci</button>
          <span className="font-bold text-sm">{idx + 1} / {domande.length}</span>
          <div className="flex gap-3 text-sm">
            {isEsame && (
              <span className={`font-bold ${secondi < 120 ? 'text-red-300' : 'text-white'}`}>
                ⏱ {minuti}:{secsRim.toString().padStart(2, '0')}
              </span>
            )}
            <span className="text-red-300 font-bold">❌ {errori}{isEsame ? '/3' : ''}</span>
          </div>
        </div>
        <div className="w-full bg-blue-900 rounded-full h-1.5 max-w-2xl mx-auto">
          <div className="bg-white rounded-full h-1.5 transition-all duration-300" style={{ width: `${((idx + 1) / domande.length) * 100}%` }} />
        </div>
      </div>

      <div className="flex-1 p-4 flex flex-col gap-4 max-w-2xl mx-auto w-full">
        {d.img && !imgError && (
          <div className="flex justify-center">
            <img src={`${BASE_IMG}${d.img}`} alt="segnale" className="max-h-36 sm:max-h-48 object-contain rounded-xl" onError={() => setImgError(true)} />
          </div>
        )}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm">
          <p className="text-gray-800 text-base sm:text-lg leading-relaxed">{d.q}</p>
        </div>
        <div className="space-y-3">
          {[true, false].map(val => {
            let cls = 'bg-white text-gray-800 border-2 border-gray-100'
            if (risposta !== null) {
              if (val === d.a) cls = 'bg-green-500 text-white border-2 border-green-500'
              else if (risposta === val) cls = 'bg-white text-red-500 border-2 border-red-400'
              else cls = 'bg-gray-100 text-gray-400 border-2 border-gray-100'
            }
            return (
              <button key={val} onClick={() => rispondi(val)} className={`w-full ${cls} font-bold text-lg sm:text-xl py-4 sm:py-5 rounded-2xl shadow-sm active:scale-95 transition-all`}>
                {val ? '✅ VERO' : '❌ FALSO'}
              </button>
            )
          })}
        </div>

        {sbagliata && (
          <div ref={bannerRef} className="bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-3 items-start">
            <span className="text-2xl shrink-0">🚩</span>
            <div className="flex-1">
              <p className="text-red-700 font-bold text-sm">Risposta sbagliata!</p>
              <p className="text-red-600 text-sm mt-1">La risposta corretta è <strong>{d.a ? 'VERO' : 'FALSO'}</strong>.</p>
              <p className="text-gray-500 text-xs mt-1">Argomento: {ARGOMENTI_NOMI[d.argomento] || d.argomento}</p>
            </div>
          </div>
        )}

        {risposta !== null && d.spiegazione && (
          <div className={`rounded-2xl p-4 border ${sbagliata ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200'}`}>
            <p className="text-sm font-bold text-gray-800">Spiegazione della risposta corretta</p>
            <p className="text-sm text-gray-700 mt-2 leading-relaxed">{d.spiegazione}</p>
          </div>
        )}

        {risposta !== null && (
          <button onClick={avanti} className="w-full bg-blue-700 text-white font-bold text-base sm:text-lg py-4 rounded-2xl active:scale-95 transition-transform">
            {idx + 1 >= domande.length ? 'Vedi riepilogo →' : 'Prossima →'}
          </button>
        )}
      </div>
    </div>
  )
}

// ── APP ROOT ────────────────────────────────────────────────
export default function App() {
  const primaVolta = !localStorage.getItem('patente_visited')
  const [schermata, setSchermata] = useState(primaVolta ? 'benvenuto' : 'home')
  const [domande, setDomande] = useState([])
  const [isEsame, setIsEsame] = useState(false)
  const [argomentoKey, setArgomentoKey] = useState(null)

  const avviaEsame = () => {
    // Pesca domande bilanciate da tutti gli argomenti
    const argomenti = Object.keys(datiGrezzi)
    const perArgomento = Math.ceil(30 / argomenti.length)
    const domandeBilanciate = []
    argomenti.forEach(key => {
      const pool = []
      Object.values(datiGrezzi[key]).forEach(arr => pool.push(...arr.map(d => ({...d, argomento: key}))))
      domandeBilanciate.push(...shuffle(pool).slice(0, perArgomento))
    })
    setDomande(shuffle(domandeBilanciate).slice(0, 30))
    setIsEsame(true)
    setArgomentoKey(null)
    setSchermata('quiz')
  }

  const avviaArgomento = (key) => {
    const d = []
    for (const dom of Object.values(datiGrezzi[key])) d.push(...dom.map(item => ({ ...item, argomento: key })))
    setDomande(shuffle(d))
    setIsEsame(false)
    setArgomentoKey(key)
    setSchermata('quiz')
  }

  if (schermata === 'benvenuto') return <Benvenuto onInizia={() => { localStorage.setItem('patente_visited', '1'); setSchermata('home') }} onPrivacy={() => window.open('https://stexcx.github.io/patentafacile-privacy', '_blank')} />
  if (schermata === 'privacy') return <PrivacyPolicy onBack={() => setSchermata('benvenuto')} />
  if (schermata === 'home') return <Home onEsame={avviaEsame} onArgomento={() => setSchermata('argomento')} onLacune={() => setSchermata('lacune')} />
  if (schermata === 'argomento') return <SceltaArgomento onScegli={k => avviaArgomento(k)} onBack={() => setSchermata('home')} />
  if (schermata === 'lacune') return <Lacune onAllenati={k => avviaArgomento(k)} onBack={() => setSchermata('home')} />
  if (schermata === 'quiz') return (
    <Quiz
      domande={domande}
      isEsame={isEsame}
      argomentoKey={argomentoKey}
      onBack={() => setSchermata('home')}
      onFine={(home) => {
        if (home) setSchermata('home')
        else isEsame ? avviaEsame() : setSchermata('argomento')
      }}
    />
  )
}
