import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import * as btc from '@scure/btc-signer';
import * as ordinals from 'micro-ordinals';
import { hex } from '@scure/base';
import { secp256k1 } from '@noble/curves/secp256k1';
import fs from 'fs/promises';
import { createInscription } from '../createInscription.mjs';

// Database initialization
export const initDb = async () => {
   const db = await open({
       filename: './inscriptions.db',
       driver: sqlite3.Database
   });

   await db.exec(`
       CREATE TABLE IF NOT EXISTS inscriptions (
           id INTEGER PRIMARY KEY AUTOINCREMENT,
           recipientAddress TEXT,
           tempPrivateKey TEXT,
           btcAddress TEXT,
           requiredAmount TEXT,
           fileSize INTEGER,
           status TEXT DEFAULT 'pending',
           createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
           commitTxId TEXT,
           revealTxId TEXT
       );
   `);

   return db;
};

// Commit endpoint handler
export const handleCommit = async (req, res) => {
   try {
       if (!req.file) {
           return res.status(400).json({ error: 'No file uploaded' });
       }

       const recipientAddress = req.body.recipientAddress;
       const feeRate = BigInt(req.body.feeRate || 5);

       if (!recipientAddress) {
           return res.status(400).json({ error: 'Recipient address is required' });
       }

       // Initialize database
       const db = await initDb();

       // Read uploaded file
       const fileContent = await fs.readFile(req.file.path);

       // Create inscription
       const inscription = createInscription(fileContent, feeRate, recipientAddress);

       // Save to database
       const result = await db.run(`
           INSERT INTO inscriptions (
               recipientAddress,
               tempPrivateKey,
               btcAddress,
               requiredAmount,
               fileSize
           ) VALUES (?, ?, ?, ?, ?)
       `, [
           recipientAddress,
           inscription.tempPrivateKey,
           inscription.address,
           inscription.requiredAmount,
           inscription.fileSize
       ]);

       // Clean up uploaded file
       await fs.unlink(req.file.path);

       // Return response
       res.json({
           status: 'success',
           inscriptionId: result.lastID,
           details: {
               fileSize: inscription.fileSize,
               tempPrivateKey: inscription.tempPrivateKey,
               btcAddress: inscription.address,
               requiredAmount: inscription.requiredAmount,
               recipientAddress: recipientAddress
           }
       });

   } catch (error) {
       console.error('Commit error:', error);
       res.status(500).json({
           status: 'error',
           message: error.message
       });
   }
};