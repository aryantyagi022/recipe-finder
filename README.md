# Recipe Finder & Meal Planner

A recipe discovery and weekly meal planning platform built with **Svelte 5 + SvelteKit**, powered by
a reusable **StencilJS** web component library that is published to npm and consumed by the app as a
package dependency.

## Links

| Deliverable | URL |
| --- | --- |
| GitHub repository | https://github.com/aryantyagi022/recipe-finder |
| npm package | https://www.npmjs.com/package/recipe-finder-ui |
| Deployed application | https://wonderful-kringle-9f9950.netlify.app |

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
video links, a personal star rating, favourite toggle and an "add to plan" action. Works for both
API recipes and user-created ones.

**Recipe management** — create, edit and delete your own recipes with client-side validation
(title, image URL, category, at least one measured ingredient, at least one instruction step,
numeric bounds on servings and prep time). Drafts survive an accidental reload.

**Favourites** — favourite any recipe (API or user-created), review them all on `/favorites`, and
remove them from anywhere in the app.

**Ratings** — give any recipe your own 1–5 star score from its details page; it is stored locally,
shown read-only on the recipe cards, and cleared by tapping the same star again.

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
| `rf-tag` | `label`, `value`, `tone`, `removable` | `rfRemove` | default |

See [`recipe-finder-ui/readme.md`](recipe-finder-ui/readme.md) for the full API and theming guide.
Each component also has a generated `readme.md` next to its source, produced by Stencil's
`docs-readme` output target from the JSDoc on its props and events.

Accessibility notes: `rf-recipe-card` exposes its title as a real button so keyboard users can
open a recipe without swallowing events from the favourite button or slotted footer actions, and
`rf-modal` moves focus into the dialog, traps Tab, closes on Escape, restores the previously
focused element and reference-counts its scroll lock so stacked modals behave correctly.

### How the app integrates it

- The library is registered once, client-side, in `web/src/routes/+layout.svelte` via
  `defineCustomElements()` from `recipe-finder-ui/components`.
- Object props (`recipe`, `groups`, `selected`) are assigned as DOM properties through the
  `bindProps` action in `web/src/lib/actions/bindProps.ts`, which re-applies them after
  `customElements.whenDefined()` so they survive lazy upgrade.
- Custom events are handled with Svelte 5's case-preserving attribute syntax, e.g.
  `onrfSelect={…}`, `onrfFavoriteToggle={…}`.
- Slots carry app-specific actions into library chrome — the card `footer` slot holds the
  "Add to plan" / "Delete" buttons and a read-only `rf-rating` for recipes you have scored, the
  modal `footer` slot holds its confirm actions, and the search bar `actions` slot holds the
  random-recipe button.
- Custom element tag typings live in `web/src/app.d.ts` so `svelte-check` stays clean.

## Prerequisites

- Node.js 20 (or newer) and npm 10+.
- If you use nvm: `nvm use 20`.

## Setup

The app consumes `recipe-finder-ui` from the npm registry, so it installs on its own:

```bash
cd web
npm install
```

Only work on the library if you intend to change the components:

```bash
cd recipe-finder-ui
npm install
npm run build
```

To try library changes in the app before publishing them, link the local build:

```bash
cd web
npm install ../recipe-finder-ui
```

