import React from 'react';
import { useJumuika } from '../context/JumuikaContext';
import { useTranslation } from 'react-i18next';
import { Download, Database, Users, Receipt, CalendarRange, Landmark } from 'lucide-react';
import { Button } from './ui/Button';

export const Settings: React.FC = () => {
  const { events, currentEventId, contributors, schedules, payments, clearDemoData } = useJumuika();
  const { t } = useTranslation();

  const currentEvent = events.find(e => e.id === currentEventId);

  // 1. Compute summary stats for the active event
  const totalContributorsCount = contributors.length;
  const totalScheduledSum = contributors.reduce((acc, curr) => acc + (curr.totalScheduled || 0), 0);
  const totalPaidSum = contributors.reduce((acc, curr) => acc + (curr.totalPaid || 0), 0);
  const totalRemainingBalance = totalScheduledSum - totalPaidSum;
  const totalPaymentsCount = payments.length;
  const totalSchedulesCount = schedules.length;

  // 2. Helper to escape and wrap CSV fields
  const escapeCSV = (val: any): string => {
    if (val === undefined || val === null) return '';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  // 3. Export Contributors CSV
  const handleExportContributors = () => {
    const headers = ['Contributor ID', 'Full Name', 'Phone', 'Total Scheduled (TZS)', 'Total Paid (TZS)', 'Remaining Balance (TZS)', 'Notes'];
    const rows = contributors.map(c => [
      c.id,
      c.fullName,
      c.phone || '',
      c.totalScheduled || 0,
      c.totalPaid || 0,
      c.remainingBalance || 0,
      c.notes || ''
    ]);

    triggerDownload('contributors_export.csv', headers, rows);
  };

  // 4. Export Payments CSV
  const handleExportPayments = () => {
    const headers = ['Payment ID', 'Contributor Name', 'Amount (TZS)', 'Payment Method', 'Recorded By', 'Date Recorded', 'Notes'];
    const rows = payments.map(p => {
      const c = contributors.find(contrib => contrib.id === p.contributorId);
      const formattedDate = p.createdAt instanceof Date 
        ? p.createdAt.toLocaleString() 
        : p.createdAt?.seconds 
          ? new Date(p.createdAt.seconds * 1000).toLocaleString() 
          : 'N/A';
          
      return [
        p.id,
        c ? c.fullName : 'Unknown Contributor',
        p.amount,
        p.paymentMethod,
        p.recordedBy,
        formattedDate,
        p.notes || ''
      ];
    });

    triggerDownload('payments_export.csv', headers, rows);
  };

  // 5. Export Schedules CSV
  const handleExportSchedules = () => {
    const headers = ['Schedule ID', 'Contributor Name', 'Installment #', 'Amount (TZS)', 'Amount Paid (TZS)', 'Remaining (TZS)', 'Due Date', 'Frequency', 'Status', 'Notes'];
    const rows = schedules.map(s => {
      const c = contributors.find(contrib => contrib.id === s.contributorId);
      return [
        s.id,
        c ? c.fullName : 'Unknown Contributor',
        s.installmentNumber,
        s.amount,
        s.amountPaid || 0,
        s.remainingAmount || 0,
        s.dueDate,
        s.frequency,
        s.status,
        s.notes || ''
      ];
    });

    triggerDownload('schedules_export.csv', headers, rows);
  };

  // 6. Generic downloader function
  const triggerDownload = (filename: string, headers: string[], rows: any[][]) => {
    const csvContent = [
      headers.map(escapeCSV).join(','),
      ...rows.map(row => row.map(escapeCSV).join(','))
    ].join('\n');

    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${currentEvent ? currentEvent.name.toLowerCase().replace(/\s+/g, '_') : 'event'}_${filename}`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-8 animate-slide-up">
      <div className="flex flex-col">
        <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground">{t('settings')}</h2>
        <p className="text-xs sm:text-sm text-muted mt-1">Manage project data and generate spreadsheet exports</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        
        {/* Active Event Details & Summary Stats Card */}
        <div className="lg:col-span-2 flex flex-col gap-6 p-6 sm:p-8 bg-surface border border-border rounded-2xl shadow-sm">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-secondary/15 border border-secondary/20">
              <Database className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <span className="text-xs uppercase text-muted tracking-wider font-semibold">Active Event Workspace</span>
              <h3 className="font-heading text-lg font-bold text-foreground truncate max-w-sm">
                {currentEvent ? currentEvent.name : 'No Active Event'}
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-background border border-border rounded-xl flex items-center gap-4">
              <div className="p-2 bg-info/10 text-info rounded-lg shrink-0">
                <Users size={20} />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs text-muted font-medium truncate">Total Members</span>
                <span className="font-heading text-xl font-bold text-foreground">{totalContributorsCount}</span>
              </div>
            </div>

            <div className="p-4 bg-background border border-border rounded-xl flex items-center gap-4">
              <div className="p-2 bg-success/10 text-success rounded-lg shrink-0">
                <Receipt size={20} />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs text-muted font-medium truncate">Payments Logged</span>
                <span className="font-heading text-xl font-bold text-foreground">{totalPaymentsCount}</span>
              </div>
            </div>

            <div className="p-4 bg-background border border-border rounded-xl flex items-center gap-4">
              <div className="p-2 bg-warning/10 text-warning rounded-lg shrink-0">
                <CalendarRange size={20} />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs text-muted font-medium truncate">Schedule Slots</span>
                <span className="font-heading text-xl font-bold text-foreground">{totalSchedulesCount}</span>
              </div>
            </div>
          </div>

          {/* Financial summary blocks */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-border pt-6">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted font-semibold uppercase tracking-wider">Total Scheduled</span>
              <span className="font-heading text-2xl font-bold text-foreground">{totalScheduledSum.toLocaleString()} <span className="text-xs text-muted">TZS</span></span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted font-semibold uppercase tracking-wider">Total Collected</span>
              <span className="font-heading text-2xl font-bold text-secondary">{totalPaidSum.toLocaleString()} <span className="text-xs text-muted">TZS</span></span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted font-semibold uppercase tracking-wider">Outstanding Dues</span>
              <span className="font-heading text-2xl font-bold text-danger">{totalRemainingBalance.toLocaleString()} <span className="text-xs text-muted">TZS</span></span>
            </div>
          </div>
        </div>

        {/* Exports Panel */}
        <div className="flex flex-col gap-6 p-6 sm:p-8 bg-surface border border-border rounded-2xl shadow-sm">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-secondary/15 border border-secondary/20">
              <Landmark className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <span className="text-xs uppercase text-muted tracking-wider font-semibold">Report Ledger</span>
              <h3 className="font-heading text-lg font-bold text-foreground">{t('export_data')}</h3>
            </div>
          </div>

          <p className="text-sm text-muted leading-relaxed">
            Download CSV spreadsheets directly to your local storage. You can share these spreadsheets via WhatsApp or edit them in Microsoft Excel or Google Sheets.
          </p>

          <div className="flex flex-col gap-3 mt-2">
            <Button
              variant="outline"
              onClick={handleExportContributors}
              className="w-full flex items-center justify-between gap-3 px-4 py-3 cursor-pointer hover:bg-secondary/5 hover:border-secondary hover:text-secondary group transition-all"
            >
              <span className="font-semibold text-sm">{t('export_contributors')}</span>
              <Download size={16} className="text-muted group-hover:text-secondary group-hover:translate-y-0.5 transition-transform" />
            </Button>

            <Button
              variant="outline"
              onClick={handleExportPayments}
              className="w-full flex items-center justify-between gap-3 px-4 py-3 cursor-pointer hover:bg-secondary/5 hover:border-secondary hover:text-secondary group transition-all"
            >
              <span className="font-semibold text-sm">{t('export_payments')}</span>
              <Download size={16} className="text-muted group-hover:text-secondary group-hover:translate-y-0.5 transition-transform" />
            </Button>

            <Button
              variant="outline"
              onClick={handleExportSchedules}
              className="w-full flex items-center justify-between gap-3 px-4 py-3 cursor-pointer hover:bg-secondary/5 hover:border-secondary hover:text-secondary group transition-all"
            >
              <span className="font-semibold text-sm">{t('export_schedules')}</span>
              <Download size={16} className="text-muted group-hover:text-secondary group-hover:translate-y-0.5 transition-transform" />
            </Button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="lg:col-span-3 flex flex-col gap-6 p-6 sm:p-8 bg-surface border border-danger/20 rounded-2xl shadow-sm mt-4">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-danger/10 border border-danger/20">
              <Database className="w-5 h-5 text-danger" />
            </div>
            <div>
              <span className="text-xs uppercase text-danger tracking-wider font-semibold">Danger Zone</span>
              <h3 className="font-heading text-lg font-bold text-foreground">Reset Workspace</h3>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-sm text-muted">
              If you seeded demo data and want to start fresh, you can instantly wipe all dummy contributors, schedules, and payments.
            </p>
            <Button
              variant="outline"
              onClick={async () => {
                if (window.confirm("Are you sure you want to delete all demo data? This cannot be undone.")) {
                  await clearDemoData();
                  alert("Demo data has been cleared!");
                }
              }}
              className="w-full sm:w-auto shrink-0 border-danger/50 text-danger hover:bg-danger hover:text-white transition-colors"
            >
              Clear Demo Data
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
