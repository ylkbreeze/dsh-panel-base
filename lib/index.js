// 面板基座 · 宿主半边
//
// 这个插件不带任何业务。它只做四件事：
//   1. 把 profile（名字/性别/生日）读出来给面板
//   2. 把 modules 目录里的 JSON 收集起来，当成「功能块」
//   3. 存取面板自己的设置（样式/大小/打开方式/语言）
//   4. 给面板留一个只读数据口
//
// 想加功能的人不用改这个插件的源码——丢一个 JSON 进 modules 目录就行。

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { homedir } from 'node:os'
import { fileURLToPath } from 'node:url'

const 包根 = dirname(dirname(fileURLToPath(import.meta.url)))

function 读json(path, fallback = null) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'))
  } catch {
    return fallback
  }
}

const 默认设置 = {
  皮肤: 'default', // default | tech | soft | glass
  主题: 'follow', // follow | dark | light（宿主深浅，跟皮肤是两回事）
  大小: 'medium', // small | medium | large
  打开方式: 'panel', // panel | float
  语言: 'zh', // zh | en
  背景: '', // 自定义背景图地址，留空就没有
}

export const inject = ['webServer']

// 可选的插件管理器。有它，「开关」才能真启停一个插件；没有就只能读状态。
const 插件管理器 = (ctx) => (typeof ctx.get === 'function' ? ctx.get('pluginManager') : undefined)

function 读体(req) {
  return new Promise((resolve) => {
    let s = ''
    req.on('data', (c) => {
      s += c
      if (s.length > 65536) req.destroy()
    })
    req.on('end', () => {
      try {
        resolve(JSON.parse(s || '{}'))
      } catch {
        resolve({})
      }
    })
  })
}

export function apply(ctx, config = {}) {
  const profile = {
    name: config?.profile?.name || '面板',
    gender: config?.profile?.gender || '',
    birthday: config?.profile?.birthday || '',
  }

  // 用户的扩展目录：跟插件包分开，升级不丢
  const 用户目录 = join(homedir(), '.dsh', 'panel-base')
  const 用户模块 = join(用户目录, 'modules')
  const 设置路径 = join(用户目录, 'settings.json')
  try {
    mkdirSync(用户模块, { recursive: true })
  } catch {
    /* 建不出来也能跑，只是加不了自定义模块 */
  }

  function 读模块() {
    const 目录们 = [join(包根, 'modules'), 用户模块]
    const 出 = []
    const 见过 = new Set()
    for (const dir of 目录们) {
      let 名们 = []
      try {
        名们 = readdirSync(dir)
      } catch {
        continue
      }
      for (const 名 of 名们.sort()) {
        if (!名.endsWith('.json')) continue
        const 定义 = 读json(join(dir, 名))
        if (!定义 || !定义.id || 见过.has(定义.id)) continue
        见过.add(定义.id)
        出.push({ ...定义, 来源: dir === 目录们[0] ? '内置' : '本地' })
      }
    }
    return 出.sort((a, b) => (Number(a.序号) || 100) - (Number(b.序号) || 100))
  }

  function 读设置() {
    return { ...默认设置, ...(读json(设置路径, {}) || {}) }
  }

  function 存设置(patch) {
    const 新 = { ...读设置(), ...patch }
    try {
      writeFileSync(设置路径, JSON.stringify(新, null, 2), 'utf8')
    } catch {
      /* 写不进去就只在内存里生效 */
    }
    return 新
  }

  // 模块里写了 "插件": "包名" 的，顺手把那个插件启没启用查出来
  async function 读模块带状态() {
    const 定义们 = 读模块()
    const pm = 插件管理器(ctx)
    if (!pm) return 定义们
    let 表 = {}
    try {
      const list = await pm.listBundles()
      for (const b of list) 表[b.name] = Boolean(b.enabled)
    } catch {
      return 定义们
    }
    return 定义们.map((m) => {
      if (!m.插件) return m
      // 插件名可能带前缀也可能不带，两边都试一次
      const 名 = String(m.插件)
      const 简名 = 名.startsWith('dsh-') ? 名.slice(4) : 'dsh-' + 名
      const 值 = 名 in 表 ? 表[名] : 简名 in 表 ? 表[简名] : null
      return { ...m, 已启用: 值 }
    })
  }

  const 回 = (res, code, body) => {
    res.writeHead(code, {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'access-control-allow-origin': '*',
    })
    res.end(JSON.stringify(body))
  }

  ctx.effect(() =>
    ctx.webServer.register({
      kind: 'exact',
      path: '/panel-base/data',
      handler: async (req, res) => {
        return 回(res, 200, {
          ok: true,
          at: new Date().toISOString(),
          version: 读json(join(包根, 'package.json'), {})?.version || '0.0.0',
          profile,
          工作状态: {
            状态: String(config.statusText || '在线'),
            负载: String(config.loadText || '—'),
          },
          模块: await 读模块带状态(),
          设置: 读设置(),
        })
      },
    }),
  )

  ctx.effect(() =>
    ctx.webServer.register({
      kind: 'exact',
      path: '/panel-base/settings',
      handler: async (req, res) => {
        if (req.method === 'GET') return 回(res, 200, { ok: true, 设置: 读设置() })
        if (req.method !== 'POST') return 回(res, 405, { ok: false, 说: '只收 GET/POST' })
        const 体 = await 读体(req)
        return 回(res, 200, { ok: true, 设置: 存设置(体 || {}) })
      },
    }),
  )

  // 星图用的 three.js。模块里写 "星图": true 才会去拉它，不写就不加载。
  const 三方位 = join(包根, 'vendor', 'three.module.js')

  ctx.effect(() =>
    ctx.webServer.register({
      kind: 'exact',
      path: '/panel-base/vendor/three.module.js',
      handler: (req, res) => {
        try {
          const 内容 = readFileSync(三方位)
          res.writeHead(200, { 'content-type': 'text/javascript; charset=utf-8', 'cache-control': 'public, max-age=86400' })
          res.end(内容)
        } catch {
          res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' })
          res.end('没有 three')
        }
      },
    }),
  )

  // 开关一个插件（模块里写 "开关": "包名" 就会用这个）
  ctx.effect(() =>
    ctx.webServer.register({
      kind: 'exact',
      path: '/panel-base/toggle',
      handler: async (req, res) => {
        if (req.method !== 'POST') return 回(res, 405, { ok: false, 说: '只收 POST' })
        const pm = 插件管理器(ctx)
        if (!pm) return 回(res, 200, { ok: false, 说: '这个 profile 没有 pluginManager，开关用不了' })
        const 体 = await 读体(req)
        const 名 = String(体.插件 || '').trim()
        if (!名) return 回(res, 200, { ok: false, 说: '缺 插件' })
        try {
          const r = await pm.setBundleEnabled(名, Boolean(体.启用))
          return 回(res, 200, { ok: r.application !== 'failed', application: r.application })
        } catch (error) {
          return 回(res, 200, { ok: false, 说: String((error && error.message) || error) })
        }
      },
    }),
  )
}
