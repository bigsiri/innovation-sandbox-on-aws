// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AccountCleanupFailureEvent } from "@amzn/innovation-sandbox-commons/events/account-cleanup-failure-event.js";
import { AccountDriftDetectedAlert } from "@amzn/innovation-sandbox-commons/events/account-drift-detected-alert.js";
import { LeaseApprovedEvent } from "@amzn/innovation-sandbox-commons/events/lease-approved-event.js";
import { LeaseBudgetThresholdBreachedAlert } from "@amzn/innovation-sandbox-commons/events/lease-budget-threshold-breached-alert.js";
import { LeaseDeniedEvent } from "@amzn/innovation-sandbox-commons/events/lease-denied-event.js";
import { LeaseDurationThresholdBreachedAlert } from "@amzn/innovation-sandbox-commons/events/lease-duration-threshold-breached-alert.js";
import { LeaseFrozenEvent } from "@amzn/innovation-sandbox-commons/events/lease-frozen-event.js";
import { LeaseOwnerReassignedEvent } from "@amzn/innovation-sandbox-commons/events/lease-owner-reassigned-event.js";
import { LeaseRequestedEvent } from "@amzn/innovation-sandbox-commons/events/lease-requested-event.js";
import { LeaseTerminatedEvent } from "@amzn/innovation-sandbox-commons/events/lease-terminated-event.js";
import { UserAddedToLeaseEvent } from "@amzn/innovation-sandbox-commons/events/user-added-to-lease-event.js";
import { UserRemovedFromLeaseEvent } from "@amzn/innovation-sandbox-commons/events/user-removed-from-lease-event.js";
import { SynthesizedEmail } from "@amzn/innovation-sandbox-commons/isb-services/notification/email-service.js";

// either to or bcc, but not both
// no need to support that
// the retry logic will be complex if we support that
export type EmailDestination =
  | {
      to: string[];
      bcc?: never;
    }
  | {
      to?: never;
      bcc: string[];
    };

export type EmailTemplatesContext = {
  webAppUrl: string;
  destination: EmailDestination;
  language?: 'en' | 'fr-CA';
};

export namespace EmailTemplates {
  export function LeaseRequested(
    event: LeaseRequestedEvent,
    context: EmailTemplatesContext,
  ): SynthesizedEmail {
    const language = context.language || 'en';
    
    const templates = {
      en: {
        subject: "[Action Needed] Innovation Sandbox: New Lease Approval Request",
        htmlBody: `
    <h1>Request to approve or deny lease from ${event.Detail.userEmail} </h1>
    <p> A new lease has been requested by sandbox user ${event.Detail.userEmail}.
    Please log into the Innovation Sandbox web application ${context.webAppUrl} to approve or deny the lease request.</p>
    `,
        textBody: `
      Request to approve or deny lease from ${event.Detail.userEmail}
      A new lease has been requested by sandbox user ${event.Detail.userEmail}.
      Please log into the Innovation Sandbox on AWS web application ${context.webAppUrl} to approve or deny the lease request.
    `
      },
      'fr-CA': {
        subject: "[Action requise] Innovation Sandbox : Nouvelle demande d'approbation de bail",
        htmlBody: `
    <h1>Demande d'approbation ou de refus de bail de ${event.Detail.userEmail}</h1>
    <p>Un nouveau bail a été demandé par l'utilisateur ${event.Detail.userEmail}.
    Veuillez vous connecter à l'application web Innovation Sandbox ${context.webAppUrl} pour approuver ou refuser la demande de bail.</p>
    `,
        textBody: `
      Demande d'approbation ou de refus de bail de ${event.Detail.userEmail}
      Un nouveau bail a été demandé par l'utilisateur ${event.Detail.userEmail}.
      Veuillez vous connecter à l'application web Innovation Sandbox sur AWS ${context.webAppUrl} pour approuver ou refuser la demande de bail.
    `
      }
    };

    return {
      bcc: context.destination.bcc!,
      ...templates[language],
    };
  }

  export function LeaseApproved(
    event: LeaseApprovedEvent,
    context: EmailTemplatesContext,
  ): SynthesizedEmail {
    const language = context.language || 'en';
    
    const templates = {
      en: {
        subject: "[Informational] Innovation Sandbox: Lease Request Approved",
        htmlBody: `
      <h1>Welcome to Innovation Sandbox on AWS (ISB) ${event.Detail.userEmail}!</h1>
      <p>Your sandbox lease request ${event.Detail.leaseId} has been ${event.Detail.approvedBy === "AUTO_APPROVED" ? "auto approved" : "approved by " + event.Detail.approvedBy}.
      Please log into the Innovation Sandbox web application ${context.webAppUrl} to access your sandbox account.</p>
    `,
        textBody: `
      Welcome to Innovation Sandbox on AWS ${event.Detail.userEmail}!
      Your sandbox lease request ${event.Detail.leaseId} has been ${event.Detail.approvedBy === "AUTO_APPROVED" ? "auto approved" : "approved by " + event.Detail.approvedBy}.
      Please log into the Innovation Sandbox web application ${context.webAppUrl} to access your sandbox account.
    `
      },
      'fr-CA': {
        subject: "[Informatif] Innovation Sandbox : Demande de bail approuvée",
        htmlBody: `
      <h1>Bienvenue dans le Innovation Sandbox sur AWS (ISB) ${event.Detail.userEmail}!</h1>
      <p>Votre demande de bail ${event.Detail.leaseId} a été ${event.Detail.approvedBy === "AUTO_APPROVED" ? "approuvée automatiquement" : "approuvée par " + event.Detail.approvedBy}.
      Veuillez vous connecter à l'application web Innovation Sandbox ${context.webAppUrl} pour accéder à votre compte bac à sable.</p>
    `,
        textBody: `
      Bienvenue dans le Innovation Sandbox sur AWS ${event.Detail.userEmail}!
      Votre demande de bail ${event.Detail.leaseId} a été ${event.Detail.approvedBy === "AUTO_APPROVED" ? "approuvée automatiquement" : "approuvée par " + event.Detail.approvedBy}.
      Veuillez vous connecter à l'application web Innovation Sandbox ${context.webAppUrl} pour accéder à votre compte bac à sable.
    `
      }
    };

    return {
      to: context.destination.to!,
      ...templates[language],
    };
  }

  export function LeaseDenied(
    event: LeaseDeniedEvent,
    context: EmailTemplatesContext,
  ): SynthesizedEmail {
    const language = context.language || 'en';
    
    const templates = {
      en: {
        subject: "[Informational] Innovation Sandbox: Lease Request Denied",
        htmlBody: `
      <p>Your sandbox lease request ${event.Detail.leaseId} has been denied by ${event.Detail.deniedBy}.
      Please contact your Innovation Sandbox administrator / manager for more details. Thank you! </p>
    `,
        textBody: `
       Your sandbox lease request ${event.Detail.leaseId} has been denied by ${event.Detail.deniedBy}.
       Please contact your Innovation Sandbox administrator / manager for more details. Thank you!
    `
      },
      'fr-CA': {
        subject: "[Informatif] Innovation Sandbox : Demande de bail refusée",
        htmlBody: `
      <p>Votre demande de bail ${event.Detail.leaseId} a été refusée par ${event.Detail.deniedBy}.
      Veuillez contacter votre administrateur / gestionnaire du Innovation Sandbox pour plus de détails. Merci!</p>
    `,
        textBody: `
       Votre demande de bail ${event.Detail.leaseId} a été refusée par ${event.Detail.deniedBy}.
       Veuillez contacter votre administrateur / gestionnaire du Innovation Sandbox pour plus de détails. Merci!
    `
      }
    };

    return {
      to: context.destination.to!,
      ...templates[language],
    };
  }

