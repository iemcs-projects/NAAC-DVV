'use strict';

import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import Sequelize from 'sequelize';
import process from 'process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';

// Import configuration
import config from '../config/config.js';
const envConfig = config[env];

const db = {};

let sequelize;
if (envConfig.use_env_variable) {
  sequelize = new Sequelize(process.env[envConfig.use_env_variable], envConfig);
} else {
  sequelize = new Sequelize(
    envConfig.database,
    envConfig.username,
    envConfig.password,
    {
      ...envConfig,
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
    }
  );
}

const modelFiles = fs
  .readdirSync(__dirname)
  .filter(file => (
    file.indexOf('.') !== 0 &&
    file !== basename &&
    file.slice(-3) === '.js' &&
    file.indexOf('.test.js') === -1
  ));

// Load models
for (const file of modelFiles) {
  try {
    const modelPath = pathToFileURL(path.join(__dirname, file)).href;
    const modelModule = await import(modelPath);
    const ModelOrFactory = modelModule.default || modelModule;

    if (
      typeof ModelOrFactory === 'function' &&
      Object.getPrototypeOf(ModelOrFactory).name === 'Model'
    ) {
      // Class-based model with static init()
      const model = ModelOrFactory.init(sequelize, Sequelize.DataTypes);
      db[model.name] = model;
    } else if (typeof ModelOrFactory === 'function') {
      // Function-based model definition
      const model = ModelOrFactory(sequelize, Sequelize.DataTypes);
      db[model.name] = model;
    }
  } catch (error) {
    console.error(`❌ Error loading model "${file}":`, error);
  }
}

// Set up model associations
for (const modelName of Object.keys(db)) {
  if (typeof db[modelName].associate === 'function') {
    db[modelName].associate(db);
  }
}

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
