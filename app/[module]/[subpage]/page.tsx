import React, { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { NAVIGATION_MODULES, findSubmenuItem } from '@/lib/navigation';
import { ComingSoonView } from '@/components/ComingSoonView';
import { SettingsShopProfileView } from '@/components/settings/ShopProfileView';
import { SettingsInvoiceTemplatesView } from '@/components/settings/InvoiceTemplatesView';
import { SettingsGSTConfigView } from '@/components/settings/GSTConfigView';
import { SettingsTaxRulesView } from '@/components/settings/TaxRulesView';
import { SettingsPrinterSettingsView } from '@/components/settings/PrinterSettingsView';
import { SettingsBarcodeTemplatesView } from '@/components/settings/BarcodeTemplatesView';
import { SettingsWeighingScaleView } from '@/components/settings/WeighingScaleView';
import { SettingsKeyboardShortcutsView } from '@/components/settings/KeyboardShortcutsView';
import { SettingsBackupRestoreView } from '@/components/settings/BackupRestoreView';
import { SettingsCloudSyncView } from '@/components/settings/CloudSyncView';
import { SettingsSubscriptionView } from '@/components/settings/SubscriptionView';

import { InventoryOrnamentsView } from '@/components/inventory/OrnamentsView';
import { InventoryCategoriesView } from '@/components/inventory/CategoriesView';
import { InventoryMetalTypesView } from '@/components/inventory/MetalTypesView';
import { InventoryPurityKaratView } from '@/components/inventory/PurityKaratView';
import { InventoryBarcodeTagsView } from '@/components/inventory/BarcodeTagsView';
import { InventoryStockRegisterView } from '@/components/inventory/StockRegisterView';
import { InventoryStockTransfersView } from '@/components/inventory/StockTransfersView';
import { InventoryStockAdjustmentsView } from '@/components/inventory/StockAdjustmentsView';
import { InventoryStockAuditView } from '@/components/inventory/StockAuditView';
import { InventoryReorderAlertsView } from '@/components/inventory/ReorderAlertsView';

import { RatesGoldRatesView } from '@/components/rates/GoldRatesView';
import { RatesSilverRatesView } from '@/components/rates/SilverRatesView';
import { RatesRateHistoryView } from '@/components/rates/RateHistoryView';
import { RatesOldGoldValuationView } from '@/components/rates/OldGoldValuationView';
import { RatesDiamondValuationView } from '@/components/rates/DiamondValuationView';
import { RatesMakingChargesView } from '@/components/rates/MakingChargesView';
import { RatesWastageRulesView } from '@/components/rates/WastageRulesView';

import { PurchasesEntryView } from '@/components/purchases/PurchaseEntryView';
import { PurchasesReturnsView } from '@/components/purchases/PurchaseReturnsView';
import { PurchasesSuppliersView } from '@/components/purchases/SuppliersDirectoryView';
import { PurchasesPaymentsView } from '@/components/purchases/SupplierPaymentsView';
import { PurchasesLedgerView } from '@/components/purchases/SupplierLedgerView';
import { PurchasesJobWorkerReceiptsView } from '@/components/purchases/JobWorkerReceiptsView';

import { CustomersListView } from '@/components/customers/CustomerListView';
import { CustomersProfileView } from '@/components/customers/CustomerProfileView';
import { CustomersPurchaseHistoryView } from '@/components/customers/PurchaseHistoryView';
import { CustomersOutstandingBalancesView } from '@/components/customers/OutstandingBalancesView';
import { CustomersAdvanceDepositsView } from '@/components/customers/AdvanceDepositsView';
import { CustomersLoyaltyRewardsView } from '@/components/customers/LoyaltyRewardsView';
import { CustomersSchemesView } from '@/components/customers/CustomerSchemesView';

import { SalesBillingPosView } from '@/components/sales/BillingPosView';
import { SalesInvoicesView } from '@/components/sales/SalesInvoicesView';
import { SalesReturnsView } from '@/components/sales/SalesReturnsView';
import { SalesQuotationsView } from '@/components/sales/QuotationsView';
import { SalesOrdersView } from '@/components/sales/SalesOrdersView';
import { SalesDeliveryChallansView } from '@/components/sales/DeliveryChallansView';
import { SalesExchangeBillingView } from '@/components/sales/ExchangeBillingView';
import { SalesHeldBillsView } from '@/components/sales/HeldBillsView';

import { BranchesManagementView } from '@/components/branches/BranchManagementView';
import { BranchesTransfersView } from '@/components/branches/InterBranchTransfersView';
import { BranchesStockView } from '@/components/branches/BranchStockView';
import { BranchesRatesView } from '@/components/branches/BranchRatesView';
import { BranchesConsolidatedReportsView } from '@/components/branches/ConsolidatedReportsView';

import { OrdersCustomOrdersView } from '@/components/orders-services/CustomOrdersView';
import { OrdersTrackingView } from '@/components/orders-services/OrderTrackingView';
import { OrdersRepairsView } from '@/components/orders-services/RepairsView';
import { OrdersJobWorkView } from '@/components/orders-services/JobWorkView';
import { OrdersGoldsmithLedgerView } from '@/components/orders-services/GoldsmithLedgerView';
import { OrdersDeliveryManagementView } from '@/components/orders-services/DeliveryManagementView';

import { FinanceCashBookView } from '@/components/finance/CashBookView';
import { FinanceBankBookView } from '@/components/finance/BankBookView';
import { FinanceUpiCardView } from '@/components/finance/UpiCardView';
import { FinanceExpensesView } from '@/components/finance/ExpensesView';
import { FinanceReceivablesView } from '@/components/finance/ReceivablesView';
import { FinancePayablesView } from '@/components/finance/PayablesView';
import { FinanceDayClosingView } from '@/components/finance/DayClosingView';
import { FinanceJournalEntriesView } from '@/components/finance/JournalEntriesView';
import { FinanceGstReportsView } from '@/components/finance/GstReportsView';
import { FinanceProfitLossView } from '@/components/finance/ProfitLossView';

export async function generateStaticParams() {
  const params: { module: string; subpage: string }[] = [];
  NAVIGATION_MODULES.forEach((mod) => {
    mod.items.forEach((item) => {
      params.push({
        module: mod.slug,
        subpage: item.slug,
      });
    });
  });
  return params;
}

async function SubmenuContent({
  params,
}: {
  params: Promise<{ module: string; subpage: string }>;
}) {
  const { module: moduleSlug, subpage: subpageSlug } = await params;

  const data = findSubmenuItem(moduleSlug, subpageSlug);

  if (!data) {
    notFound();
  }

  const { module, item } = data;

  if (moduleSlug === 'sales') {
    const salesMap: Record<string, React.ReactNode> = {
      'billing-pos': <SalesBillingPosView />,
      'invoices': <SalesInvoicesView />,
      'returns': <SalesReturnsView />,
      'quotations': <SalesQuotationsView />,
      'orders': <SalesOrdersView />,
      'delivery-challans': <SalesDeliveryChallansView />,
      'exchange-billing': <SalesExchangeBillingView />,
      'held-bills': <SalesHeldBillsView />,
    };
    const Comp = salesMap[subpageSlug];
    if (Comp) return <>{Comp}</>;
  }

  if (moduleSlug === 'settings') {
    const settingsMap: Record<string, React.ReactNode> = {
      'shop-profile': <SettingsShopProfileView />,
      'invoice-templates': <SettingsInvoiceTemplatesView />,
      'gst-config': <SettingsGSTConfigView />,
      'tax-rules': <SettingsTaxRulesView />,
      'printer-settings': <SettingsPrinterSettingsView />,
      'barcode-templates': <SettingsBarcodeTemplatesView />,
      'weighing-scale': <SettingsWeighingScaleView />,
      'keyboard-shortcuts': <SettingsKeyboardShortcutsView />,
      'backup-restore': <SettingsBackupRestoreView />,
      'cloud-sync': <SettingsCloudSyncView />,
      'subscription': <SettingsSubscriptionView />,
    };
    const SettingsComp = settingsMap[subpageSlug];
    if (SettingsComp) return <>{SettingsComp}</>;
  }

  if (moduleSlug === 'inventory') {
    const inventoryMap: Record<string, React.ReactNode> = {
      'ornaments': <InventoryOrnamentsView />,
      'categories': <InventoryCategoriesView />,
      'metal-types': <InventoryMetalTypesView />,
      'purity-karat': <InventoryPurityKaratView />,
      'barcode-tags': <InventoryBarcodeTagsView />,
      'stock-register': <InventoryStockRegisterView />,
      'stock-transfers': <InventoryStockTransfersView />,
      'stock-adjustments': <InventoryStockAdjustmentsView />,
      'stock-audit': <InventoryStockAuditView />,
      'reorder-alerts': <InventoryReorderAlertsView />,
    };
    const Comp = inventoryMap[subpageSlug];
    if (Comp) return <>{Comp}</>;
  }

  if (moduleSlug === 'rates') {
    const ratesMap: Record<string, React.ReactNode> = {
      'gold-rates': <RatesGoldRatesView />,
      'silver-rates': <RatesSilverRatesView />,
      'rate-history': <RatesRateHistoryView />,
      'old-gold-valuation': <RatesOldGoldValuationView />,
      'diamond-valuation': <RatesDiamondValuationView />,
      'making-charges': <RatesMakingChargesView />,
      'wastage-rules': <RatesWastageRulesView />,
    };
    const Comp = ratesMap[subpageSlug];
    if (Comp) return <>{Comp}</>;
  }

  if (moduleSlug === 'purchases') {
    const purchasesMap: Record<string, React.ReactNode> = {
      'entry': <PurchasesEntryView />,
      'returns': <PurchasesReturnsView />,
      'suppliers': <PurchasesSuppliersView />,
      'payments': <PurchasesPaymentsView />,
      'ledger': <PurchasesLedgerView />,
      'job-worker-receipts': <PurchasesJobWorkerReceiptsView />,
    };
    const Comp = purchasesMap[subpageSlug];
    if (Comp) return <>{Comp}</>;
  }

  if (moduleSlug === 'customers') {
    const customersMap: Record<string, React.ReactNode> = {
      'list': <CustomersListView />,
      'profile': <CustomersProfileView />,
      'purchase-history': <CustomersPurchaseHistoryView />,
      'outstanding-balances': <CustomersOutstandingBalancesView />,
      'advance-deposits': <CustomersAdvanceDepositsView />,
      'loyalty-rewards': <CustomersLoyaltyRewardsView />,
      'schemes': <CustomersSchemesView />,
    };
    const Comp = customersMap[subpageSlug];
    if (Comp) return <>{Comp}</>;
  }

  if (moduleSlug === 'branches') {
    const branchesMap: Record<string, React.ReactNode> = {
      'management': <BranchesManagementView />,
      'transfers': <BranchesTransfersView />,
      'stock': <BranchesStockView />,
      'rates': <BranchesRatesView />,
      'consolidated-reports': <BranchesConsolidatedReportsView />,
    };
    const Comp = branchesMap[subpageSlug];
    if (Comp) return <>{Comp}</>;
  }

  if (moduleSlug === 'orders-services' || moduleSlug === 'orders') {
    const ordersMap: Record<string, React.ReactNode> = {
      'custom-orders': <OrdersCustomOrdersView />,
      'custom': <OrdersCustomOrdersView />,
      'tracking': <OrdersTrackingView />,
      'repairs': <OrdersRepairsView />,
      'repair': <OrdersRepairsView />,
      'job-work': <OrdersJobWorkView />,
      'goldsmith-ledger': <OrdersGoldsmithLedgerView />,
      'delivery-management': <OrdersDeliveryManagementView />,
      'delivery': <OrdersDeliveryManagementView />,
    };
    const Comp = ordersMap[subpageSlug];
    if (Comp) return <>{Comp}</>;
  }

  if (moduleSlug === 'finance') {
    const financeMap: Record<string, React.ReactNode> = {
      'cash-book': <FinanceCashBookView />,
      'bank-book': <FinanceBankBookView />,
      'upi-card': <FinanceUpiCardView />,
      'expenses': <FinanceExpensesView />,
      'receivables': <FinanceReceivablesView />,
      'payables': <FinancePayablesView />,
      'day-closing': <FinanceDayClosingView />,
      'journal-entries': <FinanceJournalEntriesView />,
      'gst-reports': <FinanceGstReportsView />,
      'profit-loss': <FinanceProfitLossView />,
    };
    const Comp = financeMap[subpageSlug];
    if (Comp) return <>{Comp}</>;
  }

  return <ComingSoonView module={module} item={item} />;
}

export default function SubmenuDetailPage({
  params,
}: {
  params: Promise<{ module: string; subpage: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex flex-col h-full bg-[#fafafa] p-6 animate-pulse">
          <div className="h-8 bg-neutral-200 rounded w-1/4 mb-4" />
          <div className="h-4 bg-neutral-200 rounded w-1/2 mb-8" />
          <div className="flex-1 bg-white border border-[#e5e7eb] rounded-lg" />
        </div>
      }
    >
      <SubmenuContent params={params} />
    </Suspense>
  );
}
