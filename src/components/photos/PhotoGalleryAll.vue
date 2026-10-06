<script setup lang="ts">
import raw from '../../../photos/data'
import { galleryView } from '../../logics'

const props = defineProps<{
  limit?: number
}>()

const photos = computed(() => {
  if (props.limit)
    return raw.slice(0, props.limit)
  return raw
})

function toggleView() {
  galleryView.value = galleryView.value === 'cover' ? 'contain' : 'cover'
}
</script>

<template>
  <div class="flex justify-end max-w-500 mx-auto mb-2">
    <button
      type="button"
      title="Switch view"
      aria-label="Switch photo grid view"
      rounded-full p2 op40 hover="op100 bg-[var(--bg-raised)]"
      @click="toggleView"
    >
      <div :class="galleryView === 'cover' ? 'i-ri-grid-line' : 'i-ri-layout-masonry-line'" />
    </button>
  </div>
  <PhotoGrid :photos="photos" :view="galleryView" />
</template>
