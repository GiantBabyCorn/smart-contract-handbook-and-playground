# ko 용어집（Korean）

**Normative** for all ko content in this project. Inject this file verbatim into every ko
translate prompt (see `docs/authoring/batch-workflow.md`). Canonical terms were derived by
sampling the existing 38-namespace corpus (occurrence counts noted where a choice had
competitors) — new content must match the corpus.

## 핵심 용어 Core terms

| English | ko 표준 번역 | 비고 |
|---|---|---|
| smart contract | 스마트 컨트랙트 | 축약형은 「컨트랙트」; 「계약」은 쓰지 않음 |
| standard | 표준 | 항목 short 관례: 「대체 가능 토큰 표준」 |
| interface | 인터페이스 | |
| function | 함수 | |
| event | 이벤트 | |
| token | 토큰 | |
| fungible / non-fungible | 대체 가능／대체 불가능 | NFT = 대체 불가능 토큰 |
| balance | 잔액 | |
| transfer | 전송 | 소유권 이전은 「이전」 |
| approve | 승인 | |
| allowance | 허용량 | corpus 28건 |
| mint | 발행 | 「민팅」은 쓰지 않음（corpus 0건） |
| burn | 소각 | |
| wallet | 지갑 | |
| vault (ERC-4626) | 볼트 | 「금고」는 쓰지 않음 |
| share (ERC-4626) | 지분 | |
| deposit / withdraw / redeem | 예치／출금／상환 | 「인출」 22건은 변이형 — 신규 콘텐츠는 「출금」 |
| lend / borrow | 대출／차입 | |
| proxy | 프록시 | |
| implementation (contract) | 구현（컨트랙트） | |
| storage slot | 스토리지 슬롯 | storage = 스토리지 |
| delegatecall | delegatecall（영문 유지） | corpus 28건; 음역하지 않음 |
| signature | 서명 | |
| typed data (EIP-712) | 타입이 지정된 구조화된 데이터 | 문맥상 「구조화된 데이터」 |
| domain separator | 도메인 구분자 | |
| nonce | 논스 | 「넌스」（corpus 20건）는 변이형 — 신규 콘텐츠는 「논스」로 통일 |
| replay attack | 재생 공격 | corpus 3건 준거（「재전송 공격」으로 바꾸지 말 것） |
| reentrancy | 재진입（공격） | 신규 용어（corpus 미출현） |
| oracle | 오라클 | |
| collateral | 담보 | |
| liquidation | 청산 | |
| slippage | 슬리피지 | |
| liquidity / pool | 유동성／풀 | |
| flash loan | 플래시 론 | |
| fee | 수수료 | |
| rebase | 리베이스 | |
| staking | 스테이킹 | |
| governance | 거버넌스 | |
| proposal | 제안 | |
| quorum | 정족수 | |
| Timelock | Timelock（영문 유지） | corpus 15건 영문 유지（OZ 컨트랙트명 준거） |
| delegation (voting) | 위임 | |
| intent (ERC-7683) | 인텐트 | |
| settlement | 정산 | |
| account abstraction | 계정 추상화 | 「어카운트 추상화」는 쓰지 않음 |
| Paymaster (ERC-4337) | 페이마스터 | |
| bundler (ERC-4337) | 번들러 | |
| session key | 세션 키 | 띄어쓰기 포함 |
| soulbound (ERC-5192) | 소울바운드 | 신규 용어; 「소울바운드 토큰(SBT)」 |
| royalty (ERC-2981) | 로열티 | |
| enumerable | 열거 가능 | |
| metadata | 메타데이터 | |
| callback | 콜백 | |
| hook | 훅 | corpus는 훅/후크 혼재（9:10）— 신규 콘텐츠는 「훅」으로 통일（개발 커뮤니티 표준） |
| permit (ERC-2612) | permit（영문 유지） | 함수명; 설명에서는 「permit 서명」 등 |
| interface ID (ERC-165) | 인터페이스 ID | |
| upgrade | 업그레이드 | |
| ownership | 소유권 | |

## 영문 유지 목록 Keep-English list

다음은 번역·음역하지 않고 영문을 유지한다:

- `gas`（문맥상 「가스」 병용 가능·corpus에 양쪽 존재）、`wei`、`calldata`、`msg.sender`、`address(0)` 등 Solidity 키워드·전역 변수
- opcode 이름（`DELEGATECALL`、`SSTORE`、`CREATE2`…）과 `delegatecall`
- EIP/ERC 번호: 항상 「ERC-20」「EIP-712」（반각 하이픈）
- 함수명·이벤트명·매개변수명: `transfer()`、`balanceOf`、`Transfer` 이벤트、`tokenId` — 식별자는 절대 번역하지 않음
- 고유명사: Ethereum（「이더리움」 병용 가능）、OpenZeppelin、Uniswap、Etherscan、Solidity、DeFi、DAO、NFT、AMM、`EntryPoint`、`UserOperation`、`Timelock`

## 문체 규칙 Style rules

1. **문체**: 「〜합니다／〜됩니다」 존댓말 설명체（`ko/erc20.json` 참조）.
2. **띄어쓰기**: 외래어 복합어는 corpus 관례를 따름 — 「스마트 컨트랙트」「스토리지 슬롯」「세션 키」（띄움）, 「타임스탬프」（붙임）.
3. **숫자·단위**: 반각 숫자 사용, 「2015년 11월」처럼 조사·단위는 붙여 씀.
4. **용어 일관성**: 같은 항목 안에서 하나의 개념에는 하나의 번역만 사용; 영문 유지 용어는 첫 등장 시 괄호로 한글 설명을 덧붙일 수 있음.
