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
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase';

export interface Contributor {
  id: string;
  eventId: string;
  fullName: string;
  phone?: string;
  notes?: string;
  totalScheduled: number;
  totalPaid: number;
  remainingBalance: number;
  createdAt: any;
}

export interface Schedule {
  id: string;
  contributorId: string;
  eventId: string;
  amount: number;
  dueDate: string; // YYYY-MM-DD
  frequency: string; // 'one-time' | 'Daily' | 'Weekly' | 'Biweekly' | 'Monthly' | 'Custom'
  installmentNumber: number;
  status: 'Upcoming' | 'Due Today' | 'Overdue' | 'Partially Paid' | 'Completed';
  amountPaid: number;
  remainingAmount: number;
  notes?: string;
  createdAt: any;
}

export interface Payment {
  id: string;
  contributorId: string;
  scheduleId?: string | null;
  eventId: string;
  amount: number;
  paymentMethod: string;
  recordedBy: string;
  notes?: string;
  createdAt: any;
}

export interface Event {
  id: string;
  name: string;
  createdAt: any;
}

interface JumuikaContextType {
  currentEventId: string;
  setCurrentEventId: (id: string) => void;
  events: Event[];
  contributors: Contributor[];
  schedules: Schedule[];
  payments: Payment[];
  loading: boolean;
  