  export function LeaseBudgetAlert(
    event: LeaseBudgetThresholdBreachedAlert,
    context: EmailTemplatesContext,
  ): SynthesizedEmail {
    const language = context.language || 'en';
    
    const templates = {
      en: {
        subject: "[Action may be needed] Innovation Sandbox: Budget Threshold Alert",
        htmlBody: `
      <p> The usage cost for your account id: ${event.Detail.accountId} under lease id: ${event.Detail.leaseId.uuid} has reached the budget threshold of
      USD ${event.Detail.budgetThresholdTriggered} against the assigned budget of USD ${event.Detail.budget}. Please review the AWS
      resources running in your account and operate within the prescribed budget limit to avoid freeze or clean-up
      actions on your account.</p>
    `,
        textBody: `
      The usage cost for your account id: ${event.Detail.accountId} under lease id: ${event.Detail.leaseId.uuid} has reached the budget threshold of
      USD ${event.Detail.budgetThresholdTriggered} against the assigned budget of USD ${event.Detail.budget}. Please review the AWS
      resources running in your account and operate within the prescribed budget limit to avoid freeze or clean-up
      actions on your account.
    `
      },
      'fr-CA': {
        subject: "[Action peut être nécessaire] Innovation Sandbox : Alerte de seuil budgétaire",
        htmlBody: `
      <p>Le coût d'utilisation de votre compte ${event.Detail.accountId} sous le bail ${event.Detail.leaseId.uuid} a atteint le seuil budgétaire de
      ${event.Detail.budgetThresholdTriggered} USD contre le budget assigné de ${event.Detail.budget} USD. Veuillez réviser les ressources AWS
      en cours d'exécution dans votre compte et opérer dans la limite budgétaire prescrite pour éviter le gel ou les actions de nettoyage
      sur votre compte.</p>
    `,
        textBody: `
      Le coût d'utilisation de votre compte ${event.Detail.accountId} sous le bail ${event.Detail.leaseId.uuid} a atteint le seuil budgétaire de
      ${event.Detail.budgetThresholdTriggered} USD contre le budget assigné de ${event.Detail.budget} USD. Veuillez réviser les ressources AWS
      en cours d'exécution dans votre compte et opérer dans la limite budgétaire prescrite pour éviter le gel ou les actions de nettoyage
      sur votre compte.
    `
      }
    };

    return {
      to: context.destination.to!,
      ...templates[language],
    };
  }

  export function LeaseDurationThresholdAlert(
    event: LeaseDurationThresholdBreachedAlert,
    context: EmailTemplatesContext,
  ): SynthesizedEmail {
    const language = context.language || 'en';
    
    const templates = {
      en: {
        subject: "[Informational] Innovation Sandbox: Lease Threshold Alert",
        htmlBody: `
      <p> Your lease id: ${event.Detail.leaseId.uuid} for account id: ${event.Detail.accountId} usage has reached the lease duration threshold
      of ${event.Detail.leaseDurationInHours - event.Detail.triggeredDurationThreshold} hour(s) against the assigned lease duration ${event.Detail.leaseDurationInHours} hour(s).
      Please ensure you complete all tasks before your sandbox account access expires. </p>
    `,
        textBody: `
      Your lease id: ${event.Detail.leaseId.uuid} for account id: ${event.Detail.accountId} usage has reached the lease duration threshold
      of ${event.Detail.leaseDurationInHours - event.Detail.triggeredDurationThreshold} hour(s) against the assigned lease duration ${event.Detail.leaseDurationInHours} hour(s).
      Please ensure you complete all tasks before your sandbox account access expires.
    `
      },
      'fr-CA': {
        subject: "[Informatif] Innovation Sandbox : Alerte de seuil de bail",
        htmlBody: `
      <p>Votre bail ${event.Detail.leaseId.uuid} pour le compte ${event.Detail.accountId} a atteint le seuil de durée de bail
      de ${event.Detail.leaseDurationInHours - event.Detail.triggeredDurationThreshold} heure(s) contre la durée de bail assignée de ${event.Detail.leaseDurationInHours} heure(s).
      Veuillez vous assurer de terminer toutes les tâches avant l'expiration de l'accès à votre compte bac à sable.</p>
    `,
        textBody: `
      Votre bail ${event.Detail.leaseId.uuid} pour le compte ${event.Detail.accountId} a atteint le seuil de durée de bail
      de ${event.Detail.leaseDurationInHours - event.Detail.triggeredDurationThreshold} heure(s) contre la durée de bail assignée de ${event.Detail.leaseDurationInHours} heure(s).
      Veuillez vous assurer de terminer toutes les tâches avant l'expiration de l'accès à votre compte bac à sable.
    `
      }
    };

    return {
      to: context.destination.to!,
      ...templates[language],
    };
  }

  export function AccountCleanupFailure(
    event: AccountCleanupFailureEvent,
    context: EmailTemplatesContext,
  ): SynthesizedEmail {
    const language = context.language || 'en';
    
    const templates = {
      en: {
        subject: "[Action Required] Innovation Sandbox: Account Clean-up Failure",
        htmlBody: `
      <p> The resource clean-up process for account id: ${event.Detail.accountId} failed since some resources could not be
      deleted automatically. Please review the account to clean-up the remaining resources manually and
      use the Innovation Sandbox web application to re-initiate the clean-up action.
    `,
        textBody: `
      The resource clean-up process for account id: ${event.Detail.accountId} failed since some resources could not be
      deleted automatically. Please review the account to clean-up the remaining resources manually and
      use the Innovation Sandbox web application to re-initiate the clean-up action.
    `
      },
      'fr-CA': {
        subject: "[Action requise] Innovation Sandbox : Échec du nettoyage de compte",
        htmlBody: `
      <p>Le processus de nettoyage des ressources pour le compte ${event.Detail.accountId} a échoué car certaines ressources n'ont pas pu être
      supprimées automatiquement. Veuillez réviser le compte pour nettoyer manuellement les ressources restantes et
      utiliser l'application web Innovation Sandbox pour relancer l'action de nettoyage.</p>
    `,
        textBody: `
      Le processus de nettoyage des ressources pour le compte ${event.Detail.accountId} a échoué car certaines ressources n'ont pas pu être
      supprimées automatiquement. Veuillez réviser le compte pour nettoyer manuellement les ressources restantes et
      utiliser l'application web Innovation Sandbox pour relancer l'action de nettoyage.
    `
      }
    };

    return {
      bcc: context.destination.bcc!,
      ...templates[language],
    };
  }

  export function AccountDrift(
    event: AccountDriftDetectedAlert,
    context: EmailTemplatesContext,
  ): SynthesizedEmail {
    const language = context.language || 'en';
    
    const templates = {
      en: {
        subject: "[Action Required] Innovation Sandbox: Account Drift",
        htmlBody: event.Detail.expectedOu
          ? `<p> The account id: ${event.Detail.accountId} was expected to be in ${event.Detail.expectedOu} OU, but it was found in ${event.Detail.actualOu}.
       The account has been moved to the quarantine OU by the system.</p>
      `
          : `<p> Untracked account id: ${event.Detail.accountId}  was found in ${event.Detail.actualOu}.
       The account has been moved to the quarantine OU by the system.</p>
      `,
        textBody: event.Detail.expectedOu
          ? `
      The account id: ${event.Detail.accountId} was expected to be in ${event.Detail.expectedOu} OU, but it was found in ${event.Detail.actualOu}.
      The account has been moved to the quarantine OU by the system.
    `
          : `
      Untracked account id: ${event.Detail.accountId}  was found in ${event.Detail.actualOu}.
       The account has been moved to the quarantine OU by the system
      `
      },
      'fr-CA': {
        subject: "[Action requise] Innovation Sandbox : Dérive de compte",
        htmlBody: event.Detail.expectedOu
          ? `<p>Le compte ${event.Detail.accountId} était attendu dans l'OU ${event.Detail.expectedOu}, mais il a été trouvé dans ${event.Detail.actualOu}.
       Le compte a été déplacé vers l'OU de quarantaine par le système.</p>
      `
          : `<p>Le compte non suivi ${event.Detail.accountId} a été trouvé dans ${event.Detail.actualOu}.
       Le compte a été déplacé vers l'OU de quarantaine par le système.</p>
      `,
        textBody: event.Detail.expectedOu
          ? `
      Le compte ${event.Detail.accountId} était attendu dans l'OU ${event.Detail.expectedOu}, mais il a été trouvé dans ${event.Detail.actualOu}.
      Le compte a été déplacé vers l'OU de quarantaine par le système.
    `
          : `
      Le compte non suivi ${event.Detail.accountId} a été trouvé dans ${event.Detail.actualOu}.
       Le compte a été déplacé vers l'OU de quarantaine par le système
      `
      }
    };

    return {
      bcc: context.destination.bcc!,
      ...templates[language],
    };
  }

