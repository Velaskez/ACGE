
      -- Supprimer l'admin s'il existe déjà
      DELETE FROM users WHERE email = 'admin@acge.ga';
      
      -- Créer l'admin avec mot de passe hashé
      INSERT INTO users (id, name, email, password, role, "createdAt", "updatedAt") 
      VALUES (
        'admin001',
        'Administrateur ACGE',
        'admin@acge.ga',
        '$2a$12$rQJ9lGHjm4ZvK3pFM6gRk.j5f0JQGTfNvN0qGd8mL4VdR5XoYkLWS',
        'ADMIN',
        NOW(),
        NOW()
      );
      
      -- Vérifier la création
      SELECT id, name, email, role FROM users WHERE email = 'admin@acge.ga';
    