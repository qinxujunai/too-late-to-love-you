# 来不及爱你 · Too Late to Love You

秦徐俊导演的 AI 短片和它的网站：https://qinxujunai.github.io/too-late-to-love-you/
中文首页，英文 `/en/`，完整制作记录 `/archive/`（中文）。规则、页面结构和每一版的改动见 [AGENTS.md](AGENTS.md)。

纯静态网站，系统字体，浅色和深色。首屏就是影片本身（一个播放器），下面是为什么拍、七段画面怎么做出来的、这部片子用到的影视常识、工具、结尾和影片资料。

## 修改与构建

- `src/content.mjs`：中英两份页面文字、七段制作卡片（`shots`）、影视常识（`axis`、`craft`）。
- `src/archive.md`：完整制作记录。
- `assets/site.css`、`assets/site.js`：样式和交互（主题、播放与备用地址、跳到某一秒、轮播、越轴示意图的机位切换），构建时都内联进页面。
- `scripts/build.mjs`：生成中文、英文、制作记录三页，以及描述字幕（VTT）、sitemap 和 `hosts.json`。
- `src/hosts.json`：影片放在哪（两套方案、当前用哪套、文件指纹）。
- `copy.lock.json`：文案锁定。页面上看得见的字都在这里，改字要他同意，同意后 `npm run lock`。

```sh
npm install          # 只有 axe-core（浏览器验收用）
npm run build
npm run check        # 结构、本地引用、影片地址与 hosts.json、文案锁定、推送脚本
npm run serve        # http://127.0.0.1:4174/（支持 Range，可以跳到某一秒）
npm run qa           # 浏览器验收，见下
npm run ship -- "改了什么"   # 构建、检查、浏览器验收、以他的名义提交、推送；任何一步失败就停下
npm run host -- tencent      # 换影片放在哪（或 cloudflare），两个网站一起换
```

需要 Node 22+ 和 Playwright（`require('playwright')`）。浏览器依次找 `CHROME_PATH`、云端的 `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`、Windows 的 Chrome，都没有就用 Playwright 自带的。`FILM_BASE` 可以改测线上地址。

`npm run qa` 测的是：中文、英文、制作记录 × 手机、电脑 × 浅色、深色；点播放前不下载视频、只请求本站资源、没有报错、没有横向滚动、axe 无障碍检查、主题切换、点播放在原地播放且先请求当前这套；每张卡片和「从 0:12 看」都跳到对应的秒数（用 `scripts/fixtures/seek.webm` 这段 60 秒的合成测试画面，不是影片）；关掉 JS 时视频和卡片都在；两个云上都是这个文件（大小、MD5），下载地址回 `attachment`。浏览器不能解码 H.264 时（云端就是这样），影片本身的播放记为「未测」，不算通过；真机和微信只能在手机上看。

`scripts/test-player.cjs` 测播放器的备用规则：地址报错、一直不回、播到一半断掉，要换另一套并从同一秒接着放；正常的、慢的、卡住的、只给文件头的都不能换；两套都坏时显示提示（用 `scripts/fixtures/clip.webm` 合成测试画面）。

## 影片放在哪

- 只有一个文件：他导出的 4K 网页版（51,065,030 bytes），不转码、不重封装、不压缩。放在腾讯云上海和 Cloudflare R2 两处，本仓库不放。
- 两套方案一次用一套（现在是腾讯云）。唯一的设置是 `src/hosts.json`：本站构建时读它，并发布 `hosts.json` 给个人网站读，两个网站总是用同一套。
- 换方案：`npm run host -- cloudflare` 或 `npm run host -- tencent`，一条命令两个网站一起换。
- 另一套只在当前这套完全打不开时顶上（报错，或点播放 10 秒连文件头都没拿到），慢、卡都不换。地址写在 `<video src>` 上（微信安卓内核只读 `src`）。「下载影片」跟着当前这套。
- `preload="none"`：点播放之前不下载影片。视频是本站唯一的外部请求。
- 两个云的设置、换文件、费用：个人网站仓库的 `docs/film-hosting.md`。

## 来源与许可

创作事实来自创作者 2026-10-23 提供的完整档案；导演原话逐字保留，省略处用「……」。DirectorSKILL 和 seedance2-skill 只链接到它们的 GitHub，不复制内容。

创作者已确认配乐录音随影片公开传播；录音版本尚待补充，不公开歌词，也不宣称音乐版权归本站。影片、图片和文字没有默认的开源许可，转载请联系创作者。

规则和每一版的改动见 `AGENTS.md`。
