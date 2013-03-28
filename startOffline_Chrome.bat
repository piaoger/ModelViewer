
echo off

set THIS_FOLDER_TAIL=%~dp0
set THIS_FOLDER=%THIS_FOLDER_TAIL:~0,-1%

:: Start Google Chrome
start %localappdata%\Google\Chrome\Application\chrome.exe  --allow-file-access-from-files  file:///%THIS_FOLDER%\viewer\index.html

