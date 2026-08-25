@echo off
title Deploy DUTAMIK.ID to GitHub Pages
echo ========================================================
echo   DUTAMIK.ID - One-Click GitHub Pages Deploy Script
echo ========================================================
echo.

if not exist ".git" (
    echo [1/4] Menginisialisasi Git Repository...
    git init
    git branch -M main
) else (
    echo [1/4] Git Repository terdeteksi...
)

echo [2/4] Menambahkan seluruh file...
git add .

set /p commit_msg="Masukkan pesan update (tekan Enter untuk default 'Deploy Clean URLs & Drone Robot'): "
if "%commit_msg%"=="" set commit_msg=Deploy Clean URLs and Drone Robot to GitHub Pages

echo [3/4] Melakukan commit: %commit_msg%
git commit -m "%commit_msg%"

echo [4/4] Memeriksa remote origin...
git remote -v >nul 2>&1
if errorlevel 1 (
    echo.
    echo Belum ada remote URL GitHub yang tersambung!
    set /p repo_url="Masukkan URL Repositori GitHub Anda (contoh: https://github.com/username/dutamik-id.git): "
    if not "%repo_url%"=="" (
        git remote add origin %repo_url%
        echo Remote origin berhasil ditambahkan.
    )
)

echo.
echo Melakukan push ke GitHub Pages (branch main)...
git push -u origin main --force

echo.
echo ========================================================
echo   SELESAI! File berhasil di-upload ke GitHub.
echo   Pastikan Settings -> Pages di GitHub diset ke:
echo   - Source: Deploy from a branch
echo   - Branch: main / (root)
echo ========================================================
pause
