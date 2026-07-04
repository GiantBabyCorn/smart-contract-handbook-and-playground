# Smart Contract Handbook — 優化與擴充總計畫

> 版本 **v2**（已經 3 路 clean-context 審閱並修訂）· 2026-07-04 · branch `development` @ `394c449`
> 審閱結論：12 項程式碼診斷全數證實；修正 4 項事實錯誤（777/875/1400、wstETH、BUIDL、單一來源缺口）、1 項平行化 BLOCKER、12 項規格債
> 完整體檢報告：https://claude.ai/code/artifact/49bfd457-3e29-46c0-816f-2a63df6a97f9

---

## 1. 目標總覽

| # | 目標 | 量化驗收 |
|---|------|----------|
| G1 | 修復所有 P0 | 六語系無原始 i18n key 外洩（e2e 自動）；CI 綠燈；**Phase 0 部署上線** |
| G2 | 模擬資料視覺化更直覺 | 參數驅動真實計算；每步狀態變化可視（StateChangesPanel + 節點徽章 + 初始→最終摘要列）；token 沿邊流動 |
| G3 | Playground 易操作性 | 拖放 + 點擊雙通道；手機可用；分享 URL + 自動存檔；移除合約零殘留 |
| G4 | 收錄 ≥300 個 ERC 標準（全部 Final/Last Call/Review + 精選常用 Draft/Stagnant） | `/catalog` ≥300 條、各附官方 status 徽章與來源；抽樣事實查核通過 |
| G5 | 收錄 ≥50 個標準組合實作案例 | ≥50 個協議條目具備 `composes` 組成圖（含 USDC/USDT/AAVE）；每案 ≥2 權威來源 |
| G6 | 內容深度達手冊級 | 既有 35 條目補 security/code/errors/gas；每條 ≥2 情境含 ≥1 revert（機器驗證） |
| G7 | IA 承載 350+ 條目 | 側欄分類折疊 + `/catalog` 表格頁 + Ctrl-K 全文搜尋（**不做虛擬化**——350 列純表格已足） |
| G8 | 工程底盤 | CI（含數值化 bundle 預算）、模板注入式預渲染 + SEO、單一真相來源註冊表、死碼清理、a11y |

---

## 2. 診斷摘要（審閱已逐項證實，詳見體檢報告）

1. **P0 i18n 前綴 bug**：資料檔 key 帶 slug 前綴（`erc20.fn.transfer.desc`）、語系 JSON 為無前綴扁平 key（`fn.transfer.desc`）→ 查找全 miss → 流程圖標籤/函式描述/模擬文字六語系顯示原始 key。`DetailPage.tsx:837`、`SimulationPanel.tsx:174,212`、flow nodes 無翻譯呼叫。注意 `validate_registry.py:134-137` 期待的就是帶前綴慣例 → **執行期剝前綴是一致的修法，不改資料**。
2. **空心子系統**：`simulation.worker.ts` 有實例化、有 `setWorker` 接線，但**零 compute 呼叫**（引擎只重播寫死的 `valueChanges`）。死碼：LegendPanel、FlowErrorBoundary、CodeBlock、features/search、useReducedMotion、useLazyComponent、features/wallet、`viem`。
3. **內容**：35 條目零 security/code/gas/revert；20/35 單一情境；7 個薄條目。
4. 其他 P0：語言不持久（`config.ts:59`）、`<html lang>` 不更新、模擬狀態跨條目殘留、流程圖滾輪陷阱、無 scroll restoration、TopBar 標題 bug（`TopBar.tsx:62`）、提示浮層遮按鈕、無 CI/部署設定/預渲染。
5. 資料債：allMeta 3 個懸空 relatedSlugs（`:12` erc777、`:22` erc4907、`:172` erc1400）且 **allMeta 與 data 檔的 relatedSlugs 已經漂移**（erc20 兩處清單不同）——見 §8.0 生成化根治。

---

## 3. 資料現實與收錄規則

官方 `ethereum/ERCs` repo 實測（2026-07-04 clone，已存 `scratchpad/erc-catalog-raw.json`）：**600 份 ERC 文件**（含歷史 Final 如 20/721/1155；`ercs.ethereum.org` 即該 repo 的 CNAME）。

