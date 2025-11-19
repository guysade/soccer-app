$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("C:\Users\guysa\Desktop\Start Soccer App.lnk")
$Shortcut.TargetPath = "C:\Users\guysa\Documents\Soccer-team-maker\start-soccer-app.bat"
$Shortcut.WorkingDirectory = "C:\Users\guysa\Documents\Soccer-team-maker"
$Shortcut.IconLocation = "C:\Windows\System32\imageres.dll,109"
$Shortcut.Description = "Launch Soccer Team Maker App"
$Shortcut.Save()
Write-Host "Desktop shortcut created successfully!"
