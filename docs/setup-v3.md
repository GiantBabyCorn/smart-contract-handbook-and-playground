# ERC Explorer — 專案建立指引（v2 — 優化版）

> **用途**：供 Claude Agent 閱讀後，依此指引自動建立完整專案。
> **最後更新**：2026-04
> **版本說明**：v2 基於 v1 審查報告優化，主要變更見各段落 `[v2 變更]` 標記。

---

## 0. 專案概述

ERC Explorer 是一個互動式科普網站，用視覺化方式介紹以太坊 ERC 標準與常見公用合約。  
核心賣點：  
- 以 **圖像化流程圖** 呈現合約的讀取/呼叫接口  
- 可 **自訂參數模擬** 使用者與合約的互動（含資料流、資金流完整演示）  
- 支援多語言、深色/淺色主題  

---

## 1. 技術棧總覽

| 層級 | 技術選型 | 說明 |
|------|----------|------|
| 構建工具 | **Vite 6+** | 快速 HMR，原生 ESM |
| 框架 | **React 19+** | 以 functional component + hooks 為主 |
| 語言 | **TypeScript 5+** | 嚴格模式 (`strict: true`) |
| 路由 | **React Router 7+** | 支援 lazy routes |
| 狀態管理 | **Zustand 5+** | 輕量、無 boilerplate |
| 樣式 | **Tailwind CSS 4+** | 搭配 CSS 變數管理主題色 |
| 流程圖視覺化 | **@xyflow/react (React Flow) 12+** | 節點式互動圖表 |
| 流程圖自動佈局 | **elkjs** | 非同步佈局引擎，支援 layered/force/radial 多種演算法 `[v2 變更]` |
| 動畫 | **motion 12+** | Framer Motion 輕量版，節點動畫與轉場 |
| 模糊搜尋 | **minisearch** | 輕量 fuzzy + prefix search，適合小資料集 |
| 國際化 | **react-i18next + i18next + i18next-resources-to-backend** | 每條目獨立 namespace、語言包進入 build pipeline 做 content hash `[v2 變更]` |
| 程式碼高亮 | **Shiki 1+** | 合約程式碼區塊（僅載入 solidity + typescript 語法） |
| SEO | **React 19 原生 Document Metadata** | 元件內直接渲染 `<title>` / `<meta>`，React 19 自動提升至 `<head>` `[v2 變更]` |
| 以太坊工具 | **viem** | 地址/數值格式化，未來可直接擴充錢包連接 |
| 通用 hooks | **usehooks-ts** | useDebounce、useMediaQuery 等常用 hook |
| CSS 工具 | **tailwind-merge** | class 合併去重 |
| Worker 通訊 | **comlink** | 讓 Web Worker 變為 RPC-style 呼叫，型別安全、零手寫 postMessage `[v2 新增]` |
| Linting | **ESLint 9+** (flat config) + **Prettier** | 統一風格 |
| 測試 | **Vitest + React Testing Library + Playwright** | 單元/整合/E2E 測試 `[v2 變更]` |

> **移除說明**：
> - ~~react-loading-skeleton~~ → 僅 3 種骨架變體，用 Tailwind `animate-pulse` 自行實作，減少依賴且更好配合 CSS 變數主題。
> - ~~Fuse.js~~ → 21 筆資料搜尋用 `minisearch` 更輕量，支援 prefix search 體驗更好。
> - ~~clsx~~ → `tailwind-merge` 已內建 class 合併，不需要額外疊 clsx。
> - ~~i18next-http-backend~~ → 改用 `i18next-resources-to-backend` + dynamic import，語言包進入 Vite build pipeline，自動 content hash，解決快取更新問題。
> - ~~i18next-browser-languagedetector~~ → 保留安裝但移除自訂 `detector.ts`，用套件內建偵測即可。
> - ~~自寫 useDebounce / useMediaQuery~~ → 改用 `usehooks-ts` 提供的成熟版本。
> - ~~自寫 formatters.ts~~ → 改用 `viem` 的 `formatEther` / `formatUnits` / `getAddress` / `isAddress`（tree-shakable，不增加 bundle）。
> - ~~react-helmet-async~~ → React 19 原生支援 Document Metadata hoisting，純 SPA 不需要 HelmetProvider 封裝。`[v2 變更]`
> - ~~@dagrejs/dagre~~ → 長期未維護、複雜圖表有定位異常；改用 elkjs（React Flow 官方推薦進階方案）。`[v2 變更]`
> - ~~postcss / autoprefixer~~ → Tailwind CSS 4+ 搭配 `@tailwindcss/vite` 已不需要 PostCSS pipeline。`[v2 變更]`
> - ~~自寫 Worker postMessage 通訊~~ → 改用 `comlink` 自動序列化 + RPC 呼叫，減少手寫 message handler 的出錯機率。`[v2 變更]`

### 1.1 關鍵技術決策記錄

> **注意**：隨專案演進，新的技術決策應記錄在 `docs/adr/` 目錄（Architecture Decision Records），不修改本文件。格式見 §2 目錄結構。

#### 視覺化方案：React Flow（SVG-based）

**選擇理由**：
- React Flow 底層為 SVG + HTML overlay，所有節點都是標準 React Component，方便客製化
- 內建虛擬化（只渲染 viewport 內節點），複雜圖表效能有保障
- 節點可嵌入表單、按鈕、動畫等互動元素（用於模擬參數輸入）
- 邊（edge）支援自訂 label 與動畫（用於顯示資料流/資金流箭頭加註）
- 社群活躍、Stripe / Typeform 等企業級用戶驗證
- 長期維護：MIT 協議，xyflow 團隊持續維護

**不選 Canvas/Shader 理由**：
- Canvas 內容無法被瀏覽器 DOM 存取，搜尋引擎無法索引，無障礙差
- Shader 開發門檻高、Debug 困難、長期維護成本極高
- 本專案圖表屬於「結構性節點圖」而非「粒子特效/即時 3D」，SVG 完全勝任
- 在 200 個以下節點場景，SVG 效能完全足夠（React Flow 有虛擬化加持）

#### 運算方案：Web Worker + comlink（非 WebAssembly）`[v2 變更]`

**選擇理由**：
- 合約模擬本質是 **狀態機 + 整數數學**（EVM 模擬），非浮點密集運算
- Web Worker 可將重計算移出主執行緒，避免 UI 凍結，且開發與除錯體驗與一般 JS/TS 無異
- **comlink** 將 Worker 封裝為 RPC-style 呼叫，自動序列化/反序列化，TypeScript 型別推導完整
- 維護成本低：不需要 Rust/C++ 工具鏈、不需要 `.wasm` 構建流程
- 如未來真遇到瓶頸（極複雜的 DeFi 路徑計算等），可局部替換為 WASM，架構設計預留此介面

**不選 WASM 理由**：
- 引入 Rust/C++ 編譯流水線大幅增加構建複雜度
- 跨語言 Debug 困難，新成員上手門檻高
- 當前場景下效能提升不具顯著意義（毫秒級差異）

#### 流程圖佈局方案：elkjs 非同步自動排版 `[v2 變更]`

**選擇理由**：
- 資料檔只定義「節點與邊的邏輯關係」，不寫死 `position: { x, y }`
- elkjs 提供 layered / force / radial 等多種演算法，可依圖表拓撲結構選擇最適排版
- 比 dagre 的佈局品質更高（尤其在複雜圖如 ERC-2535 Diamond、ERC-4337 Account Abstraction）
- dagre 已長期未維護，elkjs 持續更新
- React Flow 官方提供完整 elkjs 整合範例
- bundle 體積較大（~170KB），但已透過 `flow-vendor` manual chunk 拆分，僅在 DetailPage 時載入

**不選 dagre 理由**：
- 長期未維護，社群回報複雜圖表有節點定位異常及邊穿越節點問題
- 配置選項有限，無法針對不同標準的圖表拓撲微調

#### SEO 方案：React 19 原生 Document Metadata `[v2 變更]`

**選擇理由**：
- React 19 原生支援在 component 中渲染 `<title>`、`<meta>`、`<link>` 並自動提升至 `<head>`
- 純 SPA 無 SSR 需求，不需要 HelmetProvider 的 server context
- 少一個依賴，與 React 19 Suspense 完全契合

**未來升級路徑**：
- 若 SEO 成為重要目標，應評估 pre-rendering（`vite-plugin-ssr`）或遷移至 Astro（Islands Architecture）
- 此決策記錄於 `docs/adr/004-react19-metadata-over-helmet.md`

---

## 2. 專案目錄結構

