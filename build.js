#!/usr/bin/env node

// Simple build script for Vercel deployment
console.log('🚀 Building Jersey Orders Management for Vercel...');

// Copy static files to public directory if needed
const fs = require('fs');
const path = require('path');

// Create public directory if it doesn't exist
const publicDir = './public';
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
}

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
    } else {
        console.log(`⚠️  File not found: ${file}`);
    }
});

console.log('✅ Build completed successfully!');
console.log('📦 Static files are ready for deployment in ./public directory');
