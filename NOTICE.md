# 使用规则与发布者说明

**项目：** dsh-panel-base · 控制台基座
**版本：** 1.0.0
**许可：** MIT

---

## 一、这是什么许可

本项目采用 **MIT License**（全文见 [LICENSE](LICENSE)）。

MIT 是人类法律意义上最宽松的开源许可之一，核心是四条：

1. 你可以**免费使用**，商业用途也行
2. 你可以**修改**，改成什么样都行
3. 你可以**分发**，发给谁、发多少份都行
4. 你**必须保留**原作者的版权声明和许可声明

作为交换，作者**不承担任何责任**：出了问题、数据丢了、电脑炸了，都不关作者的事。

---

## 二、明确不欢迎的事

MIT 在法律上允许倒卖，但**作者在这里明确表达态度**。这不是法律限制，是社区约定；遵守它，你在这个圈子里就还是个体面人。

### 1. 不要倒卖

**不要把本项目（或任何实质性修改版）作为付费商品出售、出租、订阅、打包进收费课程/付费社群/知识星球/membership。**

包括但不限于：
- 挂到淘宝、闲鱼、拼多多、Gumroad 上卖
- 打包进付费课程、付费社群、付费网盘资源
- 承诺「付费咨询/付费部署」但其实只是把本项目的文件发给对方
- 改个名字、换个图标、加两个功能就当成自己的付费产品

**可以收的：** 你投入的**服务时间**。比如帮人装、帮人改、帮人写模块，按工时收费，这没问题。收的是你的劳动，不是这份代码。

### 2. 不要冒充作者

不要声称本项目由你原创开发。你可以在自己项目里用、改、分发，但要说清楚「基于 dsh-panel-base 修改」。

### 3. 不要移除版权声明

`LICENSE` 文件、文件头的作者说明、这份 `NOTICE.md`，分发时都要保留。

### 4. 不要拿去做有害的事

本项目是纯前端 UI 壳，不联网、不收集数据。但它可以被嵌进任何东西里——不要拿它去做恶意用途。

---

## 三、关于「倒卖」的一点解释

有人会问：MIT 明明允许卖，为什么这里说不欢迎？

两件事不冲突：

- **法律上**：MIT 允许你卖，卖了也不违法。
- **道义上**：作者花了时间写这个，选择免费放出来，是希望它被用起来、被改进，而不是被某个中间商包装成商品卖给不知道它免费的人。

你如果真卖了，作者不会去告你（MIT 也告不赢）。但你以后在这个社区里发东西，可能会被人指出来「这不就是那个免费的吗」。自己掂量。

---

## 四、使用者需要注意

### 这不是官方项目

本项目与 DeepSeek 官方无关，不是官方产品。是社区成员自己写的 DSH 插件。

### 会改动你的 DSH 环境

安装后会在你的 DSH profile 里：
- 增加一个依赖项（`dsh-panel-base`）
- 一个 sideBar 图标和一个面板
- 在 `~/.dsh/panel-base/` 下创建设置和模块目录

卸载时会清理依赖和面板，但 `~/.dsh/panel-base/` 下的**设置和你的自定义模块不会自动删除**——这是为了让你重装后不丢配置。要彻底清理请手动删那个目录。

### 不联网

这个插件不发起任何外部网络请求。所有数据都在你本机。

唯一的外部资源是 `vendor/three.module.js`，是**本地文件**，不是 CDN。

### 权限

插件通过 DSH 的 `webServer` 服务在本机注册三个只读/写入路由（`/panel-base/*`），只允许本机访问。它不读你的聊天记录、不读你的文件（除了它自己的 `modules/` 和设置文件）。

---

## 五、给二次开发者的说明

### 你可以

- Fork，改成自己的样子
- 加自己的功能模块（写 JSON 就行）
- 加自己的皮肤（写 CSS 就行）
- 用在自己的产品里
- 发到自己的博客/GitHub 上（注明来源）

### 建议你

- 改完把 `NOTICE.md` 一起带上
- 在你的 README 里写一句「基于 dsh-panel-base」
- 如果做了有意思的模块或皮肤，欢迎回来说一声

### 请不要

- 改成收费产品
- 删掉 LICENSE
- 声称原创

---

## 六、免责

```
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```

用大白话说：**用坏了别找我。**

---

## 七、联系方式

有问题在仓库里开 Issue。

不接受：付费定制、商业合作、倒卖授权。

---

*本规则不构成对 MIT License 的修改或限制。MIT License 的条款优先于本文档中任何与之冲突的表述。本文档的额外请求属于社区礼仪层面的期望，不具有法律约束力。*
