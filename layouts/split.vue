<template>
  <div class="slidev-layout split">
    <div class="split-header">
      <slot />
    </div>
    <div class="split-body">
      <div class="split-left">
        <slot name="left" />
      </div>
      <div class="split-right">
        <slot name="right" />
      </div>
    </div>
  </div>
</template>

<style>
.slidev-layout.split {
  display: flex;
  flex-direction: column;
}
.slidev-layout.split .split-header { flex: 0 0 auto; margin-bottom: 16px; }
.slidev-layout.split .split-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 56px;
  flex: 1;
}
.slidev-layout.split .split-body > div {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
</style>