```
erc-explorer/
├── index.html
├── vite.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── eslint.config.js
├── .prettierrc
├── playwright.config.ts                 # E2E 測試設定 [v2 新增]
├── package.json
│
├── docs/                                # 專案文件
│   ├── adr/                             # Architecture Decision Records
│   │   ├── 001-svg-over-canvas.md
│   │   ├── 002-worker-over-wasm.md
│   │   ├── 003-elkjs-auto-layout.md     # [v2 變更] dagre → elkjs
│   │   └── 004-react19-metadata-over-helmet.md  # [v2 新增]
│   ├── agent-status/                    # Sub-Agent 交接狀態檔 [v2 新增]
│   │   ├── agent-1-scaffold.json
│   │   ├── agent-2-theme.json
│   │   ├── agent-3-i18n.json
│   │   ├── agent-4a1-token-data.json
│   │   ├── agent-4a2-proxy-utility-data.json
│   │   ├── agent-4a3-account-identity-data.json
│   │   ├── agent-4b1-defi-data.json
│   │   ├── agent-4b2-governance-data.json
│   │   ├── agent-5-layout.json
│   │   ├── agent-6-flow.json
│   │   ├── agent-7-simulation.json
│   │   └── agent-8-qa.json
│   ├── I18N_CONVENTIONS.md              # i18n key 命名規範
│   └── CHANGELOG.md                     # 版本變更紀錄
│
├── scripts/                             # 自動化腳本
│   ├── scaffold_entry.py                # 產生新 standard/protocol 骨架
│   ├── sync_translations.py             # 掃描缺漏 i18n key 並補 TODO
│   ├── validate_registry.py             # 驗證所有資料檔符合 interface
│   ├── check_bundle_size.py             # 監控 bundle 體積閾值 [v2 新增]
│   ├── generate_og_images.py            # 為各條目產生 og:image [v2 新增]
│   ├── lint_i18n_keys.py                # 驗證 i18n key 命名規範 [v2 新增]
│   ├── export_data_summary.py           # 自動產出收錄清單 Markdown [v2 新增]
│   ├── generate_sitemap.py              # 掃描 registry 產生 sitemap.xml [v2 新增]
│   ├── migrate_data_schema.py           # types.ts 新增欄位時自動補空值佔位 [v2 新增]
│   ├── orchestrate.py                   # Agent 協調器：狀態檢查/啟動/恢復 [v2 新增]
│   ├── verify_handoff.py                # 驗證 Agent 產出可交接給下游 [v2 新增]
│   └── README.md                        # 腳本使用說明
│
├── e2e/                                 # Playwright E2E 測試 [v2 新增]
│   ├── navigation.spec.ts
│   ├── theme-switch.spec.ts
│   ├── language-switch.spec.ts
│   └── simulation-basic.spec.ts
│
├── public/
│   ├── favicon.svg
│   ├── og-image.png
│   └── sitemap.xml                      # 由 generate_sitemap.py 產生 [v2 新增]
│
├── src/
│   ├── main.tsx                          # 進入點
│   ├── App.tsx                           # 根組件：Provider 堆疊 + ErrorBoundary
│   ├── router.tsx                        # React Router 設定（全部 lazy）
│   │
│   ├── components/                       # 共用 UI 元件
│   │   ├── layout/
│   │   │   ├── AppShell.tsx              # 最外層框架（sidebar + main）
│   │   │   ├── Sidebar.tsx               # 左側選單
│   │   │   ├── SidebarSearch.tsx         # Sticky 搜尋欄（minisearch）
│   │   │   ├── SidebarMenuItem.tsx       # 選單項目
│   │   │   ├── TopBar.tsx                # 上方工具列（主題切換、語言切換）
│   │   │   └── MobileNav.tsx             # 手機版漢堡選單
│   │   ├── common/
│   │   │   ├── SkeletonBlock.tsx         # Tailwind animate-pulse 骨架屏
│   │   │   ├── ThemeToggle.tsx           # 深/淺色切換按鈕
│   │   │   ├── LanguageSwitcher.tsx      # 語言下拉選單
│   │   │   ├── ExternalLink.tsx          # 安全外連元件（rel=noopener）
│   │   │   ├── CodeBlock.tsx             # Shiki 程式碼高亮區塊
│   │   │   ├── ErrorFallback.tsx         # Error Boundary fallback UI
│   │   │   └── SEOHead.tsx              # React 19 原生 metadata 封裝 [v2 變更]
│   │   └── flow/                         # React Flow 相關元件
│   │       ├── FlowCanvas.tsx            # React Flow 畫布容器（含 elkjs 自動佈局）[v2 變更]
│   │       ├── FlowErrorBoundary.tsx     # 流程圖專用 Error Boundary
│   │       ├── useElkLayout.ts           # elkjs 佈局 hook 封裝 [v2 新增]
│   │       ├── nodes/
│   │       │   ├── ContractNode.tsx       # 合約節點
│   │       │   ├── FunctionNode.tsx       # 函式接口節點（read/write）
│   │       │   ├── UserNode.tsx           # 模擬使用者節點
│   │       │   ├── ProxyNode.tsx          # Proxy 節點（含轉發動畫）
│   │       │   ├── StorageNode.tsx        # Storage slot 節點
│   │       │   └── TokenFlowNode.tsx      # 資金/Token 流節點
│   │       ├── edges/
│   │       │   ├── AnimatedEdge.tsx        # 帶動畫的流向邊
│   │       │   ├── LabeledEdge.tsx         # 帶標注文字的邊
│   │       │   └── FundFlowEdge.tsx        # 資金流專用邊（顯示數值）
│   │       └── panels/
│   │           ├── SimulationPanel.tsx     # 模擬控制面板
│   │           └── LegendPanel.tsx         # 圖例面板
│   │
│   ├── pages/
│   │   ├── HomePage.tsx                   # 首頁（網站介紹）
│   │   ├── DetailPage.tsx                 # 詳細介紹頁（通用模板，slug 無效時導向 404）
│   │   └── NotFoundPage.tsx               # 404
│   │
│   ├── features/                          # 業務功能模組
│   │   ├── simulation/
│   │   │   ├── SimulationEngine.ts        # 模擬引擎核心
│   │   │   ├── useSimulation.ts           # 模擬 hook（直接操作 Zustand store）
│   │   │   ├── simulation.worker.ts       # Web Worker（重計算，comlink 包裝）[v2 變更]
│   │   │   └── workerApi.ts              # comlink wrap 的 Worker API 型別 [v2 變更]
│   │   ├── search/
│   │   │   ├── useMiniSearch.ts           # minisearch 封裝 hook
│   │   │   └── searchIndex.ts             # 搜尋索引建構
│   │   └── wallet/                        # 預留：錢包連接
│   │       ├── WalletProvider.tsx
│   │       └── useWallet.ts
│   │
│   ├── data/                              # 各標準/合約的資料定義
│   │   ├── types.ts                       # 統一資料型別（拆分為 Meta / Content / Flow / Simulation）
│   │   ├── allMeta.ts                     # 所有條目的 ERCMeta 靜態陣列（Sidebar 首屏專用）[v2 新增]
│   │   ├── registry.ts                    # 依 slug 取完整條目的 lazy loader（不再承擔 meta 掃描）[v2 變更]
│   │   ├── standards/                     # ERC 標準資料
│   │   │   ├── erc20.ts
│   │   │   ├── erc721.ts
│   │   │   ├── erc1155.ts
│   │   │   ├── erc4626.ts
│   │   │   ├── erc2612.ts
│   │   │   ├── erc165.ts
│   │   │   ├── erc173.ts
│   │   │   ├── erc2981.ts
│   │   │   ├── erc1967.ts
│   │   │   ├── erc1822.ts
│   │   │   ├── erc2535.ts
│   │   │   ├── erc4337.ts
│   │   │   ├── erc6551.ts
│   │   │   ├── erc7702.ts
│   │   │   ├── erc1271.ts
│   │   │   ├── erc3525.ts
│   │   │   ├── erc3643.ts
│   │   │   ├── erc5267.ts
│   │   │   ├── erc7683.ts
│   │   │   ├── erc7579.ts               # [v2 新增] Modular Smart Accounts
│   │   │   ├── erc4361.ts               # [v2 新增] Sign-In with Ethereum
│   │   │   └── erc6900.ts               # [v2 新增] Modular Accounts (Alchemy)
│   │   └── protocols/                     # 常見協議/合約資料
│   │       ├── uniswap-v2.ts
│   │       ├── uniswap-v3.ts
│   │       ├── uniswap-v4.ts
│   │       ├── aave-v3.ts
│   │       ├── compound-v3.ts
│   │       ├── maker-dao.ts
│   │       ├── chainlink-oracle.ts
│   │       ├── oneinch-aggregator.ts
│   │       ├── lido-steth.ts
│   │       ├── curve-stableswap.ts
│   │       ├── safe-multisig.ts
│   │       ├── eigenlayer.ts
│   │       └── oz-governor.ts
│   │
│   ├── i18n/
│   │   ├── config.ts                      # i18next 初始化設定（resources-to-backend）
│   │   └── locales/                       # 語言包（進入 Vite build，自動 content hash）
│   │       ├── en/
│   │       │   ├── common.json            # 通用文字
│   │       │   ├── home.json              # 首頁文字
│   │       │   ├── simulation.json        # 模擬面板通用文字
│   │       │   ├── erc20.json             # [v2 變更] 每條目獨立 namespace
│   │       │   ├── erc721.json
│   │       │   ├── uniswap-v2.json
│   │       │   └── ... (每個 slug 一個 JSON)
│   │       ├── zh-CN/
│   │       │   └── ... (同上結構)
│   │       ├── zh-TW/
│   │       │   └── ...
│   │       ├── ja/
│   │       │   └── ...
│   │       ├── ko/
│   │       │   └── ...
│   │       └── es/
│   │           └── ...
│   │
│   ├── stores/                            # Zustand stores
│   │   ├── useThemeStore.ts               # 主題狀態（純狀態，DOM 操作移至 useEffect）[v2 變更]
│   │   ├── useSidebarStore.ts             # 側邊欄開合狀態
│   │   └── useSimulationStore.ts          # 模擬參數/結果/高亮狀態（唯一模擬狀態來源）
│   │
│   ├── hooks/                             # 專案專用 hooks（通用 hooks 用 usehooks-ts）
│   │   ├── useLazyComponent.ts
│   │   ├── useReducedMotion.ts            # 封裝 motion 的 useReducedMotion
│   │   └── useThemeSync.ts               # 訂閱 themeStore 同步 DOM attribute [v2 新增]
│   │
│   ├── utils/
│   │   ├── cn.ts                          # tailwind-merge 封裝
│   │   └── constants.ts                   # 全域常數
│   │
│   └── styles/
│       ├── globals.css                    # Tailwind directives + CSS 變數
│       ├── themes.css                     # Dark/Light CSS 變數定義（--erc- prefix，含語義層）[v2 變更]
│       └── reactflow-overrides.css        # React Flow 樣式覆寫
```

> **對比 v1 的結構變更**：
> - `docs/adr/003` 改名為 elkjs；新增 `004-react19-metadata-over-helmet.md`
> - 新增 `docs/agent-status/` — Sub-Agent 交接狀態檔目錄 `[v2 新增]`
> - `scripts/` 新增 6 個自動化腳本（check_bundle_size / generate_og_images / lint_i18n_keys / export_data_summary / generate_sitemap / migrate_data_schema）
> - `scripts/` 新增 `orchestrate.py` 和 `verify_handoff.py`（Agent 協調與交接驗證）`[v2 新增]`
> - 新增 `e2e/` — Playwright E2E 測試目錄
> - 新增 `public/sitemap.xml`
> - 新增 `src/data/allMeta.ts` — meta 與完整資料分離
> - 新增 `src/components/flow/useElkLayout.ts` — elkjs 佈局 hook
> - `src/features/simulation/workerMessages.ts` → `workerApi.ts`（comlink 改造）
> - 新增 `src/hooks/useThemeSync.ts` — DOM side effect 從 store 抽出
> - `i18n/locales/` 結構改為每條目獨立 JSON（取消 `standards.json` 大檔）
> - 新增 3 個 ERC 標準：erc7579 / erc4361 / erc6900
> - 移除 `tailwind.config.ts`（Tailwind CSS 4 用 CSS-first 設定）

---

## 3. 資料模型定義

### 3.1 統一資料型別 (`src/data/types.ts`)

型別拆為四個關注點，以支援分層 lazy loading。`[v2 變更]`：新增 `StandardEntry` / `ProtocolEntry` discriminated union；`FlowNodeDef` 改為按 type 的 discriminated union，強化型別安全。

```typescript
// ─── 基礎分類 ───

/** 標準/合約的類別分類 */
export type Category =
  | 'token'          // ERC-20 等
  | 'nft'            // ERC-721, ERC-1155 等
  | 'proxy'          // ERC-1967, ERC-1822, ERC-2535
  | 'defi'           // Uniswap, Aave, Compound 等
  | 'account'        // ERC-4337, ERC-6551, ERC-7702, ERC-7579, ERC-6900
  | 'utility'        // ERC-165, ERC-173, ERC-2981, ERC-1271, ERC-5267
  | 'identity'       // ERC-4361 (SIWE) [v2 新增]
  | 'oracle'         // Chainlink 等
  | 'governance'     // OZ Governor, Safe Multisig
  | 'cross-chain'    // ERC-7683
  | 'rwa';           // ERC-3643

/** 條目類型 [v2 新增] */
export type EntryType = 'standard' | 'protocol';

// ─── 函式接口 ───

export interface ContractFunction {
  name: string;
  signature: string;       // e.g. "transfer(address,uint256)"
  type: 'read' | 'write' | 'event';
  params: FunctionParam[];
  returns?: FunctionParam[];
  description: string;     // i18n key
  /** 用於模擬時的預設參數值 */
  defaultSimValues?: Record<string, string>;
}

export interface FunctionParam {
  name: string;
  type: string;            // Solidity type: address, uint256, bytes32, etc.
  description: string;     // i18n key
}

// ─── 流程圖定義 [v2 變更：改為 discriminated union] ───

/** 各 node type 的 data shape */
interface ContractNodeData { functions?: string[]; }
interface FunctionNodeData { fnType: 'read' | 'write' | 'event'; signature?: string; }
interface UserNodeData { address?: string; balance?: string; }
interface ProxyNodeData { implementation?: string; }
interface StorageNodeData { slots?: Array<{ key: string; label: string }>; }
interface TokenFlowNodeData { symbol?: string; amount?: string; }

/** 流程圖節點定義（不含 position，由 elkjs 自動佈局）*/
export type FlowNodeDef =
  | { id: string; type: 'contract'; label: string; data: ContractNodeData; layoutHint?: string }
  | { id: string; type: 'function'; label: string; data: FunctionNodeData; layoutHint?: string }
  | { id: string; type: 'user'; label: string; data: UserNodeData; layoutHint?: string }
  | { id: string; type: 'proxy'; label: string; data: ProxyNodeData; layoutHint?: string }
  | { id: string; type: 'storage'; label: string; data: StorageNodeData; layoutHint?: string }
  | { id: string; type: 'tokenFlow'; label: string; data: TokenFlowNodeData; layoutHint?: string };

/** 流程圖邊定義 */
export interface FlowEdgeDef {
  id: string;
  source: string;
  target: string;
  type: 'animated' | 'labeled' | 'fundFlow';
  label?: string;          // i18n key，箭頭旁的加註文字
  data?: Record<string, unknown>;
}

// ─── 模擬場景 ───

export interface SimulationScenario {
  id: string;
  name: string;            // i18n key
  description: string;     // i18n key
  params: SimulationParam[];
  steps: SimulationStep[];
}

export interface SimulationParam {
  id: string;
  label: string;           // i18n key
  type: 'address' | 'uint256' | 'bool' | 'select';
  options?: { label: string; value: string }[];
  defaultValue: string;
}

export interface SimulationStep {
  id: string;
  description: string;     // i18n key
  /** 手機版簡化描述 [v2 新增] */
  mobileDescription?: string; // i18n key
  highlightNodes: string[];
  highlightEdges: string[];
  valueChanges?: Record<string, string>;
  durationMs: number;
}

// ─── 條目：分層組合 ───

/** Sidebar / 搜尋只需這層（從 allMeta.ts 靜態載入，不觸發 dynamic import）[v2 變更] */
export interface ERCMeta {
  slug: string;
  name: string;
  shortDescription: string;  // i18n key
  category: Category;
  entryType: EntryType;      // [v2 新增]
  officialUrl: string;
  relatedSlugs: string[];
  sortOrder: number;
}

/** 詳細頁文字內容 */
export interface ERCContent {
  introduction: string;      // i18n key
  designPurpose: string;     // i18n key
  commonUsage: string;       // i18n key
  functions: ContractFunction[];
}

/** 流程圖結構 */
export interface ERCFlow {
  flowNodes: FlowNodeDef[];
  flowEdges: FlowEdgeDef[];
  /** elkjs 佈局演算法偏好 [v2 新增] */
  elkLayoutOptions?: Record<string, string>;
}

/** 模擬場景 */
export interface ERCSimulation {
  simulations: SimulationScenario[];
}

/** 完整條目基底 */
interface BaseEntry extends ERCMeta, ERCContent, ERCFlow, ERCSimulation {}

/** ERC 標準條目 [v2 新增] */
export interface StandardEntry extends BaseEntry {
  entryType: 'standard';
  eipNumber: number;
}

/** 協議條目 [v2 新增] */
export interface ProtocolEntry extends BaseEntry {
  entryType: 'protocol';
  /** 協議主要合約地址（可選，教學用途） */
  contracts?: Array<{ chain: string; address: string; label: string }>;
  version?: string;
}

/** 完整條目 = discriminated union [v2 變更] */
export type ERCEntry = StandardEntry | ProtocolEntry;
```

