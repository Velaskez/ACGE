-- Création admin avec Supabase CLI
-- Supprimer l'admin existant s'il existe
DELETE FROM users WHERE email = 'admin@acge.ga';

-- Créer l'admin avec le hash du mot de passe
-- Hash bcrypt de 'admin123' avec salt rounds 12
INSERT INTO users (
  id,
  name,
  email, 
  password,
  role,
  "createdAt",
  "updatedAt"
) VALUES (
  gen_random_uuid(),
  'Administrateur ACGE',
  'admin@acge.ga',
  '$2a$12$zms0lKLehGZwrltOzkEA8eNvUWkzk0lW3WP6Zuoxz/XkiytgV7oda', -- hash de 'admin123'
  'ADMIN',
  NOW(),
  NOW()
);
