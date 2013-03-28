
echo off

set THIS_FOLDER_TAIL=%~dp0
set THIS_FOLDER=%THIS_FOLDER_TAIL:~0,-1%

::-------------------------------------------------------
:: Update Firefox configuraions
:: You can also change them in about:config
::-------------------------------------------------------
cd /D "%APPDATA%\Mozilla\Firefox\Profiles"
cd *.default
set ffile=%cd%

:: set security.fileuri.strict_origin_policy = false
type "%ffile%\prefs.js" | findstr /v ".*security.fileuri.strict_origin_policy.*" >"%ffile%\prefs_.js"
rename "%ffile%\prefs.js" "prefs__.js"
rename "%ffile%\prefs_.js" "prefs.js"
del "%ffile%\prefs__.js"

:: set javascript.options.strict = false
type "%ffile%\prefs.js" | findstr /v ".*javascript.options.strict.*" >"%ffile%\prefs_.js"
rename "%ffile%\prefs.js" "prefs__.js"
rename "%ffile%\prefs_.js" "prefs.js"
del "%ffile%\prefs__.js"

echo user_pref("javascript.options.strict", false);>>"%ffile%\prefs.js"
echo user_pref("security.fileuri.strict_origin_policy", false);>>"%ffile%\prefs.js"

set ffile=
cd %windir%

::-------------------------------------------------------
:: Launch Mozilla Firefox
::-------------------------------------------------------

:: Get Process Architecture
set SMCP_CPU_ARCH=x64
if %PROCESSOR_ARCHITECTURE%==x86 (
    set SMCP_CPU_ARCH=x86
) else (
    set SMCP_CPU_ARCH=x64
)

:: Query Firefox version
set SMCP_FIREFOX_VERSION=10.0
for /f "tokens=3,* delims= " %%a in ('
    reg query "HKEY_LOCAL_MACHINE\SOFTWARE\Wow6432Node\mozilla.org\Mozilla" /v "CurrentVersion"
    ') do (
            ::if "%%c"=="10.0" (
            set SMCP_FIREFOX_VERSION=%%a
        )
    )
)


set SMCP_FIREFOX_PATH="c:\Program Files (x86)\Mozilla Firefox\firefox.exe"
if %PROCESSOR_ARCHITECTURE%==x86 (
    set SMCP_FIREFOX_PATH="c:\Program Files\Mozilla Firefox\firefox.exe"
) else (
    set SMCP_FIREFOX_PATH="c:\Program Files (x86)\Mozilla Firefox\firefox.exe"
)

for /f "tokens=2*" %%a in ('
    reg query "HKEY_LOCAL_MACHINE\SOFTWARE\Wow6432Node\Mozilla\Mozilla Firefox 10.0\bin" /v "PathToExe"
    ') do (
            set SMCP_FIREFOX_PATH="%%b"
        )
    )
)


echo CPU Architecture is %SMCP_CPU_ARCH%
echo Firefox version is %SMCP_FIREFOX_VERSION%
echo Firefox Path is %SMCP_FIREFOX_PATH%

%SMCP_FIREFOX_PATH% -url file:///%THIS_FOLDER%\viewer\index.html

