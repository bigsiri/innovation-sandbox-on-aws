#!/bin/bash

# Copy translation files from src/i18n/resources to public/locales
# This ensures the i18n system can load all translation files

echo "Copying translation files to public/locales..."

# Create directories if they don't exist
mkdir -p public/locales/en
mkdir -p public/locales/fr-CA

# Copy English translation files
cp src/i18n/resources/en/*.json public/locales/en/

# Copy French Canadian translation files
cp src/i18n/resources/fr-CA/*.json public/locales/fr-CA/

echo "Translation files copied successfully!"
echo "English files:"
ls -la public/locales/en/
echo ""
echo "French Canadian files:"
ls -la public/locales/fr-CA/