| Status | 數量 | 收錄規則 |
|--------|------|----------|
| Final | 138 | 全收 |
| Last Call | 16 | 全收 |
| Review | 58 | 全收 |
| Draft | 216 | **精選 ≥70**（依 requires 引用中心度 + 生態採用清單；如 3009、5115） |
| Stagnant | 163 | **精選 ≥20**（歷史重要且站上已有先例——現有條目 erc1822 即為 Stagnant；另如 4494、5805） |
| Withdrawn | 9 | 不收 |

→ 212 全收 + ≥90 精選 = **≥302**（下限已 pin，不足時從 Draft 依中心度遞補）。誠實框架：**status 徽章 + 收錄理由透明呈現**，不宣稱 300 個都「常用」。

**單一來源的例外（審閱 W4）**：`ethereum/ERCs` 缺少部分關鍵標準——**EIP-712、EIP-6963（在 ethereum/EIPs）、EIP-7702（Core，站上已有條目）**。ingestion 增加 `EIPS_SUPPLEMENT` 允許清單（712、6963、7702；可選 155/1559/4844 作參考頁）從 `ethereum/EIPs` 補抓。另設 `unofficial: true` 旗標支援無 EIP 文件的事實標準（**677、721A、404**；404 可交叉引用 repo 內的 ERC-7631）。

**Tier 分級**（避免 300 個低品質假模擬）：
- **Tier A（~100）**：完整規格 = 三段文 + functions + 自訂 flow + ≥2 情境（含 revert）+ security/code/gas + 6 語系。現有 22 + 精選 78：137(ENS)、191、712、777、1167、1271*、1363、1820、2309、2771、3009(Draft)、3156、3668、4494(Stagnant)、4906、4907、5192、5805(Stagnant)、6492、6909、6963、7528、7674(Review)…（最終名單由中心度 + 採用度定案；上線後以 analytics 校正）
- **Tier B（~200+）**：精簡三段文 + spec 抽取 functions + 模板 flow + 通用互動模擬 + status/requires/references + 6 語系。可隨時升 A。

---

## 4. Phase 0 — 止血（branch `fix/phase0`，完成即**部署上線**）

| ID | 修復 | 位置 |
|----|------|------|
| P0-1 | `resolveEntryText(t, slug, key)` helper（剝 `${slug}.` 前綴查 slug ns；miss 回傳原值）套用：FnCard、flow 節點/邊標籤、SimulationPanel（情境/步驟/參數）、InteractivePanel、Playground 節點。**附 vitest 鎖定 i18next 扁平含點 key 解析**（`ignoreJSONStructure` 行為） | DetailPage.tsx:837、FlowCanvas.tsx、useElkLayout.ts、SimulationPanel.tsx、InteractivePanel.tsx、PlaygroundCanvas.tsx |
| P0-2 | detection `order: ['querystring','localStorage','navigator','htmlTag']`（querystring 供 e2e/分享用） | i18n/config.ts:59 |
| P0-3 | `languageChanged` → 同步 `document.documentElement.lang` | i18n/config.ts |
| P0-4 | `EntryContent` 加 `key={slug}` + slug 變更時 sim store reset | DetailPage.tsx:913 |
| P0-5 | 流程圖：`preventScrolling={false}`、`zoomOnScroll={false}`、`zoomActivationKeyCode` Ctrl/⌘（觸控雙指不變） | FlowCanvas.tsx |
| P0-6 | slug 變更時 `main` 容器 scrollTo(0,0) | DetailPage.tsx |
| P0-7 | TopBar 用 `useLocation().pathname` 判斷 | TopBar.tsx:62 |
| P0-8 | 提示浮層改位（不遮 FAB/Fullscreen）+ 8s 自動淡出 | DetailPage.tsx:487-523 |
| P0-9a | CI：lint + tsc + vitest + validate_registry + lint_i18n_keys（**含新 `--max-identical-ratio 0.08` 關卡**）+ Playwright chromium + `check_bundle_size.py` 數值關卡（main ≤250KB gz、後續 catalog chunk ≤60KB gz） | .github/workflows/ci.yml |
| P0-9b | **部署目標定案：Vercel**（rewrites + preview deploys 支援 30 個內容批 PR）。`vercel.json` SPA rewrite；**不做** GH-Pages 404.html hack（HTTP 404 損害 SEO） | vercel.json |
| P0-9c | e2e raw-key 防護：首頁 + 1 標準 + 1 協議 + playground × 6 語系（`?lng=` 驅動），body 不得匹配 `/\b[a-z0-9-]+\.(fn|node|edge|sim)\./` 且不得含 `TODO:` | e2e/i18n-guard.spec.ts |
| P0-10 | Quick wins：ns[] 縮至 `['common','home','simulation']`；刪 3 懸空 relatedSlugs；統計卡第三格改真實情境數（暫以 build script 統計，§8.0 後由 catalog 供給）；分類徽章走 CATEGORY_LABELS | config.ts、allMeta.ts、HomePage.tsx:97、DetailPage.tsx:718 |

