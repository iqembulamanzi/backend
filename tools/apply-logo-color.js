// tools/apply-logo-color.js
// Copies Downloads/WaterPolutionProject.png -> public/admin/assets/logo.png
// Samples average color using jimp, updates --sidebar-accent and .sidebar gradient in CSS

const fs = require('fs')
const path = require('path')
const os = require('os')

async function main() {
  const src = path.join(os.homedir(), 'Downloads', 'WaterPolutionProject.png')
  const dst = path.join(
    __dirname,
    '..',
    'public',
    'admin',
    'assets',
    'logo.png'
  )
  const cssPath = path.join(
    __dirname,
    '..',
    'public',
    'admin',
    'css',
    'dashboard.css'
  )

  if (!fs.existsSync(src)) {
    console.error('Source image not found:', src)
    process.exit(1)
  }

  fs.mkdirSync(path.dirname(dst), { recursive: true })
  fs.copyFileSync(src, dst)
  console.log('Copied image to', dst)

  const Jimp = require('jimp')
  try {
    const image = await Jimp.read(dst)
    image.resize(1, 1)
    const hexInt = image.getPixelColor(0, 0) & 0xffffff
    const hex = '#' + hexInt.toString(16).padStart(6, '0').toUpperCase()
    console.log('Detected color:', hex)

    function adjust(hex, factor) {
      const r = parseInt(hex.slice(1, 3), 16)
      const g = parseInt(hex.slice(3, 5), 16)
      const b = parseInt(hex.slice(5, 7), 16)
      const nr = Math.max(0, Math.min(255, Math.round(r * factor)))
      const ng = Math.max(0, Math.min(255, Math.round(g * factor)))
      const nb = Math.max(0, Math.min(255, Math.round(b * factor)))
      return (
        '#' +
        [nr, ng, nb]
          .map((x) => x.toString(16).padStart(2, '0'))
          .join('')
          .toUpperCase()
      )
    }

    const dark = adjust(hex, 0.8)
    const light = adjust(hex, 1.12)

    let content = fs.readFileSync(cssPath, 'utf8')

    if (content.match(/(--sidebar-accent:\s*)#[0-9A-Fa-f]{6}/)) {
      content = content.replace(
        /(--sidebar-accent:\s*)#[0-9A-Fa-f]{6}/,
        `$1${hex}`
      )
    } else {
      content = content.replace(
        /(:root\s*\{)/,
        `$1\n  --sidebar-accent: ${hex};`
      )
    }

    const lightRgb = `${parseInt(light.slice(1, 3), 16)}, ${parseInt(light.slice(3, 5), 16)}, ${parseInt(light.slice(5, 7), 16)}`
    const darkRgb = `${parseInt(dark.slice(1, 3), 16)}, ${parseInt(dark.slice(3, 5), 16)}, ${parseInt(dark.slice(5, 7), 16)}`
    const newGradient = `linear-gradient(180deg, rgba(${lightRgb}, 0.98), rgba(${darkRgb}, 0.98))`

    const sidebarRegex =
      /(\.sidebar\s*\{[\s\S]*?background:\s*)linear-gradient\([\s\S]*?\);/m
    if (sidebarRegex.test(content)) {
      content = content.replace(sidebarRegex, `$1${newGradient};`)
    } else {
      content += `\n/* auto-generated sidebar gradient */\n.sidebar { background: ${newGradient}; }\n`
    }

    fs.writeFileSync(cssPath, content, 'utf8')
    console.log('Updated CSS with', hex)
    console.log(
      'Done. Open http://localhost:5000/admin/ and hard-refresh (Ctrl+Shift+R).'
    )
  } catch (err) {
    console.error('Error processing image:', err.message || err)
    process.exit(1)
  }
}

main()
