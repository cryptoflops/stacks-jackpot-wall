import express from 'express';
import bodyParser from 'body-parser';

const app = express();
const port = 3000;

app.use(bodyParser.json());

// Type definition for Chainhook payload (simplified)
interface ChainhookPayload {
    apply: {
        block_identifier: {
            index: number;
            hash: string;
        };
        transactions: {
            transaction_identifier: {
                hash: string;
            };
            metadata: {
                kind: {
                    data: {
                        success: boolean;
                        result: string;
                    };
                };
                receipt: {
                    events: any[];
                };
            };
        }[];
    }[];
}

app.post('/api/events', (req, res) => {
    const payload = req.body as ChainhookPayload;

    console.log('🔗 Received Chainhook Event!');

    // Process each block in the payload
    payload.apply.forEach(block => {
        const blockHeight = block.block_identifier.index;
        console.log(`📦 Block Height: ${blockHeight}`);

        // Process transactions
        block.transactions.forEach(tx => {
            // Check for success
            if (tx.metadata.kind.data.success) {
                // Filter for print events from our contract
                tx.metadata.receipt.events.forEach(event => {
                    if (event.type === 'SmartContractEvent' && event.data.topic === 'print') {
                        const value = event.data.value; // This will be the Clarity tuple we printed

                        // Log the event
                        console.log(`✨ Event captured in tx ${tx.transaction_identifier.hash}:`);
                        console.log(JSON.stringify(value, null, 2));

                        // Here you could parse specific events:
                        // - pubkey-registered
                        // - deposit
                        // - withdrawal
                    }
                });
            }
        });
    });

    res.status(200).json({ received: true });
});

app.listen(port, () => {
    console.log(`🚀 Chainhook server listening at http://localhost:${port}`);
    console.log(`   Waiting for events from PasskeyVault...`);
});
