# rf-search-bar



<!-- Auto Generated Below -->


## Overview

A debounced search field with an optional clear button and a slot for adjacent actions.

## Properties

| Property      | Attribute     | Description                                                                             | Type      | Default            |
| ------------- | ------------- | --------------------------------------------------------------------------------------- | --------- | ------------------ |
| `debounce`    | `debounce`    | Milliseconds to wait after the last keystroke before emitting `rfSearch`.               | `number`  | `350`              |
| `disabled`    | `disabled`    | Disables the input, for example while results are loading.                              | `boolean` | `false`            |
| `label`       | `label`       | Visible label for the field. When empty, no label element is rendered.                  | `string`  | `''`               |
| `placeholder` | `placeholder` | Placeholder shown while the field is empty.                                             | `string`  | `'Search recipes'` |
| `value`       | `value`       | The current search term. Updating it from outside replaces whatever the user has typed. | `string`  | `''`               |


## Events

| Event      | Description                                                                                | Type                  |
| ---------- | ------------------------------------------------------------------------------------------ | --------------------- |
| `rfClear`  | Emitted when the clear button is pressed, just before an empty `rfSearch`.                 | `CustomEvent<void>`   |
| `rfSearch` | Emitted with the trimmed search term after the debounce elapses, or immediately on submit. | `CustomEvent<string>` |


## Slots

| Slot        | Description                                                |
| ----------- | ---------------------------------------------------------- |
| `"actions"` | Buttons rendered inside the field, after the clear button. |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
