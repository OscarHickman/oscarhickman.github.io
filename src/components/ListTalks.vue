<script setup lang="ts">
import { talks } from '../../data/talks'
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
  <template v-for="talk, idx of talks" :key="idx">
    <div v-if="!talk.lang || talk.lang === 'en'">
      <div v-if="idx !== 0" pt4>
        <hr>
      </div>
      <h2 :id="getSlug(talk.title)" tabindex="-1" important-mb-0 :lang="talk.lang">
        <span v-if="talk.series" text-lg font-400 op45 italic mb1>
          {{ talk.series }}
          <br>
        </span>
        {{ talk.title }}
        <span
          v-if="talk.lang === 'ja'"
          align-top flex-none ml2
          class="text-xs bg-zinc:15 text-zinc5 rounded px-1 py-0.5 my-auto"
        >日本語</span>
        <span
          v-if="talk.lang === 'zh'"
          align-top flex-none
          class="text-xs bg-zinc:15 text-zinc5 rounded px-1 py-0.5 my-auto"
        >中文</span>
        <a class="header-anchor" :href="`#${getSlug(talk.title)}`" aria-hidden="true">#</a>
      </h2>
      <div v-if="talk.description" op75 pt2 :lang="talk.lang">
        {{ talk.description }}
      </div>
      <div grid="~ cols-1 md:cols-[1fr_max-content] gap-4" pt6>
        <template v-for="p, idx2 in talk.presentations" :key="idx2">
          <template v-if=" !p.lang || p.lang === 'en'">
            <div :lang="p.lang">
              <a :href="p.conferenceUrl" target="_blank" rel="noopener noreferrer">
                {{ p.conference }}
              </a>
              <span
                v-if="p.lang === 'zh'"
                align-top flex-none ml2
                class="text-xs bg-zinc:15 text-zinc5 rounded px-1 py-0.5 my-auto"
              >中文</span>
              <span
                v-if="p.lang === 'ja'"
                align-top flex-none ml2
                class="text-xs bg-zinc:15 text-zinc5 rounded px-1 py-0.5 my-auto"
              >日本語</span>
              <div text-sm op50>
                {{ formatDate(p.date, false) }} · {{ p.location }}
              </div>
            </div>
            <div flex="~ gap-3 justify-end items-center">
              <Link v-if="p.recording" :href="p.recording" external>
                <div i-ri-play-large-line class="mr-1" />
                Watch
              </Link>
              <Link v-if="p.transcript" :href="p.transcript" external>
                <div i-ri-file-list-3-line class="mr-1" />
                Transcript
              </Link>
              <Link v-if="p.spa" :href="p.spa" external>
                <div i-ri-presentation-fill class="mr-1" />
                Slides
              </Link>
              <Link v-if="p.pdf" :href="p.pdf" external>
                <div i-ri-download-2-line class="mr-1" />
                PDF
              </Link>
              <Link
                v-if="isFuture(p.date)"
                :href="p.conferenceUrl"
                external
              >
                <Tag spectral="k">
                  in {{ daysLeft(p.date) }} days
                </Tag>
              </Link>
            </div>
          </template>
        </template>
      </div>
    </div>
  </template>
</template>
