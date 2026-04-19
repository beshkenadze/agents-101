<script setup lang="ts">
import { computed } from 'vue'
import { useNav, useSlideContext } from '@slidev/client'

const { $frontmatter, $page } = useSlideContext()
const { total } = useNav()

const pageStr = computed(() => String($page.value).padStart(2, '0'))
const totalStr = computed(() => String(total.value).padStart(2, '0'))
</script>

<template>
  <div v-if="$frontmatter?.path" class="chrome-bottom">
    <span><span class="status-dot" />{{ $frontmatter.status || 'aleksandr' }}</span>
    <span>{{ pageStr }} / {{ totalStr }}</span>
  </div>
</template>
