const mongoose = require('mongoose');
require('dotenv').config();
const fs = require('fs');

// Same secret-reading logic as main.js
const MONGODB_TOKEN = process.env.MONGODB_TOKEN_FILE
    ? fs.readFileSync(process.env.MONGODB_TOKEN_FILE, 'utf8').trim()
    : process.env.MONGODB_TOKEN;

const gamestatModel = require('../models/gamestatSchema');

// Fields and their defaults for missing documents
// Using $exists: false queries directly against MongoDB so Mongoose defaults don't mask missing fields
const fieldDefaults = {
    // Root-level fields
    lastLogin: 'N/A',
    playerSince: 'N/A',
    timePlayedMinutes: 0,
    timeAFKMinutes: 0,
    status: false,
    versionPlayed: [],
    medals: [],
    customTags: [],
    // Nested stats fields
    'stats.blcksDestroyed': 0,
    'stats.blcksPlaced': 0,
    'stats.kills': 0,
    'stats.mobKills': 0,
    'stats.mTravelled': 0,
    'stats.deaths': 0,
    'stats.timeslogin': 0,
    'stats.redstoneUsed': 0,
    'stats.enderdragonKills': 0,
    'stats.witherKills': 0,
    'stats.fishCaught': 0,
    'stats.blockMined': 0,
    'stats.blocks': [],
    'stats.mobsKilled': [],
};

async function normalize() {
    await mongoose.connect(MONGODB_TOKEN, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB\n');

    const totalPlayers = await gamestatModel.countDocuments();
    console.log(`Total players in database: ${totalPlayers}\n`);

    for (const [field, defaultValue] of Object.entries(fieldDefaults)) {
        const result = await gamestatModel.updateMany(
            { [field]: { $exists: false } },
            { $set: { [field]: defaultValue } }
        );

        if (result.modifiedCount > 0) {
            console.log(`  "${field}" - set default for ${result.modifiedCount} players`);
        }
    }

    // Convert Int32 fields to Int64 (Long) for Java compatibility
    const longFields = [
        'timePlayedMinutes', 'timeAFKMinutes',
        'stats.blcksDestroyed', 'stats.blcksPlaced', 'stats.kills', 'stats.mobKills',
        'stats.mTravelled', 'stats.deaths', 'stats.timeslogin', 'stats.redstoneUsed',
        'stats.enderdragonKills', 'stats.witherKills', 'stats.fishCaught', 'stats.blockMined',
    ];

    const collection = gamestatModel.collection;
    for (const field of longFields) {
        const result = await collection.updateMany(
            { [field]: { $type: 'int' } },
            [{ $set: { [field]: { $toLong: `$${field}` } } }]
        );
        if (result.modifiedCount > 0) {
            console.log(`  "${field}" - converted Int32 to Int64 for ${result.modifiedCount} players`);
        }
    }

    console.log('\nDone. All players normalized.');
    await mongoose.disconnect();
}

normalize().catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
});
