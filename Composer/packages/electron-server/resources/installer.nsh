!include "X64.nsh"

!macro customInstall
  DetailPrint "Register bfcomposer URI Handler"
  DeleteRegKey HKCU "SOFTWARE\Classes\bfcomposer"
  WriteRegStr HKCU "SOFTWARE\Classes\bfcomposer" "" "URL:Bot Framework Composer"
  WriteRegStr HKCU "SOFTWARE\Classes\bfcomposer" "URL Protocol" ""
  WriteRegStr HKCU "SOFTWARE\Classes\bfcomposer\DefaultIcon" "" "$INSTDIR\${APP_EXECUTABLE_FILENAME},1"
  WriteRegStr HKCU "SOFTWARE\Classes\bfcomposer\shell" "" ""
  WriteRegStr HKCU "SOFTWARE\Classes\bfcomposer\shell\open" "" ""
  WriteRegStr HKCU "SOFTWARE\Classes\bfcomposer\shell\open\command" "" `"$INSTDIR\${APP_EXECUTABLE_FILENAME}" "%1"`

  !insertmacro InstallVCRedist_64bit
!macroend

!macro customUninstall
  DetailPrint "Unregister bfcomposer URI Handler"
  DeleteRegKey HKCU "SOFTWARE\Classes\bfcomposer"
!macroend

!macro InstallVCRedist_64bit
  ${If} ${RunningX64}
    ; Check if a recent 64-bit Visual Studio 2015-2019 redistributable is already installed
    ReadRegStr $R0 HKCR "Installer\Dependencies\VC,redist.x64,amd64,14.25,bundle" "Version"
    IfErrors 0 VCRedistAlreadyInstalled
    ReadRegStr $R0 HKCR "Installer\Dependencies\VC,redist.x64,amd64,14.26,bundle" "Version"
    IfErrors 0 VCRedistAlreadyInstalled
    ReadRegStr $R0 HKCR "Installer\Dependencies\VC,redist.x64,amd64,14.27,bundle" "Version"
    IfErrors 0 VCRedistAlreadyInstalled
    ReadRegStr $R0 HKCR "Installer\Dependencies\VC,redist.x64,amd64,14.28,bundle" "Version"
    IfErrors 0 VCRedistAlreadyInstalled
    ReadRegStr $R0 HKLM "SOFTWARE\Wow6432Node\Microsoft\VisualStudio\14.0\VC\Runtimes\x64" "Version"
    IfErrors 0 VCRedistAlreadyInstalled

    ; Download latest Visual Studio 2015-2019 redistributable and install it silently
    CreateDirectory $TEMP\BotFrameworkComposer-setup
    NSISdl::download "http://aka.ms/vs/16/release/vc_redist.x64.exe" $TEMP\BotFrameworkComposer-setup\vc_redist.x64.exe
    ExecWait "$TEMP\BotFrameworkComposer-setup\vc_redist.x64.exe /quiet /norestart"

VCRedistAlreadyInstalled:
  ${EndIf}
!macroend