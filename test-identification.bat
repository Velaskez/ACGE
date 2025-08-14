@echo off
echo 🔐 Test d'identification avec l'ID fourni...
echo.

echo 📋 Hash fourni : $2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8JZqKqG
echo 🔍 Analyse du hash :
echo - Algorithme : bcrypt ($2a$)
echo - Coût : 12
echo.

echo 🔍 Test de correspondance avec des mots de passe courants :
echo.

node test-id.js

echo.
echo 💡 Si aucun mot de passe n'a été trouvé, essayez de vous connecter avec :
echo - admin
echo - password
echo - 123456
echo - acge
echo - gabon
echo - lws
echo - vercel
echo - nextjs
echo - prisma
echo - mysql
echo - test
echo - demo
echo - user
echo - root
echo.

pause
