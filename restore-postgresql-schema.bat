@echo off
echo Restauration du schéma PostgreSQL pour la production...

REM Restaurer le provider PostgreSQL
echo generator client { > prisma\schema.prisma
echo   provider = "prisma-client-js" >> prisma\schema.prisma
echo } >> prisma\schema.prisma
echo. >> prisma\schema.prisma
echo datasource db { >> prisma\schema.prisma
echo   provider  = "postgresql" >> prisma\schema.prisma
echo   url       = env("DATABASE_URL") >> prisma\schema.prisma
echo } >> prisma\schema.prisma
echo. >> prisma\schema.prisma

REM Ajouter le reste du schéma PostgreSQL
type prisma\schema.postgresql.prisma | findstr /v "generator client" | findstr /v "datasource db" >> prisma\schema.prisma

echo ✅ Schéma PostgreSQL restaure
echo.
echo Pour revenir en SQLite, executez : switch-to-sqlite.bat
pause
