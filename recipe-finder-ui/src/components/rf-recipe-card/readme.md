# rf-recipe-card



<!-- Auto Generated Below -->


## Properties

| Property   | Attribute  | Description | Type             | Default     |
| ---------- | ---------- | ----------- | ---------------- | ----------- |
| `badge`    | `badge`    |             | `string`         | `''`        |
| `compact`  | `compact`  |             | `boolean`        | `false`     |
| `favorite` | `favorite` |             | `boolean`        | `false`     |
| `recipe`   | --         |             | `RecipeCardData` | `undefined` |


## Events

| Event              | Description | Type                                                          |
| ------------------ | ----------- | ------------------------------------------------------------- |
| `rfFavoriteToggle` |             | `CustomEvent<{ recipe: RecipeCardData; favorite: boolean; }>` |
| `rfSelect`         |             | `CustomEvent<RecipeCardData>`                                 |


## Slots

| Slot       | Description |
| ---------- | ----------- |
| `"footer"` |             |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