**驗收**：e2e guard 全綠；選語言→重整→保留且 `<html lang>` 正確；A 底部→點 B→頁首+面板乾淨；圖上滾輪可捲頁；CI 全綠；**Vercel production 上線**。

## 4.5 Phase 0.5 — DetailPage 拆檔（平行軌前置，避免 BLOCKER 級合併衝突）

916 行 `DetailPage.tsx` 是 Phase 1/3/6 的共同熱點 → **先拆再平行**：
`DetailPage.tsx`（骨架/資料載入）+ `detail/EntrySections.tsx`（intro/functions/related；Phase 3 所有權）+ `detail/FlowSection.tsx`（圖容器/fullscreen/resize；Phase 1）+ `detail/SimulationDrawer.tsx`（抽屜/FAB/tooltip；Phase 1）+ `detail/FnCard.tsx`（Phase 3）。純搬移不改行為，e2e 冒煙驗證後立即合併。

---

## 5. Phase 1 — 模擬視覺化（branch `feat/sim-viz`）

**檔案所有權**：`SimulationPanel/StateChangesPanel/ParamField`、`SimulationEngine/useSimulation/useSimulationStore`、`simulation.worker.ts/workerApi`、`detail/FlowSection.tsx`、`detail/SimulationDrawer.tsx`、flow nodes/edges。（InteractivePanel/InteractiveEngine 歸 Phase 2。）

1. **接上真實計算**：依情境的 `compute` 綁定（schema 見 §7）以使用者參數呼叫 worker（swap/interest/CDP/stableswap/rebase + 新增通用 `computeTokenTransfer`），動態產生 `valueChanges`；autoplay 同樣記錄。
2. **StateChangesPanel**：每步 `變數：舊值 → 新值` 列（delta 用 ▲▼ 符號 + 色彩，**不得只靠顏色**）、可回看時間軸、`aria-live="polite"`；**初始→最終摘要列**內建於此面板（不做獨立對比模式）；revert 步驟紅框 + 原因。
3. **節點層**：storage 節點即時數值徽章；token 沿邊粒子流動（FundFlowEdge 既有粒子，由當步 valueChanges 驅動方向/數量）。
4. **傳輸列**：速度選單（i18n 文案已有）、Play 首步立即執行、結尾 disable。
5. **參數輸入**：address/uint256 驗證、ETH↔wei 切換、千分位、一鍵還原。
6. **流程圖可讀性**：初始縮放下限（fit 後 zoom<0.55 → 聚焦主合約群）、掛載 LegendPanel（可收合）、「重新排版」鈕、詳情頁 `nodesDraggable={false}`、掛載 FlowErrorBoundary、節點點擊 → 函式卡 popover。**ELK 留在主執行緒**（每頁一次、<50ms、風險表已證無感；worker 化列為 Playground 100+ 節點時的後續項）。
7. **抽屜/全螢幕 a11y**（檔案在本軌）：`role="dialog"` + focus trap + Escape + 焦點還原。
8. 新元件深淺主題皆過（驗收含 dark mode 截圖）。

**驗收**：uniswap-v2 swap 把 amountIn 100→500 → 輸出/儲備即時改變，**k 不減（含 0.3% fee 後嚴格遞增）**單元測試鎖定；`stepForward` 後 StateChangesPanel ≥1 列且 storage 徽章值等於 worker 計算值（e2e 斷言）；autoplay 期間 Playwright trace 無 >200ms 主執行緒任務；revert 情境紅色呈現含原因。

---

## 6. Phase 2 — Playground 易操作性（branch `feat/playground-ux`）

