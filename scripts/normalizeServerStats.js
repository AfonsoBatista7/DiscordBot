const mongoose = require('mongoose');
require('dotenv').config();
const fs = require('fs');

// Same secret-reading logic as main.js
const MONGODB_TOKEN = process.env.MONGODB_TOKEN_FILE
    ? fs.readFileSync(process.env.MONGODB_TOKEN_FILE, 'utf8').trim()
    : process.env.MONGODB_TOKEN;

const serverStatsModel = require('../models/serverStatsSchema');

// Fields and their defaults for missing documents
// Using $exists: false queries directly against MongoDB so Mongoose defaults don't mask missing fields
const fieldDefaults = {
    blcksDestroyed: 0,
    blcksPlaced: 0,
    kills: 0,
    mobKills: 0,
    mTravelled: 0,
    deaths: 0,
    timeslogin: 0,
    lastLogin: 'N/A',
    playerSince: 'N/A',
    timePlayedMinutes: 0,
    timeAFKMinutes: 0,
    redstoneUsed: 0,
    enderdragonKills: 0,
    witherKills: 0,
    fishCaught: 0,
    blockMined: 0,
    online: false,
    // Arrays
    names: [],
    versionPlayed: [],
    medals: [],
    blocks: [],
    mobsKilled: [],
};

async function normalize() {
    await mongoose.connect(MONGODB_TOKEN, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB\n');

    const totalPlayers = await serverStatsModel.countDocuments();
    console.log(`Total players in database: ${totalPlayers}\n`);

    for (const [field, defaultValue] of Object.entries(fieldDefaults)) {
        // Query MongoDB directly for docs where the field doesn't exist
        const result = await serverStatsModel.updateMany(
            { [field]: { $exists: false } },
            { $set: { [field]: defaultValue } }
        );

        if (result.modifiedCount > 0) {
            console.log(`  "${field}" - set default for ${result.modifiedCount} players`);
        }
    }

    // Convert Int32 fields to Int64 (Long) for Java compatibility
    const longFields = [
        'blcksDestroyed', 'blcksPlaced', 'kills', 'mobKills',
        'mTravelled', 'deaths', 'timeslogin', 'timePlayedMinutes',
        'timeAFKMinutes', 'redstoneUsed', 'enderdragonKills',
        'witherKills', 'fishCaught', 'blockMined'
    ];

    const collection = serverStatsModel.collection;
    for (const field of longFields) {
        const result = await collection.updateMany(
            { [field]: { $type: 'int' } },
            [{ $set: { [field]: { $toLong: `$${field}` } } }]
        );
        if (result.modifiedCount > 0) {
            console.log(`  "${field}" - converted Int32 to Int64 for ${result.modifiedCount} players`);
        }
    }

    // Remove the misspelled "block" field from previous run
    // Use native MongoDB collection to bypass Mongoose strict mode
    const cleanup = await collection.updateMany(
        { block: { $exists: true } },
        { $unset: { block: '' } }
    );
    if (cleanup.modifiedCount > 0) {
        console.log(`\n  Removed stale "block" field from ${cleanup.modifiedCount} players`);
    }

    console.log('\nDone. All players normalized.');
    await mongoose.disconnect();
}

normalize().catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
});
