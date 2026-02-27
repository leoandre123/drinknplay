<template>
  <div class="tabs">
    <div class="headers">
      <div
        class="header"
        :class="{ selected: selectedIndex == i }"
        v-for="(header, i) in headers"
        @click="selectedIndex = i"
      >
        {{ header.title }}
      </div>
    </div>
    <div class="content">
      <component v-for="(item, i) in items" v-show="i == selectedIndex" :is="item" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, ref, useSlots, type VNode } from "vue";

const slots = useSlots();
const selectedIndex = ref(0);

function isVNodeElement(v: VNode) {
  return v && typeof v.type !== "symbol"; // filters out Comment/Fragment-ish cases in practice
}

const items = computed(() => {
  const vnodes = slots.default?.() ?? [];
  // Flatten one level of fragments (common when using v-for / templates)
  const flat: VNode[] = [];
  for (const v of vnodes) {
    if ((v as any).type === Symbol.for("v-fgt") && Array.isArray((v as any).children)) {
      flat.push(...((v as any).children as VNode[]));
    } else {
      flat.push(v);
    }
  }

  // keep only element vnodes (components/elements), remove comments/text
  return flat.filter(isVNodeElement);
});

const headers = computed(() =>
  items.value.map((vnode) => {
    const props = (vnode.props ?? {}) as any;
    return {
      title: props.title as string,
      disabled: !!props.disabled,
    };
  }),
);
</script>
<style scoped>
.tabs {
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.headers {
  display: flex;
}
.header {
  filter: grayscale(80%);
  background: #61b4ff;
  font-size: 1rem;
  padding: 0.5rem 1rem;
}
.header.selected {
  filter: none;
}

.header:active:not([disabled]) {
  transform: translateY(2px);
}

.content {
  z-index: 1;

  border-top: 0.25rem solid #61b4ff;
  min-height: 0;
  flex: 1;
}
</style>
