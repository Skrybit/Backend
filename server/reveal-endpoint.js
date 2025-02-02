import * as btc from '@scure/btc-signer';
import * as ordinals from 'micro-ordinals';
import { hex } from '@scure/base';
import { secp256k1 } from '@noble/curves/secp256k1';
import fs from 'fs';
import { createInscription } from './createInscription.mjs';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

export const handleReveal = async (req, res) => {
    try {
        const { inscriptionId, commitTxId, vout = 0, amount } = req.body;

        if (!inscriptionId || !commitTxId || !amount) {
            return res.status(400).json({
                status: 'error',
                message: 'Required parameters: inscriptionId, commitTxId, amount'
            });
        }

        // Get inscription details from database
        const db = await open({
            filename: './inscriptions.db',
            driver: sqlite3.Database
        });

        const inscriptionData = await db.get(
            'SELECT * FROM inscriptions WHERE id = ?',
            [inscriptionId]
        );

        if (!inscriptionData) {
            return res.status(404).json({
                status: 'error',
                message: 'Inscription not found'
            });
        }

        // Read file content
        const fileContent = fs.readFileSync('test.txt');

        // Recreate the inscription using data from database
        const inscription = createInscription(
            fileContent,
            5n,  // feeRate
            inscriptionData.recipientAddress,
            inscriptionData.tempPrivateKey
        );

        // Generate pubkey from private key
        const pubkey = secp256k1.getPublicKey(inscription.tempPrivateKey, true);

        // Create reveal transaction
        const revealTx = inscription.createRevealTx(
            commitTxId,
            vout,
            amount
        );

        // Update database with commit transaction ID
        await db.run(
            'UPDATE inscriptions SET commitTxId = ?, status = ? WHERE id = ?',
            [commitTxId, 'revealing', inscriptionId]
        );

        // Save for broadcasting
        fs.writeFileSync(`reveal_tx_${inscriptionId}.hex`, revealTx);

        // Save debug info
        fs.writeFileSync(`debug_info_${inscriptionId}.json`, JSON.stringify({
            generatedAddress: inscription.address,
            pubkey: hex.encode(pubkey),
            fileContent: fileContent.toString(),
            amount: amount
        }, null, 2));

        await db.close();

        res.json({
            status: 'success',
            inscriptionId,
            revealTxHex: revealTx,
            debugInfo: {
                generatedAddress: inscription.address,
                pubkey: hex.encode(pubkey),
                amount: amount
            }
        });

    } catch (error) {
        console.error('Reveal error:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};