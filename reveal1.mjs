import * as btc from '@scure/btc-signer';
import * as ordinals from 'micro-ordinals';
import { hex } from '@scure/base';
import { secp256k1 } from '@noble/curves/secp256k1';
import fs from 'fs';
import { createInscription } from './createInscription.mjs';

// Load the saved inscription data
const savedInscriptionData = JSON.parse(fs.readFileSync('inscription_data.json', 'utf8'));

// Read file content - ensure exactly same content as commit
const fileContent = fs.readFileSync('test.txt');

// Recipient address and other parameters
const recipientAddress = 'bc1p3wrhf9qjustckfhkfs5g373ux06ydlet0vyuvd9rjpshxwvu5p6sulqxdd';
const feeRate = 5n;

// Recreate the inscription using the saved private key
const inscription = createInscription(
    fileContent,
    feeRate,
    recipientAddress,
    savedInscriptionData.tempPrivateKey
);

// Generate and log pubkey from private key
const pubkey = secp256k1.getPublicKey(inscription.tempPrivateKey, true);
console.log('Derived public key:', hex.encode(pubkey));
console.log('File content:', fileContent.toString());

// Create reveal transaction
const commitTxId = '20eae534ef8514cb8c9615d1d688723daea7f34407d7ad4eaed57b616a726128';
const vout = 0;
const amount = 3005; // Use exact amount from commit UTXO

console.log('\nCreating reveal transaction with:', {
    commitTxId,
    vout,
    amount,
    recipientAddress: recipientAddress
});

// Create the reveal transaction
const revealTx = inscription.createRevealTx(
    commitTxId,
    vout,
    amount
);

console.log(inscription)

console.log('\n=============== Reveal Transaction ===============');
console.log('Reveal transaction hex:', revealTx);
console.log('================================================');

// Save for broadcasting
fs.writeFileSync('reveal_tx.hex', revealTx);
console.log('\nTransaction saved to reveal_tx.hex');

// Also save debug info
fs.writeFileSync('debug_info.json', JSON.stringify({
    generatedAddress: inscription.address,
    pubkey: hex.encode(pubkey),
    fileContent: fileContent.toString(),
    amount: amount
}, null, 2));

console.log('\nDebug information saved to debug_info.json');