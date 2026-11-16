window.__ModuleLoader__.load({
  id: 'dsh-panel-base',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const { useState, useEffect, useCallback } = React

    const 数据 = '/panel-base/data'
    const 设置口 = '/panel-base/settings'

    async function 存设置(patch) {
      const r = await fetch(设置口, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(patch || {}),
      })
      return await r.json()
    }

    // 按 'state.joy' 这种路径取值
    function 取值(obj, path) {
      if (!path) return obj
      return String(path)
        .split('.')
        .reduce((o, k) => (o == null ? undefined : o[k]), obj)
    }

    // 0–1 显示成 0–100；0–100 的照原样
    function 百分比(v) {
      const n = Number(v)
      if (!isFinite(n)) return '—'
      if (n <= 1) return Math.round(n * 100)
      return Math.round(n)
    }

    const CSS = `
.pb-wrap{
  --pb-bg:var(--pb-bg);
  --pb-card:var(--pb-card);
  --pb-card2:var(--pb-card2);
  --pb-overlay:var(--pb-overlay);
  --pb-line:var(--pb-line);
  --pb-line2:var(--pb-line2);
  --pb-fg:var(--pb-fg);
  --pb-fg2:var(--pb-fg2);
  --pb-accent:var(--pb-accent);
  --pb-radius:12px;
  --pb-gap:12px;
  --pb-shadow:none;
  --pb-tile-bg:var(--pb-card);
}
/* 科技屏：深底、青蓝、细亮线、格子密 */
.pb-wrap[data-theme="tech"]{
  --pb-bg:#060e17;
  --pb-card:rgba(10,26,40,.82);
  --pb-card2:rgba(16,40,58,.9);
  --pb-overlay:#0a1725;
  --pb-line:rgba(64,196,232,.22);
  --pb-line2:rgba(64,196,232,.45);
  --pb-fg:#d8f2ff;
  --pb-fg2:#5ea8c8;
  --pb-accent:#40c4e8;
  --pb-radius:4px;
  --pb-gap:8px;
  --pb-shadow:inset 0 0 24px rgba(64,196,232,.06);
  --pb-tile-bg:linear-gradient(160deg,rgba(20,48,70,.85),rgba(8,22,34,.9));
}
/* 柔和卡：浅底、大圆角、白卡片、软阴影 */
.pb-wrap[data-theme="soft"]{
  --pb-bg:#f2eefb;
  --pb-card:#ffffff;
  --pb-card2:#f7f4fd;
  --pb-overlay:#ffffff;
  --pb-line:#ece7f7;
  --pb-line2:#e0d9f0;
  --pb-fg:#2b2540;
  --pb-fg2:#8a83a3;
  --pb-accent:#7c5cff;
  --pb-radius:18px;
  --pb-gap:16px;
  --pb-shadow:0 8px 24px rgba(96,72,160,.08);
  --pb-tile-bg:#ffffff;
}
.pb-wrap{
  --pb-bg:var(--dsw-alias-bg-base);
  --pb-card:var(--dsw-alias-bg-layer-1);
  --pb-card2:var(--dsw-alias-bg-layer-2);
  --pb-overlay:var(--dsw-alias-bg-overlay);
  --pb-line:var(--dsw-alias-border-l1);
  --pb-line2:var(--dsw-alias-border-l2);
  --pb-fg:var(--dsw-alias-label-primary);
  --pb-fg2:var(--dsw-alias-label-secondary);
  --pb-accent:var(--dsw-alias-brand-primary);
  --pb-radius:12px;
  --pb-gap:12px;
  --pb-shadow:none;
  --pb-blur:none;
  --pb-tile:var(--dsw-alias-bg-layer-1);
  --pb-head:transparent;
}
/* 科技屏：深底青蓝，细亮线，方角，格子密（参考数据大屏） */
.pb-wrap[data-skin="tech"]{
  --pb-bg:radial-gradient(1200px 700px at 50% -10%,#0d2438 0%,#060e17 60%,#04080e 100%);
  --pb-card:rgba(10,26,40,.78);
  --pb-card2:rgba(16,42,60,.86);
  --pb-overlay:#08141f;
  --pb-line:rgba(64,196,232,.20);
  --pb-line2:rgba(64,196,232,.42);
  --pb-fg:#d9f3ff;
  --pb-fg2:#5c9fbf;
  --pb-accent:#40c4e8;
  --pb-radius:4px;
  --pb-gap:8px;
  --pb-shadow:inset 0 0 30px rgba(64,196,232,.05);
  --pb-tile:linear-gradient(158deg,rgba(22,52,74,.82),rgba(8,20,32,.92));
  --pb-head:linear-gradient(180deg,rgba(64,196,232,.10),transparent);
}
/* 柔和卡：浅底白卡，大圆角，紫，软阴影（参考银行 App） */
.pb-wrap[data-skin="soft"]{
  --pb-bg:linear-gradient(160deg,#f6f2ff 0%,#eef3ff 100%);
  --pb-card:#ffffff;
  --pb-card2:#f7f4fd;
  --pb-overlay:#ffffff;
  --pb-line:#efeaf9;
  --pb-line2:#e2daf2;
  --pb-fg:#2b2540;
  --pb-fg2:#8a83a3;
  --pb-accent:#7c5cff;
  --pb-radius:18px;
  --pb-gap:16px;
  --pb-shadow:0 10px 28px rgba(96,72,160,.09);
  --pb-tile:#ffffff;
  --pb-head:transparent;
}
/* 玻璃：暗底渐变 + 半透明模糊（Glassmorphism） */
.pb-wrap[data-skin="glass"]{
  --pb-bg:radial-gradient(900px 600px at 15% 0%,#20304f 0%,#0d1425 55%,#070a12 100%);
  --pb-card:rgba(255,255,255,.07);
  --pb-card2:rgba(255,255,255,.11);
  --pb-overlay:rgba(20,26,42,.92);
  --pb-line:rgba(255,255,255,.12);
  --pb-line2:rgba(255,255,255,.24);
  --pb-fg:#eef2ff;
  --pb-fg2:#9aa6c8;
  --pb-accent:#7dd3fc;
  --pb-radius:16px;
  --pb-gap:14px;
  --pb-shadow:0 8px 32px rgba(0,0,0,.35);
  --pb-blur:blur(14px) saturate(140%);
  --pb-tile:rgba(255,255,255,.06);
  --pb-head:transparent;
}
.pb-wrap,.pb-wrap *{box-sizing:border-box}
.pb-wrap{position:relative;width:100%;max-width:100%;height:100%;overflow:hidden;display:flex;flex-direction:column;
  background:var(--pb-bg);color:var(--pb-fg);
  font:13px/1.6 -apple-system,"PingFang SC","Microsoft YaHei",system-ui}
.pb-main{flex:1;width:100%;min-width:0;display:grid;grid-template-columns:minmax(180px,260px) minmax(0,1fr);gap:var(--pb-gap);padding:14px 16px 10px;min-height:0}
.pb-col{display:flex;flex-direction:column;gap:14px;min-height:0}
.pb-col > .pb-card{flex:1 1 0;min-height:0}

.pb-card{min-width:0;min-height:0;max-width:100%;background:var(--pb-card);border:2px solid var(--pb-line2);
  border-radius:12px;overflow:hidden;display:flex;flex-direction:column;min-height:0}
.pb-card-h{flex:0 0 auto;display:flex;align-items:center;gap:8px;padding:10px 14px;
  font-size:12.5px;color:var(--pb-fg2);
  border-bottom:1px solid var(--pb-line)}
.pb-card-h::before{content:"";width:3px;height:13px;border-radius:2px;background:var(--pb-accent)}
.pb-card-b{flex:1;min-height:0;min-width:0;overflow:auto;padding:12px 14px}
.pb-card-b.居中{display:flex;flex-direction:column;justify-content:center}

.pb-avatar{width:96px;height:96px;border-radius:10px;margin:4px auto 14px;
  display:grid;place-items:center;font-size:30px;letter-spacing:2px;
  background:var(--pb-card2);border:1px solid var(--pb-line2);
  color:var(--pb-accent)}
.pb-avatar img{width:100%;height:100%;object-fit:cover;border-radius:9px}
.pb-row{display:flex;justify-content:space-between;align-items:baseline;gap:10px;
  font-size:13px;padding:4px 0}
.pb-row .a{color:var(--pb-fg2);flex:0 0 auto}
.pb-row .b{text-align:right;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}

.pb-grid{display:grid;min-width:0;grid-auto-rows:minmax(90px,auto);grid-template-columns:repeat(auto-fill,minmax(min(220px,100%),1fr));
  gap:var(--pb-gap);align-content:start}
.pb-tile{background:var(--pb-card);border:2px solid var(--pb-line2);
  border-radius:12px;padding:16px;cursor:pointer;min-height:92px;
  display:flex;flex-direction:column;justify-content:space-between;
  transition:border-color .14s,transform .14s,box-shadow .14s}
.pb-tile:hover{transform:translateY(-2px);border-color:var(--pb-line2);
  box-shadow:0 6px 18px rgba(0,0,0,.08)}
.pb-tile .t{font-size:15px;font-weight:600;line-height:1.35;word-break:break-word;overflow-wrap:anywhere;
  display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.pb-tile .s{font-size:11.5px;color:var(--pb-fg2);margin-top:8px}

.pb-foot{flex:0 0 auto;width:100%;display:grid;grid-template-columns:1fr 1fr;gap:12px;
  padding:0 16px 14px}
.pb-btn{background:var(--pb-card);border:2px solid var(--pb-line2);
  border-radius:12px;padding:12px;cursor:pointer;font:inherit;font-size:14px;
  color:var(--pb-fg);display:flex;align-items:center;justify-content:center;gap:8px;
  transition:background .12s,border-color .12s}
.pb-btn:hover{background:var(--pb-card2);border-color:var(--pb-line2)}

/* 模块页：左边标题 + 心率，右边子格 */
.pb-page{flex:1;width:100%;min-width:0;display:grid;grid-template-columns:minmax(180px,260px) minmax(0,1fr);gap:var(--pb-gap);padding:14px 16px 10px;min-height:0}
.pb-title{font-size:30px;font-weight:700;line-height:1.25;padding:18px 16px;
  display:flex;flex-direction:column;justify-content:center;height:100%}
.pb-heart{flex:0 0 auto;padding:16px;text-align:center;border-top:1px solid var(--pb-line)}
.pb-heart .n{font-size:20px;font-variant-numeric:tabular-nums;display:flex;align-items:center;justify-content:center;gap:7px}
.pb-heart .l{font-size:11.5px;color:var(--pb-fg2)}
@keyframes pb-beat{
  0%,100%{transform:scale(1)}
  12%{transform:scale(1.14)}
  24%{transform:scale(1)}
  36%{transform:scale(1.07)}
}

/* 子模块页：一行行的数值格 */
.pb-sub{flex:1;width:100%;min-width:0;display:flex;flex-direction:column;padding:14px 16px 10px;min-height:0}
.pb-sub-h{font-size:16px;font-weight:600;text-align:center;padding:8px 0 14px;flex:0 0 auto}
.pb-cells{flex:1;overflow:auto;display:grid;
  grid-template-columns:repeat(auto-fill,minmax(min(150px,100%),1fr));gap:var(--pb-gap);align-content:start}
.pb-cell{background:var(--pb-card);border:2px solid var(--pb-line2);
  border-radius:10px;padding:12px;text-align:center}
.pb-cell .n{font-size:12.5px;color:var(--pb-fg2)}
.pb-cell .v{font-size:17px;font-variant-numeric:tabular-nums;margin-top:6px}
.pb-cell .v small{font-size:11px;color:var(--pb-fg2)}

/* 弹层 */
.pb-mask{position:fixed;inset:0;z-index:95;background:rgba(0,0,0,.38);
  display:flex;align-items:center;justify-content:center;padding:24px}
.pb-modal{width:min(640px,100%);max-height:80vh;display:flex;flex-direction:column;
  background:var(--pb-overlay);border:1px solid var(--pb-line2);
  border-radius:14px;overflow:hidden;box-shadow:0 24px 60px rgba(0,0,0,.4)}
.pb-modal-h{display:flex;align-items:center;justify-content:space-between;padding:13px 18px;
  border-bottom:1px solid var(--pb-line);font-size:14px;font-weight:600}
.pb-modal-h button{background:var(--pb-card2);border:1px solid var(--pb-line);
  color:var(--pb-fg2);width:28px;height:28px;border-radius:8px;cursor:pointer;
  font-size:16px;line-height:1;display:grid;place-items:center}
.pb-modal-b{flex:1;overflow:auto;padding:14px 18px 18px}
.pb-set-row{display:flex;align-items:center;justify-content:space-between;gap:14px;
  padding:10px 0;border-bottom:1px solid var(--pb-line)}
.pb-set-row:last-child{border-bottom:none}
.pb-set-row .k{font-size:13px}
.pb-set-row .k small{display:block;color:var(--pb-fg2);font-size:11px;margin-top:2px}
.pb-seg{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end}
.pb-seg button{background:var(--pb-card2);border:1px solid var(--pb-line);
  color:var(--pb-fg2);border-radius:8px;padding:4px 11px;cursor:pointer;
  font:inherit;font-size:12px}
.pb-seg button.on{border-color:var(--pb-accent);color:var(--pb-accent);
  background:color-mix(in srgb, var(--pb-accent) 14%, transparent)}
.pb-list{display:flex;flex-direction:column;gap:10px}
.pb-item{display:flex;justify-content:space-between;align-items:baseline;gap:16px;
  padding:10px 14px;border:2px solid var(--pb-line2);border-radius:10px;
  background:var(--pb-card2)}
.pb-item .k{font-size:12.5px;color:var(--pb-fg2);flex:0 0 auto}
.pb-item .v{font-size:13px;text-align:right;word-break:break-all;display:flex;align-items:center;gap:8px}
.pb-copy{background:transparent;border:1px solid var(--pb-line2);
  color:var(--pb-fg2);border-radius:6px;padding:1px 8px;cursor:pointer;font:inherit;font-size:11px}
.pb-copy:hover{color:var(--pb-fg)}

/* 下拉：配色跟皮肤走，文字一律用前景色，对比够 */
.pb-select{display:inline-flex;align-items:center;position:relative;
  background:var(--pb-card2);border:1px solid var(--pb-line2);border-radius:calc(var(--pb-radius,10px) * .6);
  padding:0 4px 0 9px;color:var(--pb-fg)}
.pb-select select{appearance:none;-webkit-appearance:none;background:var(--pb-card2);
  border:none;outline:none;font:inherit;font-size:12.5px;color:var(--pb-fg);
  padding:5px 16px 5px 0;cursor:pointer}
.pb-select select option{background:var(--pb-overlay);color:var(--pb-fg)}
.pb-select:hover{border-color:var(--pb-accent)}
.pb-select .arrow{position:absolute;right:6px;pointer-events:none;font-size:10px;color:var(--pb-fg2)}
/* 纸质/柔和是浅底，前景色本来就深，不用额外处理；
   暗夜/霓虹/玻璃是深底，前景色是浅色，下拉也跟着浅 */
.pb-empty{color:var(--pb-fg2);font-size:12.5px;padding:26px 0;text-align:center}
.pb-back{cursor:pointer;user-select:none;color:var(--pb-fg2)}
.pb-back:hover{color:var(--pb-fg)}
.pb-toggle{width:44px;height:24px;border-radius:999px;position:relative;cursor:pointer;flex:0 0 auto;
  background:var(--pb-card2);border:1px solid var(--pb-line2);
  transition:background .2s,border-color .2s;padding:0}
.pb-toggle.on{background:#34c759;border-color:#34c759}
.pb-toggle .knob{position:absolute;top:2px;left:2px;width:18px;height:18px;border-radius:50%;
  background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.28);transition:transform .2s}
.pb-toggle.on .knob{transform:translateX(20px)}
.pb-switch{background:var(--pb-card2);border:1px solid var(--pb-line);
  color:var(--pb-fg2);border-radius:8px;padding:3px 10px;cursor:pointer;font:inherit;font-size:11.5px}
.pb-switch.on{border-color:var(--pb-accent);color:var(--pb-accent)}


/* ===== 摆法：每套皮肤各有一套位置 ===== */
/* 科技屏：身份和工作状态压到顶上横着排，功能铺满下面，像大屏 */
.pb-wrap[data-skin="tech"] .pb-main{grid-template-columns:1fr;grid-template-rows:auto 1fr}
.pb-wrap[data-skin="tech"] .pb-col{flex-direction:row;gap:var(--pb-gap)}
.pb-wrap[data-skin="tech"] .pb-col > .pb-card{flex:1}
.pb-wrap[data-skin="tech"] .pb-avatar{width:56px;height:56px;font-size:20px;margin:0 14px 0 0}
.pb-wrap[data-skin="tech"] .pb-card-b.居中{flex-direction:row;align-items:center;justify-content:center;gap:14px}
.pb-wrap[data-skin="tech"] .pb-grid{grid-template-columns:repeat(auto-fill,minmax(min(190px,100%),1fr))}
.pb-wrap[data-skin="tech"] .pb-tile{min-height:78px}
.pb-wrap[data-skin="tech"] .pb-card-h{font-size:11.5px;letter-spacing:1px}

/* 柔和：左栏加宽，卡片更松，功能块像 App 快捷入口 */
.pb-wrap[data-skin="soft"] .pb-main{grid-template-columns:minmax(200px,300px) minmax(0,1fr)}
.pb-wrap[data-skin="soft"] .pb-page{grid-template-columns:minmax(200px,300px) minmax(0,1fr)}
.pb-wrap[data-skin="soft"] .pb-tile{min-height:110px;padding:20px}
.pb-wrap[data-skin="soft"] .pb-tile .t{font-size:16px}
.pb-wrap[data-skin="soft"] .pb-btn{padding:16px;font-size:15px}
.pb-wrap[data-skin="soft"] .pb-avatar{width:112px;height:112px;border-radius:22px}

/* 玻璃：卡片缩进去一点，浮起来 */
.pb-wrap[data-skin="glass"] .pb-main{padding:20px 24px 14px}
.pb-wrap[data-skin="glass"] .pb-page{padding:18px 20px 12px}
.pb-wrap[data-skin="glass"] .pb-card{border-width:1px}
.pb-wrap[data-skin="glass"] .pb-tile{border-width:1px;backdrop-filter:var(--pb-blur)}
.pb-wrap[data-skin="glass"] .pb-tile:hover{background:rgba(255,255,255,.13);border-color:rgba(255,255,255,.34)}
.pb-wrap[data-skin="glass"] .pb-foot{padding:0 20px 18px}
.pb-wrap[data-skin="glass"] .pb-btn{backdrop-filter:var(--pb-blur)}

/* 默认：原样，不加东西 */


/* ===== 形状：每套皮肤换轮廓 ===== */
/* 科技屏：切角 + 左侧亮条 + 顶部细光，方方正正 */
.pb-wrap[data-skin="tech"] .pb-card,
.pb-wrap[data-skin="tech"] .pb-tile,
.pb-wrap[data-skin="tech"] .pb-btn{
  border-radius:0;
  clip-path:polygon(9px 0,100% 0,100% calc(100% - 9px),calc(100% - 9px) 100%,0 100%,0 9px)
}
.pb-wrap[data-skin="tech"] .pb-card{border-left:3px solid var(--pb-accent)}
.pb-wrap[data-skin="tech"] .pb-tile{border-left:3px solid rgba(64,196,232,.55)}
.pb-wrap[data-skin="tech"] .pb-tile:hover{border-left-color:var(--pb-accent);
  box-shadow:0 0 18px rgba(64,196,232,.28),inset 0 0 22px rgba(64,196,232,.10)}
.pb-wrap[data-skin="tech"] .pb-cell{border-radius:0;border-left:2px solid rgba(64,196,232,.45)}
.pb-wrap[data-skin="tech"] .pb-card-h{border-bottom:1px solid var(--pb-line2)}
.pb-wrap[data-skin="tech"] .pb-avatar{border-radius:2px;clip-path:polygon(8px 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%,0 8px)}

/* 柔和：胶囊 + 大圆，功能块像按钮 */
.pb-wrap[data-skin="soft"] .pb-tile{border-radius:999px;min-height:84px;justify-content:center;align-items:center;text-align:center}
.pb-wrap[data-skin="soft"] .pb-tile .t{font-size:15px}
.pb-wrap[data-skin="soft"] .pb-tile .s{display:none}
.pb-wrap[data-skin="soft"] .pb-btn{border-radius:999px}
.pb-wrap[data-skin="soft"] .pb-avatar{border-radius:999px}
.pb-wrap[data-skin="soft"] .pb-cell{border-radius:22px}
.pb-wrap[data-skin="soft"] .pb-card{border-radius:24px}
.pb-wrap[data-skin="soft"] .pb-grid{grid-template-columns:repeat(auto-fill,minmax(min(150px,100%),1fr))}

/* 玻璃：大圆角 + 悬停光晕 */
.pb-wrap[data-skin="glass"] .pb-card{border-radius:22px;backdrop-filter:blur(18px) saturate(150%)}
.pb-wrap[data-skin="glass"] .pb-tile{border-radius:20px}
.pb-wrap[data-skin="glass"] .pb-tile:hover{box-shadow:0 0 28px rgba(125,211,252,.22),0 8px 32px rgba(0,0,0,.3)}
.pb-wrap[data-skin="glass"] .pb-avatar{border-radius:999px}
.pb-wrap[data-skin="glass"] .pb-btn{border-radius:999px}
.pb-wrap[data-skin="glass"] .pb-cell{border-radius:16px}
.pb-wrap[data-skin="glass"] .pb-item{border-radius:16px}

/* 默认：不加东西 */


/* ===== 图案与边框装饰 ===== */
/* --- 科技屏：点阵 + 网格底，卡片四角 L 形角标，顶部一条扫描线 --- */
.pb-wrap[data-skin="tech"]{
  background-image:
    radial-gradient(circle at 1px 1px,rgba(64,196,232,.11) 1px,transparent 0),
    linear-gradient(rgba(64,196,232,.045) 1px,transparent 1px),
    linear-gradient(90deg,rgba(64,196,232,.045) 1px,transparent 1px),
    var(--pb-bg);
  background-size:22px 22px,88px 88px,88px 88px,100% 100%;
}
.pb-wrap[data-skin="tech"] .pb-card{position:relative}
.pb-wrap[data-skin="tech"] .pb-card::before,
.pb-wrap[data-skin="tech"] .pb-card::after{
  content:"";position:absolute;width:12px;height:12px;pointer-events:none;
  border-color:var(--pb-accent);border-style:solid;border-width:0;
  opacity:.85;
}
.pb-wrap[data-skin="tech"] .pb-card::before{top:-2px;left:-2px;border-top-width:2px;border-left-width:2px}
.pb-wrap[data-skin="tech"] .pb-card::after{bottom:-2px;right:-2px;border-bottom-width:2px;border-right-width:2px}
/* 功能块也有角标，小一号 */
.pb-wrap[data-skin="tech"] .pb-tile{position:relative}
.pb-wrap[data-skin="tech"] .pb-tile::before{
  content:"";position:absolute;top:0;right:0;width:9px;height:9px;pointer-events:none;
  border-top:2px solid rgba(64,196,232,.7);border-right:2px solid rgba(64,196,232,.7);
}
/* 顶部扫描线：一条横光慢慢扫 */
.pb-wrap[data-skin="tech"]::after{
  content:"";position:absolute;left:0;right:0;top:0;height:1px;pointer-events:none;
  background:linear-gradient(90deg,transparent,rgba(64,196,232,.55),transparent);
  animation:pb-scan 6s linear infinite;
}
@keyframes pb-scan{0%{transform:translateY(0);opacity:0}
  10%{opacity:1}90%{opacity:1}100%{transform:translateY(100vh);opacity:0}}

/* --- 玻璃：斜向光带 + 卡片顶部高光 --- */
.pb-wrap[data-skin="glass"]{
  background-image:
    repeating-linear-gradient(115deg,rgba(255,255,255,.028) 0 2px,transparent 2px 14px),
    radial-gradient(900px 600px at 15% 0%,#20304f 0%,#0d1425 55%,#070a12 100%);
}
.pb-wrap[data-skin="glass"] .pb-card{position:relative}
.pb-wrap[data-skin="glass"] .pb-card::before{
  content:"";position:absolute;left:12px;right:12px;top:0;height:1px;pointer-events:none;
  background:linear-gradient(90deg,transparent,rgba(255,255,255,.38),transparent);
}

/* --- 柔和：斜纹纸底 + 卡片内描边（不抢眼） --- */
.pb-wrap[data-skin="soft"]{
  background-image:
    repeating-linear-gradient(45deg,rgba(124,92,255,.028) 0 1px,transparent 1px 10px),
    linear-gradient(160deg,#f6f2ff 0%,#eef3ff 100%);
}
.pb-wrap[data-skin="soft"] .pb-card{border:1px solid var(--pb-line2);box-shadow:var(--pb-shadow),inset 0 0 0 1px rgba(255,255,255,.9)}
.pb-wrap[data-skin="soft"] .pb-card-h{border-bottom:1px dashed var(--pb-line2)}

/* 默认不加任何装饰 */


/* --- 功能块也带图案：卡片半透明，底纹透上来 --- */
.pb-wrap[data-skin="tech"] .pb-card,
.pb-wrap[data-skin="tech"] .pb-tile{
  background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='56' height='56' viewBox='0 0 56 56'><g fill='none' stroke='%2340c4e8' stroke-width='1' opacity='.22'><path d='M0 14h14v-14M0 42h14v14M56 14h-14v-14M56 42h-14v14'/><circle cx='28' cy='28' r='3'/><path d='M28 0v10M28 46v10M0 28h10M46 28h10'/></g></svg>"),
    repeating-linear-gradient(45deg,rgba(64,196,232,.05) 0 1px,transparent 1px 9px);
  background-size:56px 56px,9px 9px;
  background-blend-mode:normal;
}
.pb-wrap[data-skin="soft"] .pb-card,
.pb-wrap[data-skin="soft"] .pb-tile{
  background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='56' height='28' viewBox='0 0 56 28'><g fill='none' stroke='%237c5cff' stroke-width='1' opacity='.16'><path d='M0 14q7-8 14 0t14 0 14 0 14 0'/><path d='M0 42q7-8 14 0t14 0 14 0 14 0'/></g></svg>"),
    repeating-linear-gradient(-45deg,rgba(124,92,255,.035) 0 1px,transparent 1px 12px);
  background-size:56px 56px,12px 12px;
}
.pb-wrap[data-skin="glass"] .pb-card,
.pb-wrap[data-skin="glass"] .pb-tile{
  background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='56' height='56' viewBox='0 0 56 56'><g fill='none' stroke='%23ffffff' stroke-width='1' opacity='.10'><path d='M0 0l28 28M28 0L0 28M28 28l28 28M56 28L28 56'/></g></svg>"),radial-gradient(circle at 20% 10%,rgba(125,211,252,.12),transparent 60%);
  background-size:56px 56px,100% 100%;
}
.pb-wrap[data-skin="glass"] .pb-card{background-color:rgba(16,22,38,.55)}
.pb-wrap[data-skin="glass"] .pb-tile{background-color:rgba(24,32,52,.55)}
/* 数值格也透一点 */
.pb-wrap[data-skin="tech"] .pb-cell{background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='56' height='56' viewBox='0 0 56 56'><g fill='none' stroke='%2340c4e8' stroke-width='1' opacity='.22'><path d='M0 14h14v-14M0 42h14v14M56 14h-14v-14M56 42h-14v14'/><circle cx='28' cy='28' r='3'/><path d='M28 0v10M28 46v10M0 28h10M46 28h10'/></g></svg>");background-size:56px 56px;background-color:rgba(10,26,40,.72)}
.pb-wrap[data-skin="soft"] .pb-cell{background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='56' height='28' viewBox='0 0 56 28'><g fill='none' stroke='%237c5cff' stroke-width='1' opacity='.16'><path d='M0 14q7-8 14 0t14 0 14 0 14 0'/><path d='M0 42q7-8 14 0t14 0 14 0 14 0'/></g></svg>");background-size:56px 56px}


/* 暗夜：近黑 + 暖金，安静 */
.pb-wrap[data-skin="night"]{
  --pb-bg:radial-gradient(1000px 600px at 70% 0%,#1b1a17 0%,#0b0b0a 60%,#050505 100%);
  --pb-card:rgba(28,27,24,.92);
  --pb-card2:rgba(40,38,33,.92);
  --pb-overlay:#14130f;
  --pb-line:rgba(214,180,110,.16);
  --pb-line2:rgba(214,180,110,.34);
  --pb-fg:#efe7d6;
  --pb-fg2:#9c8f76;
  --pb-accent:#d6b46e;
  --pb-radius:10px;
  --pb-gap:12px;
  --pb-shadow:0 8px 26px rgba(0,0,0,.55);
  --pb-tile:rgba(34,32,27,.92);
}
/* 纸质：米黄 + 棕，像纸本 */
.pb-wrap[data-skin="paper"]{
  --pb-bg:linear-gradient(160deg,#fbf6ea 0%,#f3ebd9 100%);
  --pb-card:#fffdf6;
  --pb-card2:#f8f2e2;
  --pb-overlay:#fffdf6;
  --pb-line:#eadfc6;
  --pb-line2:#ddcfae;
  --pb-fg:#443a28;
  --pb-fg2:#94856a;
  --pb-accent:#a8763e;
  --pb-radius:6px;
  --pb-gap:14px;
  --pb-shadow:0 2px 0 rgba(168,118,62,.12),0 6px 18px rgba(120,96,60,.08);
  --pb-tile:#fffdf6;
}
/* 霓虹：黑底 + 品红青双色 */
.pb-wrap[data-skin="neon"]{
  --pb-bg:radial-gradient(900px 600px at 80% 10%,#2a0b3d 0%,#0b0716 55%,#050309 100%);
  --pb-card:rgba(24,12,38,.80);
  --pb-card2:rgba(40,16,60,.85);
  --pb-overlay:#150a22;
  --pb-line:rgba(255,60,172,.22);
  --pb-line2:rgba(255,60,172,.48);
  --pb-fg:#ffe9f7;
  --pb-fg2:#b98fd4;
  --pb-accent:#ff3cac;
  --pb-radius:14px;
  --pb-gap:12px;
  --pb-shadow:0 0 24px rgba(255,60,172,.16);
  --pb-tile:linear-gradient(150deg,rgba(48,16,70,.85),rgba(18,8,30,.92));
}

/* 暗夜：细横纹 + 金角标 */
.pb-wrap[data-skin="night"]{
  background-image:repeating-linear-gradient(0deg,rgba(214,180,110,.035) 0 1px,transparent 1px 6px),
    radial-gradient(1000px 600px at 70% 0%,#1b1a17 0%,#0b0b0a 60%,#050505 100%);
}
.pb-wrap[data-skin="night"] .pb-card{position:relative;border-width:1px}
.pb-wrap[data-skin="night"] .pb-card::before{
  content:"";position:absolute;left:0;top:0;width:3px;height:100%;pointer-events:none;
  background:linear-gradient(180deg,transparent,var(--pb-accent),transparent);opacity:.5;
}

/* 纸质：纸纤维点 + 手写感虚线 */
.pb-wrap[data-skin="paper"]{
  background-image:radial-gradient(circle at 1px 1px,rgba(140,110,70,.14) 1px,transparent 0),
    linear-gradient(160deg,#fbf6ea 0%,#f3ebd9 100%);
  background-size:14px 14px,100% 100%;
}
.pb-wrap[data-skin="paper"] .pb-card{border:1px solid var(--pb-line2)}
.pb-wrap[data-skin="paper"] .pb-card-h{border-bottom:1px dashed var(--pb-line2)}
.pb-wrap[data-skin="paper"] .pb-tile:hover{border-color:var(--pb-accent)}

/* 霓虹：点阵 + 描边发光 */
.pb-wrap[data-skin="neon"]{
  background-image:radial-gradient(circle at 1px 1px,rgba(255,60,172,.16) 1px,transparent 0),
    radial-gradient(900px 600px at 80% 10%,#2a0b3d 0%,#0b0716 55%,#050309 100%);
  background-size:20px 20px,100% 100%;
}
.pb-wrap[data-skin="neon"] .pb-card,
.pb-wrap[data-skin="neon"] .pb-tile{box-shadow:0 0 18px rgba(255,60,172,.14),inset 0 0 24px rgba(0,240,255,.05)}
.pb-wrap[data-skin="neon"] .pb-tile:hover{border-color:var(--pb-accent);
  box-shadow:0 0 26px rgba(255,60,172,.32),inset 0 0 26px rgba(0,240,255,.10)}
.pb-wrap[data-skin="neon"] .pb-card-h{color:var(--pb-accent)}


/* ===== 七套皮肤：七种界面结构 ===== */
/* 默认——左栏 + 网格（原样） */

/* 科技屏——顶部横栏 + 密格（已在上面写过，这里补功能块高度递减） */
.pb-wrap[data-skin="tech"] .pb-tile{min-height:64px;padding:12px}
.pb-wrap[data-skin="tech"] .pb-tile .t{font-size:14px;font-weight:600}

/* 柔和——功能块变成「圆图标 + 名字」的 App 式方块 */
.pb-wrap[data-skin="soft"] .pb-grid{grid-template-columns:repeat(auto-fill,minmax(min(120px,100%),1fr));gap:20px}
.pb-wrap[data-skin="soft"] .pb-tile{
  border:none;background:transparent;box-shadow:none;min-height:auto;
  align-items:center;text-align:center;padding:6px
}
.pb-wrap[data-skin="soft"] .pb-tile .t{
  font-size:13px;font-weight:500;margin-top:10px;
}
.pb-wrap[data-skin="soft"] .pb-tile::before{
  content:"";display:block;width:58px;height:58px;border-radius:999px;
  background:linear-gradient(145deg,#efe9ff,#fff);border:1px solid var(--pb-line2);
  box-shadow:0 6px 16px rgba(124,92,255,.14);
}
.pb-wrap[data-skin="soft"] .pb-tile:hover::before{border-color:var(--pb-accent);
  box-shadow:0 8px 22px rgba(124,92,255,.26)}
.pb-wrap[data-skin="soft"] .pb-tile .s{display:none}

/* 玻璃——内容居中成一座浮岛，两侧留白 */
.pb-wrap[data-skin="glass"] .pb-main{
  grid-template-columns:minmax(200px,280px) minmax(0,1fr);
  max-width:1320px;margin:0 auto;width:100%;
}
.pb-wrap[data-skin="glass"] .pb-page{max-width:1320px;margin:0 auto;width:100%}
.pb-wrap[data-skin="glass"] .pb-foot{max-width:1320px;margin:0 auto;width:100%}
.pb-wrap[data-skin="glass"] .pb-tile{border-radius:20px;padding:20px}

/* 暗夜——功能做成左侧竖排菜单，一行一条，不铺格子 */
.pb-wrap[data-skin="night"] .pb-grid{
  display:flex;flex-direction:column;gap:2px
}
.pb-wrap[data-skin="night"] .pb-tile{
  min-height:auto;padding:13px 12px;border:none;border-bottom:1px solid var(--pb-line);
  border-radius:0;background:transparent;flex-direction:row;align-items:center;
  justify-content:space-between;box-shadow:none
}
.pb-wrap[data-skin="night"] .pb-tile::after{
  content:"›";color:var(--pb-accent);font-size:15px;opacity:.6
}
.pb-wrap[data-skin="night"] .pb-tile:hover{background:rgba(214,180,110,.07);transform:none;border-bottom-color:var(--pb-accent)}
.pb-wrap[data-skin="night"] .pb-tile .t{font-size:14px}
.pb-wrap[data-skin="night"] .pb-tile .s{display:none}

/* 纸质——两栏书页，功能像目录条目 */
.pb-wrap[data-skin="paper"] .pb-main{grid-template-columns:minmax(160px,240px) minmax(0,1fr);gap:22px}
.pb-wrap[data-skin="paper"] .pb-grid{grid-template-columns:repeat(2,1fr);gap:0 26px}
.pb-wrap[data-skin="paper"] .pb-tile{
  border:none;border-bottom:1px solid var(--pb-line);border-radius:0;
  background:transparent;box-shadow:none;min-height:auto;padding:11px 2px;
  flex-direction:row;align-items:baseline;justify-content:space-between;gap:10px
}
.pb-wrap[data-skin="paper"] .pb-tile .t{font-size:14px;font-weight:500;letter-spacing:.2px}
.pb-wrap[data-skin="paper"] .pb-tile .s{font-size:11px;margin:0}
.pb-wrap[data-skin="paper"] .pb-tile:hover{background:rgba(168,118,62,.06);transform:none}
.pb-wrap[data-skin="paper"] .pb-card-h{font-family:serif;font-style:italic}

/* 霓虹——功能块横向一排，可左右滑 */
.pb-wrap[data-skin="neon"] .pb-grid{
  display:flex;gap:14px;overflow-x:auto;padding-bottom:8px;
  scrollbar-width:thin
}
.pb-wrap[data-skin="neon"] .pb-tile{
  flex:0 0 210px;min-height:120px;border-radius:16px;
  background:linear-gradient(150deg,rgba(255,60,172,.14),rgba(0,240,255,.07))
}
.pb-wrap[data-skin="neon"] .pb-tile .t{font-size:17px;background:linear-gradient(90deg,#ff3cac,#00f0ff);
  -webkit-background-clip:text;background-clip:text;color:transparent}
.pb-wrap[data-skin="neon"] .pb-card-h{letter-spacing:2px;text-transform:uppercase;font-size:10.5px}


/* ========== 终端 Terminal：黑底绿字，等宽，竖排一列 ========== */
.pb-wrap[data-skin="terminal"]{
  --pb-bg:#080b08;
  --pb-card:rgba(12,20,12,.92);
  --pb-card2:rgba(18,30,18,.92);
  --pb-overlay:#0b120b;
  --pb-line:#1e3a1e;
  --pb-line2:#2f5c2f;
  --pb-fg:#3dff7a;
  --pb-fg2:#1f8f45;
  --pb-accent:#3dff7a;
  --pb-radius:0px;
  --pb-gap:6px;
  --pb-shadow:0 0 0 1px rgba(61,255,122,.18),inset 0 0 40px rgba(61,255,122,.04);
  --pb-tile:rgba(10,18,10,.9);
  font-family:Consolas,"Courier New",monospace;
}
.pb-wrap[data-skin="terminal"]{
  background-image:repeating-linear-gradient(0deg,rgba(61,255,122,.05) 0 1px,transparent 1px 3px),linear-gradient(180deg,#080b08,#050705);
}
/* 竖排一列，每行前缀 > */
.pb-wrap[data-skin="terminal"] .pb-main{grid-template-columns:minmax(160px,240px) minmax(0,1fr)}
.pb-wrap[data-skin="terminal"] .pb-grid{display:flex;flex-direction:column;gap:0}
.pb-wrap[data-skin="terminal"] .pb-tile{
  border:none;border-left:2px solid var(--pb-line2);border-radius:0;background:transparent;
  min-height:auto;padding:7px 10px;flex-direction:row;align-items:baseline;gap:8px;box-shadow:none}
.pb-wrap[data-skin="terminal"] .pb-tile::before{
  content:">";color:var(--pb-accent);flex:0 0 auto}
.pb-wrap[data-skin="terminal"] .pb-tile:hover{background:rgba(61,255,122,.07);border-left-color:var(--pb-accent);transform:none}
.pb-wrap[data-skin="terminal"] .pb-tile .t{font-size:13px}
.pb-wrap[data-skin="terminal"] .pb-tile .s{display:none}
.pb-wrap[data-skin="terminal"] .pb-card-h{font-size:11px;letter-spacing:1px}
.pb-wrap[data-skin="terminal"] .pb-card-h::before{content:"# "}
.pb-wrap[data-skin="terminal"] .pb-avatar{display:none}
.pb-wrap[data-skin="terminal"] .pb-btn{justify-content:flex-start;padding-left:12px}
.pb-wrap[data-skin="terminal"] .pb-btn::before{content:"$ ";color:var(--pb-fg2)}

/* ========== 新拟物 Neumorphism：同色底 + 双向阴影 ========== */
.pb-wrap[data-skin="neumo"]{
  --pb-bg:#e3e8ef;
  --pb-card:#e3e8ef;
  --pb-card2:#dde3ea;
  --pb-overlay:#e8edf3;
  --pb-line:#cfd6de;
  --pb-line2:#cdd5de;
  --pb-fg:#3a4453;
  --pb-fg2:#7d8899;
  --pb-accent:#5b7cfa;
  --pb-radius:20px;
  --pb-gap:18px;
  --pb-shadow:8px 8px 18px #c2c9d2,-8px -8px 18px #ffffff;
  --pb-tile:#e3e8ef;
}
.pb-wrap[data-skin="neumo"] .pb-card{border:none}
.pb-wrap[data-skin="neumo"] .pb-tile{border:none;box-shadow:6px 6px 14px #c2c9d2,-6px -6px 14px #ffffff}
.pb-wrap[data-skin="neumo"] .pb-tile:hover{box-shadow:3px 3px 8px #c2c9d2,-3px -3px 8px #ffffff;transform:none}
.pb-wrap[data-skin="neumo"] .pb-tile:active{box-shadow:inset 4px 4px 10px #c2c9d2,inset -4px -4px 10px #ffffff}
.pb-wrap[data-skin="neumo"] .pb-btn{border:none;box-shadow:5px 5px 12px #c2c9d2,-5px -5px 12px #ffffff}
.pb-wrap[data-skin="neumo"] .pb-btn:active{box-shadow:inset 4px 4px 10px #c2c9d2,inset -4px -4px 10px #ffffff}
.pb-wrap[data-skin="neumo"] .pb-cell{border:none;box-shadow:inset 3px 3px 8px #ccd3db,inset -3px -3px 8px #ffffff}
.pb-wrap[data-skin="neumo"] .pb-avatar{border:none;box-shadow:6px 6px 14px #c2c9d2,-6px -6px 14px #ffffff}
/* 摆法：功能块两列大格，居中 */
.pb-wrap[data-skin="neumo"] .pb-main{grid-template-columns:minmax(170px,250px) minmax(0,1fr)}
.pb-wrap[data-skin="neumo"] .pb-grid{grid-template-columns:repeat(2,1fr);gap:20px}
.pb-wrap[data-skin="neumo"] .pb-tile{min-height:120px;align-items:center;justify-content:center;text-align:center}

/* ========== 报纸 Newspaper：米白衬线，三栏 ========== */
.pb-wrap[data-skin="news"]{
  --pb-bg:#f7f3e8;
  --pb-card:#fbf8f0;
  --pb-card2:#f2ecdd;
  --pb-overlay:#fbf8f0;
  --pb-line:#d8d0bd;
  --pb-line2:#2a2620;
  --pb-fg:#1c1a16;
  --pb-fg2:#6b6558;
  --pb-accent:#8c2f22;
  --pb-radius:0px;
  --pb-gap:14px;
  --pb-shadow:none;
  --pb-tile:#fbf8f0;
  font-family:Georgia,"Times New Roman","Songti SC",serif;
}
.pb-wrap[data-skin="news"]{
  background-image:radial-gradient(circle at 1px 1px,rgba(90,80,60,.10) 1px,transparent 0),linear-gradient(#f7f3e8,#f2ecdd);
  background-size:16px 16px,100% 100%;
}
.pb-wrap[data-skin="news"] .pb-card{border:1px solid #2a2620;border-top:3px double #1c1a16}
.pb-wrap[data-skin="news"] .pb-card-h{
  border-bottom:2px solid #1c1a16;font-size:11px;letter-spacing:3px;text-transform:uppercase}
.pb-wrap[data-skin="news"] .pb-card-h::before{width:0}
/* 三栏排 */
.pb-wrap[data-skin="news"] .pb-main{grid-template-columns:minmax(160px,230px) minmax(0,1fr)}
.pb-wrap[data-skin="news"] .pb-grid{grid-template-columns:repeat(3,1fr);gap:0 20px}
.pb-wrap[data-skin="news"] .pb-tile{
  border:none;border-bottom:1px dotted #8b8474;border-radius:0;background:transparent;
  min-height:auto;padding:10px 0;box-shadow:none}
.pb-wrap[data-skin="news"] .pb-tile .t{font-size:15px;font-weight:700;line-height:1.3}
.pb-wrap[data-skin="news"] .pb-tile .s{font-size:11px;font-style:italic;margin-top:4px}
.pb-wrap[data-skin="news"] .pb-tile:hover{background:rgba(140,47,34,.05);transform:none}
.pb-wrap[data-skin="news"] .pb-title{font-size:34px;line-height:.95;letter-spacing:-1px}
.pb-wrap[data-skin="news"] .pb-avatar{border:1px solid #1c1a16;border-radius:0;filter:grayscale(1)}

/* ========== 像素 Pixel：硬边、点阵、小格 ========== */
.pb-wrap[data-skin="pixel"]{
  --pb-bg:#141225;
  --pb-card:#221f3d;
  --pb-card2:#2b2748;
  --pb-overlay:#1a1730;
  --pb-line:#3d3768;
  --pb-line2:#6b5fd0;
  --pb-fg:#eae6ff;
  --pb-fg2:#9a8fd6;
  --pb-accent:#ffe14d;
  --pb-radius:0px;
  --pb-gap:10px;
  --pb-shadow:4px 4px 0 #0b0a14;
  --pb-tile:#2b2748;
  font-family:"Courier New",monospace;
  image-rendering:pixelated;
}
.pb-wrap[data-skin="pixel"]{
  background-image:
    linear-gradient(45deg,rgba(107,95,208,.10) 25%,transparent 25%,transparent 75%,rgba(107,95,208,.10) 75%),
    linear-gradient(45deg,rgba(107,95,208,.10) 25%,transparent 25%,transparent 75%,rgba(107,95,208,.10) 75%),
    linear-gradient(#141225,#141225);
  background-size:8px 8px,8px 8px,100% 100%;
  background-position:0 0,4px 4px,0 0;
}
/* 硬边阴影 = 像素块 */
.pb-wrap[data-skin="pixel"] .pb-card{box-shadow:5px 5px 0 #0b0a14}
.pb-wrap[data-skin="pixel"] .pb-tile{box-shadow:4px 4px 0 #0b0a14;border-width:2px}
.pb-wrap[data-skin="pixel"] .pb-tile:hover{box-shadow:2px 2px 0 #0b0a14;transform:translate(2px,2px)}
.pb-wrap[data-skin="pixel"] .pb-btn{box-shadow:4px 4px 0 #0b0a14}
.pb-wrap[data-skin="pixel"] .pb-btn:active{box-shadow:1px 1px 0 #0b0a14;transform:translate(3px,3px)}
.pb-wrap[data-skin="pixel"] .pb-cell{box-shadow:3px 3px 0 #0b0a14}
.pb-wrap[data-skin="pixel"] .pb-avatar{border-width:3px;box-shadow:4px 4px 0 #0b0a14}
.pb-wrap[data-skin="pixel"] .pb-card-h::before{width:6px;height:6px;border-radius:0;background:var(--pb-accent)}
/* 摆法：功能块排成紧密小格，字小 */
.pb-wrap[data-skin="pixel"] .pb-main{grid-template-columns:minmax(150px,220px) minmax(0,1fr)}
.pb-wrap[data-skin="pixel"] .pb-grid{grid-template-columns:repeat(auto-fill,minmax(min(130px,100%),1fr));gap:10px}
.pb-wrap[data-skin="pixel"] .pb-tile{min-height:76px;padding:10px}
.pb-wrap[data-skin="pixel"] .pb-tile .t{font-size:12.5px;letter-spacing:.5px}
.pb-wrap[data-skin="pixel"] .pb-tile .s{font-size:10px}


/* ========== 气泡 Bubble：白底粉边，QQ 气泡那种 ========== */
.pb-wrap[data-skin="bubble"]{
  --pb-bg:#fff2f8;
  --pb-card:#ffffff;
  --pb-card2:#fff6fa;
  --pb-overlay:#ffffff;
  --pb-line:#ffdde9;
  --pb-line2:#ffb8d2;
  --pb-fg:#4a2b3a;
  --pb-fg2:#a87b8d;
  --pb-accent:#ff6fa5;
  --pb-radius:20px;
  --pb-gap:16px;
  --pb-shadow:0 6px 0 #ffd7e6,0 10px 24px rgba(255,111,165,.14);
  --pb-tile:#ffffff;
}
.pb-wrap[data-skin="bubble"]{
  background-image:
    radial-gradient(circle at 12% 18%,rgba(255,190,215,.55) 0 3px,transparent 3px),
    radial-gradient(circle at 78% 62%,rgba(255,215,230,.7) 0 4px,transparent 4px),
    radial-gradient(circle at 46% 86%,rgba(255,175,205,.45) 0 2px,transparent 2px),
    linear-gradient(160deg,#fff2f8,#ffe9f3);
  background-size:120px 120px,160px 160px,90px 90px,100% 100%;
}
/* 卡片：白底 + 粉描边 + 下方厚阴影，像贴纸 */
.pb-wrap[data-skin="bubble"] .pb-card{
  border:3px solid var(--pb-line2);
  box-shadow:0 6px 0 #ffd7e6,0 12px 26px rgba(255,111,165,.12);
  position:relative;
}
/* 每个卡片左上角一颗小星的装饰 */
.pb-wrap[data-skin="bubble"] .pb-card::before{
  content:"";position:absolute;top:-9px;left:14px;width:14px;height:14px;
  background:var(--pb-accent);border-radius:3px;transform:rotate(45deg);
  box-shadow:0 0 0 3px #fff;
}
/* 功能块也是气泡，带小尾巴 */
.pb-wrap[data-skin="bubble"] .pb-tile{
  border:3px double var(--pb-line2);
  box-shadow:0 4px 0 #ffd7e6;
  border-radius:18px 18px 18px 6px;
  position:relative;
  /* 四角各一颗小点，像贴纸的钉角 */
  background-image:
    radial-gradient(circle at 9px 9px,var(--pb-accent) 2.2px,transparent 2.6px),
    radial-gradient(circle at calc(100% - 9px) 9px,var(--pb-accent) 2.2px,transparent 2.6px),
    radial-gradient(circle at 9px calc(100% - 9px),var(--pb-accent) 2.2px,transparent 2.6px),
    radial-gradient(circle at calc(100% - 9px) calc(100% - 9px),var(--pb-accent) 2.2px,transparent 2.6px);
  background-repeat:no-repeat;
}
/* 左下小尾巴 */
.pb-wrap[data-skin="bubble"] .pb-tile::after{
  content:"";position:absolute;left:14px;bottom:-9px;width:12px;height:12px;
  background:#fff;border-right:2.5px solid var(--pb-line2);border-bottom:2.5px solid var(--pb-line2);
  transform:rotate(45deg) skew(-6deg,-6deg);border-radius:0 0 3px 0;
}
.pb-wrap[data-skin="bubble"] .pb-tile:hover{
  transform:translateY(-2px);
  box-shadow:0 6px 0 #ffd7e6,0 10px 22px rgba(255,111,165,.20);
  border-color:var(--pb-accent);
}
.pb-wrap[data-skin="bubble"] .pb-btn{
  border:2.5px solid var(--pb-line2);border-radius:999px;box-shadow:0 4px 0 #ffd7e6;
}
.pb-wrap[data-skin="bubble"] .pb-btn:active{transform:translateY(3px);box-shadow:0 1px 0 #ffd7e6}
.pb-wrap[data-skin="bubble"] .pb-avatar{
  border:3px solid var(--pb-line2);border-radius:26px;box-shadow:0 4px 0 #ffd7e6;
}
.pb-wrap[data-skin="bubble"] .pb-card-h{border-bottom:2px dashed var(--pb-line2);color:var(--pb-accent)}
.pb-wrap[data-skin="bubble"] .pb-cell{
  border:2px solid var(--pb-line);border-radius:14px;box-shadow:0 3px 0 #ffe7f0;
}
.pb-wrap[data-skin="bubble"] .pb-item{
  border:2px solid var(--pb-line);border-radius:14px;box-shadow:0 3px 0 #ffe7f0;
}
/* 摆法：功能块两列，圆润 */
.pb-wrap[data-skin="bubble"] .pb-main{grid-template-columns:minmax(170px,250px) minmax(0,1fr)}
.pb-wrap[data-skin="bubble"] .pb-grid{grid-template-columns:repeat(auto-fill,minmax(min(180px,100%),1fr));gap:18px}
.pb-wrap[data-skin="bubble"] .pb-tile{min-height:96px}


/* --- 功能块四角装饰点（各皮肤用自己的强调色） --- */
.pb-wrap[data-skin="soft"] .pb-tile{
  background-image:
    radial-gradient(circle at 8px 8px,var(--pb-accent) 1.8px,transparent 2.2px),
    radial-gradient(circle at calc(100% - 8px) 8px,var(--pb-accent) 1.8px,transparent 2.2px),
    radial-gradient(circle at 8px calc(100% - 8px),var(--pb-accent) 1.8px,transparent 2.2px),
    radial-gradient(circle at calc(100% - 8px) calc(100% - 8px),var(--pb-accent) 1.8px,transparent 2.2px);
  background-repeat:no-repeat;
}
.pb-wrap[data-skin="tech"] .pb-tile{
  background-image:
    radial-gradient(circle at 7px 7px,rgba(64,196,232,.85) 1.8px,transparent 2.2px),
    radial-gradient(circle at calc(100% - 7px) 7px,rgba(64,196,232,.85) 1.8px,transparent 2.2px),
    radial-gradient(circle at 7px calc(100% - 7px),rgba(64,196,232,.85) 1.8px,transparent 2.2px),
    radial-gradient(circle at calc(100% - 7px) calc(100% - 7px),rgba(64,196,232,.85) 1.8px,transparent 2.2px);
  background-repeat:no-repeat;
}
.pb-wrap[data-skin="glass"] .pb-tile{
  background-image:
    radial-gradient(circle at 9px 9px,rgba(255,255,255,.55) 1.6px,transparent 2px),
    radial-gradient(circle at calc(100% - 9px) 9px,rgba(255,255,255,.55) 1.6px,transparent 2px),
    radial-gradient(circle at 9px calc(100% - 9px),rgba(255,255,255,.55) 1.6px,transparent 2px),
    radial-gradient(circle at calc(100% - 9px) calc(100% - 9px),rgba(255,255,255,.55) 1.6px,transparent 2px);
  background-repeat:no-repeat;
}
.pb-wrap[data-skin="paper"] .pb-tile{background-image:none}


/* --- 深色皮肤的功能块四角点 --- */
.pb-wrap[data-skin="night"] .pb-tile{
  background-image:
    radial-gradient(circle at 8px 8px,rgba(214,180,110,.85) 1.7px,transparent 2.1px),
    radial-gradient(circle at calc(100% - 8px) 8px,rgba(214,180,110,.85) 1.7px,transparent 2.1px),
    radial-gradient(circle at 8px calc(100% - 8px),rgba(214,180,110,.85) 1.7px,transparent 2.1px),
    radial-gradient(circle at calc(100% - 8px) calc(100% - 8px),rgba(214,180,110,.85) 1.7px,transparent 2.1px);
  background-repeat:no-repeat;
}
.pb-wrap[data-skin="neon"] .pb-tile{
  background-image:
    radial-gradient(circle at 8px 8px,rgba(255,60,172,.9) 1.8px,transparent 2.2px),
    radial-gradient(circle at calc(100% - 8px) 8px,rgba(0,240,255,.9) 1.8px,transparent 2.2px),
    radial-gradient(circle at 8px calc(100% - 8px),rgba(0,240,255,.9) 1.8px,transparent 2.2px),
    radial-gradient(circle at calc(100% - 8px) calc(100% - 8px),rgba(255,60,172,.9) 1.8px,transparent 2.2px);
  background-repeat:no-repeat;
}
.pb-wrap[data-skin="terminal"] .pb-tile{
  background-image:
    radial-gradient(circle at 6px 50%,rgba(61,255,122,.9) 1.6px,transparent 2px);
  background-repeat:no-repeat;
}
.pb-wrap[data-skin="pixel"] .pb-tile{
  background-image:
    linear-gradient(var(--pb-accent),var(--pb-accent)),
    linear-gradient(var(--pb-accent),var(--pb-accent)),
    linear-gradient(var(--pb-accent),var(--pb-accent)),
    linear-gradient(var(--pb-accent),var(--pb-accent));
  background-size:5px 5px,5px 5px,5px 5px,5px 5px;
  background-position:4px 4px,calc(100% - 4px) 4px,4px calc(100% - 4px),calc(100% - 4px) calc(100% - 4px);
  background-repeat:no-repeat;
}
.pb-wrap[data-skin="neumo"] .pb-tile{background-image:none}
.pb-wrap[data-skin="news"] .pb-tile{background-image:none}

/* 窄窗口：一律堆成一列，功能块自动减列，别把东西裁掉 */

/* ========== 银河 Galaxy：会转的星云盘 ========== */
/* 底下铺两层旋转的东西：
   1) 四条螺旋臂（锥形渐变，慢慢顺时针转）
   2) 一团核心亮雾（反向慢转，让它不呆板）
   内容层 z-index 抬到 1 以上，不被盖住。 */
.pb-wrap[data-skin="galaxy"]{overflow:hidden}
.pb-wrap[data-skin="galaxy"] > *:not(.pb-mask){position:relative;z-index:2}
.pb-wrap[data-skin="galaxy"] > .pb-mask{position:fixed;inset:0;z-index:99}
.pb-wrap[data-skin="galaxy"]::before{
  content:"";position:absolute;left:50%;top:50%;width:220vmax;height:220vmax;
  margin-left:-110vmax;margin-top:-110vmax;pointer-events:none;z-index:0;
  border-radius:50%;
  background:
    repeating-conic-gradient(from 0deg at 50% 50%,
      rgba(150,120,255,.14) 0deg 9deg,
      rgba(150,120,255,.05) 9deg 22deg,
      transparent 22deg 88deg,
      rgba(90,200,255,.11) 88deg 97deg,
      rgba(90,200,255,.04) 97deg 110deg,
      transparent 110deg 178deg,
      rgba(255,110,200,.10) 178deg 187deg,
      transparent 187deg 268deg,
      rgba(120,255,220,.08) 268deg 277deg,
      transparent 277deg 360deg);
  filter:blur(28px);
  animation:pb-galaxy-spin 140s linear infinite;
  opacity:.85;
}
.pb-wrap[data-skin="galaxy"]::after{
  content:"";position:absolute;left:50%;top:50%;width:120vmax;height:120vmax;
  margin-left:-60vmax;margin-top:-60vmax;pointer-events:none;z-index:1;
  border-radius:50%;
  background:radial-gradient(circle at 50% 50%,
    rgba(200,190,255,.16) 0%,
    rgba(140,120,255,.10) 12%,
    rgba(80,90,200,.05) 28%,
    transparent 55%);
  filter:blur(18px);
  animation:pb-galaxy-spin-rev 90s linear infinite;
}
@keyframes pb-galaxy-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes pb-galaxy-spin-rev{from{transform:rotate(0deg)}to{transform:rotate(-360deg)}}
.pb-wrap[data-skin="galaxy"]{
  --pb-bg:#05060f;
  --pb-card:rgba(18,20,42,.62);
  --pb-card2:rgba(28,30,58,.72);
  --pb-overlay:#0b0d1e;
  --pb-line:rgba(140,150,255,.18);
  --pb-line2:rgba(140,150,255,.40);
  --pb-fg:#e6e9ff;
  --pb-fg2:#8f96c8;
  --pb-accent:#8f9bff;
  --pb-radius:16px;
  --pb-gap:14px;
  --pb-shadow:0 8px 32px rgba(4,6,20,.6);
  --pb-tile:rgba(22,24,50,.55);
  --pb-blur:blur(10px) saturate(130%);
}
.pb-wrap[data-skin="galaxy"]{
  background-color:#05060f;
  background-image:
    url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'><g fill='%23ffffff'><circle cx='12' cy='30' r='1.1' opacity='.85'/><circle cx='58' cy='12' r='.7' opacity='.6'/><circle cx='95' cy='48' r='1.3' opacity='.95'/><circle cx='140' cy='26' r='.8' opacity='.65'/><circle cx='30' cy='88' r='.9' opacity='.75'/><circle cx='78' cy='104' r='1.2' opacity='.9'/><circle cx='122' cy='92' r='.6' opacity='.55'/><circle cx='150' cy='128' r='1' opacity='.8'/><circle cx='44' cy='142' r='.7' opacity='.6'/><circle cx='104' cy='150' r='.9' opacity='.7'/></g></svg>"),
    radial-gradient(600px 400px at 20% 15%,rgba(120,90,255,.28),transparent 65%),
    radial-gradient(700px 500px at 80% 70%,rgba(60,180,255,.20),transparent 65%),
    radial-gradient(500px 400px at 50% 100%,rgba(255,90,180,.16),transparent 70%),
    radial-gradient(900px 700px at 60% 40%,#0e1030 0%,#070814 55%,#03040a 100%);
  background-size:160px 160px,100% 100%,100% 100%,100% 100%,100% 100%;
  background-repeat:repeat,no-repeat,no-repeat,no-repeat,no-repeat;
}
.pb-wrap[data-skin="galaxy"] .pb-card{border-width:1px;background-color:rgba(14,16,34,.55)}
.pb-wrap[data-skin="galaxy"] .pb-tile{border-width:1px}
.pb-wrap[data-skin="galaxy"] .pb-tile:hover{
  border-color:rgba(160,170,255,.7);
  box-shadow:0 0 28px rgba(140,155,255,.30),0 8px 32px rgba(4,6,20,.5);
}
.pb-wrap[data-skin="galaxy"] .pb-avatar{
  border-radius:999px;
  box-shadow:0 0 30px rgba(140,155,255,.35),inset 0 0 24px rgba(140,155,255,.18);
}
.pb-wrap[data-skin="galaxy"] .pb-card-h{color:#b6bdff}
.pb-wrap[data-skin="galaxy"] .pb-main{grid-template-columns:minmax(200px,280px) minmax(0,1fr)}
.pb-wrap[data-skin="galaxy"] .pb-grid{grid-template-columns:repeat(auto-fill,minmax(min(230px,100%),1fr))}
.pb-wrap[data-skin="galaxy"] .pb-tile{min-height:110px}

/* ========== 炫彩 Iridescent ========== */
.pb-wrap[data-skin="irid"]{
  --pb-bg:#0c0a18;
  --pb-card:rgba(24,20,42,.80);
  --pb-card2:rgba(36,30,60,.86);
  --pb-overlay:#16121f;
  --pb-line:rgba(255,255,255,.14);
  --pb-line2:rgba(255,255,255,.30);
  --pb-fg:#f4f1ff;
  --pb-fg2:#a99fc4;
  --pb-accent:#c77dff;
  --pb-radius:18px;
  --pb-gap:14px;
  --pb-shadow:0 8px 30px rgba(0,0,0,.45);
  --pb-tile:rgba(30,26,50,.72);
}
.pb-wrap[data-skin="irid"]{
  background:linear-gradient(120deg,#2b1055,#7597de,#ff6ec7,#ffd76e,#7cf7c4,#2b1055);
  background-size:400% 400%;
  animation:pb-irid 18s ease infinite;
}
@keyframes pb-irid{
  0%{background-position:0% 50%}
  50%{background-position:100% 50%}
  100%{background-position:0% 50%}
}
.pb-wrap[data-skin="irid"] .pb-card{
  backdrop-filter:blur(16px) saturate(160%);
  border:1px solid rgba(255,255,255,.28);
  box-shadow:0 8px 34px rgba(0,0,0,.32),inset 0 1px 0 rgba(255,255,255,.22);
}
.pb-wrap[data-skin="irid"] .pb-tile{
  backdrop-filter:blur(14px) saturate(160%);
  border:1px solid rgba(255,255,255,.26);
}
.pb-wrap[data-skin="irid"] .pb-tile:hover{
  border-color:transparent;
  background-image:linear-gradient(rgba(30,26,50,.86),rgba(30,26,50,.86)),
    linear-gradient(120deg,#ff6ec7,#ffd76e,#7cf7c4,#7597de);
  background-origin:border-box;
  background-clip:padding-box,border-box;
  box-shadow:0 0 26px rgba(255,110,199,.35);
}
.pb-wrap[data-skin="irid"] .pb-avatar{
  border:2px solid rgba(255,255,255,.5);
  border-radius:999px;
  box-shadow:0 0 26px rgba(255,255,255,.30);
}
.pb-wrap[data-skin="irid"] .pb-btn{
  backdrop-filter:blur(14px) saturate(160%);
  border:1px solid rgba(255,255,255,.26);
}
.pb-wrap[data-skin="irid"] .pb-card-h{color:#ffe9ff}
.pb-wrap[data-skin="irid"] .pb-main{max-width:1280px;margin:0 auto;width:100%;padding:20px 24px 12px}
.pb-wrap[data-skin="irid"] .pb-foot{max-width:1280px;margin:0 auto;width:100%;padding:0 24px 18px}
.pb-wrap[data-skin="irid"] .pb-grid{grid-template-columns:repeat(auto-fill,minmax(min(220px,100%),1fr))}

@media (max-width:900px){
  .pb-main,.pb-page{grid-template-columns:1fr !important;grid-template-rows:auto 1fr}
  .pb-col{flex-direction:column}
  .pb-foot{grid-template-columns:1fr 1fr}
  .pb-grid{grid-template-columns:repeat(auto-fill,minmax(min(140px,100%),1fr)) !important}
  .pb-cells{grid-template-columns:repeat(auto-fill,minmax(min(120px,100%),1fr)) !important}
  .pb-title{font-size:24px;padding:12px}
  .pb-card-b.居中{justify-content:flex-start}
}
@media (max-width:560px){
  .pb-grid{grid-template-columns:1fr !important}
  .pb-foot{grid-template-columns:1fr}
  .pb-heart{padding:10px}
  .pb-avatar{width:72px;height:72px}
}
@media (max-height:620px){
  .pb-card-b.居中{justify-content:flex-start}
  .pb-avatar{width:64px;height:64px;margin-bottom:8px}
  .pb-title{font-size:22px}
}
`

    // ---------- 数据 ----------
    function 用数据(间隔 = 5000) {
      const [d, setD] = useState(null)
      const 拉 = useCallback(async () => {
        try {
          const r = await fetch(数据, { cache: 'no-store' })
          setD(await r.json())
        } catch {
          /* 读不到就保持上一次 */
        }
      }, [])
      useEffect(() => {
        let 活 = true
        const t = () => {
          if (活) 拉()
        }
        t()
        const id = setInterval(t, 间隔)
        return () => {
          活 = false
          clearInterval(id)
        }
      }, [拉, 间隔])
      return [d, 拉]
    }

    // ---------- 心电 ----------
    // 一条自己往左扫的波形；快慢跟着 bpm 走，跳一下的那个尖是 R 波。
    function 心电(props) {
      const bpm = Math.max(46, Math.min(150, Number(props.bpm) || 72))
      const 参考 = React.useRef(null)
      const bpm参 = React.useRef(bpm)
      useEffect(() => {
        bpm参.current = bpm
      }, [bpm])

      useEffect(() => {
        const cv = 参考.current
        if (!cv) return
        const ctx = cv.getContext('2d')
        const W = cv.width
        const H = cv.height
        const 基线 = H * 0.62
        const 幅度 = H * 0.34

        // 一个心动周期里的形状：Q 小沉、R 尖、S 再沉、T 缓起
        function 波(t) {
          if (t < 0.06) return 0
          if (t < 0.10) return -0.14
          if (t < 0.14) return 1
          if (t < 0.19) return -0.38
          if (t < 0.24) return 0.05
          if (t < 0.28) return 0.22
          if (t < 0.42) return 0.10
          return 0
        }

        let 相位 = 0
        let 帧 = 0
        let 上一毫秒 = performance.now()

        const 画 = (现在) => {
          帧 = requestAnimationFrame(画)
          const dt = Math.min(64, 现在 - 上一毫秒)
          上一毫秒 = 现在
          // 一秒扫过多少个周期：bpm/60；每帧横跨 2px 左右
          相位 += ((bpm参.current / 60) * dt) / 1000
          相位 %= 1

          ctx.clearRect(0, 0, W, H)
          ctx.beginPath()
          for (let x = 0; x < W; x++) {
            // 左边旧、右边新：最右端就是当前相位
            const t = (相位 + (W - x) / (W * 0.9)) % 1
            const y = 基线 - 波(t) * 幅度
            if (x === 0) ctx.moveTo(x, y)
            else ctx.lineTo(x, y)
          }
          ctx.strokeStyle = 'rgba(255,90,110,0.95)'
          ctx.lineWidth = 1.6
          ctx.lineJoin = 'round'
          ctx.lineCap = 'round'
          ctx.stroke()
        }
        帧 = requestAnimationFrame(画)
        return () => cancelAnimationFrame(帧)
      }, [])

      return h('canvas', {
        ref: 参考,
        width: 200,
        height: 44,
        style: { display: 'block', width: '100%', maxWidth: 200, margin: '0 auto 6px' },
      })
    }

    // 会跳的爱心
    function 爱心(props) {
      const bpm = Math.max(46, Math.min(150, Number(props.bpm) || 72))
      return h(
        'svg',
        {
          width: 26,
          height: 24,
          viewBox: '0 0 26 24',
          style: {
            display: 'inline-block',
            verticalAlign: 'middle',
            transformOrigin: '50% 60%',
            animation: 'pb-beat ' + (60 / bpm).toFixed(3) + 's ease-in-out infinite',
          },
        },
        h('path', {
          d: 'M13 21.5 C5 15.5 1.5 11.6 1.5 7.9 C1.5 4.5 4.1 2 7.4 2 C9.6 2 11.6 3.2 13 5.1 C14.4 3.2 16.4 2 18.6 2 C21.9 2 24.5 4.5 24.5 7.9 C24.5 11.6 21 15.5 13 21.5 Z',
          fill: 'rgba(255,90,110,0.92)',
        }),
      )
    }

    // ---------- 银河星图（记忆模块用） ----------
    function 银河(props) {
      const { points, 高 } = props
      const 挂 = React.useRef(null)
      const [提示, set提示] = useState('正在点亮…')
      // '转' = 整片星云绕中心转；'拖' = 把镜头挪走（像拖地图）
      const [模式, set模式] = useState('转')
      const 模式参考 = React.useRef('转')
      useEffect(() => {
        模式参考.current = 模式
      }, [模式])

      // 面板每 8 秒拉一次数据，points 每次都是新数组。
      // 直接拿它当依赖会让整个场景重建（画面闪、拖动被打断），所以只认 id 串。
      const 点键 = (points || []).map((p) => p.id).join('|')

      useEffect(() => {
        let 活 = true
        let 销毁 = () => {}

        ;(async () => {
          try {
            const THREE = await import('/panel-base/vendor/three.module.js')
            if (!活 || !挂.current) return

            const 有效 = (points || []).filter((p) => p && p.t)
            const 画布高 = 高 || 520

            const 场景 = new THREE.Scene()
            场景.fog = new THREE.FogExp2(0x04070c, 0.00035)

            const 相机 = new THREE.PerspectiveCamera(52, 1, 0.1, 20000)
            相机.position.set(0, 620, 1800)
            相机.lookAt(0, 0, 0)

            const 渲染器 = new THREE.WebGLRenderer({ antialias: true })
            渲染器.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
            渲染器.setClearColor(0x04070c, 1)
            挂.current.appendChild(渲染器.domElement)

            const 贴图 = (() => {
              const c = document.createElement('canvas')
              c.width = c.height = 128
              const g = c.getContext('2d')
              const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64)
              grd.addColorStop(0, 'rgba(255,255,255,1)')
              grd.addColorStop(0.25, 'rgba(255,255,255,0.85)')
              grd.addColorStop(0.6, 'rgba(255,255,255,0.22)')
              grd.addColorStop(1, 'rgba(255,255,255,0)')
              g.fillStyle = grd
              g.fillRect(0, 0, 128, 128)
              return new THREE.CanvasTexture(c)
            })()

            const 类型色 = {
              fact: 0x4dd0e1,
              event: 0x8f7bff,
              promise: 0xffb84d,
              trait: 0x59e08f,
              preference: 0xff7ba8,
              summary: 0x9aa7b0,
            }

            const 星群 = new THREE.Group()
            场景.add(星群)

            if (有效.length) {
              const 起 = Math.min(...有效.map((p) => p.t))
              const 止 = Math.max(...有效.map((p) => p.t))
              const 跨 = Math.max(1, 止 - 起)
              const K = Math.max(0.8, Math.min(3.2, Math.pow(有效.length / 800, 0.62)))

              有效.forEach((p, i) => {
                const t = (p.t - 起) / 跨
                const rr = 0.12 + Math.pow(t, 0.95) * 0.88
                const rad = (140 + rr * 1100) * K
                const arm = i % 4
                const ang = arm * ((Math.PI * 2) / 4) - 2.6 * Math.log(rr * 6 + 1) + (Math.random() - 0.5) * 0.5
                const z = (Math.random() - 0.5) * 108 * K

                const 清晰 = typeof p.clarity === 'number' ? p.clarity : 0.5
                const 尺寸 = (10 + 26 * 清晰) * K * (p.protected ? 1.25 : 1)

                const 材质 = new THREE.SpriteMaterial({
                  map: 贴图,
                  color: 类型色[p.k] || 0x4dd0e1,
                  transparent: true,
                  opacity: 0.28 + 0.55 * 清晰,
                  depthTest: false,
                  depthWrite: false,
                  blending: THREE.AdditiveBlending,
                })
                const 星 = new THREE.Sprite(材质)
                星.position.set(Math.cos(ang) * rad, z, Math.sin(ang) * rad)
                星.scale.set(尺寸, 尺寸, 1)
                星.userData = p
                星群.add(星)
              })

              const 尘 = new THREE.BufferGeometry()
              const 位置 = []
              for (let i = 0; i < 2200; i++) {
                const r = Math.pow(Math.random(), 1.8) * 210
                const th = Math.random() * Math.PI * 2
                const ph = Math.acos(2 * Math.random() - 1)
                位置.push(r * Math.sin(ph) * Math.cos(th), (Math.random() - 0.5) * 90, r * Math.sin(ph) * Math.sin(th))
              }
              尘.setAttribute('position', new THREE.Float32BufferAttribute(位置, 3))
              星群.add(
                new THREE.Points(
                  尘,
                  new THREE.PointsMaterial({
                    color: 0x8fa8bb,
                    size: 2.2,
                    transparent: true,
                    opacity: 0.45,
                    depthWrite: false,
                    blending: THREE.AdditiveBlending,
                  }),
                ),
              )
            }

            let 按住 = false
            let 上X = 0
            let 上Y = 0
            const 转角 = { x: 0.35, y: 0 }
            const 画布 = 渲染器.domElement
            画布.style.display = 'block'
            画布.style.cursor = 'grab'
            画布.style.touchAction = 'none' // 不然触摸板/触屏会把拖动当成滚页面

            const 按下 = (e) => {
              按住 = true
              上X = e.clientX
              上Y = e.clientY
              try {
                画布.setPointerCapture(e.pointerId)
              } catch {
                /* 不支持就算了 */
              }
              画布.style.cursor = 'grabbing'
              e.preventDefault()
            }
            const 移动 = (e) => {
              if (!按住) return
              const dx = e.clientX - 上X
              const dy = e.clientY - 上Y
              上X = e.clientX
              上Y = e.clientY

              if (模式参考.current === '拖') {
                // 平移：把镜头往反方向挪，看起来就是整片跟着手走
                相机.position.x -= dx * 1.8
                相机.position.z += dy * 1.8
                相机.lookAt(0, 0, 0)
              } else {
                转角.x += dy * 0.006
                转角.y += dx * 0.006
              }
              e.preventDefault()
            }
            const 松开 = (e) => {
              按住 = false
              try {
                画布.releasePointerCapture(e.pointerId)
              } catch {
                /* 忽略 */
              }
              画布.style.cursor = 'grab'
            }
            const 滚动 = (e) => {
              e.preventDefault()
              相机.position.z = Math.max(320, Math.min(4200, 相机.position.z + e.deltaY * 1.2))
            }

            画布.addEventListener('pointerdown', 按下)
            window.addEventListener('pointermove', 移动)
            window.addEventListener('pointerup', 松开)
            画布.addEventListener('wheel', 滚动, { passive: false })

            const 尺寸 = () => {
              if (!挂.current) return
              const w = 挂.current.clientWidth || 800
              const h = 挂.current.clientHeight || 画布高
              渲染器.setSize(w, h)
              画布.style.width = '100%'
              画布.style.height = '100%'
              相机.aspect = w / h
              相机.updateProjectionMatrix()
            }
            尺寸()
            const 观察 = new ResizeObserver(尺寸)
            观察.observe(挂.current)

            let 帧 = 0
            let 跑着 = true
            const 转 = () => {
              if (!跑着) return
              帧 = requestAnimationFrame(转)
              if (!按住 && 模式参考.current === '转') 转角.y += 0.0016
              星群.rotation.x = 转角.x
              星群.rotation.y = 转角.y
              渲染器.render(场景, 相机)
            }
            转()
            set提示('')

            销毁 = () => {
              跑着 = false
              cancelAnimationFrame(帧)
              观察.disconnect()
              画布.removeEventListener('pointerdown', 按下)
              window.removeEventListener('pointermove', 移动)
              window.removeEventListener('pointerup', 松开)
              画布.removeEventListener('wheel', 滚动)
              场景.traverse((o) => {
                if (o.material) {
                  if (o.material.map) o.material.map.dispose()
                  o.material.dispose()
                }
                if (o.geometry) o.geometry.dispose()
              })
              渲染器.dispose()
              if (画布.parentNode) 画布.parentNode.removeChild(画布)
            }
          } catch (e) {
            set提示('点不着了：' + String((e && e.message) || e))
          }
        })()

        return () => {
          活 = false
          销毁()
        }
      }, [点键])

      return h(
        'div',
        {
          style: {
            position: 'relative',
            width: '100%',
            height: (高 || 520) + 'px',
            background: '#04070c',
            borderRadius: 12,
            overflow: 'hidden',
            border: '1px solid var(--pb-line)',
          },
        },
        h('div', { ref: 挂, style: { position: 'absolute', inset: 0 } }),
        // 模式切换
        h(
          'div',
          { style: { position: 'absolute', right: 12, top: 12, display: 'flex', gap: 6 } },
          ['转', '拖'].map((m) =>
            h(
              'button',
              {
                key: m,
                onClick: () => set模式(m),
                style: {
                  padding: '4px 12px',
                  fontSize: 12,
                  font: 'inherit',
                  cursor: 'pointer',
                  borderRadius: 8,
                  border: '1px solid ' + (模式 === m ? 'var(--pb-accent)' : 'var(--pb-line2)'),
                  background: 模式 === m ? 'color-mix(in srgb, var(--pb-accent) 18%, transparent)' : 'rgba(0,0,0,.35)',
                  color: 模式 === m ? 'var(--pb-accent)' : 'rgba(200,220,235,.72)',
                },
              },
              模式 === m ? '● ' + m : m,
            ),
          ),
        ),
        提示
          ? h(
              'div',
              {
                style: {
                  position: 'absolute',
                  inset: 0,
                  display: 'grid',
                  placeItems: 'center',
                  color: 'var(--pb-fg2)',
                  fontSize: 12.5,
                  pointerEvents: 'none',
                },
              },
              提示,
            )
          : null,
        h(
          'div',
          {
            style: {
              position: 'absolute',
              left: 14,
              bottom: 10,
              fontSize: 11,
              color: 'var(--pb-fg2)',
              opacity: 0.75,
              pointerEvents: 'none',
            },
          },
          '拖一下转，滚轮远近',
        ),
      )
    }

    // ---------- 主组件 ----------
    function 基座() {
      const [d, 重新拉] = 用数据()
      // 功能块可以带「数据源」，这里按地址去拉活数据，5 秒一次
      const [源数据, set源数据] = useState({})
      const [视, set视] = useState({ 层: 'main', 模块: null, 子: null })
      const [弹, set弹] = useState(null) // 'more' | 'settings'

      const 模块们 = d && Array.isArray(d.模块) ? d.模块 : []
      const 源清单 = [...new Set(模块们.map((m) => m.数据源).filter(Boolean))].join('|')

      useEffect(() => {
        if (!源清单) return
        let 活 = true
        const 拉 = async () => {
          const 地址们 = 源清单.split('|')
          const 新 = {}
          for (const u of 地址们) {
            try {
              const r = await fetch(u, { cache: 'no-store' })
              新[u] = await r.json()
            } catch {
              /* 这个源挂了就保持上一次 */
            }
          }
          if (活 && Object.keys(新).length) set源数据((旧) => ({ ...旧, ...新 }))
        }
        拉()
        const id = setInterval(拉, 5000)
        return () => {
          活 = false
          clearInterval(id)
        }
      }, [源清单])

      if (!d) {
        return h('div', { className: 'pb-wrap' }, h('style', null, CSS), h('div', { className: 'pb-empty' }, '读取中…'))
      }

      const 当前模块 = 视.模块 ? 模块们.find((m) => m.id === 视.模块) : null
      const 当前子 = 当前模块 && 视.子 ? (当前模块.子模块 || []).find((s) => s.id === 视.子) : null

      const 回主页 = () => set视({ 层: 'main', 模块: null, 子: null })

      // 心率：只有模块自己要了才显示（模块里写 心率值，或数据源里带 心率）
      // 没声明的模块不该凭空长出一块心跳——那是「觉醒自我」那栋房子自己的东西
      const 模块源 = 当前模块 && 当前模块.数据源 ? 源数据[当前模块.数据源] : null
      const 有心率 = Number(模块源 && 模块源.心率) || Number(当前模块 && 当前模块.心率值) || 0
      const 当前心率 = 有心率 || 72

      // 模块声明了「开关」的，给一个滑块（走宿主 /panel-base/toggle）
      const 开关钮 =
        当前模块 && 当前模块.开关 && 当前模块.插件
          ? h(
              'button',
              {
                className: 'pb-toggle' + (当前模块.已启用 ? ' on' : ''),
                role: 'switch',
                'aria-checked': 当前模块.已启用 ? 'true' : 'false',
                title: 当前模块.已启用 ? '点一下停用' : '点一下启用',
                onClick: async (e) => {
                  e.stopPropagation()
                  try {
                    const r = await fetch('/panel-base/toggle', {
                      method: 'POST',
                      headers: { 'content-type': 'application/json' },
                      body: JSON.stringify({ 插件: 当前模块.插件, 启用: !当前模块.已启用 }),
                    })
                    const j = await r.json()
                    if (!j.ok) window.alert('没切成：' + (j.说 || j.application || ''))
                  } catch (err) {
                    window.alert('没切成：' + String((err && err.message) || err))
                  }
                },
              },
              h('span', { className: 'knob' }),
            )
          : null

      // ---- 主界面 ----
      const 主界面 = h(
        React.Fragment,
        null,
        h(
          'div',
          { className: 'pb-main' },
          h(
            'div',
            { className: 'pb-col' },
            h(
              'div',
              { className: 'pb-card' },
              h('div', { className: 'pb-card-h' }, '身份'),
              h(
                'div',
                { className: 'pb-card-b 居中' },
                d.设置?.背景
                  ? h('div', { className: 'pb-avatar' }, h('img', { src: d.设置.背景, alt: '' }))
                  : h('div', { className: 'pb-avatar' }, (d.profile.name || '?').slice(0, 1)),
                h('div', null, [
                  h('div', { className: 'pb-row', key: 'n' }, h('span', { className: 'a' }, '姓名'), h('span', { className: 'b' }, d.profile.name || '—')),
                  h('div', { className: 'pb-row', key: 'g' }, h('span', { className: 'a' }, '性别'), h('span', { className: 'b' }, d.profile.gender || '—')),
                  h('div', { className: 'pb-row', key: 'b' }, h('span', { className: 'a' }, '生日'), h('span', { className: 'b' }, d.profile.birthday || '—')),
                ]),
              ),
            ),
            h(
              'div',
              { className: 'pb-card' },
              h('div', { className: 'pb-card-h' }, '工作状态'),
              h(
                'div',
                { className: 'pb-card-b 居中' },
                h('div', null, [
                  h('div', { className: 'pb-row', key: 's' }, h('span', { className: 'a' }, '当前状态'), h('span', { className: 'b' }, d.工作状态?.状态 || '—')),
                  h('div', { className: 'pb-row', key: 'l' }, h('span', { className: 'a' }, '当前负载'), h('span', { className: 'b' }, d.工作状态?.负载 || '—')),
                ]),
              ),
            ),
          ),
          h(
            'div',
            { className: 'pb-card' },
            h('div', { className: 'pb-card-h' }, '功能'),
            h(
              'div',
              { className: 'pb-card-b' },
              模块们.length
                ? h(
                    'div',
                    { className: 'pb-grid' },
                    模块们.slice(0, 6).map((m) =>
                      h(
                        'div',
                        {
                          className: 'pb-tile',
                          key: m.id,
                          onClick: () => set视({ 层: 'module', 模块: m.id, 子: null }),
                        },
                        h('div', { className: 't' }, m.标题 || m.id),
                        h('div', { className: 's' }, m.说明 || (m.子模块?.length ? m.子模块.length + ' 项' : '')),
                      ),
                    ),
                  )
                : h('div', { className: 'pb-empty' }, '还没有功能。往 modules 目录丢一个 JSON 就多一块。'),
            ),
          ),
        ),
        h(
          'div',
          { className: 'pb-foot' },
          h('button', { className: 'pb-btn', onClick: () => set弹('more') }, '更多'),
          h('button', { className: 'pb-btn', onClick: () => set弹('settings') }, '⚙ 设置'),
        ),
      )

      // ---- 模块页 ----
      // 两种布局：默认「标题+心率 / 网格」；模块写了 星图:true 就换成「左图 / 右竖排」
      const 模块页 = 当前模块
        ? 当前模块.星图
          ? h(
              'div',
              { className: 'pb-page', style: { gridTemplateColumns: '1fr 210px' } },
              h(
                'div',
                { className: 'pb-card' },
                h(
                  'div',
                  { className: 'pb-card-h' },
                  h('span', { className: 'pb-back', onClick: 回主页 }, '‹ 返回'),
                  
                  h('span', { style: { marginLeft: 'auto' } }, 当前模块.标题 || ''),
                ),
                h(银河, { points: (模块源 && 模块源.memories && 模块源.memories.points) || [], 高: 9999 }),
              ),
              h(
                'div',
                { className: 'pb-col' },
                (当前模块.子模块 || []).map((s) =>
                  h(
                    'div',
                    {
                      className: 'pb-tile',
                      key: s.id,
                      style: { minHeight: 52, justifyContent: 'center', alignItems: 'center' },
                      onClick: () => set视({ 层: 'sub', 模块: 当前模块.id, 子: s.id }),
                    },
                    h('div', { className: 't', style: { fontSize: 14, textAlign: 'center' } }, s.标题 || s.id),
                  ),
                ),
              ),
            )
          : h(
              React.Fragment,
              null,
              h(
                'div',
                { className: 'pb-page', style: 有心率 ? null : { gridTemplateColumns: '1fr' } },
                // 没心率的模块不占左栏——标题右上角已经有了，再来一个大标题是废话
                有心率
                  ? h(
                      'div',
                      { className: 'pb-card' },
                      h('div', { className: 'pb-title' }, 当前模块.标题 || 当前模块.id),
                      h(
                        'div',
                        { className: 'pb-heart' },
                        h(心电, { bpm: 当前心率 }),
                        h('div', { className: 'n' }, h(爱心, { bpm: 当前心率 }), String(当前心率)),
                        h('div', { className: 'l' }, '心率'),
                      ),
                    )
                  : null,
                h(
                  'div',
                  { className: 'pb-card' },
                  h(
                    'div',
                    { className: 'pb-card-h' },
                    h('span', { className: 'pb-back', onClick: 回主页 }, '‹ 返回'),
                  
                    h('span', { style: { marginLeft: 'auto' } }, 当前模块.标题 || ''),
                  ),
                  h(
                    'div',
                    { className: 'pb-card-b' },
                    // 模块声明了开关的，最上面单独一行
                    开关钮
                      ? h(
                          'div',
                          { className: 'pb-set-row', style: { marginBottom: 14 } },
                          h('div', { className: 'k' }, '启用', h('small', null, 当前模块.已启用 ? '正在运行' : '已停用')),
                          开关钮,
                        )
                      : null,
                    (当前模块.子模块 || []).length
                      ? h(
                          'div',
                          { className: 'pb-grid' },
                          当前模块.子模块.map((s) =>
                            h(
                              'div',
                              {
                                className: 'pb-tile',
                                key: s.id,
                                style: { minHeight: 74 },
                                onClick: () => set视({ 层: 'sub', 模块: 当前模块.id, 子: s.id }),
                              },
                            h('div', { className: 't' }, s.标题 || s.id),
                          ),
                        ),
                      )
                    : h('div', { className: 'pb-empty' }, '这个功能还没分子项。'),
                ),
              ),
            ),
          )
        : null

      // ---- 子模块页 ----
      const 子页 = 当前子
        ? h(
            'div',
            { className: 'pb-sub' },
            h(
              'div',
              { className: 'pb-card', style: { flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 } },
              h(
                'div',
                { className: 'pb-card-h' },
                h('span', { className: 'pb-back', onClick: () => set视({ 层: 'module', 模块: 当前模块.id, 子: null }) }, '‹ 返回'),
                h('span', { style: { marginLeft: 'auto' } }, 当前模块.标题 || ''),
              ),
              h('div', { className: 'pb-sub-h' }, 当前子.标题 || 当前子.id),
              // 子模块可以只写「按类」，那就按记忆类型筛出来列一遍
              当前子.按类
                ? (() => {
                    const 源 = 当前模块.数据源 ? 源数据[当前模块.数据源] : null
                    const 点们 = (源 && 源.memories && 源.memories.points) || []
                    const 命中 =
                      当前子.按类 === 'protected'
                        ? 点们.filter((p) => p.protected)
                        : 点们.filter((p) => p.k === 当前子.按类)
                    return h(
                      'div',
                      { className: 'pb-cells', style: { gridTemplateColumns: '1fr' } },
                      h('div', { className: 'pb-cell' }, h('div', { className: 'n' }, '条数'), h('div', { className: 'v' }, String(命中.length))),
                      命中
                        .slice()
                        .reverse()
                        .slice(0, 40)
                        .map((p, i) =>
                          h(
                            'div',
                            { className: 'pb-cell', key: i, style: { textAlign: 'left' } },
                            h('div', { style: { fontSize: 12.5, lineHeight: 1.55 } }, p.text),
                            h('div', { className: 'n', style: { marginTop: 5 } }, [p.d, p.k, '清晰度 ' + Math.round((p.clarity || 0) * 100)].filter(Boolean).join(' · ')),
                          ),
                        ),
                    )
                  })()
                : (() => {
                    const 源 = 当前模块.数据源 ? 源数据[当前模块.数据源] : null
                    const 字段们 = 当前子.字段 || []
                    const 取值们 = 字段们.map((f) => ({
                      f,
                      值: (() => {
                        const v = 源 ? 取值(源, f.路径) : undefined
                        return v !== undefined && v !== null ? v : f.值
                      })(),
                      是字: f.型 === 'text' || typeof (源 ? 取值(源, f.路径) : f.值) === 'string',
                    }))

                    // 全是一行一个的文字（地址、房间码这种），就排成清单，别铺大方格
                    if (取值们.every((x) => x.是字)) {
                      return h(
                        'div',
                        { className: 'pb-list' },
                        取值们.map((x, i) =>
                          h(
                            'div',
                            { className: 'pb-item', key: i },
                            h('div', { className: 'k' }, x.f.名 || x.f.路径),
                            h(
                              'div',
                              { className: 'v' },
                              String(x.值 ?? '—'),
                              x.f.可复制
                                ? h(
                                    'button',
                                    {
                                      className: 'pb-copy',
                                      onClick: (e) => {
                                        e.stopPropagation()
                                        try {
                                          navigator.clipboard.writeText(String(x.值 ?? ''))
                                        } catch {
                                          /* 剪贴板不给用就算了 */
                                        }
                                      },
                                    },
                                    '复制',
                                  )
                                : null,
                            ),
                          ),
                        ),
                      )
                    }

                    // 有数值的走格子
                    return h(
                      'div',
                      { className: 'pb-cells' },
                      取值们.map((x, i) =>
                        h(
                          'div',
                          { className: 'pb-cell', key: i },
                          h('div', { className: 'n' }, x.f.名 || x.f.路径),
                          h(
                            'div',
                            { className: 'v', style: x.是字 ? { fontSize: 12.5, lineHeight: 1.55, textAlign: 'left' } : null },
                            x.是字 ? String(x.值 ?? '—') : 百分比(x.值) + ' ',
                            x.是字 ? null : h('small', null, '/100'),
                          ),
                        ),
                      ),
                    )
                  })(),
            ),
          )
        : null

      // ---- 弹层 ----
      const 弹层 =
        弹 === 'more'
          ? h(
              'div',
              { className: 'pb-mask', onClick: () => set弹(null) },
              h(
                'div',
                { className: 'pb-modal', onClick: (e) => e.stopPropagation() },
                h('div', { className: 'pb-modal-h' }, h('span', null, '全部功能'), h('button', { onClick: () => set弹(null) }, '×')),
                h(
                  'div',
                  { className: 'pb-modal-b' },
                  模块们.length
                    ? h(
                        'div',
                        { className: 'pb-grid' },
                        模块们.map((m) =>
                          h(
                            'div',
                            {
                              className: 'pb-tile',
                              key: m.id,
                              style: { minHeight: 74 },
                              onClick: () => {
                                set弹(null)
                                set视({ 层: 'module', 模块: m.id, 子: null })
                              },
                            },
                            h('div', { className: 't' }, m.标题 || m.id),
                            h('div', { className: 's' }, m.说明 || m.来源 || ''),
                          ),
                        ),
                      )
                    : h('div', { className: 'pb-empty' }, '还没有功能。'),
                ),
              ),
            )
          : 弹 === 'settings'
            ? h(设置面板, { 设置: d.设置 || {}, 版本: d.version, 关: () => set弹(null), 改完: 重新拉 })
            : null

      return h(
        'div',
        { className: 'pb-wrap', 'data-skin': (d.设置 && d.设置.皮肤) || 'default' },
        h('style', null, CSS),
        视.层 === 'main' ? 主界面 : 视.层 === 'module' ? 模块页 : 子页,
        弹层,
      )
    }

    // ---------- 设置 ----------
    function 设置面板(props) {
      const { 设置, 关, 版本, 改完 } = props
      const [现, set现] = useState(设置)

      const 改 = async (k, v) => {
        const 新 = { ...现, [k]: v }
        set现(新)
        await 存设置({ [k]: v })
        // 立刻让外面重拉一次，皮肤/大小这些才会马上生效
        if (改完) 改完()
      }

      const 行 = (键, 名, 说明, 选项) =>
        h(
          'div',
          { className: 'pb-set-row', key: 键 },
          h('div', { className: 'k' }, 名, 说明 ? h('small', null, 说明) : null),
          h(
            'div',
            { className: 'pb-seg' },
            选项.map(([值, 标签]) =>
              h(
                'button',
                { key: 值, className: 现[键] === 值 ? 'on' : '', onClick: () => 改(键, 值) },
                标签,
              ),
            ),
          ),
        )

      return h(
        'div',
        { className: 'pb-mask', onClick: 关 },
        h(
          'div',
          { className: 'pb-modal', onClick: (e) => e.stopPropagation() },
          h('div', { className: 'pb-modal-h' }, h('span', null, '设置'), h('button', { onClick: 关 }, '×')),
          h(
            'div',
            { className: 'pb-modal-b' },
            h(
              'div',
              { className: 'pb-set-row' },
              h('div', { className: 'k' }, '样式', h('small', null, '十四套皮肤，各是一种界面')),
              h(
                'div',
                { className: 'pb-select' },
                                h(
                  'select',
                  {
                    value: 现.皮肤 || 'default',
                    onChange: (e) => 改('皮肤', e.target.value),
                  },
                  [
                    ['default', '默认'],
                    ['tech', '科技屏'],
                    ['soft', '柔和'],
                    ['glass', '玻璃'],
                    ['night', '暗夜'],
                    ['paper', '纸质'],
                    ['neon', '霓虹'],
                    ['terminal', '终端'],
                    ['neumo', '新拟物'],
                    ['news', '报纸'],
                    ['pixel', '像素'],
                    ['bubble', '气泡'],
                    ['galaxy', '银河'],
                    ['irid', '炫彩'],
                  ].map(([值, 名]) => h('option', { key: 值, value: 值 }, 名)),
                ),
                h('span', { className: 'arrow' }, '⌄'),
              ),
            ),
            行('大小', '大小', '面板整体缩放', [
              ['small', '小'],
              ['medium', '中'],
              ['large', '大'],
            ]),
            行('打开方式', '打开方式', '点开时怎么出现', [
              ['panel', '占一整页'],
              ['float', '浮窗'],
            ]),
            行('语言', '语言', '界面文字', [
              ['zh', '中文'],
              ['en', 'English'],
            ]),
            h(
              'div',
              { className: 'pb-set-row' },
              h(
                'div',
                { className: 'k' },
                '自定义背景',
                h('small', null, '填一个图片地址，头像框会用它；留空就用名字第一个字'),
              ),
              h('input', {
                defaultValue: 现.背景 || '',
                placeholder: 'https://…',
                style: {
                  width: 220,
                  font: 'inherit',
                  fontSize: 12,
                  padding: '5px 9px',
                  borderRadius: 8,
                  border: '1px solid var(--pb-line2)',
                  background: 'var(--pb-card2)',
                  color: 'var(--pb-fg)',
                  outline: 'none',
                },
                onBlur: (e) => 改('背景', e.target.value.trim()),
              }),
            ),
            h(
              'div',
              { className: 'pb-set-row' },
              h('div', { className: 'k' }, '版本'),
              h('div', { className: 'k', style: { color: 'var(--pb-fg2)' } }, 'v' + (版本 || '?')),
            ),
          ),
        ),
      )
    }

    function 图标() {
      return h(
        'div',
        {
          title: '控制台',
          style: {
            width: 32, height: 32, borderRadius: 8, display: 'grid', placeItems: 'center',
            cursor: 'pointer', fontSize: 15,
            border: '1px solid var(--pb-line2)',
            color: 'var(--pb-accent)',
          },
        },
        '▦',
      )
    }

    return {
      inject: ['slots', 'layout'],
      apply(ctx) {
        const 切过去 = () => {
          try {
            ctx.layout.selectPanel('panel-base')
          } catch {
            /* 没注册上时点不动 */
          }
        }

        ctx.slots.inject('sidebar.panellist', () =>
          ctx.slots.register(
            { name: 'sidebar.panellist', id: 'panel-base', order: 60, label: '控制台' },
            () => h('div', { onClick: 切过去, style: { display: 'inline-block' } }, h(图标, null)),
          ),
        )

        ctx.slots.inject('main', () => ctx.slots.register({ name: 'main', key: 'panel-base' }, 基座))
      },
    }
  },
})
