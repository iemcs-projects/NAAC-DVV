import { db } from '../src/models/index.js';

// Force sync all models
const syncDB = async () => {
  try {
    console.log('Syncing database...');
    await db.sequelize.sync({ force: true }); // force: true will drop tables first
    console.log('Database synced successfully!');
  } catch (error) {
    console.error('Error syncing database:', error);
  }
};

syncDB();
