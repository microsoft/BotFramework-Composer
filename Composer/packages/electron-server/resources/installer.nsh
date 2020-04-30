!macro customInit
    ; Attempt to uninstall older, squirrel-based app.
    ;DetailPrint "Uninstall Squirrel-based version of application"
    ;IfFileExists "$INSTDIR\..\..\botframework\Update.exe" 0 noSquirrel
    ;nsExec::Exec '"$INSTDIR\..\..\botframework\Update.exe" --uninstall -s'
    ;noSquirrel:
!macroend

!macro customInstall
    DetailPrint "Register bfcomposer URI Handler"
    DeleteRegKey HKCU "SOFTWARE\Classes\bfcomposer"
    WriteRegStr HKCU "SOFTWARE\Classes\bfcomposer" "" "URL:Bot Framework Composer"
    WriteRegStr HKCU "SOFTWARE\Classes\bfcomposer" "URL Protocol" ""
    WriteRegStr HKCU "SOFTWARE\Classes\bfcomposer\DefaultIcon" "" "$INSTDIR\${APP_EXECUTABLE_FILENAME},1"
    WriteRegStr HKCU "SOFTWARE\Classes\bfcomposer\shell" "" ""
    WriteRegStr HKCU "SOFTWARE\Classes\bfcomposer\shell\open" "" ""
    WriteRegStr HKCU "SOFTWARE\Classes\bfcomposer\shell\open\command" "" `"$INSTDIR\${APP_EXECUTABLE_FILENAME}" "%1"`
!macroend

!macro customUninstall
    DetailPrint "Unregister bfcomposer URI Handler"
    DeleteRegKey HKCU "SOFTWARE\Classes\bfcomposer"
    ;DetailPrint "Unregister bfcomposer URI Handler"
    ;DeleteRegKey HKCU "SOFTWARE\Classes\bfcomposer"
    DetailPrint "Unregister botemulator URI Handler"
    DeleteRegKey HKCU "SOFTWARE\Classes\botemulator"
!macroend
