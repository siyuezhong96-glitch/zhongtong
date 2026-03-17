@echo off
chcp 65001 >nul
title 飞书表格解析服务器

echo.
echo ╔═══════════════════════════════════════════╗
echo ║   飞书表格解析服务器 - 启动程序          ║
echo ╚═══════════════════════════════════════════╝
echo.

:: 检查Python是否安装
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo [✓] 检测到 Python
    echo [*] 正在启动 Python 服务器...
    echo.
    python feishu-parser.py
    goto :end
)

:: 检查Node.js是否安装
node --version >nul 2>&1
if %errorlevel% == 0 (
    echo [✓] 检测到 Node.js
    echo [*] 正在启动 Node.js 服务器...
    echo.
    node feishu-parser-server.js
    goto :end
)

:: 如果都没有安装
echo [✗] 未检测到 Python 或 Node.js
echo.
echo 请先安装以下环境之一：
echo.
echo 方案1: 安装 Python 3.x
echo    下载地址: https://www.python.org/downloads/
echo.
echo 方案2: 安装 Node.js
echo    下载地址: https://nodejs.org/
echo.
echo 安装完成后，重新运行本脚本。
echo.
pause

:end
