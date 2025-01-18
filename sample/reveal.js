import * as btc from '@scure/btc-signer';
import * as ordinals from 'micro-ordinals';
import { hex } from '@scure/base';
import fs from 'fs';

// These are the details you need to fill in:
const COMMIT_TXID = '4585a6ff5be60488cefc08430cebe68a4af6cc7ed4774eb4949e8a4d60eca831'; // Replace with your txid
const OUTPUT_INDEX = 0;
const AMOUNT_SATS = 3005;
const PRIVATE_KEY = '8afd01f98e77d937da50ae6a587e661f29659c224b42684e868bffd15c3a3957'; // Replace with your private key
const DESTINATION_ADDRESS = 'bc1ptgp6wev2era3fpgq0mlg33dsqv9utljchkqgjy4sy8gp8fp98mysgkt332'; // Replace with destination

// Read file and create inscription
const fileContent = fs.readFileSync('test.txt');
const inscription = {
  tags: {
    contentType: 'text/plain;charset=utf-8',
  },
  body: fileContent,
};

// Convert hex private key to Uint8Array
const privKey = hex.decode(PRIVATE_KEY);
const pubKey = btc.utils.pubSchnorr(privKey);

const customScripts = [ordinals.OutOrdinalReveal];

// Create reveal payment
const revealPayment = btc.p2tr(
  undefined,
  ordinals.p2tr_ord_reveal(pubKey, [inscription]),
  btc.NETWORK,
  false,
  customScripts
);

// Create reveal transaction
const tx = new btc.Transaction({ customScripts });
tx.addInput({
  ...revealPayment,
  txid: COMMIT_TXID,
  index: OUTPUT_INDEX,
  witnessUtxo: { script: revealPayment.script, amount: BigInt(AMOUNT_SATS) }
});

tx.addOutputAddress(
  DESTINATION_ADDRESS, 
  BigInt(AMOUNT_SATS) - 1000n,
  btc.NETWORK
);

tx.sign(privKey);
tx.finalize();

const revealTxHex = hex.encode(tx.extract());
console.log('\nReveal Transaction Hex:');
console.log(revealTxHex);
