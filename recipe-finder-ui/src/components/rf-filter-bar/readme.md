# rf-filter-bar



<!-- Auto Generated Below -->


## Overview

A row of controlled dropdown filters with an optional reset button.

## Properties

| Property     | Attribute    | Description                                                                   | Type            | Default |
| ------------ | ------------ | ----------------------------------------------------------------------------- | --------------- | ------- |
| `groups`     | --           | The filter groups to render. Must be set as a DOM property, not an attribute. | `FilterGroup[]` | `[]`    |
| `resettable` | `resettable` | Whether to show the reset button once at least one filter is active.          | `boolean`       | `true`  |
| `selected`   | --           | The active value per group id. The component is fully controlled by this map. | `string`        | `{}`    |


## Events

| Event            | Description                                                                                      | Type                                             |
| ---------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------ |
| `rfFilterChange` | Emitted when a group changes, with the group id and the newly selected value (`''` means "All"). | `CustomEvent<{ group: string; value: string; }>` |
| `rfFilterReset`  | Emitted when the reset button is pressed. The consumer is responsible for clearing `selected`.   | `CustomEvent<void>`                              |


## Slots

| Slot | Description                                         |
| ---- | --------------------------------------------------- |
|      | Extra controls rendered alongside the reset button. |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
