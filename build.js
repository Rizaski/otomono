#!/usr/bin/env node

// Simple build script for Vercel deployment
// Version 1.0.1 - Fixed ES modules and public directory creation
console.log('🚀 Building Jersey Orders Management for Vercel...');
console.log('📦 Version 1.0.1 - ES Modules Build Script');

// Copy static files to public directory if needed
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create public directory if it doesn't exist
const publicDir = './public';
console.log(`📁 Creating public directory: ${publicDir}`);

// Remove existing public directory if it exists
if (fs.existsSync(publicDir)) {
    console.log('🗑️  Removing existing public directory...');
    fs.rmSync(publicDir, { recursive: true, force: true });
}

// Create new public directory
fs.mkdirSync(publicDir, { recursive: true });
console.log('✅ Public directory created successfully');

// List of files to copy to public directory
const filesToCopy = [
    'index.html',
    'login.html',
    'orders.html',
    'customers.html',
    'settings.html',
    'reports.html',
    'customer.html',
    'styles.css',
    'customer-styles.css',
    'orders-script.js',
    'customer-script.js',
    'data-manager.js',
    'firebase-config.js',
    'firebase-service.js',
    'firebase-data-manager.js',
    'icons.js',
    'logo.png'
];

console.log('📁 Copying static files to public directory...');

let copiedCount = 0;
let missingCount = 0;

filesToCopy.forEach(file => {
    const sourcePath = `./${file}`;
    const destPath = `${publicDir}/${file}`;
    
    if (fs.existsSync(sourcePath)) {
        // Create directory if needed
        const destDir = path.dirname(destPath);
        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
        }
        
        // Copy file
        fs.copyFileSync(sourcePath, destPath);
        console.log(`✅ Copied ${file}`);
        copiedCount++;
    } else {
        console.log(`⚠️  File not found: ${file}`);
        missingCount++;
    }
});

console.log(`\n📊 Build Summary:`);
console.log(`✅ Files copied: ${copiedCount}`);
console.log(`⚠️  Files missing: ${missingCount}`);
console.log('✅ Build completed successfully!');
console.log(`📦 Static files are ready for deployment in ${publicDir} directory`);

// Verify public directory exists and has content
if (fs.existsSync(publicDir)) {
    const files = fs.readdirSync(publicDir);
    console.log(`📁 Public directory contains ${files.length} files:`);
    files.forEach(file => console.log(`   - ${file}`));
} else {
    console.error('❌ ERROR: Public directory was not created!');
    process.exit(1);
}
