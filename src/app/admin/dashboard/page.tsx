
"use client";

import { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { 
  TrendingUp, 
  Users, 
  Clock, 
  ArrowLeft, 
  LogOut,
  CreditCard,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

export default function AdminDashboard() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (!user) router.push('/admin');
    });

    const q = query(collection(db, "donations"), orderBy("timestamp", "desc"));
    const unsubscribePayments = onSnapshot(q, (snapshot) => {
      const p = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPayments(p);
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      unsubscribePayments();
    };
  }, [router]);

  const totalRevenue = payments.reduce((acc, curr) => {
    const val = parseFloat(curr.amount?.replace('$', '') || '0');
    return acc + val;
  }, 0);

  const filteredPayments = payments.filter(p => 
    p.amount?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.mode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-muted-foreground animate-pulse font-bold tracking-widest text-xs uppercase">Loading Ledger...</p>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 px-5 pt-8 pb-12">
      <header className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-black text-white">Ledger</h1>
        </div>
        <Button variant="ghost" size="icon" onClick={() => auth.signOut()}>
          <LogOut className="w-5 h-5 text-risk-crash" />
        </Button>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-3xl p-5 space-y-1 shadow-lg">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total Support</p>
          <p className="text-2xl font-black text-secondary">${totalRevenue.toFixed(2)}</p>
          <TrendingUp className="w-4 h-4 text-secondary/40" />
        </div>
        <div className="bg-card border border-border rounded-3xl p-5 space-y-1 shadow-lg">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total Events</p>
          <p className="text-2xl font-black text-white">{payments.length}</p>
          <Users className="w-4 h-4 text-white/20" />
        </div>
      </div>

      {/* Filter */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="Filter history..." 
          className="pl-11 rounded-2xl bg-muted/10 border-border h-12"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* History List */}
      <div className="space-y-3">
        {filteredPayments.map((p) => (
          <div key={p.id} className="bg-card border border-border rounded-2xl p-4 flex justify-between items-center">
            <div className="flex gap-4 items-center">
              <div className="p-2 bg-secondary/10 rounded-xl text-secondary">
                <CreditCard className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white">{p.amount} Support</span>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {p.timestamp?.toDate().toLocaleString()}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <Badge variant="outline" className="text-[9px] font-black border-secondary/20 text-secondary">
                {p.mode || 'Investor'}
              </Badge>
              <span className="text-[8px] text-muted-foreground font-mono uppercase">ID: {p.id.slice(0, 8)}</span>
            </div>
          </div>
        ))}

        {filteredPayments.length === 0 && (
          <div className="text-center py-20">
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">No transaction history found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
