"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  TrendingUp, 
  Users, 
  Clock, 
  ArrowLeft, 
  LogOut,
  CreditCard,
  Search,
  ShieldCheck,
  Download,
  Loader2,
  AlertCircle,
  BarChart3,
  Eye,
  Target,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAnalytics } from '@/lib/analytics';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

export default function AdminDashboard() {
  const [payments, setPayments] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const userJson = localStorage.getItem('crashguard_admin_user');
    if (!userJson) {
      router.push('/admin');
    } else {
      setAuthenticated(true);
      const localPayments = localStorage.getItem('crashguard_ledger');
      if (localPayments) setPayments(JSON.parse(localPayments));
      setAnalytics(getAnalytics());
      setLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('crashguard_admin_user');
    router.push('/admin');
  };

  const totalRevenue = payments.reduce((acc, curr) => {
    const amountStr = curr.amount?.replace(/[^0-9.]/g, '') || '0';
    return acc + parseFloat(amountStr);
  }, 0);

  const filteredPayments = payments.filter(p => 
    p.amount?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Analytics Processing
  const pageViews = analytics.filter(a => a.type === 'page_view');
  const supportIntents = analytics.filter(a => a.type === 'support_intent');
  
  const popularPages = pageViews.reduce((acc: any, curr: any) => {
    acc[curr.label] = (acc[curr.label] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(popularPages).map(([name, value]) => ({ name, value }));
  
  const conversionRate = pageViews.length > 0 
    ? ((payments.length / pageViews.length) * 100).toFixed(1) 
    : 0;

  if (!authenticated || loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <Loader2 className="w-8 h-8 animate-spin text-secondary" />
      <p className="text-muted-foreground animate-pulse font-black tracking-[0.3em] text-[10px] uppercase">Decrypting Ledger...</p>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 px-5 pt-8 pb-12 max-w-2xl mx-auto">
      <header className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push('/')} className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex flex-col">
            <h1 className="text-2xl font-black text-white leading-none">Admin Terminal</h1>
            <span className="text-[10px] font-black text-secondary uppercase tracking-widest mt-1 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              Rupesh's Intel
            </span>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleLogout}
          className="rounded-full text-risk-crash hover:bg-risk-crash/10"
        >
          <LogOut className="w-5 h-5" />
        </Button>
      </header>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-3xl p-6 space-y-1 shadow-xl">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Revenue</p>
          <p className="text-3xl font-black text-secondary">${totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-card border border-border rounded-3xl p-6 space-y-1 shadow-xl">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Conv. Rate</p>
          <p className="text-3xl font-black text-white">{conversionRate}%</p>
        </div>
      </div>

      <Tabs defaultValue="ledger" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-muted/20 p-1 h-12 rounded-2xl mb-6">
          <TabsTrigger value="ledger" className="rounded-xl font-bold text-xs flex items-center gap-2">
            <CreditCard className="w-3 h-3" /> Ledger
          </TabsTrigger>
          <TabsTrigger value="insights" className="rounded-xl font-bold text-xs flex items-center gap-2">
            <BarChart3 className="w-3 h-3" /> Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ledger" className="space-y-4 animate-in fade-in duration-500">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search payments..." 
                className="pl-11 rounded-2xl bg-muted/10 border-border h-12 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" className="h-12 w-12 rounded-2xl border-border">
              <Download className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-3">
            {filteredPayments.map((p) => (
              <div key={p.id} className="bg-card border border-border rounded-2xl p-4 flex justify-between items-center group">
                <div className="flex gap-4 items-center">
                  <div className="p-3 bg-secondary/5 rounded-xl text-secondary">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white">{p.amount} Support</span>
                    <span className="text-[10px] text-muted-foreground font-medium">
                      {new Date(p.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <Badge variant="outline" className="text-[9px] font-black border-secondary/20 text-secondary">
                  {p.mode || 'Investor'}
                </Badge>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6 animate-in fade-in duration-500">
          <div className="bg-card border border-border rounded-[2.5rem] p-8 space-y-6">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-secondary" />
              <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Most Visited Sections</h3>
            </div>
            
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: 'hsl(var(--muted-foreground))'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: 'hsl(var(--muted-foreground))'}} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: '1px solid hsl(var(--border))' }}
                    itemStyle={{ color: 'hsl(var(--secondary))', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="value" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/10 p-6 rounded-3xl border border-border space-y-2">
              <Target className="w-4 h-4 text-orange-500" />
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Support Intent</p>
              <p className="text-2xl font-black text-white">{supportIntents.length}</p>
            </div>
            <div className="bg-muted/10 p-6 rounded-3xl border border-border space-y-2">
              <Users className="w-4 h-4 text-blue-500" />
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total Events</p>
              <p className="text-2xl font-black text-white">{analytics.length}</p>
            </div>
          </div>

          <div className="bg-secondary/10 p-4 rounded-2xl border border-secondary/20 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              <strong>Strategy:</strong> Most users visit 'Playbooks' before clicking 'Support'. Focus on updating premium content to increase conversion.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
