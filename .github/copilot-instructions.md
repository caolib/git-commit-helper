# Git Commit Helper - AI Coding Instructions

## Project Overview

A **uTools plugin** built with Vue 3 + Vite that helps generate standardized git commit messages with emoji icons. The app runs inside uTools desktop application and provides two views: main commit generator and configuration panel.

## Architecture & Key Concepts

### uTools Plugin Integration

- **Entry point**: `public/plugin.json` defines plugin metadata, features, and entry commands
- **Development mode**: Uses `http://localhost:5173` (configured in `plugin.json`)
- **Production**: Serves from `index.html` after build
- **Preload script**: `public/preload/services.js` injects Node.js capabilities into renderer process via `window.services`
- **Plugin lifecycle**: App uses `window.utools.onPluginEnter()` and `window.utools.onPluginOut()` for navigation
- **Feature codes**: `commit` (main view) and `config` (settings) trigger different views in `App.vue`

### Data Persistence

- **Storage**: Uses `utools.dbStorage` API wrapped in `src/utils/store.js`
- **No backend**: All settings stored locally in uTools database
- **Config keys**: `useIcon`, `isCustomType`, `isCustomIcon`, `isKill`, `customFileUrl`, `customIconUrl`, `hideTip`

### Custom Data Sources

Users can override default commit types and icons via remote JSON URLs:

- Default data: `src/data/commitTypes.json` and `src/data/iconOptions.json`
- Custom URLs fetched at runtime if enabled in config
- Expected format: Array of `{value, label, icon}` objects

## Development Workflow

### Commands

- **Dev server**: `pnpm dev` - Starts Vite on port 5173
- **Build**: `pnpm build` - Creates production bundle in `dist/`
- **Test in uTools**: Run dev server, then trigger plugin with keywords like "feat", "commit", "fix"

### Path Aliasing

- `@` resolves to `src/` directory (configured in `vite.config.js`)
- Use `@/utils/store` instead of `../utils/store`

### Debugging

- **Vue DevTools**: Integrated via `vite-plugin-vue-devtools`
- **Console logging**: Check browser DevTools when running in uTools
- **Entry action payload**: `props.enterAction.payload` contains the keyword used to trigger plugin

## Project-Specific Patterns

### Component Communication

- **Props-based routing**: `App.vue` passes `enterAction` prop to child components
- **No Vue Router**: Simple conditional rendering based on `route.value` from uTools plugin code
- **Payload initialization**: `HomeView` uses `enterAction.payload` to pre-select commit type

### UI Framework

- **Ant Design Vue 4.x**: Use `<a-select>`, `<a-input>`, `<a-textarea>`, `<a-switch>`, etc.
- **Icons**: Import from `@ant-design/icons-vue` (e.g., `SettingFilled`)
- **Messages**: Use `message.success()` for toast notifications
- **Copy interaction**: `<a-typography-paragraph :copyable="...">` with `onCopy` callback

### State Management

- **Composition API**: All components use `<script setup>`
- **Reactive state**: Use `ref()` for all mutable state
- **Computed values**: `generatedCommitMessage` and `generatedGitCommitMessage` auto-update
- **Config defaults**: Use `getData(key) ?? defaultValue` pattern in `ConfigView.vue`

### Commit Message Format

Generated format: `{icon} {type}({scope}): {message}` or `{type}({scope}): {message}`

- Example with icon: `✨ feat(ui): add new button component`
- Example without: `feat(api): add user endpoint`
- Git command output: `git commit -m"{generated message}"`

## Key Files Reference

- `src/App.vue` - Plugin lifecycle and view routing
- `src/components/HomeView.vue` - Main commit generator (200+ lines)
- `src/components/ConfigView.vue` - Settings panel
- `public/plugin.json` - uTools plugin manifest
- `public/preload/services.js` - Node.js API bridge
- `src/utils/store.js` - uTools storage wrapper

## Common Pitfalls

1. **Don't use Vue Router** - uTools plugins use custom routing via `onPluginEnter()`
2. **Don't forget `window.utools` prefix** - All uTools APIs require `window.` or global scope
3. **Base path matters** - Set `base: './'` in Vite config for proper asset loading
4. **Preload script limitations** - Can't use ES modules, must use CommonJS (`require`)
5. **Plugin exit behavior** - Respect `isKill` config when copying (controls auto-hide)

## Testing Plugin Changes

1. Start dev server: `pnpm dev`
2. Open uTools (usually Alt+Space)
3. Type trigger keywords: "feat", "commit", "fix", etc.
4. Plugin should load from `localhost:5173`
5. For config: Type "git commit config"
