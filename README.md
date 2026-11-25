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
- **Ouvertures** (portail, porte de garage, portillon…) : un capteur d'ouverture associé à la commande la colore en **rouge si ouvert, vert si fermé, jaune si le capteur ne répond pas** ; bouton « Ouvrir » / « Fermer » avec second appui.
- **Modes de la maison** (présence, absence, vacances, nuit…) : un bandeau sous l'en-tête, l'état en clair depuis quand, et un sélecteur à deux positions « À la maison | Absent ».
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
| `modes` | Modes de la maison, dans un bandeau (voir ci-dessous) | aucun |
| `contacts` | Capteur d'ouverture de chaque commande (voir ci-dessous) | automatique |
| `off_button` | « Tout éteindre » de la carte et des pièces : `all`, `lights` (lumières seulement) ou `none` | `all` |
| `max_power` | Puissance du rouge, en W | `2500` |
| `theme` | `v2` (bleu nuit), `auto`, `ha` | `v2` |
| `language` | `auto`, `fr`, `en` | `auto` |

Réglages par entité dans `entities` : `entity`, `name`, `icon`, `kind` (`light`, `plug`, `switch`, `fan`, `cover`, `other`), `power`, `energy`, `voltage`, `current`, `locked`, `confirm`, `max_power`, `contact`, `invert`.

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

### Ouvertures et capteurs d'ouverture

Une commande qui ouvre quelque chose (porte de garage en `cover`, relais à impulsion du portail en `switch`, `button` ou `script`) prend l'état d'un capteur d'ouverture (`binary_sensor` de classe porte, garage, ouverture ou fenêtre) :

| Capteur | Couleur | Texte | Commande |
| --- | --- | --- | --- |
| ouvert | rouge | Ouvert | « Fermer » puis « Fermer ? » |
| fermé | vert | Fermé | « Ouvrir » puis « Ouvrir ? » |
| indisponible, inconnu | jaune | État inconnu | « Actionner » puis « Actionner ? » |

L'en-tête de la carte compte les ouvertures ouvertes (« 1 ouverture ouverte »).

- **Automatique** : un volet, ou une commande dont le nom évoque une ouverture (portail, porte, garage, portillon…), prend le capteur d'ouverture **de son propre appareil** s'il en a un (porte de garage Meross, Shelly avec entrée de contact…).
- **Dans l'éditeur** : pièce dépliée, icône 🔗 d'une commande, puis le capteur. Les capteurs du même appareil et de la même pièce viennent en premier ; « Aucun » coupe l'association automatique ; « Inversé » pour un capteur à « off » quand c'est ouvert.
- **En YAML** :

```yaml
contacts:
  switch.portail: binary_sensor.capteur_portail
  switch.portillon:
    sensor: binary_sensor.portillon_contact
    invert: true
  cover.volet_salon: false       # pas de capteur, même automatique
```

### Modes de la maison

Un `input_boolean` (ou un `switch`) qui décrit l'état de la maison plutôt qu'un appareil, comme un indicateur de présence qui passe à « absent » quand vous partez, mais que vous pouvez aussi basculer vous-même.

- Il s'affiche dans un **bandeau sous l'en-tête**, pas dans une pièce : son nom, son état en clair et en couleur, **depuis quand** (« depuis 14:32 », « depuis mar. 18:05 », « depuis 3 j »), et un **sélecteur à deux positions**. Un appui sur l'autre position bascule ; un appui sur le nom ouvre la fiche et son historique.
- **Libellés, icônes et couleurs déduits du nom** : absence → « À la maison » (vert) / « Absent » (orange) ; présence → l'inverse ; vacances → « À la maison » / « En vacances » ; nuit → « Jour » / « Nuit » ; sinon « Désactivé » / « Activé ».
- **Dans l'éditeur**, section *Modes de la maison* : ajouter, retirer, ordonner, nom, libellé et couleur de chaque position, second appui pour valider.

```yaml
modes:
  - input_boolean.absence                # tout automatique
  - entity: input_boolean.mode_vacances
    name: Vacances
    confirm: true                        # « Confirmer ? » avant de basculer
    off: { label: À la maison, icon: mdi:home-account, color: green }
    on: { label: En vacances, icon: mdi:palm-tree, color: orange }
```

Couleurs : `green`, `orange`, `red`, `blue`, `yellow`, `purple`, `grey`, ou toute couleur CSS.

## Historique des versions

### 0.4.0

- ✨ Modes de la maison (`modes`, éditeur) : bandeau avec état en clair, durée et sélecteur à deux positions ; libellés et couleurs déduits du nom ou réglés.
- 🐛 Ouverture dont le capteur ne répond pas : le bouton « Actionner » était vide.

### 0.3.0

- ✨ Capteurs d'ouverture associés aux commandes (`contacts`, éditeur 🔗) : rouge ouvert, vert fermé, jaune inconnu ; association automatique avec le capteur du même appareil.
- ✨ Ouvertures : bouton « Ouvrir » / « Fermer » et second appui de confirmation, icône portail, garage ou porte selon l'état, compte des ouvertures ouvertes dans l'en-tête.

### 0.2.0

- ✨ Éditeur des pièces : commandes de chaque pièce à cocher et à ordonner, ordre des pièces, pièces masquées (option `rooms`).
- ✨ Puissance totale et « Tout éteindre » dans l'en-tête de chaque pièce, comme dans celui de la carte, avec un second appui pour valider (`off_button`).
- 🔄 « Tout éteindre » coupe tout ce qui est allumé (sauf les appareils verrouillés), plus seulement les lumières ; `off_button: lights` pour l'ancien comportement.

### 0.1.0

- ✨ Première version.

## Crédits et licence

MIT. Style, gestes et code d'origine : [Marlboro62](https://github.com/Marlboro62) ([prises-card](https://github.com/Marlboro62/prises-card),
[lumieres-card](https://github.com/Marlboro62/lumieres-card)). Si ces cartes vous plaisent, soutenez son travail.
