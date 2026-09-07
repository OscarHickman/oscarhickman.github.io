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
      <Section :id="slug(key)" :title="key" :first="cidx === 0">
        <div class="project-grid" grid="~ cols-1 sm:cols-2 lg:cols-3 gap-5" mb12>
          <Card
            v-for="item, idx in projects[key]"
            :key="idx"
            :href="item.link"
            :title="item.name"
          >
            <div class="project-title font-semibold leading-tight mb2">
              {{ item.name }}
            </div>
            <div class="project-desc text-sm op70 leading-relaxed">
              {{ item.desc }}
            </div>
            <div v-if="item.tags" class="project-tags mt-auto pt-3 flex flex-wrap gap-1">
              <Tag v-for="tag in item.tags" :key="tag" spectral="b">
                {{ tag }}
              </Tag>
            </div>
          </Card>
        </div>
      </Section>
    </template>
  </div>
</template>

<style scoped>
.project-title {
  color: inherit;
  font-family: var(--font-display);
  letter-spacing: -0.01em;
}
</style>
