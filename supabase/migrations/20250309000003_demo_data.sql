-- Données de démo pour tests avec agriculteurs

-- Prix marché (régions Togo)
-- Exécuter une seule fois après les migrations 000001 et 000002
insert into public.market_prices (product, region, price_per_kg, unit, updated_at) values
  ('Maïs', 'Maritime', 250, 'FCFA', now()),
  ('Maïs', 'Plateaux', 230, 'FCFA', now()),
  ('Tomate', 'Maritime', 400, 'FCFA', now()),
  ('Tomate', 'Kara', 350, 'FCFA', now()),
  ('Igname', 'Plateaux', 300, 'FCFA', now()),
  ('Riz paddy', 'Maritime', 275, 'FCFA', now());

insert into public.formations (title, type, url, description, order_index) values
  ('Bien préparer le sol', 'fiche', 'https://example.com/fiche-sol', 'Préparation du sol avant semis.', 1),
  ('Irrigation goutte-à-goutte', 'video', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Vidéo courte sur l''irrigation économique.', 2),
  ('Lutter contre les ravageurs sans chimie', 'fiche', 'https://example.com/fiche-bio', 'Alternatives biologiques (neem, cendre).', 3),
  ('Rotation des cultures', 'fiche', null, 'Bonnes pratiques de rotation pour préserver le sol.', 4);