**檔案所有權**：`PlaygroundPage.tsx`、`components/playground/*`、`usePlaygroundStore`、**`InteractivePanel.tsx`、`InteractiveEngine.ts`**（自 Phase 1 移入；含「互動模式顯示步驟敘述」項）。

1. 拖放（HTML5 DnD + `onDrop` 落點）+ 保留點擊新增（自動空位 + 鏡頭聚焦）。
2. 手機：palette 底部抽屜；觸控「點選→點畫布放置」降級。
3. 修復：`removeEntry` per-slug 清函式；函式 key 加 slug 前綴；函式面板按合約分組 + 搜尋；互動模式顯示步驟敘述。
4. 分享/存檔：**單一自動存檔（回訪還原）+ `?state=` 壓縮分享 URL**（原生 CompressionStream）。不做具名多槽。
5. 引導：空狀態 3 步教學卡；跨合約 trace 入口改「使用者指定起點」下拉（修第一 user 節點假設）。
6. 預置 5 個一鍵示範組合（如 permit+swap、4337+7579），銜接 Phase 5 案例。

**驗收**：390px 走完加入→連線→執行；分享 URL 還原畫布（e2e）；移除合約後函式面板零殘留（單元測試）；60 秒新手走查（啟發式，非關卡）。

---

## 7. Phase 3 — Schema v2 + 既有 35 條目深化（branch `feat/schema-content`；**types.ts 先併**）

**Schema 擴充**（全 optional 向後相容；用現成 `scripts/migrate_data_schema.py` 遷移）：
```ts
security?: SecurityNote[]        // { severity, title, desc, mitigation, source? }
codeExamples?: CodeExample[]     // { title, lang, code }
errors?: ContractError[]         // { name, sig?, condition }
gasNotes?: string
eipStatus?: 'Draft'|'Review'|'Last Call'|'Final'|'Stagnant'|'Withdrawn'
requires?: number[]
references?: Reference[]         // { label, url, kind: 'spec'|'impl'|'audit'|'article' }
tier?: 'A'|'B'; unofficial?: boolean; published?: boolean
relations?: { slug, kind: 'extends'|'requires'|'alternative'|'usedWith' }[]
// Phase 5 需要（一次併入）：
composes?: { slug?: string; erc?: number; role: string }[]   // ProtocolEntry
chains?: string[]; addresses?: { chain, address, label }[]   // ProtocolEntry
// 模擬：
SimulationScenario + kind?: 'happy'|'revert'|'attack'
SimulationScenario + compute?: { kind: 'swap'|'interest'|'cdp'|'stableswap'|'rebase'|'tokenTransfer', inputs: Record<string,string> }  // Phase 1 的 worker 綁定
SimulationStep + isRevert?: boolean; revertReason?: string
```
配套：DetailPage 新區段（Security/Code/Errors/Gas/References，CodeBlock 渲染）、TOC + 錨點（修 LazySection hash）+ prev/next、函式卡完整描述、validate_registry 驗新欄位 + relatedSlugs 存在性 + **meta↔data 一致性** + **`≥2 情境且含 revert`（Tier A）機器檢查**。

**內容衝刺**：安全內容 top 清單（erc20 approve 競態、erc4626 通膨+捨入、2612/1271 重放釣魚、uniswap IL+TWAP、2981 不強制、4337 griefing、代理三件組）；7 薄條目增厚；每條 ≥1 段 Solidity；35/35 ≥2 情境含 revert。
**語言品質**：中英夾雜清零——**新增 ESLint 規則禁止 components/pages 的 JSX 裸字串**（現行違例：DetailPage.tsx:441,471,548 可證此 lint 可行）+ 截圖走查；es 重音修復（詞表 + 抽查）；**zh-TW 簡體字 lint** 入 CI。

**驗收**：ERC-20 頁有競態警示 + Solidity + revert 情境；`/erc20#functions` 冷載直達；JSX 裸字串 lint 0 違例；validate_registry 新關卡全綠。

---

## 8. Phase 4 — ERC 目錄規模化 ≥300（G4 + G7）

