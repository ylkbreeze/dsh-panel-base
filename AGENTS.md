# AGENTS.md

> 这份是给 AI 编码助手读的。人请读 [README.md](README.md)。

**项目：** dsh-panel-base（DSH 面板控制台基座）
**版本：** 1.0.0
**类型：** DeepSeek Harness 插件（Cordis 插件体系）
**语言：** JavaScript（ESM，无构建步骤、无 TypeScript、无打包器）

---

## 一句话

这是一个**只提供 UI 壳**的 DSH 插件。它不含任何业务逻辑；功能由 `modules/*.json` 声明式挂载。

---

## 硬约束（改代码前必读）

1. **不要往这个插件里加业务逻辑。** 它不是应用，是壳。想加功能 → 写 JSON，不是写代码。
2. **不要引入构建步骤。** 没有 webpack/vite/tsc。`client.js` 是被 DSH 直接加载的 ESM 源码。
3. **不要引入运行时依赖。** 除 `vendor/three.module.js`（星图用，本地文件）外，零依赖。
4. **不要改 `cordis.patch.yml` 的 `id: panel-base`。** 它和 `package.json` 的 `name` 必须对得上。
5. **不要动 `lib/index.js` 里的接口路径**（`/panel-base/data`、`/panel-base/settings`、`/panel-base/vendor/three.module.js`），它们是公开契约。
6. **不要写死颜色。** 所有颜色必须走 `--pb-*` 变量，否则皮肤会坏。
7. **不要用 `> *` 给直接子元素批量加 `position`。** 会把 `.pb-mask`（设置弹层）的 `fixed` 覆盖掉，弹层掉到文档流里。用 `> *:not(.pb-mask)`。

---

## 目录职责

```
package.json        插件清单。version / dsh.bundle.patch / dsh.client
cordis.patch.yml    加载入口 + 用户配置（身份、工作状态）
lib/index.js        宿主半边：读 modules、读/存 settings、注册 HTTP 路由
client.js           界面半边：三层结构 + 十四套皮肤（CSS-in-JS 字符串）
modules/*.json      功能块声明（零代码扩展点）
locale/*.json       i18n 元信息
vendor/three.module.js  three.js r160，星图专用
```

---

## 两侧通信

### Host → Client

`GET /panel-base/data` 返回：

```json
{
  "ok": true,
  "at": "2026-11-16T...",
  "version": "1.0.0",
  "profile": { "name": "...", "gender": "...", "birthday": "..." },
  "工作状态": { "状态": "...", "负载": "..." },
  "模块": [ /* modules 目录里的 JSON，加上 来源 和 已启用 */ ],
  "设置": { "皮肤": "...", "大小": "...", "打开方式": "...", "语言": "...", "背景": "..." }
}
```

### Client → Host

`POST /panel-base/settings`
```json
{ "皮肤": "galaxy" }
```
返回合并后的完整设置。**写入后 Client 必须重新拉 `/panel-base/data`**，否则界面不会变（这是 1.0.0 修掉的 bug）。

`POST /panel-base/toggle`
```json
{ "插件": "dsh-yu-room", "启用": true }
```
调 `pluginManager.setBundleEnabled`。

---

## 客户端结构

```
window.__ModuleLoader__.load({ id, factory(require) })
  └─ factory
      ├─ React / h / hooks          （从 require 拿，不是 import）
      ├─ CSS 字符串模板
      ├─ 用数据(间隔)                → [data, 重新拉]
      ├─ 心电 / 爱心                  （canvas + SVG 动画）
      ├─ 银河                         （three.js 动态 import）
      ├─ 基座()                      → 主组件
      │    ├─ 主界面 / 模块页 / 子页
      │    └─ 弹层（更多 / 设置）
      ├─ 设置面板()
      └─ apply(ctx) → 注册 sidebar.panellist + main
```

### 分层状态

`视 = { 层: 'main' | 'module' | 'sub', 模块, 子 }`

不是路由，是组件内 state。**不要引入路由库。**

---

## 模块 JSON 契约

见 README 的「加自己的功能」一节。关键点：

