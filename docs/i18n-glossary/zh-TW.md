# zh-TW 詞彙表（Traditional Chinese — Taiwan）

**Normative** for all zh-TW content in this project. Inject this file verbatim into every
zh-TW translate prompt (see `docs/authoring/batch-workflow.md`). Canonical terms below were
derived by sampling the existing 38-namespace corpus (occurrence counts noted where a choice
had competitors) — new content must match the corpus, and flagged legacy variants must not
be reproduced. Simplified-character leakage is machine-checked by
`python scripts/check_zh_tw_chars.py` (CI gate).

## 核心術語 Core terms

| English | zh-TW 標準譯法 | 備註 |
|---|---|---|
| smart contract | 智能合約 | 不用「智慧合約」（語料僅 1 例，屬漂移） |
| standard | 標準 | 條目 short 慣例如「同質化代幣標準」 |
| interface | 介面 | 絕不用「接口」（簡體慣用） |
| function | 函式 | 絕不用「函數／函数」 |
| event | 事件 | |
| token | 代幣 | 不用「通證」 |
| fungible / non-fungible | 同質化／非同質化 | |
| balance | 餘額 | |
| transfer（token） | 轉帳 | 資產所有權移轉用「轉移」（如 NFT 轉移） |
| approve | 授權 | 動詞；不用「批准／核准」當標準譯法 |
| allowance | 授權額度 | |
| mint | 鑄造 | |
| burn | 銷毀 | |
| wallet | 錢包 | |
| vault (ERC-4626) | 金庫 | |
| share (ERC-4626) | 份額 | |
| deposit / withdraw / redeem | 存款／提領／贖回 | withdraw 用「提領」（語料 20 例 vs 提款 4 例） |
| proxy | 代理／代理合約 | |
| implementation (contract) | 實作合約 | 不用「實現合約」（簡體慣用） |
| storage slot | 儲存槽 | storage = 儲存；不用「存儲」 |
| delegatecall | delegatecall（保留英文） | 語料 28 例保留英文；不譯「委託呼叫」 |
| signature | 簽章 | 動詞用「簽署」；語料 簽章/簽名 各半，新內容統一用「簽章」 |
| typed data (EIP-712) | 類型化資料 | |
| domain separator | 網域分隔符 | |
| nonce | nonce（保留英文） | **勿用「隨機數」**——舊語料有此誤譯（nonce 是序號非亂數），新內容一律保留英文 |
| replay attack | 重放攻擊 | |
| reentrancy | 重入／重入攻擊 | 新詞（語料尚無）；不用「再入」 |
| oracle | 預言機 | |
| collateral | 抵押品 | 不用「擔保品」 |
| liquidation | 清算 | |
| slippage | 滑點 | |
| liquidity / pool | 流動性／資金池 | 「流動性池」僅在特指 AMM pool 時使用 |
| flash loan | 閃電貸 | |
| fee | 手續費 | 協議抽成語境亦可用「費用」 |
| rebase | rebase（保留英文） | 可首次出現時加註「（彈性調整供給）」 |
| staking / restaking | 質押／再質押 | |
| governance | 治理 | |
| proposal | 提案 | |
| quorum | 法定人數 | |
| threshold | 門檻 | 不用「閾值」（簡體慣用） |
| timelock | 時間鎖 | |
| intent (ERC-7683) | 意圖 | |
| settlement | 結算 | |
| account abstraction | 帳戶抽象 | 用「帳」不用「賬」 |
| Paymaster (ERC-4337) | Paymaster（保留英文） | 語料保留英文 |
| bundler (ERC-4337) | 打包者 | |
| session key | 會話金鑰 | |
| soulbound (ERC-5192) | 靈魂綁定 | 新詞；「靈魂綁定代幣（SBT）」 |
| royalty (ERC-2981) | 版稅 | 不用「權利金」 |
| enumerable | 可列舉 | 用「列舉」不用「枚舉」（簡體慣用） |
| metadata | 元資料 | |
| callback | 回呼 | 語料另有 6 例「回調」屬漂移，勿再使用 |
| hook | 鉤子 | Uniswap v4 語境可寫「Hook（鉤子）」首次並列 |
| permit (ERC-2612) | permit（保留英文） | 函式名；描述時可寫「permit 簽章授權」 |
| interface ID (ERC-165) | 介面 ID | |
| upgrade | 升級 | |
| ownership | 所有權 | |

## 保留英文清單 Keep-English list

以下一律保留英文原文，不翻譯、不音譯：

- `gas`、`wei`、`calldata`、`msg.sender`、`address(0)` 等 Solidity 關鍵字與全域變數
- opcode 名稱（`DELEGATECALL`、`SSTORE`、`CREATE2`…）與 `delegatecall` 等低階呼叫
- EIP/ERC 編號與名稱：一律寫「ERC-20」「EIP-712」（半形連字號，前後接中文時空一格，如「ERC-20 代幣」）
- 函式／事件／參數名：`transfer()`、`balanceOf`、`Transfer` 事件、`tokenId`——絕不翻譯識別字
- 專有名詞：Ethereum（可用「以太坊」）、OpenZeppelin、Uniswap、Etherscan、Solidity、DeFi、DAO、NFT、AMM、TVL
- `nonce`、`permit`、`Paymaster`、`EntryPoint`、`rebase`、`UserOperation`

## 行文風格 Style rules

1. **標點**：全形標點「，。、；：（）」；中英文之間、中文與數字之間加半形空格（「六個核心函式」內的數字中文詞除外；「2015 年 11 月」需空格）。
2. **引號**：中文引號「」；程式碼與識別字用反引號不適用於 JSON 值——直接保留原文即可。
3. **語氣**：敘述句、第三人稱、不用「你／您」開頭的教學腔；與現有語料一致（見 `zh-TW/erc20.json`）。
4. **簡繁**：禁止任何簡體字元（CI 以 `check_zh_tw_chars.py` 把關）；注意 IME 常見混入字：没→沒、温→溫、户→戶、税→稅、静→靜、黄→黃、别→別、悦→悅。
5. **台灣用語優先**：介面／函式／程式／網路／資料／伺服器／相容（非 接口／函数／程序／网络／数据／服务器／兼容）。