> **分層 lazy loading 策略 [v2 變更]**：
> - Sidebar 渲染只需 `ERCMeta`，**從 `allMeta.ts` 靜態匯入**，不觸發任何 dynamic import
> - 進入 DetailPage 後才由 `registry.ts` lazy load 完整 `ERCEntry`
> - 進入 DetailPage 後才由 i18n dynamic import 載入該條目的語言包
> - 這讓首屏只需載入 meta 陣列 + common / home 語言包

### 3.2 Meta 靜態陣列 (`src/data/allMeta.ts`) `[v2 新增]`

```typescript
import type { ERCMeta } from './types';

/**
 * 所有條目的 meta 靜態陣列。
 * Sidebar 首屏使用，不觸發 dynamic import。
 * 新增條目時由 scaffold_entry.py 自動維護。
 */
export const allMeta: ERCMeta[] = [
  { slug: 'erc20', name: 'ERC-20', shortDescription: 'erc20.short', category: 'token', entryType: 'standard', officialUrl: 'https://eips.ethereum.org/EIPS/eip-20', relatedSlugs: ['erc721', 'erc1155', 'erc2612', 'erc4626'], sortOrder: 100 },
  { slug: 'erc721', name: 'ERC-721', shortDescription: 'erc721.short', category: 'nft', entryType: 'standard', officialUrl: 'https://eips.ethereum.org/EIPS/eip-721', relatedSlugs: ['erc20', 'erc1155', 'erc2981', 'erc6551'], sortOrder: 200 },
  // ... 其餘條目（完整列表由 scaffold_entry.py 維護）
].sort((a, b) => a.sortOrder - b.sortOrder);
```

> **sortOrder 規則 [v2 變更]**：使用百位數間隔（100, 200, 300...），方便未來在任意兩個條目之間插入（如 150）。category 內排序依 sortOrder 升序；category 之間的排序由 Sidebar 的 `CATEGORY_ORDER` 常數定義。

### 3.3 註冊表 (`src/data/registry.ts`) `[v2 變更]`

```typescript
import type { ERCEntry } from './types';

/** lazy import 所有完整資料檔 */
const modules = import.meta.glob<{ entry: ERCEntry }>(
  ['./standards/*.ts', './protocols/*.ts'],
  { lazy: true }
);

/** 快取：避免重複 resolve */
const fullCache = new Map<string, ERCEntry>();

/** 依 slug 取得完整條目（含流程圖、模擬）— 唯一的 dynamic import 入口 */
export async function getEntryBySlug(slug: string): Promise<ERCEntry | null> {
  if (fullCache.has(slug)) return fullCache.get(slug)!;
  const key = Object.keys(modules).find((k) => k.includes(`/${slug}.ts`));
  if (!key) return null;
  const mod = await modules[key]();
  fullCache.set(slug, mod.entry);
  return mod.entry;
}
```

> **v2 變更**：
> - 移除 `getAllMeta()`，meta 改由 `allMeta.ts` 靜態提供
> - 資料檔改為 named export（`export const entry: ERCEntry = { ... }`）

### 3.4 Worker API（comlink 版）(`src/features/simulation/workerApi.ts`) `[v2 變更]`

```typescript
// ─── Worker 端暴露的 API 介面 ───

export interface SimWorkerApi {
  computeSwap(params: { reserveIn: string; reserveOut: string; amountIn: string }): { amountOut: string; priceImpact: string };
  computeConcentratedSwap(params: { tickLower: number; tickUpper: number; liquidity: string; amountIn: string }): { amountOut: string; crossedTicks: number };
  computeInterest(params: { principal: string; ratePerSecond: string; duration: number }): { accruedInterest: string; totalDebt: string };
  computeCdpRatio(params: { collateral: string; debt: string; price: string }): { ratio: string; isLiquidatable: boolean };
  computeFacetRoute(params: { selector: string; facets: Array<{ selectors: string[]; address: string }> }): { matchedFacet: string };
  computeStableswap(params: { balances: string[]; amountIn: string; indexIn: number; indexOut: number; amp: string }): { amountOut: string; fee: string };
  computeRebase(params: { shares: string; totalShares: string; totalPooledEth: string; newRewards: string }): { newBalance: string; rewardPerShare: string };
}

// ─── 使用端 ───

import { wrap } from 'comlink';

const worker = new Worker(
  new URL('./simulation.worker.ts', import.meta.url),
  { type: 'module' }
);

export const simWorker = wrap<SimWorkerApi>(worker);

// 呼叫方式（完全型別安全）：
// const result = await simWorker.computeSwap({ reserveIn: '...', reserveOut: '...', amountIn: '...' });
```

```typescript
// ─── simulation.worker.ts ───
import { expose } from 'comlink';
import type { SimWorkerApi } from './workerApi';

const api: SimWorkerApi = {
  computeSwap({ reserveIn, reserveOut, amountIn }) { /* ... */ },
  computeConcentratedSwap(params) { /* ... */ },
  computeInterest(params) { /* ... */ },
  computeCdpRatio(params) { /* ... */ },
  computeFacetRoute(params) { /* ... */ },
  computeStableswap(params) { /* ... */ },
  computeRebase(params) { /* ... */ },
};

expose(api);
```

> **v2 變更**：
> - 移除手寫的 `WorkerRequest` / `WorkerResponse` discriminated union 和 switch/case handler
> - 改用 comlink：Worker 端 `expose(api)`，主執行緒 `wrap<SimWorkerApi>(worker)`
> - 每個計算函式都有明確的入參 / 回傳型別，TypeScript 端到端型別安全
> - 不再需要 `requestId`（comlink 內建 request-response 配對）

### 3.5 i18n Key 命名規範 `[v2 變更]`

> 完整規範見 `docs/I18N_CONVENTIONS.md`，此處摘要核心規則。

```
<slug>.<section>.<detail>

範例：
erc20.short                    → 選單簡述
erc20.intro                    → 白話文介紹
erc20.designPurpose            → 設計用途
erc20.commonUsage              → 常用用途
erc20.fn.transfer.desc         → 函式描述
erc20.fn.transfer.to           → 參數說明
erc20.node.user                → 流程圖節點 label
erc20.sim.transfer.name        → 模擬場景名稱
erc20.sim.transfer.step1       → 模擬步驟描述
simulation.controls.play       → 模擬面板通用文字（在 simulation namespace）
common.sidebar.search          → 通用 UI（在 common namespace）
```

**規則**：
- **namespace = 檔案名稱**：`common.json`、`home.json`、`simulation.json`、`erc20.json`、`uniswap-v3.json`...
- 通用文字放 `common` / `home` / `simulation` namespace
- **每個條目的 i18n 放獨立 namespace**（檔案名 = slug），DetailPage 進入時才 dynamic import `[v2 變更]`
- 全小寫 + camelCase，不用底線
- 所有 Agent 必須遵守此命名慣例，Agent 9 QA 時會交叉驗證

### 3.6 資料檔範例 (`src/data/standards/erc20.ts`) `[v2 變更]`

每個資料檔遵循 `ERCEntry` 介面，**使用 named export**。

```typescript
import type { StandardEntry } from '../types';

export const entry: StandardEntry = {
  slug: 'erc20',
  name: 'ERC-20',
  entryType: 'standard',
  eipNumber: 20,
  shortDescription: 'erc20.short',    // i18n key → "Token Standard"
  category: 'token',
  officialUrl: 'https://eips.ethereum.org/EIPS/eip-20',
  introduction: 'erc20.intro',
  designPurpose: 'erc20.designPurpose',
  commonUsage: 'erc20.commonUsage',
  functions: [
    {
      name: 'transfer',
      signature: 'transfer(address,uint256)',
      type: 'write',
      params: [
        { name: 'to', type: 'address', description: 'erc20.fn.transfer.to' },
        { name: 'amount', type: 'uint256', description: 'erc20.fn.transfer.amount' },
      ],
      returns: [{ name: 'success', type: 'bool', description: 'erc20.fn.transfer.returns' }],
      description: 'erc20.fn.transfer.desc',
      defaultSimValues: { to: '0xAbC...123', amount: '1000000000000000000' },
    },
    // ... balanceOf, approve, transferFrom, allowance, totalSupply
  ],
  flowNodes: [
    // 注意：不含 position，由 elkjs 自動佈局
    { id: 'user', type: 'user', label: 'erc20.node.user', data: {} },
    { id: 'erc20', type: 'contract', label: 'erc20.node.contract', data: { functions: ['transfer', 'approve'] } },
    // ...
  ],
  flowEdges: [ /* ... */ ],
  elkLayoutOptions: { 'elk.algorithm': 'layered', 'elk.direction': 'RIGHT' },
  simulations: [ /* ... */ ],
  relatedSlugs: ['erc721', 'erc1155', 'erc2612', 'erc4626'],
  sortOrder: 100,
};
```

---

## 4. 核心功能實作規範

### 4.1 路由 & Lazy Loading

```typescript
// src/router.tsx
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import AppShell from './components/layout/AppShell';
import SkeletonBlock from './components/common/SkeletonBlock';

const HomePage = lazy(() => import('./pages/HomePage'));
const DetailPage = lazy(() => import('./pages/DetailPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      {
        path: '/',
        element: (
          <Suspense fallback={<SkeletonBlock type="home" />}>
            <HomePage />
          </Suspense>
        ),
      },
      {
        path: '/:slug',
        element: (
          <Suspense fallback={<SkeletonBlock type="detail" />}>
            <DetailPage />
          </Suspense>
        ),
      },
      {
        path: '*',
        element: (
          <Suspense fallback={null}>
            <NotFoundPage />
          </Suspense>
        ),
      },
    ],
  },
]);
```

**DetailPage 的 slug 驗證**：

