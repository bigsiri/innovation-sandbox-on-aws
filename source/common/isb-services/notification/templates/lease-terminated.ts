// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { LeaseTerminatedEvent } from "@amzn/innovation-sandbox-commons/events/lease-terminated-event.js";
import { SynthesizedEmail } from "@amzn/innovation-sandbox-commons/isb-services/notification/email-service.js";
import { EmailTemplatesContext } from "../email-templates.js";

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
}
