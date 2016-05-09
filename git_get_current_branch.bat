@echo off
cd /D %2
%1 symbolic-ref --short HEAD