  // Actions
  addEvent: (name: string) => Promise<string>;
  addContributor: (fullName: string, phone?: string, notes?: string) => Promise<string>;
  addSchedule: (
    contributorId: string, 
    type: 'one-time' | 'installment',
    amountOrTarget: number,
    dueDateOrStartDate: string,
    installmentsCount?: number,
    frequency?: string,
    notes?: string
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
  seedDemoData: () => Promise<void>;
}

const JumuikaContext = createContext<JumuikaContextType | undefined>(undefined);

export const calculateStatus = (dueDateStr: string, amount: number, amountPaid: number): Schedule['status'] => {
  if (amountPaid >= amount) {
    return 'Completed';
  }
  if (amountPaid > 0) {
    return 'Partially Paid';
  }
  
  const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD in local time
  if (dueDateStr < todayStr) {
    return 'Overdue';
  } else if (dueDateStr === todayStr) {
    return 'Due Today';
  } else {
    return 'Upcoming';
  }
};

export const generateInstallmentDates = (startDateStr: string, count: number, frequency: string): string[] => {
  const dates: string[] = [];
  const start = new Date(startDateStr);
  
  for (let i = 0; i < count; i++) {
    const d = new Date(start);
    if (frequency === 'Daily') {
      d.setDate(start.getDate() + i);
    } else if (frequency === 'Weekly') {
      d.setDate(start.getDate() + (i * 7));
    } else if (frequency === 'Biweekly') {
      d.setDate(start.getDate() + (i * 14));
    } else if (frequency === 'Monthly') {
      d.setMonth(start.getMonth() + i);
    } else { // Custom - default to 30 days
      d.setDate(start.getDate() + (i * 30));
    }
    dates.push(d.toLocaleDateString('en-CA')); // Safe local YYYY-MM-DD
  }
  return dates;
};

export const JumuikaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentEventId, setCurrentEventId] = useState<string>('default-event');
  const [events, setEvents] = useState<Event[]>([]);
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
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
      setLoading(false);
    });

    return () => {
      unsubContributors();
      unsubSchedules();
      unsubPayments();
    };
  }, [currentEventId]);

  // Actions
  const addEvent = async (name: string): Promise<string> => {
    const docRef = doc(collection(db, 'events'));
    await setDoc(docRef, {
      id: docRef.id,
      name,
      createdAt: serverTimestamp()
    });
    setCurrentEventId(docRef.id);
    return docRef.id;
  };

  const addContributor = async (fullName: string, phone?: string, notes?: string): Promise<string> => {
    const docRef = doc(collection(db, 'contributors'));
    await setDoc(docRef, {
      id: docRef.id,
      eventId: currentEventId,
      fullName,
      phone: phone || '',
      notes: notes || '',
      totalScheduled: 0,
      totalPaid: 0,
      remainingBalance: 0,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  };

  const addSchedule = async (
    contributorId: string, 
    type: 'one-time' | 'installment',
    amountOrTarget: number,
    dueDateOrStartDate: string,
    installmentsCount: number = 1,
    frequency: string = 'Monthly',
    notes: string = ''
  ): Promise<void> => {
    const batch = writeBatch(db);
    let totalScheduledAdded = 0;
    
    if (type === 'one-time') {
      const scheduleRef = doc(collection(db, 'schedules'));
      const status = calculateStatus(dueDateOrStartDate, amountOrTarget, 0);
      batch.set(scheduleRef, {
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
        
        batch.set(scheduleRef, {
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
        });
      }
      totalScheduledAdded = amountOrTarget;
    }

    // Update contributor
    const contributorRef = doc(db, 'contributors', contributorId);
    const contributor = contributors.find(c => c.id === contributorId);
    if (contributor) {
      const newTotalScheduled = (contributor.totalScheduled || 0) + totalScheduledAdded;
      const newRemaining = newTotalScheduled - (contributor.totalPaid || 0);
      batch.update(contributorRef, {
        totalScheduled: newTotalScheduled,
        remainingBalance: newRemaining
      });
    }

    await batch.commit();
  };

  const editSchedule = async (scheduleId: string, amount: number, dueDate: string): Promise<void> => {
    const batch = writeBatch(db);
    const scheduleRef = doc(db, 'schedules', scheduleId);
    const schedule = schedules.find(s => s.id === scheduleId);
    
    if (!schedule) return;
    
    const amountDifference = amount - schedule.amount;
    const newAmountPaid = Math.min(schedule.amountPaid, amount); // Cap already paid at new amount
    const newRemaining = amount - newAmountPaid;
    const newStatus = calculateStatus(dueDate, amount, newAmountPaid);
    
    batch.update(scheduleRef, {
      amount,
      dueDate,
      amountPaid: newAmountPaid,
      remainingAmount: newRemaining,
      status: newStatus
    });

    // Update contributor totals
    const contributorRef = doc(db, 'contributors', schedule.contributorId);
    const contributor = contributors.find(c => c.id === schedule.contributorId);
    if (contributor) {
      const newTotalScheduled = (contributor.totalScheduled || 0) + amountDifference;
      // Adjust totalPaid if amountPaid was capped down
      const totalPaidDifference = newAmountPaid - schedule.amountPaid;
      const newTotalPaid = (contributor.totalPaid || 0) + totalPaidDifference;
      const newRemainingBalance = newTotalScheduled - newTotalPaid;
      
      batch.update(contributorRef, {
        totalScheduled: newTotalScheduled,
        totalPaid: newTotalPaid,
        remainingBalance: newRemainingBalance
      });
    }

    await batch.commit();
  };

  const deleteSchedule = async (scheduleId: string): Promise<void> => {
    const batch = writeBatch(db);
    const schedule = schedules.find(s => s.id === scheduleId);
    if (!schedule) return;

    // Delete schedule
    batch.delete(doc(db, 'schedules', scheduleId));

    // Update contributor
    const contributorRef = doc(db, 'contributors', schedule.contributorId);
    const contributor = contributors.find(c => c.id === schedule.contributorId);
    if (contributor) {
      const newTotalScheduled = Math.max(0, (contributor.totalScheduled || 0) - schedule.amount);
      const newTotalPaid = Math.max(0, (contributor.totalPaid || 0) - schedule.amountPaid);
      const newRemainingBalance = newTotalScheduled - newTotalPaid;
      
      batch.update(contributorRef, {
        totalScheduled: newTotalScheduled,
        totalPaid: newTotalPaid,
        remainingBalance: newRemainingBalance
      });
    }

    await batch.commit();
  };

  const recordPayment = async (
    contributorId: string,
    scheduleId: string | null,
    paymentAmount: number,
    paymentMethod: string,
    recordedBy: string,
    notes: string = ''
  ): Promise<void> => {
    const batch = writeBatch(db);
    
    // 1. Fetch contributor's schedules with remaining balance
    const contributorSchedules = schedules
      .filter(s => s.contributorId === contributorId && s.remainingAmount > 0)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate)); // Order by due date

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

    // 4. Create payment entry
    const paymentRef = doc(collection(db, 'payments'));
    batch.set(paymentRef, {
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

    // 5. Update schedules in batch
    for (const s of schedulesToUpdate) {
      batch.update(doc(db, 'schedules', s.id), {
        amountPaid: s.amountPaid,
        remainingAmount: s.remainingAmount,
        status: s.status
      });
    }

    // 6. Update contributor totals
    const contributorRef = doc(db, 'contributors', contributorId);
    const contributor = contributors.find(c => c.id === contributorId);
    if (contributor) {
      const newTotalPaid = (contributor.totalPaid || 0) + paymentAmount;
      const newRemainingBalance = (contributor.totalScheduled || 0) - newTotalPaid;
      batch.update(contributorRef, {
        totalPaid: newTotalPaid,
        remainingBalance: newRemainingBalance
      });
    }

    await batch.commit();
  };

  const seedDemoData = async (): Promise<void> => {
    const demoEventId = 'demo-event';
    const eventRef = doc(db, 'events', demoEventId);
    await setDoc(eventRef, {
      id: demoEventId,
      name: 'Demo Project Fund',
      createdAt: serverTimestamp()
    });
    
    setCurrentEventId(demoEventId);
    
    const batch = writeBatch(db);
    const janeId = 'demo-jane';
    const johnId = 'demo-john';
    
    batch.set(doc(db, 'contributors', janeId), {
      id: janeId,
      eventId: demoEventId,
      fullName: 'Jane Doe',
      phone: '+254 712 345678',
      notes: 'Demo contributor with installment schedule',
      totalScheduled: 120000,
      totalPaid: 60000,
      remainingBalance: 60000,
      createdAt: Timestamp.now()
    });
    
    batch.set(doc(db, 'contributors', johnId), {
      id: johnId,
      eventId: demoEventId,
      fullName: 'John Smith',
      phone: '+254 722 987654',
      notes: 'Demo contributor with one-time schedules',
      totalScheduled: 100000,
      totalPaid: 0,
      remainingBalance: 100000,
      createdAt: Timestamp.now()
    });
    
    const today = new Date();
    const date1 = new Date(today.getFullYear(), today.getMonth() - 2, 1).toLocaleDateString('en-CA');
    const date2 = new Date(today.getFullYear(), today.getMonth() - 1, 1).toLocaleDateString('en-CA');
    const date3 = new Date(today.getFullYear(), today.getMonth(), 1).toLocaleDateString('en-CA');
    const date4 = new Date(today.getFullYear(), today.getMonth() + 1, 1).toLocaleDateString('en-CA');
    
    const datesJane = [date1, date2, date3, date4];
    
    for (let i = 0; i < 4; i++) {
      const sRef = doc(db, 'schedules', `jane-sched-${i+1}`);
      const isPaid = i < 2;
      const amountPaid = isPaid ? 30000 : 0;
      const status = isPaid ? 'Completed' : calculateStatus(datesJane[i], 30000, 0);
      
      batch.set(sRef, {
        id: `jane-sched-${i+1}`,
        contributorId: janeId,
        eventId: demoEventId,
        amount: 30000,
        dueDate: datesJane[i],
        frequency: 'Monthly',
        installmentNumber: i + 1,
        status,
        amountPaid,
        remainingAmount: 30000 - amountPaid,
        notes: `Building Fund (Installment ${i+1}/4)`,
        createdAt: Timestamp.now()
      });
    }
    
    const dateOverdue = new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000).toLocaleDateString('en-CA');
    const dateUpcoming = new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString('en-CA');
    
    batch.set(doc(db, 'schedules', 'john-sched-1'), {
      id: 'john-sched-1',
      contributorId: johnId,
      eventId: demoEventId,
      amount: 50000,
      dueDate: dateOverdue,
      frequency: 'one-time',
      installmentNumber: 1,
      status: 'Overdue',
      amountPaid: 0,
      remainingAmount: 50000,
      notes: 'Initial One-time Pledge',
      createdAt: Timestamp.now()
    });
    
    batch.set(doc(db, 'schedules', 'john-sched-2'), {
      id: 'john-sched-2',
      contributorId: johnId,
      eventId: demoEventId,
      amount: 50000,
      dueDate: dateUpcoming,
      frequency: 'one-time',
      installmentNumber: 1,
      status: 'Upcoming',
      amountPaid: 0,
      remainingAmount: 50000,
      notes: 'Second One-time Pledge',
      createdAt: Timestamp.now()
    });
    
    batch.set(doc(db, 'payments', 'jane-pay-1'), {
      id: 'jane-pay-1',
      contributorId: janeId,
      scheduleId: 'jane-sched-1',
      eventId: demoEventId,
      amount: 30000,
      paymentMethod: 'M-Pesa',
      recordedBy: 'Treasurer',
      notes: 'Initial installment',
      createdAt: Timestamp.now()
    });
    
    batch.set(doc(db, 'payments', 'jane-pay-2'), {
      id: 'jane-pay-2',
      contributorId: janeId,
      scheduleId: 'jane-sched-2',
      eventId: demoEventId,
      amount: 30000,
      paymentMethod: 'Cash',
      recordedBy: 'Treasurer',
      notes: 'Second installment payment',
      createdAt: Timestamp.now()
    });
    
    await batch.commit();
  };

  return (
    <JumuikaContext.Provider value={{
      currentEventId,
      setCurrentEventId,
      events,
      contributors,
      schedules,
      payments,
      loading,
      addEvent,
      addContributor,
      addSchedule,
      editSchedule,
      deleteSchedule,
      recordPayment,
      seedDemoData
    }}>
      {children}
    </JumuikaContext.Provider>
  );
};

export const useJumuika = () => {
  const context = useContext(JumuikaContext);
  if (context === undefined) {
    throw new Error('useJumuika must be used within a JumuikaProvider');
  }
  return context;
};
