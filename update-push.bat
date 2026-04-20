@echo off
chcp 65001 > nul
cd /d "%~dp0"

echo.
echo ========================================
echo   Git 同步并推送工具
echo ========================================
echo.

echo [1/3] 拉取远程更改...
git pull origin main --rebase
if %errorlevel% neq 0 (
    echo.
    echo 警告：拉取可能遇到冲突，请检查代码
    echo.
)

echo.
echo [2/3] 查看状态...
git status --short

echo.
echo [3/3] 推送到远程...
git push origin main

if %errorlevel% equ 0 (
    echo.
    echo ✓ 推送成功！
) else (
    echo.
    echo ✗ 推送失败，请检查错误信息
)

echo.
echo 按任意键退出...
pause > nul
