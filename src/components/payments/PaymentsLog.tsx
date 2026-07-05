import React, { useState } from 'react';
import { useJumuika } from '../../context/JumuikaContext';
import { Search, User, Receipt, FileDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/Button';

export const PaymentsLog: React.FC = () => {
  const { payments, contributors, events, currentEventId } = useJumuika();
  const [searchQuery, setSearchQuery] = useState('');
  const [timePeriod, setTimePeriod] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const { t, i18n } = useTranslation();

  // Find active event name
  const activeEvent = events.find(e => e.id === currentEventId);
  const activeEventName = activeEvent ? activeEvent.name : 'Jumuika';

  // Helper to map contributor name
  const getContributorName = (contributorId: string) => {
    const c = contributors.find(contrib => contrib.id === contributorId);
    return c ? c.fullName : t('calendar_view.unknown_contributor');
  };

  // Helper to parse payment creation date
  const getPaymentDateObject = (p: any) => {
    if (p.createdAt?.seconds) {
      return new Date(p.createdAt.seconds * 1000);
    }
    if (p.createdAt instanceof Date) {
      return p.createdAt;
    }
    if (typeof p.createdAt === 'string') {
      return new Date(p.createdAt);
    }
    return new Date();
  };

  // Time & Search filter
  const filteredPayments = payments.filter(p => {
    // 1. Time Filter
    const pDate = getPaymentDateObject(p);
    const now = new Date();
    
    if (timePeriod === 'today') {
      const isSameDay = pDate.getDate() === now.getDate() &&
                         pDate.getMonth() === now.getMonth() &&
                         pDate.getFullYear() === now.getFullYear();
      if (!isSameDay) return false;
    } else if (timePeriod === 'week') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(now.getDate() - 7);
      if (pDate < oneWeekAgo) return false;
    } else if (timePeriod === 'month') {
      const isSameMonth = pDate.getMonth() === now.getMonth() &&
                           pDate.getFullYear() === now.getFullYear();
      if (!isSameMonth) return false;
    } else if (timePeriod === 'custom') {
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (pDate < start) return false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (pDate > end) return false;
      }
    }

    // 2. Search Text Filter
    const contributorName = getContributorName(p.contributorId).toLowerCase();
    const method = p.paymentMethod.toLowerCase();
    const recorder = p.recordedBy.toLowerCase();
    const note = (p.notes || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    
    return contributorName.includes(query) || 
           method.includes(query) || 
           recorder.includes(query) || 
           note.includes(query);
  });

  const handleDownloadPDF = () => {
    const totalCollected = filteredPayments.reduce((sum, curr) => sum + curr.amount, 0);
    const dateStr = new Date().toLocaleString(i18n.language);
    
    let activeTimeLabel = t('payments_page.time.all');
    if (timePeriod === 'today') activeTimeLabel = t('payments_page.time.today');
    else if (timePeriod === 'week') activeTimeLabel = t('payments_page.time.week');
    else if (timePeriod === 'month') activeTimeLabel = t('payments_page.time.month');
    else if (timePeriod === 'custom') {
      activeTimeLabel = `${t('payments_page.date_input.start')}: ${startDate || '—'} / ${t('payments_page.date_input.end')}: ${endDate || '—'}`;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Pop-up blocker is preventing PDF generation. Please allow popups for this site.');
      return;
    }

    const rowsHtml = filteredPayments.map(p => {
      const pDate = p.createdAt?.seconds 
        ? new Date(p.createdAt.seconds * 1000).toLocaleString(i18n.language)
        : t('calendar_view.today');
      return `
        <tr>
          <td>${getContributorName(p.contributorId)}</td>
          <td class="text-right font-bold">+${p.amount.toLocaleString()} TZS</td>
          <td class="uppercase font-semibold text-center"><span class="badge">${p.paymentMethod}</span></td>
          <td>${p.recordedBy}</td>
          <td class="nowrap">${pDate}</td>
          <td class="italic">${p.notes || '—'}</td>
        </tr>
      `;
    }).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${t('payments_page.title')}</title>
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
            }
            .summary-label {
              font-size: 11px;
              font-weight: 700;
              color: #64748b;
              text-transform: uppercase;
              letter-spacing: 0.05em;
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
                background-color: #f1f5f9 !important;
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
              <div class="doc-type">Payment Ledger Statement</div>
            </div>
            <div class="meta-block">
              <div>Generated: <strong>${dateStr}</strong></div>
              <div>Workspace: <strong>${activeEventName}</strong></div>
            </div>
          </div>
          
          <div class="summary-section">
            <div class="summary-card">
              <div class="summary-label">Reporting Event</div>
              <div class="summary-value" title="${activeEventName}">${activeEventName}</div>
            </div>
            <div class="summary-card">
              <div class="summary-label">Selected Period</div>
              <div class="summary-value" title="${activeTimeLabel}">${activeTimeLabel}</div>
            </div>
            <div class="summary-card">
              <div class="summary-label">Total Collections</div>
              <div class="summary-value highlight">+${totalCollected.toLocaleString()} TZS</div>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Contributor</th>
                <th class="text-right">Amount</th>
                <th class="text-center">Method</th>
                <th>Recorded By</th>
                <th>Date & Time</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml || '<tr><td colspan="6" class="text-center" style="color: #94a3b8; padding: 24px;">No transactions recorded.</td></tr>'}
            </tbody>
          </table>
          
          <div class="footer">
            Generated automatically by Jumuika Scheduled Contribution Engine.
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

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <div className="flex flex-col">
        <h2 className="font-heading text-2xl xs:text-3xl lg:text-4xl font-extrabold text-foreground mb-2">{t('payments_page.title')}</h2>
        <p className="text-xs sm:text-sm text-muted">{t('payments_page.subtitle')}</p>
      </div>

      <div className="bg-surface border border-border rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm">
        {/* Time Period Selector Tabs */}
        <div className="flex flex-wrap gap-2 mb-5 pb-4 border-b border-border/50">
          {[
            { id: 'all', label: t('payments_page.time.all') },
            { id: 'today', label: t('payments_page.time.today') },
            { id: 'week', label: t('payments_page.time.week') },
            { id: 'month', label: t('payments_page.time.month') },
            { id: 'custom', label: t('payments_page.time.custom') }
          ].map((period) => (
            <button
              key={period.id}
              onClick={() => setTimePeriod(period.id as any)}
              className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                timePeriod === period.id
                  ? 'bg-secondary text-slate-900 border-secondary shadow-sm shadow-secondary/20 font-bold'
                  : 'bg-foreground/5 text-muted border-border hover:bg-foreground/10 hover:text-foreground'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>

        {/* Custom Date Inputs (when 'custom' is active) */}
        {timePeriod === 'custom' && (
          <div className="flex flex-wrap gap-3 items-center mb-5 p-3.5 bg-foreground/[0.02] border border-border rounded-xl">
            <div className="flex flex-col gap-1.5 min-w-[140px] flex-1">
              <label className="text-[10px] uppercase font-bold text-muted tracking-wider">{t('payments_page.date_input.start')}</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="py-1.5 px-3 bg-foreground/5 border border-border rounded-lg text-foreground text-xs focus:outline-none focus:border-secondary animate-fade-in"
              />
            </div>
            <div className="flex flex-col gap-1.5 min-w-[140px] flex-1">
              <label className="text-[10px] uppercase font-bold text-muted tracking-wider">{t('payments_page.date_input.end')}</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="py-1.5 px-3 bg-foreground/5 border border-border rounded-lg text-foreground text-xs focus:outline-none focus:border-secondary animate-fade-in"
              />
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-grow min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted w-4 h-4" />
            <input
              type="text"
              className="w-full py-2.5 pl-10 pr-4 bg-foreground/5 border border-border rounded-md text-foreground font-sans text-sm transition-all duration-fast focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
              placeholder={t('payments_page.search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            onClick={handleDownloadPDF}
            variant="outline"
            className="gap-2 justify-center border border-border hover:border-secondary/50 py-2.5 shrink-0 cursor-pointer"
            title="Download PDF Report"
          >
            <FileDown size={16} className="text-secondary" />
            <span>{t('payments_page.download_pdf')}</span>
          </Button>
        </div>

        {filteredPayments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4 text-center gap-4 text-muted border-2 border-dashed border-border rounded-xl bg-foreground/5">
            <Receipt className="w-10 h-10 sm:w-12 sm:h-12 text-border" />
            <p className="font-medium text-sm sm:text-base">{t('payments_page.no_payments')}</p>
          </div>
        ) : (
          <>
            {/* Mobile list layout (< md) */}
            <div className="flex flex-col gap-3 md:hidden">
              {filteredPayments.map((p) => {
                const paymentDate = p.createdAt?.seconds 
                  ? new Date(p.createdAt.seconds * 1000).toLocaleString(i18n.language)
                  : t('calendar_view.today');

                return (
                  <div 
                    key={p.id}
                    className="flex flex-col gap-3 p-4 bg-foreground/[0.02] border border-border rounded-xl hover:bg-foreground/5 hover:border-foreground/20 transition-all"
                  >
                    {/* Top Row */}
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <User size={16} className="text-secondary shrink-0" />
                        <span className="font-bold text-sm text-foreground truncate">{getContributorName(p.contributorId)}</span>
                      </div>
                      <div className="font-bold text-sm text-success shrink-0 whitespace-nowrap">
                        +{p.amount.toLocaleString()} TZS
                      </div>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-2 gap-3 text-xs py-2 border-y border-border/50">
                      <div className="min-w-0">
                        <p className="text-[9px] uppercase tracking-wider text-muted font-semibold truncate">{t('payments_page.method')}</p>
                        <span className="inline-block mt-1 font-semibold px-2 py-0.5 bg-foreground/5 text-foreground rounded text-[10px] uppercase tracking-wider border border-border truncate">
                          {p.paymentMethod}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] uppercase tracking-wider text-muted font-semibold truncate">{t('payments_page.recorded_by')}</p>
                        <p className="text-foreground font-medium mt-1 truncate">{p.recordedBy}</p>
                      </div>
                    </div>

                    {/* Bottom Row */}
                    <div className="flex flex-col gap-1.5 text-xs text-muted">
                      <span>{paymentDate}</span>
                      {p.notes && (
                        <p className="text-muted italic border-l-2 border-secondary/20 pl-2 py-0.5 mt-0.5 break-words">
                          {p.notes}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table View (>= md) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th className="p-5 text-xs uppercase text-muted tracking-widest font-bold border-b border-border">{t('contributors_page.name')}</th>
                    <th className="p-5 text-xs uppercase text-muted tracking-widest font-bold border-b border-border text-right">{t('payments_page.amount')}</th>
                    <th className="p-5 text-xs uppercase text-muted tracking-widest font-bold border-b border-border">{t('payments_page.method')}</th>
                    <th className="p-5 text-xs uppercase text-muted tracking-widest font-bold border-b border-border">{t('payments_page.recorded_by')}</th>
                    <th className="p-5 text-xs uppercase text-muted tracking-widest font-bold border-b border-border">{t('payments_page.date_time')}</th>
                    <th className="p-5 text-xs uppercase text-muted tracking-widest font-bold border-b border-border">{t('payments_page.notes')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((p) => {
                    const paymentDate = p.createdAt?.seconds 
                      ? new Date(p.createdAt.seconds * 1000).toLocaleString(i18n.language)
                      : t('calendar_view.today');

                    return (
                      <tr key={p.id} className="border-b border-border last:border-b-0 hover:bg-foreground/5 transition-colors duration-fast">
                        <td className="p-5">
                          <div className="flex items-center gap-3 font-semibold text-foreground">
                            <User size={16} className="text-secondary" />
                            {getContributorName(p.contributorId)}
                          </div>
                        </td>
                        <td className="p-5 font-bold text-success text-right whitespace-nowrap">
                          +{p.amount.toLocaleString()} TZS
                        </td>
                        <td className="p-5">
                          <span className="text-xs font-semibold px-2.5 py-1 bg-foreground/5 text-foreground rounded-md uppercase tracking-wider border border-border">
                            {p.paymentMethod}
                          </span>
                        </td>
                        <td className="p-5 text-sm text-foreground font-medium">{p.recordedBy}</td>
                        <td className="p-5 text-sm text-muted whitespace-nowrap">{paymentDate}</td>
                        <td className="p-5 text-sm text-muted italic max-w-[250px] break-words">
                          {p.notes || '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
