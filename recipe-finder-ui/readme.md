# recipe-finder-ui

Reusable [StencilJS](https://stenciljs.com/) web components for recipe discovery and meal planning
interfaces. The components are framework agnostic custom elements and are consumed by the
Recipe Finder & Meal Planner SvelteKit application.

## Installation

```bash
npm install recipe-finder-ui
```

## Usage

Register the components once, then use them anywhere in your markup.

```js
import { defineCustomElements } from 'recipe-finder-ui/loader';
import 'recipe-finder-ui/dist/recipe-finder-ui/recipe-finder-ui.css';

defineCustomElements();
```

```html
<rf-search-bar label="Search" placeholder="Try 'pasta'"></rf-search-bar>

<rf-recipe-card badge="Popular">
  <rf-tag slot="footer" tone="accent" label="30 min"></rf-tag>
</rf-recipe-card>
```

Object valued properties must be assigned as DOM properties rather than attributes:

```js
document.querySelector('rf-recipe-card').recipe = {
  id: '52772',
  title: 'Teriyaki Chicken Casserole',
  image: 'https://www.themealdb.com/images/media/meals/wvpsxx1468256321.jpg',
  category: 'Chicken',
  area: 'Japanese'
};
```

## Components

| Tag | Purpose | Key props | Events | Slots |
| --- | --- | --- | --- | --- |
| `rf-search-bar` | Debounced search input | `value`, `placeholder`, `label`, `debounce`, `disabled` | `rfSearch`, `rfClear` | `actions` |
| `rf-filter-bar` | Grouped select filters | `groups`, `selected`, `resettable` | `rfFilterChange`, `rfFilterReset` | default |
| `rf-recipe-card` | Recipe tile with favorite toggle | `recipe`, `favorite`, `badge`, `compact` | `rfSelect`, `rfFavoriteToggle` | `footer` |
| `rf-rating` | Interactive star rating | `value`, `max`, `readonly`, `label` | `rfRate` | – |
| `rf-modal` | Accessible dialog | `open`, `heading`, `size`, `dismissible` | `rfClose` | `header`, default, `footer` |
| `rf-empty-state` | Empty/zero result placeholder | `icon`, `heading`, `message` | – | default |
| `rf-tag` | Pill label | `label`, `tone`, `removable` | `rfRemove` | default |

Per component API documentation is generated into each component folder `readme.md`.

## Theming

All components read CSS custom properties declared on `:root`, so a host application can
re-theme the library without touching shadow DOM internals.

| Token | Default |
| --- | --- |
| `--rf-color-accent` | `#e8590c` |
| `--rf-color-surface` | `#ffffff` |
| `--rf-color-text` | `#1c2430` |
| `--rf-color-border` | `#e2e5ea` |
| `--rf-radius-lg` | `18px` |

## Development

```bash
npm install
npm start          # dev server with a component playground
npm run build      # production build + generated docs
npm test           # unit tests (stencil env) and component tests (chromium)
```

## Releasing

```bash
npm version patch   # or minor / major
npm publish         # runs the build through prepublishOnly
```
