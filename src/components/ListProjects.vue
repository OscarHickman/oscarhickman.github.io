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
        <h2 mb8>
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
  padding: 1.25rem;
  border-radius: 8px;
  border: 1px solid #8882;
  transition: all 0.3s ease;
  text-decoration: none;
  color: inherit;
  background: transparent;
}

.project-card:hover {
  border-color: #888;
  background: #8881;
  transform: translateY(-2px);
}

.project-title {
  color: inherit;
}

.project-tags {
  margin-top: auto;
}

.tag {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 3px;
  background: #8881;
  font-size: 0.75rem;
  opacity: 0.6;
  font-weight: 500;
}
</style>
