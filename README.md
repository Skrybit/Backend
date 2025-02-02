# Inscription API Endpoints

## Create Commit
\```bash
curl -X POST \
  -F "file=@/path/to/your/file.txt" \
  -F "recipientAddress=YOUR_BTC_ADDRESS" \
  -F "feeRate=2" \
  http://localhost:3000/api/commit
\```

## Check Commit Status
\```bash
curl http://localhost:3000/api/commit/1/status
\```

## Create Reveal
\```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "inscriptionId": "1",
    "commitTxId": "YOUR_COMMIT_TXID",
    "vout": 0,
    "amount": 3005
  }' \
  http://localhost:3000/api/reveal
\```

## Check Reveal Status
\```bash
curl http://localhost:3000/api/reveal/1/status
\```

# Workflow
1. Create commit transaction and save details
2. Send BTC to provided address
3. Check commit status
4. Create reveal transaction once commit is confirmed
5. Monitor reveal status