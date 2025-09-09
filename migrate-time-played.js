const mongoose = require('mongoose');
const serverStatsModel = require('./models/serverStatsSchema');
require('dotenv').config();

const parseTimeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    
    // Handle different formats:
    // "413 Hr 7 Min", "4 Hours", "30 Min", "2 Hours 15 Min"
    const hourMatches = timeStr.match(/(\d+)\s+(Hr|Hours?)/);
    const minuteMatches = timeStr.match(/(\d+)\s+Min/);
    
    const hours = hourMatches ? parseInt(hourMatches[1]) : 0;
    const minutes = minuteMatches ? parseInt(minuteMatches[1]) : 0;
    
    return hours * 60 + minutes;
};

async function migrateTimePlayed() {
    try {
        await mongoose.connect(process.env.MONGODB_TOKEN, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('Connected to database');

        const players = await serverStatsModel.find();
        console.log(`Found ${players.length} players to migrate`);

        for (const player of players) {
            const timePlayedMinutes = parseTimeToMinutes(player.timePlayed);
            
            await serverStatsModel.findOneAndUpdate(
                { _id: player._id },
                { $set: { timePlayedMinutes } }
            );
            
            console.log(`Updated ${player.name}: "${player.timePlayed}" -> ${timePlayedMinutes} minutes`);
        }

        console.log('Migration completed successfully!');
        process.exit(0);

    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrateTimePlayed();