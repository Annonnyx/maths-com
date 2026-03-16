#!/bin/bash

# Generate sitemaps for both domains
echo "Generating sitemap for maths-app.com..."
npx next-sitemap --config next-sitemap.config.com.js

# Move .com sitemap to separate folder
mkdir -p public/com
mv public/sitemap.xml public/com/sitemap.xml
mv public/sitemap-0.xml public/com/sitemap-0.xml

echo "Generating sitemap for www.maths-app.fr..."
npx next-sitemap --config next-sitemap.config.fr.js

# Move .fr sitemap to separate folder
mkdir -p public/fr
mv public/sitemap.xml public/fr/sitemap.xml
mv public/sitemap-0.xml public/fr/sitemap-0.xml

echo "Sitemaps generated successfully!"
echo "Deploy public/com/ to maths-app.com"
echo "Deploy public/fr/ to www.maths-app.fr"
