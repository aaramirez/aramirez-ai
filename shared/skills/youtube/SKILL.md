---
name: youtube
description: Use for fetching and processing YouTube video transcriptions to feed into AI models, generate summaries, create course notes, or analyze video content.
license: MIT
---

# YouTube Transcript Skill

Fetch clean, timestamped transcriptions from any YouTube video.

## Usage

### CLI

```bash
# Using the script directly
node shared/scripts/youtube-transcript.js <video-id-or-url>

# Example
node shared/scripts/youtube-transcript.js GarWqdHzwac

# With language selection
node shared/scripts/youtube-transcript.js GarWqdHzwac --lang es
```

### Programmatic (Node.js)

```js
import { fetchTranscript } from './shared/scripts/youtube-transcript.js';

const transcript = await fetchTranscript('GarWqdHzwac', 'es');
console.log(transcript.text);   // Clean text
console.log(transcript.title);  // Video title
```

## Workflow

1. Get the YouTube video ID from the URL (`v=XXXXX` or the 11-char slug)
2. Fetch the transcript using the script or module
3. Process the text: summarize, extract key concepts, generate notes
4. Save relevant information into your knowledge base

## Cross-platform

Works on macOS, Linux, and Windows — no external dependencies beyond Node.js built-ins.

## Related

- Use with [git](git) skill for commit messages referencing video sources
- Use with [code-review](code-review) skill when reviewing code from tutorials
