import angular from 'angular';

import loginView from './login/login.module';
import forgotPasswordView from './forgot-password/forgot-password.module';
import homeView from './home/home.module';
import accountsView from './accounts/accounts.module';
import marketsView from './markets/markets.module';
import contactsView from './contacts/contacts.module';
import contentView from './content/content.module';
import contentDetailsView from './content-details/content-details.module';
import technologyInstallsView from './technology-installs/technology-installs.module';
import integrationsView from './integrations/integrations.module';
import integrationsMappingView from './integrations-mapping/integrations-mapping.module';
import integrationsCallbackView from './integrations-callback/integrations-callback.module';
import integrationsHandleDuplicatesView from './integrations-handle-duplicates/integrations-handle-duplicates.module';
import usersView from './users/users.module';
import filesView from './files/files.module';
import companyProfileView from './company-profile/company-profile.module';
import siteProfileView from './site-profile/site-profile.module';
import contactProfileView from './contact-profile/contact-profile.module';
import authByLinkView from './auth-by-link/auth-by-link.module';
import createPasswordView from './create-password/create-password.module';
import insightDetailsView from './insight-details/insight-details.module';
import impersonationView from './impersonation/impersonation.module';
import error404View from './error-404/error-404.module';

import footerComponent from './shared/footer/footer.module';
import headerComponent from './shared/header/header.module';
import contentBundleComponent from './shared/content-bundle/content-bundle.module';
import contentBundleDetailsComponent from './shared/content-bundle-details/content-bundle-details.module';
import tagsComponent from './shared/tags/tags.module';
import filtersComponent from './shared/filters/filters.module';
import bubblesComponent from './shared/bubbles/bubbles.module';
import countsComponent from './shared/counts/counts.module';
import chartsComponent from './shared/charts/charts.module';
import integrationsExportIndicatorComponent from './shared/integrations-export-indicators/integrations-export-indicator.module';
import entityActionsMenuComponent from './shared/entity-actions-menu/entity-actions-menu.module';
import flagDataComponent from './shared/flag-data/flag-data.module';
import bulkActionsMenuComponent from './shared/bulk-actions-menu/bulk-actions-menu.module';
import verticalLineChartComponent from './shared/vertical-line-chart/vertical-line-chart.module';
import horizontalLineChartComponent from './shared/horizontal-line-chat/horizontal-line-chart.module';
import locationHeatMapComponent from './shared/location-heat-map/location-heat-map.module';
import researchBitesComponent from './shared/research-bites/research-bites.module';
import loadingSpinnerComponent from './shared/loading-spinner/loading-spinner.module';
import paginationComponent from './shared/pagination/pagination.module';
import singleDropdownComponent from './shared/single-dropdown/single-dropdown.module';
import contentItemComponent from './shared/content-item/content-item.module';
import minMaxFieldsComponent from './shared/min-max-fields/min-max-fields.module';
import integrationsSyncButtonComponent from './shared/integrations-sync-button/integrations-sync-button.module';
import treeComponent from './shared/tree/tree.module';
import treeElementComponent from './shared/tree-element/tree-element.module';
import checkboxComponent from './shared/checkbox/checkbox.module';

import saveCsvModal from './modals/save-csv/save-csv.module';
import generateCountReportModal from './modals/generate-count-report/generate-count-report.module';
import genericTextModal from './modals/generic-text-modal/generic-text-modal.module';
import saveQueryModal from './modals/save-query/save-query.module';
import flagDataModal from './modals/flag-data/flag-data.module';
import requestFileModal from './modals/request-file/request-file.module';
import integrationsConnectModal from './modals/integrations-connect/integrations-connect.module';
import processInfoModal from './modals/process-info/process-info.module';
import bulkExportModal from './modals/bulk-export/bulk-export.module';
import industriesBrowserModal from './modals/industries-browser/industries-browser.module';
import nutsCodesBrowserModal from './modals/nuts-codes-browser/nuts-codes-browser.module';
import productsBrowserModal from './modals/products-browser/products-browser.module';
import downloadFileExpiredModal from './modals/download-file-expired/download-file-expired.module';
import uploadFileModal from './modals/upload-file/upload-file.module';
import integrationsSettingsModal from './modals/integrations-settings/integrations-settings.module';
import selectSearchResultsComponentModal from './modals/select-search-results/select-search-results.module';
import requestSavedQueryModal from './modals/request-saved-query/request-saved-query.module';
import copyLinkModal from './modals/copy-link/copy-link.module';
import simpleModal from './modals/simple-modal/simple-modal.module';

export default angular
    .module('LeadEssentialsFO.components', [
        loginView,
        forgotPasswordView,
        homeView,
        accountsView,
        marketsView,
        contactsView,
        contentView,
        filesView,
        usersView,
        technologyInstallsView,
        integrationsView,
        companyProfileView,
        siteProfileView,
        contactProfileView,
        authByLinkView,
        createPasswordView,
        integrationsMappingView,
        integrationsCallbackView,
        integrationsHandleDuplicatesView,
        contentDetailsView,
        insightDetailsView,
        impersonationView,
        error404View,

        footerComponent,
        headerComponent,
        contentBundleComponent,
        tagsComponent,
        filtersComponent,
        bubblesComponent,
        countsComponent,
        chartsComponent,
        integrationsExportIndicatorComponent,
        entityActionsMenuComponent,
        flagDataComponent,
        bulkActionsMenuComponent,
        verticalLineChartComponent,
        horizontalLineChartComponent,
        locationHeatMapComponent,
        researchBitesComponent,
        loadingSpinnerComponent,
        paginationComponent,
        singleDropdownComponent,
        contentItemComponent,
        contentBundleDetailsComponent,
        minMaxFieldsComponent,
        integrationsSyncButtonComponent,
        treeComponent,
        treeElementComponent,
        checkboxComponent,

        saveCsvModal,
        generateCountReportModal,
        genericTextModal,
        saveQueryModal,
        flagDataModal,
        requestFileModal,
        integrationsConnectModal,
        processInfoModal,
        bulkExportModal,
        industriesBrowserModal,
        nutsCodesBrowserModal,
        productsBrowserModal,
        downloadFileExpiredModal,
        uploadFileModal,
        integrationsSettingsModal,
        selectSearchResultsComponentModal,
        requestSavedQueryModal,
        copyLinkModal,
        simpleModal,
    ])
    .name;
