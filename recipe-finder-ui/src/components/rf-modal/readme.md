# rf-modal



<!-- Auto Generated Below -->


## Overview

An accessible dialog that traps focus, closes on Escape and restores focus on close.

## Properties

| Property      | Attribute     | Description                                                               | Type                   | Default |
| ------------- | ------------- | ------------------------------------------------------------------------- | ---------------------- | ------- |
| `dismissible` | `dismissible` | Whether Escape, the backdrop and the close button can dismiss the dialog. | `boolean`              | `true`  |
| `heading`     | `heading`     | The dialog title, also used as its accessible name.                       | `string`               | `''`    |
| `open`        | `open`        | Whether the dialog is visible. Nothing is rendered while it is false.     | `boolean`              | `false` |
| `size`        | `size`        | Dialog width preset.                                                      | `"lg" \| "md" \| "sm"` | `'md'`  |


## Events

| Event     | Description                                                                              | Type                |
| --------- | ---------------------------------------------------------------------------------------- | ------------------- |
| `rfClose` | Emitted when the user asks to dismiss the dialog. The consumer must set `open` to false. | `CustomEvent<void>` |


## Slots

| Slot       | Description                                          |
| ---------- | ---------------------------------------------------- |
|            | The dialog body.                                     |
| `"footer"` | Action buttons rendered at the bottom of the dialog. |
| `"header"` | Replaces the default heading.                        |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
