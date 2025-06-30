// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Mock translation resources for testing
 * Provides minimal but complete translation sets for both languages
 */

export const mockTranslations = {
  en: {
    common: {
      // Basic actions
      loading: 'Loading...',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      remove: 'Remove',
      retry: 'Retry',
      refresh: 'Refresh',
      submit: 'Submit',
      reset: 'Reset',
      close: 'Close',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      confirm: 'Confirm',
      
      // Status and feedback
      yes: 'Yes',
      no: 'No',
      ok: 'OK',
      error: 'Error',
      success: 'Success',
      warning: 'Warning',
      info: 'Information',
      
      // Form fields
      required: 'Required',
      optional: 'Optional',
      search: 'Search',
      filter: 'Filter',
      sort: 'Sort',
      actions: 'Actions',
      status: 'Status',
      name: 'Name',
      description: 'Description',
      date: 'Date',
      time: 'Time',
      email: 'Email',
      password: 'Password',
      username: 'Username',
      
      // Pluralization examples
      item_one: 'You have {{count}} item',
      item_other: 'You have {{count}} items',
      user_one: '{{count}} user',
      user_other: '{{count}} users',
      
      // Interpolation examples
      welcome: 'Welcome, {{name}}!',
      greeting: 'Hello {{name}}, you have {{count}} notifications',
      lastLogin: 'Last login: {{date}}',
      
      // Language switcher
      languageSwitcher: {
        ariaLabel: 'Select language',
        english: 'English',
        frenchCanadian: 'French (Canada)',
        switchingLanguage: 'Switching language...',
        languageChanged: 'Language changed to {{language}}'
      }
    },
    navigation: {
      home: 'Home',
      leases: 'Leases',
      accounts: 'Accounts',
      settings: 'Settings',
      users: 'Users',
      dashboard: 'Dashboard',
      profile: 'Profile',
      logout: 'Logout'
    },
    leases: {
      title: 'Leases',
      createLease: 'Create Lease',
      leaseName: 'Lease Name',
      leaseDescription: 'Lease Description',
      duration: 'Duration',
      budget: 'Budget',
      status: 'Status',
      owner: 'Owner',
      users: 'Users',
      createdDate: 'Created Date',
      expiryDate: 'Expiry Date',
      
      // Status values
      active: 'Active',
      inactive: 'Inactive',
      expired: 'Expired',
      pending: 'Pending',
      
      // Messages
      noLeases: 'No leases found',
      leaseCreated: 'Lease created successfully',
      leaseUpdated: 'Lease updated successfully',
      leaseDeleted: 'Lease deleted successfully',
      
      // Validation
      nameRequired: 'Lease name is required',
      descriptionRequired: 'Description is required',
      durationRequired: 'Duration is required',
      budgetRequired: 'Budget is required'
    },
    accounts: {
      title: 'Accounts',
      accountId: 'Account ID',
      accountName: 'Account Name',
      accountStatus: 'Account Status',
      region: 'Region',
      
      // Messages
      noAccounts: 'No accounts found',
      accountAdded: 'Account added successfully',
      accountRemoved: 'Account removed successfully'
    }
  },
  'fr-CA': {
    common: {
      // Basic actions
      loading: 'Chargement...',
      save: 'Enregistrer',
      cancel: 'Annuler',
      delete: 'Supprimer',
      edit: 'Modifier',
      add: 'Ajouter',
      remove: 'Retirer',
      retry: 'Réessayer',
      refresh: 'Actualiser',
      submit: 'Soumettre',
      reset: 'Réinitialiser',
      close: 'Fermer',
      back: 'Retour',
      next: 'Suivant',
      previous: 'Précédent',
      confirm: 'Confirmer',
      
      // Status and feedback
      yes: 'Oui',
      no: 'Non',
      ok: 'OK',
      error: 'Erreur',
      success: 'Succès',
      warning: 'Avertissement',
      info: 'Information',
      
      // Form fields
      required: 'Obligatoire',
      optional: 'Optionnel',
      search: 'Rechercher',
      filter: 'Filtrer',
      sort: 'Trier',
      actions: 'Actions',
      status: 'Statut',
      name: 'Nom',
      description: 'Description',
      date: 'Date',
      time: 'Heure',
      email: 'Courriel',
      password: 'Mot de passe',
      username: "Nom d'utilisateur",
      
      // Pluralization examples
      item_one: 'Vous avez {{count}} élément',
      item_other: 'Vous avez {{count}} éléments',
      user_one: '{{count}} utilisateur',
      user_other: '{{count}} utilisateurs',
      
      // Interpolation examples
      welcome: 'Bienvenue, {{name}} !',
      greeting: 'Bonjour {{name}}, vous avez {{count}} notifications',
      lastLogin: 'Dernière connexion : {{date}}',
      
      // Language switcher
      languageSwitcher: {
        ariaLabel: 'Sélectionner la langue',
        english: 'Anglais',
        frenchCanadian: 'Français (Canada)',
        switchingLanguage: 'Changement de langue...',
        languageChanged: 'Langue changée pour {{language}}'
      }
    },
    navigation: {
      home: 'Accueil',
      leases: 'Baux',
      accounts: 'Comptes',
      settings: 'Paramètres',
      users: 'Utilisateurs',
      dashboard: 'Tableau de bord',
      profile: 'Profil',
      logout: 'Déconnexion'
    },
    leases: {
      title: 'Baux',
      createLease: 'Créer un bail',
      leaseName: 'Nom du bail',
      leaseDescription: 'Description du bail',
      duration: 'Durée',
      budget: 'Budget',
      status: 'Statut',
      owner: 'Propriétaire',
      users: 'Utilisateurs',
      createdDate: 'Date de création',
      expiryDate: "Date d'expiration",
      
      // Status values
      active: 'Actif',
      inactive: 'Inactif',
      expired: 'Expiré',
      pending: 'En attente',
      
      // Messages
      noLeases: 'Aucun bail trouvé',
      leaseCreated: 'Bail créé avec succès',
      leaseUpdated: 'Bail mis à jour avec succès',
      leaseDeleted: 'Bail supprimé avec succès',
      
      // Validation
      nameRequired: 'Le nom du bail est obligatoire',
      descriptionRequired: 'La description est obligatoire',
      durationRequired: 'La durée est obligatoire',
      budgetRequired: 'Le budget est obligatoire'
    },
    accounts: {
      title: 'Comptes',
      accountId: 'ID du compte',
      accountName: 'Nom du compte',
      accountStatus: 'Statut du compte',
      region: 'Région',
      
      // Messages
      noAccounts: 'Aucun compte trouvé',
      accountAdded: 'Compte ajouté avec succès',
      accountRemoved: 'Compte retiré avec succès'
    }
  }
};

