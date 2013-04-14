
echo off

set THIS_FOLDER_TAIL=%~dp0
set THIS_FOLDER=%THIS_FOLDER_TAIL:~0,-1%

::set CHROME_FOLDER="C:\Program Files\Google\Chrome\Application"

:: Start Google Chrome
start %localappdata%\Google\Chrome\Application\chrome.exe  --allow-file-access-from-files  file:///%THIS_FOLDER%\www\viewer\index.html


::cd /d %CHROME_FOLDER%
::start chrome.exe --allow-file-access-from-files  file:///%THIS_FOLDER%/www/viewer/index.html
