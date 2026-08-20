# rf-tag



<!-- Auto Generated Below -->


## Overview

A small pill for categories, cuisines and keywords, optionally removable.

## Properties

| Property    | Attribute   | Description                                                                               | Type                                              | Default     |
| ----------- | ----------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------- | ----------- |
| `label`     | `label`     | Text shown when nothing is slotted, and the basis of the remove button's accessible name. | `string`                                          | `''`        |
| `removable` | `removable` | Whether to render a remove button.                                                        | `boolean`                                         | `false`     |
| `tone`      | `tone`      | Colour variant.                                                                           | `"accent" \| "neutral" \| "success" \| "warning"` | `'neutral'` |
| `value`     | `value`     | Payload emitted by `rfRemove`. Defaults to the label or the slotted text.                 | `string`                                          | `''`        |


## Events

| Event      | Description                                             | Type                  |
| ---------- | ------------------------------------------------------- | --------------------- |
| `rfRemove` | Emitted with `value` when the remove button is pressed. | `CustomEvent<string>` |


## Slots

| Slot | Description                                                                                    |
| ---- | ---------------------------------------------------------------------------------------------- |
|      | Tag content. Overrides `label` for display, but `label` is still used for the accessible name. |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
