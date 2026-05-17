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
  <template v-for="category, catIdx in talkCategories" :key="category.name">
    <div :id="getSlug(category.name)">
      <h2 mb6 mt8 :class="catIdx === 0 ? 'mt-0' : ''">
        {{ category.name }}
      </h2>

      <div v-if="!category.talks.length" op50>
        Coming soon...
      </div>

      <template v-for="talk, talkIdx in category.talks" :key="talk.title">
        <div v-if="!talk.lang || talk.lang === 'en'">
          <div v-if="talkIdx !== 0" pt4>
            <hr>
          </div>
          <h3 :id="`${getSlug(category.name)}-${getSlug(talk.title)}`" tabindex="-1" :lang="talk.lang">
            {{ talk.title }}
            <a class="header-anchor" :href="`#${getSlug(category.name)}-${getSlug(talk.title)}`" aria-hidden="true">#</a>
          </h3>
          <div v-if="talk.description" op75 pt2 pb4 :lang="talk.lang">
            {{ talk.description }}
          </div>

          <template v-for="p, presIdx in talk.presentations" :key="presIdx">
            <template v-if="!p.lang || p.lang === 'en'">
              <div :lang="p.lang" pb4>
                <div flex="~ gap-2 items-center" mb2>
                  <strong>{{ p.conference }}</strong>
                  <span v-if="p.time" text-sm op60>@ {{ p.time }}</span>
                </div>
                <div text-sm op70>
                  <div v-if="p.date">
                    {{ formatDate(p.date, true) }}
                  </div>
                  <div v-if="p.room" text-xs op60 mt1>
                    {{ p.room }}
                  </div>
                </div>

                <!-- Abstract -->
                <div v-if="p.abstract" mt4 mb4 p4 bg-hex-8884 rounded border="l-2 hex-888">
                  <div text-sm whitespace-pre-wrap>
                    {{ p.abstract }}
                  </div>
                </div>

                <!-- Links -->
                <div flex="~ gap-3 wrap items-center" mt3>
                  <a v-if="p.pdf" :href="p.pdf" target="_blank" rel="noopener noreferrer" op50 hover:op100 transition-opacity duration-300 flex="~ gap-1 items-center" text-sm>
                    <div i-ri-file-pdf-line />
                    Slides (PDF)
                  </a>
                  <a v-if="p.recording" :href="p.recording" target="_blank" rel="noopener noreferrer" op50 hover:op100 transition-opacity duration-300 flex="~ gap-1 items-center" text-sm>
                    <div i-ri-video-fill />
                    Recording
                  </a>
                  <a v-if="p.transcript" :href="p.transcript" target="_blank" rel="noopener noreferrer" op50 hover:op100 transition-opacity duration-300 flex="~ gap-1 items-center" text-sm>
                    <div i-ri-file-text-line />
                    Transcript
                  </a>
                  <span
                    v-if="isFuture(p.date)"
                    op50 text-sm
                  >
                    📅 in {{ daysLeft(p.date) }} days
                  </span>
                </div>
              </div>
              <div v-if="presIdx < talk.presentations.length - 1" h-px bg-hex-888 op20 my4 />
            </template>
          </template>
        </div>
      </template>
    </div>
  </template>
</template>
