@echo off
cls
echo ================================================
echo    Feishu Parser Server (Debug Mode)
echo ================================================
echo.
echo Testing Python...
python3 --version
echo.
echo Starting server at: http://localhost:3000
echo.
echo ================================================
echo.

python3 feishu-parser.py
echo.
echo.
echo ERROR: Server stopped unexpectedly!
echo Check the error message above.
echo.
pause
