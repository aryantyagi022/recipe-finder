# rf-rating



<!-- Auto Generated Below -->


## Overview

A star rating control that can be interactive or read-only.

## Properties

| Property   | Attribute  | Description                                      | Type      | Default    |
| ---------- | ---------- | ------------------------------------------------ | --------- | ---------- |
| `label`    | `label`    | Accessible name for the rating group.            | `string`  | `'Rating'` |
| `max`      | `max`      | How many stars to render.                        | `number`  | `5`        |
| `readonly` | `readonly` | Renders the rating as a non-interactive display. | `boolean` | `false`    |
| `value`    | `value`    | The current score, from 0 to `max`.              | `number`  | `0`        |


## Events

| Event    | Description                                                                             | Type                  |
| -------- | --------------------------------------------------------------------------------------- | --------------------- |
| `rfRate` | Emitted with the chosen score. Selecting the current score again emits `0` to clear it. | `CustomEvent<number>` |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
