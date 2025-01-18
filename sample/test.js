import * as btc from '@scure/btc-signer';
import * as ordinals from 'micro-ordinals';
import { hex, utf8 } from '@scure/base';
import fs from 'fs';

async function createInscription({
  filePath,
  feeRate,
  destinationAddress,
  network = 'mainnet'
}) {
  // Read file content
  const fileContent = fs.readFileSync(filePath);
  const fileType = getFileType(filePath);

  // Set network
  const NETWORK = network === 'mainnet' ? btc.NETWORK : btc.TEST_NETWORK;

  // Generate temporary keys
  const privKey = btc.schnorrKeygen();
  const pubKey = btc.utils.pubSchnorr(privKey);

  // Create inscription object
  const inscription = {
    tags: {
      contentType: fileType,
    },
    body: fileContent,
  };

  // Enable custom scripts
  const customScripts = [ordinals.OutOrdinalReveal];

  // Create reveal payment
  const revealPayment = btc.p2tr(
    undefined,
    ordinals.p2tr_ord_reveal(pubKey, [inscription]),
    NETWORK,
    false,
    customScripts
  );

  // Calculate required amount including fee
  const feeAmount = BigInt(feeRate);
  const minAmount = 3000n + feeAmount; // Base amount plus fee

  console.log('Network:', network);
  console.log('File:', filePath, `(mime=${fileType}, size=${fileContent.length} bytes)`);
  console.log('Temporary private key:', btc.WIF.encode(privKey, NETWORK, true));
  console.log('Recovery private key:', btc.WIF.encode(btc.schnorrKeygen(), NETWORK, true));
  console.log('Fee:', feeAmount.toString(), 'satoshi');
  console.log(`Please send at least ${minAmount} satoshi to ${revealPayment.address}`);

  return {
    inscriptionAddress: revealPayment.address,
    revealPayment,
    privKey,
    pubKey,
    customScripts,
    minAmount
  };
}

async function createRevealTransaction({
  txid,
  index,
  amount,
  revealPayment,
  privKey,
  destinationAddress,
  customScripts,
  network = 'mainnet'
}) {
  const NETWORK = network === 'mainnet' ? btc.NETWORK : btc.TEST_NETWORK;
  
  // Create reveal transaction
  const tx = new btc.Transaction({ customScripts });
  tx.addInput({
    ...revealPayment,
    txid: txid,
    index: parseInt(index),
    witnessUtxo: { script: revealPayment.script, amount: BigInt(Math.floor(amount * 100000000)) }
  });

  tx.addOutputAddress(destinationAddress, BigInt(Math.floor(amount * 100000000)) - 1000n, NETWORK);
  tx.sign(privKey);
  tx.finalize();

  const txHex = hex.encode(tx.extract());
  console.log('Reveal transaction created.');
  console.log('Tx:', txHex);

  return txHex;
}

function getFileType(filePath) {
  // Simple MIME type mapping
  const ext = filePath.split('.').pop().toLowerCase();
  const mimeTypes = {
    txt: 'text/plain;charset=utf-8',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    json: 'application/json',
    html: 'text/html',
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

// Example usage:
async function main() {
  const inscriptionInfo = await createInscription({
    filePath: 'test.txt',
    feeRate: 5,
    destinationAddress: 'bc1pww66drd45lv24m9tfzvln0a5v4w26st0u8m2hl649cczj7a5j60sdcnnpt',
    network: 'mainnet'
  });

  // After sending BTC to the inscription address, create reveal transaction
  const revealTx = await createRevealTransaction({
    txid: '1e464cd3451e265faca04a69100ee9747e16f496d3eff2d89a46d5bd066e52b1',
    index: 0,
    amount: 0.00003695,
    revealPayment: inscriptionInfo.revealPayment,
    privKey: inscriptionInfo.privKey,
    destinationAddress: 'bc1pww66drd45lv24m9tfzvln0a5v4w26st0u8m2hl649cczj7a5j60sdcnnpt',
    customScripts: inscriptionInfo.customScripts,
    network: 'mainnet'
  });

  console.log('Broadcast this transaction to complete the inscription');
}

main().catch(console.error);
