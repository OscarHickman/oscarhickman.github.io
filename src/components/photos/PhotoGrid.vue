<script setup lang="ts">
import type { Photo } from '../../../photos/data'
import { blurhashToGradientCssObject } from '@unpic/placeholder'

defineProps<{
  photos: Photo[]
  view?: 'cover' | 'contain'
}>()

// Cameras with an unset clock report 2000-01-01, so treat that as unknown
const UNKNOWN_DATE = '2000-01-01'
// Parse and format the ISO day in UTC so it never shifts with the visitor's timezone
const dateFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })

function formatDate(name: string) {
  const match = name.match(/p-(\d{4}-\d{2}-\d{2})/)
  if (!match || match[1] === UNKNOWN_DATE)
    return ''
  return dateFormat.format(new Date(match[1]))
}
</script>

<template>
  <div class="photos grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-4" max-w-500 mx-auto>
    <div v-for="photo, idx in photos" :key="idx" class="photo-container relative overflow-hidden group">
      <img
        :src="photo.url"
        :alt="photo.text || photo.name"
        :data-photo-index="idx"
        :data-photo-total="photos.length"
        :data-date="formatDate(photo.name)"
        :data-caption="photo.text || ''"
        :data-exif="photo.exif ? [photo.exif.make, photo.exif.model].filter(Boolean).join(' ') : ''"
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
