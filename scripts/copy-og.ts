import fs from 'fs-extra'

// OG images are generated while pages are transformed, which can finish after
// Vite has already copied public/ into dist/, so copy them again once the build is done
async function run() {
  if (await fs.pathExists('public/og'))
    await fs.copy('public/og', 'dist/og', { overwrite: true })
}

run()
