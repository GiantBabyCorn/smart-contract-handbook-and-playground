# Glosario es (Spanish)

**Normative** for all es content in this project. Inject this file verbatim into every es
translate prompt (see `docs/authoring/batch-workflow.md`). Canonical terms were derived by
sampling the existing 38-namespace corpus (occurrence counts noted where a choice had
competitors) — new content must match the corpus. El corpus usa español neutro
latinoamericano con préstamos técnicos del inglés sin traducir cuando así lo hace la
comunidad DeFi hispanohablante.

## Términos principales Core terms

| English | es traducción canónica | Notas |
|---|---|---|
| smart contract | contrato inteligente | forma corta: «contrato» |
| standard | estándar | patrón de short: «Estándar de Token Fungible» |
| interface | interfaz | |
| function | función | |
| event | evento | |
| token | token (m.) | plural «tokens»; nunca «ficha» |
| fungible / non-fungible | fungible / no fungible | |
| balance | saldo | |
| transfer | transferir / transferencia | |
| approve | aprobar / aprobación | |
| allowance | asignación | corpus 20 casos; no dejar «allowance» en texto nuevo |
| mint | acuñar / acuñación | |
| burn | quemar / quema | |
| wallet | billetera | no «cartera» ni «monedero» |
| vault (ERC-4626) | vault (m., en inglés) | corpus 85 casos; no «bóveda» |
| share (ERC-4626) | participación | plural «participaciones» (corpus 64) |
| deposit / withdraw / redeem | depositar / retirar / canjear | sustantivos: depósito / retiro / canje |
| proxy | proxy (m., en inglés) | |
| implementation (contract) | (contrato de) implementación | |
| storage slot | slot de almacenamiento | corpus 7 casos; no «ranura» |
| delegatecall | delegatecall (en inglés) | corpus 28 casos |
| signature | firma | |
| typed data (EIP-712) | datos tipados | |
| domain separator | separador de dominio | |
| nonce | nonce (m., en inglés) | corpus 40 casos |
| replay attack | ataque de repetición | |
| reentrancy | reentrada / ataque de reentrada | término nuevo (sin apariciones en el corpus) |
| oracle | oráculo | |
| collateral | colateral (m.) | corpus 86 casos; no «garantía» |
| liquidation | liquidación | ver nota de ambigüedad abajo |
| slippage | deslizamiento | corpus 14 casos |
| liquidity / pool | liquidez / pool (m., en inglés) | corpus usa «pool» (101) |
| flash loan | flash loan (m., en inglés) | corpus 5 casos |
| fee | comisión | «tarifa» solo para gas pricing |
| rebase | rebase (m., en inglés) | |
| staking | staking (m., en inglés) | corpus 35 casos |
| governance | gobernanza | |
| proposal | propuesta | |
| quorum | quórum | con tilde |
| timelock | timelock (m., en inglés) | corpus 12 casos |
| delegation (voting) | delegación | |
| intent (ERC-7683) | intención | «intents» en inglés admisible al citar el término del estándar |
| settlement | liquidación (de la orden) | ver nota de ambigüedad abajo |
| account abstraction | abstracción de cuenta | |
| Paymaster (ERC-4337) | paymaster (m., en inglés) | corpus 21 casos |
| bundler (ERC-4337) | bundler (m., en inglés) | |
| session key | clave de sesión | |
| soulbound (ERC-5192) | soulbound (en inglés) | término nuevo; «token soulbound (SBT)» |
| royalty (ERC-2981) | royalty / royalties (en inglés) | corpus 23 casos; no «regalías» |
| enumerable | enumerable | |
| metadata | metadatos (m. pl.) | |
| callback | callback (m., en inglés) | |
| hook | hook (m., en inglés) | corpus 65 casos; no «gancho» |
| permit (ERC-2612) | permit (en inglés) | nombre de función; «firma permit» en prosa |
| interface ID (ERC-165) | ID de interfaz | |
| upgrade | actualización / actualizar | |
| ownership | propiedad | |

**Nota de ambigüedad — «liquidación»:** el corpus usa «liquidación» tanto para *liquidation*
(préstamos colateralizados) como para *settlement* (ejecución de órdenes/intents). Mantener
esa convención pero desambiguar con complemento: «liquidación de la posición» (liquidation)
vs. «liquidación de la orden» (settlement).

## Lista keep-English

No traducir ni adaptar:

- `gas`, `wei`, `calldata`, `msg.sender`, `address(0)` y demás palabras clave y variables globales de Solidity
- nombres de opcodes (`DELEGATECALL`, `SSTORE`, `CREATE2`…) y `delegatecall`
- números EIP/ERC: siempre «ERC-20», «EIP-712» (guion ASCII)
- nombres de funciones, eventos y parámetros: `transfer()`, `balanceOf`, evento `Transfer`, `tokenId` — los identificadores nunca se traducen
- nombres propios: Ethereum, OpenZeppelin, Uniswap, Etherscan, Solidity, DeFi, DAO, NFT, AMM, `EntryPoint`, `UserOperation`
- préstamos asentados en el corpus: vault, pool, staking, hook, callback, nonce, proxy, paymaster, bundler, timelock, rebase, flash loan, royalty

## Reglas de estilo Style rules

1. **Registro**: prosa expositiva en tercera persona, presente; sin tuteo ni imperativos de tutorial (ver `es/erc20.json`).
2. **Acentuación**: obligatoria y correcta (interfaz/interfaces, quórum, oráculo, estándar/estándares, través, código); Phase 3 incluye auditoría de tildes — no introducir nuevas faltas.
3. **Género de préstamos**: los préstamos del inglés son masculinos (el vault, el pool, el nonce, el hook).
4. **Mayúsculas**: en los `short` el corpus usa mayúsculas iniciales tipo título («Estándar de Token Fungible») — mantenerlo; en prosa, estilo oración normal. Los nombres de estándares conservan su forma oficial (ERC-20).
5. **Puntuación**: signos de apertura «¿ ¡» obligatorios; comillas angulares « » opcionales, el corpus usa comillas rectas — mantener comillas rectas.
