---
title: Paramètres
---

La page **Paramètres** affiche vos paramètres Innovation Sandbox.

Vous ne pouvez pas modifier directement les paramètres en utilisant l'interface web. Pour les modifier, cette solution utilise [AWS AppConfig](https://docs.aws.amazon.com/appconfig/latest/userguide/what-is-appconfig.html) accessible via l'interface utilisateur. Pour plus d'informations, consultez la page [Gérer les paramètres](https://docs.aws.amazon.com/solutions/latest/innovation-sandbox-on-aws/administrator-guide.html#manage-settings) dans le guide utilisateur.

L'onglet **Paramètres Généraux** affiche les paramètres de mode maintenance, les Régions gérées par la solution, et les Conditions d'Utilisation.
Les Administrateurs peuvent activer le **Mode Maintenance** lorsqu'ils veulent déployer, modifier, supprimer, ou mettre à niveau la solution vers une version plus récente.

- Lorsque le mode Maintenance est activé, les gestionnaires et utilisateurs sandbox perdront temporairement l'accès à l'interface utilisateur, tandis que les Administrateurs peuvent toujours accéder à l'interface utilisateur.
- Après l'achèvement des tâches de maintenance/administratives de routine, les Administrateurs peuvent désactiver le mode Maintenance, pour permettre aux gestionnaires et utilisateurs sandbox de reprendre l'utilisation de l'interface utilisateur. Le paramètre par défaut est DÉSACTIVÉ pour le mode Maintenance.

L'onglet **Paramètres de Bail** affiche les valeurs maximales pour le budget, la durée du bail, et les baux par utilisateur. Les modèles de bail individuels créés par les gestionnaires ne peuvent pas avoir un budget ou une durée de bail qui dépasse les paramètres globaux. Par exemple, si l'Administrateur définit un paramètre global pour **Budget Max** à 500$, alors un modèle de bail créé par les gestionnaires ne peut pas avoir un budget supérieur à 500$.

L'onglet **Paramètres de Nettoyage** affiche les valeurs par défaut pour les processus de nettoyage, et les Administrateurs peuvent modifier ces paramètres de nettoyage en utilisant **AWS AppConfig**.
