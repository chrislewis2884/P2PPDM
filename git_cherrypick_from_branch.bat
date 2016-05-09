@echo off
cd /D %2
%1 checkout %3 %4
del "%~5\%4"
del "%~5\%4.*"
copy "%~2\%4" "%~5\%4"