- `id` 必填且唯一，重复的后者被丢弃
- `数据源` 每 5 秒拉一次，多个模块共用同一地址时只拉一次
- `路径` 是点号路径（`a.b.c`），支持数组下标（`points.0.text`）
- `型: "text"` 或值本身是 string → 走清单布局
- 一个子项全是文字 → **自动**清单布局，不铺格子

---

## 皮肤系统

### 变量层

CSS 开头定义了 `.pb-wrap{ --pb-* }` 一组默认值，全部指向 DSH 的 `--dsw-alias-*` token。

皮肤 = `[data-skin="xxx"]` 覆盖这组变量 + 加图案/边框/布局规则。

| 变量 | 用途 |
|---|---|
| `--pb-bg` | 页面底 |
| `--pb-card` / `--pb-card2` | 卡片底 / 次级底 |
| `--pb-overlay` | 弹层底 |
| `--pb-line` / `--pb-line2` | 细边 / 主边 |
| `--pb-fg` / `--pb-fg2` | 主文字 / 次文字 |
| `--pb-accent` | 强调色 |
| `--pb-radius` / `--pb-gap` | 圆角 / 间距 |
| `--pb-shadow` / `--pb-blur` | 阴影 / 毛玻璃 |
| `--pb-tile` | 功能块底 |

### 加一套皮肤

1. 在 CSS 里加 `.pb-wrap[data-skin="你的名字"]{ ...变量... }`
2. 需要图案 → 加 `background-image`（内联 SVG 优先，不要外链）
3. 需要改布局 → 加 `.pb-wrap[data-skin="你的名字"] .pb-main{ grid-template-columns:... }`
4. 在 `设置面板` 的 `['default', '默认']` 数组里加一项

**不需要改任何 JS 逻辑。**

### 响应式（必须遵守）

- 所有 `grid-template-columns` 里用 `minmax(min(Npx,100%),1fr)`，**不要**用 `minmax(Npx,1fr)`
- 双列布局用 `minmax(180px,260px) minmax(0,1fr)`，右列那个 `0` 是关键
- 卡片要有 `min-width:0`，否则内容会撑破容器

---

## 已知坑（踩过的）

| 坑 | 现象 | 原因 / 解法 |
|---|---|---|
| `> * {position:relative}` | 设置弹层掉到页面底部 | 覆盖了 `.pb-mask` 的 `fixed`。用 `:not(.pb-mask)` |
| `minmax(220px,1fr)` | 窄窗口时功能块被裁 | 改用 `minmax(min(220px,100%),1fr)` |
| 设置改完不刷新 | 切皮肤没反应 | 改完必须调 `重新拉()` |
| 拷贝插件目录成嵌套 | `lib/lib/index.js` | PowerShell `Copy-Item -Recurse` 到已存在目录会嵌套。先删目标 |
| 静默 replace 失败 | 样式没写进文件但脚本没报错 | `String.replace` 找不到锚点时静默返回原串。插入 CSS 后必须校验 `c.length` 变了 |

---

## 编码约定

- **中文标识符**：变量、函数、CSS 类名混用中文（`基座`、`视`、`余数`、`模块们`）。保持这个风格，不要改成英文。
- **注释用中文**，写「为什么」不写「是什么」。
- **不用分号**（项目风格），不用 Prettier 格式化。
- **缩进 2 空格**。
- 字符串优先单引号。

---

## 测试

没有自动化测试。手工验收清单：

- [ ] 装完重启，左侧栏出现 `▦ 控制台`
- [ ] 十四套皮肤逐个切，每套布局都变，文字都看得清
- [ ] 窗口拖到 600px / 400px 宽，没有元素被裁
- [ ] 加一个 JSON 到 `~/.dsh/panel-base/modules/`，功能块出现
- [ ] 带 `数据源` 的模块数值会变（5 秒一次）
- [ ] 带 `开关` 的模块点了能启停插件
- [ ] 带 `心率值` 的模块显示心电和爱心，不带的没有

---

## 改动后的版本策略

| 改了什么 | 版本 |
|---|---|
| `modules/*.json`（只加功能） | **不动** |
| `client.js` / `lib/index.js` / 皮肤 | 升次版本号 |
| 接口变更、破坏性改动 | 升主版本号 |

只改 modules 时**不要**同步到发布副本——那是使用者自己的事。