  export namespace LeaseTerminated {
    export function byBudgetUser(
      event: LeaseTerminatedEvent<"BudgetExceeded">,
      context: EmailTemplatesContext,
    ): SynthesizedEmail {
      const language = context.language || 'en';
      
      const templates = {
        en: {
          subject: "[Informational] Innovation Sandbox: Account Clean-up Action based on Allowed Budget",
          htmlBody: `
      <p> The resource clean-up process has been initiated for lease id: ${event.Detail.leaseId.uuid} on account id: ${event.Detail.accountId}
      since usage cost has reached or exceeded the assigned budget of USD ${event.Detail.reason.budget}. You will no longer be able
      to access your account. Please contact your Innovation Sandbox administrator / manager for assistance. </p>`,
          textBody: `
        The resource clean-up process has been initiated for lease id: ${event.Detail.leaseId.uuid} on account id: ${event.Detail.accountId} since
        usage cost has reached or exceeded the assigned budget of USD ${event.Detail.reason.budget}. You will no longer be able
        to access your account. Please contact your Innovation Sandbox administrator / manager for assistance.
      `
        },
        'fr-CA': {
          subject: "[Informatif] Innovation Sandbox : Action de nettoyage de compte basée sur le budget autorisé",
          htmlBody: `
      <p>Le processus de nettoyage des ressources a été initié pour le bail ${event.Detail.leaseId.uuid} sur le compte ${event.Detail.accountId}
      car le coût d'utilisation a atteint ou dépassé le budget assigné de ${event.Detail.reason.budget} USD. Vous ne pourrez plus
      accéder à votre compte. Veuillez contacter votre administrateur / gestionnaire du Innovation Sandbox pour assistance.</p>`,
          textBody: `
        Le processus de nettoyage des ressources a été initié pour le bail ${event.Detail.leaseId.uuid} sur le compte ${event.Detail.accountId} car
        le coût d'utilisation a atteint ou dépassé le budget assigné de ${event.Detail.reason.budget} USD. Vous ne pourrez plus
        accéder à votre compte. Veuillez contacter votre administrateur / gestionnaire du Innovation Sandbox pour assistance.
      `
        }
      };

      return {
        to: context.destination.to!,
        ...templates[language],
      };
    }

    export function byBudgetAdminManager(
      event: LeaseTerminatedEvent<"BudgetExceeded">,
      context: EmailTemplatesContext,
    ): SynthesizedEmail {
      const language = context.language || 'en';
      
      const templates = {
        en: {
          subject: "[Informational] Innovation Sandbox: Account Clean-up Action based on Allowed Budget",
          htmlBody: `
        <p> The resource clean-up process has been initiated for account id: ${event.Detail.accountId} under lease id: ${event.Detail.leaseId.uuid}
        since usage cost has reached or exceeded the assigned budget of USD ${event.Detail.reason.budget}. Upon successful clean-up,
        the account will be moved under 'Available' OU. You will be notified if any manual intervention is
        required to complete the resource clean-up process. </p>
      `,
          textBody: `
        The resource clean-up process has been initiated for account id: ${event.Detail.accountId} under lease id: ${event.Detail.leaseId.uuid}
        since usage cost has reached the assigned budget of USD ${event.Detail.reason.budget}. Upon successful clean-up,
        the account will be moved under 'Available' OU. You will be notified if any manual intervention is
        required to complete the resource clean-up process.
      `
        },
        'fr-CA': {
          subject: "[Informatif] Innovation Sandbox : Action de nettoyage de compte basée sur le budget autorisé",
          htmlBody: `
        <p>Le processus de nettoyage des ressources a été initié pour le compte ${event.Detail.accountId} sous le bail ${event.Detail.leaseId.uuid}
        car le coût d'utilisation a atteint ou dépassé le budget assigné de ${event.Detail.reason.budget} USD. Après un nettoyage réussi,
        le compte sera déplacé sous l'OU 'Disponible'. Vous serez notifié si une intervention manuelle est
        requise pour compléter le processus de nettoyage des ressources.</p>
      `,
          textBody: `
        Le processus de nettoyage des ressources a été initié pour le compte ${event.Detail.accountId} sous le bail ${event.Detail.leaseId.uuid}
        car le coût d'utilisation a atteint le budget assigné de ${event.Detail.reason.budget} USD. Après un nettoyage réussi,
        le compte sera déplacé sous l'OU 'Disponible'. Vous serez notifié si une intervention manuelle est
        requise pour compléter le processus de nettoyage des ressources.
      `
        }
      };

      return {
        bcc: context.destination.bcc!,
        ...templates[language],
      };
    }

    export function byDurationUser(
      event: LeaseTerminatedEvent<"Expired">,
      context: EmailTemplatesContext,
    ): SynthesizedEmail {
      const language = context.language || 'en';
      
      const templates = {
        en: {
          subject: "[Informational] Innovation Sandbox: Account Clean-up Action based on Lease Duration",
          htmlBody: `
          <p> The resource clean-up process has been initiated for account id: ${event.Detail.accountId} under lease id: ${event.Detail.leaseId.uuid}
          since the lease has reached the maximum lease duration ${event.Detail.reason.leaseDurationInHours} hour(s). You will no longer
          be able to access your account. Please contact your Innovation Sandbox administrator / manager for assistance. </p>
        `,
          textBody: `
        The resource clean-up process has been initiated for lease  for account id: ${event.Detail.accountId} under lease id: ${event.Detail.leaseId.uuid}
        since the lease has reached the maximum lease duration ${event.Detail.reason.leaseDurationInHours} hour(s). You will no longer
        be able to access your account. Please contact your Innovation Sandbox administrator / manager for assistance.
        `
        },
        'fr-CA': {
          subject: "[Informatif] Innovation Sandbox : Action de nettoyage de compte basée sur la durée du bail",
          htmlBody: `
          <p>Le processus de nettoyage des ressources a été initié pour le compte ${event.Detail.accountId} sous le bail ${event.Detail.leaseId.uuid}
          car le bail a atteint la durée maximale de ${event.Detail.reason.leaseDurationInHours} heure(s). Vous ne pourrez plus
          accéder à votre compte. Veuillez contacter votre administrateur / gestionnaire du Innovation Sandbox pour assistance.</p>
        `,
          textBody: `
        Le processus de nettoyage des ressources a été initié pour le bail du compte ${event.Detail.accountId} sous le bail ${event.Detail.leaseId.uuid}
        car le bail a atteint la durée maximale de ${event.Detail.reason.leaseDurationInHours} heure(s). Vous ne pourrez plus
        accéder à votre compte. Veuillez contacter votre administrateur / gestionnaire du Innovation Sandbox pour assistance.
        `
        }
      };

      return {
        to: context.destination.to!,
        ...templates[language],
      };
    }