```typescript
// src/pages/DetailPage.tsx (核心邏輯)
const { slug } = useParams<{ slug: string }>();
const [entry, setEntry] = useState<ERCEntry | null>(null);
const [notFound, setNotFound] = useState(false);

useEffect(() => {
  if (!slug) return;
  getEntryBySlug(slug).then((e) => {
    if (e) setEntry(e);
    else setNotFound(true);
  });
}, [slug]);

if (notFound) return <Navigate to="/404" replace />;
```

### 4.2 主題系統

**CSS 變數方案**：在 `src/styles/themes.css` 定義 dark/light 兩組變數。  
所有變數加 `--erc-` 前綴，防止外部衝突。`[v2 變更]`：新增語義層變數。

```css
/* themes.css */
:root {
  /* ─── Dark theme (預設) ─── */
  --erc-color-bg-primary: #0a0e17;
  --erc-color-bg-secondary: #111827;
  --erc-color-bg-tertiary: #1e293b;
  --erc-color-text-primary: #f1f5f9;
  --erc-color-text-secondary: #94a3b8;
  --erc-color-text-muted: #64748b;
  --erc-color-accent: #6366f1;
  --erc-color-accent-hover: #818cf8;
  --erc-color-border: #1e293b;
  --erc-color-sidebar-bg: #0f1420;
  --erc-color-node-bg: #1a1f2e;
  --erc-color-node-border: #334155;
  --erc-color-edge-animated: #6366f1;
  --erc-color-success: #22c55e;
  --erc-color-warning: #f59e0b;
  --erc-color-error: #ef4444;

  /* ─── 語義層 [v2 新增] ─── */
  --erc-color-fn-read: var(--erc-color-success);
  --erc-color-fn-write: var(--erc-color-warning);
  --erc-color-fn-event: #a855f7;
  --erc-color-sim-active: var(--erc-color-accent);
  --erc-color-sim-completed: var(--erc-color-success);
  --erc-color-sim-pending: var(--erc-color-text-muted);
  --erc-color-category-token: #22c55e;
  --erc-color-category-nft: #f59e0b;
  --erc-color-category-proxy: #a855f7;
  --erc-color-category-defi: #3b82f6;
  --erc-color-category-account: #ec4899;
}

[data-theme='light'] {
  --erc-color-bg-primary: #ffffff;
  --erc-color-bg-secondary: #f8fafc;
  --erc-color-bg-tertiary: #f1f5f9;
  --erc-color-text-primary: #0f172a;
  --erc-color-text-secondary: #475569;
  --erc-color-text-muted: #94a3b8;
  --erc-color-accent: #4f46e5;
  --erc-color-accent-hover: #6366f1;
  --erc-color-border: #e2e8f0;
  --erc-color-sidebar-bg: #f8fafc;
  --erc-color-node-bg: #ffffff;
  --erc-color-node-border: #e2e8f0;
  --erc-color-edge-animated: #4f46e5;
  --erc-color-success: #16a34a;
  --erc-color-warning: #d97706;
  --erc-color-error: #dc2626;
  --erc-color-fn-event: #7c3aed;
}
```

**Zustand store [v2 變更]：純狀態，不含 DOM side effect**：

```typescript
// src/stores/useThemeStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'dark' | 'light';

interface ThemeStore {
  theme: Theme;
  toggle: () => void;
  set: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: 'dark',
      toggle: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
      set: (theme) => set({ theme }),
    }),
    { name: 'erc-explorer-theme' }
  )
);
```

```typescript
// src/hooks/useThemeSync.ts [v2 新增]
// 在 App.tsx 中使用，訂閱 store 變化同步 DOM attribute
import { useEffect } from 'react';
import { useThemeStore } from '@/stores/useThemeStore';

export function useThemeSync() {
  const theme = useThemeStore((s) => s.theme);
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
}
```

### 4.3 國際化 (i18n) `[v2 變更]`

```typescript
// src/i18n/config.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import resourcesToBackend from 'i18next-resources-to-backend';

i18n
  .use(
    resourcesToBackend(
      (language: string, namespace: string) =>
        import(`./locales/${language}/${namespace}.json`)
    )
  )
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'zh-CN', 'zh-TW', 'ja', 'ko', 'es'],
    // [v2 變更] 預設只載入通用 namespace；條目 namespace 在 DetailPage 中動態載入
    ns: ['common', 'home', 'simulation'],
    defaultNS: 'common',
    detection: {
      order: ['navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
    interpolation: { escapeValue: false },
    react: { useSuspense: true },
  });

export default i18n;
```

```typescript
// DetailPage.tsx 中動態載入條目語言包
const { i18n } = useTranslation();

useEffect(() => {
  if (slug) {
    i18n.loadNamespaces(slug); // 按需載入 erc20.json / uniswap-v3.json 等
  }
}, [slug, i18n]);
```

### 4.4 側邊欄 & 搜尋

```
┌─────────────────────────┐
│  🔍 搜尋欄 (sticky)      │  ← CSS: position: sticky; top: 0; z-index: 10
├─────────────────────────┤
│  📂 Token Standards      │  ← 分類 header
│    ├─ ERC-20  Token Std  │
│    └─ ERC-4626 Vault     │
│  📂 NFT Standards        │
│    ├─ ERC-721  NFT Std   │
│    └─ ERC-2981 Royalty   │
│  📂 Proxy Patterns       │
│    └─ ...                │
│  📂 Account Abstraction  │
│    ├─ ERC-4337           │
│    ├─ ERC-7579           │  ← [v2 新增]
│    ├─ ERC-7702           │
│    └─ ERC-6551           │
│  📂 Identity             │  ← [v2 新增]
│    └─ ERC-4361 SIWE      │
│  📂 DeFi Protocols       │
│    ├─ Uniswap V4         │
│    └─ Aave V3            │
│  📂 Governance           │
│    ├─ Safe Multisig      │
│    └─ OZ Governor        │
│  ...                     │
└─────────────────────────┘
```

- 選單資料來自 `allMeta.ts` 的靜態匯入 `[v2 變更]`，依 `CATEGORY_ORDER` 常數分組、依 `sortOrder` 排序
- 搜尋使用 minisearch，搜尋鍵為 `[name, shortDescription]`
- 搜尋輸入加 `300ms debounce`（使用 `usehooks-ts` 的 `useDebounce`）
- 當前選中項目以 accent 色高亮，URL 同步 `/:slug`

### 4.5 SEO 策略 `[v2 變更]`

```typescript
// src/components/common/SEOHead.tsx — React 19 原生 metadata
interface SEOHeadProps {
  title: string;
  description: string;
  slug?: string;
}

export function SEOHead({ title, description, slug }: SEOHeadProps) {
  const fullTitle = `${title} — ERC Explorer`;
  const url = slug
    ? `https://erc-explorer.example.com/${slug}`
    : 'https://erc-explorer.example.com';
  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={slug ? `/og/${slug}.png` : '/og-image.png'} />
    </>
  );
}
```

> **v2 變更**：
> - 移除 HelmetProvider 和 react-helmet-async 依賴
> - React 19 在 component 中渲染的 `<title>` / `<meta>` 會自動提升至 `<head>`
> - og:image 支援每條目獨立圖片（由 `generate_og_images.py` 產生）

### 4.6 模擬引擎 `[v2 變更]`

**架構**：

```
SimulationPanel (UI, 由 Agent 7 負責)
       │
       ▼
useSimulation() hook ←→ useSimulationStore (Zustand，唯一模擬狀態來源)
       │
       ▼
SimulationEngine.ts
       │ (如果步驟涉及複雜計算)
       ▼
simWorker (comlink-wrapped Web Worker)
```

> **v2 變更**：
> - Worker 改用 comlink 封裝，呼叫方式為 `const result = await simWorker.computeSwap(params)`
> - 不需要手寫 postMessage / onmessage / switch-case handler
> - 不需要 requestId（comlink 內建配對）

### 4.7 Error Boundary 策略

```typescript
// App.tsx 最外層 [v2 變更：移除 HelmetProvider]
<ErrorBoundary fallback={<ErrorFallback />}>
  <RouterProvider router={router} />
</ErrorBoundary>

// FlowCanvas 外層
<FlowErrorBoundary>
  <FlowCanvas nodes={entry.flowNodes} edges={entry.flowEdges} />
</FlowErrorBoundary>
```

- 全域 ErrorBoundary：攔截未預期的 render error，顯示「重新整理」按鈕
- FlowErrorBoundary：流程圖渲染失敗時顯示文字替代描述，不影響其餘頁面區塊
- Web Worker 錯誤：comlink 會自動將 Worker 端 throw 的 error 傳回主執行緒，在 SimulationEngine 內部 catch 後透過 store 顯示錯誤提示
- **所有 error boundary 預留 `onError` 回呼**，方便未來接入 Sentry 等錯誤監控 `[v2 新增]`

### 4.8 無障礙 (Accessibility) 基線規範

> 以下規範 **各 Agent 在開發時即應遵守**，而非全部推遲到 Agent 9 QA。

- 所有互動元素（按鈕、連結、切換器）必須有 `aria-label` 或可見文字
- 鍵盤導航：Sidebar 可用 ↑↓ + Enter 操作；模擬面板可用 Tab 巡覽
- 流程圖有 `aria-label` 描述整體結構（如「ERC-20 合約互動流程圖，包含 6 個節點」）
- 所有動畫尊重 `prefers-reduced-motion`：使用 `useReducedMotion()` hook，條件降級

---

## 5. 收錄清單

### 5.1 ERC 標準（22 項）`[v2 變更：新增 3 項]`

| Slug | 名稱 | 類別 | 選單描述 |
|------|------|------|----------|
| erc20 | ERC-20 | token | Fungible Token Standard |
| erc721 | ERC-721 | nft | Non-Fungible Token Standard |
| erc1155 | ERC-1155 | nft | Multi-Token Standard |
| erc4626 | ERC-4626 | token | Tokenized Vault Standard |
| erc2612 | ERC-2612 | token | Permit (Gasless Approval) |
| erc165 | ERC-165 | utility | Interface Detection |
| erc173 | ERC-173 | utility | Ownership Standard |
| erc2981 | ERC-2981 | nft | NFT Royalty Standard |
| erc1967 | ERC-1967 | proxy | Transparent Proxy Storage |
| erc1822 | ERC-1822 | proxy | UUPS Proxy |
| erc2535 | ERC-2535 | proxy | Diamond (Multi-Facet) Proxy |
| erc4337 | ERC-4337 | account | Account Abstraction |
| erc6551 | ERC-6551 | account | Token Bound Accounts |
| erc7702 | ERC-7702 | account | Set EOA Account Code (Pectra) |
| erc1271 | ERC-1271 | utility | Contract Signature Validation |
| erc3525 | ERC-3525 | token | Semi-Fungible Token (SFT) |
| erc3643 | ERC-3643 | rwa | Security Token (T-REX) |
| erc5267 | ERC-5267 | utility | EIP-712 Domain Discovery |
| erc7683 | ERC-7683 | cross-chain | Cross-Chain Intents Standard |
| **erc7579** | **ERC-7579** | **account** | **Modular Smart Accounts** `[v2 新增]` |
| **erc4361** | **ERC-4361** | **identity** | **Sign-In with Ethereum (SIWE)** `[v2 新增]` |
| **erc6900** | **ERC-6900** | **account** | **Modular Accounts (Alchemy)** `[v2 新增]` |

> **v2 新增 3 項說明**：
> - **ERC-7579**：模組化智慧帳戶介面標準，Safe / Biconomy / ZeroDev / OKX 皆已實作。與 ERC-4337 搭配講解「帳戶抽象 + 模組化」全景。教學重點：module type（validator / executor / fallback handler）、install / uninstall 流程。
> - **ERC-4361**：Sign-In with Ethereum，2025 年 Final 化。連接 Web2 身份與 Web3 錢包的橋梁。配合 ERC-1271（合約簽名驗證）和 ERC-5267（EIP-712 domain）形成「簽名與驗證三部曲」。
> - **ERC-6900**：Alchemy 主導的模組化帳戶標準，設計哲學（嚴格型）與 ERC-7579（最小型）形成對比教材。教學重點：兩種標準設計哲學的取捨。

### 5.2 常見協議/合約（12 項）

| Slug | 名稱 | 類別 | 選單描述 |
|------|------|------|----------|
| uniswap-v2 | Uniswap V2 | defi | AMM / DEX (Classic) |
| uniswap-v3 | Uniswap V3 | defi | Concentrated Liquidity AMM |
| uniswap-v4 | Uniswap V4 | defi | Hooks Architecture AMM |
| aave-v3 | Aave V3 | defi | Lending & Borrowing |
| compound-v3 | Compound V3 | defi | Lending (Comet) |
| maker-dao | MakerDAO | defi | CDP / DAI Stablecoin |
| chainlink-oracle | Chainlink | oracle | Decentralized Oracle |
| oneinch-aggregator | 1inch | defi | DEX Aggregator |
| lido-steth | Lido stETH | defi | Liquid Staking |
| curve-stableswap | Curve | defi | StableSwap AMM |
| safe-multisig | Safe | governance | Multisig Wallet |
| eigenlayer | EigenLayer | defi | Restaking Protocol |
| oz-governor | OZ Governor | governance | On-Chain Governance |

---

## 6. Sub-Agent 分工 `[v2 大幅變更]`

將專案拆為 **12 個 Sub-Agent** 順序/平行執行。
依賴關係以 `→` 表示「必須先完成」。

```
第 1 輪（平行）：
  ├── Agent 1: Scaffold
  ├── Agent 4A-1: Types + Token 類 ERC Data (6 個)
  ├── Agent 4A-2: Proxy + Utility 類 ERC Data (8 個，等 types.ts)
  └── Agent 4A-3: Account + Identity + Cross-Chain + RWA Data (8 個，等 types.ts)

