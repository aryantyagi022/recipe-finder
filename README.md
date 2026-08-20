# Recipe Finder & Meal Planner

A recipe discovery and weekly meal planning platform built with **Svelte 5 + SvelteKit**, powered by
a reusable **StencilJS** web component library that is published to npm and consumed by the app as a
package dependency.

## Links

| Deliverable | URL |
| --- | --- |
| GitHub repository | _add after pushing_ |
| npm package | https://www.npmjs.com/package/recipe-finder-ui |
| Deployed application | _add after the first Netlify deploy_ |

## Repository layout

```
RecipeFinder/
├── recipe-finder-ui/   StencilJS component library (published to npm)
├── web/                SvelteKit application
├── netlify.toml        Deployment configuration
└── README.md
```

## Features

**Recipe discovery** — keyword search, category and area filters, a "surprise me" random pick,
paginated results grid, and shareable URLs (`/?q=chicken&category=Seafood`).

**Recipe details** — full ingredient table with measures, numbered instructions, tags, source and
video links, favourite toggle and an "add to plan" action. Works for both API recipes and
user-created ones.

**Recipe management** — create, edit and delete your own recipes with client-side validation
(title, image URL, category, at least one measured ingredient, at least one instruction step,
numeric bounds on servings and prep time). Drafts survive an accidental reload.

**Favourites** — favourite any recipe (API or user-created), review them all on `/favorites`, and
remove them from anywhere in the app.

**Weekly meal planner** — a 7 day × 3 slot grid with week navigation, assign/replace/move/remove,
clear-day and clear-week actions, and a picker that searches TheMealDB alongside your own recipes
and favourites.

## Component library

`recipe-finder-ui` ships seven shadow-DOM components, themeable through `--rf-*` CSS custom
properties:

| Component | Props | Events | Slots |
| --- | --- | --- | --- |
| `rf-search-bar` | `value`, `placeholder`, `label`, `debounce`, `disabled` | `rfSearch`, `rfClear` | `actions` |
| `rf-filter-bar` | `groups`, `selected`, `resettable` | `rfFilterChange`, `rfFilterReset` | default |
| `rf-recipe-card` | `recipe`, `favorite`, `badge`, `compact` | `rfSelect`, `rfFavoriteToggle` | `footer` |
| `rf-rating` | `value`, `max`, `readonly`, `label` | `rfRate` | — |
| `rf-modal` | `open`, `heading`, `size`, `dismissible` | `rfClose` | `header`, default, `footer` |
| `rf-empty-state` | `icon`, `heading`, `message` | — | default |
| `rf-tag` | `label`, `tone`, `removable` | `rfRemove` | — |

See [`recipe-finder-ui/readme.md`](recipe-finder-ui/readme.md) for the full API and theming guide.

### How the app integrates it

- The library is registered once, client-side, in `web/src/routes/+layout.svelte` via
  `defineCustomElements()` from `recipe-finder-ui/components`.
- Object props (`recipe`, `groups`, `selected`) are assigned as DOM properties through the
  `bindProps` action in `web/src/lib/actions/bindProps.ts`, which re-applies them after
  `customElements.whenDefined()` so they survive lazy upgrade.
- Custom events are handled with Svelte 5's case-preserving attribute syntax, e.g.
  `onrfSelect={…}`, `onrfFavoriteToggle={…}`.
- Slots carry app-specific actions into library chrome — the card `footer` slot holds the
  "Add to plan" / "Delete" buttons, the modal `footer` slot holds its confirm actions, and the
  search bar `actions` slot holds the random-recipe button.
- Custom element tag typings live in `web/src/app.d.ts` so `svelte-check` stays clean.

## Prerequisites

- Node.js 20 (or newer) and npm 10+.
- If you use nvm: `nvm use 20`.

## Setup

Build and link the component library first — the app consumes its build output, not its source.

```bash
cd recipe-finder-ui
npm install
npm run build

cd ../web
npm install
```

## Starting the development server

```bash
cd web
npm run dev
```

The app is served at http://localhost:5173.

To iterate on the component library at the same time, run its watcher in a second terminal:

```bash
cd recipe-finder-ui
npm start
```

Stencil also serves a standalone component playground at http://localhost:3333.

## Testing, type checking and building

```bash
cd recipe-finder-ui
npm test            # Vitest: unit specs plus real-browser component specs (Playwright chromium)
npm run build

cd ../web
npm run check       # svelte-check
npm test            # Vitest
npm run build       # production build via @sveltejs/adapter-netlify
```

The library's browser tests need a Chromium binary once: `npx playwright install chromium`.

## Publishing the component library

```bash
cd recipe-finder-ui
npm login                       # required once; publishing always needs an authenticated session
npm version patch|minor|major   # semver bump
npm publish                     # prepublishOnly rebuilds dist automatically
```

`package.json` already sets `publishConfig.access = "public"`, a curated `files` list and an
`exports` map (`.`, `./components`, `./loader`), so the published tarball contains only build
output and type declarations.

After the first publish, point the app at the registry version instead of the local folder:

```bash
cd web
npm install recipe-finder-ui@^0.1.0
```

## Deployment (Netlify)

`netlify.toml` at the repository root configures the site:

```toml
[build]
  base = "web"
  command = "npm run build"
  publish = "build"
```

Connect the repository in Netlify and deploy — no environment variables are required. The build
resolves `recipe-finder-ui` from npm, so make sure the library has been published (or the
`file:` dependency vendored) before the first deploy.

## Assumptions

- **Data source.** Recipes come from [TheMealDB](https://www.themealdb.com) free tier
  (`/api/json/v1/1`, no key). It has no combined-filter endpoint, so category + area filtering is
  performed by intersecting two filter calls client-side, and it exposes no ratings or servings —
  `rf-rating` is therefore driven by user-supplied values on user recipes only.
- **Rate limiting.** The public API throttles bursts of requests, so `web/src/lib/api/mealdb.ts`
  memoises in-flight and completed requests for the session. Random-recipe lookups deliberately
  bypass the cache.
- **Persistence.** There is no backend. User recipes, favourites and meal plans live in
  `localStorage` under the `rf:` key prefix and are therefore per-browser. Clearing site data
  resets the app.
- **Rendering mode.** `web/src/routes/+layout.ts` sets `ssr = false`. The app is entirely
  localStorage-driven and renders custom elements, so client-side rendering avoids hydration
  mismatches and unresolved-element flashes.
- **Ownership.** Only recipes created in the app are editable or deletable; API recipes are
  read-only but can still be favourited and planned.
- **Planner shape.** A week runs Monday to Sunday with three slots per day (breakfast, lunch,
  dinner). Plans are archived per ISO week key, so navigating back to a previous week restores it.
- **Images.** Recipe images are referenced by URL rather than uploaded; the form validates that the
  value is a well-formed `http(s)` URL.
