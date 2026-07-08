import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  setDoc,
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  writeBatch,
  serverTimestamp,
  Timestamp,
  deleteDoc,
  runTransaction,
  getDocs
} from 'firebase/firestore';
import { db } from '../services/firebase';
import type { Contributor, Schedule, Payment, Event, Payout, Loan } from '../types';
import { calculateStatus, generateInstallmentDates } from '../utils/schedules';

// Re-export type definitions for backwards compatibility and ease of import
export type { Contributor, Schedule, Payment, Event, Payout, Loan };
export { calculateStatus, generateInstallmentDates };

interface LocooContextType {
  currentEventId: string;
  setCurrentEventId: (id: string) => void;
  events: Event[];
  contributors: Contributor[];
  schedules: Schedule[];
  payments: Payment[];
  payouts: Payout[];
  loans: Loan[];
  loansError: string | null;
  loading: boolean;
  
  // Actions
  addEvent: (name: string, targetAmount?: number, eventType?: 'harambee' | 'merry-go-round' | 'table-banking') => Promise<string>;
  addContributor: (fullName: string, phone?: string, notes?: string, expectedAmount?: number) => Promise<string>;
  addSchedule: (
    contributorId: string, 
    type: 'one-time' | 'installment',
    amountOrTarget: number,
    dueDateOrStartDate: string,
    installmentsCount?: number,
    frequency?: string,
    notes?: string,
    replaceAmount?: number,
    schedulesToDelete?: string[]
  ) => Promise<void>;
  editSchedule: (scheduleId: string, amount: number, dueDate: string) => Promise<void>;
  deleteSchedule: (scheduleId: string) => Promise<void>;
  recordPayment: (
    contributorId: string,
    scheduleId: string | null,
    amount: number,
    paymentMethod: string,
    recordedBy: string,
    notes?: string
  ) => Promise<void>;
  addPayout: (contributorId: string, amount: number, payoutDate: string, notes?: string) => Promise<string>;
  deletePayout: (payoutId: string) => Promise<void>;
  setRotationOrder: (order: string[]) => Promise<void>;
  bulkScheduleAll: (
    type: 'one-time' | 'installment',
    amount: number,
    dueDateOrStartDate: string,
    frequency?: string,
    installmentsCount?: number,
    notes?: string
  ) => Promise<number>;
  clearDemoData: () => Promise<void>;
  // Table Banking loan actions
  issueLoan: (
    contributorId: string,
    principalAmount: number,
    interestRate: number,
    disbursementDate: string,
    dueDate: string,
    notes?: string
  ) => Promise<string>;
  recordLoanRepayment: (loanId: string, amount: number, paymentMethod: string) => Promise<void>;
  deleteLoan: (loanId: string) => Promise<void>;
}

const LocooContext = createContext<LocooContextType | undefined>(undefined);

