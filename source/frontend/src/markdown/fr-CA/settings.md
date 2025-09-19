---
title: Paramètres
---

La page **Paramètres** affiche vos paramètres Innovation Sandbox.

Vous ne pouvez pas modifier directement les paramètres en utilisant l'interface web. Pour les modifier, cette solution utilise [AWS AppConfig](https://docs.aws.amazon.com/appconfig/latest/userguide/what-is-appconfig.html) accessible via l'interface utilisateur. Pour plus d'informations, consultez la page [Gérer les paramètres](https://docs.aws.amazon.com/solutions/latest/innovation-sandbox-on-aws/administrator-guide.html#manage-settings) dans le guide utilisateur.

L'onglet **Paramètres généraux** affiche les paramètres du mode maintenance, les régions gérées par la solution et les conditions d'utilisation.
Les administrateurs peuvent activer le **Mode maintenance** lorsqu'ils veulent déployer, modifier, supprimer ou mettre à niveau la solution vers une version plus récente.

- Lorsque le mode maintenance est ACTIVÉ, les gestionnaires et utilisateurs sandbox perdront temporairement l'accès à l'interface utilisateur, tandis que les administrateurs peuvent toujours accéder à l'interface utilisateur.
- Après l'achèvement des tâches de maintenance/administratives de routine, les administrateurs peuvent désactiver le mode maintenance pour permettre aux gestionnaires et utilisateurs sandbox de reprendre l'utilisation de l'interface utilisateur. Le paramètre par défaut est DÉSACTIVÉ pour le mode maintenance.

L'onglet **Paramètres de bail** affiche les valeurs maximales pour le budget, la durée du bail et les baux par utilisateur. Les modèles de bail individuels créés par les gestionnaires ne peuvent pas avoir un budget ou une durée de bail qui dépasse les paramètres globaux. Par exemple, si l'administrateur définit un paramètre global pour **Budget maximum** à 500 $, alors un modèle de bail créé par les gestionnaires ne peut pas avoir un budget supérieur à 500 $.

L'onglet **Paramètres de nettoyage** affiche les valeurs par défaut pour les processus de nettoyage, et les administrateurs peuvent modifier ces paramètres de nettoyage en utilisant **AWS AppConfig**.
