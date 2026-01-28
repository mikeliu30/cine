# Google Cloud Run Setup Script
# Project: CineFlow
# Project ID: aigc-content

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Google Cloud Run Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$PROJECT_ID = "aigc-workflow"
$REGION = "us-central1"
$SERVICE_NAME = "cineflow-app"
$SERVICE_ACCOUNT = "github-actions"

Write-Host "Project ID: $PROJECT_ID" -ForegroundColor Yellow
Write-Host "Region: $REGION" -ForegroundColor Yellow
Write-Host "Service Name: $SERVICE_NAME" -ForegroundColor Yellow
Write-Host ""

# Set project
Write-Host "Setting project..." -ForegroundColor Green
gcloud config set project $PROJECT_ID

# Step 1: Enable APIs
Write-Host ""
Write-Host "Step 1: Enabling APIs..." -ForegroundColor Green
Write-Host "This may take a few minutes..." -ForegroundColor Gray
Write-Host ""

gcloud services enable run.googleapis.com --project=$PROJECT_ID
gcloud services enable containerregistry.googleapis.com --project=$PROJECT_ID
gcloud services enable cloudbuild.googleapis.com --project=$PROJECT_ID
gcloud services enable artifactregistry.googleapis.com --project=$PROJECT_ID

Write-Host ""
Write-Host "APIs enabled successfully!" -ForegroundColor Green
Write-Host ""

# Step 2: Create Service Account
Write-Host "Step 2: Creating service account..." -ForegroundColor Green
$serviceAccountEmail = "$SERVICE_ACCOUNT@$PROJECT_ID.iam.gserviceaccount.com"

gcloud iam service-accounts create $SERVICE_ACCOUNT --display-name="GitHub Actions Deployer" --project=$PROJECT_ID 2>$null

Write-Host "Service account: $serviceAccountEmail" -ForegroundColor Gray
Write-Host ""

# Step 3: Grant Permissions
Write-Host "Step 3: Granting permissions..." -ForegroundColor Green

gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$serviceAccountEmail" --role="roles/run.admin" --quiet
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$serviceAccountEmail" --role="roles/storage.admin" --quiet
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$serviceAccountEmail" --role="roles/iam.serviceAccountUser" --quiet
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$serviceAccountEmail" --role="roles/artifactregistry.admin" --quiet

Write-Host "Permissions granted!" -ForegroundColor Green
Write-Host ""

# Step 4: Generate Key
Write-Host "Step 4: Generating service account key..." -ForegroundColor Green
$keyFile = "gcp-service-account-key.json"

if (Test-Path $keyFile) {
    Remove-Item $keyFile -Force
}

gcloud iam service-accounts keys create $keyFile --iam-account=$serviceAccountEmail --project=$PROJECT_ID

Write-Host "Key file created: $keyFile" -ForegroundColor Green
Write-Host ""

# Display Results
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Add GitHub Secrets:" -ForegroundColor White
Write-Host "   https://github.com/mikeliu30/cine/settings/secrets/actions" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Secret 1: GCP_PROJECT_ID" -ForegroundColor Cyan
Write-Host "   Value: $PROJECT_ID" -ForegroundColor Gray
Write-Host ""
Write-Host "   Secret 2: GCP_SA_KEY" -ForegroundColor Cyan
Write-Host "   Value: (copy JSON below)" -ForegroundColor Gray
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Service Account Key JSON:" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Get-Content $keyFile
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Push code to deploy:" -ForegroundColor White
Write-Host "   git add ." -ForegroundColor Cyan
Write-Host "   git commit -m 'Enable Cloud Run deployment'" -ForegroundColor Cyan
Write-Host "   git push" -ForegroundColor Cyan
Write-Host ""
Write-Host "Done!" -ForegroundColor Green

