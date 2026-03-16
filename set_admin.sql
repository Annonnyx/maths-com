-- Mettre un utilisateur admin avec l'email noe.barneron@gmail.com
UPDATE users 
SET is_admin = true 
WHERE email = 'noe.barneron@gmail.com';

-- Vérification
SELECT email, is_admin, username, display_name 
FROM users 
WHERE email = 'noe.barneron@gmail.com';
