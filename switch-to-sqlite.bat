@echo off
echo Basculement vers SQLite pour le developpement...

REM Modifier le provider vers SQLite
echo generator client { > prisma\schema.prisma
echo   provider = "prisma-client-js" >> prisma\schema.prisma
echo } >> prisma\schema.prisma
echo. >> prisma\schema.prisma
echo datasource db { >> prisma\schema.prisma
echo   provider = "sqlite" >> prisma\schema.prisma
echo   url      = env("DATABASE_URL") >> prisma\schema.prisma
echo } >> prisma\schema.prisma
echo. >> prisma\schema.prisma

REM Ajouter le reste du schéma SQLite
type prisma\schema.sqlite.prisma | findstr /v "generator client" | findstr /v "datasource db" >> prisma\schema.prisma

echo ✅ Schéma SQLite active
echo.
echo Pour revenir en PostgreSQL, executez : restore-postgresql-schema.bat
pause