    export function byDurationAdminManager(
      event: LeaseTerminatedEvent<"Expired">,
      context: EmailTemplatesContext,
    ): SynthesizedEmail {
      const language = context.language || 'en';
      
      const templates = {
        en: {
          subject: "[Informational] Innovation Sandbox: Account Clean-up Action based on Lease Duration",
          htmlBody: `
      <p> The resource clean-up process has been initiated for account id: ${event.Detail.accountId} under lease id: ${event.Detail.leaseId.uuid}
      since it has reached the maximum lease duration ${event.Detail.reason.leaseDurationInHours} hour(s). Upon successful clean-up,
      the account will be moved to 'Available' OU. You will be notified if any manual intervention is required
      to complete the resource clean-up process. </p>
    `,
          textBody: `
    The resource clean-up process has been initiated for account id: ${event.Detail.accountId} under lease id: ${event.Detail.leaseId.uuid}
    since it has reached the maximum lease duration ${event.Detail.reason.leaseDurationInHours} hour(s). Upon successful clean-up,
    the account will be moved to 'Available' OU. You will be notified if any manual intervention is required
    to complete the resource clean-up process.
    `
        },
        'fr-CA': {
          subject: "[Informatif] Innovation Sandbox : Action de nettoyage de compte basée sur la durée du bail",
          htmlBody: `
      <p>Le processus de nettoyage des ressources a été initié pour le compte ${event.Detail.accountId} sous le bail ${event.Detail.leaseId.uuid}
      car il a atteint la durée maximale du bail de ${event.Detail.reason.leaseDurationInHours} heure(s). Après un nettoyage réussi,
      le compte sera déplacé vers l'OU 'Disponible'. Vous serez notifié si une intervention manuelle est requise
      pour compléter le processus de nettoyage des ressources.</p>
    `,
          textBody: `
    Le processus de nettoyage des ressources a été initié pour le compte ${event.Detail.accountId} sous le bail ${event.Detail.leaseId.uuid}
    car il a atteint la durée maximale du bail de ${event.Detail.reason.leaseDurationInHours} heure(s). Après un nettoyage réussi,
    le compte sera déplacé vers l'OU 'Disponible'. Vous serez notifié si une intervention manuelle est requise
    pour compléter le processus de nettoyage des ressources.
    `
        }
      };

      return {
        bcc: context.destination.bcc!,
        ...templates[language],
      };
    }

    export function byManuallyTerminatedUser(
      event: LeaseTerminatedEvent<"ManuallyTerminated">,
      context: EmailTemplatesContext,
    ): SynthesizedEmail {
      const language = context.language || 'en';
      
      const templates = {
        en: {
          subject: "[Informational] Innovation Sandbox: Manual Account Clean-up Action",
          htmlBody: `
        <p>
        Your lease for account account id: ${event.Detail.accountId} under lease id: ${event.Detail.leaseId.uuid}
         has been manually terminated by an administrator. You will no longer be able to access this account.
         Please contact your administrator / manager with any questions.
        </p>
    `,
          textBody: `
        Your lease for account account id: ${event.Detail.accountId} under lease id: ${event.Detail.leaseId.uuid}
         has been manually terminated by an administrator. You will no longer be able to access this account.
         Please contact your administrator / manager with any questions.
    `
        },
        'fr-CA': {
          subject: "[Informatif] Innovation Sandbox : Action manuelle de nettoyage de compte",
          htmlBody: `
        <p>
        Votre bail pour le compte ${event.Detail.accountId} sous le bail ${event.Detail.leaseId.uuid}
         a été terminé manuellement par un administrateur. Vous ne pourrez plus accéder à ce compte.
         Veuillez contacter votre administrateur / gestionnaire pour toute question.
        </p>
    `,
          textBody: `
        Votre bail pour le compte ${event.Detail.accountId} sous le bail ${event.Detail.leaseId.uuid}
         a été terminé manuellement par un administrateur. Vous ne pourrez plus accéder à ce compte.
         Veuillez contacter votre administrateur / gestionnaire pour toute question.
    `
        }
      };

      return {
        to: context.destination.to!,
        ...templates[language],
      };
    }

    export function byAccountQuarantinedUser(
      event: LeaseTerminatedEvent<"AccountQuarantined">,
      context: EmailTemplatesContext,
    ): SynthesizedEmail {
      const language = context.language || 'en';
      
      const templates = {
        en: {
          subject: "[Informational] Innovation Sandbox: Account Quarantined Action",
          htmlBody: `
      <p> The account id: ${event.Detail.accountId} under lease id: ${event.Detail.leaseId.uuid} is quarantined
      by an Innovation Sandbox administrator / manger. You will no longer be able to access your account. Please contact your Innovation Sandbox
      administrator / manager for assistance. </p>
    `,
          textBody: `
      The account id: ${event.Detail.accountId} under lease id: ${event.Detail.leaseId.uuid} is quarantined
      by an Innovation Sandbox administrator / manger. You will no longer be able to access your account. Please contact your Innovation Sandbox
      administrator / manager for assistance.
    `
        },
        'fr-CA': {
          subject: "[Informatif] Innovation Sandbox : Action de quarantaine de compte",
          htmlBody: `
      <p>Le compte ${event.Detail.accountId} sous le bail ${event.Detail.leaseId.uuid} est mis en quarantaine
      par un administrateur / gestionnaire du Innovation Sandbox. Vous ne pourrez plus accéder à votre compte. Veuillez contacter votre
      administrateur / gestionnaire du Innovation Sandbox pour assistance.</p>
    `,
          textBody: `
      Le compte ${event.Detail.accountId} sous le bail ${event.Detail.leaseId.uuid} est mis en quarantaine
      par un administrateur / gestionnaire du Innovation Sandbox. Vous ne pourrez plus accéder à votre compte. Veuillez contacter votre
      administrateur / gestionnaire du Innovation Sandbox pour assistance.
    `
        }
      };

      return {
        to: context.destination.to!,
        ...templates[language],
      };
    }

    export function byEjectedUser(
      event: LeaseTerminatedEvent<"Ejected">,
      context: EmailTemplatesContext,
    ): SynthesizedEmail {
      const language = context.language || 'en';
      
      const templates = {
        en: {
          subject: "[Informational] Innovation Sandbox: Account Ejected Action",
          htmlBody: `
      <p> The account id: ${event.Detail.accountId} under lease id: ${event.Detail.leaseId.uuid} is ejected
      by an Innovation Sandbox administrator / manger. You will no longer be able to access your account. Please contact your Innovation Sandbox
      administrator / manager for assistance. </p>
    `,
          textBody: `
      The account id: ${event.Detail.accountId} under lease id: ${event.Detail.leaseId.uuid} is ejected
      by an Innovation Sandbox administrator / manger. You will no longer be able to access your account. Please contact your Innovation Sandbox
      administrator / manager for assistance.
    `
        },
        'fr-CA': {
          subject: "[Informatif] Innovation Sandbox : Action d'éjection de compte",
          htmlBody: `
      <p>Le compte ${event.Detail.accountId} sous le bail ${event.Detail.leaseId.uuid} est éjecté
      par un administrateur / gestionnaire du Innovation Sandbox. Vous ne pourrez plus accéder à votre compte. Veuillez contacter votre
      administrateur / gestionnaire du Innovation Sandbox pour assistance.</p>
    `,
          textBody: `
      Le compte ${event.Detail.accountId} sous le bail ${event.Detail.leaseId.uuid} est éjecté
      par un administrateur / gestionnaire du Innovation Sandbox. Vous ne pourrez plus accéder à votre compte. Veuillez contacter votre
      administrateur / gestionnaire du Innovation Sandbox pour assistance.
    `
        }
      };

      return {
        to: context.destination.to!,
        ...templates[language],
      };
    }
  }