### 8.0 IA 與資料拓撲改造（**先於任何大量匯入**）
- **per-locale catalog namespace（審閱關鍵補強）**：ingestion 產出 `locales/{lng}/catalog.json`（全條目 `{slug}.short` + name + status 標籤，~30–50KB gz），與 common 一起常駐載入；**Sidebar/`/catalog`/SEO 描述一律讀 catalog ns**——否則 350 條目 × 每語系會觸發 350 個 JSON 請求（現況 `SidebarMenuItem.tsx:28` 每項各載一個 ns）。
- **搜尋語料**：`public/search/{lng}.json`（name/short/fn 名/eip 號），Ctrl-K 首次開啟時 fetch 餵 MiniSearch；搜尋 v2 = 收編 `features/search` + TopBar 常駐 + Ctrl-K（**自 Phase 6 移入本軌**）。
- 側欄：分類折疊（記憶）+ 計數；預設只展示 Tier A，Tier B 經「更多/目錄/搜尋」。**不做虛擬化**。
- `/catalog`：語意化 `<table>`（`aria-sort`、鍵盤可操作篩選）；篩選 status/category/tier/type；350 列直渲染。
- **allMeta.ts 由 catalog.json 生成**（build script）；首頁統計自動化；`scaffold_entry.py`/`delete_entry.py` **改寫為讀寫 catalog.json**（手動路徑），`ingest_ercs.py` 為批量路徑，共用 validate_registry 驗證；**刪除所有 ns[] 相關腳手架任務**（P0-10 後已無此需求）。
- OG/sitemap 改吃 catalog（`generate_sitemap.py` 現成）；**OG PNG 改為 CI/deploy 時生成，不入 git**（350 張 ≈ 10–30MB churn）。

### 8.1 Ingestion pipeline（`scripts/ingest_ercs.py`）
1. Shallow clone `ethereum/ERCs` + **`EIPS_SUPPLEMENT` 允許清單自 `ethereum/EIPs`**（712/6963/7702…）
2. 解析 frontmatter + interface 區塊抽取（Solidity signatures）
3. 產出 `src/data/catalog.json`：全量 metadata + 收錄名單 + tier + `published:false`
4. 產出骨架 data/en JSON——**跳過既有 22 條、驗 slug+eip 唯一性、絕不覆寫**
5. **冪等語意：重跑只更新 catalog.json 的 metadata（status 等），永不觸碰已授權內容檔**
6. **每週 GitHub Actions cron 重跑 → status 變更自動開 PR**（status 徽章的長期可信度）

### 8.2 批次內容生成（sub-agent workflow；**批 01 = 校準門**）
- **共用資產先行**：每分類 author 模板 + 金牌範例（token→erc20、nft→erc721、proxy→erc1967）；per-locale 詞彙表 `docs/i18n-glossary/{lng}.md` + 風格指南（注入所有 translate prompt）；`i18n/translation-state.json`（en 內容 hash → 各語系 hash 的翻譯記憶，改動偵測用）。
- 每批 10 條：author ×10（只讀官方 spec；不確定留空）→ fact-check ×10（clean-context 對 spec 驗簽名/status/描述）→ translate ×5 語系 → 機械關卡。
- **機械關卡**：validate_registry + lint_i18n（parity + identical-ratio + placeholder parity + zh-TW 簡體 lint）+ tsc + **Solidity 簽名關卡**（functions[].signature 包 `interface X{}` 過 solc，或 selector 計算對 4byte）+ **no-TODO 關卡** + build 抽樣。
- **批 01 完成後人工審 10 條 → 修模板/prompt → 才放行批 02–30**。
- 完成的批次把 `published` 翻 true；未發佈條目不進 sidebar/catalog/search/sitemap。
- 每批一 commit（`content/batch-NN`），Vercel preview 可視審。骨架檔屬於唯一批次 → 實質零合併衝突。
- **Tier A 加值批獨立計**：78 條 ÷ 5/批 ≈ **16 批**（flow 設計 + ≥2 情境含 revert + security/code，品質 = 現有 erc20）。

### 8.3 驗收
- `/catalog` ≥300、status 徽章 + 官方連結；`published` 生效（無 TODO 條目外漏）
- 抽樣 30 條分層事實查核通過（報告留存）；6 語系 parity 100%、identical-ratio <8%
- catalog ns ≤60KB gz（CI 關卡）；首開 `/catalog` 無逐條目網路請求瀑布（e2e 斷言請求數）

---

## 9. Phase 5 — 組合實作案例 ≥50（G5）

