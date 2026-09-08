<script setup lang="ts">
defineProps<{ projects: Record<string, any[]> }>()

function slug(name: string) {
  return name.toLowerCase().replace(/[\s\\/]+/g, '-')
}

const categorySpectralMap: Record<string, 'o' | 'b' | 'a' | 'f' | 'g' | 'k' | 'm'> = {
  'ML for Cosmology & Physics': 'b',
  'Software & Applications': 'o',
  'Hardware & Assembly': 'f',
  'Academic & Publications': 'k',
  'Web & Personal': 'm',
}
</script>

<template>
  <div class="prose m-auto max-w-5xl">
    <template
      v-for="key, cidx in Object.keys(projects)"
      :key="key"
    >
      <Section :id="slug(key)" :title="key" :first="cidx === 0" :spectral="categorySpectralMap[key] || 'b'">
        <div class="project-grid grid grid-cols-1 md:grid-cols-2 gap-5 mb-12">
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
              <Tag v-for="tag in item.tags" :key="tag" :spectral="categorySpectralMap[key] || 'b'">
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
