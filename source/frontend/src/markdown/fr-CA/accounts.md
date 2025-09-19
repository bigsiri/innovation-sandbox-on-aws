---
title: Comptes
---

La page **Comptes** affiche tous les comptes actuellement dans le pool de comptes, quel que soit leur statut.

---

**Gestion des comptes**

Si le flux de travail de nettoyage du compte échoue, la solution déplacera le compte vers un état de **Quarantaine**. Les comptes en statut Quarantaine peuvent avoir des ressources AWS actives qui génèrent encore des coûts. Nous recommandons d'examiner ces comptes dès que possible et de résoudre manuellement tous les problèmes avant de tenter de relancer le processus de nettoyage. Consultez la section [Enquête sur les comptes en état de quarantaine](https://docs.aws.amazon.com/solutions/latest/innovation-sandbox-on-aws/troubleshooting.html#investigating-accounts).

Les comptes en statut **Gelé** pourraient avoir des ressources AWS actives qui génèrent encore des coûts. Comme prochaine étape, vous pouvez soit :

- Éjecter le compte de la structure OU sandbox si vous voulez préserver les ressources AWS, ou
- Nettoyer les ressources dans le compte et le réutiliser pour des expériences sandbox.

Si aucune action manuelle n'est prise, la solution nettoiera automatiquement et recyclera le compte pour réutilisation après que les seuils finaux de budget/durée soient dépassés.

Consultez la section [Gestion des comptes existants](https://docs.aws.amazon.com/solutions/latest/innovation-sandbox-on-aws/administrator-guide.html#manage-accounts).

Lorsqu'une action de nettoyage est initiée, la solution effectuera plusieurs tentatives de nettoyage et mettra à jour le statut.

- Lors d'un nettoyage réussi des ressources AWS dans un compte, la solution déplacera le compte vers le pool de comptes disponibles pour utilisation sandbox.
- Si le flux de travail de nettoyage du compte échoue, la solution déplacera le compte vers **Quarantaine** et enverra un courriel à l'administrateur. Vous devrez nettoyer manuellement les ressources restantes et initier l'action _Réessayer le nettoyage_.
- Si le flux de travail échoue à déplacer le compte vers le statut **Disponible** ou **Quarantaine** dans les 24 heures, le statut **Nettoyage** s'affiche en rouge, et vous devrez effectuer manuellement l'action **Réessayer le nettoyage**.
