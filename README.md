# jQuery Waveform Player

A lightweight and customizable audio waveform visualization plugin for jQuery. This plugin creates an interactive waveform display for audio files with real-time progress tracking and seeking capabilities.

[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Version](https://img.shields.io/badge/Version-2.0.0-blue.svg)](https://github.com/salarizadi/waveform)
[![Demo on CodePen](https://img.shields.io/badge/Demo-CodePen-blue)](https://codepen.io/salariz/pen/PwoQpXp)

## Demo

Check out the [live demo on CodePen](https://codepen.io/salariz/pen/PwoQpXp)

## Features

- 🎵 Real-time waveform visualization
- 🎨 Customizable appearance
- 📱 Mobile-friendly touch interactions
- 🔍 Seeking functionality
- ⚡ Optimized for large audio files
- 🎚️ Adjustable sampling quality
- 📊 Progress tracking
- 🎯 Event callbacks

## Installation

```html
<script src="jquery.min.js"></script>
<script src="jquery.waveform.js"></script>
```

## Basic Usage

```html
<div id="waveform"></div>
<audio id="audio-element"></audio>

<script>
$(document).ready(function() {
    $('#waveform').waveform({
        audioElement: '#audio-element',
        audioContext: new (window.AudioContext || window.webkitAudioContext)(),
        segments: 100,
        activeColor: "#2196F3",
        inactiveColor: "#E3F2FD"
    });
});
</script>
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `audioElement` | String | "#audio-element" | Selector for the audio element |
| `audioContext` | AudioContext | null | Web Audio API context |
| `segments` | Number | 100 | Number of waveform segments |
| `segmentGap` | Number | 1 | Gap between segments in pixels |
| `activeColor` | String | "#2196F3" | Color of the played portion |
| `inactiveColor` | String | "#ccc" | Color of the unplayed portion |
| `backgroundColor` | String | "#f5f5f5" | Background color of the container |
| `samplingQuality` | String | "medium" | Quality of waveform sampling ("low", "medium", "high") |
| `loadingText` | String | "Loading waveform..." | Text shown while generating waveform |

## Events

| Event | Description |
|-------|-------------|
| `onProgressChange` | Triggered when playback progress changes |
| `onSeek` | Triggered when user seeks to a new position |

## Complete Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Audio Waveform Player</title>
</head>
<body>
    <div class="player-wrapper">
        <input type="file" id="audio-file" accept="audio/*">
        <div class="controls">
            <button class="play-button">▶</button>
            <div id="waveform"></div>
            <div class="time-display">0:00</div>
        </div>
        <audio id="audio-element"></audio>
    </div>

    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="waveform.js"></script>
    <script>
        $(document).ready(function() {
            let audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            $('#waveform').waveform({
                audioElement: '#audio-element',
                audioContext: audioContext,
                segments: 100,
                samplingQuality: 'medium',
                activeColor: "#2196F3",
                inactiveColor: "#E3F2FD",
                loadingText: "Loading waveform...",
                onProgressChange: function(progress) {
                    // Handle progress change
                },
                onSeek: function(progress) {
                    // Handle seek
                }
            });
        });
    </script>
</body>
</html>
```

## Performance Tips

- For large audio files, use `samplingQuality: 'low'`
- Adjust `segments` value based on container width
- Consider using a lower number of segments for mobile devices

## Browser Support

- Chrome 34+
- Firefox 25+
- Safari 6+
- Edge 12+
- Opera 21+
- iOS Safari 6+
- Android Browser 4.4+

## License

Copyright (c) 2025 - Licensed under the MIT license.

## Support

For issues, feature requests, or questions, please use the [GitHub Issues](https://github.com/salarizadi/waveform/issues) page.
