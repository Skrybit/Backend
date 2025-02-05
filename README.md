# Inscription API Endpoints

## Create Commit Transaction
This endpoint creates a commit transaction for your inscription.

```bash
curl -X POST \
  -F "file=@/path/to/your/file.txt" \
  -F "recipientAddress=YOUR_BTC_ADDRESS" \
  -F "feeRate=2" \
  http://172.81.178.142:3000/api/commit
```

Example:
```bash
curl -X POST \
  -F "file=@abc.txt" \
  -F "recipientAddress=34opMhhxjDQtdbfacypLNkVnfAnB4CByHz" \
  -F "feeRate=2" \
  http://172.81.178.142:3000/api/commit
```

### Parameters:
- `file`: The file to be inscribed
- `recipientAddress`: Bitcoin address to receive the inscription
- `feeRate`: Transaction fee rate in sats/vB (default: 2)

## Check Commit Status
Check the status of your commit transaction.

```bash
curl http://172.81.178.142:3000/api/commit/{txid}/status
```

Replace {txid} with your commit transaction ID received from the commit endpoint.

## Create Reveal Transaction
Create a reveal transaction once your commit transaction is confirmed.

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "inscriptionId": "YOUR_INSCRIPTION_ID", 
    "commitTxId": "YOUR_COMMIT_TXID",
    "vout": 0,
    "amount": 3005
  }' \
  http://172.81.178.142:3000/api/reveal
```

### Parameters:
- `inscriptionId`: Unique identifier for your inscription
- `commitTxId`: Transaction ID from the commit step
- `vout`: Output index (usually 0)
- `amount`: Amount in satoshis

## Check Reveal Status
Monitor the status of your reveal transaction.

```bash
curl http://172.81.178.142:3000/api/reveal/{txid}/status
```

Replace {txid} with your reveal transaction ID.

# Inscription Workflow

1. **Create Commit Transaction**
   - Submit your file and recipient address
   - Save the returned commit transaction ID
   - Note the payment address and amount required

2. **Send Bitcoin Payment**
   - Send the required BTC amount to the provided address
   - Wait for transaction confirmation

3. **Monitor Commit Status**
   - Check commit transaction status periodically
   - Wait for confirmed status

4. **Create Reveal Transaction**
   - Once commit is confirmed, create reveal transaction
   - Include commit transaction details

5. **Monitor Reveal Status**
   - Check reveal transaction status
   - Wait for final confirmation

# Notes
- Ensure sufficient Bitcoin is sent for the inscription
- Keep track of all transaction IDs
- Monitor both commit and reveal status until completion
- Server is running at 172.81.178.142:3000
