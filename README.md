# OrdiSpace — Application Client

Application web mobile (Next.js) destinée aux clients OrdiSpace : catalogue d'ordinateurs et d'accessoires, commande, suivi de livraison, garantie & GarantiX, SAV, parrainage/privilèges, assistant IA, et gestion de compte.

Elle consomme l'API du dépôt [`Ordi-Space_backend`](https://github.com/Daymond2025/Ordi-Space_backend) (Laravel) via des jetons Bearer (Sanctum). Le back-office correspondant est le dépôt [`Ordi-Space_Admin_Web`](https://github.com/Daymond2025/Ordi-Space_Admin_Web).

## Stack technique

- [Next.js 16](https://nextjs.org) (App Router, Turbopack) + React 19 + TypeScript
- Tailwind CSS 4
- Authentification par jeton Bearer (Sanctum), stocké côté client et injecté sur chaque appel API (`src/lib/api.ts`)
- Aucune dépendance à un gestionnaire d'état externe : contextes React (`src/context/`) pour l'auth, le panier et les feuilles de service

## Fonctionnalités principales

- **Catalogue & commande** — Market Space (produits), fiche produit, panier, tunnel de commande, suivi de commande.
- **Mes achats** — historique des achats livrés, détail par ligne (garantie de base, accessoires compatibles).
- **GarantiX** — souscription à une formule de maintenance étendue sur un ordinateur acheté. Le paiement (espèces / Mobile Money) est déclaré par le client puis **confirmé par un administrateur** avant activation réelle — voir `src/app/(shell)/service/garantix/page.tsx`.
- **Service après-vente** — déclaration de panne, prise de rendez-vous, suivi des demandes de maintenance.
- **Privilège Space** — codes promo, parrainage, portefeuille (solde et historique de crédits).
- **Academy** — tutoriels et astuces.
- **Assistant IA (Ellah)** — chat d'assistance grounded sur les données du client.
- **Compte** — inscription, connexion (OTP par e-mail), gestion du profil et des adresses, notifications.

## Structure du projet

```
src/
├── app/
│   ├── connexion/, inscription/       # Authentification (hors coquille avec navigation)
│   └── (shell)/                       # Pages avec navigation principale
│       ├── market-space/, produit/    # Catalogue & fiche produit
│       ├── panier/                    # Panier & tunnel de commande
│       ├── mes-commandes/, mes-achats/
│       ├── service/                   # SAV, déclaration de panne, GarantiX, maintenance
│       ├── privilege/                 # Codes promo, parrainage
│       ├── academy/                   # Tutoriels
│       ├── notifications/
│       └── profil/                    # Compte, adresses, portefeuille, aide
├── components/                        # Composants partagés (icônes, feuilles, etc.)
├── context/                           # AuthContext, PanierContext, ServiceSheetContext
└── lib/
    ├── api.ts                         # Client HTTP (fetch + gestion des erreurs API)
    └── types.ts                       # Types partagés + formatage (prix, dates, libellés)
```

## Démarrage

Prérequis : Node.js 20+, et l'API backend lancée (localement ou en pointant vers la prod).

```bash
npm install
cp .env.example .env.local   # renseigner NEXT_PUBLIC_API_URL
npm run dev
```

L'application est disponible sur [http://localhost:3000](http://localhost:3000).

### Variables d'environnement

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | URL de base de l'API OrdiSpace (ex. `http://127.0.0.1:8000/api/v1` en local, `https://ordisapce.daymondboutique.com/api/v1` en production) |

Aucune clé secrète ne doit se trouver dans cette app : c'est un client public, tout appel sensible passe par l'API backend.

## Scripts

| Commande | Description |
| --- | --- |
| `npm run dev` | Serveur de développement (Turbopack) |
| `npm run build` | Build de production |
| `npm run start` | Sert le build de production |
| `npm run lint` | ESLint |

## Déploiement

Hébergée sur Vercel (`ordispace.client.daymondboutique.com`). Chaque push sur `master` déclenche un déploiement ; `NEXT_PUBLIC_API_URL` doit être configurée dans les variables d'environnement du projet Vercel pour pointer vers l'API de production.

Les images produits sont servies par le backend (`/storage/...`) : tout nouveau domaine d'API doit être ajouté à `images.remotePatterns` dans `next.config.ts`.