Undo that with `npm install recipe-finder-ui@^0.1.0` once you are done — the committed
`package-lock.json` must resolve to the registry tarball.

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
npm run smoke       # packs the tarball, installs it in a temp dir and resolves every export

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
npm publish                     # prepublishOnly rebuilds dist and runs the smoke check
```

`prepublishOnly` runs `npm run build && npm run smoke`. The smoke check packs the tarball,
installs it into a temporary project and resolves every declared entry point through both
`import` and `require`, so a broken `exports` map fails the release instead of the consumer.

`package.json` already sets `publishConfig.access = "public"`, a curated `files` list and an
`exports` map (`.`, `./components`, `./loader`, `./theme.css`), so the published tarball contains
only build output and type declarations.

Versioning follows semver against the public surface — the custom element tag names, their props,
their events, their slots and the `--rf-*` theme tokens. Renaming or removing any of those, or
changing an event payload, is a major bump; adding a prop, event, slot or token with a
backwards-compatible default is a minor bump; everything else is a patch. Always release with
`npm version`, which writes the tag, rather than editing the version by hand.

After publishing a new version, bump the app's dependency so the committed lockfile pins the
registry tarball:

```bash
cd web
npm install recipe-finder-ui@^0.2.0
```

## Deployment (Netlify)

`netlify.toml` at the repository root configures the site:

```toml
[build]
  base = "web"
  command = "npm ci && npm run build"
  publish = "build"
```

The build only installs the app; `recipe-finder-ui` is pulled from npm like any other dependency,
so the library is never compiled during deploy. Connect the repository in Netlify and deploy — no
environment variables are required.

## Assumptions

- **Data source.** Recipes come from [TheMealDB](https://www.themealdb.com) free tier
  (`/api/json/v1/1`, no key). It has no combined-filter endpoint, so category + area filtering is
  performed by intersecting two filter calls client-side, and it exposes no ratings or servings —
  ratings in this app are therefore personal: `rf-rating` on the recipe details page records your
  own score for any recipe, stored locally, and is shown read-only on cards you have rated.
- **Cuisine list.** `list.php?a=list` cannot be used to populate the cuisine filter. It returns
  roughly 190 generic nationality demonyms, while the recipe data only uses 37 area values and
  formats them inconsistently — a mix of demonyms (`British`, `Spanish`) and country names
  (`India`, `United States`, `France`, `Norway`, `Netherlands`, `Argentina`, `Venezuela`,
  `Slovakia`). Selecting `Indian` or `American` from that endpoint's list therefore matches
  nothing. The filter is instead populated from `web/src/lib/api/areas.ts`, generated by
  `npm run refresh-areas`, which enumerates the whole catalogue (`search.php?f=a…z`) and collects
  the area values that actually occur. Re-run it if TheMealDB adds cuisines. Around 189 of the 789
  meals have no area at all and are only reachable by search or category.
- **Rate limiting.** The public API throttles bursts of requests, so `web/src/lib/api/mealdb.ts`
  memoises in-flight and completed requests for the session, capped at 50 entries with LRU
  eviction. Random-recipe lookups deliberately bypass the cache. `filter.php` omits category and
  area, so those values are backfilled from the active filter before the summary is stored.
- **Persistence.** There is no backend. User recipes, favourites, ratings and meal plans live in
  `localStorage` under the `rf:` key prefix and are therefore per-browser. Clearing site data
  resets the app. Stored values are shape-validated on read and namespaced by a schema version, so
  corrupt or outdated data is discarded rather than crashing the app, and a failed write (quota
  exceeded, private browsing) surfaces a banner instead of silently losing data. Changes made in
  one tab are picked up by others through the `storage` event.
- **Denormalised snapshots.** Favourites and planner slots store a copy of the recipe summary so
  they render without a network call; creating, editing and deleting a user recipe cascades into
  both, and deleting also drops the recipe's rating.
- **Rendering mode.** `web/src/routes/+layout.ts` sets `ssr = false`. The app is entirely
  localStorage-driven and renders custom elements, so client-side rendering avoids hydration
  mismatches and unresolved-element flashes.
- **Ownership.** Only recipes created in the app are editable or deletable; API recipes are
  read-only but can still be favourited and planned.
- **Planner shape.** A week runs Monday to Sunday with three slots per day (breakfast, lunch,
  dinner). Plans are archived per ISO week key, so navigating back to a previous week restores it.
- **Images.** Recipe images are referenced by URL rather than uploaded; the form validates that the
  value is a well-formed `http(s)` URL.
