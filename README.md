# AgriSmart Togo

Application web MVP pour les petits agriculteurs au Togo : diagnostic des plantes par IA, tableau de bord, prix du marché et mini-formations.

## Stack

- **Frontend** : React 19, Vite 7, Tailwind CSS v4, React Router, Lucide React
- **Backend** : Supabase (Auth, PostgreSQL, Storage)
- **IA** : OpenAI Vision (GPT-4o) optionnel pour le diagnostic

## Prérequis

- Node.js 18+
- Compte Supabase

## Installation

```bash
npm install
```

## Configuration

1. Copier `.env.example` vers `.env`
2. Créer un projet sur [supabase.com](https://supabase.com)
3. Renseigner dans `.env` :
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - (Optionnel) `VITE_OPENAI_API_KEY` pour le diagnostic IA

4. Dans Supabase :
   - **SQL Editor** : exécuter les scripts dans `supabase/migrations/` dans l’ordre (000001, 000002, 000003 pour les données de démo)
   - **Storage** : créer un bucket public `plant-images` (voir `supabase/README_STORAGE.md`)

## Lancement

```bash
npm run dev
```

Ouvrir l’URL affichée (ex. http://localhost:5173).

## Build

```bash
npm run build
npm run preview
```

## Pages

| Route | Description |
|-------|-------------|
| `/` | Accueil, liens Diagnostic / Marché / Formations |
| `/login` | Connexion |
| `/signup` | Inscription |
| `/dashboard` | Tableau de bord (diagnostics, cultures) |
| `/diagnostic` | Upload photo → analyse IA → résultat |
| `/diagnostic/:id` | Détail d’un diagnostic |
| `/market` | Prix du marché par région |
| `/formations` | Vidéos et fiches conseils |

## Structure

- `src/lib/supabase.js` : client Supabase
- `src/services/` : auth, storage, ai, diagnostics
- `src/hooks/useAuth.js` : état de connexion
- `src/pages/` : pages de l’app
- `src/components/` : layout (Header, BottomNav), ProtectedRoute
- `supabase/migrations/` : schéma SQL et RLS
