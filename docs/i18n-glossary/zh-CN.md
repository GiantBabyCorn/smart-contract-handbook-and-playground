# zh-CN 词汇表（Simplified Chinese）

**Normative** for all zh-CN content in this project. Inject this file verbatim into every
zh-CN translate prompt (see `docs/authoring/batch-workflow.md`). Canonical terms were derived
by sampling the existing 38-namespace corpus (occurrence counts noted where a choice had
competitors) — new content must match the corpus.

## 核心术语 Core terms

| English | zh-CN 标准译法 | 备注 |
|---|---|---|
| smart contract | 智能合约 | |
| standard | 标准 | 条目 short 惯例如「同质化代币标准」 |
| interface | 接口 | |
| function | 函数 | |
| event | 事件 | |
| token | 代币 | 不用「通证」 |
| fungible / non-fungible | 同质化／非同质化 | |
| balance | 余额 | |
| transfer（token） | 转账 | 资产所有权转移用「转移」（如 NFT 转移） |
| approve | 授权 | 动词；「批准」仅用于治理提案语境 |
| allowance | 授权额度 | 语料 18 例 |
| mint | 铸造 | |
| burn | 销毁 | |
| wallet | 钱包 | |
| vault (ERC-4626) | 金库 | |
| share (ERC-4626) | 份额 | |
| deposit / withdraw / redeem | 存款／取款／赎回 | |
| proxy | 代理／代理合约 | |
| implementation (contract) | 实现合约 | 语料 36 例 |
| storage slot | 存储槽 | storage = 存储 |
| delegatecall | delegatecall（保留英文） | 语料 28 例保留英文；不译「委托调用」 |
| signature | 签名 | 动词用「签署」 |
| typed data (EIP-712) | 类型化数据 | |
| domain separator | 域分隔符 | |
| nonce | nonce（保留英文） | **勿用「随机数」**——旧语料有 8 例误译（nonce 是序号非随机值），新内容一律保留英文 |
| replay attack | 重放攻击 | |
| reentrancy | 重入／重入攻击 | 新词（语料尚无） |
| oracle | 预言机 | |
| collateral | 抵押品 | |
| liquidation | 清算 | |
| slippage | 滑点 | |
| liquidity / pool | 流动性／资金池 | 「流动性池」仅特指 AMM pool |
| flash loan | 闪电贷 | |
| fee | 手续费 | 协议抽成语境亦可用「费用」 |
| rebase | rebase（保留英文） | 首次出现可加注「（弹性调整供给）」 |
| staking / restaking | 质押／再质押 | |
| governance | 治理 | |
| proposal | 提案 | |
| quorum | 法定人数 | |
| threshold | 阈值 | 语料 23 例 |
| timelock | 时间锁 | |
| intent (ERC-7683) | 意图 | |
| settlement | 结算 | |
| account abstraction | 账户抽象 | |
| Paymaster (ERC-4337) | Paymaster（保留英文） | 语料保留英文（24 例） |
| bundler (ERC-4337) | 捆绑器 | 若上下文已有「打包」表述则从之 |
| session key | 会话密钥 | |
| soulbound (ERC-5192) | 灵魂绑定 | 新词；「灵魂绑定代币（SBT）」 |
| royalty (ERC-2981) | 版税 | |
| enumerable | 可枚举 | |
| metadata | 元数据 | |
| callback | 回调 | |
| hook | 钩子 | Uniswap v4 语境可首次并列「Hook（钩子）」 |
| permit (ERC-2612) | permit（保留英文） | 函数名；描述时可写「permit 签名授权」 |
| interface ID (ERC-165) | 接口 ID | |
| upgrade | 升级 | |
| ownership | 所有权 | |

## 保留英文清单 Keep-English list

以下一律保留英文原文，不翻译、不音译：

- `gas`、`wei`、`calldata`、`msg.sender`、`address(0)` 等 Solidity 关键字与全局变量
- opcode 名称（`DELEGATECALL`、`SSTORE`、`CREATE2`…）与 `delegatecall` 等低阶调用
- EIP/ERC 编号与名称：一律写「ERC-20」「EIP-712」（半角连字符，与中文相邻时空一格，如「ERC-20 代币」）
- 函数／事件／参数名：`transfer()`、`balanceOf`、`Transfer` 事件、`tokenId`——绝不翻译标识符
- 专有名词：Ethereum（可用「以太坊」）、OpenZeppelin、Uniswap、Etherscan、Solidity、DeFi、DAO、NFT、AMM、TVL
- `nonce`、`permit`、`Paymaster`、`EntryPoint`、`rebase`、`UserOperation`

## 行文风格 Style rules

1. **标点**：全角标点「，。、；：（）」；中英文之间、中文与数字之间加半角空格（「2015 年 11 月」需空格）。
2. **语气**：叙述句、第三人称、客观说明文体；与现有语料一致（见 `zh-CN/erc20.json`）。
3. **术语一致**：同一条目内同一概念只用一个译法；首次出现的音译或保留英文术语可括注中文。
4. **不与 zh-TW 混用**：接口／函数／实现合约／存储 是 zh-CN 专属；介面／函式／實作合約／儲存 属 zh-TW。