第 2 輪（Agent 1 完成後平行）：
  ├── Agent 2: Theme System
  ├── Agent 3: i18n
  └── Agent 4B-1: DeFi Protocol Data (7 個，等 types.ts)
      Agent 4B-2: Governance + Other Protocol Data (6 個，等 types.ts)

第 3 輪（Agent 2 + 3 + 4A-1 完成後平行）：
  ├── Agent 5: Layout & Pages
  ├── Agent 6: Flow Visualization Engine + Panels
  └── Agent 7: Simulation Engine (純邏輯)

第 4 輪：
  └── Agent 8: Integration & QA + E2E
```

> **v2 變更**：
> - Agent 4A 拆為 3 個 sub-agent（Token / Proxy+Utility / Account+Identity+CrossChain+RWA），可平行執行
> - Agent 4B 拆為 2 個 sub-agent（DeFi / Governance+Other），可平行執行
> - 新增 3 個 ERC 標準分配到 Agent 4A-3
> - Agent 8 包含 E2E 測試

---

### 6.1 Sub-Agent 交接協議 `[v2 新增]`

#### 6.1.1 核心原則

每個 Sub-Agent 都是**獨立的 Claude context**，彼此無法直接對話。  
所有溝通都透過**檔案系統**（共用的 git repo 工作目錄）進行。  
因此交接不是「傳話」，而是「留下正確的檔案 + 可驗證的狀態」。

```
┌──────────┐    寫入檔案 + 標記完成     ┌──────────────┐
│ Agent N  │ ─────────────────────────→ │ 共用工作目錄  │
└──────────┘                            │  (git repo)  │
                                        └──────┬───────┘
                                               │ 讀取檔案 + 驗證
                                               ▼
                                        ┌──────────┐
                                        │ Agent N+1│
                                        └──────────┘
```

#### 6.1.2 交接三要素

每組 Agent 間的交接都必須同時滿足：

| 要素 | 說明 | 驗證方式 |
|------|------|----------|
| **產出物清單** | 明確列出該 Agent 必須產出的所有檔案路徑 | 下游 Agent 啟動時檢查檔案是否存在 |
| **介面契約** | 產出物必須符合的型別 / schema / 格式 | TypeScript 編譯通過 + `validate_registry.py` |
| **完成標記** | Agent 完成後在 `docs/agent-status/` 留下狀態檔 | 下游 Agent 啟動時讀取狀態檔判斷是否可開工 |

#### 6.1.3 狀態檔機制

每個 Agent 完成時（無論成功或失敗）必須產出一個 JSON 狀態檔至 `docs/agent-status/`。

**型別定義**（建議放在 `scripts/types/agent-status.ts`，供 `orchestrate.py` 和 `verify_handoff.py` 以同源 JSON Schema 驗證）`[v2 新增]`：

```typescript
/** Agent 狀態檔型別 — orchestrate.py / verify_handoff.py 共用 */
export type AgentStatus = 'completed' | 'partial' | 'failed' | 'blocked';

export interface AgentValidationResults {
  tscCompile: boolean;
  validateRegistry: boolean;
  lintI18nKeys: boolean;
}

export interface AgentStatusFile {
  agent: string;                      // e.g. "agent-4a1-token-data"
  status: AgentStatus;
  timestamp: string;                  // ISO 8601
  outputFiles: string[];              // 實際產出的所有檔案（相對路徑）
  pendingFiles: string[];             // status=partial 時，尚未完成的檔案
  validationResults: AgentValidationResults;
  knownIssues: string[];              // 已知但非阻塞的問題
  notes: string;                      // 給下游 Agent 的備註
}
```

**範例**：

```jsonc
{
  "agent": "agent-4a1-token-data",
  "status": "completed",
  "timestamp": "2026-04-02T10:30:00Z",
  "outputFiles": [
    "src/data/types.ts",
    "src/data/allMeta.ts",
    "src/data/registry.ts",
    "src/features/simulation/workerApi.ts",
    "src/data/standards/erc20.ts",
    "src/data/standards/erc721.ts",
    "src/data/standards/erc1155.ts",
    "src/data/standards/erc4626.ts",
    "src/data/standards/erc2612.ts",
    "src/data/standards/erc3525.ts"
  ],
  "pendingFiles": [],
  "validationResults": {
    "tscCompile": true,
    "validateRegistry": true,
    "lintI18nKeys": true
  },
  "knownIssues": [],
  "notes": ""
}
```

#### 6.1.4 各 Agent 的產出物契約

**Agent 1 → Agent 2, 3, 5**：

| 產出物 | 用途 | 驗證條件 |
|--------|------|----------|
| `package.json` + `node_modules/` | 所有依賴已安裝 | `npm ls --depth=0` 無 error |
| `vite.config.ts` | 構建設定 | `npm run dev` 可啟動 |
| `tsconfig*.json` | TypeScript 設定 | `npx tsc --noEmit` 通過（空專案） |
| `eslint.config.js` + `.prettierrc` | Linting 設定 | `npm run lint` 通過 |
| 完整目錄結構（空檔案佔位） | 所有路徑就位 | 目錄結構與 §2 一致 |

**Agent 4A-1 → Agent 4A-2, 4A-3, 4B-1, 4B-2, 6, 7**：

| 產出物 | 用途 | 驗證條件 |
|--------|------|----------|
| `src/data/types.ts` | 所有型別定義 | `npx tsc --noEmit` 通過 |
| `src/data/allMeta.ts` | Meta 靜態陣列 | import 不報錯、陣列長度 > 0 |
| `src/data/registry.ts` | Lazy loader | import 不報錯 |
| `src/features/simulation/workerApi.ts` | Worker API 型別 | import 不報錯 |
| 6 個 Token 類資料檔 | 資料內容 | `validate_registry.py` 通過 |

> types.ts 是全專案的型別基礎，為最關鍵的交接點。下游資料 Agent 啟動前若狀態為 `partial`，只要 types.ts 和 workerApi.ts 在 outputFiles 中即可繼續（資料檔可缺，型別檔不能缺）。

**Agent 2 + 3 → Agent 5**：

| Agent | 產出物 | 驗證 |
|-------|--------|------|
| Agent 2 | `themes.css` / `globals.css` / `useThemeStore.ts` / `useThemeSync.ts` / `ThemeToggle.tsx` / `useReducedMotion.ts` / `reactflow-overrides.css` | 切換 ThemeToggle 全站配色變更 |
| Agent 3 | `i18n/config.ts` / 所有 locale JSON / `LanguageSwitcher.tsx` / `I18N_CONVENTIONS.md` | 切換語言 UI 文字更新 |

**Agent 5 + 6 + 7 → Agent 8**：

驗證條件：`npm run build` 無 error、`npm run dev` 後首頁可載入、至少一個 DetailPage 可渲染。

#### 6.1.5 交接 Prompt 模板

每個 Agent 啟動時，Orchestrator（人類或自動化腳本）需要提供一份 **context prompt**：

```markdown
# Agent {N} 啟動指令

## 你的身份
你是 ERC Explorer 專案的 Agent {N}（{名稱}）。

## 讀取文件
1. 閱讀 `setup-v2.md` 的 §{相關章節}
2. 閱讀 `docs/agent-status/` 中所有前置 Agent 的狀態檔

## 前置驗證（先做，再開工）
{列出該 Agent 的啟動前驗證步驟}

若前置驗證失敗：
- 將失敗原因寫入 `docs/agent-status/agent-{N}-{name}.json`（status: "blocked"）
- 停止工作，回報哪個前置 Agent 的產出有問題

## 任務清單
{從 setup-v2.md 複製該 Agent 的任務清單}

