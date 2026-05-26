import { describe, it, expect } from 'vitest';
import { Cl } from '@stacks/transactions';

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;
const wallet3 = accounts.get("wallet_3")!;

describe('Jackpot Wall Contract', () => {
  it('ensures user can post a message for free (no fee)', () => {
    const message = "Hello Stacks!";

    // 1. Post Message
    const response = simnet.callPublicFn(
      'jackpot-wall-v2',
      'post-message',
      [Cl.stringUtf8(message)],
      wallet1
    );

    // 2. Verify Success
    expect(response.result).toBeOk(Cl.uint(1)); // First post, ID 1

    // 3. Verify No Transfer (Pot balance remains 0)
    const balanceResponse = simnet.callReadOnlyFn(
      'jackpot-wall-v2',
      'get-pot-balance',
      [],
      wallet1
    );
    expect(balanceResponse.result).toEqual(Cl.uint(0));
  });

  it('triggers jackpot payout on the 10th post using pre-funded pot', () => {
    // 1. Seed 9 posts (free)
    for (let i = 1; i <= 9; i++) {
      simnet.callPublicFn(
        'jackpot-wall-v2',
        'post-message',
        [Cl.stringUtf8(`Post #${i}`)],
        i % 2 === 0 ? wallet2 : wallet1
      );
    }

    // Verify pot balance is 0
    let balanceResponse = simnet.callReadOnlyFn(
      'jackpot-wall-v2',
      'get-pot-balance',
      [],
      wallet1
    );
    expect(balanceResponse.result).toEqual(Cl.uint(0));

    // 2. Pre-fund the contract pot directly with 10 STX (10,000,000 micro-STX)
    simnet.transferSTX(10_000_000n, `${deployer}.jackpot-wall-v2`, wallet1);

    // Verify 10 STX is in pot
    balanceResponse = simnet.callReadOnlyFn(
      'jackpot-wall-v2',
      'get-pot-balance',
      [],
      wallet1
    );
    expect(balanceResponse.result).toEqual(Cl.uint(10000000));

    // 3. 10th Post (The Winner) - Wallet 3
    const winResponse = simnet.callPublicFn(
      'jackpot-wall-v2',
      'post-message',
      [Cl.stringUtf8("Winning Post!")],
      wallet3
    );

    expect(winResponse.result).toBeOk(Cl.uint(10));

    // Analyze Events
    const events = winResponse.events;

    // Should have:
    // 1. STX transfer (Contract -> User) [Payout: 90% of 10 STX = 9 STX]
    // 2. Print Event (jackpot-won)
    expect(events.length).toBeGreaterThanOrEqual(2);

    // Check Payout Transfer
    const payoutEvent = events.find(e => e.event === 'stx_transfer_event' && e.data.sender === `${deployer}.jackpot-wall-v2`);
    expect(payoutEvent).toBeDefined();
    expect(payoutEvent?.data.amount).toBe("9000000"); // 9 STX (90%)
    expect(payoutEvent?.data.recipient).toBe(wallet3);

    // Check Print Event (for Chainhook)
    const printEvent = events.find(e => e.event === 'print_event');
    expect(printEvent).toBeDefined();

    const value = printEvent?.data.value;
    expect(JSON.stringify(value)).toContain("jackpot-won");
    expect(JSON.stringify(value)).toContain("is_jackpot");
  });
});
