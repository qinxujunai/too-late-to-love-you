# 来不及爱你 · Too Late to Love You

秦徐俊导演的 AI 短片和它的网站：https://qinxujunai.github.io/too-late-to-love-you/
中文首页，英文 `/en/`，完整制作记录 `/archive/`（中文）。规则、页面结构和每一版的改动见 [AGENTS.md](AGENTS.md)。

纯静态网站，系统字体，浅色和深色。首屏就是影片本身（一个播放器），下面是为什么拍、七段画面怎么做出来的、这部片子用到的影视常识、工具、结尾和影片资料。

## 修改与构建

- `src/content.mjs`：中英两份页面文字、七段制作卡片（`shots`）、影视常识（`axis`、`craft`）。
- `src/archive.md`：完整制作记录。
- `assets/site.css`、`assets/site.js`：样式和交互（主题、播放与备用地址、跳到某一秒、轮播、越轴示意图的机位切换），构建时都内联进页面。
- `scripts/build.mjs`：生成中文、英文、制作记录三页，以及描述字幕（VTT）和 sitemap。
- `copy.lock.json`：文案锁定。页面上看得见的字都在这里，改字要他同意，同意后 `npm run lock`。

```sh
npm install          # 只有 axe-core（浏览器验收用）
npm run build
npm run check        # 结构、本地引用、影片文件哈希、文案锁定、推送脚本
npm run serve        # http://127.0.0.1:4174/（支持 Range，可以跳到某一秒）
npm run qa           # 浏览器验收，见下
npm run ship -- "改了什么"   # 构建、检查、浏览器验收、以他的名义提交、推送；任何一步失败就停下
```

需要 Node 22+ 和 Playwright（`require('playwright')`）。浏览器依次找 `CHROME_PATH`、云端的 `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`、Windows 的 Chrome，都没有就用 Playwright 自带的。`FILM_BASE` 可以改测线上地址。

`npm run qa` 测的是：中文、英文、制作记录 × 手机、电脑 × 浅色、深色；点播放前不下载视频、只请求本站资源、没有报错、没有横向滚动、axe 无障碍检查、主题切换、点播放在原地播放且先请求 Cloudflare；每张卡片和「从 0:12 看」都跳到对应的秒数（用 `scripts/fixtures/seek.webm` 这段 60 秒的合成测试画面，不是影片）；关掉 JS 时视频和卡片都在；三个影片地址都支持 Range。浏览器不能解码 H.264 时（云端就是这样），影片本身的播放记为「未测」，不算通过；真机和微信只能在手机上看。

`scripts/test-player.cjs` 测播放器的备用地址：地址报错、一直不回、只给了片子信息没有画面、播到一半卡住，都要换下一个地址并从同一秒接着放；正常的、慢但稳定的地址不能被换掉（用 `scripts/fixtures/clip.webm` 合成测试画面）。

## 影片文件

- 只有一个文件：他导出的 4K 网页版（51,065,030 bytes），不转码、不重封装、不压缩。哈希在 `src/mobile-media-manifest.json`，`npm run check` 会核对。
- 播放顺序：Cloudflare R2 → 腾讯云上海 → 本仓库的 `media/film-mobile.mp4`，三处是同一个文件。地址直接写在 `<video src>` 上（微信安卓内核只读 `src`），备用由脚本完成。「下载影片」指向腾讯云。
- 视频是本站唯一的外部请求，只在点播放之后发生。为什么放在这两处、怎么换文件，见个人网站仓库的 `docs/film-hosting.md`。
- `preload="none"`：点播放之前不下载影片。

## 来源与许可

创作事实来自创作者 2026-10-23 提供的完整档案；导演原话逐字保留，省略处用「……」。DirectorSKILL 和 seedance2-skill 只链接到它们的 GitHub，不复制内容。

创作者已确认配乐录音随影片公开传播；录音版本尚待补充，不公开歌词，也不宣称音乐版权归本站。影片、图片和文字没有默认的开源许可，转载请联系创作者。

验证与回滚见 `docs/verification.md`、`AGENTS.md`。