**設計修訂（審閱採納）：不新開 entryType**。`ProtocolEntry` 增 `composes/chains/addresses`（§7 已含）→ **既有 13 協議條目升級為案例**（~10 個候選重疊：Aave、Compound、Uniswap V2/V3、Lido、Maker、Safe、Curve、1inch、OZ Governor）+ **新增 ~40 個產品條目**。`/catalog` 的「實作案例」view = `composes` 非空的條目。詳情頁：組成圖（標準為節點、可點擊跳轉）+ 各標準角色卡。

**候選清單（審閱後修正版；authoring 時逐 claim 附來源）**：
- 穩定幣：USDC（20+3009+2612+**升級代理——ZeppelinOS 無結構儲存式，早於 1967，不得寫成 1967**）、USDT、DAI（20+非 2612 的 permit 變體）、GHO、crvUSD、FRAX、PYUSD、USDe/sUSDe（sUSDe=4626）、EURC、LUSD
- LST/LRT：stETH（rebase 20）、**wstETH（非 rebase 20 包裝 + 2612；非 4626）**、rETH、cbETH、sfrxETH（4626）、weETH、ezETH
- DeFi：AAVE aToken（20+2612）、Compound cToken（20）、Uniswap V2 LP（20）/V3 Positions（721）、Curve LP、Convex、Morpho/MetaMorpho（4626）、Pendle SY（**5115，Draft**；PT/YT=20）、GMX GLP、Balancer BPT、**Yearn yVault V3（4626；V2 不是）**
- NFT：**BAYC（721；無鏈上 royaltyInfo）**、CryptoPunks（前 721 對照）、Azuki（**721A，unofficial，引 vendor 源**）、**Seaport（712+1271；2981 不在鏈上強制——royalties 為訂單 consideration，鏈上強制僅 721C/hooks）**、ENS（721+137）、Zora（721/1155+2981）
- AA/錢包：**Safe（1271；165 在 CompatibilityFallbackHandler 非核心）** + Safe4337Module 為外掛、Kernel/ZeroDev（4337+7579）、Alchemy Modular（4337+6900）、Coinbase Smart Wallet（4337+1271+6492）、Argent、Ambire（7702）
- RWA/其他：**BUIDL（許可式 ERC-20，Securitize DS Protocol；非 3643——可對照 3643/1404）**、Ondo OUSG、Centrifuge、WETH（20 經典包裝）、wBTC、Polymarket CTF（1155）、**ERC-404 Pandora（unofficial 實驗，交叉引 7631）**、LINK（20+**677，無 EIP 文件，引 Chainlink docs**）、**ARB/OP（OZ ERC20Votes，IERC5805 介面；5805 本身 Stagnant、兩專案未宣稱合規）**
- 內容授權：EIP 文本 CC0 可衍生（加註 attribution）；**協議 docs 非 CC0 → 案例散文一律改寫 + 引用**，fact-check agent 強制執行。

**批次**：10 案/批 × 5 批（author 可上網 → fact-check 逐 claim 對來源 → translate ×5 → 機械關卡）。**不依賴 Phase 4 批次**（組成標準幾乎都在既有 22 內）——schema 併入後即可與 Phase 4 平行。

**驗收**：案例 view ≥50；組成圖節點可跳轉；抽樣 15 案來源有效且 claim 成立。

---

## 10. Phase 6 — 工程底盤（branch `feat/engineering`）

1. **預渲染（模板注入式，非 puppeteer）**：Node script 從 catalog.json + `locales/en` 把 `<title>/<meta>/og:*/<noscript>` 摘要注入 `dist/{slug}/index.html`（秒級完成）。**v1 僅 en**；`/:lng/` 路徑是唯一可靜態化的多語 URL 方案（`?lng=` 無法產出獨立檔案）→ **列為一次性決策項，v2 實作，避免上索引後改 URL**。robots.txt；sitemap（現成腳本）；hreflang 隨 `/:lng/` 一起上。
2. 單一真相來源：`categories.ts`（順序/標籤/顏色，11+1 分類全數有色）；locale 清單集中。
3. 清理：刪 `viem`、`features/wallet`、`useLazyComponent`；ADR 補寫（tier 制、ingestion、預渲染選型、部署選型）或刪空殼。
4. 測試：vitest jsdom 元件測試（搜尋/面板/參數驗證）；worker 數學單測（BigInt 邊界、k 不減）；e2e 驅動真實模擬 + `/catalog`。
5. a11y 殘項：skip link、單一 h1、對比 token（`#94a3b8`→達 4.5:1）、reduced-motion 接上、pre-paint 主題 script、骨架屏對齊。
6. **可觀測性（需使用者帳號的列為決策項）**：privacy-friendly analytics（建議 Plausible/umami；含零結果搜尋事件——Tier A 升級的數據依據）；Sentry free tier 接 FlowErrorBoundary。**連結檢查（lychee）每週 cron**（非每 PR）。