  export namespace LeaseFrozen {
    export function byBudgetUser(
      event: LeaseFrozenEvent<"BudgetExceeded">,
      context: EmailTemplatesContext,
    ): SynthesizedEmail {
      const language = context.language || 'en';
      
      const templates = {
        en: {
          subject: "[Informational] Innovation Sandbox: Account Freeze Action based on Allowed Budget",
          htmlBody: `
      <p> The account id: ${event.Detail.accountId} under your lease id: ${event.Detail.leaseId.uuid} has been frozen since usage cost has reached
      the freeze threshold of USD ${event.Detail.reason.triggeredBudgetThreshold} against the assigned budget of USD ${event.Detail.reason.budget}.
      You will no longer be able to access your account. Please contact your Innovation Sandbox administrator / manager for assistance.  </p>
    `,
          textBody: `
      The account id: ${event.Detail.accountId} under your lease id: ${event.Detail.leaseId.uuid} has been frozen since usage cost has reached
      the freeze threshold of USD ${event.Detail.reason.triggeredBudgetThreshold} against the assigned budget of USD ${event.Detail.reason.budget}.
      You will no longer be able to access your account. Please contact your Innovation Sandbox administrator / manager for assistance.
    `
        },
        'fr-CA': {
          subject: "[Informatif] Innovation Sandbox : Action de gel de compte basée sur le budget autorisé",
          htmlBody: `
      <p>Le compte ${event.Detail.accountId} sous votre bail ${event.Detail.leaseId.uuid} a été gelé car le coût d'utilisation a atteint
      le seuil de gel de ${event.Detail.reason.triggeredBudgetThreshold} USD contre le budget assigné de ${event.Detail.reason.budget} USD.
      Vous ne pourrez plus accéder à votre compte. Veuillez contacter votre administrateur / gestionnaire du Innovation Sandbox pour assistance.</p>
    `,
          textBody: `
      Le compte ${event.Detail.accountId} sous votre bail ${event.Detail.leaseId.uuid} a été gelé car le coût d'utilisation a atteint
      le seuil de gel de ${event.Detail.reason.triggeredBudgetThreshold} USD contre le budget assigné de ${event.Detail.reason.budget} USD.
      Vous ne pourrez plus accéder à votre compte. Veuillez contacter votre administrateur / gestionnaire du Innovation Sandbox pour assistance.
    `
        }
      };

      return {
        to: context.destination.to!,
        ...templates[language],
      };
    }

    export function byBudgetAdminManager(
      event: LeaseFrozenEvent<"BudgetExceeded">,
      context: EmailTemplatesContext,
    ): SynthesizedEmail {
      const language = context.language || 'en';
      
      const templates = {
        en: {
          subject: "[Action Needed] Innovation Sandbox: Account Freeze Action based on Allowed Budget",
          htmlBody: `
      <p> The account id: ${event.Detail.accountId} under lease id: ${event.Detail.leaseId.uuid} has been frozen since usage cost has reached the
      freeze threshold of USD ${event.Detail.reason.triggeredBudgetThreshold} against the assigned budget of USD ${event.Detail.reason.budget}.
      Sandbox users will no longer be able to access this account. The resources being used in the account will
      continue to be billed. Please do one of the following timely actions:
        <p>
        a) Review the account with the sandbox user(s) to terminate resources that are no longer needed to reduce cost.
        Guide the users on ways to stay within the budget limit and if necessary, manually grant them access to the
        account to resume sandbox use.
        </p>
        <p>
        OR
        </p>
        <p>
        b) Review the account and initiate Clean-up action through the Innovation Sandbox web application.
        </p>
        <p>
        OR
        </p>
        <p>
        c) If you wish to continue using the account beyond its budget limit, you can using the Innovation Sandbox
        web application to eject the account to the 'Exit' OU and then move it else where from there.
        </p>
      </p>
    `,
          textBody: `
      The account id: ${event.Detail.accountId} under lease id: ${event.Detail.leaseId.uuid} has been frozen since usage cost has reached the
      freeze threshold of USD ${event.Detail.reason.triggeredBudgetThreshold} against the assigned budget of USD ${event.Detail.reason.budget}.
      Sandbox users will no longer be able to access this account. The resources being used in the account will
      continue to be billed. Please do one of the following timely actions:
        a) Review the account with the sandbox user(s) to terminate resources that are no longer needed to reduce cost.
        Guide the users on ways to stay within the budget limit and if necessary, manually grant them access to the
        account to resume sandbox use.
        OR
        b) Review the account and initiate clean-up action through the Innovation Sandbox web application.
        c) If you wish to continue using the account beyond its budget limit, you can using the Innovation Sandbox
        web application to eject the account to the 'Exit' OU and then move it else where from there.
   `
        },
        'fr-CA': {
          subject: "[Action nécessaire] Innovation Sandbox : Action de gel de compte basée sur le budget autorisé",
          htmlBody: `
      <p>Le compte ${event.Detail.accountId} sous le bail ${event.Detail.leaseId.uuid} a été gelé car le coût d'utilisation a atteint le
      seuil de gel de ${event.Detail.reason.triggeredBudgetThreshold} USD contre le budget assigné de ${event.Detail.reason.budget} USD.
      Les utilisateurs du bac à sable ne pourront plus accéder à ce compte. Les ressources utilisées dans le compte continueront
      d'être facturées. Veuillez effectuer l'une des actions suivantes en temps opportun :
        <p>
        a) Révisez le compte avec le(s) utilisateur(s) du bac à sable pour terminer les ressources qui ne sont plus nécessaires afin de réduire les coûts.
        Guidez les utilisateurs sur les moyens de rester dans la limite budgétaire et si nécessaire, accordez-leur manuellement l'accès au
        compte pour reprendre l'utilisation du bac à sable.
        </p>
        <p>
        OU
        </p>
        <p>
        b) Révisez le compte et initiez l'action de nettoyage via l'application web Innovation Sandbox.
        </p>
        <p>
        OU
        </p>
        <p>
        c) Si vous souhaitez continuer à utiliser le compte au-delà de sa limite budgétaire, vous pouvez utiliser l'application web
        Innovation Sandbox pour éjecter le compte vers l'OU 'Sortie' et le déplacer ailleurs à partir de là.
        </p>
      </p>
    `,
          textBody: `
      Le compte ${event.Detail.accountId} sous le bail ${event.Detail.leaseId.uuid} a été gelé car le coût d'utilisation a atteint le
      seuil de gel de ${event.Detail.reason.triggeredBudgetThreshold} USD contre le budget assigné de ${event.Detail.reason.budget} USD.
      Les utilisateurs du bac à sable ne pourront plus accéder à ce compte. Les ressources utilisées dans le compte continueront
      d'être facturées. Veuillez effectuer l'une des actions suivantes en temps opportun :
        a) Révisez le compte avec le(s) utilisateur(s) du bac à sable pour terminer les ressources qui ne sont plus nécessaires afin de réduire les coûts.
        Guidez les utilisateurs sur les moyens de rester dans la limite budgétaire et si nécessaire, accordez-leur manuellement l'accès au
        compte pour reprendre l'utilisation du bac à sable.
        OU
        b) Révisez le compte et initiez l'action de nettoyage via l'application web Innovation Sandbox.
        c) Si vous souhaitez continuer à utiliser le compte au-delà de sa limite budgétaire, vous pouvez utiliser l'application web
        Innovation Sandbox pour éjecter le compte vers l'OU 'Sortie' et le déplacer ailleurs à partir de là.
   `
        }
      };

      return {
        bcc: context.destination.bcc!,
        ...templates[language],
      };
    }

    export function byDurationUser(
      event: LeaseFrozenEvent<"Expired">,
      context: EmailTemplatesContext,
    ): SynthesizedEmail {
      const language = context.language || 'en';
      
      const templates = {
        en: {
          subject: "[Informational] Innovation Sandbox: Account Freeze Action based on Lease Duration",
          htmlBody: `
      <p> The account id: ${event.Detail.accountId} for your lease id: ${event.Detail.leaseId.uuid} has been frozen since the lease duration
      has reached the freeze threshold of ${event.Detail.reason.leaseDurationInHours - event.Detail.reason.triggeredDurationThreshold} hour(s) against the total lease
      duration of ${event.Detail.reason.leaseDurationInHours} hour(s). You will no longer be able to access your account.
      Please contact your Innovation Sandbox administrator / manager for assistance.  </p>
    `,
          textBody: `
      The account id: ${event.Detail.accountId} for your lease id: ${event.Detail.leaseId} has been frozen since the lease duration
       has reached the freeze threshold of ${event.Detail.reason.leaseDurationInHours - event.Detail.reason.triggeredDurationThreshold} hour(s) against the total lease
       duration of ${event.Detail.reason.leaseDurationInHours} hour(s). You will no longer be able to access your account.
       Please contact your Innovation Sandbox administrator / manager for assistance.
    `
        },
        'fr-CA': {
          subject: "[Informatif] Innovation Sandbox : Action de gel de compte basée sur la durée du bail",
          htmlBody: `
      <p>Le compte ${event.Detail.accountId} pour votre bail ${event.Detail.leaseId.uuid} a été gelé car la durée du bail
      a atteint le seuil de gel de ${event.Detail.reason.leaseDurationInHours - event.Detail.reason.triggeredDurationThreshold} heure(s) contre la durée totale du bail
      de ${event.Detail.reason.leaseDurationInHours} heure(s). Vous ne pourrez plus accéder à votre compte.
      Veuillez contacter votre administrateur / gestionnaire du Innovation Sandbox pour assistance.</p>
    `,
          textBody: `
      Le compte ${event.Detail.accountId} pour votre bail ${event.Detail.leaseId} a été gelé car la durée du bail
       a atteint le seuil de gel de ${event.Detail.reason.leaseDurationInHours - event.Detail.reason.triggeredDurationThreshold} heure(s) contre la durée totale du bail
       de ${event.Detail.reason.leaseDurationInHours} heure(s). Vous ne pourrez plus accéder à votre compte.
       Veuillez contacter votre administrateur / gestionnaire du Innovation Sandbox pour assistance.
    `
        }
      };

      return {
        to: context.destination.to!,
        ...templates[language],
      };
    }