export const LocooProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentEventId, setCurrentEventId] = useState<string>('default-event');
  const [events, setEvents] = useState<Event[]>([]);
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loansError, setLoansError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // 1. Setup events listener
  useEffect(() => {
    const q = query(collection(db, 'events'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const eventsList: Event[] = [];
      snapshot.forEach((doc) => {
        eventsList.push({ id: doc.id, ...doc.data() } as Event);
      });
      setEvents(eventsList);
      
      // Auto seed default event if empty
      if (eventsList.length === 0) {
        const defaultRef = doc(db, 'events', 'default-event');
        setDoc(defaultRef, {
          id: 'default-event',
          name: 'General Event',
          createdAt: Timestamp.now()
        });
      }
    });

    return () => unsubscribe();
  }, []);

  // 2. Setup real-time subscribers for active event data
  useEffect(() => {
    if (!currentEventId) return;
    setLoading(true);

    const contributorsQuery = query(
      collection(db, 'contributors'), 
      where('eventId', '==', currentEventId),
      orderBy('createdAt', 'desc')
    );
    const unsubContributors = onSnapshot(contributorsQuery, (snapshot) => {
      const list: Contributor[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as Contributor);
      });
      setContributors(list);
    });

    const schedulesQuery = query(
      collection(db, 'schedules'), 
      where('eventId', '==', currentEventId),
      orderBy('dueDate', 'asc')
    );
    const unsubSchedules = onSnapshot(schedulesQuery, (snapshot) => {
      const list: Schedule[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        // Compute status dynamically on read to ensure date matches current client day
        const computedStatus = calculateStatus(data.dueDate, data.amount, data.amountPaid || 0);
        list.push({ 
          id: doc.id, 
          ...data,
          status: computedStatus
        } as Schedule);
      });
      setSchedules(list);
    });

    const paymentsQuery = query(
      collection(db, 'payments'), 
      where('eventId', '==', currentEventId),
      orderBy('createdAt', 'desc')
    );
    const unsubPayments = onSnapshot(paymentsQuery, (snapshot) => {
      const list: Payment[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as Payment);
      });
      setPayments(list);
    }, (error) => {
      console.error("Error fetching payments:", error);
    });

    const payoutsQuery = query(
      collection(db, 'payouts'), 
      where('eventId', '==', currentEventId),
      orderBy('createdAt', 'desc')
    );
    const unsubPayouts = onSnapshot(payoutsQuery, (snapshot) => {
      const list: Payout[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as Payout);
      });
      setPayouts(list);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching payouts:", error);
      setLoading(false);
    });

    const loansQuery = query(
      collection(db, 'loans'),
      where('eventId', '==', currentEventId)
    );
    const unsubLoans = onSnapshot(loansQuery, (snapshot) => {
      const list: Loan[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as Loan);
      });
      // Sort client-side by createdAt descending — no composite index needed
      list.sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() ?? 0;
        const bTime = b.createdAt?.toMillis?.() ?? 0;
        return bTime - aTime;
      });
      setLoans(list);
    }, (error) => {
      console.error('Error fetching loans:', error);
      setLoansError(error.message ?? 'Failed to load loans');
    });

    return () => {
      unsubContributors();
      unsubSchedules();
      unsubPayments();
      unsubPayouts();
      unsubLoans();
    };
  }, [currentEventId]);

  // Actions
  const addEvent = async (name: string, targetAmount?: number, eventType?: 'harambee' | 'merry-go-round' | 'table-banking'): Promise<string> => {
    const docRef = doc(collection(db, 'events'));
    const eventData: any = {
      id: docRef.id,
      name,
      eventType: eventType || 'harambee',
      createdAt: serverTimestamp()
    };
    if (targetAmount !== undefined && targetAmount > 0) {
      eventData.targetAmount = targetAmount;
    }
    setDoc(docRef, eventData).catch(console.error);
    setCurrentEventId(docRef.id);
    return docRef.id;
  };

  const addContributor = async (fullName: string, phone?: string, notes?: string, expectedAmount?: number): Promise<string> => {
    const docRef = doc(collection(db, 'contributors'));
    const batch = writeBatch(db);
    
    batch.set(docRef, {
      id: docRef.id,
      eventId: currentEventId,
      fullName,
      phone: phone || '',
      notes: notes || '',
      totalScheduled: expectedAmount || 0,
      totalPaid: 0,
      remainingBalance: expectedAmount || 0,
      createdAt: serverTimestamp()
    });

    if (expectedAmount && expectedAmount > 0) {
      const scheduleRef = doc(collection(db, 'schedules'));
      batch.set(scheduleRef, {
        id: scheduleRef.id,
        contributorId: docRef.id,
        eventId: currentEventId,
        amount: expectedAmount,
        dueDate: new Date().toLocaleDateString('en-CA'),
        frequency: 'one-time',
        installmentNumber: 1,
        status: calculateStatus(new Date().toLocaleDateString('en-CA'), expectedAmount, 0),
        amountPaid: 0,
        remainingAmount: expectedAmount,
        notes: 'Initial scheduled amount',
        createdAt: serverTimestamp()
      });
    }

    try {
      await batch.commit();
      return docRef.id;
    } catch (e: any) {
      console.error('addContributor failed:', e);
      throw new Error(e.message || 'Failed to add contributor');
    }
  };

  const addSchedule = async (
    contributorId: string, 
    type: 'one-time' | 'installment',
    amountOrTarget: number,
    dueDateOrStartDate: string,
    installmentsCount: number = 1,
    frequency: string = 'Monthly',
    notes: string = '',
    replaceAmount: number = 0,
    schedulesToDelete: string[] = []
  ): Promise<void> => {
    try {
      const schedulesToCreate: any[] = [];
      let totalScheduledAdded = 0;

      if (type === 'one-time') {
        const scheduleRef = doc(collection(db, 'schedules'));
        const status = calculateStatus(dueDateOrStartDate, amountOrTarget, 0);
        schedulesToCreate.push({
          ref: scheduleRef,
          data: {
            id: scheduleRef.id,
            contributorId,
            eventId: currentEventId,
            amount: amountOrTarget,
            dueDate: dueDateOrStartDate,
            frequency: 'one-time',
            installmentNumber: 1,
            status,
            amountPaid: 0,
            remainingAmount: amountOrTarget,
            notes,
            createdAt: serverTimestamp()
          }
        });
        totalScheduledAdded = amountOrTarget;
      } else {
        const dates = generateInstallmentDates(dueDateOrStartDate, installmentsCount, frequency);
        const baseAmount = Math.floor(amountOrTarget / installmentsCount);
        const remainder = amountOrTarget - (baseAmount * installmentsCount);
        
        for (let i = 0; i < installmentsCount; i++) {
          const scheduleRef = doc(collection(db, 'schedules'));
          const installmentAmount = i === 0 ? baseAmount + remainder : baseAmount;
          const status = calculateStatus(dates[i], installmentAmount, 0);
          
          schedulesToCreate.push({
            ref: scheduleRef,
            data: {
              id: scheduleRef.id,
              contributorId,
              eventId: currentEventId,
              amount: installmentAmount,
              dueDate: dates[i],
              frequency,
              installmentNumber: i + 1,
              status,
              amountPaid: 0,
              remainingAmount: installmentAmount,
              notes: notes ? `${notes} (Installment ${i+1}/${installmentsCount})` : '',
              createdAt: serverTimestamp()
            }
          });
        }
        totalScheduledAdded = amountOrTarget;
      }

      // 1. Transactional update of the contributor total
      await runTransaction(db, async (transaction) => {
        const contributorRef = doc(db, 'contributors', contributorId);
        const contributorDoc = await transaction.get(contributorRef);
        if (!contributorDoc.exists()) {
          throw new Error('Contributor does not exist!');
        }
        const contributorData = contributorDoc.data();
        
        const newTotalScheduled = (contributorData.totalScheduled || 0) + totalScheduledAdded - replaceAmount;
        const newRemaining = newTotalScheduled - (contributorData.totalPaid || 0);
        transaction.update(contributorRef, {
          totalScheduled: newTotalScheduled,
          remainingBalance: newRemaining
        });
      });

      // 2. Chunked batch deletes for replaced schedules
      const BATCH_LIMIT = 450;
      if (schedulesToDelete && schedulesToDelete.length > 0) {
        for (let i = 0; i < schedulesToDelete.length; i += BATCH_LIMIT) {
          const chunk = schedulesToDelete.slice(i, i + BATCH_LIMIT);
          const batch = writeBatch(db);
          chunk.forEach(id => {
            batch.delete(doc(db, 'schedules', id));
          });
          await batch.commit();
        }
      }

      // 3. Chunked batch writes for new schedules
      for (let i = 0; i < schedulesToCreate.length; i += BATCH_LIMIT) {
        const chunk = schedulesToCreate.slice(i, i + BATCH_LIMIT);
        const batch = writeBatch(db);
        chunk.forEach(item => {
          batch.set(item.ref, item.data);
        });
        await batch.commit();
      }

    } catch (e: any) {
      console.error('addSchedule failed:', e);
      throw new Error(e.message || 'Operation failed');
    }
  };

  const editSchedule = async (scheduleId: string, amount: number, dueDate: string): Promise<void> => {
    try {
      await runTransaction(db, async (transaction) => {
        const scheduleRef = doc(db, 'schedules', scheduleId);
        const scheduleDoc = await transaction.get(scheduleRef);
        if (!scheduleDoc.exists()) return;
        const schedule = scheduleDoc.data() as Schedule;

        const amountDifference = amount - schedule.amount;
        const newAmountPaid = Math.min(schedule.amountPaid, amount); // Cap already paid at new amount
        const newRemaining = amount - newAmountPaid;
        const newStatus = calculateStatus(dueDate, amount, newAmountPaid);
        
        transaction.update(scheduleRef, {
          amount,
          dueDate,
          amountPaid: newAmountPaid,
          remainingAmount: newRemaining,
          status: newStatus
        });

        // Update contributor totals
        const contributorRef = doc(db, 'contributors', schedule.contributorId);
        const contributorDoc = await transaction.get(contributorRef);
        if (contributorDoc.exists()) {
          const contributor = contributorDoc.data() as Contributor;
          const newTotalScheduled = (contributor.totalScheduled || 0) + amountDifference;
          // Adjust totalPaid if amountPaid was capped down
          const totalPaidDifference = newAmountPaid - schedule.amountPaid;
          const newTotalPaid = (contributor.totalPaid || 0) + totalPaidDifference;
          const newRemainingBalance = newTotalScheduled - newTotalPaid;
          
          transaction.update(contributorRef, {
            totalScheduled: newTotalScheduled,
            totalPaid: newTotalPaid,
            remainingBalance: newRemainingBalance
          });
        }
      });
    } catch (e) {
      console.error(e);
    }
  };

  const deleteSchedule = async (scheduleId: string): Promise<void> => {
    try {
      await runTransaction(db, async (transaction) => {
        const scheduleRef = doc(db, 'schedules', scheduleId);
        const scheduleDoc = await transaction.get(scheduleRef);
        if (!scheduleDoc.exists()) return;
        const schedule = scheduleDoc.data() as Schedule;

        // Delete schedule
        transaction.delete(scheduleRef);

        // Update contributor
        const contributorRef = doc(db, 'contributors', schedule.contributorId);
        const contributorDoc = await transaction.get(contributorRef);
        if (contributorDoc.exists()) {
          const contributor = contributorDoc.data() as Contributor;
          const newTotalScheduled = Math.max(0, (contributor.totalScheduled || 0) - schedule.amount);
          const newTotalPaid = Math.max(0, (contributor.totalPaid || 0) - schedule.amountPaid);
          const newRemainingBalance = newTotalScheduled - newTotalPaid;
          
          transaction.update(contributorRef, {
            totalScheduled: newTotalScheduled,
            totalPaid: newTotalPaid,
            remainingBalance: newRemainingBalance
          });
        }
      });
    } catch (e: any) {
      console.error('editSchedule transaction failed:', e);
      throw new Error(e.message || 'Transaction failed');
    }
  };

  const recordPayment = async (
    contributorId: string,
    scheduleId: string | null,
    paymentAmount: number,
    paymentMethod: string,
    recordedBy: string,
    notes: string = ''
  ): Promise<void> => {
    try {
      // Step 1: Query schedules outside transaction to get reference IDs
      const schedulesRef = collection(db, 'schedules');
      const q = query(
        schedulesRef,
        where('contributorId', '==', contributorId),
        where('remainingAmount', '>', 0)
      );
      const schedulesSnapshot = await getDocs(q);

      await runTransaction(db, async (transaction) => {
        // Read 1: Contributor doc
        const contributorRef = doc(db, 'contributors', contributorId);
        const contributorDoc = await transaction.get(contributorRef);
        if (!contributorDoc.exists()) return;
        const contributor = contributorDoc.data() as Contributor;

        // Read 2: Read each schedule doc to ensure transactional isolation and get latest data
        const contributorSchedules: Schedule[] = [];
        const promises = schedulesSnapshot.docs.map(async (docSnap) => {
          const scheduleRef = doc(db, 'schedules', docSnap.id);
          const scheduleDoc = await transaction.get(scheduleRef);
          return { exists: scheduleDoc.exists(), id: scheduleDoc.id, data: scheduleDoc.data() };
        });
        
        const results = await Promise.all(promises);
        for (const res of results) {
          if (res.exists) {
            contributorSchedules.push({ id: res.id, ...res.data } as Schedule);
          }
        }
        
        // Sort them by due date
        contributorSchedules.sort((a, b) => a.dueDate.localeCompare(b.dueDate)); // Order by due date

        // Calculate updates
        let remainingPayment = paymentAmount;
        const schedulesToUpdate: { id: string; amountPaid: number; remainingAmount: number; status: Schedule['status'] }[] = [];

        // 2. Apply payment to target schedule first, if specified
        if (scheduleId) {
          const targetIdx = contributorSchedules.findIndex(s => s.id === scheduleId);
          if (targetIdx !== -1) {
            const schedule = contributorSchedules[targetIdx];
            const applied = Math.min(remainingPayment, schedule.remainingAmount);
            
            const newPaid = schedule.amountPaid + applied;
            const newRemaining = schedule.amount - newPaid;
            const newStatus = calculateStatus(schedule.dueDate, schedule.amount, newPaid);

            schedulesToUpdate.push({
              id: schedule.id,
              amountPaid: newPaid,
              remainingAmount: newRemaining,
              status: newStatus
            });

            remainingPayment -= applied;
            contributorSchedules.splice(targetIdx, 1); // Remove from list so it doesn't get double-paid
          }
        }

        // 3. Cascade overpayment / remaining payment to oldest schedules
        for (const schedule of contributorSchedules) {
          if (remainingPayment <= 0) break;
          const applied = Math.min(remainingPayment, schedule.remainingAmount);
          
          const newPaid = schedule.amountPaid + applied;
          const newRemaining = schedule.amount - newPaid;
          const newStatus = calculateStatus(schedule.dueDate, schedule.amount, newPaid);

          schedulesToUpdate.push({
            id: schedule.id,
            amountPaid: newPaid,
            remainingAmount: newRemaining,
            status: newStatus
          });

          remainingPayment -= applied;
        }

        // --- Writes start here ---

        // 4. Create payment entry
        const paymentRef = doc(collection(db, 'payments'));
        transaction.set(paymentRef, {
          id: paymentRef.id,
          contributorId,
          scheduleId: scheduleId || null,
          eventId: currentEventId,
          amount: paymentAmount,
          paymentMethod,
          recordedBy,
          notes: notes + (remainingPayment > 0 ? ` (Overpayment excess of ${remainingPayment.toLocaleString()})` : ''),
          createdAt: serverTimestamp()
        });

        // 5. Update schedules in transaction
        for (const s of schedulesToUpdate) {
          transaction.update(doc(db, 'schedules', s.id), {
            amountPaid: s.amountPaid,
            remainingAmount: s.remainingAmount,
            status: s.status
          });
        }

        // 6. Update contributor totals
        const newTotalPaid = (contributor.totalPaid || 0) + paymentAmount;
        const newRemainingBalance = (contributor.totalScheduled || 0) - newTotalPaid;
        transaction.update(contributorRef, {
          totalPaid: newTotalPaid,
          remainingBalance: newRemainingBalance
        });
      });
    } catch (e: any) {
      console.error('Payment transaction failed:', e);
      throw new Error(e.message || 'Transaction failed');
    }
  };
  const addPayout = async (contributorId: string, amount: number, payoutDate: string, notes?: string): Promise<string> => {
    const docRef = doc(collection(db, 'payouts'));
    setDoc(docRef, {
      id: docRef.id,
      eventId: currentEventId,
      contributorId,
      amount,
      payoutDate,
      notes: notes || '',
      createdAt: serverTimestamp()
    }).catch(console.error);
    return docRef.id;
  };

  const deletePayout = async (payoutId: string): Promise<void> => {
    deleteDoc(doc(db, 'payouts', payoutId)).catch(console.error);
  };

  // ─── Table Banking: Loan Actions ─────────────────────────────────────────

  const issueLoan = async (
    contributorId: string,
    principalAmount: number,
    interestRate: number,
    disbursementDate: string,
    dueDate: string,
    notes: string = ''
  ): Promise<string> => {
    // Calculate months between disbursement and due date
    const start = new Date(disbursementDate);
    const end = new Date(dueDate);
    const months = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30)));
    const interestAmount = Math.round(principalAmount * (interestRate / 100) * months);
    const totalRepayable = principalAmount + interestAmount;

    const loanRef = doc(collection(db, 'loans'));
    const payoutRef = doc(collection(db, 'payouts'));

    const batch = writeBatch(db);

    // Create loan record
    batch.set(loanRef, {
      id: loanRef.id,
      eventId: currentEventId,
      contributorId,
      principalAmount,
      interestRate,
      interestAmount,
      totalRepayable,
      amountRepaid: 0,
      remainingBalance: totalRepayable,
      disbursementDate,
      dueDate,
      status: 'Active',
      notes,
      createdAt: serverTimestamp(),
    });

    // Record as a payout so the pool balance decreases
    batch.set(payoutRef, {
      id: payoutRef.id,
      eventId: currentEventId,
      contributorId,
      amount: principalAmount,
      payoutDate: disbursementDate,
      notes: `Loan disbursement (Loan ID: ${loanRef.id})`,
      loanId: loanRef.id,
      createdAt: serverTimestamp(),
    });

    await batch.commit();
    return loanRef.id;
  };

  const recordLoanRepayment = async (
    loanId: string,
    amount: number,
    paymentMethod: string
  ): Promise<void> => {
    await runTransaction(db, async (transaction) => {
      const loanRef = doc(db, 'loans', loanId);
      const loanDoc = await transaction.get(loanRef);
      if (!loanDoc.exists()) throw new Error('Loan not found');
      const loan = loanDoc.data() as Loan;

      const newAmountRepaid = loan.amountRepaid + amount;
      const newRemaining = Math.max(0, loan.totalRepayable - newAmountRepaid);
      const newStatus: Loan['status'] = newRemaining <= 0 ? 'Completed' : 'Active';

      transaction.update(loanRef, {
        amountRepaid: newAmountRepaid,
        remainingBalance: newRemaining,
        status: newStatus,
      });

      // Record as a payment so the pool balance increases
      const paymentRef = doc(collection(db, 'payments'));
      transaction.set(paymentRef, {
        id: paymentRef.id,
        eventId: currentEventId,
        contributorId: loan.contributorId,
        scheduleId: null,
        loanId,
        amount,
        paymentMethod,
        recordedBy: 'Loan Repayment',
        notes: `Loan repayment (Loan ID: ${loanId})`,
        createdAt: serverTimestamp(),
      });
    });
  };

  const deleteLoan = async (loanId: string): Promise<void> => {
    deleteDoc(doc(db, 'loans', loanId)).catch(console.error);
  };

  const setRotationOrder = async (order: string[]): Promise<void> => {
    if (!currentEventId) return;
    const { updateDoc } = await import('firebase/firestore');
    await updateDoc(doc(db, 'events', currentEventId), { rotationOrder: order });
  };

  const bulkScheduleAll = async (
    type: 'one-time' | 'installment',
    amount: number,
    dueDateOrStartDate: string,
    frequency: string = 'Monthly',
    installmentsCount: number = 1,
    notes: string = ''
  ): Promise<number> => {
    // Only operate on contributors for the current event
    const eventContributors = contributors.filter(c => c.eventId === currentEventId);
    if (eventContributors.length === 0) return 0;

    const BATCH_LIMIT = 400;
    const allScheduleWrites: { ref: any; data: any }[] = [];

    for (const contributor of eventContributors) {
      if (type === 'one-time') {
        const scheduleRef = doc(collection(db, 'schedules'));
        const status = calculateStatus(dueDateOrStartDate, amount, 0);
        allScheduleWrites.push({
          ref: scheduleRef,
          data: {
            id: scheduleRef.id,
            contributorId: contributor.id,
            eventId: currentEventId,
            amount,
            dueDate: dueDateOrStartDate,
            frequency: 'one-time',
            installmentNumber: 1,
            status,
            amountPaid: 0,
            remainingAmount: amount,
            notes,
            createdAt: serverTimestamp(),
          },
        });
      } else {
        const dates = generateInstallmentDates(dueDateOrStartDate, installmentsCount, frequency);
        const baseAmount = Math.floor(amount / installmentsCount);
        const remainder = amount - baseAmount * installmentsCount;
        for (let i = 0; i < installmentsCount; i++) {
          const scheduleRef = doc(collection(db, 'schedules'));
          const installmentAmount = i === 0 ? baseAmount + remainder : baseAmount;
          const status = calculateStatus(dates[i], installmentAmount, 0);
          allScheduleWrites.push({
            ref: scheduleRef,
            data: {
              id: scheduleRef.id,
              contributorId: contributor.id,
              eventId: currentEventId,
              amount: installmentAmount,
              dueDate: dates[i],
              frequency,
              installmentNumber: i + 1,
              status,
              amountPaid: 0,
              remainingAmount: installmentAmount,
              notes: notes ? `${notes} (Installment ${i + 1}/${installmentsCount})` : '',
              createdAt: serverTimestamp(),
            },
          });
        }
      }
    }

    // Batch write all schedule documents
    for (let i = 0; i < allScheduleWrites.length; i += BATCH_LIMIT) {
      const chunk = allScheduleWrites.slice(i, i + BATCH_LIMIT);
      const batch = writeBatch(db);
      chunk.forEach(item => batch.set(item.ref, item.data));
      await batch.commit();
    }

    // Update each contributor's totals
    const totalAdded = type === 'one-time' ? amount : amount;
    for (const contributor of eventContributors) {
      await runTransaction(db, async (transaction) => {
        const contributorRef = doc(db, 'contributors', contributor.id);
        const snap = await transaction.get(contributorRef);
        if (!snap.exists()) return;
        const data = snap.data();
        const newTotalScheduled = (data.totalScheduled || 0) + totalAdded;
        transaction.update(contributorRef, {
          totalScheduled: newTotalScheduled,
          remainingBalance: newTotalScheduled - (data.totalPaid || 0),
        });
      });
    }

    return eventContributors.length;
  };

  const clearDemoData = async (): Promise<void> => {
    const batch = writeBatch(db);
    batch.delete(doc(db, 'events', 'demo-event'));
    batch.delete(doc(db, 'contributors', 'demo-jane'));
    batch.delete(doc(db, 'contributors', 'demo-john'));
    batch.delete(doc(db, 'schedules', 'demo-jane-sch1'));
    batch.delete(doc(db, 'schedules', 'demo-jane-sch2'));
    batch.delete(doc(db, 'schedules', 'demo-john-sch1'));
    batch.delete(doc(db, 'payments', 'demo-jane-pay1'));
    batch.delete(doc(db, 'payments', 'demo-john-pay1'));
    batch.commit().catch(console.error);
    if (currentEventId === 'demo-event') {
      setCurrentEventId('default-event');
    }
  };


  return (
    <LocooContext.Provider value={{
      currentEventId,
      setCurrentEventId,
      events,
      contributors,
      schedules,
      payments,
      payouts,
      loans,
      loansError,
      loading,
      addEvent,
      addContributor,
      addSchedule,
      editSchedule,
      deleteSchedule,
      recordPayment,
      addPayout,
      deletePayout,
      setRotationOrder,
      bulkScheduleAll,
      clearDemoData,
      issueLoan,
      recordLoanRepayment,
      deleteLoan,
    }}>
      {children}
    </LocooContext.Provider>
  );
};

export const useLocoo = () => {
  const context = useContext(LocooContext);
  if (context === undefined) {
    throw new Error('useLocoo must be used within a LocooProvider');
  }
  return context;
};
