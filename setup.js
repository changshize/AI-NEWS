#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up AI Technology News Aggregator...\n');

// Check if Node.js version is compatible
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

if (majorVersion < 16) {
  console.error('❌ Node.js version 16 or higher is required');
  console.error(`   Current version: ${nodeVersion}`);
  process.exit(1);
}

console.log('✅ Node.js version check passed');

// Function to run commands
const runCommand = (command, description) => {
  console.log(`📦 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} completed\n`);
  } catch (error) {
    console.error(`❌ ${description} failed`);
    console.error(error.message);
    process.exit(1);
  }
};

// Check if .env file exists, if not create from example
if (!fs.existsSync('.env')) {
  if (fs.existsSync('.env.example')) {
    console.log('📝 Creating .env file from .env.example...');
    fs.copyFileSync('.env.example', '.env');
    console.log('✅ .env file created\n');
    console.log('⚠️  Please edit .env file with your configuration before starting the application\n');
  } else {
    console.log('⚠️  .env.example file not found, please create .env manually\n');
  }
} else {
  console.log('✅ .env file already exists\n');
}

// Install dependencies
runCommand('npm install', 'Installing root dependencies');
runCommand('cd server && npm install', 'Installing server dependencies');
runCommand('cd client && npm install', 'Installing client dependencies');

console.log('🎉 Setup completed successfully!\n');

console.log('📋 Next steps:');
console.log('1. Make sure MongoDB is running on your system');
console.log('2. Edit .env file with your configuration (optional API keys)');
console.log('3. Initialize the database: npm run init-db');
console.log('4. Start the application: npm run dev');
console.log('');
console.log('🌐 The application will be available at:');
console.log('   Frontend: http://localhost:3000');
console.log('   Backend:  http://localhost:5000');
console.log('');
console.log('📚 For more information, see README.md');
console.log('');
console.log('Happy coding! 🚀');
