<script setup lang="ts">
const route = useRoute()

const imageModel = ref<HTMLImageElement>()
const imageAlt = ref<string>()

const imageIndex = ref<number | null>(null)
const imageTotal = ref<number | null>(null)
const imageExif = ref<string | null>(null)
const imageDate = ref<string | null>(null)

function setImageModel(img: HTMLImageElement) {
  imageModel.value = img
  imageAlt.value = img.dataset.caption || img.alt
  const figure = img.closest('figure')
  if (figure) {
    const caption = figure.querySelector('figcaption')
    if (caption?.textContent)
      imageAlt.value ||= caption.textContent
  }
  if (img.dataset.photoIndex != null) {
    imageIndex.value = Number.parseInt(img.dataset.photoIndex) + 1
    imageTotal.value = img.dataset.photoTotal ? Number.parseInt(img.dataset.photoTotal) : null
    imageExif.value = img.dataset.exif || null
    imageDate.value = img.dataset.date || null
  }
  else {
    imageIndex.value = null
    imageTotal.value = null
    imageExif.value = null
    imageDate.value = null
  }
}

function nextPhoto() {
  if (!imageModel.value || imageModel.value.dataset.photoIndex == null)
    return
  const index = Number.parseInt(imageModel.value.dataset.photoIndex)
  const nextImg = document.querySelector(`img[data-photo-index="${index + 1}"]`) as HTMLImageElement | null
  if (nextImg)
    setImageModel(nextImg)
}

function prevPhoto() {
  if (!imageModel.value || imageModel.value.dataset.photoIndex == null)
    return
  const index = Number.parseInt(imageModel.value.dataset.photoIndex)
  const prevImg = document.querySelector(`img[data-photo-index="${index - 1}"]`) as HTMLImageElement | null
  if (prevImg)
    setImageModel(prevImg)
}

useEventListener('click', async (e) => {
  const path = Array.from(e.composedPath())
  const first = path[0] as HTMLImageElement
  if (!(first instanceof HTMLElement))
    return
  if (first.tagName !== 'IMG')
    return
  if (first.classList.contains('no-preview'))
    return
  if (path.some(el => el instanceof HTMLElement && ['A', 'BUTTON'].includes(el.tagName)))
    return
  if (!path.some(el => el instanceof HTMLElement && (el.classList.contains('prose') || el.classList.contains('photos'))))
    return

  // Do not open image when they are moving. Mainly for mobile to avoid conflict with hovering behavior.
  const pos = first.getBoundingClientRect()
  await new Promise(resolve => setTimeout(resolve, 50))
  const newPos = first.getBoundingClientRect()
  if (pos.left !== newPos.left || pos.top !== newPos.top)
    return

  setImageModel(first)
})

onKeyStroke('ArrowRight', (e) => {
  if (imageModel.value && imageModel.value.dataset.photoIndex != null) {
    nextPhoto()
    e.preventDefault()
  }
})

onKeyStroke('ArrowLeft', (e) => {
  if (imageModel.value && imageModel.value.dataset.photoIndex != null) {
    prevPhoto()
    e.preventDefault()
  }
})

onKeyStroke('Escape', (e) => {
  if (imageModel.value) {
    imageModel.value = undefined
    e.preventDefault()
  }
})
</script>

<template>
  <NavBar />
  <main class="px-7 py-10 of-x-hidden">
    <RouterView />
    <Footer :key="route.path" />
  </main>
  <Transition name="fade">
    <div
      v-if="imageModel"
      class="fixed inset-0 z-500 backdrop-blur-md bg-black:80 flex flex-col justify-between p-4 sm:p-6 select-none"
      @click="imageModel = undefined"
    >
      <!-- Top chrome: counter & close button -->
      <div class="flex items-center justify-between z-10" @click.stop>
        <div v-if="imageIndex && imageTotal" class="font-mono text-xs tracking-widest text-white/70">
          {{ imageIndex }} / {{ imageTotal }}
        </div>
        <div v-else />
        <button
          type="button"
          class="text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition"
          title="Close (Esc)"
          @click="imageModel = undefined"
        >
          <div i-ri-close-line class="text-xl" />
        </button>
      </div>

      <!-- Main image with prev/next arrows -->
      <div class="relative flex-1 flex items-center justify-center min-h-0">
        <button
          v-if="imageIndex && imageIndex > 1"
          type="button"
          class="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition z-10"
          title="Previous photo (Left Arrow)"
          @click.stop="prevPhoto()"
        >
          <div i-ri-arrow-left-s-line class="text-3xl" />
        </button>

        <img
          :src="imageModel.src"
          :alt="imageModel.alt"
          class="max-w-full max-h-full object-contain cursor-default"
          @click.stop
        >

        <button
          v-if="imageIndex && imageTotal && imageIndex < imageTotal"
          type="button"
          class="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition z-10"
          title="Next photo (Right Arrow)"
          @click.stop="nextPhoto()"
        >
          <div i-ri-arrow-right-s-line class="text-3xl" />
        </button>
      </div>

      <!-- Bottom chrome: Caption, Date, and EXIF -->
      <div
        v-if="imageAlt || imageDate || imageExif"
        class="z-10 text-center max-w-xl mx-auto pt-3"
        @click.stop
      >
        <div v-if="imageAlt" class="text-white text-sm font-medium leading-snug">
          {{ imageAlt }}
        </div>
        <div class="flex items-center justify-center gap-3 mt-1 text-xs text-white/60 font-mono">
          <span v-if="imageDate">{{ imageDate }}</span>
          <span v-if="imageDate && imageExif">·</span>
          <span v-if="imageExif">{{ imageExif }}</span>
        </div>
      </div>
    </div>
  </Transition>
</template>
