<script setup lang="ts">
import { talkCategories } from '../../data/talks'
import { formatDate } from '../logics'

function getSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-')
}

function isFuture(date: string) {
  return +new Date(date) > +new Date()
}

function daysLeft(date: string) {
  const diff = +new Date(date) - +new Date()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}
</script>

<template>
  <div class="prose m-auto">
    <template v-for="category, catIdx in talkCategories" :key="category.name">
      <div :id="getSlug(category.name)" :class="catIdx > 0 ? 'mt-16' : ''">
        <h2 mb8>
          {{ category.name }}
        </h2>

        <div v-if="!category.talks.length" py8 text-center op50>
          <p>Coming soon...</p>
        </div>

        <template v-for="talk, talkIdx in category.talks" :key="talk.title">
          <div v-if="!talk.lang || talk.lang === 'en'" :class="talkIdx > 0 ? 'mt-12 pt-12 border-t border-hex-8882' : ''">
            <h3 :id="`${getSlug(category.name)}-${getSlug(talk.title)}`" tabindex="-1" mb4 :lang="talk.lang">
              {{ talk.title }}
            </h3>

            <div v-if="talk.description" op75 mb6 :lang="talk.lang">
              {{ talk.description }}
            </div>

            <template v-for="p, presIdx in talk.presentations" :key="presIdx">
              <template v-if="!p.lang || p.lang === 'en'">
                <div :lang="p.lang" mb8>
                  <!-- Conference & Time -->
                  <div flex="~ gap-2 items-baseline" mb2>
                    <span font-semibold text-lg>{{ p.conference }}</span>
                    <span v-if="p.time" text-sm op70>{{ p.time }}</span>
                  </div>

                  <!-- Date & Location -->
                  <div text-sm op70 space-y-1>
                    <div v-if="p.date">
                      {{ formatDate(p.date, true) }}
                    </div>
                    <div v-if="p.location">
                      {{ p.location }}
                    </div>
                    <div v-if="p.room" text-xs op50 mt2>
                      {{ p.room }}
                    </div>
                  </div>

                  <!-- Abstract -->
                  <div v-if="p.abstract" mt6 mb6 p5 bg-hex-8882 rounded-lg border="l-3 hex-888">
                    <div text-sm leading-relaxed whitespace-pre-wrap op90>
                      {{ p.abstract }}
                    </div>
                  </div>

                  <!-- Links -->
                  <div flex="~ gap-4 wrap" mt5>
                    <a
                      v-if="p.pdf"
                      :href="p.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      op60 hover:op100 transition-opacity duration-300
                      flex="~ gap-2 items-center"
                      text-sm font-500
                    >
                      <div i-ri-file-pdf-line class="text-lg" />
                      Slides
                    </a>
                    <a
                      v-if="p.recording"
                      :href="p.recording"
                      target="_blank"
                      rel="noopener noreferrer"
                      op60 hover:op100 transition-opacity duration-300
                      flex="~ gap-2 items-center"
                      text-sm font-500
                    >
                      <div i-ri-video-fill class="text-lg" />
                      Recording
                    </a>
                    <a
                      v-if="p.transcript"
                      :href="p.transcript"
                      target="_blank"
                      rel="noopener noreferrer"
                      op60 hover:op100 transition-opacity duration-300
                      flex="~ gap-2 items-center"
                      text-sm font-500
                    >
                      <div i-ri-file-text-line class="text-lg" />
                      Transcript
                    </a>
                  </div>

                  <div v-if="isFuture(p.date)" mt4 text-sm op70>
                    In {{ daysLeft(p.date) }} days
                  </div>
                </div>
              </template>
            </template>
          </div>
        </template>
      </div>
    </template>
  </div>
</template>
