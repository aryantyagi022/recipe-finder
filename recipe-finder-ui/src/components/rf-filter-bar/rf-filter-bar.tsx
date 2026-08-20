import { Component, Event, EventEmitter, Prop, h } from '@stencil/core';
import type { FilterGroup } from '../../types';

/**
 * A row of controlled dropdown filters with an optional reset button.
 *
 * @slot - Extra controls rendered alongside the reset button.
 */
@Component({
  tag: 'rf-filter-bar',
  styleUrl: 'rf-filter-bar.css',
  shadow: true,
})
export class RfFilterBar {
  /** The filter groups to render. Must be set as a DOM property, not an attribute. */
  @Prop() groups: FilterGroup[] = [];
  /** The active value per group id. The component is fully controlled by this map. */
  @Prop() selected: Record<string, string> = {};
  /** Whether to show the reset button once at least one filter is active. */
  @Prop() resettable = true;

  /** Emitted when a group changes, with the group id and the newly selected value (`''` means "All"). */
  @Event({ eventName: 'rfFilterChange' }) rfFilterChange: EventEmitter<{ group: string; value: string }>;
  /** Emitted when the reset button is pressed. The consumer is responsible for clearing `selected`. */
  @Event({ eventName: 'rfFilterReset' }) rfFilterReset: EventEmitter<void>;

  private get parsedGroups(): FilterGroup[] {
    return Array.isArray(this.groups) ? this.groups : [];
  }

  private get activeCount(): number {
    return Object.values(this.selected ?? {}).filter(Boolean).length;
  }

  private handleChange = (group: string) => (event: Event) => {
    this.rfFilterChange.emit({ group, value: (event.target as HTMLSelectElement).value });
  };

  render() {
    return (
      <div class="wrapper">
        {this.parsedGroups.map(group => (
          <label class="group" key={group.id}>
            <span>{group.label}</span>
            <select onChange={this.handleChange(group.id)}>
              <option value="" selected={!this.selected?.[group.id]}>
                All
              </option>
              {group.options.map(option => (
                <option value={option.value} selected={this.selected?.[group.id] === option.value} key={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        ))}
        <div class="extra">
          <slot />
          {this.resettable && this.activeCount > 0 && (
            <button type="button" class="reset" onClick={() => this.rfFilterReset.emit()}>
              Reset filters ({this.activeCount})
            </button>
          )}
        </div>
      </div>
    );
  }
}
