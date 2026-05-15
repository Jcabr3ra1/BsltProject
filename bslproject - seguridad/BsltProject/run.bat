@echo off
echo Starting BsltProject application...
cd %~dp0
if exist mvnw.cmd (
    call mvnw.cmd spring-boot:run
) else (
    call mvn spring-boot:run
)
pause
