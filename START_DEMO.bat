@echo off
chcp 65001 > nul
title Biznes-Maslahatchi AI - Запуск проекта

echo ========================================================
echo   Biznes-Maslahatchi AI - ТПП Узбекистана (Кейс #20)
echo ========================================================
echo.

cd /d "%~dp0"

echo [1/3] Проверка окружения Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
  echo [ОШИБКА] Node.js не найден в системе!
  echo Пожалуйста, установите Node.js с https://nodejs.org
  pause
  exit /b 1
)

echo [2/3] Проверка библиотек (node_modules)...
if not exist node_modules (
  echo Установка пакетов (пожалуйста подождите)...
  call npm install
)

echo [3/3] Запуск локального сервера разработки Vite...
echo.
echo --------------------------------------------------------
echo Проект откроется автоматически в браузере:
echo Адрес: http://localhost:5173
echo --------------------------------------------------------
echo Для остановки сервера нажмите Ctrl + C в этом окне.
echo.

call npm run dev -- --open --host

pause
