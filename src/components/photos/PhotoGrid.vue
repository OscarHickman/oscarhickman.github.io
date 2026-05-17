<script setup lang="ts">
import type { Photo } from '../../../photos/data'
import { blurhashToGradientCssObject } from '@unpic/placeholder'

defineProps<{
  photos: Photo[]
  view?: 'cover' | 'contain'
}>()

function formatDate(name: string) {
  const match = name.match(/p-(\d{4})-(\d{2})-(\d{2})/)
  if (match)
    return `${match[1]}-${match[2]}-${match[3]}`
  return ''
}
</script>

<template>
  <div class="photos grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" max-w-500 mx-auto>
    <div v-for="photo, idx in photos" :key="idx" class="photo-container relative overflow-hidden group">
      <img
        :src="photo.url"
        :alt="photo.text"
        :data-photo-index="idx"
        :style="photo.blurhash && view !== 'contain' ? blurhashToGradientCssObject(photo.blurhash) as any : ''"
        loading="lazy"
        w-full
        :class="view === 'contain' ? 'object-contain sm:aspect-square' : 'object-cover aspect-square'"
      >
      <div class="absolute inset-0 bg-black bg-opacity-60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center p-4 text-center text-white">
        <div v-if="formatDate(photo.name)" class="text-sm mb-2">
          {{ formatDate(photo.name) }}
        </div>
        <div v-if="photo.text" class="text-sm leading-relaxed">
          {{ photo.text }}
        </div>
      </div>
    </div>
  </div>
</template>
