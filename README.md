# Inscription API Endpoints

## Create Commit Transaction
Creates a commit transaction for an inscription.

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
Check the status of a commit transaction using sequential ID numbers.

```bash
curl http://172.81.178.142:3000/api/commit/{id}/status
```

Example:
```bash
curl http://172.81.178.142:3000/api/commit/1/status
```

The ID is a sequential number starting from 1. Examples:
```bash
curl http://172.81.178.142:3000/api/commit/1/status
curl http://172.81.178.142:3000/api/commit/2/status
curl http://172.81.178.142:3000/api/commit/3/status
```

## Create Reveal Transaction
Creates a reveal transaction once the commit transaction is confirmed.

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "inscriptionId": "1", 
    "commitTxId": "COMMIT_TXID",
    "vout": 0,
    "amount": 3005
  }' \
  http://172.81.178.142:3000/api/reveal
```

### Parameters:
- `inscriptionId`: Sequential ID number matching the commit ID
- `commitTxId`: Transaction ID from the commit step
- `vout`: Output index (usually 0)
- `amount`: Amount in satoshis

## Check Reveal Status
Monitor the status of a reveal transaction.

```bash
curl http://172.81.178.142:3000/api/reveal/{id}/status
```

Example:
```bash
curl http://172.81.178.142:3000/api/reveal/1/status
```

The ID follows the same sequential numbering as the commit status.

# Inscription Workflow

1. **Create Commit Transaction**
   - Submit the file and recipient address
   - Save both the sequential ID and transaction ID
   - Note the payment address and amount required

2. **Request Bitcoin Payment**
   - Request user to send the required BTC amount to the provided address

3. **Monitor Commit Status**
   - The Bitcoin payment transaction IS the commit transaction
   - Check commit status using the sequential ID

4. **Create Reveal Transaction**
   - Once commit is confirmed, create reveal transaction
   - Use the same sequential ID from commit step
   - Include the commit transaction ID

5. **Monitor Reveal Status**
   - Check reveal status using the sequential ID
   - Wait for final confirmation

# Notes
- Sequential IDs start from 1 and increment with each new inscription
- Important to track both sequential ID and transaction ID
- Monitor both commit and reveal status until completion
- Server is running at 172.81.178.142:3000
