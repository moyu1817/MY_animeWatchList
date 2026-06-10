import sharp from 'sharp'
import { readFileSync, mkdirSync } from 'fs'

mkdirSync('./public/icons', { recursive: true })
const svg = readFileSync('./public/favicon.svg')

await sharp(Buffer.from(svg)).resize(192, 192).png().toFile('./public/icons/icon-192.png')
console.log('icon-192.png created')

await sharp(Buffer.from(svg)).resize(512, 512).png().toFile('./public/icons/icon-512.png')
console.log('icon-512.png created')
