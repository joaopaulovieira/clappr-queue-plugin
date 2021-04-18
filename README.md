[![](https://data.jsdelivr.com/v1/package/npm/clappr-queue-plugin/badge)](https://www.jsdelivr.com/package/npm/clappr-queue-plugin)
[![](https://img.shields.io/npm/v/clappr-queue-plugin.svg?style=flat-square)](https://npmjs.org/package/clappr-queue-plugin)
[![](https://img.shields.io/npm/dt/clappr-queue-plugin.svg?style=flat-square)](https://npmjs.org/package/clappr-queue-plugin)
[![npm bundle size](https://img.shields.io/bundlephobia/min/clappr-queue-plugin?style=flat-square)](https://bundlephobia.com/result?p=clappr-queue-plugin)
![Coveralls github](https://img.shields.io/coveralls/github/joaopaulovieira/clappr-queue-plugin?style=flat-square)
![Travis (.com)](https://img.shields.io/travis/com/joaopaulovieira/clappr-queue-plugin?style=flat-square)
[![](https://img.shields.io/github/license/joaopaulovieira/clappr-context-menu-plugin?style=flat-square)](https://github.com/joaopaulovieira/clappr-context-menu-plugin/blob/master/LICENSE)

# Clappr queue plugin
<div align=center><img src="./public/images/queue.gif"></div>

## Demo
https://joaopaulovieira.github.io/clappr-queue-plugin/

## Table of Contents
- [Features](https://github.com/joaopaulovieira/clappr-queue-plugin#Features)
- [Usage](https://github.com/joaopaulovieira/clappr-queue-plugin#Usage)
- [Configuration](https://github.com/joaopaulovieira/clappr-queue-plugin#Configuration)
- [API Documentation](https://github.com/joaopaulovieira/clappr-queue-plugin#API-Documentation)
- [Development](https://github.com/joaopaulovieira/clappr-queue-plugin#Development)

## Features
### :clapper: Play videos in sequence
The first media in the queue starts immediately after the current media ends. The plugin provides one API to play any media in the queue in any order you want.

### :memo: Set configs at plugin initialization
Define if the queue plugin plays the next video or just load.

### :toolbox: Update video queue dynamically
Use the plugin or player reference to add/remove videos in the queue.

## Usage
You can use it from JSDelivr:
```
https://cdn.jsdelivr.net/npm/clappr-queue-plugin@latest/dist/clappr-queue-plugin.min.js
```
or as an npm package:
```properties
# Using yarn
yarn add clappr-queue-plugin

# Using npm
npm i clappr-queue-plugin
```

Then just add the `QueuePlugin` into the list of plugins of your player instance and set the media(s) to play in sequence on `queue.nextVideos` config:
```javascript
var player = new Clappr.Player({
  source: 'http://your.video/here.mp4',
  plugins: [QueuePlugin],
  queue: { nextVideos: ['http://another.video/here.mp4'] },
});
```

## Configuration
The options for the plugin go in the `queue` property as shown below:
```javascript
var player = new Clappr.Player({
  source: 'http://your.video/here.mp4',
  plugins: [QueuePlugin],
  queue: {
    nextVideos: ['http://another.video/here.mp4'],
    autoPlayNextVideo: true,
  },
});
```

### `nextVideos {Array}`
An array where each item should be one video source URL.

### `autoPlayNextVideo {Boolean}`
Defines if the queue plugin should play the media after it's loaded. The plugin does not mutate the Clappr option `autoPlay`.

## API Documentation

### Plugin API
| method | arguments | description |
|--------|:---------:|-------------|
| `plugin.appendVideo` | `URL` or `[URL, ...]` | Adds the video URL(s) at the end of the queue. |
| `plugin.prependVideo` | `URL` or `[URL, ...]` | Adds the video URL(s) at the top of the queue. |
| `plugin.popVideo` |  | Removes the video URL at the end of the queue. |
| `plugin.shiftVideo` |  | Removes the video URL at the top of the queue. |
| `plugin.playNextVideo` |  | Load and play (accordingly `autoPlayNextVideo` value) the video URL at the top of the queue. |
| `plugin.playPosition` | `Number (position of the queue array)` | Load and play (accordingly `autoPlayNextVideo` value) the video URL related to the position in the queue. |
| `plugin.playItem` | `URL` | Load and play (accordingly `autoPlayNextVideo` value) if the video URL is registered into the queue. |
| `plugin.shuffleItems` |  | Sort the items in the queue randomly. |

| getter | description | Response |
|--------|-------------|:--------:|
| `plugin.videoQueue` | Returns the video queue. | `[URL, ...]` |

### Player API
| method | arguments | description |
|--------|:---------:|-------------|
| `player.appendVideoOnQueue` | `URL` or `[URL, ...]` | A external interface to use `appendVideo` via player instance. |
| `player.prependVideoOnQueue` | `URL` or `[URL, ...]` | A external interface to use `prependVideo` via player instance. |
| `player.popVideoFromQueue` |  | A external interface to use `popVideo` via player instance. |
| `player.shiftVideoFromQueue` |  | A external interface to use `shiftVideo` via player instance. |
| `player.playNextVideoOnQueue` |  | A external interface to use `playNextVideo` via player instance. |
| `plugin.playQueuePosition` | `Number (position of the queue array)` | A external interface to use `playPosition` via player instance. |
| `plugin.playQueueItem` | `URL` | A external interface to use `playItem` via player instance. |
| `plugin.shuffleQueueItems` |  | A external interface to use `shuffleItems` via player instance. |

| getter | description | Response |
|--------|-------------|:--------:|
| `player.getVideoQueue` | Returns the video queue. | `[URL, ...]` |

## Development
Install dependencies: `npm install`

Run: `npm start`

Test: `npm test`

Lint: `npm run lint`

Build: `npm run build`

Minified version: `npm run release`
