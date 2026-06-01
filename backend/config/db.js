const { Sequelize } = require('sequelize');

let sequelize;

if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // Essential for Neon/Supabase free tiers
      },
    },
    logging: false,
  });
} else {
  // Fallback for local development
  console.log('Warning: No DATABASE_URL found. Falling back to local PostgreSQL configuration.');
  sequelize = new Sequelize('doxbank', 'postgres', 'postgres', {
    host: '127.0.0.1',
    dialect: 'postgres',
    logging: false,
  });
}

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('[PostgreSQL] Connection established successfully.');
    
    // Synchronize schemas
    await sequelize.sync({ alter: true });
    console.log('[PostgreSQL] Database models synchronized.');
  } catch (error) {
    console.error('Database connection or synchronization failed:', error.message);
    process.exit(1);
  }
};

module.exports = {
  sequelize,
  connectDB
};
