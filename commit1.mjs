import * as btc from '@scure/btc-signer';
import * as ordinals from 'micro-ordinals';
import { hex } from '@scure/base';
import { secp256k1 } from '@noble/curves/secp256k1';
import fs from 'fs';
import { createInscription } from './createInscription.mjs';

// Set parameters
const recipientAddress = 'bc1p3wrhf9qjustckfhkfs5g373ux06ydlet0vyuvd9rjpshxwvu5p6sulqxdd';
const feeRate = 5n;
const filePath = 'test.txt';

// Read file content
const fileContent = fs.readFileSync(filePath);

// Create inscription
const inscription = createInscription(fileContent, feeRate, recipientAddress);

// Log commit transaction details
console.log('=============== Inscription Details ===============');
console.log('File size:', inscription.fileSize, 'bytes');
console.log('Temporary private key:', inscription.tempPrivateKey);
console.log('Address to send BTC:', inscription.address);
console.log('Required amount:', inscription.requiredAmount, 'satoshis');
console.log('================================================');
console.log(inscription)
// Save entire inscription object
fs.writeFileSync('inscription_data.json', JSON.stringify(inscription, null, 2));
console.log('Entire inscription object saved to inscription_data.json');
console.log('Send exactly', inscription.requiredAmount, 'satoshis to', inscription.address);
console.log('After the transaction confirms, use reveal.mjs with the transaction ID to complete the inscription.');