# Carte Commandes

**Tout ce qui s'allume dans la maison, rangé par pièce, dans une seule carte Lovelace** : lampes, prises, interrupteurs, ventilateurs, volets.
Que la lampe soit une ampoule connectée, une lampe branchée sur une prise ou un spot derrière un module Shelly, elle se commande au même endroit.

Fusion de [Carte Prises](https://github.com/Marlboro62/prises-card) et [Carte Lumières](https://github.com/Marlboro62/lumieres-card) de
[Marlboro62](https://github.com/Marlboro62) (licence MIT), dont elle reprend le style (bleu nuit, clair, thème Home Assistant), les gestes et la mesure de consommation.

- **Lampes** : marche / arrêt d'un appui, luminosité, blanc chaud ↔ froid, couleurs.
- **Par pièce comme pour toute la carte** : puissance totale et **« Tout éteindre »**, validé d'un second appui (« Éteindre 3 ? »). Les appareils verrouillés ne sont jamais coupés.
- **Éditeur des pièces** : pour chaque pièce, toutes ses commandes avec une case à cocher et des flèches pour l'ordre ; ordre des pièces et pièces masquées.
- **Prises et appareils qui mesurent** : puissance, énergie (du jour si elle existe), tension, courant, barre du vert au rouge, puissance par pièce et totale. Une lampe sur une prise mesurée affiche aussi sa puissance.
- **Second appui pour valider** sur les prises et interrupteurs (pas de congélateur coupé par erreur), pas sur les lampes. **Verrouillage** possible.
- **Ventilateurs** (vitesse) et **volets** (monter, arrêter, descendre, position) ; scripts, boutons et scènes si vous les listez.
- **Filtre** Tout / Lumières / Prises / Autres en haut de la carte.
- **Deux affichages** : liste détaillée ou boutons. Éditeur visuel. Aucune dépendance.

**[▶ Essayer la démo en ligne](https://xdlog.github.io/commandes-card/docs/demo.html)** : une maison fictive, avec la liste de ce que la détection écarte, et pourquoi.

## Installation

### HACS (dépôt personnalisé)

**HACS › ⋮ › Dépôts personnalisés**, adresse du dépôt, type **Tableau de bord** (Dashboard). Téléchargez **Carte Commandes**, puis rechargez la page (Ctrl+F5).

### À la main

1. Copiez `commandes-card.js` dans `config/www/`.
2. **Paramètres › Tableaux de bord › ⋮ › Ressources** : `/local/commandes-card.js`, type **Module JavaScript**.

## Utilisation

```yaml
type: custom:commandes-card
```

| Geste | Effet |
| --- | --- |
| Appui sur l'icône ou l'interrupteur | Allumer ou éteindre (prise, interrupteur : « Allumer ? » / « Éteindre ? », 4 s pour valider) |
| Appui long | Fiche de Home Assistant |
| Clic sur le nom | Fiche ; pour une ampoule blanc / couleur : réglages de couleur |
| Clic sur la puissance | Fiche du capteur, avec son historique |
| Curseur | Luminosité, vitesse du ventilateur ou position du volet (envoyé au relâchement) |
| Clic sur une pièce | Replier ou déplier (mémorisé) |

## Choisir ce qui s'affiche

Quatre façons, de la plus simple à la plus fine :

1. **Rien** : la carte cherche seule (voir ci-dessous).
2. **L'éditeur visuel**, section **Pièces et appareils** : chaque pièce, avec une case pour l'afficher ou la masquer et ▲ ▼ pour son rang ; dépliée, toutes ses commandes (lampes, prises, interrupteurs, ventilateurs, volets), cochées si elles s'affichent, avec ▲ ▼ pour leur ordre. Une case en haut liste aussi les réglages, scripts, boutons et entités masquées. Une pièce que vous ne touchez pas garde la recherche automatique ; « Revenir à l'automatique » annule vos choix pour une pièce ou pour toutes.
3. **Une étiquette** : posez une étiquette (par exemple « Tableau ») sur les appareils ou les entités voulus, puis `labels: [tableau]`. Sur un appareil, seules ses commandes principales sont prises, pas ses réglages.
4. **Une liste** : `entities`, dans l'ordre voulu, avec des réglages par entité.

Avec `labels` ou `entities`, la recherche automatique est coupée : vous voyez exactement ce que vous avez choisi.

### La recherche automatique

Elle remplace celle de la carte Prises, qui prenait pour une prise tout interrupteur dont l'appareil mesurait une puissance (ports PoE, NAS, onduleurs, robots…) et manquait les prises sans « prise » dans le nom.

- **Types** cherchés : `light`, `switch`, `fan` (`domains` pour ajouter `cover`).
- **Écartés** : entités masquées ou de catégorie configuration / diagnostic ; **réglages exposés en interrupteurs** sans catégorie (sécurité enfant, voyant LED, comportement à la remise sous tension, protection de surcharge…, fréquent chez Tuya) ; **intégrations qui ne commandent rien dans la maison** (réseau : UniFi, Fritz!Box, Freebox… ; serveurs : Synology, Proxmox, AdGuard, Pi-hole… ; caméras ; voitures ; multimédia ; électroménager et robots) ; **services** (appareils logiciels) ; **appareils à plus de 6 commandes** qui ne sont pas des multiprises ; entités **sans pièce**, sauf les prises déclarées.
- **Groupes de lumières** : masqués si leurs lumières sont affichées (`groups: show` pour tout voir, `only` pour ne garder que les groupes).
- **Type** de chaque interrupteur : *lumière* si son nom ou son icône l'indique (lampe, plafonnier, spot, guirlande, applique…) ; *prise* s'il se déclare prise, si son nom ou le modèle de l'appareil l'indique (TS011F, Tapo P110, Shelly Plug…), ou s'il est la seule commande d'un appareil qui mesure sa puissance ; *interrupteur* sinon.
- **Mesures** : capteurs du même appareil. Pour un appareil à **plusieurs voies** (Shelly 2PM, multiprise), chaque voie prend le capteur dont l'identifiant lui ressemble le plus (`…_channel_1` ↔ `…_channel_1_power`). Un capteur commun à plusieurs voies est marqué ⁂ et **compté une seule fois** dans les totaux.

Si un appareil est pris à tort : `exclude`. S'il manque : `entities` ou une étiquette.

### Options

| Option | Rôle | Défaut |
| --- | --- | --- |
| `title`, `icon` | Titre et icône | `Maison`, `mdi:home-lightning-bolt-outline` |
| `labels` | Étiquettes : appareils et entités qui portent l'une d'elles | aucune |
| `entities` | Entités affichées, dans cet ordre | trouvées seules |
| `domains` | Types cherchés automatiquement | `light`, `switch`, `fan` |
| `rooms` | Ordre des pièces, pièces masquées et appareils de chaque pièce (écrit par l'éditeur, voir ci-dessous) | automatique |
| `areas` | Pièces affichées, dans cet ordre (ignoré pour l'ordre si `rooms` est réglé) | toutes |
| `exclude` | Entités à masquer | aucune |
| `locked` | Entités sans commande (mesures seulement) | aucune |
| `groups` | Groupes de lumières : `auto`, `show`, `only` | `auto` |
| `confirm` | Second appui : `auto` (prises et interrupteurs), `always`, `never` | `auto` |
| `layout` | `list` ou `buttons` | `list` |
| `sort` | `name`, `power` (la plus forte d'abord) ou `kind` (lampes, prises, interrupteurs…) | `name` |
| `show_filter` | Filtre Tout / Lumières / Prises / Autres | `true` |
| `show_off` | Afficher ce qui est éteint | `true` |
| `show_details` | Tension et courant | `true` |
| `show_header` | En-tête ; `false` : une ligne discrète | `true` |
| `show_scenes`, `scenes`, `max_scenes` | Boutons de scènes | `false`, toutes, `8` |
| `off_button` | « Tout éteindre » de la carte et des pièces : `all`, `lights` (lumières seulement) ou `none` | `all` |
| `max_power` | Puissance du rouge, en W | `2500` |
| `theme` | `v2` (bleu nuit), `auto`, `ha` | `v2` |
| `language` | `auto`, `fr`, `en` | `auto` |

Réglages par entité dans `entities` : `entity`, `name`, `icon`, `kind` (`light`, `plug`, `switch`, `fan`, `cover`, `other`), `power`, `energy`, `voltage`, `current`, `locked`, `confirm`, `max_power`.

```yaml
type: custom:commandes-card
title: Cuisine
areas: [cuisine]
entities:
  - light.plafonnier_cuisine
  - entity: switch.shelly_2pm_channel_2
    name: Spots plan de travail
    kind: light
  - entity: switch.congelateur
    locked: true
  - entity: switch.four
    max_power: 3500
sort: kind
```

### `rooms`

L'éditeur l'écrit pour vous ; à la main :

```yaml
rooms:
  - area: salon            # premier
    entities:              # exactement ceux-ci, dans cet ordre
      - light.plafonnier_salon
      - light.lampe_chevet
      - entity: switch.prise_tv
        locked: true
  - area: cuisine          # deuxième, contenu automatique
  - area: garage
    show: false            # masquée
  - area: _none            # appareils sans pièce
```

Les pièces absentes de la liste suivent, dans l'ordre des étages puis des noms. Une pièce sans `entities` garde la recherche automatique ; avec `entities`, un nouvel appareil n'y apparaît qu'une fois coché.

## Historique des versions

### 0.2.0

- ✨ Éditeur des pièces : commandes de chaque pièce à cocher et à ordonner, ordre des pièces, pièces masquées (option `rooms`).
- ✨ Puissance totale et « Tout éteindre » dans l'en-tête de chaque pièce, comme dans celui de la carte, avec un second appui pour valider (`off_button`).
- 🔄 « Tout éteindre » coupe tout ce qui est allumé (sauf les appareils verrouillés), plus seulement les lumières ; `off_button: lights` pour l'ancien comportement.

### 0.1.0

- ✨ Première version.

## Crédits et licence

MIT. Style, gestes et code d'origine : [Marlboro62](https://github.com/Marlboro62) ([prises-card](https://github.com/Marlboro62/prises-card),
[lumieres-card](https://github.com/Marlboro62/lumieres-card)). Si ces cartes vous plaisent, soutenez son travail.
