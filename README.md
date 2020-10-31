<!-- [![](https://data.jsdelivr.com/v1/package/npm/clappr-context-menu-plugin/badge)](https://www.jsdelivr.com/package/npm/clappr-context-menu-plugin)
[![](https://img.shields.io/npm/v/clappr-context-menu-plugin.svg?style=flat-square)](https://npmjs.org/package/clappr-context-menu-plugin)
[![](https://img.shields.io/npm/dt/clappr-context-menu-plugin.svg?style=flat-square)](https://npmjs.org/package/clappr-context-menu-plugin)
[![npm bundle size](https://img.shields.io/bundlephobia/min/clappr-context-menu-plugin?style=flat-square)](https://bundlephobia.com/result?p=clappr-context-menu-plugin)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)
![Travis (.com)](https://img.shields.io/travis/com/joaopaulovieira/clappr-context-menu-plugin?style=flat-square)
[![](https://img.shields.io/github/license/joaopaulovieira/clappr-context-menu-plugin?style=flat-square)](https://github.com/joaopaulovieira/clappr-context-menu-plugin/blob/master/LICENSE) -->

# Clappr queue plugin

>Image to illustrate the plugin here

## Table of Contents
- [Features](https://github.com/joaopaulovieira/clappr-queue-plugin#Features)
- [Usage](https://github.com/joaopaulovieira/clappr-queue-plugin#Usage)
- [Configuration](https://github.com/joaopaulovieira/clappr-queue-plugin#Configuration)
- [Development](https://github.com/joaopaulovieira/clappr-queue-plugin#Development)

## Features
- Enumerate features;

## Usage
You can use it from JSDelivr:
```
https://cdn.jsdelivr.net/npm/clappr-queue-plugin@latest/dist/clappr-queue-plugin.min.js
```
or as an npm package:
```
yarn add clappr-queue-plugin
```
Then just add `QueuePlugin` into the list of plugins of your player instance
```javascript
var player = new Clappr.Player({
  source: 'http://your.video/here.mp4',
  plugins: [QueuePlugin]
});
```

## Configuration
The options for the plugin go in the `queue` property as shown below
```javascript
var player = new Clappr.Player({
  source: 'http://your.video/here.mp4',
  plugins: [QueuePlugin],
  // add example of plugin options usage
  queue: {}
});
```

### `OptionName {OptionType}`
Description of the option


## Development

Install dependencies: `npm`

Run: `npm start`

Build: `npm run build`

Minified version: `npm run release`
