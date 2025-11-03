# Deploy to Vercel Script

Write-Host "🚀 Preparing AI VITON for Vercel Deployment..." -ForegroundColor Cyan
Write-Host ""

# Check if git is clean
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "⚠️  You have uncommitted changes. Committing them now..." -ForegroundColor Yellow
    git add .
    git commit -m "Configure for Vercel deployment with Gemini recommendations"
    Write-Host "✅ Changes committed!" -ForegroundColor Green
} else {
    Write-Host "✅ Git working directory is clean" -ForegroundColor Green
}

Write-Host ""
Write-Host "📦 Pushing to GitHub..." -ForegroundColor Cyan
git push origin restore-deployment

Write-Host ""
Write-Host "✨ Next Steps:" -ForegroundColor Green
Write-Host "1. Go to https://vercel.com/new"
Write-Host "2. Import your GitHub repository: Major-Project-viton"
Write-Host "3. Add these environment variables:"
Write-Host "   - GEMINI_API_KEY=your_key"
Write-Host "   - SEGMIND_API_KEY=your_key"
Write-Host "   - NEXT_PUBLIC_API_URL=/api"
Write-Host "4. Click Deploy!"
Write-Host ""
Write-Host "📖 For detailed instructions, see VERCEL_DEPLOYMENT.md" -ForegroundColor Yellow
Write-Host ""
