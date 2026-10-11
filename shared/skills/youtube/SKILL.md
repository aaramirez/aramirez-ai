---
name: youtube
description: Use for fetching and processing YouTube video transcriptions to feed into AI models, generate summaries, create course notes, or analyze video content.
license: MIT
scripts:
  - youtube-transcript.js
---

# YouTube Transcript Skill

Fetch clean, timestamped transcriptions from any YouTube video.

## Usage

### CLI

```bash
# Using the script directly
node .opencode/scripts/youtube-transcript.js <video-id-or-url>

# Example
node .opencode/scripts/youtube-transcript.js GarWqdHzwac

# With language selection
node .opencode/scripts/youtube-transcript.js GarWqdHzwac --lang es
```

### Programmatic (Node.js)

```js
import { fetchTranscript } from './.opencode/scripts/youtube-transcript.js';

const transcript = await fetchTranscript('GarWqdHzwac', 'es');
console.log(transcript.text);   // Clean text
console.log(transcript.title);  // Video title
```

## Workflow

1. Get the YouTube video ID from the URL (`v=XXXXX` or the 11-char slug)
2. Fetch the transcript using the script or module
3. Process the text: summarize, extract key concepts, generate notes
4. **Save the raw transcript** as a reference file in the Obsidian vault: `Transcripciones/<video-id> - <title>.md`
5. Create or update course notes linking to the transcript

### Ejemplo de guardado

```bash
# Obtener transcripción
node .opencode/scripts/youtube-transcript.js ZZq4TpNgnvg --lang es > "curso-ia/Transcripciones/ZZq4TpNgnvg - Curso de OpenCode desde cero.md"
```

## Descargas en lote: siempre en modo lento

YouTube bloquea la IP (`IpBlocked` / `RequestBlocked` / HTTP 429) tras unas decenas de peticiones seguidas, y el bloqueo dura horas. Cualquier descarga de YouTube (transcripciones, metadatos con `yt-dlp`, playlists) se hace **siempre en modo lento**, aunque sean pocos videos:

- **Un video cada 4–5 minutos** (pausa aleatoria de 240–300 s entre videos). Nunca en paralelo ni en ráfaga.
- **Ante un bloqueo, detener y esperar 30 minutos** antes de reintentar; repetir el ciclo hasta terminar.
- **Reanudable**: guardar cada transcripción en su propio archivo y saltar las ya descargadas, para que un reinicio no repita peticiones.
- No usar cookies del navegador salvo que el usuario lo pida.

### Lotes grandes: `youtube-transcript-api`

La API de `youtube-transcript.js` (youtube-transcript.ai) **ahora exige API key** y limita a ~10 peticiones/día. El script no envía ninguna key, así que hoy responde 401; y aun con key no serviría para playlists. Para lotes, usa la librería Python [`youtube-transcript-api`](https://pypi.org/project/youtube-transcript-api/) en un venv, con el ritmo lento de arriba:

```python
import random, time
from youtube_transcript_api import YouTubeTranscriptApi

api = YouTubeTranscriptApi()
for vid in video_ids:
    tracks = list(api.list(vid))
    # elegir la pista del idioma original (ver abajo), manual > auto-generada
    t = next(t for t in tracks if t.language_code.split('-')[0] == orig_lang)
    snippets = t.fetch().snippets   # [{start, text}]
    # ... guardar en <dir>/<vid>.json ...
    time.sleep(random.uniform(240, 300))
```

**Idioma original**: los videos con doblaje automático exponen pistas auto-generadas en otros idiomas (árabe, bengalí…). Obtén el idioma del audio con `yt-dlp` (campo `language`) y elige esa pista, prefiriendo la manual. Ojo: a veces los metadatos están mal (`hi`, `ta` en un video en inglés) y la pista auto-generada es inglés transliterado en otro alfabeto; detéctalo y reconstruye el texto en inglés en vez de usarlo tal cual.

## Cross-platform

Works on macOS, Linux, and Windows. `youtube-transcript.js` needs only Node.js built-ins; batch downloads need Python 3 with `youtube-transcript-api` (and optionally `yt-dlp`).

## Related

- Use with [git](git) skill for commit messages referencing video sources
- Use with [code-review](code-review) skill when reviewing code from tutorials
- Use with [kb-management](kb-management) skill to maintain the Obsidian vault structure
