# jQuery Waveform Player

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)

A sleek and interactive audio visualization plugin that creates a customizable waveform player with touch support and real-time updates.

## Demo

[View Live Demo on CodePen](https://codepen.io/salariz/pen/PwoQpXp)

## Features

- 🎵 Smooth audio visualization with customizable segments
- 📱 Touch-friendly interface with swipe support
- 🖱️ Desktop mouse controls 
- ⚡ Real-time progress updates
- 🎨 Customizable colors and appearance
- 📊 Configurable segment count and dimensions
- 🔄 Progress callbacks for integration

## Installation

Include jQuery and the Waveform Player plugin in your HTML:

```html
<script src="jquery.min.js"></script>
<script src="jquery.waveform.js"></script>
```

## Basic Usage

1. Add an audio element to your HTML:

```html
<audio id="audio-element" src="path/to/your/audio.mp3"></audio>
<div id="waveform"></div>
```

2. Initialize the waveform player:

```javascript
$('#waveform').waveform({
    audioElement: '#audio-element'
});
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `audioElement` | String | '#audio-element' | Audio element selector |
| `segments` | Number | 50 | Number of waveform segments |
| `minHeight` | Number | 30 | Minimum height percentage |
| `maxHeight` | Number | 70 | Maximum height percentage |
| `segmentGap` | Number | 1 | Gap between segments (pixels) |
| `activeColor` | String | '#2196F3' | Color for played segments |
| `inactiveColor` | String | '#ccc' | Color for unplayed segments |
| `onProgressChange` | Function | null | Callback when progress changes |
| `onSeek` | Function | null | Callback when seeking ends |

## Advanced Usage

```javascript
$('#waveform').waveform({
    audioElement: '#custom-audio',
    segments: 100,
    minHeight: 20,
    maxHeight: 80,
    segmentGap: 2,
    activeColor: '#FF4081',
    inactiveColor: '#E0E0E0',
    onProgressChange: function(progress) {
        console.log('Current progress:', progress);
    },
    onSeek: function(position) {
        console.log('Seeked to:', position);
    }
});
```

## Events

The plugin provides two callback events:

- `onProgressChange`: Triggered when the playback progress changes
- `onSeek`: Triggered when the user finishes seeking to a new position

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Opera (latest)
- Mobile browsers with touch support

## License

Copyright (c) 2025 - Licensed under the MIT license.

## Support

For issues, feature requests, or questions, please use the [GitHub Issues](https://github.com/salarizadi/waveform/issues) page.