## 完成後
1. 執行驗收標準中的所有檢查
2. 產出 `docs/agent-status/agent-{N}-{name}.json`
3. 列出所有產出檔案路徑
4. 列出任何已知問題或給下游的備註
```

#### 6.1.6 Orchestrator 流程

無論是人類手動還是自動化腳本，協調流程如下：

```
Orchestrator 主迴圈：
1. 啟動第 1 輪可平行的 Agent（1, 4A-1）
2. 輪詢 docs/agent-status/*.json
3. 當某 Agent completed：
   a. 驗證其 outputFiles 全部存在
   b. 跑 npx tsc --noEmit（增量型別檢查）
   c. 標記該 Agent 的下游為「可啟動」
4. 啟動新解鎖的 Agent（帶入 context prompt）
5. 重複 2-4 直到 Agent 8 completed
```

---

### 6.2 故障恢復：Frozen / Timeout 處理 `[v2 新增]`

#### 6.2.1 故障類型與判定

| 類型 | 判定條件 | 嚴重度 |
|------|----------|--------|
| **Timeout** | Agent 超過預設時間未產出狀態檔（建議閾值：單 Agent 45 分鐘） | 中 |
| **Frozen** | Agent 停止輸出但 session 未結束（檔案修改時間偵測） | 中 |
| **Partial Failure** | Agent 產出狀態檔但 `status: "partial"`，部分檔案缺失 | 低–中 |
| **Hard Failure** | Agent 產出 `status: "failed"`，或 context window 耗盡中斷 | 高 |
| **Corruption** | Agent 產出的檔案無法通過型別檢查或 validate_registry | 高 |

#### 6.2.2 活躍偵測（隱式心跳）`[v2 變更]`

不使用額外的 heartbeat 檔案（Claude Agent 執行時不一定能穿插額外的 bash 命令）。  
改為**監控該 Agent 負責的檔案路徑的最後修改時間**作為隱式心跳：

```python
# orchestrate.py 中的 frozen 偵測邏輯
def check_agent_alive(agent_name: str, output_paths: list[str], timeout_minutes: int = 15) -> bool:
    """檢查 Agent 是否仍在活躍工作。
    掃描該 Agent 負責的所有檔案路徑，以最晚的修改時間為準。"""
    latest_mtime = max(
        (os.path.getmtime(p) for p in output_paths if os.path.exists(p)),
        default=0,
    )
    if latest_mtime == 0:
        # 尚未產出任何檔案，以狀態檔目錄的建立時間為準
        return True  # 給予初始寬限
    minutes_since = (time.time() - latest_mtime) / 60
    return minutes_since < timeout_minutes
```

**判定規則**：
- Orchestrator 每 5 分鐘掃描該 Agent 負責的檔案路徑（從 setup-v2.md 的任務清單推導）
- 若所有相關檔案的最後修改時間超過 **15 分鐘**未更新，判定為 frozen
- 若超過 **45 分鐘**且無狀態檔產出，判定為 timeout

#### 6.2.3 恢復策略

**策略 A：續接（Resume）** — 適用於 Partial / Timeout / Frozen

當 Agent 部分完成時，啟動一個**續接 Agent**，在既有產出上繼續工作。關鍵設計：續接 Agent 不需要重做已完成的工作，讀取狀態檔就知道哪些做完了。

```markdown
# Agent {N} 續接指令

## 背景
Agent {N}（{名稱}）在執行中 timeout/frozen。已完成部分工作，需要你接手完成。

## 讀取文件
1. setup-v2.md §{章節}
2. docs/agent-status/agent-{N}-{name}.json（看 outputFiles 和 pendingFiles）

## 你的任務
1. 檢查 outputFiles 中列出的檔案是否確實存在且有效
2. 用 npx tsc --noEmit 確認目前狀態可編譯
3. 完成 pendingFiles 中列出的剩餘檔案
4. 若 pendingFiles 為空，根據 setup-v2.md 的任務清單判斷哪些項目未完成
5. 完成後更新狀態檔（覆寫原有的，status 改為 "completed"）
```

**策略 B：重跑（Retry）** — 適用於 Hard Failure / Corruption

當 Agent 的產出完全不可用時，清除產出後從頭重跑。

```bash
# 1. 備份失敗 Agent 的產出
mkdir -p docs/agent-failures/agent-{N}-attempt-{M}
cp -r {該 Agent 的產出路徑} docs/agent-failures/agent-{N}-attempt-{M}/

# 2. 清除失敗的產出（只清除該 Agent 負責的檔案，不動其他 Agent 的）

# 3. 刪除狀態檔
rm docs/agent-status/agent-{N}-{name}.json

# 4. 重新啟動 Agent（用原始 context prompt）
```

**策略 C：降級（Degrade）** — 適用於非關鍵 Agent 反覆失敗（≥ 2 次）

標記狀態為 `"partial"`，在 `pendingFiles` 中記錄缺失的條目，下游 Agent 讀取到 partial 狀態時跳過缺失的條目繼續工作，Agent 8 QA 時將缺失條目列入 TODO。

#### 6.2.4 決策樹

```
Agent 異常
  │
  ├─ 有狀態檔？
  │   ├─ Yes → 讀取 status
  │   │   ├─ "completed" 但驗證失敗 → 策略 B（重跑）
  │   │   ├─ "partial" + outputFiles 非空 → 策略 A（續接）
  │   │   ├─ "failed" → 檢查 outputFiles
  │   │   │   ├─ 有有效產出 → 策略 A（續接）
  │   │   │   └─ 產出全壞 → 策略 B（重跑）
  │   │   └─ "blocked" → 前置 Agent 未就緒
  │   │       └─ 等待前置 Agent 完成後，Orchestrator 自動重新觸發本 Agent
  │   │
  │   └─ No → 檢查檔案修改時間（隱式心跳）
  │       ├─ 相關檔案最近 15 分鐘內有修改 → 繼續等待
  │       ├─ 超過 15 分鐘無修改 → 判定 frozen
  │       │   └─ 檢查已產出的檔案
  │       │       ├─ 有有效產出 → 手動建立 partial 狀態檔 → 策略 A
  │       │       └─ 無有效產出 → 策略 B（重跑）
  │       └─ 超過 45 分鐘且無任何檔案產出 → 判定 timeout → 策略 B
  │
  └─ 已重試 ≥ 2 次同一 Agent？
      └─ Yes → 策略 C（降級），記錄到 knownIssues，繼續推進下游
```

#### 6.2.5 下游 Agent 的防禦性讀取

每個 Agent 啟動時都必須進行防禦性檢查，不盲目信任前置 Agent：

```markdown
## 前置驗證（必須逐項檢查）

1. 讀取 `docs/agent-status/agent-{前置}-{name}.json`
   - 若不存在 → 停止，回報「Agent {前置} 未完成」
   - 若 status 為 "failed" → 停止，回報「Agent {前置} 失敗」
   - 若 status 為 "partial" → 檢查 outputFiles 是否包含你需要的檔案
   - 若你硬性需要的檔案不在 outputFiles → 停止

2. 執行 `npx tsc --noEmit`
   - 若失敗 → 停止，回報「前置 Agent 產出有型別錯誤」

所有檢查通過後才開始正式工作。
```

#### 6.2.6 型別破壞性變更禁止規則 `[v2 新增]`

**核心規則：下游 Agent 不得修改上游 Agent 產出的型別檔。**

若 Agent 6（Flow Engine）在開發過程中發現 `FlowNodeDef` 需要增加新欄位，或 Agent 7 需要擴充 `SimWorkerApi`：

1. **禁止**直接修改 `src/data/types.ts` 或 `src/features/simulation/workerApi.ts`
2. 將需求記錄到自己的狀態檔 `knownIssues` 中，格式如下：

```jsonc
"knownIssues": [
  "需要在 FlowNodeDef 新增 'group' 欄位以支援節點分群顯示（影響 types.ts）",
  "需要在 SimWorkerApi 新增 computeGovernanceVote 方法（影響 workerApi.ts）"
]
```

3. **Agent 8 QA** 階段統一處理所有 `knownIssues`：
   - 彙整所有 Agent 的型別變更需求
   - 一次性修改型別檔
   - 跑 `npx tsc --noEmit` 全量驗證
   - 跑 `validate_registry.py` 確認資料檔仍然相容

**理由**：若多個平行 Agent 各自修改型別檔，會產生 merge conflict 且破壞其他 Agent 已通過的型別檢查。集中在 QA 階段處理可避免連鎖故障。

---

### 6.3 Orchestrator 自動化腳本（建議）`[v2 新增]`

見 §8.1 的 `orchestrate.py` 和 `verify_handoff.py`。

---

### Agent 1：Project Scaffold

**職責**：建立專案骨架、安裝所有依賴、設定工具鏈。

**任務清單**：
1. 使用 `npm create vite@latest erc-explorer -- --template react-ts` 初始化
2. 安裝所有依賴：

```bash
# Core
npm i react-router-dom zustand @xyflow/react motion

# Layout [v2 變更: elkjs 取代 dagre]
npm i elkjs

# Worker RPC [v2 新增]
npm i comlink

# i18n
npm i i18next react-i18next i18next-browser-languagedetector i18next-resources-to-backend

# UI utilities
npm i minisearch shiki tailwind-merge

# Ethereum utilities (tree-shakable，僅用 formatEther / getAddress 等)
npm i viem

# Hooks
npm i usehooks-ts

# Dev [v2 變更: 移除 postcss autoprefixer，新增 playwright]
npm i -D tailwindcss @tailwindcss/vite
npm i -D eslint @eslint/js typescript-eslint prettier eslint-config-prettier
npm i -D vitest @testing-library/react @testing-library/jest-dom jsdom
npm i -D @playwright/test
```

3. 設定 `vite.config.ts`：

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'flow-vendor': ['@xyflow/react', 'elkjs'],
          'i18n-vendor': ['i18next', 'react-i18next'],
          'motion-vendor': ['motion'],
        },
      },
    },
  },
  worker: { format: 'es' },
});
```

4. 設定 TypeScript (`tsconfig.json`, `tsconfig.app.json`) — 嚴格模式, path alias `@/*`
5. 設定 ESLint flat config + Prettier
6. 建立完整目錄結構（空檔案佔位），包含 `docs/adr/` 和 `scripts/` 和 `e2e/`
7. 建立 `src/i18n/locales/` 目錄結構
8. 建立 `playwright.config.ts` 基礎設定

**驗收標準**：
- 可 `npm run dev` 啟動的空白專案，所有目錄和空檔就位
- 所有互動元素佔位已包含 `aria-label` 屬性

**完成後** `[v2 新增]`：
- 產出 `docs/agent-status/agent-1-scaffold.json`（含所有產出檔案路徑）
- 確認 `npm run dev` 可啟動、`npx tsc --noEmit` 通過

---

### Agent 2：Theme System

**前置依賴**：Agent 1 完成。

**啟動前驗證** `[v2 新增]`：
1. 讀取 `docs/agent-status/agent-1-scaffold.json` → status === "completed"
2. `npm run dev` 可啟動（3 秒內無 crash）
3. 確認 `src/` 目錄結構存在

**任務清單**：
1. 建立 `src/styles/themes.css` — 完整 CSS 變數定義（見 §4.2），使用 `--erc-` 前綴，**含語義層變數**
2. 建立 `src/styles/globals.css` — Tailwind directives + import themes.css
3. 建立 `src/stores/useThemeStore.ts` — Zustand persist store（**純狀態，不含 DOM 操作**）
4. 建立 `src/hooks/useThemeSync.ts` — 訂閱 store 同步 DOM attribute `[v2 新增]`
5. 建立 `src/components/common/ThemeToggle.tsx` — 切換按鈕（附帶 sun/moon icon 切換動畫）
6. 在 `App.tsx` 中呼叫 `useThemeSync()`
7. 建立 `src/styles/reactflow-overrides.css` — React Flow 元件樣式配合主題色
8. 建立 `src/hooks/useReducedMotion.ts` — 封裝 motion 的 `useReducedMotion`

**完成後** `[v2 新增]`：
- 產出 `docs/agent-status/agent-2-theme.json`
- 驗證 ThemeToggle 切換全站配色變更

---

### Agent 3：Internationalization `[v2 變更]`

**前置依賴**：Agent 1 完成。

**啟動前驗證** `[v2 新增]`：
1. 讀取 `docs/agent-status/agent-1-scaffold.json` → status === "completed"
2. `npm run dev` 可啟動
3. 確認 `src/i18n/` 目錄結構存在

**任務清單**：
1. 建立 `src/i18n/config.ts` — 使用 `i18next-resources-to-backend` + dynamic import（見 §4.3）
2. 建立 `src/i18n/locales/{en,zh-CN,zh-TW,ja,ko,es}/` 底下：
   - `common.json`：通用 UI（按鈕、導航等）
   - `home.json`：首頁內容
   - `simulation.json`：模擬面板通用文字
   - **每個條目一個 JSON 檔**（`erc20.json`, `uniswap-v3.json` 等）— 先建立空骨架 `[v2 變更]`
3. 建立 `src/components/common/LanguageSwitcher.tsx`
4. 在 `App.tsx` 中以 `<Suspense>` 包裝 i18n 初始化
5. 所有 6 種語言的 `common.json` 和 `home.json` 需完整翻譯
6. 條目 JSON 先完成英文版，其餘語言標記 `"TODO"` 佔位
7. 建立 `docs/I18N_CONVENTIONS.md` — 定義 key 命名規範（見 §3.5）
8. **i18n key 命名必須嚴格遵循 §3.5 規範**

**完成後** `[v2 新增]`：
- 產出 `docs/agent-status/agent-3-i18n.json`
- 驗證切換語言 UI 文字更新

---

### Agent 4A-1：Data Layer — Types + Token 類 ERC `[v2 變更：拆分]`

**前置依賴**：無（可與所有 Agent 平行）。

**職責**：型別定義 + 6 個 Token 類 ERC 標準。

**任務清單**：
1. 建立 `src/data/types.ts` — 完整型別定義（見 §3.1）
2. 建立 `src/data/allMeta.ts` — 所有 34 個條目的 meta 靜態陣列（見 §3.2）
3. 建立 `src/data/registry.ts` — lazy loader（見 §3.3）
4. 建立 `src/features/simulation/workerApi.ts` — comlink API 型別（見 §3.4）
5. 建立 6 個 Token 類 ERC 標準資料檔：

| 條目 | 流程圖複雜度 | 模擬重點 |
|------|------------|----------|
| ERC-20 | 中（6-8 節點）| transfer/approve/transferFrom 三步流 |
| ERC-721 | 中 | mint/transfer/safeTransfer 差異 |
| ERC-1155 | 中高 | batch transfer, URI 管理 |
| ERC-4626 | 高 | deposit/withdraw/redeem 的 share 計算 |
| ERC-2612 | 中 | permit 簽名→approve→transfer 無 gas 流 |
| ERC-3525 | 高 | value transfer between SFT slots |

**完成後** `[v2 新增]`：
- 產出 `docs/agent-status/agent-4a1-token-data.json`
- 確認 `npx tsc --noEmit` 通過 + `validate_registry.py` 通過
- 此為全專案最關鍵交接點（types.ts 為型別基礎），務必確保型別檔完整正確

---

### Agent 4A-2：Data Layer — Proxy + Utility 類 ERC `[v2 新增]`

**前置依賴**：Agent 4A-1（types.ts）完成。

**啟動前驗證** `[v2 新增]`：
1. 讀取 `docs/agent-status/agent-4a1-token-data.json` → status === "completed" 或 "partial"
2. 若 partial：確認 `src/data/types.ts` 和 `src/features/simulation/workerApi.ts` 在 outputFiles 中（硬性需求；ERC-2535 模擬需要 `computeFacetRoute`）
3. `npx tsc --noEmit` 通過

**職責**：8 個 Proxy + Utility 類 ERC 標準。

| 條目 | 流程圖複雜度 | 模擬重點 |
|------|------------|----------|
| ERC-165 | 低 | supportsInterface 查詢 |
| ERC-173 | 低 | ownership transfer |
| ERC-2981 | 中 | royaltyInfo 查詢 + marketplace 整合 |
| ERC-1271 | 中 | isValidSignature 驗簽流程 |
| ERC-5267 | 中 | EIP-712 domain 探索流程 |
| ERC-1967 | 高 | Transparent proxy delegatecall 資料流 |
| ERC-1822 | 高 | UUPS upgrade 流程 |
| ERC-2535 | 極高 | Diamond 多 facet 路由 + fallback |

**完成後** `[v2 新增]`：
- 產出 `docs/agent-status/agent-4a2-proxy-utility-data.json`
- 確認 `validate_registry.py` 通過

---

### Agent 4A-3：Data Layer — Account + Identity + Cross-Chain + RWA 類 ERC `[v2 新增]`

**前置依賴**：Agent 4A-1（types.ts）完成。

**啟動前驗證** `[v2 新增]`：
1. 讀取 `docs/agent-status/agent-4a1-token-data.json` → status === "completed" 或 "partial"
2. 確認 `src/data/types.ts` 和 `src/features/simulation/workerApi.ts` 在 outputFiles 中
3. `npx tsc --noEmit` 通過

**職責**：8 個 ERC 標準（含 v2 新增的 3 個）。

| 條目 | 流程圖複雜度 | 模擬重點 |
|------|------------|----------|
| ERC-4337 | 極高 | UserOp → Bundler → EntryPoint → Account 全流程 |
| ERC-6551 | 高 | NFT → TBA creation → TBA execution |
| ERC-7702 | 高 | EOA → 設定合約 code → 透過合約邏輯執行 |
| ERC-3643 | 高 | compliance check → transfer → identity registry |
| ERC-7683 | 高 | cross-chain intent → filler → settlement |
| **ERC-7579** | **高** | **module install → validator/executor/fallback → 跨帳戶互通** |
| **ERC-4361** | **中** | **SIWE message 構造 → 錢包簽名 → 伺服器驗證 → session** |
| **ERC-6900** | **高** | **plugin install → hook 執行 → 與 ERC-7579 對比** |

**完成後** `[v2 新增]`：
- 產出 `docs/agent-status/agent-4a3-account-identity-data.json`
- 確認 `validate_registry.py` 通過

---

### Agent 4B-1：Data Layer — DeFi Protocols `[v2 變更：拆分]`

**前置依賴**：Agent 4A-1（型別定義）完成。

**啟動前驗證** `[v2 新增]`：
1. 讀取 `docs/agent-status/agent-4a1-token-data.json` → status === "completed" 或 "partial"
2. 確認 `src/data/types.ts` 和 `src/features/simulation/workerApi.ts` 在 outputFiles 中
3. `npx tsc --noEmit` 通過

**職責**：7 個 DeFi 協議資料檔。

| 條目 | 流程圖複雜度 | 模擬重點 |
|------|------------|----------|
| Uniswap V2 | 高 | swap 恆定乘積, addLiquidity 資金流 |
| Uniswap V3 | 極高 | 集中流動性 tick range, swap 跨 tick |
| Uniswap V4 | 極高 | Hook 生命週期（beforeSwap/afterSwap）|
| Aave V3 | 極高 | supply → borrow → liquidation 全流程 |
| Compound V3 | 高 | Comet 模型的 supply/borrow |
| 1inch | 高 | 路由拆分 → 多 DEX 聚合資金流 |
| Curve | 高 | StableSwap 不變量 vs 恆定乘積對比 |

**完成後** `[v2 新增]`：
- 產出 `docs/agent-status/agent-4b1-defi-data.json`
- 確認 `validate_registry.py` 通過

---

### Agent 4B-2：Data Layer — Governance + Other Protocols `[v2 新增]`

**前置依賴**：Agent 4A-1（型別定義）完成。

**啟動前驗證** `[v2 新增]`：
1. 讀取 `docs/agent-status/agent-4a1-token-data.json` → status === "completed" 或 "partial"
2. 確認 `src/data/types.ts` 在 outputFiles 中
3. `npx tsc --noEmit` 通過

**職責**：6 個協議資料檔。

| 條目 | 流程圖複雜度 | 模擬重點 |
|------|------------|----------|
| MakerDAO | 極高 | CDP open → lock → draw → wipe → shutdown |
| Chainlink | 中 | Request → Aggregator → Round data |
| Lido stETH | 中高 | stake → stETH mint → rebase 機制 |
| Safe | 高 | propose → confirm → execute multisig 流程 |
| EigenLayer | 高 | deposit → delegation → operator → slashing |
| OZ Governor | 高 | propose → vote → queue (timelock) → execute |

**完成後** `[v2 新增]`：
- 產出 `docs/agent-status/agent-4b2-governance-data.json`
- 確認 `validate_registry.py` 通過

---

### Agent 5：Layout & Pages

**前置依賴**：Agent 1 + Agent 2 + Agent 3 完成。

**啟動前驗證** `[v2 新增]`：
1. 讀取 `docs/agent-status/agent-1-scaffold.json` → completed
2. 讀取 `docs/agent-status/agent-2-theme.json` → completed
3. 讀取 `docs/agent-status/agent-3-i18n.json` → completed
4. `npm run dev` 可啟動
5. ThemeToggle 和 LanguageSwitcher 可渲染（不報錯）

（同 v1 內容，主要差異：）
- `SEOHead.tsx` 改為 React 19 原生版（見 §4.5）
- `App.tsx` 不需要 `HelmetProvider`
- Sidebar 資料來源改為 `import { allMeta } from '@/data/allMeta'`（靜態匯入）

**完成後** `[v2 新增]`：
- 產出 `docs/agent-status/agent-5-layout.json`
- 驗證首頁可載入、Sidebar 可渲染

---

### Agent 6：Flow Visualization Engine + Panels

**前置依賴**：Agent 1 + Agent 2 + Agent 4A-1（型別定義）完成。

**啟動前驗證** `[v2 新增]`：
1. 讀取 `docs/agent-status/agent-1-scaffold.json` → completed
2. 讀取 `docs/agent-status/agent-2-theme.json` → completed
3. 讀取 `docs/agent-status/agent-4a1-token-data.json` → completed 或 partial（需 types.ts）
4. `npx tsc --noEmit` 通過

**任務清單** `[v2 變更]`：
1. 建立 `src/components/flow/useElkLayout.ts` — elkjs 佈局 hook 封裝
2. 建立 `src/components/flow/FlowCanvas.tsx` — 接收 `FlowNodeDef[]` 和 `FlowEdgeDef[]`，**使用 elkjs 非同步佈局**
3. 其餘 node / edge / panel 元件同 v1
4. **elkjs 佈局 hook 參考 React Flow 官方 elkjs 範例**，支援 `elkLayoutOptions` per-entry 覆寫

**完成後** `[v2 新增]`：
- 產出 `docs/agent-status/agent-6-flow.json`
- 驗證 FlowCanvas 可渲染至少一組 flowNodes/flowEdges

---

### Agent 7：Simulation Engine（純邏輯層）`[v2 變更]`

**前置依賴**：Agent 4A-1（型別定義 + workerApi）完成。

**啟動前驗證** `[v2 新增]`：
1. 讀取 `docs/agent-status/agent-4a1-token-data.json` → completed 或 partial（需 types.ts + workerApi.ts）
2. `npx tsc --noEmit` 通過

**職責**：模擬引擎核心邏輯 + comlink-wrapped Web Worker + Zustand store。**不含 UI 元件**。

**任務清單**：
1. 建立 `src/features/simulation/simulation.worker.ts` — Worker 端實作所有計算函式，`expose(api)` via comlink
2. 建立 `src/features/simulation/SimulationEngine.ts` — 引擎核心，呼叫 `simWorker.computeXxx()` 取代 postMessage
3. 建立 `src/features/simulation/useSimulation.ts` hook
4. 建立 `src/stores/useSimulationStore.ts`

**完成後** `[v2 新增]`：
- 產出 `docs/agent-status/agent-7-simulation.json`
- 驗證 Worker 可啟動、comlink RPC 呼叫正常

---

### Agent 8：Integration & QA `[v2 變更]`

**前置依賴**：Agent 5 + 6 + 7 全部完成。

**啟動前驗證** `[v2 新增]`：
1. 讀取 `docs/agent-status/agent-5-layout.json` → completed
2. 讀取 `docs/agent-status/agent-6-flow.json` → completed
3. 讀取 `docs/agent-status/agent-7-simulation.json` → completed
4. `npm run build` 無 error
5. `npm run dev` 後首頁可載入、至少一個 DetailPage 可渲染

**任務清單**：
1. **整合測試**（同 v1，但 slug 數量更新為 34 個）
2. **E2E 測試（Playwright）[v2 新增]**：
   - `e2e/navigation.spec.ts`：所有 34 個 slug 導航正確、404 正確
   - `e2e/theme-switch.spec.ts`：dark/light 切換、persist 後重載
   - `e2e/language-switch.spec.ts`：切換 6 種語言、UI 文字更新
   - `e2e/simulation-basic.spec.ts`：ERC-20 transfer 模擬可完整跑完
3. **效能檢查**（同 v1，額外使用 `rollup-plugin-visualizer` 檢查 chunk 結構）
4. **RWD 驗收**（同 v1）
5. **無障礙**（同 v1，額外跑 `scripts/check_a11y_basics.py` 靜態掃描）
6. **最終掃尾**：
   - 跑 `scripts/validate_registry.py` 全量驗證
   - 跑 `scripts/lint_i18n_keys.py` 驗證命名規範
   - 跑 `scripts/check_bundle_size.py` 確認體積閾值
   - 跑 `scripts/generate_sitemap.py` 產生 sitemap
   - 補齊 README.md / CHANGELOG.md
   - 確認 `npm run build` 無 warning/error

**完成後** `[v2 新增]`：
- 產出 `docs/agent-status/agent-8-qa.json`
- 所有驗證腳本全綠、E2E 全綠、build 無 warning

---

## 7. 設計語言指引

### 視覺基調

風格定位：**Cyberpunk-Noir meets Technical Blueprint**  
— 深色主題下像暗色技術藍圖；淺色主題下像乾淨的科技白板。

### 配色

已在 §4.2 定義。關鍵原則：
- accent 色（indigo 系）用於高亮、互動、流程圖動畫
- 函式類型使用**語義變數**：`--erc-color-fn-read` / `--erc-color-fn-write` / `--erc-color-fn-event` `[v2 變更]`
- 節點背景比頁面背景略亮一階
- **所有顏色使用 `--erc-` 前綴 CSS 變數**
- **元件中使用語義層變數，不直接引用基礎色**（方便日後調色不改元件碼）`[v2 新增]`

### 字型

```css
--erc-font-display: 'Outfit', sans-serif;      /* 標題、大字 */
--erc-font-body: 'Inter', sans-serif;           /* 正文 */
--erc-font-mono: 'JetBrains Mono', monospace;   /* 程式碼、地址、數值 */
```

### 動畫原則

（同 v1）

---

## 8. 自動化工具

### 8.1 Python 腳本 (`scripts/`) `[v2 擴充]`

#### 原有腳本

| 腳本 | 用途 |
|------|------|
| `scaffold_entry.py` | 產生新 standard/protocol 骨架 + 更新 `allMeta.ts` `[v2 變更]` |
| `sync_translations.py` | 掃描缺漏 i18n key 並補 TODO（適配每條目獨立 namespace）`[v2 變更]` |
| `validate_registry.py` | 驗證所有資料檔符合 interface + highlightNodes/Edges 指向存在的 id |

#### v2 新增腳本

| 腳本 | 用途 |
|------|------|
| `check_bundle_size.py` | 執行 `npm run build` → 解析 chunk 列表 → 檢查 gzip 後是否超過閾值（250KB 首屏等），CI 可用 |
| `generate_og_images.py` | 為每個條目產生帶名稱和主題色的 og:image（Pillow 或 playwright 截圖） |
| `lint_i18n_keys.py` | 驗證 i18n key 命名是否符合 `<slug>.<section>.<detail>` 格式 |
| `export_data_summary.py` | 掃描 data 目錄，自動產生 Markdown 表格（用於 README / CHANGELOG） |
| `generate_sitemap.py` | 掃描 `allMeta.ts`，產生 `public/sitemap.xml` |
| `migrate_data_schema.py` | 當 `types.ts` 新增欄位時，掃描所有 data 檔補空值佔位 |
| `orchestrate.py` | Agent 協調器（見下方依賴圖定義）`[v2 新增]` |
| `verify_handoff.py` | 驗證某 Agent 的產出可交接給下游（檔案存在 + tsc 通過 + validate_registry + lint_i18n_keys）`[v2 新增]` |

**`orchestrate.py` 內建依賴圖** `[v2 新增]`：

```python
# orchestrate.py 核心資料結構
# 用法：
#   python scripts/orchestrate.py --check          # 檢查所有 Agent 狀態
#   python scripts/orchestrate.py --next           # 顯示下一個可啟動的 Agent
#   python scripts/orchestrate.py --prompt <agent> # 產生該 Agent 的啟動 prompt
#   python scripts/orchestrate.py --recover <agent># 產生續接/重跑建議