**驗收**：curl `dist/erc4626/index.html` 含 per-entry og:*；Lighthouse a11y ≥95；加分類改 1 檔；CI 全關卡 + 快取後 <10 分鐘。

---

## 11. 執行策略

### 11.1 平行化拓撲（審閱後修訂——消除三處所有權衝突）
```
序列前置：Phase 0（止血+上線）→ Phase 0.5（DetailPage 拆檔）→ Phase 3 的 schema 部分（types.ts+migrate）→ Phase 4.0（IA+catalog ns+搜尋 v2）
之後平行：
  wt-sim-viz     → Phase 1（SimulationPanel/Engine/worker/FlowSection/SimulationDrawer/nodes/edges）
  wt-playground  → Phase 2（playground/*、InteractivePanel、InteractiveEngine）
  wt-content     → Phase 3 內容衝刺（data/standards+protocols 既有 35 檔、locales 對應檔、detail/EntrySections、FnCard）
  wt-engineering → Phase 6（scripts/預渲染/categories.ts/清理/測試；不碰 detail/*）
  main           → Phase 4 批次 01..30 + Tier A 批 01..16 + Phase 5 批 01..05（骨架檔一批一主，零衝突）
```
合併順序：0 → 0.5 → schema → 4.0 → {1,2,3內容,6 任意} → 內容批隨到隨併（Vercel preview 審視覺）。
唯一版本的所有權表如上；跨軌需求以 interface 請求（不代編他軌檔案）。

### 11.2 品質關卡（每 PR/批）
1. tsc + eslint（含 JSX 裸字串規則）+ vitest + validate_registry + lint_i18n（parity/identical-ratio/placeholder/簡繁）+ bundle 數值關卡
2. e2e：raw-key+TODO guard、冒煙（home/detail/catalog/playground）、模擬數值斷言
3. 內容批加：fact-check 報告 + Solidity 簽名關卡 + no-TODO
4. 視覺：Playwright 截圖（桌面/手機 × 深淺 × en/zh-TW）走查

### 11.3 工作量量級
| 軌 | 量級 |
|----|------|
| Phase 0 + 0.5 | S–M（數小時；含部署） |
| schema + 4.0 | M（1–2 天：catalog ns/生成化/搜尋 v2 是關鍵路徑） |
| Phase 1 / 2 / 3內容 / 6 | 各 M（1–2 天，平行） |
| Phase 4 Tier B | XL：30 批 ×（author10+check10+translate5）≈ 40–60 分/批 |
| Phase 4 Tier A 加值 | **XL：16 批**（單條成本 ≈ 3–4× Tier B） |
| Phase 5 | L：5 批（含上網查證） |

**跨 session 續跑**：本 session 目標 = Phase 0/0.5 + schema + 4.0 主體 + Phase 1/2/6 主體 + pipeline + **批 01 校準門通過**；其餘批次以落盤的 workflow 腳本（`scripts/` + `.claude/workflows/`）重複執行，進度記於 §14。

### 11.4 外部資源
`ethereum/ERCs`（主來源；已 clone + `erc-catalog-raw.json`）、`ethereum/EIPS`（712/6963/7702 補充）、eips/ercs.ethereum.org（連結目標）、OpenZeppelin 5.x / Solmate / Solady（參考實作）、Etherscan 驗證原始碼、Chainlink/Lido/Circle/Safe/Uniswap 官方 docs（案例佐證）、4byte.directory（selector 關卡）、DefiLlama（協議事實）、lychee（連結檢查）、eipsinsight.com（僅參考）。

---

## 12. 風險與對策（修訂）

