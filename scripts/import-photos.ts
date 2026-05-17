import crypto from 'node:crypto'
import { existsSync } from 'node:fs'
import fs from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import c from 'ansis'
import { encode as blurhashEncode } from 'blurhash'
import ExifReader from 'exifreader'
import decode from 'heic-decode'
import { basename, join, parse } from 'pathe'
import sharp from 'sharp'

const SOURCE_DIR = fileURLToPath(new URL('../unprocessed_photos', import.meta.url))
const TARGET_DIR = fileURLToPath(new URL('../photos', import.meta.url))
const MAX_SIZE = 1440

async function getPixelHash(buffer: Buffer) {
  try {
    const { data } = await sharp(buffer)
      .resize(100, 100, { fit: 'cover' })
      .grayscale()
      .raw()
      .toBuffer({ resolveWithObject: true })
    return crypto.createHash('md5').update(data).digest('hex')
  }
  catch {
    return null
  }
}

async function isAlreadyProcessed(hash: string) {
  if (!hash)
    return false
  const files = await fs.readdir(TARGET_DIR)
  const jsonFiles = files.filter(f => f.endsWith('.json'))

  for (const file of jsonFiles) {
    try {
      const content = JSON.parse(await fs.readFile(join(TARGET_DIR, file), 'utf-8'))
      if (content.hash === hash)
        return true
    }
    catch {
      // Ignore
    }
  }
  return false
}

async function getMetadata(buffer: Buffer) {
  try {
    const tags = ExifReader.load(buffer)
    const dateRaw = tags.DateTimeOriginal?.description || tags.DateTime?.description || tags.DateCreated?.description

    let location = ''
    if (tags.GPSLatitude && tags.GPSLongitude) {
      const lat = tags.GPSLatitude.description
      const lon = tags.GPSLongitude.description
      location = `${lat.toFixed(4)}, ${lon.toFixed(4)}`
    }

    return {
      date: dateRaw ? new Date(dateRaw.replace(/^(\d{4}):(\d{2}):(\d{2})/, '$1-$2-$3')) : null,
      location,
      make: tags.Make?.description,
      model: tags.Model?.description,
    }
  }
  catch {
    return { date: null, location: '', make: '', model: '' }
  }
}

async function processPhoto(filePath: string) {
  const { ext } = parse(filePath)
  const lowerExt = ext.toLowerCase()

  if (!['.jpg', '.jpeg', '.png', '.heic'].includes(lowerExt)) {
    console.log(c.yellow`[SKIP] Unsupported format: ${basename(filePath)}`)
    await fs.unlink(filePath)
    return
  }

  const originalBuffer = await fs.readFile(filePath)
  const hash = await getPixelHash(originalBuffer)

  if (await isAlreadyProcessed(hash)) {
    console.log(c.dim`[SKIP] Already processed (visual duplicate): ${basename(filePath)}`)
    await fs.unlink(filePath)
    return
  }

  console.log(c.blue`[PROC] ${basename(filePath)}`)

  let buffer = originalBuffer
  if (lowerExt === '.heic') {
    try {
      const { width, height, data } = await decode({ buffer })
      buffer = await sharp(data, { raw: { width, height, channels: 4 } }).jpeg().toBuffer()
    }
    catch {
      console.warn(c.red`[WARN] HEIC decode failed, trying sharp...`)
      try {
        buffer = await sharp(buffer).jpeg().toBuffer()
      }
      catch {
        console.error(c.red`[ERR] Could not process ${basename(filePath)}`)
        await fs.unlink(filePath)
        return
      }
    }
  }

  const meta = await getMetadata(originalBuffer)
  const image = sharp(buffer)
  const { width, height } = await image.metadata()
  if (!width || !height) {
    await fs.unlink(filePath)
    return
  }

  const squareSize = Math.min(Math.max(width, height), MAX_SIZE)
  const processedImage = sharp(buffer).resize(squareSize, squareSize, { fit: 'cover' })

  const date = meta.date || new Date()
  const dateStr = date.toISOString().split('T')[0]
  const baseName = `p-${dateStr}-${Math.random().toString(36).slice(2, 7)}`
  const targetPath = join(TARGET_DIR, `${baseName}.jpg`)

  await processedImage.jpeg({ quality: 85, mozjpeg: true }).toFile(targetPath)

  const { data: rawData, info } = await processedImage.raw().ensureAlpha().resize(32, 32).toBuffer({ resolveWithObject: true })
  const blurhash = blurhashEncode(new Uint8ClampedArray(rawData), info.width, info.height, 4, 4)

  const config = {
    hash,
    blurhash,
    date: date.toISOString(),
    location: meta.location,
    exif: { make: meta.make, model: meta.model },
  }

  await fs.writeFile(join(TARGET_DIR, `${baseName}.json`), JSON.stringify(config, null, 2))
  await fs.unlink(filePath)
  console.log(c.green`[DONE] ${basename(targetPath)}`)
}

async function run() {
  if (!existsSync(SOURCE_DIR))
    return
  const files = await fs.readdir(SOURCE_DIR)
  for (const file of files) {
    await processPhoto(join(SOURCE_DIR, file))
  }
  console.log(c.cyan`\nPipeline finished. Folder 'unprocessed_photos' is now empty.`)
}

run()
