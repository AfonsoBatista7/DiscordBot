/**
 * Migration script: old profilemodels + serverstats → new schema
 *
 * Usage:
 *   node scripts/migrate.js [profilemodels.json] [serverstats.json]
 *
 * Defaults to DiscordBot.profilemodels.json and DiscordBot.serverstats.json
 * in the project root.
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const userModel = require('../models/userSchema');
const identityModel = require('../models/identitySchema');
const platformstatsModel = require('../models/platformstatsSchema');
const gamestatModel = require('../models/gamestatSchema');
const serversModel = require('../models/serversSchema');

const MONGODB_TOKEN = process.env.MONGODB_TOKEN_FILE
    ? fs.readFileSync(process.env.MONGODB_TOKEN_FILE, 'utf8').trim()
    : process.env.MONGODB_TOKEN;

// ─── helpers ────────────────────────────────────────────────────────────────

function loadJson(filePath) {
    const content = fs.readFileSync(path.resolve(filePath), 'utf8').trim();
    // mongoexport produces a JSON array or JSONL — handle both
    if (content.startsWith('[')) return JSON.parse(content);
    return content.split('\n').filter(l => l.trim()).map(l => JSON.parse(l));
}

/** Converts a MongoDB $numberLong / $numberInt / $numberDouble value to a JS number */
function num(val) {
    if (val === null || val === undefined) return 0;
    if (typeof val === 'number') return val;
    if (typeof val === 'object') {
        if ('$numberLong' in val)   return parseInt(val.$numberLong, 10);
        if ('$numberInt' in val)    return parseInt(val.$numberInt, 10);
        if ('$numberDouble' in val) return parseFloat(val.$numberDouble);
    }
    return 0;
}

/** Extracts the base64 string from a { $binary: { base64, subType } } field (or returns null) */
function binaryBase64(val) {
    if (!val) return null;
    if (typeof val === 'object' && val.$binary) return val.$binary.base64;
    return null;
}

/** Converts a 16-byte base64 string to a UUID string (8-4-4-4-12) */
function base64ToUUID(b64) {
    const hex = Buffer.from(b64, 'base64').toString('hex');
    return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
}

/** Normalises a mobsKilled entry's numeric fields */
function normaliseMob(mob) {
    return {
        mId: num(mob.mId),
        mName: mob.mName || '',
        mNumKilled: num(mob.mNumKilled),
    };
}

/** Normalises a blocks entry's numeric fields */
function normaliseBlock(block) {
    return {
        bName: block.bName || '',
        bNumDestroyed: num(block.bNumDestroyed),
        bNumPlaced: num(block.bNumPlaced),
    };
}

// ─── main ────────────────────────────────────────────────────────────────────

