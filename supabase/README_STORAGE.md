# Bucket Storage Supabase

Créer manuellement dans le Dashboard Supabase (Storage) :

1. **Nom du bucket** : `plant-images`
2. **Public** : Oui (pour afficher les images dans l’app via URL publique)
3. **RLS** : optionnel — si vous activez RLS sur le bucket, ajoutez une politique permettant à `auth.uid()` d’uploader dans son dossier et lecture publique pour les URLs.

Alternative sans bucket public : politique "Users can upload to own folder" avec path `{user_id}/*`.
