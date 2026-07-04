# ja 用語集（Japanese）

**Normative** for all ja content in this project. Inject this file verbatim into every ja
translate prompt (see `docs/authoring/batch-workflow.md`). Canonical terms were derived by
sampling the existing 38-namespace corpus (occurrence counts noted where a choice had
competitors) — new content must match the corpus. カタカナ表記は語末長音符を含め下表の形に統一する。

## コア用語 Core terms

| English | ja 標準訳 | 備考 |
|---|---|---|
| smart contract | スマートコントラクト | 短縮形は「コントラクト」 |
| standard | 規格／標準 | 条目 short は「〜規格」（例：代替可能トークン規格）、本文中は「標準」も可 |
| interface | インターフェース | 「インタフェース」は使わない |
| function | 関数 | |
| event | イベント | |
| token | トークン | |
| fungible / non-fungible | 代替可能／非代替性 | NFT = 非代替性トークン |
| balance | 残高 | |
| transfer | 転送 | 送金・移転は文脈で可だが既定は「転送」（語料 178 例） |
| approve | 承認 | |
| allowance | アローワンス | 語料 15 例で確立；「承認額」は使わない |
| mint | ミント | 供給・発行の文脈では「発行」も可（両者とも語料に多数） |
| burn | バーン | 「焼却」は使わない |
| wallet | ウォレット | |
| vault (ERC-4626) | ボールト | |
| share (ERC-4626) | シェア | |
| deposit / withdraw / redeem | 預け入れ／引き出し／償還 | 名詞複合では「預入」も可 |
| proxy | プロキシ | |
| implementation (contract) | 実装（コントラクト） | |
| storage slot | ストレージスロット | |
| delegatecall | delegatecall（英語のまま） | 語料 28 例；「デリゲートコール」とは書かない |
| signature | 署名 | 「シグネチャ」は使わない |
| typed data (EIP-712) | 型付きデータ | |
| domain separator | ドメインセパレータ | |
| nonce | ノンス | |
| replay attack | リプレイ攻撃 | |
| reentrancy | リエントランシー（攻撃） | 新語（語料未出現）；「再入」は使わない |
| oracle | オラクル | |
| collateral | 担保 | |
| liquidation | 清算 | |
| slippage | スリッページ | |
| liquidity / pool | 流動性／プール | |
| flash loan | フラッシュローン | |
| fee | 手数料 | |
| rebase | リベース | |
| staking | ステーキング | |
| governance | ガバナンス | |
| proposal | 提案 | |
| quorum | クォーラム | |
| timelock | タイムロック | |
| delegation (voting) | 委任 | |
| intent (ERC-7683) | インテント | |
| settlement | 決済 | |
| account abstraction | アカウント抽象化 | |
| Paymaster (ERC-4337) | ペイマスター | |
| bundler (ERC-4337) | バンドラー | |
| session key | セッションキー | |
| soulbound (ERC-5192) | ソウルバウンド | 新語；「ソウルバウンドトークン（SBT）」 |
| royalty (ERC-2981) | ロイヤリティ | 「ロイヤルティ」（語料 1 例）は漂移、使わない |
| enumerable | 列挙可能 | |
| metadata | メタデータ | |
| callback | コールバック | |
| hook | フック | |
| permit (ERC-2612) | permit（英語のまま） | 関数名；説明では「permit 署名」等 |
| interface ID (ERC-165) | インターフェースID | 「ID」の前にスペースを入れない（語料準拠） |
| upgrade | アップグレード | |
| ownership | 所有権 | |

## 英語のまま残すリスト Keep-English list

以下は翻訳・音訳せず英語表記を維持する：

- `gas`（ガス代の文脈では「ガス」も可・語料に両方あり）、`wei`、`calldata`、`msg.sender`、`address(0)` など Solidity のキーワード・グローバル変数
- opcode 名（`DELEGATECALL`、`SSTORE`、`CREATE2`…）と `delegatecall`
- EIP/ERC 番号：常に「ERC-20」「EIP-712」（半角ハイフン）
- 関数名・イベント名・引数名：`transfer()`、`balanceOf`、`Transfer` イベント、`tokenId` — 識別子は決して翻訳しない
- 固有名詞：Ethereum、OpenZeppelin、Uniswap、Etherscan、Solidity、DeFi、DAO、NFT、AMM、`EntryPoint`、`UserOperation`

## 文体規則 Style rules

1. **文体**：です・ます調ではなく「〜である／〜する」の説明体でもなく、既存語料同様の「〜します／〜されます」丁寧体を使用（`ja/erc20.json` 参照）。
2. **句読点**：全角「、。」；括弧は全角（）；英数字は半角。
3. **カタカナ長音**：末尾長音は付ける（インターフェース、セパレータは語料準拠で例外的に長音なし）。表の形を正とする。
4. **助数詞・数字**：「6つのコア関数」「2015年11月」のように半角数字＋和文（スペース不要、語料準拠）。
