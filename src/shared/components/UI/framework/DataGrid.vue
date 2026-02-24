<template>
  <div class="datagrid">
    <div class="row header">
      <div
        v-for="c in columns"
        :key="c.field"
        class="header cell"
        :style="c.width ? { width: c.width, flex: 'none' } : {}"
      >
        {{ c.title }}
      </div>
    </div>

    <div v-for="(row, rowIndex) in data" :key="rowIndex" class="row">
      <div
        v-for="c in columns"
        :key="c.field"
        class="cell"
        :style="c.width ? { width: c.width, flex: 'none' } : {}"
      >
        <RenderVNodes
          v-if="c.cell"
          :nodes="c.cell({ row, value: c.field ? row[c.field] : undefined, col: c, rowIndex })"
        />
        <template v-else>
          {{ c.field ? row[c.field] : "" }}
        </template>
      </div>
    </div>
  </div>

  <!-- NOTE: no <slot/> here, so columns are NOT rendered -->
</template>

<script setup lang="ts">
import {
  Comment,
  computed,
  defineComponent,
  Fragment,
  Text,
  useSlots,
  type PropType,
  type VNode,
  type VNodeChild,
} from "vue";
import DataGridColumn, { type DataGridColumnProps } from "./DataGridColumn.vue";

const RenderVNodes = defineComponent({
  name: "RenderVNodes",
  props: {
    nodes: { type: null as unknown as PropType<VNodeChild>, required: true },
  },
  setup(props) {
    return () => props.nodes; // return VNodes directly
  },
});

type CellSlot = (ctx: { row: any; value: any; col: ColumnDef; rowIndex: number }) => any;

type ColumnDef = {
  key: string;
  field?: string;
  title?: string;
  width?: number | string;
  cell?: CellSlot;
};

withDefaults(defineProps<{ data: any[] }>(), {});

const slots = useSlots();

function flatten(nodes: any[]): any[] {
  const out: any[] = [];
  for (const n of nodes) {
    if (!n || n.type === Comment || n.type === Text) continue;
    if (n.type === Fragment && Array.isArray(n.children)) out.push(...flatten(n.children));
    else out.push(n);
  }
  return out;
}

const columns = computed<ColumnDef[]>(() => {
  const nodes = flatten(slots.default?.() ?? []) as VNode[];

  return nodes
    .filter((n) => n.type === DataGridColumn)
    .map((n, idx) => {
      const p = (n.props ?? {}) as DataGridColumnProps;

      const cell =
        typeof (n.children as any)?.ctx === "function"
          ? ((n.children as any).ctx as CellSlot)
          : undefined;

      console.log(cell);

      const field = p.field != null ? String(p.field) : undefined;

      return {
        key: field ?? `col-${idx}`,
        field,
        title: p.title ?? field ?? "",
        width: p.width,
        cell,
      };
    });
});
</script>

<style scoped>
.datagrid {
  color: black;
  text-align: start;
}
.header {
  background-color: rgb(105, 105, 105);
  border: 1px solid black;
  font-weight: bold;
}
.row {
  display: flex;
  background-color: white;
}
.row:nth-child(even) {
  background-color: rgb(203, 203, 203);
}
.cell {
  flex: 1;
  padding: 0.25rem;
  border: 1px solid gray;
  box-sizing: border-box;
  overflow: hidden;
}
</style>
