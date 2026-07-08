import React from 'react';
import { useLocoo } from '../../context/LocooContext';
import { useTranslation } from 'react-i18next';
import { Database, Users, Receipt, CalendarRange, Landmark, FileDown } from 'lucide-react';
import { Button } from '../ui/Button';

export const Settings: React.FC = () => {
  const { events, currentEventId, contributors, schedules, payments, clearDemoData } = useLocoo();
  const { t, i18n } = useTranslation();

  const currentEvent = events.find(e => e.id === currentEventId);

  // 1. Compute summary stats for the active event
  const totalContributorsCount = contributors.length;
  const totalScheduledSum = contributors.reduce((acc, curr) => acc + (curr.totalScheduled || 0), 0);
  const totalPaidSum = contributors.reduce((acc, curr) => acc + (curr.totalPaid || 0), 0);
  const totalRemainingBalance = totalScheduledSum - totalPaidSum;
  const totalPaymentsCount = payments.length;
  const totalSchedulesCount = schedules.length;

  // 2. HTML PDF print window helper
  const openPrintWindow = (title: string, docType: string, summaryCards: { label: string, value: string, highlight?: boolean }[], tableHeaders: string[], rowsHtml: string) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Pop-up blocker is preventing PDF generation. Please allow popups for this site.');
      return;
    }

    const dateStr = new Date().toLocaleString(i18n.language);
    const activeEventName = currentEvent ? currentEvent.name : 'Locoo';

    const cardsHtml = summaryCards.map(c => `
      <div class="summary-card">
        <div class="summary-label">${c.label}</div>
        <div class="summary-value ${c.highlight ? 'highlight' : ''}" title="${c.value}">${c.value}</div>
      </div>
    `).join('');

    const headersHtml = tableHeaders.map(h => `<th>${h}</th>`).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
          <style>
            body {
              font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
              color: #0f172a;
              margin: 0;
              padding: 40px;
              line-height: 1.5;
              background-color: #ffffff;
            }
            .accent-bar {
              height: 6px;
              background: linear-gradient(90deg, #14b8a6, #10b981);
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              border-bottom: 1px solid #e2e8f0;
              padding-bottom: 24px;
              margin-bottom: 24px;
              margin-top: 10px;
            }
            .brand-title {
              font-family: 'Outfit', sans-serif;
              font-size: 26px;
              font-weight: 800;
              color: #0f172a;
              letter-spacing: -0.02em;
              margin: 0;
            }
            .brand-title span {
              color: #14b8a6;
            }
            .doc-type {
              font-family: 'Outfit', sans-serif;
              font-size: 14px;
              font-weight: 600;
              color: #64748b;
              text-transform: uppercase;
              letter-spacing: 0.1em;
              margin-top: 4px;
            }
            .meta-block {
              text-align: right;
              font-size: 13px;
              color: #475569;
            }
            .meta-block strong {
              color: #0f172a;
            }
            .summary-section {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 16px;
              margin-bottom: 32px;
            }
            .summary-card {
              background-color: #f8fafc;
              border: 1px solid #f1f5f9;
              border-radius: 12px;
              padding: 18px;
              box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.02);
              min-width: 0;
            }
            .summary-label {
              font-size: 11px;
              font-weight: 700;
              color: #64748b;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            .summary-value {
              font-family: 'Outfit', sans-serif;
              font-size: 16px;
              font-weight: 700;
              color: #0f172a;
              margin-top: 6px;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            .summary-value.highlight {
              color: #14b8a6;
              font-size: 20px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 12px;
            }
            th {
              font-family: 'Outfit', sans-serif;
              font-size: 11px;
              font-weight: 700;
              color: #475569;
              text-transform: uppercase;
              letter-spacing: 0.08em;
              background-color: #f8fafc;
              border-bottom: 2px solid #cbd5e1;
              padding: 14px 16px;
              text-align: left;
            }
            td {
              padding: 14px 16px;
              font-size: 13px;
              border-bottom: 1px solid #f1f5f9;
              color: #334155;
            }
            tr:last-child td {
              border-bottom: none;
            }
            tr:nth-child(even) {
              background-color: #fafafa;
            }
            .text-right {
              text-align: right;
            }
            .text-center {
              text-align: center;
            }
            .font-bold {
              font-weight: 700;
            }
            .font-semibold {
              font-weight: 600;
            }
            .uppercase {
              text-transform: uppercase;
            }
            .italic {
              font-style: italic;
            }
            .nowrap {
              white-space: nowrap;
            }
            .badge {
              display: inline-block;
              font-size: 10px;
              font-weight: 700;
              padding: 2px 8px;
              border-radius: 4px;
              text-transform: uppercase;
              letter-spacing: 0.04em;
              background-color: #f1f5f9;
              border: 1px solid #cbd5e1;
              color: #475569;
            }
            .badge.badge-success {
              background-color: rgba(16, 185, 129, 0.1);
              border-color: rgba(16, 185, 129, 0.2);
              color: #10b981;
            }
            .badge.badge-info {
              background-color: rgba(59, 130, 246, 0.1);
              border-color: rgba(59, 130, 246, 0.2);
              color: #3b82f6;
            }
            .badge.badge-warning {
              background-color: rgba(245, 158, 11, 0.1);
              border-color: rgba(245, 158, 11, 0.2);
              color: #f59e0b;
            }
            .badge.badge-danger {
              background-color: rgba(239, 68, 68, 0.1);
              border-color: rgba(239, 68, 68, 0.2);
              color: #ef4444;
            }
            .footer {
              margin-top: 50px;
              border-top: 1px solid #f1f5f9;
              padding-top: 16px;
              text-align: center;
              font-size: 11px;
              color: #94a3b8;
            }
            @media print {
              body {
                padding: 20px;
              }
              .accent-bar {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .summary-card {
                background-color: #f8fafc !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              th {
                background-color: #f8fafc !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .badge {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          <div class="accent-bar"></div>
          
          <div class="header">
            <div>
              <h1 class="brand-title">JUMUI<span>IKA</span></h1>
              <div class="doc-type">${docType}</div>
            </div>
            <div class="meta-block">
              <div>Generated: <strong>${dateStr}</strong></div>
              <div>Workspace: <strong>${activeEventName}</strong></div>
            </div>
          </div>
          
          <div class="summary-section">
            ${cardsHtml}
          </div>
          
          <table>
            <thead>
              <tr>
                ${headersHtml}
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
          
          <div class="footer">
            Generated automatically by Locoo - Locoo Contributions Suite.
          </div>
          
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // 3. Export Contributors PDF
  const handleExportContributors = () => {
    const docTitle = `${currentEvent ? currentEvent.name : 'Locoo'} - Members Ledger`;
    const docType = 'Members Ledger Statement';
    
    const summaryCards = [
      { label: 'Total Members', value: `${totalContributorsCount}` },
      { label: 'Total Collected', value: `${totalPaidSum.toLocaleString()} TZS` },
      { label: 'Outstanding Balance', value: `${totalRemainingBalance.toLocaleString()} TZS`, highlight: true }
    ];

    const tableHeaders = ['Contributor Name', 'Phone Number', 'Total Scheduled', 'Total Paid', 'Remaining Dues', 'Status'];

    const rowsHtml = contributors.length === 0 
      ? '<tr><td colspan="6" class="text-center" style="color: #94a3b8; padding: 24px;">No members registered.</td></tr>'
      : contributors.map(c => {
          const remaining = (c.totalScheduled || 0) - (c.totalPaid || 0);
          const statusText = remaining <= 0 ? 'Paid' : 'Pending';
          const badgeClass = remaining <= 0 ? 'badge-success' : 'badge-warning';

          return `
            <tr>
              <td><div class="font-semibold">${c.fullName}</div></td>
              <td>${c.phone || '—'}</td>
              <td class="text-right font-semibold">${(c.totalScheduled || 0).toLocaleString()} TZS</td>
              <td class="text-right font-semibold text-success">${(c.totalPaid || 0).toLocaleString()} TZS</td>
              <td class="text-right font-bold ${remaining > 0 ? 'text-danger' : 'text-slate-600'}">${remaining.toLocaleString()} TZS</td>
              <td class="text-center"><span class="badge ${badgeClass}">${statusText}</span></td>
            </tr>
          `;
        }).join('');

    openPrintWindow(docTitle, docType, summaryCards, tableHeaders, rowsHtml);
  };

  // 4. Export Payments PDF
  const handleExportPayments = () => {
    const docTitle = `${currentEvent ? currentEvent.name : 'Locoo'} - Payments Log`;
    const docType = 'Payments Ledger Statement';
    
    const summaryCards = [
      { label: 'Total Transactions', value: `${totalPaymentsCount}` },
      { label: 'Export Date', value: new Date().toLocaleDateString(i18n.language) },
      { label: 'Total Collected', value: `${totalPaidSum.toLocaleString()} TZS`, highlight: true }
    ];

    const tableHeaders = ['Contributor Name', 'Amount', 'Payment Method', 'Recorded By', 'Date & Time', 'Notes'];

    const rowsHtml = payments.length === 0 
      ? '<tr><td colspan="6" class="text-center" style="color: #94a3b8; padding: 24px;">No payments recorded yet.</td></tr>'
      : payments.map(p => {
          const c = contributors.find(contrib => contrib.id === p.contributorId);
          const name = c ? c.fullName : 'Unknown Contributor';
          const pDate = p.createdAt?.seconds 
            ? new Date(p.createdAt.seconds * 1000).toLocaleString(i18n.language)
            : t('calendar_view.today');

          return `
            <tr>
              <td><div class="font-semibold">${name}</div></td>
              <td class="text-right font-bold text-success">+${p.amount.toLocaleString()} TZS</td>
              <td class="text-center"><span class="badge">${p.paymentMethod}</span></td>
              <td>${p.recordedBy}</td>
              <td class="nowrap">${pDate}</td>
              <td class="italic">${p.notes || '—'}</td>
            </tr>
          `;
        }).join('');

    openPrintWindow(docTitle, docType, summaryCards, tableHeaders, rowsHtml);
  };

  // 5. Export Schedules PDF
  const handleExportSchedules = () => {
    const docTitle = `${currentEvent ? currentEvent.name : 'Locoo'} - Contribution Schedules`;
    const docType = 'Contribution Schedules Statement';

    const totalRemainingSchedulesSum = schedules.reduce((sum, curr) => sum + (curr.remainingAmount || 0), 0);
    
    const summaryCards = [
      { label: 'Schedule Slots', value: `${totalSchedulesCount}` },
      { label: 'Completed Slots', value: `${schedules.filter(s => s.status === 'Completed').length}` },
      { label: 'Remaining Balance', value: `${totalRemainingSchedulesSum.toLocaleString()} TZS`, highlight: true }
    ];

    const tableHeaders = ['Contributor Name', 'Installment', 'Scheduled Amount', 'Paid Amount', 'Remaining Amount', 'Due Date', 'Status'];

    const rowsHtml = schedules.length === 0 
      ? '<tr><td colspan="7" class="text-center" style="color: #94a3b8; padding: 24px;">No contribution plans scheduled.</td></tr>'
      : schedules.map(s => {
          const c = contributors.find(contrib => contrib.id === s.contributorId);
          const name = c ? c.fullName : 'Unknown Contributor';
          const statusColors: Record<string, string> = {
            'Completed': 'badge-success',
            'Partially Paid': 'badge-info',
            'Due Today': 'badge-warning',
            'Overdue': 'badge-danger',
            'Upcoming': ''
          };
          const badgeStyle = statusColors[s.status] || '';

          return `
            <tr>
              <td><div class="font-semibold">${name}</div></td>
              <td class="text-center font-semibold">#${s.installmentNumber}</td>
              <td class="text-right font-semibold">${s.amount.toLocaleString()} TZS</td>
              <td class="text-right font-semibold text-success">${(s.amountPaid || 0).toLocaleString()} TZS</td>
              <td class="text-right font-bold ${(s.remainingAmount || 0) > 0 ? 'text-danger' : 'text-slate-600'}">${(s.remainingAmount || 0).toLocaleString()} TZS</td>
              <td class="nowrap font-medium">${s.dueDate}</td>
              <td class="text-center"><span class="badge ${badgeStyle}">${s.status}</span></td>
            </tr>
          `;
        }).join('');

    openPrintWindow(docTitle, docType, summaryCards, tableHeaders, rowsHtml);
  };

  return (
    <div className="flex flex-col gap-8 animate-slide-up">
      <div className="flex flex-col">
        <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground">{t('settings')}</h2>
        <p className="text-xs sm:text-sm text-muted mt-1">{t('settings_page.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        
        {/* Active Event Details & Summary Stats Card */}
        <div className="lg:col-span-2 flex flex-col gap-6 p-4 sm:p-6 md:p-8 bg-surface border border-border rounded-2xl shadow-sm">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-secondary/15 border border-secondary/20">
              <Database className="w-5 h-5 text-secondary" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs uppercase text-muted tracking-wider font-semibold block">{t('settings_page.active_event_workspace')}</span>
              <h3 className="font-heading text-lg font-bold text-foreground truncate max-w-[200px] xs:max-w-xs sm:max-w-md">
                {currentEvent ? currentEvent.name : t('settings_page.no_active_event')}
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
            <div className="p-3.5 sm:p-4 bg-background border border-border rounded-xl flex items-center gap-3.5 min-w-0">
              <div className="p-2 bg-info/10 text-info rounded-lg shrink-0">
                <Users size={20} />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs text-muted font-medium truncate">{t('settings_page.total_members')}</span>
                <span className="font-heading text-xl font-bold text-foreground">{totalContributorsCount}</span>
              </div>
            </div>

            <div className="p-3.5 sm:p-4 bg-background border border-border rounded-xl flex items-center gap-3.5 min-w-0">
              <div className="p-2 bg-success/10 text-success rounded-lg shrink-0">
                <Receipt size={20} />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs text-muted font-medium truncate">{t('settings_page.payments_logged')}</span>
                <span className="font-heading text-xl font-bold text-foreground">{totalPaymentsCount}</span>
              </div>
            </div>

            <div className="p-3.5 sm:p-4 bg-background border border-border rounded-xl flex items-center gap-3.5 min-w-0">
              <div className="p-2 bg-warning/10 text-warning rounded-lg shrink-0">
                <CalendarRange size={20} />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs text-muted font-medium truncate">{t('settings_page.schedule_slots')}</span>
                <span className="font-heading text-xl font-bold text-foreground">{totalSchedulesCount}</span>
              </div>
            </div>
          </div>

          {/* Financial summary blocks */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-4 border-t border-border pt-5 sm:pt-6">
            <div className="flex flex-col gap-1 border-b border-border/40 pb-4 sm:border-b-0 sm:pb-0">
              <span className="text-xs text-muted font-semibold uppercase tracking-wider">{t('settings_page.total_scheduled')}</span>
              <span className="font-heading text-2xl font-bold text-foreground">{totalScheduledSum.toLocaleString()} <span className="text-xs text-muted">TZS</span></span>
            </div>
            <div className="flex flex-col gap-1 border-b border-border/40 pb-4 sm:border-b-0 sm:pb-0">
              <span className="text-xs text-muted font-semibold uppercase tracking-wider">{t('settings_page.total_collected')}</span>
              <span className="font-heading text-2xl font-bold text-secondary">{totalPaidSum.toLocaleString()} <span className="text-xs text-muted">TZS</span></span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted font-semibold uppercase tracking-wider">{t('settings_page.outstanding_dues')}</span>
              <span className="font-heading text-2xl font-bold text-danger">{totalRemainingBalance.toLocaleString()} <span className="text-xs text-muted">TZS</span></span>
            </div>
          </div>
        </div>

        {/* Exports Panel */}
        <div className="flex flex-col gap-6 p-4 sm:p-6 md:p-8 bg-surface border border-border rounded-2xl shadow-sm">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-secondary/15 border border-secondary/20">
              <Landmark className="w-5 h-5 text-secondary" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs uppercase text-muted tracking-wider font-semibold block">{t('settings_page.report_ledger')}</span>
              <h3 className="font-heading text-lg font-bold text-foreground truncate">{t('export_data')}</h3>
            </div>
          </div>

          <p className="text-sm text-muted leading-relaxed">
            {t('settings_page.download_desc')}
          </p>

          <div className="flex flex-col gap-3 mt-2">
            <Button
              variant="outline"
              onClick={handleExportContributors}
              className="w-full flex items-center justify-between gap-3 px-4 py-3 cursor-pointer hover:bg-secondary/5 hover:border-secondary hover:text-secondary group transition-all"
            >
              <span className="font-semibold text-sm">{t('export_contributors')}</span>
              <FileDown size={16} className="text-muted group-hover:text-secondary group-hover:translate-y-0.5 transition-transform" />
            </Button>

            <Button
              variant="outline"
              onClick={handleExportPayments}
              className="w-full flex items-center justify-between gap-3 px-4 py-3 cursor-pointer hover:bg-secondary/5 hover:border-secondary hover:text-secondary group transition-all"
            >
              <span className="font-semibold text-sm">{t('export_payments')}</span>
              <FileDown size={16} className="text-muted group-hover:text-secondary group-hover:translate-y-0.5 transition-transform" />
            </Button>

            <Button
              variant="outline"
              onClick={handleExportSchedules}
              className="w-full flex items-center justify-between gap-3 px-4 py-3 cursor-pointer hover:bg-secondary/5 hover:border-secondary hover:text-secondary group transition-all"
            >
              <span className="font-semibold text-sm">{t('export_schedules')}</span>
              <FileDown size={16} className="text-muted group-hover:text-secondary group-hover:translate-y-0.5 transition-transform" />
            </Button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="lg:col-span-3 flex flex-col gap-6 p-4 sm:p-6 md:p-8 bg-surface border border-danger/20 rounded-2xl shadow-sm mt-4">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-danger/10 border border-danger/20">
              <Database className="w-5 h-5 text-danger" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs uppercase text-danger tracking-wider font-semibold block">{t('settings_page.danger_zone')}</span>
              <h3 className="font-heading text-lg font-bold text-foreground">{t('settings_page.reset_workspace')}</h3>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-sm text-muted">
              {t('settings_page.clear_demo_desc')}
            </p>
            <Button
              variant="outline"
              onClick={async () => {
                if (window.confirm(t('settings_page.clear_demo_confirm'))) {
                  await clearDemoData();
                  alert(t('settings_page.clear_demo_success'));
                }
              }}
              className="w-full sm:w-auto shrink-0 border-danger/50 text-danger hover:bg-danger hover:text-white transition-colors"
            >
              {t('settings_page.clear_demo_btn')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
