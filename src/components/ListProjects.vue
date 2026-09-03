<script setup lang="ts">
defineProps<{ projects: Record<string, any[]> }>()

function slug(name: string) {
  return name.toLowerCase().replace(/[\s\\/]+/g, '-')
}
</script>

<template>
  <div class="prose m-auto max-w-4xl">
    <template
      v-for="key, cidx in Object.keys(projects)"
      :key="key"
    >
      <div :id="slug(key)" :class="cidx > 0 ? 'mt-16' : 'mt-0'">
        <h2 mb8 pb2 border-b border-base inline-block class="category-heading">
          {{ key }}
        </h2>

        <div class="project-grid" grid="~ cols-1 sm:cols-2 lg:cols-3 gap-5" mb12>
          <a
            v-for="item, idx in projects[key]"
            :key="idx"
            :href="item.link"
            target="_blank"
            rel="noopener noreferrer"
            :title="item.name"
            class="project-card"
          >
            <div class="project-title font-semibold leading-tight mb2">
              {{ item.name }}
            </div>
            <div class="project-desc text-sm op70 leading-relaxed">
              {{ item.desc }}
            </div>
            <div v-if="item.tags" class="project-tags mt3 flex flex-wrap gap-1">
              <span v-for="tag in item.tags" :key="tag" class="tag">
                {{ tag }}
              </span>
            </div>
          </a>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.project-card {
  display: flex;
  flex-direction: column;
  padding: 1.35rem;
  border-radius: 8px;
  border: 1px solid var(--c-border);
  background: color-mix(in srgb, var(--c-bg) 75%, transparent);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  text-decoration: none;
  color: inherit;
}

.project-card:hover {
  border-color: var(--c-accent);
  box-shadow:
    0 4px 20px var(--c-accent-glow),
    0 0 0 1px var(--c-accent);
  transform: translateY(-2px);
}

.project-title {
  color: inherit;
  font-family:
    'Space Grotesk',
    -apple-system,
    BlinkMacSystemFont,
    sans-serif;
  letter-spacing: -0.01em;
}

.project-tags {
  margin-top: auto;
}

.category-heading {
  font-family:
    'Space Grotesk',
    -apple-system,
    BlinkMacSystemFont,
    sans-serif;
  letter-spacing: -0.015em;
  font-weight: 600;
}

.tag {
  display: inline-block;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  background: color-mix(in srgb, var(--c-accent) 12%, transparent);
  color: var(--c-accent);
  border: 1px solid color-mix(in srgb, var(--c-accent) 25%, transparent);
  font-size: 0.72rem;
  font-family: 'DM Mono', monospace;
  font-weight: 500;
  letter-spacing: 0.02em;
}
</style>
