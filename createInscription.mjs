import * as btc from '@scure/btc-signer';
import * as ordinals from 'micro-ordinals';
import { hex } from '@scure/base';
import { secp256k1 } from '@noble/curves/secp256k1';
import fs from 'fs';

export function createInscription(fileContent, feeRate, recipientAddress, existingPrivKey = null) {
    // Use the provided private key or generate a new one
    const privKey = existingPrivKey
        ? hex.decode(existingPrivKey) // Convert hex string back to Uint8Array
        : secp256k1.utils.randomPrivateKey();

    console.log("privkey: " + hex.encode(privKey));
    const pubKey = btc.utils.pubSchnorr(privKey);

    // Create inscription
    const inscription = {
        tags: {
            contentType: 'text/plain;charset=utf-8',
        },
        body: fileContent,
    };

    const customScripts = [ordinals.OutOrdinalReveal];

    // Create reveal payment
    const revealPayment = btc.p2tr(
        undefined,
        ordinals.p2tr_ord_reveal(pubKey, [inscription]),
        btc.NETWORK,
        false,
        customScripts
    );

    // Calculate fees
    const minAmount = 3000n + feeRate;

    // Create reveal transaction function
    function createRevealTx(txid, index, amount) {
        const tx = new btc.Transaction({ customScripts });
        tx.addInput({
            ...revealPayment,
            txid,
            index,
            witnessUtxo: { script: revealPayment.script, amount: BigInt(amount) }
        });
        // Send to provided recipient address
        tx.addOutputAddress(
            recipientAddress,
            BigInt(amount) - 1000n,
            btc.NETWORK
        );
        tx.sign(privKey);
        tx.finalize();
        return hex.encode(tx.extract());
    }

    // Ensure we return an object with all required properties
    return {
        fileSize: fileContent.length,
        tempPrivateKey: hex.encode(privKey),
        address: revealPayment.address,
        requiredAmount: minAmount.toString(),
        createRevealTx: createRevealTx
    };
}

// Optional example usage if the script is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const recipientAddress = 'bc1p3wrhf9qjustckfhkfs5g373ux06ydlet0vyuvd9rjpshxwvu5p6sulqxdd';
    const feeRate = 5n;
    const fileContent = fs.readFileSync('test.txt');
    const inscription = createInscription(fileContent, feeRate, recipientAddress);

    console.log('=============== Inscription Details ===============');
    console.log('File size:', inscription.fileSize, 'bytes');
    console.log('Temporary private key:', inscription.tempPrivateKey);
    console.log('Address to send BTC:', inscription.address);
    console.log('Required amount:', inscription.requiredAmount, 'satoshis');
    console.log('================================================');
}