    export function byDurationAdminManager(
      event: LeaseFrozenEvent<"Expired">,
      context: EmailTemplatesContext,
    ): SynthesizedEmail {
      const language = context.language || 'en';
      
      const templates = {
        en: {
          subject: "[Action Needed] Innovation Sandbox: Account Freeze Action based on Lease Duration",
          htmlBody: `
      <p> The account id: ${event.Detail.accountId} for lease id: ${event.Detail.leaseId.uuid} has been frozen since the lease duration has
      reached the freeze threshold of ${event.Detail.reason.leaseDurationInHours - event.Detail.reason.triggeredDurationThreshold} hour(s) against the total lease duration of
      ${event.Detail.reason.leaseDurationInHours} hour(s). Sandbox users will no longer be able to access this account.
      The resources being used in the account will continue to be billed. Please do one of the following timely
      actions after reviewing your account:
      <p>
        a) If you wish to continue using the account beyond its lease duration, you can using the Innovation Sandbox
        web application to eject the account to the 'Exit' OU and then move it else where from there.
      </p>
      <p>
        OR
      </p>
      <p>
        b) You can initiate the clean-up action to delete the resources in this account through the Innovation
        Sandbox web application.
      </p>
     . </p>
     `,
          textBody: `
       The account id: ${event.Detail.accountId} for lease id: ${event.Detail.leaseId.uuid} has been frozen since the lease duration has
      reached the freeze threshold of ${event.Detail.reason.leaseDurationInHours - event.Detail.reason.triggeredDurationThreshold} hour(s) against the total lease duration of
      ${event.Detail.reason.leaseDurationInHours} hour(s). Sandbox users will no longer be able to access this account.
      The resources being used in the account will continue to be billed. Please do one of the following timely
      actions after reviewing your account:
        a) If you wish to continue using the account beyond its lease duration, you can using the Innovation Sandbox
        web application to eject the account to the 'Exit' OU and then move it else where from there.
        OR
        b) You can initiate the clean-up action to wipe the resources in this account through the Innovation
        Sandbox web application.
     `
        },
        'fr-CA': {
          subject: "[Action nécessaire] Innovation Sandbox : Action de gel de compte basée sur la durée du bail",
          htmlBody: `
      <p>Le compte ${event.Detail.accountId} pour le bail ${event.Detail.leaseId.uuid} a été gelé car la durée du bail a
      atteint le seuil de gel de ${event.Detail.reason.leaseDurationInHours - event.Detail.reason.triggeredDurationThreshold} heure(s) contre la durée totale du bail de
      ${event.Detail.reason.leaseDurationInHours} heure(s). Les utilisateurs du bac à sable ne pourront plus accéder à ce compte.
      Les ressources utilisées dans le compte continueront d'être facturées. Veuillez effectuer l'une des actions suivantes en temps opportun
      après avoir révisé votre compte :
      <p>
        a) Si vous souhaitez continuer à utiliser le compte au-delà de sa durée de bail, vous pouvez utiliser l'application web
        Innovation Sandbox pour éjecter le compte vers l'OU 'Sortie' et le déplacer ailleurs à partir de là.
      </p>
      <p>
        OU
      </p>
      <p>
        b) Vous pouvez initier l'action de nettoyage pour supprimer les ressources de ce compte via l'application web
        Innovation Sandbox.
      </p>
     .</p>
     `,
          textBody: `
       Le compte ${event.Detail.accountId} pour le bail ${event.Detail.leaseId.uuid} a été gelé car la durée du bail a
      atteint le seuil de gel de ${event.Detail.reason.leaseDurationInHours - event.Detail.reason.triggeredDurationThreshold} heure(s) contre la durée totale du bail de
      ${event.Detail.reason.leaseDurationInHours} heure(s). Les utilisateurs du bac à sable ne pourront plus accéder à ce compte.
      Les ressources utilisées dans le compte continueront d'être facturées. Veuillez effectuer l'une des actions suivantes en temps opportun
      après avoir révisé votre compte :
        a) Si vous souhaitez continuer à utiliser le compte au-delà de sa durée de bail, vous pouvez utiliser l'application web
        Innovation Sandbox pour éjecter le compte vers l'OU 'Sortie' et le déplacer ailleurs à partir de là.
        OU
        b) Vous pouvez initier l'action de nettoyage pour effacer les ressources de ce compte via l'application web
        Innovation Sandbox.
     `
        }
      };

      return {
        bcc: context.destination.bcc!,
        ...templates[language],
      };
    }

    export function byManuallyFrozenUser(
      event: LeaseFrozenEvent<"ManuallyFrozen">,
      context: EmailTemplatesContext,
    ): SynthesizedEmail {
      const language = context.language || 'en';
      
      const templates = {
        en: {
          subject: "[Informational] Innovation Sandbox: Account Frozen Action",
          htmlBody: `
      <p> The account id: ${event.Detail.accountId} under lease id: ${event.Detail.leaseId.uuid} is frozen
      by an Innovation Sandbox administrator / manger. You will no longer be able to access your account. Please contact your Innovation Sandbox
      administrator / manager for assistance. </p>
    `,
          textBody: `
      The account id: ${event.Detail.accountId} under lease id: ${event.Detail.leaseId.uuid} is frozen
      by an Innovation Sandbox administrator / manger. You will no longer be able to access your account. Please contact your Innovation Sandbox
      administrator / manager for assistance.
    `
        },
        'fr-CA': {
          subject: "[Informatif] Innovation Sandbox : Action de gel de compte",
          htmlBody: `
      <p>Le compte ${event.Detail.accountId} sous le bail ${event.Detail.leaseId.uuid} est gelé
      par un administrateur / gestionnaire du Innovation Sandbox. Vous ne pourrez plus accéder à votre compte. Veuillez contacter votre
      administrateur / gestionnaire du Innovation Sandbox pour assistance.</p>
    `,
          textBody: `
      Le compte ${event.Detail.accountId} sous le bail ${event.Detail.leaseId.uuid} est gelé
      par un administrateur / gestionnaire du Innovation Sandbox. Vous ne pourrez plus accéder à votre compte. Veuillez contacter votre
      administrateur / gestionnaire du Innovation Sandbox pour assistance.
    `
        }
      };

      return {
        to: context.destination.to!,
        ...templates[language],
      };
    }
  }