| 風險 | 對策 |
|------|------|
| 「常用 300」定義 | §3 規則透明 + status 徽章 + 不宣稱全部常用；analytics 事後校正 Tier |
| 生成內容正確性 | 只從官方 spec 生成 + clean-context fact-check + Solidity 簽名編譯關卡 + 不確定留空 + 抽樣驗收 |
| 案例鏈上事實 | 每 claim 附來源；查不到標「未驗證」；已知陷阱寫入 §9（USDC 代理、wstETH、BUIDL、Seaport、BAYC…） |
| 翻譯品質/漂移 | 詞彙表+風格指南+金牌範例；identical-ratio、placeholder、簡繁 lint；translation-state.json 偵測過期 |
| 350 條目效能 | catalog ns 常駐 + 搜尋語料靜態檔 + published 閘門 + bundle 數值關卡；**無虛擬化需求** |
| 平行衝突 | §11.1 唯一所有權表 + 0.5 拆檔前置 + 批次檔唯一歸屬 |
| 骨架外漏 | `published:false` 預設 + no-TODO e2e |
| 重跑覆寫 | ingestion 冪等語意=只碰 metadata |
| Session 中斷 | workflow 腳本落盤可續跑；§14 進度單 |
| spec status 漂移 | 每週 cron 重 ingest 自動 PR |

---

## 13. 執行前/後審核協議

- **執行前（已完成 v1→v2）**：3 個 clean-context Fable agents（邏輯/事實/優化）→ 1 BLOCKER + 4 WRONG + 12 SHOULD-FIX 全數採納修訂。
- **執行後**：clean-context agents 審 (a) plan 覆蓋率（逐項 done/partial/missing）、(b) 程式碼正確性、(c) 視覺驗證（截圖矩陣走查）、(d) 操作驗證（e2e 實跑）、(e) 內容抽樣事實查核。缺口 → 修復 → 複驗。

---

## 14. 進度追蹤（跨 session 續跑點）

- [x] plan v1 → 3 路審閱 → v2 修訂
- [x] Phase 0（P0-1…P0-10）✅ 全關卡綠（Vercel 上線待使用者連結 repo——vercel.json 已備）
- [x] Phase 0.5 DetailPage 拆檔（967→150 行 + 5 模組）
- [x] Phase 3 schema 部分（types.ts v2 + validate v2 + ADR-005）
- [x] Phase 4.0 IA（catalog ns/搜尋 v2 Ctrl-K/`/catalog` 頁/allMeta 生成化/scaffold 改寫；validator 警告 27→0）
- [x] Phase 1 模擬視覺化（worker 真計算/StateChangesPanel/節點徽章/圖例/focus trap；e2e 數值斷言）
- [x] Phase 2 Playground（拖放/手機抽屜/分享 URL/removeEntry 修復/預置組合）
- [ ] Phase 3 內容衝刺（35 條目）——**erc165 已完成**（首個 v2 內容條目）；其餘 34 待批次
- [x] Phase 6 工程底盤主體（預渲染/reduced-motion/死碼/FOUC/對比/robots/cron/**首屏 JS −73%**）；categories.ts 遷移完成一半（HomePage/Sidebar 字串清理 + es 重音**中斷於 session 限額**）
- [x] Ingestion pipeline + catalog.json（312 條入選）+ 每週 cron
- [ ] 共用資產——gen_translation_state.py 完成；模板/詞彙表/zh-TW lint **中斷於 session 限額**（agent 可續作）
- [ ] **批 01 校準門**（條目已選定：55/681/1046/2098/5219/5564/5679/5750/7201/7540；待資產完成後執行）
- [ ] Tier B 批 02–30（各 10 條）
- [ ] Tier A 加值批 01–16（各 5 條）
- [ ] 案例批 01–05——批 01（10 個既有協議 composes）**進行中被限額中斷**（agent 已完成 Safe/stETH 等查證，可續作）
- [ ] 執行後審核全綠

> **2026-07-04 session 中斷點**：API 用量限額於 9:20am (Asia/Taipei) 重置。三個可續作 agent：清理軌（剩 HomePage/Sidebar 等 6 檔字串 + es 重音 + eslint 豁免移除）、資產軌（剩模板/詞彙表/zh-TW lint/運行手冊）、案例批 01（查證過半）。續作方式：對既有 agent transcript 發送續作訊息，或依本檔重新派工。
