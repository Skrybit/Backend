import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

// Status endpoint handler
export const handleCommitStatus = async (req, res) => {
    try {
        const id = req.params.txid;  // Get ID from URL parameter
        
        // Open existing database connection
        const db = await open({
            filename: './inscriptions.db',
            driver: sqlite3.Database
        });
        
        // Query inscription details
        const inscription = await db.get(
            `SELECT 
                id,
                recipientAddress,
                btcAddress,
                requiredAmount,
                status,
                commitTxId,
                createdAt
            FROM inscriptions 
            WHERE id = ?`,
            [id]
        );
        
        if (!inscription) {
            return res.status(404).json({
                status: 'error',
                message: 'Inscription not found'
            });
        }
        
        res.json({
            status: 'success',
            inscription: {
                id: inscription.id,
                recipientAddress: inscription.recipientAddress,
                btcAddress: inscription.btcAddress,
                requiredAmount: inscription.requiredAmount,
                status: inscription.status,
                commitTxId: inscription.commitTxId,
                createdAt: inscription.createdAt
            }
        });

        await db.close();

    } catch (error) {
        console.error('Commit status error:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};