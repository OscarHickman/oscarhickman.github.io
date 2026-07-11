import fg from 'fast-glob'
import fs from 'fs-extra'
import matter from 'gray-matter'

// oscarhickman.io is not registered/resolving yet - use the live GitHub Pages domain
const SITE = process.env.USE_CUSTOM_DOMAIN === '1' ? 'https://oscarhickman.io' : 'https://oscarhickman.github.io'

function toRoutePath(file: string) {
  const rel = file.replace(/^pages\//, '').replace(/\.md$/, '')
  if (rel === 'index')
    return ''
  return `/${rel.replace(/\/index$/, '')}`
}

async function run() {
  const files = await fg('pages/**/*.md')
  const urls: { loc: string, lastmod?: string }[] = []

  for (const file of files) {
    if (file.includes('[...404]'))
      continue
    const { data } = matter(await fs.readFile(file, 'utf-8'))
    if (data.draft)
      continue
    urls.push({
      loc: `${SITE}${toRoutePath(file)}`,
      lastmod: data.date,
    })
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>${u.lastmod ? `\n    <lastmod>${new Date(u.lastmod).toISOString().slice(0, 10)}</lastmod>` : ''}
  </url>`).join('\n')}
</urlset>
`

  await fs.writeFile('dist/sitemap.xml', xml, 'utf-8')
  console.log(`Generated dist/sitemap.xml with ${urls.length} URLs`)
}

run()
