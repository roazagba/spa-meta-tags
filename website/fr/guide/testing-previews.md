# Tester les aperçus de liens

## 1. Regarder le HTML

Le test le plus rapide : demander une page avec le user agent d'un robot et regarder les balises.

```bash
curl -s -A "facebookexternalhit/1.1" http://localhost:3000/my-page | grep -E "<title>|og:|twitter:"
```

Vérifiez que :

- le titre, la description et l'image correspondent à la page ;
- il n'y a qu'un seul `<title>` ;
- `og:url` et `og:image` sont des URL complètes.

Vous pouvez aussi ouvrir `view-source:http://localhost:3000/my-page` dans le navigateur. N'utilisez pas les outils de développement ("Inspecter") : ils montrent la page après l'exécution du JavaScript, pas ce que voient les robots.

## 2. Utiliser les débogueurs des plateformes

La page et son image doivent être accessibles depuis Internet.

| Plateforme | Outil |
|---|---|
| Facebook, Messenger, WhatsApp, Instagram | [Débogueur de partage](https://developers.facebook.com/tools/debug/) |
| LinkedIn | [Post Inspector](https://www.linkedin.com/post-inspector/) |
| Toutes les plateformes, aperçu seulement | [opengraph.xyz](https://www.opengraph.xyz/) |
| Résultats enrichis Google (JSON-LD) | [Test des résultats enrichis](https://search.google.com/test/rich-results) |

Sur le débogueur de Facebook, cliquez sur **Re-collecter** après chaque modification : Facebook garde le résultat précédent en cache.

WhatsApp utilise le même robot que Facebook. Il garde aussi les aperçus en cache : pendant les tests, ajoutez un paramètre au lien (`?v=2`) pour obtenir un nouvel aperçu.

## 3. Tester depuis votre machine avec un tunnel

Pour tester avant de déployer, exposez votre serveur local avec un tunnel :

- [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/do-more-with-tunnels/trycloudflare/) (gratuit, sans compte) : `cloudflared tunnel --url http://localhost:3000`
- [ngrok](https://ngrok.com/) : `ngrok http 3000`

À savoir :

- **Les images doivent aussi être publiques.** Si vos images sont servies par une API locale, exposez-la avec un second tunnel et utilisez son adresse pour les images.
- **Les applications multi-clients** qui trouvent le client grâce au sous-domaine verront le domaine du tunnel (`abc123.ngrok-free.app`). Associez-le à un client de test dans vos données pendant les tests.
- **Les domaines ngrok gratuits** affichent une page d'avertissement aux navigateurs. Les robots ne sont pas concernés, mais votre application peut échouer à appeler depuis le navigateur une API exposée par ngrok. Envoyez l'en-tête `ngrok-skip-browser-warning` dans vos appels d'API pendant les tests.
- **Vite en mode middleware** bloque les domaines inconnus : voir [Développement avec Vite](./vite-dev#opening-the-dev-server-through-a-tunnel).
