import { exec } from 'node:child_process'
import fs from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import c from 'ansis'
import { join } from 'pathe'
import prompts from 'prompts'

const TARGET_DIR = fileURLToPath(new URL('../photos', import.meta.url))

async function openFile(path: string) {
  const command = process.platform === 'win32' ? 'start' : process.platform === 'darwin' ? 'open' : 'xdg-open'
  return new Promise((resolve) => {
    exec(`${command} "${path}"`, () => {
      resolve(true)
    })
  })
}

async function run() {
  const files = await fs.readdir(TARGET_DIR)
  const jsonFiles = files.filter(f => f.endsWith('.json'))

  const withoutCaptions = []

  for (const file of jsonFiles) {
    const content = JSON.parse(await fs.readFile(join(TARGET_DIR, file), 'utf-8'))
    if (!content.text) {
      withoutCaptions.push({ file, content })
    }
  }

  if (withoutCaptions.length === 0) {
    console.log(c.green`All photos already have captions!`)
    return
  }

  console.log(c.blue`Found ${withoutCaptions.length} photos without captions.\n`)

  for (const item of withoutCaptions) {
    const imagePath = join(TARGET_DIR, item.file.replace('.json', '.jpg'))
    console.log(c.yellow`Opening: ${item.file.replace('.json', '.jpg')} (Date: ${item.content.date.split('T')[0]})`)

    await openFile(imagePath)

    const response = await prompts({
      type: 'text',
      name: 'caption',
      message: 'Enter caption (or press enter to skip):',
    })

    if (response.caption) {
      item.content.text = response.caption
      await fs.writeFile(join(TARGET_DIR, item.file), JSON.stringify(item.content, null, 2))
      console.log(c.green`Saved!\n`)
    }
    else {
      console.log(c.dim`Skipped.\n`)
    }
  }

  console.log(c.cyan`Done!`)
}

run()
