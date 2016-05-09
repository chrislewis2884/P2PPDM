@echo off
cd /D %2
%1 branch %3
%1 checkout %3 --force