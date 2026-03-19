const API_KEY = "AIzaSyAydMX1QlIyyQaRZOasB7j-FvlUewTeuao"
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`

export async function spiegaErrore(domanda, rispostaCorretta) {
  try {
    const prompt = `Sei un esperto del codice della strada italiano che aiuta i candidati a prepararsi per l'esame della patente B.

L'utente ha risposto in modo ERRATO a questa domanda del quiz patente:

Domanda: "${domanda}"
Risposta corretta: ${rispostaCorretta ? 'VERO' : 'FALSO'}

Scrivi una spiegazione chiara e didattica di 2-3 frasi che spieghi:
1. Perché la risposta corretta è ${rispostaCorretta ? 'VERO' : 'FALSO'}
2. La regola del codice della strada che si applica (con articolo se possibile)

Sii preciso, concreto e utile per uno studente. Non dire "la risposta è VERO/FALSO", inizia direttamente con la spiegazione della regola.`

    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 500, temperature: 0.2 }
      })
    })
    const data = await res.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text || null
  } catch {
    return null
  }
}
