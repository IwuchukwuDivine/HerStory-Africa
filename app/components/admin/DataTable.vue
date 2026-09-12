<template>
  <div class="a-table">
    <div class="a-table__scroll">
      <div class="a-table__grid" :style="gridStyle">
        <div class="a-table__head" role="row">
          <span
            v-for="col in columns"
            :key="col.key"
            class="a-table__th"
            :class="col.align === 'end' && 'a-table__cell--end'"
            role="columnheader"
          >{{ col.label }}</span>
        </div>

        <div
          v-for="row in rows"
          :key="cell(row, rowKey)"
          class="a-table__row"
          role="row"
        >
          <span
            v-for="col in columns"
            :key="col.key"
            class="a-table__td"
            :class="col.align === 'end' && 'a-table__cell--end'"
            role="cell"
          >
            <slot :name="`cell-${col.key}`" :row="row">{{ cell(row, col.key) }}</slot>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T extends object">
export interface TableColumn {
  key: string;
  label: string;
  /** Any grid track value; defaults to an equal share. */
  width?: string;
  align?: "start" | "end";
}

const props = defineProps<{
  columns: TableColumn[];
  rows: T[];
  /** Field on each row that uniquely identifies it. */
  rowKey: string;
}>();

/** Row fields are read by string key, so they arrive untyped and are rendered as text. */
function cell(row: T, key: string): string {
  const value = (row as Record<string, unknown>)[key];
  return value == null ? "" : String(value);
}

const gridStyle = computed(() => ({
  gridTemplateColumns: props.columns
    .map((c) => c.width ?? "minmax(0, 1fr)")
    .join(" "),
}));
</script>

<style scoped>
/* Wide tables scroll inside their own container rather than pushing the page
   sideways; the grid keeps header and body columns locked together. */
.a-table__scroll {
  overflow-x: auto;
}

.a-table__grid {
  display: grid;
  min-width: 34rem;
}

.a-table__head,
.a-table__row {
  display: grid;
  grid-template-columns: subgrid;
  grid-column: 1 / -1;
  align-items: center;
}

.a-table__head {
  border-bottom: 1px solid var(--border-light);
}

.a-table__row {
  border-bottom: 1px solid var(--border-light);
  transition: background 0.15s ease;
}

.a-table__row:last-child {
  border-bottom: none;
}

.a-table__row:hover {
  background: var(--surface-muted);
}

.a-table__th {
  padding: 0.5rem 1rem;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.a-table__td {
  padding: 0.625rem 1rem;
  font-size: 0.8125rem;
  color: var(--text-secondary);
  min-width: 0;
}

.a-table__cell--end {
  text-align: end;
}
</style>
