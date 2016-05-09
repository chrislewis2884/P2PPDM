@echo off
cd /D %2
%1 add *
%1 commit -m %3
REM %1 log -p