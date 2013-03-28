
echo off

set THIS_FOLDER_TAIL=%~dp0
set THIS_FOLDER=%THIS_FOLDER_TAIL:~0,-1%

set SMCP_ROOT=%THIS_FOLDER%

set SMCP_CPU_ARCH=x64
if %PROCESSOR_ARCHITECTURE%==x86 (
    set SMCP_CPU_ARCH=x86
) else (
    set SMCP_CPU_ARCH=x64
)


:: Node.js 3rd\node\node-0.8.4\Win64

set SMCP_UNZIP_TOOL=%SMCP_ROOT%\Tools\unzip\unzip.exe

set TARGET_PATH=%SMCP_ROOT%\3rd\node\node-0.8.4
if not exist %TARGET_PATH% md %TARGET_PATH%
if %SMCP_CPU_ARCH%==x86 (
if not exist %TARGET_PATH%\Win32  %SMCP_UNZIP_TOOL%  %SMCP_ROOT%\3rd\Packages\node-0.8.4-win32.zip -d %TARGET_PATH%
) else (
if not exist %TARGET_PATH%\Win64  %SMCP_UNZIP_TOOL%  %SMCP_ROOT%\3rd\Packages\node-0.8.4-win64.zip -d %TARGET_PATH%
)


:: Executable path of Node.js
if %SMCP_CPU_ARCH%==x86 (
    set SMCP_NODE_PATH=%SMCP_ROOT%\3rd\node\node-0.8.4\Win32\bin
) else (
    set SMCP_NODE_PATH=%SMCP_ROOT%\3rd\node\node-0.8.4\Win64\bin
)

set path=%path%;%SMCP_NODE_PATH%

cd /d %SMCP_ROOT%\server

:: Set up settings for Node.js runtime
set NODE_PATH=%SMCP_ROOT%\server;%SMCP_ROOT%\common
set NODE_ENV=production

:: Using NPM to start up application.
:: Make sure all Node.js dependencies are installed.
call npm install
call npm start

pause
