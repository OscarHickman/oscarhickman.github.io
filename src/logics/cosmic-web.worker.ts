import type { CosmicWebRequest } from './cosmic-web'
import { buildCosmicWeb } from './cosmic-web'

// Generating the 3D field takes a few hundred milliseconds, so it runs here
// instead of blocking scrolling and input on the main thread
globalThis.onmessage = (event: MessageEvent<CosmicWebRequest>) => {
  const web = buildCosmicWeb(event.data)
  globalThis.postMessage(web, { transfer: [web.positions.buffer, web.displacements.buffer, web.invariants.buffer] })
}
