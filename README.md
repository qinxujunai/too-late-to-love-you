# 来不及爱你

影片与创作手记。中文 `/too-late-to-love-you/`，英文 `/too-late-to-love-you/en/`，完整制作记录 `/too-late-to-love-you/archive/`。

零运行时依赖、无外部资源请求的静态网站。系统字体，浅/深色，原生视频与描述文字。片名只使用经确认的中文标题。

## 修改与构建

`src/content.mjs`：双语页面内容、9 段播放时间轴、6 项制作决定。`src/archive.md`：选编的详细制作原文。`assets/site.css` / `assets/site.js`：样式与主题、视频时间码。`scripts/build.mjs` 生成中文、英文、档案页、VTT 与 sitemap。

```sh
npm run build
npm run check
npm run serve
```

本地打开 http://127.0.0.1:4174/。构建和静态检查无需安装依赖，Node 22+。

完整浏览器验证：提供 Playwright 和 axe-core 后运行 `npm run qa`。`FILM_BASE` 设为待测网址；Playwright 模块、axe 脚本和浏览器可通过 `PLAYWRIGHT_MODULE_PATH`、`AXE_SOURCE_PATH`、`CHROME_PATH`、`EDGE_PATH` 指定，默认使用已安装模块与 Windows Chrome/Edge。测试涵盖中英、深浅、390/600/850/1440宽、播放/seek到尾、封面下载几何与axe，截图/JSON写入忽略的 `.qa/`。

## 影片文件

- 播放和下载：只有一个文件 `media/film-mobile.mp4`（他导出的 4K 网页版，约 48.7 MiB）。100MB 的原片 2026-10-24 按他的要求删除。
- 两个文件都是他提供的原件，不转码、不重封装、不压缩。哈希见 `src/media-manifest.json`、`src/mobile-media-manifest.json`，`npm run check` 会核对。
- 以后换片：用同名文件覆盖，再核对 `src/content.mjs` 的时间码、两个 manifest，重新抽静帧（`assets/*.webp`，海报 `key-*`）。

通过 Git 推送单文件上限 100 MiB，浏览器上传上限 25 MiB。GitHub Pages 不提供 Git LFS 文件内容。当前原片可直接用 Git 推送；播放器 `preload=none`，用户播放前不下载影片。

## 来源与许可

创作事实来自创作者 2026-10-23 提供的完整档案 v3.1。文字标明成片可见、制作史与编辑观察；导演原话按附录 B/C 保留。两款公开方法分别链接其官方 GitHub，不复制第三方技能全文、不归因其为本片导演。

创作者已在本次建站会话中确认该录音随影片公开传播的许可，并授权公开网站。音乐录音版本尚待补充；不公开歌词、不宣称音乐版权归本站。影片与图片、文字无默认开源授权；转载请联系创作者。代码未经另行许可不默认采用第三方技能的许可证。

验证与回滚见 `docs/verification.md`、`AGENTS.md`。
