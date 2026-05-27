import { uintCV, stringUtf8CV, PostConditionMode, Pc } from '@stacks/transactions';
import { STACKS_MAINNET } from '@stacks/network';
import { makeContractCall } from '@stacks/transactions';

async function run() {
    const contractAddress = 'SP1TN1ERKXEM2H9TKKWGPGZVNVNEKS92M7M3CKVJJ';
    const contractName = 'jackpot-wall-v2';
    const functionName = 'post-message';
    const functionArgs = [stringUtf8CV('hi')];
    const network = STACKS_MAINNET;
    const postConditions = [];
    const postConditionMode = PostConditionMode.Allow;

    console.log('Building transaction...');
    try {
        const tx = await makeContractCall({
            contractAddress,
            contractName,
            functionName,
            functionArgs,
            network,
            postConditions,
            postConditionMode,
            senderKey: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef01', // Dummy key
        });
        console.log('Transaction built successfully:', tx);
    } catch (e) {
        console.error('Error building transaction:', e);
    }
}

run();