/**
 * Get mock translations for a specific language
 */
export const getMockTranslations = (language: 'en' | 'fr-CA') => {
  return mockTranslations[language];
};

/**
 * Get all mock translation resources in i18next format
 */
export const getMockI18nResources = () => {
  return {
    en: mockTranslations.en,
    'fr-CA': mockTranslations['fr-CA']
  };
};

/**
 * Common translation keys used in tests
 */
export const commonTestKeys = {
  // Basic actions
  SAVE: 'save',
  CANCEL: 'cancel',
  LOADING: 'loading',
  
  // Navigation
  HOME: 'home',
  LEASES: 'leases',
  ACCOUNTS: 'accounts',
  
  // Pluralization
  ITEMS: 'item',
  USERS: 'user',
  
  // Interpolation
  WELCOME: 'welcome',
  GREETING: 'greeting',
  
  // Language switcher
  LANGUAGE_SWITCHER_LABEL: 'languageSwitcher.ariaLabel',
  LANGUAGE_ENGLISH: 'languageSwitcher.english',
  LANGUAGE_FRENCH: 'languageSwitcher.frenchCanadian'
} as const;

/**
 * Expected translations for common test scenarios
 */
export const expectedTranslations = {
  en: {
    [commonTestKeys.SAVE]: 'Save',
    [commonTestKeys.CANCEL]: 'Cancel',
    [commonTestKeys.LOADING]: 'Loading...',
    [commonTestKeys.LANGUAGE_SWITCHER_LABEL]: 'Select language',
    [commonTestKeys.LANGUAGE_ENGLISH]: 'English',
    [commonTestKeys.LANGUAGE_FRENCH]: 'French (Canada)'
  },
  'fr-CA': {
    [commonTestKeys.SAVE]: 'Enregistrer',
    [commonTestKeys.CANCEL]: 'Annuler',
    [commonTestKeys.LOADING]: 'Chargement...',
    [commonTestKeys.LANGUAGE_SWITCHER_LABEL]: 'Sélectionner la langue',
    [commonTestKeys.LANGUAGE_ENGLISH]: 'Anglais',
    [commonTestKeys.LANGUAGE_FRENCH]: 'Français (Canada)'
  }
} as const;
