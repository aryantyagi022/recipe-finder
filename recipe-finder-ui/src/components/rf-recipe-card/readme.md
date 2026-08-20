# rf-recipe-card



<!-- Auto Generated Below -->


## Overview

A recipe summary card with an image, metadata, tags and a favourite toggle.

## Properties

| Property   | Attribute  | Description                                                                                             | Type             | Default     |
| ---------- | ---------- | ------------------------------------------------------------------------------------------------------- | ---------------- | ----------- |
| `badge`    | `badge`    | Optional label overlaid on the image, for example "My recipe".                                          | `string`         | `''`        |
| `compact`  | `compact`  | Renders a denser card for sidebars and pickers.                                                         | `boolean`        | `false`     |
| `favorite` | `favorite` | Whether the recipe is currently favourited, which drives the heart button's state.                      | `boolean`        | `false`     |
| `recipe`   | --         | The recipe to render. Must be set as a DOM property, not an attribute. Nothing renders until it is set. | `RecipeCardData` | `undefined` |


## Events

| Event              | Description                                                                             | Type                                                          |
| ------------------ | --------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `rfFavoriteToggle` | Emitted with the recipe and the requested state when the favourite button is activated. | `CustomEvent<{ recipe: RecipeCardData; favorite: boolean; }>` |
| `rfSelect`         | Emitted with the recipe when the card or its title is activated.                        | `CustomEvent<RecipeCardData>`                                 |


## Slots

| Slot       | Description                                                                                                            |
| ---------- | ---------------------------------------------------------------------------------------------------------------------- |
| `"footer"` | Action buttons rendered at the bottom of the card. Clicks and key presses on slotted content never trigger `rfSelect`. |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
