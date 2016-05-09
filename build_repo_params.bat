@echo off
%1 init %2\Private
if %6 == True (
%1 init %2\PublicRepo.git --bare
)
set HOME = %2
cd /D "%2\Private"
%1 config user.name %3
%1 config user.email %4
%1 config core.compression 0
%1 config core.bigFileThreshold 1
echo *.prt binary >> %5
echo *.asm binary >> %5
echo *.drw binary >> %5
echo *.frm binary >> %5
if %6 == True (
%1 remote add PublicShare %2\PublicRepo.git
%1 push PublicShare master
)
