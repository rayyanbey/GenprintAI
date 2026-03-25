#!/bin/bash
# Clean git history of secrets using git filter-branch

echo "⚠️  WARNING: This will rewrite git history!"
echo "You'll need to force-push after this."
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Cancelled."
  exit 1
fi

echo ""
echo "🔄 Creating backup..."
git clone --mirror . ../GenprintAI.git.backup

echo ""
echo "🧹 Rewriting history to remove secrets..."

# Create a filter script
cat > /tmp/remove-secrets.sh << 'EOF'
#!/bin/bash
# Remove database passwords from QUICK_START_TESTING.md
sed -i 's/AVNS_u-j6u2rxRfa8Q2GtB-Y/[REDACTED]/g' QUICK_START_TESTING.md

# Remove database passwords from scripts
sed -i 's/AVNS_u-j6u2rxRfa8Q2GtB-Y/[REDACTED]/g' scripts/run-migrations.ts

# Remove Aiven URL components
sed -i 's/pg-38603677-rayyanasghar9-f141\.g\.aivencloud\.com/[REDACTED].aivencloud.com/g' QUICK_START_TESTING.md
sed -i 's/pg-38603677-rayyanasghar9-f141\.g\.aivencloud\.com/[REDACTED].aivencloud.com/g' scripts/run-migrations.ts
EOF

chmod +x /tmp/remove-secrets.sh

# Apply filter-branch
git filter-branch -f --tree-filter '/tmp/remove-secrets.sh' -- --all

echo ""
echo "✅ History rewritten!"
echo ""
echo "Next steps:"
echo "1. Verify the changes: git log -p QUICK_START_TESTING.md | head -50"
echo "2. Force push: git push origin main --force"
echo ""
echo "⚠️  IMPORTANT: Notify team members to rebase their branches!"
