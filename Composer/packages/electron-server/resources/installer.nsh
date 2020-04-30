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
!macroend
