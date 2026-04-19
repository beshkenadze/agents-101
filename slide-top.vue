<script setup lang="ts">
import { useSlideContext } from '@slidev/client'

const { $frontmatter } = useSlideContext()
</script>

<template>
  <div v-if="$frontmatter?.path" class="chrome-top">
    <div class="dots">
      <span class="dot" />
      <span class="dot" />
      <span class="dot" />
    </div>
    <span class="path"><span class="tilde">~</span>{{ $frontmatter.path }}</span>
    <div class="spacer" />
    <span v-if="$frontmatter.meta" class="meta">{{ $frontmatter.meta }}</span>
  </div>
</template>
