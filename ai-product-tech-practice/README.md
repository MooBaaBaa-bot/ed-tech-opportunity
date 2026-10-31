# AI 产品技术实践

独立、无构建依赖的静态栏目。公开课程数据与个人记录分离；不请求模型 API、不上传答案、不连接 Notion、不包含调度器。

## 本地运行与检查

在仓库根目录运行 `python3 -m http.server 8768`，打开 `http://localhost:8768/ai-product-tech-practice/`。不要以 file:// 打开，课程通过 fetch 读取 JSON。

```sh
node --check ai-product-tech-practice/app.js
node --check ai-product-tech-practice/core.js
node ai-product-tech-practice/tests/validate.cjs
```

首批发布 01–03，共 36 个稳定课次，其他 33 节仅有规划。日期采用交付日 2026-11-01（Asia/Shanghai）。网页不展示构建时间作为内容发布时间。课程阶段与自然周无绑定。

## 内容组织与更新

- `data/catalog.json`：36 课元数据和当前正文版本路径；计划状态含目标、用时、产物，其正文模块为 null。
- `data/lessons/aptl-01.v1.0.0.json` 等：不可变已发布快照。正文含 concept、caseStudy、practice、quiz 和 sources。
- `core.js`：内容与备份校验、完成条件、复习、冲突合并纯逻辑。
- `app.js`：视图、表单、存储、异常状态；`style.css`：独立样式；`index.html`：入口。

补充下一课：以已有 JSON 的字段结构作参考，独立撰写对应教学内容，不复制案例充数。核查每条官方来源的具体段落、功能与适用边界，记录 title/publisher/url/verifiedAt；官方未给出准确发布日期就填 null。用短任务验证练习确实可完成，并标明模拟或真实工具。

```sh
node ai-product-tech-practice/scripts/add-lesson.cjs draft.json --dry-run
node ai-product-tech-practice/scripts/add-lesson.cjs draft.json
node ai-product-tech-practice/tests/validate.cjs
```

脚本只在显式调用时写入新版本文件和目录，不推送、不安排时间、不触碰个人记录。重复目标文件会拒绝，保留历史。进程锁防止本地同时写；中断时若留下锁或孤立新文件，应核查后人工恢复，不要直接覆盖旧版。`--dry-run` 只临时创建/删除锁，不改内容。

修订：提高版本号，新增 revisionNote、revisedAt，保留最初 publishedAt；重新核验后更新 verifiedAt。脚本创建新文件，不覆盖旧文件。旧测验按当时 quizSnapshot 与 version 显示；新版需要对应版本的阅读、练习和测验才标记活动完成。不得改写旧测验去套用新答案。

发布校验必须检查 git diff，确认已提交的 `data/lessons/` 文件无修改或删除，只能增加版本文件。内容校验验证字段和日期，不自动证明来源真实性；必须人工核对原文。

## 记录、完成与复习

唯一存储键 `aptl.records.v1`，不读写旧栏目的存储键。输入自动存练习草稿；点击保存确认练习产物。阅读、保存练习、提交测验三个条件构成“本课学习活动完成”，不等于掌握。开放题 self 与两道客观题 score 分开。重答追加 attempts，不删除旧题目和作答。

复习以实际完成或错题提交时间为起点，建议 1 天后；第一次复习后 7 天、第二次后 30 天。第三次后不自动排期，仍可主动标记。开放题“部分”或“需帮助”立即加入复习。复习要求写下本次理解，记录实际时间，不把到期等同已复习。

导出 JSON 或显示文本复制；导入校验结构、ID、答案与分数、日期和大小。以本机整条课程/阶段记录为优先，仅增加缺失条目；冲突明确列出，不静默覆盖。备份保留原文件可供人工对照。不同标签页修改会停止本页写入并提示导出、刷新，避免覆盖。

存储失败时保留内存数据并提示立即导出；已损坏的本地原数据不会覆盖。浏览器本地数据未加密，同源网页并非独立权限域。清理浏览器、无痕窗口或更换域名/设备需要手工备份迁移。勿输入真实师生数据、内部资料或密钥。

## 未来自动化边界

schedule 中 startDate/time/timeZone 为 null，enabled=false。未创建、修改或迁移现有定时任务。未来接入需另行明确开始日期、时区、提醒时间与唯一执行器；执行器只能生成待审课程，先核验、dry-run、检查历史保护，再显式发布。内容发布不能自动把个人课次标为完成。

## 部署与回滚

沿用现有 GitHub Pages main 分支发布方式。仅新增本目录、首页卡片和三个栏目的导航链接；没有框架迁移。部署状态以 Pages 构建和线上文件核验为准。回滚本次提交不清除本地记录；先导出再回滚。其他两仓库仅各增加一个导航链接。

## Emilia 界面保留

开始更新和提交前从仓库根目录运行 `python3 scripts/check_ui.py`。内容发布不得修改 UI 基线、主题、导航、图标与个人记录逻辑；只更新课程/研究数据。用户授权 UI 变更时另行审阅并更新基线。始终基于最新远端 main，不从旧模板重建页面。
