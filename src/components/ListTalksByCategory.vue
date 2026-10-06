<script setup lang="ts">
import { talkCategories } from '~/data/talks'

const categories = talkCategories.filter(c => c.talks.length)

// Dates are ISO calendar days, which parse as UTC midnight, so format in UTC
// to stop visitors west of Greenwich seeing the previous day
const dayMonthYear = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
const day = new Intl.DateTimeFormat('en-GB', { day: 'numeric', timeZone: 'UTC' })
const dayMonth = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' })

function getSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-')
}

function isFuture(date: string) {
  return +new Date(date) > +new Date()
}

function formatRange(start: string, end?: string, time?: string) {
  const s = new Date(start)
  if (!end || start === end)
    return time ? `${dayMonthYear.format(s)}, ${time}` : dayMonthYear.format(s)

  const e = new Date(end)
  if (s.getUTCFullYear() !== e.getUTCFullYear())
    return `${dayMonthYear.format(s)} – ${dayMonthYear.format(e)}`
  if (s.getUTCMonth() !== e.getUTCMonth())
    return `${dayMonth.format(s)} – ${dayMonthYear.format(e)}`
  return `${day.format(s)}–${dayMonthYear.format(e)}`
}
</script>

<template>
  <div class="prose m-auto">
    <Section
      v-for="category, catIdx in categories"
      :id="getSlug(category.name)"
      :key="category.name"
      :title="category.name"
      :first="catIdx === 0"
    >
      <div v-for="talk in category.talks" :key="talk.title" class="talk">
        <div v-for="p, presIdx in talk.presentations" :key="presIdx">
          <h3 :id="`${getSlug(category.name)}-${getSlug(talk.title)}${presIdx ? `-${presIdx}` : ''}`" class="talk-title">
            <template v-if="category.name !== 'Conferences and Fieldwork'">
              <a v-if="p.conferenceUrl" :href="p.conferenceUrl" target="_blank" rel="noopener noreferrer">{{ p.conference }}</a>
              <span v-else>{{ p.conference }}</span>:
              {{ talk.title }}
            </template>
            <template v-else>
              <a v-if="p.conferenceUrl" :href="p.conferenceUrl" target="_blank" rel="noopener noreferrer">{{ talk.title }}</a>
              <span v-else>{{ talk.title }}</span>
            </template>
            <Tag v-if="isFuture(p.date)" class="ml-2">
              Upcoming
            </Tag>
          </h3>

          <Meta :date="formatRange(p.date, p.endDate, p.time)" :venue="p.institution || p.location">
            <span v-if="p.room">{{ p.room }}</span>
          </Meta>

          <p v-if="talk.description" class="talk-description">
            {{ talk.description }}
          </p>

          <details v-if="p.abstract" class="talk-abstract">
            <summary>Abstract</summary>
            <p>{{ p.abstract }}</p>
          </details>

          <div v-if="p.pdf || p.recording || p.transcript" class="talk-links">
            <Link v-if="p.pdf" :href="p.pdf" external>
              Slides
            </Link>
            <Link v-if="p.recording" :href="p.recording" external>
              Recording
            </Link>
            <Link v-if="p.transcript" :href="p.transcript" external>
              Transcript
            </Link>
          </div>
        </div>
      </div>
    </Section>
  </div>
</template>

<style scoped>
.talk + .talk {
  margin-top: var(--s-8);
}

.prose .talk-title {
  margin: 0 0 var(--s-2);
  font-size: var(--t-lg);
  line-height: var(--lh-snug);
  opacity: 1;
}

.talk-description {
  margin: var(--s-3) 0 0;
  color: var(--fg-muted);
}

.talk-abstract {
  margin-top: var(--s-3);
}

.talk-abstract summary {
  cursor: pointer;
  width: fit-content;
  color: var(--fg-muted);
  font-size: var(--t-sm);
}

.talk-abstract summary:hover {
  color: var(--fg);
}

.talk-abstract p {
  margin: var(--s-3) 0 0;
  font-size: var(--t-sm);
  white-space: pre-line;
}

.talk-links {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s-5);
  margin-top: var(--s-3);
  font-size: var(--t-sm);
}
</style>
