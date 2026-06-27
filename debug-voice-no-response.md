# Debug Session: voice-no-response
- **Status**: [OPEN]
- **Issue**: L'assistant vocal se connecte, mais ne semble pas entendre la voix utilisateur ni repondre oralement.
- **Debug Server**: `http://127.0.0.1:7777/event`
- **Log File**: `.dbg/trae-debug-log-voice-no-response.ndjson`

## Reproduction Steps
1. Ouvrir l'assistant Gemini.
2. Cliquer sur `Demarrer`.
3. Autoriser le microphone si demande.
4. Parler dans le micro pendant quelques secondes.
5. Constater qu'aucune transcription utile ni reponse vocale n'arrive.

## Hypotheses & Verification
| ID | Hypothesis | Likelihood | Effort | Evidence |
|----|------------|------------|--------|----------|
| A | Le microphone est ouvert mais le pipeline WebAudio n'emet pas de chunks audio exploitables. | High | Low | Rejected |
| B | Les chunks audio sont emis mais Gemini Live ne recoit pas le bon format ou le bon rythme. | High | Med | Confirmed |
| C | La session Gemini Live est connectee mais n'entre pas dans un cycle de traitement vocal actif. | Med | Low | Confirmed |
| D | Le niveau audio entrant est trop faible ou nul malgre l'autorisation micro. | Med | Med | Rejected |
| E | Un callback reseau/session echoue silencieusement apres connexion. | Med | Med | Partial |

## Log Evidence
- `audio.ts` a capture des chunks non silencieux (`peak` ~ `0.4956`) avec micro autorise
- La session Gemini passe bien par `onopen`, puis se ferme rapidement sans transcription exploitable
- Le SDK `@google/genai` web type `sendRealtimeInput({ audio?: Blob })`, alors que l'implementation envoyait `{ data, mimeType }`
- Correctif applique : envoi du PCM micro en `Blob` `audio/pcm;rate=16000`

## Verification Conclusion
- Attente d'une verification utilisateur post-fix
