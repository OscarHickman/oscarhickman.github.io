<script setup lang="ts">
const spectralClasses = [
  { key: 'o', name: 'O - Hot Blue', var: 'var(--spec-o)' },
  { key: 'b', name: 'B - Blue', var: 'var(--spec-b)' },
  { key: 'a', name: 'A - White', var: 'var(--spec-a)' },
  { key: 'f', name: 'F - Yellow White', var: 'var(--spec-f)' },
  { key: 'g', name: 'G - Solar Yellow', var: 'var(--spec-g)' },
  { key: 'k', name: 'K - Warm Orange', var: 'var(--spec-k)' },
  { key: 'm', name: 'M - Red Giant', var: 'var(--spec-m)' },
]

const typeScale = [
  { token: '--t-4xl', label: 't-4xl (36px)', style: { fontSize: 'var(--t-4xl)', letterSpacing: 'var(--ls-tight)', lineHeight: 'var(--lh-tight)' } },
  { token: '--t-3xl', label: 't-3xl (30px)', style: { fontSize: 'var(--t-3xl)', letterSpacing: 'var(--ls-tight)', lineHeight: 'var(--lh-tight)' } },
  { token: '--t-2xl', label: 't-2xl (24px)', style: { fontSize: 'var(--t-2xl)', letterSpacing: 'var(--ls-snug)', lineHeight: 'var(--lh-snug)' } },
  { token: '--t-xl', label: 't-xl (20px)', style: { fontSize: 'var(--t-xl)', letterSpacing: 'var(--ls-snug)', lineHeight: 'var(--lh-normal)' } },
  { token: '--t-lg', label: 't-lg (18px)', style: { fontSize: 'var(--t-lg)', letterSpacing: 'var(--ls-normal)', lineHeight: 'var(--lh-normal)' } },
  { token: '--t-base', label: 't-base (16px)', style: { fontSize: 'var(--t-base)', letterSpacing: 'var(--ls-normal)', lineHeight: 'var(--lh-relaxed)' } },
  { token: '--t-sm', label: 't-sm (14px)', style: { fontSize: 'var(--t-sm)', letterSpacing: 'var(--ls-wide)', lineHeight: 'var(--lh-normal)' } },
  { token: '--t-xs', label: 't-xs (12px)', style: { fontSize: 'var(--t-xs)', letterSpacing: 'var(--ls-wide)', lineHeight: 'var(--lh-normal)' } },
]
</script>

<template>
  <div class="prose m-auto max-w-4xl py-8">
    <div class="mb-10">
      <div class="font-mono text-xs text-[var(--accent)] uppercase tracking-widest mb-2">
        Dev Specification
      </div>
      <h1 class="text-4xl font-semibold mb-3">
        Styleguide &amp; Token Reference
      </h1>
      <p class="text-[var(--fg-muted)]">
        Living inventory of all tokens, typography steps, and UI primitives for regression prevention.
      </p>
    </div>

    <!-- Spectral Ramp -->
    <Section title="Stellar Spectral Ramp" :first="true" spectral="b">
      <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mt-4">
        <div
          v-for="c in spectralClasses"
          :key="c.key"
          class="p-3 rounded-lg border border-[var(--border)] text-center flex flex-col items-center"
        >
          <div
            class="w-10 h-10 rounded-full mb-2 border border-black/10"
            :style="{ background: c.var }"
          />
          <div class="font-mono text-xs font-semibold">
            {{ c.key.toUpperCase() }}
          </div>
          <div class="text-xs text-[var(--fg-muted)] mt-1">
            {{ c.name }}
          </div>
        </div>
      </div>
    </Section>

    <!-- Typography Scale -->
    <Section title="Type Scale &amp; Tracking" spectral="o">
      <div class="space-y-6 mt-4">
        <div
          v-for="t in typeScale"
          :key="t.token"
          class="border-b border-[var(--border)] pb-4 last:border-none"
        >
          <div class="font-mono text-xs text-[var(--fg-muted)] mb-1">
            {{ t.token }} · {{ t.label }}
          </div>
          <div class="font-heading" :style="t.style">
            Gravitational Lensing &amp; Cosmic Shear
          </div>
        </div>
      </div>
    </Section>

    <!-- UI Primitives -->
    <Section title="Component Primitives" spectral="k">
      <div class="space-y-6 mt-4">
        <div>
          <h3 class="text-sm font-mono text-[var(--fg-muted)] mb-3">
            Tag.vue (Spectral Variants)
          </h3>
          <div class="flex flex-wrap gap-2">
            <Tag spectral="o">
              Class O
            </Tag>
            <Tag spectral="b">
              Class B
            </Tag>
            <Tag spectral="a">
              Class A
            </Tag>
            <Tag spectral="f">
              Class F
            </Tag>
            <Tag spectral="g">
              Class G
            </Tag>
            <Tag spectral="k">
              Class K
            </Tag>
            <Tag spectral="m">
              Class M
            </Tag>
          </div>
        </div>

        <div>
          <h3 class="text-sm font-mono text-[var(--fg-muted)] mb-3">
            Link.vue &amp; Meta.vue
          </h3>
          <div class="flex flex-wrap items-center gap-4">
            <Link href="https://arxiv.org" external>
              arXiv Preprint
            </Link>
            <Link href="/projects">
              Internal Route
            </Link>
            <Meta date="2026-05-08" venue="Durham University, UK" />
          </div>
        </div>

        <div>
          <h3 class="text-sm font-mono text-[var(--fg-muted)] mb-3">
            Card.vue
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card href="https://github.com/OscarHickman/SaUCE" title="SaUCE">
              <div class="font-semibold mb-2">
                SaUCE Library
              </div>
              <div class="text-sm text-[var(--fg-muted)] mb-3">
                High-performance galaxy clustering and correlation function estimation from sparse merger trees.
              </div>
              <div class="flex gap-1.5 mt-auto">
                <Tag spectral="b">
                  Rust
                </Tag>
                <Tag spectral="b">
                  Python
                </Tag>
              </div>
            </Card>

            <Card href="https://github.com/OscarHickman/ANVIL" title="ANVIL">
              <div class="font-semibold mb-2">
                ANVIL Framework
              </div>
              <div class="text-sm text-[var(--fg-muted)] mb-3">
                Simulation-based inference diagnostic suites for neural posterior validation.
              </div>
              <div class="flex gap-1.5 mt-auto">
                <Tag spectral="o">
                  PyTorch
                </Tag>
                <Tag spectral="o">
                  SBI
                </Tag>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Section>
  </div>
</template>
