<template>
<p>{{question.q}}</p>
<div class="ordered-grid">
<div v-for="(a, k) in question.a" 
     v-bind:class="['answer', {wiggle: currentlyMoving===a}]"
     draggable="true" 
     v-on:mousedown="prepareDrag(a)"
     v-on:dragstart="startDrag($event)"
     v-on:dragenter="updatePosition($event, k)"
     v-on:dragend="drop"
     v-bind:key="a.text"
     v-bind:ref="a.text">
  {{ a.text }}
</div>
</div>
</template>
<script>
export default {
  name: 'ReorderQuestion',
  data: function () {
    return {
      question: {
        q: "Reorder these animals according to height (smallest first)",
        a:[
            {
              order: 3,
              text: 'Cat',
            },
            {
              order: 1,
              text: 'Mouse',
            },
            {
              order: 2,
              text: 'Giraffe',
            },
            {
              order: 4,
              text: 'Tyrannosaurus Rex',
            },
            {
              order: 5,
              text: 'Tyrannosaurus Lexus',
            }
        ]
      },
      currentlyMoving: null,
    }
  },
  watch: {
    question: {
      immediate: true,
      deep: true,
      handler: function () {
        return this.question.a.sort((a,b) => a.order-b.order)
      }
    }
  },
  methods: {
    updatePosition: function(e, d) {
      if (this.currentlyMoving != d) {
        for (let a of this.question.a) {
          if (e.target === this.$refs[a.text]) {
            let tempOrder = a.order;
            a.order = this.currentlyMoving.order
            this.currentlyMoving.order = tempOrder
            break;
          }
        }
      }
    },
    drop: function() {
      this.currentlyMoving = null;
    },
    prepareDrag: function (a) {
      this.currentlyMoving = a;
    },
    startDrag: function (e) {
      e.dataTransfer.setDragImage(new Image(), 0, 0);
    }
  }
}
</script>
<style scoped>
.ordered-grid {
  display: grid;
  width:30em;
  margin:auto;
}
.answer {
  padding: 1em;
  border:1px solid black;
  user-drag: none;
}
.wiggle {
  animation: wiggle 0.1s ease-in-out;
    animation-iteration-count:infinite;
    background-color: pink;
}

@keyframes wiggle {
  0% {transform:rotate(0.5deg);}
  50% {transform:rotate(-0.5deg);}
  100% {transform:rotate(0.5deg);}
}
</style>