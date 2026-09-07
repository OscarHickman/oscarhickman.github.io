<script setup lang="ts">
import { talkCategories } from '~/data/talks'
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

function formatRange(start: string, end?: string) {
  if (!end || start === end)
    return formatDate(start, true)

  const s = new Date(start)
  const e = new Date(end)

  const formatter = new Intl.DateTimeFormat('en-GB', { day: 'numeric' })
  const monthFormatter = new Intl.DateTimeFormat('en-GB', { month: 'short' })
  const yearFormatter = new Intl.DateTimeFormat('en-GB', { year: 'numeric' })

  if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
    return `${formatter.format(s)} – ${formatter.format(e)} ${monthFormatter.format(s)} ${yearFormatter.format(s)}`
  }
  else if (s.getFullYear() === e.getFullYear()) {
    return `${formatter.format(s)} ${monthFormatter.format(s)} – ${formatter.format(e)} ${monthFormatter.format(e)} ${yearFormatter.format(s)}`
  }

  return `${formatDate(start, true)} – ${formatDate(end, true)}`
}
</script>

<template>
  <div class="prose m-auto">
    <template v-for="category, catIdx in talkCategories" :key="category.name">
      <div :id="getSlug(category.name)" :class="catIdx > 0 ? 'mt-16' : ''">
        <h2 mb8 pb2 border-b border-base inline-block text-xl class="category-heading">
          {{ category.name }}
        </h2>

        <div v-if="!category.talks.length" py8 text-center op50>
          <p class="font-mono text-sm tracking-wide">
            Coming soon...
          </p>
        </div>

        <template v-for="talk, talkIdx in category.talks" :key="talk.title">
          <div v-if="!talk.lang || talk.lang === 'en'" :class="talkIdx > 0 ? 'mt-12 pt-12 border-t talk-divider' : ''">
            <template v-for="p, presIdx in talk.presentations" :key="presIdx">
              <template v-if="!p.lang || p.lang === 'en'">
                <div :lang="p.lang" mb8>
                  <!-- Combined Title: Conference + Talk Title (Normal Sections) -->
                  <h3 v-if="category.name !== 'Conferences and Fieldwork'" :id="`${getSlug(category.name)}-${getSlug(talk.title)}`" tabindex="-1" mb2 :lang="talk.lang" text-xl>
                    <a v-if="p.conferenceUrl" :href="p.conferenceUrl" target="_blank" rel="noopener noreferrer" hover:underline>
                      <span font-semibold>{{ p.conference }}:</span>
                    </a>
                    <span v-else font-semibold>{{ p.conference }}:</span>
                    <span ml2 op80 font-normal>{{ talk.title }}</span>
                    <span v-if="isFuture(p.date)" class="badge-upcoming ml2">Upcoming</span>
                  </h3>

                  <!-- Single Title (Fieldwork Section) -->
                  <h3 v-else :id="`${getSlug(category.name)}-${getSlug(talk.title)}`" tabindex="-1" mb2 :lang="talk.lang" text-xl font-semibold>
                    {{ talk.title }}
                    <span v-if="isFuture(p.date)" class="badge-upcoming ml2">Upcoming</span>
                  </h3>

                  <!-- Date, Time, Institution & Location -->
                  <div text-sm op70 space-y-1 mb6>
                    <div flex="~ gap-2 items-baseline" font-mono text-xs>
                      <span v-if="p.date" class="talk-date">{{ formatRange(p.date, p.endDate) }}</span>
                      <span v-if="p.time" text-xs op70>at {{ p.time }}</span>
                    </div>
                    <div v-if="p.institution" font-semibold>
                      {{ p.institution }}
                    </div>
                    <div v-if="p.location">
                      {{ p.location }}
                    </div>
                    <div v-if="p.room" text-xs op50 mt2>
                      {{ p.room }}
                    </div>
                  </div>

                  <div v-if="talk.description" op75 mb6 :lang="talk.lang">
                    {{ talk.description }}
                  </div>

                  <!-- Abstract -->
                  <div v-if="p.abstract" class="talk-abstract mt6 mb6 p5 rounded-lg">
                    <div text-sm leading-relaxed whitespace-pre-wrap op90 font-sans>
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

<style scoped>
.category-heading {
  font-family: var(--font-display);
  letter-spacing: -0.015em;
}

.talk-divider {
  border-top-color: var(--c-border);
}

.badge-upcoming {
  padding: calc(var(--s-1) / 2) var(--s-2);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background-color: var(--c-accent-glow);
  color: var(--c-accent);
  border: 1px solid var(--c-border);
  border-radius: var(--r-sm);
}

.talk-date {
  color: var(--c-accent-warm);
}

.talk-abstract {
  background-color: color-mix(in srgb, var(--c-bg) 85%, white);
  border: 1px solid var(--c-border);
  border-left: 3px solid var(--c-accent);
}

html.dark .talk-abstract {
  background-color: color-mix(in srgb, var(--c-bg) 80%, transparent);
}
</style>