DEPENDENCY_GRAPH: dict[str, list[str]] = {
    'agent-1-scaffold':               [],
    'agent-4a1-token-data':           [],
    'agent-2-theme':                  ['agent-1-scaffold'],
    'agent-3-i18n':                   ['agent-1-scaffold'],
    'agent-4a2-proxy-utility-data':   ['agent-4a1-token-data'],
    'agent-4a3-account-identity-data':['agent-4a1-token-data'],
    'agent-4b1-defi-data':            ['agent-4a1-token-data'],
    'agent-4b2-governance-data':      ['agent-4a1-token-data'],
    'agent-5-layout':                 ['agent-1-scaffold', 'agent-2-theme', 'agent-3-i18n'],
    'agent-6-flow':                   ['agent-1-scaffold', 'agent-2-theme', 'agent-4a1-token-data'],
    'agent-7-simulation':             ['agent-4a1-token-data'],
    'agent-8-qa':                     ['agent-5-layout', 'agent-6-flow', 'agent-7-simulation'],
}

# 各 Agent 的硬性前置檔案（partial 狀態時檢查用）
HARD_PREREQ_FILES: dict[str, list[str]] = {
    'agent-4a2-proxy-utility-data':   ['src/data/types.ts', 'src/features/simulation/workerApi.ts'],
    'agent-4a3-account-identity-data':['src/data/types.ts', 'src/features/simulation/workerApi.ts'],
    'agent-4b1-defi-data':            ['src/data/types.ts', 'src/features/simulation/workerApi.ts'],
    'agent-4b2-governance-data':      ['src/data/types.ts'],
    'agent-6-flow':                   ['src/data/types.ts'],
    'agent-7-simulation':             ['src/data/types.ts', 'src/features/simulation/workerApi.ts'],
}
```

### 8.2 Claude Skills（建議建立）`[v2 擴充]`

| Skill 名稱 | 觸發時機 | 核心步驟 |
|------------|----------|----------|
| `create-erc-standard` | 新增 ERC 標準 | 跑 scaffold_entry.py → Agent 填入 functions / flowNodes / flowEdges / simulations → 跑 sync_translations.py → 跑 validate_registry.py |
| `create-protocol` | 新增協議 | 同上 + 判斷是否需新增 Worker API 方法 |
| `add-flow-node-type` | 新增自訂 React Flow 節點類型 | 建立 nodes/XxxNode.tsx → types.ts 加入 union member → FlowCanvas 註冊 nodeTypes → motion 動畫 → LegendPanel 更新 |
| `add-custom-edge-type` | 新增 React Flow 邊類型 | 建立 edges/XxxEdge.tsx → FlowCanvas 註冊 edgeTypes → LegendPanel 更新 `[v2 新增]` |
| `add-language` | 新增語言 | 建立 locales 目錄 → i18n config → LanguageSwitcher → sync_translations.py |
| `add-simulation-scenario` | 為已存在條目新增模擬場景 | 定義 SimulationParam → 定義 steps → 必要時新增 Worker API 方法 |
| `add-worker-method` | 新增 Worker 計算方法 | workerApi.ts 介面新增 → simulation.worker.ts 實作 → 測試 `[v2 新增]` |
| `update-css-theme-variable` | 新增/修改主題色 | themes.css 兩組同步更新 → reactflow-overrides.css 同步 → 語義層映射 `[v2 新增]` |
| `create-adr` | 記錄架構決策 | 以模板建立 docs/adr/NNN-title.md → 填入 Context / Decision / Consequences `[v2 新增]` |
| `full-data-validation` | 全量驗證 | validate_registry.py → lint_i18n_keys.py → TypeScript type-check → 報告彙總 `[v2 新增]` |
| `add-detail-page-section` | 在 DetailPage 新增內容區塊 | 定義 ERCEntry 新欄位 → DetailPage 渲染 → SkeletonBlock 更新 → i18n → sync `[v2 新增]` |
| `add-category` | 新增分類 | types.ts Category union → Sidebar 分組 → i18n → 節點色標 → LegendPanel `[v2 新增]` |
| `start-agent` | 啟動新 Agent | 跑 `verify_handoff.py` 驗證所有前置 → 讀取 setup-v2.md 對應章節 → 產生 context prompt → 開始任務 `[v2 新增]` |
| `finish-agent` | Agent 完成工作 | 跑驗收標準 → 跑 `validate_registry.py` → 產出狀態檔 → 列出下游可啟動的 Agent `[v2 新增]` |
| `resume-agent` | 續接 partial/frozen Agent | 讀取狀態檔 → 盤點已完成/未完成的項目 → 只完成剩餘項目 → 更新狀態檔 `[v2 新增]` |
| `retry-agent` | 從頭重跑失敗的 Agent | 備份失敗產出 → 清除檔案 → 刪除狀態檔 → 重新啟動 `[v2 新增]` |

---

## 9. 擴充預留

### 9.1 錢包連接

已建立 `src/features/wallet/` 佔位目錄。未來整合方案：
- 使用 **wagmi v2 + viem**（viem 已安裝）連接 MetaMask/WalletConnect
- 模擬面板增加「用真實錢包地址填入」按鈕
- 可查詢鏈上真實餘額作為模擬初始值

### 9.2 新增語言

1. 在 `src/i18n/locales/` 新增語言目錄
2. 在 `i18n/config.ts` 的 `supportedLngs` 加入語言代碼
3. 在 `LanguageSwitcher.tsx` 加入選項
4. 跑 `python scripts/sync_translations.py` 產生 TODO 佔位

### 9.3 新增標準/合約

1. 跑 `python scripts/scaffold_entry.py --slug xxx --name "XXX" --category xxx --type standard|protocol`
   - 自動產生資料檔骨架 + 更新 `allMeta.ts` + 產生條目 i18n JSON
2. 填入 `functions`, `flowNodes`, `flowEdges`, `simulations`
3. `registry.ts` 的 `import.meta.glob` 會自動掃描，無需手動註冊
4. 跑 `python scripts/sync_translations.py` 補齊翻譯 key
5. 跑 `python scripts/validate_registry.py` 驗證
6. 跑 `python scripts/generate_sitemap.py` 更新 sitemap `[v2 新增]`

### 9.4 WebAssembly 升級路徑

若未來模擬複雜度需要 WASM：
1. 用 Rust 寫計算核心，編譯為 `.wasm`
2. 在 `simulation.worker.ts` 中 import `.wasm` 模組，替換對應計算函式
3. 上層 API 不變（`SimWorkerApi` 介面不動，comlink 透明傳遞）

### 9.5 PWA / 離線閱讀 `[v2 新增]`

作為科普教育網站，離線閱讀有價值。升級路徑：
1. 安裝 `vite-plugin-pwa`
2. 設定 Service Worker 快取策略（首屏 + 已瀏覽過的條目）
3. 建立 Web App Manifest
4. 加入離線 fallback UI

### 9.6 Pre-rendering / SSG `[v2 新增]`

若 SEO 成為重要目標：
1. 評估 `vite-plugin-ssr` 做 pre-rendering（為每個 slug 產生靜態 HTML）
2. 或遷移至 Astro（Islands Architecture，首屏 static HTML + React islands）
3. SEO metadata 改為 server-side 注入

---

## 10. 指令速查

```bash
# 開發
npm run dev