async function migrate() {
    const profilesFile    = process.argv[2] || 'DiscordBot.profilemodels.json';
    const serverstatsFile = process.argv[3] || 'DiscordBot.serverstats.json';

    const profiles    = loadJson(profilesFile);
    const serverstats = loadJson(serverstatsFile);

    console.log(`Loaded ${profiles.length} profiles and ${serverstats.length} serverstats\n`);

    await mongoose.connect(MONGODB_TOKEN, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB\n');

    // Use the first server in the DB, or create a placeholder
    let server = await serversModel.findOne();
    if (!server) {
        console.log('No server found — creating a placeholder server entry...');
        server = await serversModel.create({
            ip: process.env.MINECRAFT_SERVER_IP || 'unknown',
            name: 'Migrated Server',
            status: false,
        });
    }
    console.log(`Using server: "${server.name}" (${server.ip})\n`);

    // ── Build lookup tables ──────────────────────────────────────────────────

    // serverstat by its base64 playerId
    const serverstatByPlayerUUID = {};
    for (const stat of serverstats) {
        const b64 = binaryBase64(stat.playerId);
        if (b64) serverstatByPlayerUUID[b64] = stat;
    }

    // profile by discordUserId
    const profileByDiscordId = {};
    for (const p of profiles) {
        if (p.userId) profileByDiscordId[p.userId] = p;
    }

    // ── Counters ─────────────────────────────────────────────────────────────
    let counts = { users: 0, discord: 0, mc: 0, platformstats: 0, gamestats: 0, skipped: 0 };

    // Track which serverstats have been handled (by their base64 playerId)
    const handledPlayerUUIDs = new Set();

    // ── Phase 1: profiles ────────────────────────────────────────────────────
    console.log('Phase 1: migrating profiles...');

    for (const profile of profiles) {
        if (!profile.userId) {
            console.warn(`  [skip] profile with no userId`);
            counts.skipped++;
            continue;
        }

        // Idempotency: skip if Discord identity already exists
        const existingDiscord = await identityModel.findOne({ externalId: profile.userId, provider: 'discord' });
        if (existingDiscord) {
            console.log(`  [skip] Discord identity ${profile.userId} already migrated`);
            counts.skipped++;
            continue;
        }

        const linkB64 = binaryBase64(profile.link);
        const linkedStat = linkB64 ? serverstatByPlayerUUID[linkB64] : null;

        // Create the physical user
        const user = await userModel.create({});
        counts.users++;

        // Create Discord identity
        const discordIdentity = await identityModel.create({
            userId: user._id,
            externalId: profile.userId,
            username: profile.userName || profile.username || null,
            provider: 'discord',
        });
        counts.discord++;

        // Create platformstats for this Discord identity
        await platformstatsModel.create({
            identityId: discordIdentity._id,
            balance: profile.coins ?? 250,
            numMessages: profile.numMessages ?? 0,
        });
        counts.platformstats++;

        // If linked to a Minecraft player, create MC identity + gamestat under the same user
        if (linkedStat) {
            const mcUUID = base64ToUUID(linkB64);
            handledPlayerUUIDs.add(linkB64);

            // Idempotency
            const existingMC = await identityModel.findOne({ externalId: mcUUID, provider: 'minecraft' });
            if (existingMC) {
                console.log(`  [skip] MC identity ${linkedStat.name} already migrated`);
            } else {
                const mcIdentity = await identityModel.create({
                    userId: user._id,
                    externalId: mcUUID,
                    username: linkedStat.name,
                    provider: 'minecraft',
                });
                counts.mc++;

                await createGamestat(mcIdentity._id, linkedStat, server._id);
                counts.gamestats++;
            }

            console.log(`  [linked] ${profile.userId} (${profile.userName}) ↔ ${linkedStat.name}`);
        } else {
            console.log(`  [discord] ${profile.userId} (${profile.userName})`);
        }
    }

    // ── Phase 2: unlinked serverstats ────────────────────────────────────────
    console.log('\nPhase 2: migrating remaining serverstats...');

    for (const stat of serverstats) {
        const b64 = binaryBase64(stat.playerId);
        if (!b64 || handledPlayerUUIDs.has(b64)) continue; // already handled in phase 1

        const mcUUID = base64ToUUID(b64);

        // Idempotency
        const existingMC = await identityModel.findOne({ externalId: mcUUID, provider: 'minecraft' });
        if (existingMC) {
            console.log(`  [skip] MC identity ${stat.name} already migrated`);
            counts.skipped++;
            continue;
        }

        // stat.link = Discord userId (may be empty string)
        const discordLink = stat.link && stat.link.trim() ? stat.link.trim() : null;
        let userId;

        if (discordLink) {
            // Attach to the same physical user as the Discord identity, if it exists
            const discordIdentity = await identityModel.findOne({ externalId: discordLink, provider: 'discord' });
            if (discordIdentity) {
                userId = discordIdentity.userId;
                console.log(`  [mc→discord] ${stat.name} attached to existing Discord user ${discordLink}`);
            }
        }

        if (!userId) {
            const user = await userModel.create({});
            userId = user._id;
            counts.users++;
        }

        const mcIdentity = await identityModel.create({
            userId,
            externalId: mcUUID,
            username: stat.name,
            provider: 'minecraft',
        });
        counts.mc++;

        await createGamestat(mcIdentity._id, stat, server._id);
        counts.gamestats++;

        console.log(`  [mc] ${stat.name}`);
    }

    // ── Summary ──────────────────────────────────────────────────────────────
    console.log('\n─── Migration complete ───────────────────────────────');
    console.log(`  Users created:         ${counts.users}`);
    console.log(`  Discord identities:    ${counts.discord}`);
    console.log(`  MC identities:         ${counts.mc}`);
    console.log(`  Platformstats:         ${counts.platformstats}`);
    console.log(`  Gamestats:             ${counts.gamestats}`);
    console.log(`  Skipped (duplicates):  ${counts.skipped}`);

    await mongoose.disconnect();
}

// ─── helper: build and insert a gamestat document ────────────────────────────

async function createGamestat(mcIdentityId, stat, serverId) {
    return gamestatModel.create({
        identityId: mcIdentityId,
        serverId: String(serverId),
        lastLogin:          stat.lastLogin   || 'N/A',
        playerSince:        stat.playerSince || 'N/A',
        timePlayedMinutes:  num(stat.timePlayedMinutes),
        timeAFKMinutes:     num(stat.timeAFKMinutes),
        status:             stat.online || false,
        medals:             (stat.medals || []).map(m => ({ medalName: m.medalName, medalLevel: m.medalLevel })),
        versionPlayed:      stat.versionPlayed || [],
        customTags:         [],
        stats: {
            kills:            num(stat.kills),
            mTravelled:       num(stat.mTravelled),
            deaths:           num(stat.deaths),
            timeslogin:       num(stat.timeslogin),
            redstoneUsed:     num(stat.redstoneUsed),
            enderdragonKills: num(stat.enderdragonKills),
            witherKills:      num(stat.witherKills),
            fishCaught:       num(stat.fishCaught),
            mobKills:         num(stat.mobKills),
            blockMined:       num(stat.blockMined),
            blcksDestroyed:   num(stat.blcksDestroyed),
            blcksPlaced:      num(stat.blcksPlaced),
            blocks:           (stat.blocks || []).map(normaliseBlock),
            mobsKilled:       (stat.mobsKilled || []).map(normaliseMob),
        },
    });
}

function normaliseBlock(b) {
    return { bName: b.bName || '', bNumDestroyed: num(b.bNumDestroyed), bNumPlaced: num(b.bNumPlaced) };
}

function normaliseMob(m) {
    return { mId: num(m.mId), mName: m.mName || '', mNumKilled: num(m.mNumKilled) };
}

// ─── run ─────────────────────────────────────────────────────────────────────

migrate().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});
