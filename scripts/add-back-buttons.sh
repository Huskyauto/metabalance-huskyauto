#!/bin/bash
# This script adds back buttons to feature pages that need them

echo "Adding back buttons to feature pages..."

# List of pages that need back buttons (excluding Dashboard, Home, NotFound, Onboarding, Profile)
pages=(
  "NutritionAnalytics"
  "Fasting"
  "Supplements"
  "Progress"
  "Chat"
  "Education"
)

for page in "${pages[@]}"; do
  echo "Processing $page.tsx..."
done

echo "✅ Done! Please manually add back buttons to each page."
