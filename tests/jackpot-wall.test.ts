
import { describe, it, expect, beforeEach } from 'vitest';
import { Cl } from '@stacks/transactions';

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;
const wallet3 = accounts.get("wallet_3")!;

describe('Jackpot Wall Contract', () => {
  it('ensures user can post a message and pays 1 STX', () => {
    const message = "Hello Stacks!";

    // 1. Check initial balance
    const initialBalance = simnet.getAssetsMap().get(deployer)?.get("STX") || 0n;

    // 2. Post Message
    const response = simnet.callPublicFn(
      'jackpot-wall',
      'post-message',
      [Cl.stringUtf8(message)],
      wallet1
    );

    // 3. Verify Success
    expect(response.result).toBeOk(Cl.uint(1)); // First post, ID 1

    // 4. Verify Transfer (Wallet 1 pays 1 STX)
    const balanceResponse = simnet.callReadOnlyFn(
      'jackpot-wall',
      'get-pot-balance',
      [],
      wallet1
    );
    // get-pot-balance returns 'uint', not 'response'
    expect(balanceResponse.result).toEqual(Cl.uint(1000000));
  });

  it('triggers jackpot payout on the 10th post', () => {
    // Seed pot with 9 posts
    for (let i = 1; i <= 9; i++) {
      simnet.callPublicFn(
        'jackpot-wall',
        'post-message',
        [Cl.stringUtf8(`Post #${i}`)],
        // Rotate wallets to simulate traffic
        i % 2 === 0 ? wallet2 : wallet1
      );
    }

    // Verify 9 STX in pot
    const balanceResponse = simnet.callReadOnlyFn(
      'jackpot-wall',
      'get-pot-balance',
      [],
      wallet1
    );
    expect(balanceResponse.result).toEqual(Cl.uint(9000000));

    // 10th Post (The Winner) - Wallet 3
    const winResponse = simnet.callPublicFn(
      'jackpot-wall',
      'post-message',
      [Cl.stringUtf8("Winning Post!")],
      wallet3
    );

    expect(winResponse.result).toBeOk(Cl.uint(10));

    // Analyze Events
    const events = winResponse.events;

    // Should have:
    // 1. STX transfer (User -> Contract)
    // 2. STX transfer (Contract -> User) [Payout]
    // 3. Print Event (jackpot-won)

    expect(events.length).toBeGreaterThanOrEqual(3);

    // Check Payout Transfer
    // Pot was 9 STX + 1 STX (new post) = 10 STX.
    // Payout = 90% of 10 STX = 9 STX.
    // Contract keeps 1 STX.

    const payoutEvent = events.find(e => e.event === 'stx_transfer_event' && e.data.sender === `${deployer}.jackpot-wall`);
    expect(payoutEvent).toBeDefined();
    expect(payoutEvent?.data.amount).toBe("9000000");
    expect(payoutEvent?.data.recipient).toBe(wallet3);

    // Check Print Event (for Chainhook)
    const printEvent = events.find(e => e.event === 'print_event');
    expect(printEvent).toBeDefined();

    const value = printEvent?.data.value;
    // Simple string check for now, can parse Cl.value if needed
    expect(JSON.stringify(value)).toContain("jackpot-won");
    expect(JSON.stringify(value)).toContain("is_jackpot");
  });
});