  export function UserAddedToLease(
    event: UserAddedToLeaseEvent,
    context: EmailTemplatesContext,
  ): SynthesizedEmail {
    const language = context.language || 'en';
    
    const templates = {
      en: {
        subject: "Innovation Sandbox: You've been added to a lease",
        htmlBody: `
        <h1>You've been added to a lease</h1>
        <p>You have been added to lease <strong>${event.Detail.leaseId}</strong> by ${event.Detail.addedBy}.</p>
        <p>You can now access this lease at: <a href="${context.webAppUrl}/leases/${event.Detail.leaseOwner}/${event.Detail.leaseId}">${context.webAppUrl}/leases</a></p>
      `,
        textBody: `
You've been added to a lease

You have been added to lease ${event.Detail.leaseId} by ${event.Detail.addedBy}.
You can now access this lease at: ${context.webAppUrl}/leases/${event.Detail.leaseOwner}/${event.Detail.leaseId}
      `
      },
      'fr-CA': {
        subject: "Innovation Sandbox : Vous avez été ajouté à un bail",
        htmlBody: `
        <h1>Vous avez été ajouté à un bail</h1>
        <p>Vous avez été ajouté au bail <strong>${event.Detail.leaseId}</strong> par ${event.Detail.addedBy}.</p>
        <p>Vous pouvez maintenant accéder à ce bail à : <a href="${context.webAppUrl}/leases/${event.Detail.leaseOwner}/${event.Detail.leaseId}">${context.webAppUrl}/leases</a></p>
      `,
        textBody: `
Vous avez été ajouté à un bail

Vous avez été ajouté au bail ${event.Detail.leaseId} par ${event.Detail.addedBy}.
Vous pouvez maintenant accéder à ce bail à : ${context.webAppUrl}/leases/${event.Detail.leaseOwner}/${event.Detail.leaseId}
      `
      }
    };

    return {
      to: context.destination.to!,
      ...templates[language],
    };
  }

  export function UserRemovedFromLease(
    event: UserRemovedFromLeaseEvent,
    context: EmailTemplatesContext,
  ): SynthesizedEmail {
    const language = context.language || 'en';
    
    const templates = {
      en: {
        subject: "Innovation Sandbox: You've been removed from a lease",
        htmlBody: `
        <h1>You've been removed from a lease</h1>
        <p>You have been removed from lease <strong>${event.Detail.leaseId}</strong> by ${event.Detail.removedBy}.</p>
        <p>You no longer have access to this lease.</p>
      `,
        textBody: `
You've been removed from a lease

You have been removed from lease ${event.Detail.leaseId} by ${event.Detail.removedBy}.
You no longer have access to this lease.
      `
      },
      'fr-CA': {
        subject: "Innovation Sandbox : Vous avez été retiré d'un bail",
        htmlBody: `
        <h1>Vous avez été retiré d'un bail</h1>
        <p>Vous avez été retiré du bail <strong>${event.Detail.leaseId}</strong> par ${event.Detail.removedBy}.</p>
        <p>Vous n'avez plus accès à ce bail.</p>
      `,
        textBody: `
Vous avez été retiré d'un bail

Vous avez été retiré du bail ${event.Detail.leaseId} par ${event.Detail.removedBy}.
Vous n'avez plus accès à ce bail.
      `
      }
    };

    return {
      to: context.destination.to!,
      ...templates[language],
    };
  }

  export function LeaseUserAddedNotification(
    event: UserAddedToLeaseEvent,
    context: EmailTemplatesContext,
  ): SynthesizedEmail {
    const language = context.language || 'en';
    
    const templates = {
      en: {
        subject: "Innovation Sandbox: User added to your lease",
        htmlBody: `
        <h1>User added to your lease</h1>
        <p><strong>${event.Detail.addedUserEmail}</strong> has been added to your lease <strong>${event.Detail.leaseId}</strong> by ${event.Detail.addedBy}.</p>
        <p>View your lease at: <a href="${context.webAppUrl}/leases/${event.Detail.leaseOwner}/${event.Detail.leaseId}">${context.webAppUrl}/leases</a></p>
      `,
        textBody: `
User added to your lease

${event.Detail.addedUserEmail} has been added to your lease ${event.Detail.leaseId} by ${event.Detail.addedBy}.
View your lease at: ${context.webAppUrl}/leases/${event.Detail.leaseOwner}/${event.Detail.leaseId}
      `
      },
      'fr-CA': {
        subject: "Innovation Sandbox : Utilisateur ajouté à votre bail",
        htmlBody: `
        <h1>Utilisateur ajouté à votre bail</h1>
        <p><strong>${event.Detail.addedUserEmail}</strong> a été ajouté à votre bail <strong>${event.Detail.leaseId}</strong> par ${event.Detail.addedBy}.</p>
        <p>Voir votre bail à : <a href="${context.webAppUrl}/leases/${event.Detail.leaseOwner}/${event.Detail.leaseId}">${context.webAppUrl}/leases</a></p>
      `,
        textBody: `
Utilisateur ajouté à votre bail

${event.Detail.addedUserEmail} a été ajouté à votre bail ${event.Detail.leaseId} par ${event.Detail.addedBy}.
Voir votre bail à : ${context.webAppUrl}/leases/${event.Detail.leaseOwner}/${event.Detail.leaseId}
      `
      }
    };

    return {
      to: context.destination.to!,
      ...templates[language],
    };
  }

  export function LeaseUserRemovedNotification(
    event: UserRemovedFromLeaseEvent,
    context: EmailTemplatesContext,
  ): SynthesizedEmail {
    const language = context.language || 'en';
    
    const templates = {
      en: {
        subject: "Innovation Sandbox: User removed from your lease",
        htmlBody: `
        <h1>User removed from your lease</h1>
        <p><strong>${event.Detail.removedUserEmail}</strong> has been removed from your lease <strong>${event.Detail.leaseId}</strong> by ${event.Detail.removedBy}.</p>
        <p>View your lease at: <a href="${context.webAppUrl}/leases/${event.Detail.leaseOwner}/${event.Detail.leaseId}">${context.webAppUrl}/leases</a></p>
      `,
        textBody: `
User removed from your lease

${event.Detail.removedUserEmail} has been removed from your lease ${event.Detail.leaseId} by ${event.Detail.removedBy}.
View your lease at: ${context.webAppUrl}/leases/${event.Detail.leaseOwner}/${event.Detail.leaseId}
      `
      },
      'fr-CA': {
        subject: "Innovation Sandbox : Utilisateur retiré de votre bail",
        htmlBody: `
        <h1>Utilisateur retiré de votre bail</h1>
        <p><strong>${event.Detail.removedUserEmail}</strong> a été retiré de votre bail <strong>${event.Detail.leaseId}</strong> par ${event.Detail.removedBy}.</p>
        <p>Voir votre bail à : <a href="${context.webAppUrl}/leases/${event.Detail.leaseOwner}/${event.Detail.leaseId}">${context.webAppUrl}/leases</a></p>
      `,
        textBody: `
Utilisateur retiré de votre bail

${event.Detail.removedUserEmail} a été retiré de votre bail ${event.Detail.leaseId} par ${event.Detail.removedBy}.
Voir votre bail à : ${context.webAppUrl}/leases/${event.Detail.leaseOwner}/${event.Detail.leaseId}
      `
      }
    };

    return {
      to: context.destination.to!,
      ...templates[language],
    };
  }

  export function LeaseUserAddedApproverNotification(
    event: UserAddedToLeaseEvent,
    context: EmailTemplatesContext,
  ): SynthesizedEmail {
    const language = context.language || 'en';
    const templates = {
      'en': {
        subject: "Innovation Sandbox: User added to lease you approved",
        htmlBody: `
          <h1>User added to lease you approved</h1>
          <p><strong>${event.Detail.addedUserEmail}</strong> has been added to lease <strong>${event.Detail.leaseId}</strong> (owned by ${event.Detail.leaseOwner}) by ${event.Detail.addedBy}.</p>
          <p>This is a lease you previously approved. View the lease at: <a href="${context.webAppUrl}/leases/${event.Detail.leaseOwner}/${event.Detail.leaseId}">${context.webAppUrl}/leases</a></p>
        `,
        textBody: `
User added to lease you approved

${event.Detail.addedUserEmail} has been added to lease ${event.Detail.leaseId} (owned by ${event.Detail.leaseOwner}) by ${event.Detail.addedBy}.
This is a lease you previously approved. View the lease at: ${context.webAppUrl}/leases/${event.Detail.leaseOwner}/${event.Detail.leaseId}
        `
      },
      'fr-CA': {
        subject: "Innovation Sandbox : Utilisateur ajouté au bail que vous avez approuvé",
        htmlBody: `
          <h1>Utilisateur ajouté au bail que vous avez approuvé</h1>
          <p><strong>${event.Detail.addedUserEmail}</strong> a été ajouté au bail <strong>${event.Detail.leaseId}</strong> (appartenant à ${event.Detail.leaseOwner}) par ${event.Detail.addedBy}.</p>
          <p>Il s'agit d'un bail que vous avez précédemment approuvé. Voir le bail à : <a href="${context.webAppUrl}/leases/${event.Detail.leaseOwner}/${event.Detail.leaseId}">${context.webAppUrl}/leases</a></p>
        `,
        textBody: `
Utilisateur ajouté au bail que vous avez approuvé

${event.Detail.addedUserEmail} a été ajouté au bail ${event.Detail.leaseId} (appartenant à ${event.Detail.leaseOwner}) par ${event.Detail.addedBy}.
Il s'agit d'un bail que vous avez précédemment approuvé. Voir le bail à : ${context.webAppUrl}/leases/${event.Detail.leaseOwner}/${event.Detail.leaseId}
        `
      }
    };

    return {
      to: context.destination.to!,
      ...templates[language],
    };
  }