# 構建
npm run build

# 預覽構建結果
npm run preview

# Lint
npm run lint

# 格式化
npm run format

# 測試（單元/整合）
npm run test

# 測試覆蓋率
npm run test:coverage

# E2E 測試 [v2 新增]
npx playwright test

# 資料驗證
python scripts/validate_registry.py

# i18n 同步
python scripts/sync_translations.py

# i18n key 命名驗證 [v2 新增]
python scripts/lint_i18n_keys.py

# Bundle 體積檢查 [v2 新增]
python scripts/check_bundle_size.py

# 產生 sitemap [v2 新增]
python scripts/generate_sitemap.py

# 新增標準/協議骨架
python scripts/scaffold_entry.py --slug <slug> --name <n> --category <cat> --type <standard|protocol>

# Agent 協調 [v2 新增]
python scripts/orchestrate.py --check          # 檢查所有 Agent 狀態
python scripts/orchestrate.py --next           # 顯示下一個可啟動的 Agent
python scripts/orchestrate.py --prompt <agent> # 產生該 Agent 的啟動 prompt
python scripts/orchestrate.py --recover <agent># 產生續接/重跑建議

# Agent 交接驗證 [v2 新增]
python scripts/verify_handoff.py <agent-name>  # 驗證產出可交接
```

---

## 11. Agent 執行順序摘要 `[v2 變更]`

> 各 Agent 的交接協議、故障恢復策略見 §6.1–§6.3。

```
第 1 輪（平行）：
  ├── Agent 1: Scaffold
  ├── Agent 4A-1: Types + Token ERC Data (6)
  ├── Agent 4A-2: Proxy + Utility ERC Data (8, 等 types.ts)
  └── Agent 4A-3: Account + Identity + CrossChain + RWA Data (8, 等 types.ts)

第 2 輪（Agent 1 完成後平行）：
  ├── Agent 2: Theme System
  ├── Agent 3: i18n
  ├── Agent 4B-1: DeFi Protocol Data (7, 等 types.ts)
  └── Agent 4B-2: Governance + Other Protocol Data (6, 等 types.ts)

第 3 輪（Agent 2 + 3 + 4A-1 完成後平行）：
  ├── Agent 5: Layout & Pages
  ├── Agent 6: Flow Visualization Engine + Panels
  └── Agent 7: Simulation Engine (純邏輯 + comlink Worker)

第 4 輪：
  └── Agent 8: Integration & QA + E2E
```

**預估 Token 消耗提示**：Agent 4A-1/4A-2/4A-3/4B-1/4B-2 各處理 6-8 個條目（比原版 Agent 4A 的 19 個大幅減少），可各自在獨立 context 中完成。Agent 6（流程圖 + 面板 UI）次之。Agent 7（comlink Worker + Engine，不含 UI）相對輕量。其餘 Agent 輕量。

---

*End of Setup Guide v2*
