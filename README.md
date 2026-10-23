# 来不及爱你

影片与创作手记。中文 `/laibuji-aini/`，英文 `/laibuji-aini/en/`，完整制作记录 `/laibuji-aini/archive/`。

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

## 替换影片

**手机压缩版已上传（2026-10-23）**：用户提供的 [`media/film-mobile.mp4`](media/film-mobile.mp4)（约48.7MiB，H.264，仍为3840×2160）与 [`assets/poster-mobile.jpg`](assets/poster-mobile.jpg)。供 Claude Code 接手继续使用，路径、用途和哈希见 [手机压缩版交接](docs/mobile-video-handoff.md)；根目录 `CLAUDE.md` 也有入口。这次仅增加素材，以下当前播放器配置保持不变。

网页只引用 `media/film-original.mp4`。当前文件是创作者提供文件的逐字节副本，没有转码、调色、剪切或无损重封装。3840×2160、24fps、57.087s、H.264/AAC，102,796,406 bytes（约98.03MiB）。这是用户后续亲自提供的 H.264 版本，替换了最初 HEVC 文件；本站未转码。播放失败时给出下载入口。

以后替换同名文件即可切换视频；如果剪辑变动，必须重新核对 `src/content.mjs` 的时间码和 `src/media-manifest.json`，重新抽取封面、静帧并生成描述。不要仅改扩展名来冒充格式转换，也不要把生成源素材 720P 与 4K 导出规格混同。

通过 Git 推送单文件上限 100 MiB，浏览器上传上限 25 MiB。GitHub Pages 不提供 Git LFS 文件内容。当前原片可直接用 Git 推送；播放器 `preload=none`，用户播放前不下载影片。

## 来源与许可

创作事实来自创作者 2026-10-23 提供的完整档案 v3.1。文字标明成片可见、制作史与编辑观察；导演原话按附录 B/C 保留。两款公开方法分别链接其官方 GitHub，不复制第三方技能全文、不归因其为本片导演。

创作者已在本次建站会话中确认该录音随影片公开传播的许可，并授权公开网站。音乐录音版本尚待补充；不公开歌词、不宣称音乐版权归本站。影片与图片、文字无默认开源授权；转载请联系创作者。代码未经另行许可不默认采用第三方技能的许可证。

验证与回滚见 `docs/verification.md`、`AGENTS.md`。
