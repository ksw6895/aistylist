#!/bin/bash

# GitHub 리포지토리 URL을 여기에 입력하세요
# 예: https://github.com/yourusername/your-repo-name.git
GITHUB_REPO_URL="YOUR_GITHUB_REPO_URL_HERE"

# Git 초기 설정
git add .
git commit -m "Initial commit: AI Stylist web application"

# GitHub 리포지토리 연결
git remote add origin $GITHUB_REPO_URL
git branch -M main
git push -u origin main

echo "GitHub 리포지토리에 푸시 완료!"