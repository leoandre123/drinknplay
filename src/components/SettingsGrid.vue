<template>
  <div class="settings-grid">
    <template v-for="prop in properties">
      <label> {{ prop.title }}</label>
      <template v-if="prop.type == 'number'">
        <input type="number" v-model="internalValue[prop.name]" />
      </template>
      <template v-if="prop.type == 'color'">
        <input type="color" v-model="internalValue[prop.name]" />
      </template>
      <template v-if="prop.type == 'string'">
        <input type="text" v-model="internalValue[prop.name]" />
      </template>
      <template v-if="prop.type == 'boolean'">
        <input type="checkbox" v-model="internalValue[prop.name]" />
      </template>
      <template v-if="prop.type == 'object'">
        <SettingsGrid v-model="internalValue[prop.name]" />
      </template>
    </template>
  </div>
</template>

<script>
export default {
  name: "SettingsGrid",
  props: {
    modelValue: Object,
  },
  emits: ["update:modelValue"],
  data() {
    return {
      internalValue: this.modelValue,
    };
  },
  watch: {
    internalValue: {
      handler(val) {
        this.$emit("update:modelValue", val);
        console.log("CHANGE");
      },
      deep: true,
    },
    modelValue(val) {
      this.internalValue = val;
    },
  },
  computed: {
    properties() {
      if (!this.internalValue) return [];
      return Object.entries(this.internalValue).map((x) => {
        return {
          name: x[0],
          title: toReadableText(x[0]),
          value: x[1],
          type: getType(x[1]),
        };
      });
    },
  },
};

function toReadableText(text) {
  const result = text.replace(/([A-Z])/g, " $1");
  const finalResult = result.charAt(0).toUpperCase() + result.slice(1);
  return finalResult;
}

function getType(value) {
  const type = typeof value;

  if (type == "string") {
    if (value.startsWith("#")) {
      return "color";
    }
  }

  return type;
}
</script>

<style scoped>
.settings-grid {
  display: grid;
  grid-template-columns: 3fr 2fr;
  text-align: start;
}
.settings-grid * {
  min-width: 0;
}
</style>