  export function LeaseUserRemovedApproverNotification(
    event: UserRemovedFromLeaseEvent,
    context: EmailTemplatesContext,
  ): SynthesizedEmail {
    const language = context.language || 'en';
    
    const templates = {
      en: {
        subject: "Innovation Sandbox: User removed from lease you approved",
        htmlBody: `
        <h1>User removed from lease you approved</h1>
        <p><strong>${event.Detail.removedUserEmail}</strong> has been removed from lease <strong>${event.Detail.leaseId}</strong> (owned by ${event.Detail.leaseOwner}) by ${event.Detail.removedBy}.</p>
        <p>This is a lease you previously approved. View the lease at: <a href="${context.webAppUrl}/leases/${event.Detail.leaseOwner}/${event.Detail.leaseId}">${context.webAppUrl}/leases</a></p>
      `,
        textBody: `
User removed from lease you approved

${event.Detail.removedUserEmail} has been removed from lease ${event.Detail.leaseId} (owned by ${event.Detail.leaseOwner}) by ${event.Detail.removedBy}.
This is a lease you previously approved. View the lease at: ${context.webAppUrl}/leases/${event.Detail.leaseOwner}/${event.Detail.leaseId}
      `
      },
      'fr-CA': {
        subject: "Innovation Sandbox : Utilisateur retiré du bail que vous avez approuvé",
        htmlBody: `
        <h1>Utilisateur retiré du bail que vous avez approuvé</h1>
        <p><strong>${event.Detail.removedUserEmail}</strong> a été retiré du bail <strong>${event.Detail.leaseId}</strong> (appartenant à ${event.Detail.leaseOwner}) par ${event.Detail.removedBy}.</p>
        <p>Il s'agit d'un bail que vous avez précédemment approuvé. Voir le bail à : <a href="${context.webAppUrl}/leases/${event.Detail.leaseOwner}/${event.Detail.leaseId}">${context.webAppUrl}/leases</a></p>
      `,
        textBody: `
Utilisateur retiré du bail que vous avez approuvé

${event.Detail.removedUserEmail} a été retiré du bail ${event.Detail.leaseId} (appartenant à ${event.Detail.leaseOwner}) par ${event.Detail.removedBy}.
Il s'agit d'un bail que vous avez précédemment approuvé. Voir le bail à : ${context.webAppUrl}/leases/${event.Detail.leaseOwner}/${event.Detail.leaseId}
      `
      }
    };

    return {
      to: context.destination.to!,
      ...templates[language],
    };
  }

  export function LeaseOwnerReassigned(
    event: LeaseOwnerReassignedEvent,
    context: EmailTemplatesContext,
  ): SynthesizedEmail {
    const language = context.language || 'en';
    
    const templates = {
      en: {
        subject: "Innovation Sandbox: Your lease ownership has been transferred",
        htmlBody: `
        <h1>Your lease ownership has been transferred</h1>
        <p>The ownership of lease <strong>${event.Detail.leaseId}</strong> has been transferred from you to <strong>${event.Detail.newOwner}</strong> by ${event.Detail.reassignedBy}.</p>
        <p>You no longer have access to this AWS account. If you have any questions, please contact your administrator.</p>
      `,
        textBody: `
Your lease ownership has been transferred

The ownership of lease ${event.Detail.leaseId} has been transferred from you to ${event.Detail.newOwner} by ${event.Detail.reassignedBy}.
You no longer have access to this AWS account. If you have any questions, please contact your administrator.
      `
      },
      'fr-CA': {
        subject: "Innovation Sandbox : La propriété de votre bail a été transférée",
        htmlBody: `
        <h1>La propriété de votre bail a été transférée</h1>
        <p>La propriété du bail <strong>${event.Detail.leaseId}</strong> vous a été transférée vers <strong>${event.Detail.newOwner}</strong> par ${event.Detail.reassignedBy}.</p>
        <p>Vous n'avez plus accès à ce compte AWS. Si vous avez des questions, veuillez contacter votre administrateur.</p>
      `,
        textBody: `
La propriété de votre bail a été transférée

La propriété du bail ${event.Detail.leaseId} vous a été transférée vers ${event.Detail.newOwner} par ${event.Detail.reassignedBy}.
Vous n'avez plus accès à ce compte AWS. Si vous avez des questions, veuillez contacter votre administrateur.
      `
      }
    };

    return {
      to: context.destination.to!,
      ...templates[language],
    };
  }

  export function LeaseOwnerReassignedNewOwner(
    event: LeaseOwnerReassignedEvent,
    context: EmailTemplatesContext,
  ): SynthesizedEmail {
    const language = context.language || 'en';
    
    const templates = {
      en: {
        subject: "Innovation Sandbox: You are now the owner of a lease",
        htmlBody: `
        <h1>You are now the owner of a lease</h1>
        <p>The ownership of lease <strong>${event.Detail.leaseId}</strong> has been transferred to you from <strong>${event.Detail.previousOwner}</strong> by ${event.Detail.reassignedBy}.</p>
        <p>You now have full access to this AWS account and can manage its users and settings. View the lease at: <a href="${context.webAppUrl}/leases/${event.Detail.newOwner}/${event.Detail.leaseId}">${context.webAppUrl}/leases</a></p>
      `,
        textBody: `
You are now the owner of a lease

The ownership of lease ${event.Detail.leaseId} has been transferred to you from ${event.Detail.previousOwner} by ${event.Detail.reassignedBy}.
You now have full access to this AWS account and can manage its users and settings. View the lease at: ${context.webAppUrl}/leases/${event.Detail.newOwner}/${event.Detail.leaseId}
      `
      },
      'fr-CA': {
        subject: "Innovation Sandbox : Vous êtes maintenant propriétaire d'un bail",
        htmlBody: `
        <h1>Vous êtes maintenant propriétaire d'un bail</h1>
        <p>La propriété du bail <strong>${event.Detail.leaseId}</strong> vous a été transférée de <strong>${event.Detail.previousOwner}</strong> par ${event.Detail.reassignedBy}.</p>
        <p>Vous avez maintenant un accès complet à ce compte AWS et pouvez gérer ses utilisateurs et paramètres. Voir le bail à : <a href="${context.webAppUrl}/leases/${event.Detail.newOwner}/${event.Detail.leaseId}">${context.webAppUrl}/leases</a></p>
      `,
        textBody: `
Vous êtes maintenant propriétaire d'un bail

La propriété du bail ${event.Detail.leaseId} vous a été transférée de ${event.Detail.previousOwner} par ${event.Detail.reassignedBy}.
Vous avez maintenant un accès complet à ce compte AWS et pouvez gérer ses utilisateurs et paramètres. Voir le bail à : ${context.webAppUrl}/leases/${event.Detail.newOwner}/${event.Detail.leaseId}
      `
      }
    };

    return {
      to: context.destination.to!,
      ...templates[language],
    };
  }
}
