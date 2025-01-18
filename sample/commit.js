import * as btc from '@scure/btc-signer';
import * as ordinals from 'micro-ordinals';
import { hex } from '@scure/base';
import fs from 'fs';
import { secp256k1 } from '@noble/curves/secp256k1';

// Read test.txt
const fileContent = fs.readFileSync('test.txt');

// Generate keys
const privKey = secp256k1.utils.randomPrivateKey();
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
const feeRate = 5n;
const minAmount = 3000n + feeRate;

console.log('File size:', fileContent.length, 'bytes');
console.log('Temporary private key:', hex.encode(privKey));
console.log('Address to send BTC:', revealPayment.address);
console.log('Required amount:', minAmount.toString(), 'satoshis');

// After sending BTC, call this with the transaction details
function createRevealTx(txid, index, amount) {
  const tx = new btc.Transaction({ customScripts });
  tx.addInput({
    ...revealPayment,
    txid,
    index,
    witnessUtxo: { script: revealPayment.script, amount: BigInt(amount) }
  });

  // Send to your address
  tx.addOutputAddress(
    'bc1pww66drd45lv24m9tfzvln0a5v4w26st0u8m2hl649cczj7a5j60sdcnnpt', 
    BigInt(amount) - 1000n,
    btc.NETWORK
  );
  
  tx.sign(privKey);
  tx.finalize();
  
  return hex.encode(tx.extract());
}

// Example: after sending BTC, uncomment and update these values:
/*
const revealTx = createRevealTx(
  '1e464cd3451e265faca04a69100ee9747e16f496d3eff2d89a46d5bd066e52b1', // txid
  0,  // index
  3695 // amount in sats
);
console.log('Reveal transaction hex:', revealTx);
*/