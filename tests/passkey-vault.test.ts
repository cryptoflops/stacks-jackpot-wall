import { describe, it, expect } from 'vitest';
import { Cl, ClarityType } from '@stacks/transactions';

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

// Mock secp256k1 public key (33 bytes compressed)
const MOCK_PUBKEY = new Uint8Array(33).fill(0x02);
// Mock signature (65 bytes)
const MOCK_SIGNATURE = new Uint8Array(65).fill(0xab);
// Mock hash (32 bytes)
const MOCK_HASH = new Uint8Array(32).fill(0xcd);

describe('PasskeyVault Contract', () => {

    describe('Public Key Registration', () => {
        it('allows user to register a pubkey', () => {
            const response = simnet.callPublicFn(
                'passkey-vault',
                'register-pubkey',
                [Cl.buffer(MOCK_PUBKEY)],
                wallet1
            );

            expect(response.result).toBeOk(Cl.bool(true));

            // Verify vault was created
            const vault = simnet.callReadOnlyFn(
                'passkey-vault',
                'get-vault',
                [Cl.principal(wallet1)],
                wallet1
            );

            expect(vault.result.type).toBe(ClarityType.OptionalSome);
        });

        it('prevents duplicate pubkey registration', () => {
            // First registration
            simnet.callPublicFn(
                'passkey-vault',
                'register-pubkey',
                [Cl.buffer(MOCK_PUBKEY)],
                wallet1
            );

            // Second registration should fail
            const response = simnet.callPublicFn(
                'passkey-vault',
                'register-pubkey',
                [Cl.buffer(MOCK_PUBKEY)],
                wallet1
            );

            expect(response.result).toBeErr(Cl.uint(106)); // ERR_PUBKEY_EXISTS
        });
    });

    describe('Deposit Functionality', () => {
        it('allows deposits after pubkey registration', () => {
            // Register first
            simnet.callPublicFn(
                'passkey-vault',
                'register-pubkey',
                [Cl.buffer(MOCK_PUBKEY)],
                wallet1
            );

            // Deposit 10 STX
            const depositAmount = 10_000_000n; // 10 STX in microstacks
            const response = simnet.callPublicFn(
                'passkey-vault',
                'deposit',
                [Cl.uint(depositAmount)],
                wallet1
            );

            expect(response.result).toBeOk(Cl.uint(depositAmount));

            // Verify balance
            const balance = simnet.callReadOnlyFn(
                'passkey-vault',
                'get-balance',
                [Cl.principal(wallet1)],
                wallet1
            );

            expect(balance.result).toBeOk(Cl.uint(depositAmount));
        });

        it('rejects deposit without vault', () => {
            const response = simnet.callPublicFn(
                'passkey-vault',
                'deposit',
                [Cl.uint(1_000_000n)],
                wallet2
            );

            expect(response.result).toBeErr(Cl.uint(104)); // ERR_NO_VAULT
        });

        it('updates total deposits stat', () => {
            simnet.callPublicFn(
                'passkey-vault',
                'register-pubkey',
                [Cl.buffer(MOCK_PUBKEY)],
                wallet1
            );

            simnet.callPublicFn(
                'passkey-vault',
                'deposit',
                [Cl.uint(5_000_000n)],
                wallet1
            );

            const totalDeposits = simnet.callReadOnlyFn(
                'passkey-vault',
                'get-total-deposits',
                [],
                wallet1
            );

            expect(totalDeposits.result).toEqual(Cl.uint(5_000_000n));
        });
    });

    describe('Time-Lock Feature (burn-block-height)', () => {
        it('allows setting time-lock on vault', () => {
            simnet.callPublicFn(
                'passkey-vault',
                'register-pubkey',
                [Cl.buffer(MOCK_PUBKEY)],
                wallet1
            );

            // Set time-lock to future block (current + 100)
            const currentHeight = simnet.blockHeight;
            const futureHeight = currentHeight + 100;

            const response = simnet.callPublicFn(
                'passkey-vault',
                'set-time-lock',
                [Cl.uint(futureHeight)],
                wallet1
            );

            expect(response.result).toBeOk(Cl.uint(futureHeight));
        });

        it('reports correct time-lock status', () => {
            simnet.callPublicFn(
                'passkey-vault',
                'register-pubkey',
                [Cl.buffer(MOCK_PUBKEY)],
                wallet1
            );

            // Without time-lock
            const notLocked = simnet.callReadOnlyFn(
                'passkey-vault',
                'is-time-locked',
                [Cl.principal(wallet1)],
                wallet1
            );

            expect(notLocked.result).toEqual(Cl.bool(false));
        });
    });

    describe('Contract Trust Registry', () => {
        it('allows owner to add trusted contract', () => {
            const response = simnet.callPublicFn(
                'passkey-vault',
                'add-trusted-contract',
                [Cl.principal(`${deployer}.jackpot-wall`), Cl.buffer(MOCK_HASH)],
                deployer
            );

            expect(response.result.type).toBe(ClarityType.ResponseOk);
        });

        it('verifies trusted contract status', () => {
            // Add trusted contract
            simnet.callPublicFn(
                'passkey-vault',
                'add-trusted-contract',
                [Cl.principal(`${deployer}.jackpot-wall`), Cl.buffer(MOCK_HASH)],
                deployer
            );

            const isTrusted = simnet.callReadOnlyFn(
                'passkey-vault',
                'is-trusted-contract',
                [Cl.principal(`${deployer}.jackpot-wall`)],
                wallet1
            );

            expect(isTrusted.result).toEqual(Cl.bool(true));
        });

        it('rejects non-owner from adding trusted contracts', () => {
            const response = simnet.callPublicFn(
                'passkey-vault',
                'add-trusted-contract',
                [Cl.principal(`${deployer}.jackpot-wall`), Cl.buffer(MOCK_HASH)],
                wallet1
            );

            expect(response.result).toBeErr(Cl.uint(100)); // ERR_NOT_AUTHORIZED
        });

        it('allows owner to remove trusted contract', () => {
            // Add first
            simnet.callPublicFn(
                'passkey-vault',
                'add-trusted-contract',
                [Cl.principal(`${deployer}.jackpot-wall`), Cl.buffer(MOCK_HASH)],
                deployer
            );

            // Remove
            const response = simnet.callPublicFn(
                'passkey-vault',
                'remove-trusted-contract',
                [Cl.principal(`${deployer}.jackpot-wall`)],
                deployer
            );

            expect(response.result).toBeOk(Cl.bool(true));

            // Verify removed
            const isTrusted = simnet.callReadOnlyFn(
                'passkey-vault',
                'is-trusted-contract',
                [Cl.principal(`${deployer}.jackpot-wall`)],
                wallet1
            );

            expect(isTrusted.result).toEqual(Cl.bool(false));
        });
    });

    describe('Account Info (stx-account)', () => {
        it('returns detailed account information', () => {
            const info = simnet.callReadOnlyFn(
                'passkey-vault',
                'get-account-info',
                [Cl.principal(wallet1)],
                wallet1
            );

            // Should return a tuple with the STX account information
            expect(info.result.type).toBe(ClarityType.Tuple);
        });
    });

    describe('Withdrawal Hash Helper', () => {
        it('generates consistent message hash for signing', () => {
            const hash1 = simnet.callReadOnlyFn(
                'passkey-vault',
                'get-withdrawal-message-hash',
                [
                    Cl.principal(wallet1),
                    Cl.uint(1_000_000n),
                    Cl.uint(0)
                ],
                wallet1
            );

            const hash2 = simnet.callReadOnlyFn(
                'passkey-vault',
                'get-withdrawal-message-hash',
                [
                    Cl.principal(wallet1),
                    Cl.uint(1_000_000n),
                    Cl.uint(0)
                ],
                wallet1
            );

            expect(hash1.result).toEqual(hash2.result);
        });

        it('produces different hash for different nonces (replay protection)', () => {
            const hash1 = simnet.callReadOnlyFn(
                'passkey-vault',
                'get-withdrawal-message-hash',
                [
                    Cl.principal(wallet1),
                    Cl.uint(1_000_000n),
                    Cl.uint(0)
                ],
                wallet1
            );

            const hash2 = simnet.callReadOnlyFn(
                'passkey-vault',
                'get-withdrawal-message-hash',
                [
                    Cl.principal(wallet1),
                    Cl.uint(1_000_000n),
                    Cl.uint(1)
                ],
                wallet1
            );

            expect(hash1.result).not.toEqual(hash2.result);
        });
    });

    describe('Contract Stats', () => {
        it('tracks total vaults', () => {
            simnet.callPublicFn(
                'passkey-vault',
                'register-pubkey',
                [Cl.buffer(MOCK_PUBKEY)],
                wallet1
            );

            const total = simnet.callReadOnlyFn(
                'passkey-vault',
                'get-total-vaults',
                [],
                wallet1
            );

            expect(total.result).toEqual(Cl.uint(1));
        });

        it('returns contract balance', () => {
            simnet.callPublicFn(
                'passkey-vault',
                'register-pubkey',
                [Cl.buffer(MOCK_PUBKEY)],
                wallet1
            );

            simnet.callPublicFn(
                'passkey-vault',
                'deposit',
                [Cl.uint(5_000_000n)],
                wallet1
            );

            const balance = simnet.callReadOnlyFn(
                'passkey-vault',
                'get-contract-balance',
                [],
                wallet1
            );

            expect(balance.result).toEqual(Cl.uint(5_000_000n));
        });
    });

    describe('Contract Owner', () => {
        it('returns correct contract owner', () => {
            const owner = simnet.callReadOnlyFn(
                'passkey-vault',
                'get-contract-owner',
                [],
                wallet1
            );

            expect(owner.result).toEqual(Cl.principal(deployer));
        });
    });

    describe('Emergency Withdrawal', () => {
        it('allows owner to emergency withdraw', () => {
            // Setup: Create vault and deposit
            simnet.callPublicFn(
                'passkey-vault',
                'register-pubkey',
                [Cl.buffer(MOCK_PUBKEY)],
                wallet1
            );

            simnet.callPublicFn(
                'passkey-vault',
                'deposit',
                [Cl.uint(5_000_000n)],
                wallet1
            );

            // Emergency withdraw
            const response = simnet.callPublicFn(
                'passkey-vault',
                'emergency-withdraw',
                [Cl.uint(1_000_000n), Cl.principal(deployer)],
                deployer
            );

            expect(response.result).toBeOk(Cl.uint(1_000_000n));
        });

        it('rejects non-owner emergency withdraw', () => {
            const response = simnet.callPublicFn(
                'passkey-vault',
                'emergency-withdraw',
                [Cl.uint(1_000_000n), Cl.principal(wallet1)],
                wallet1
            );

            expect(response.result).toBeErr(Cl.uint(100)); // ERR_NOT_AUTHORIZED
        });
    });
});
