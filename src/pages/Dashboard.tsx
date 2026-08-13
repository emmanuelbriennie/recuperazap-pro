import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardHeader, Skeleton, Badge } from '@/components/ui';
import { Users, MessageSquare, TrendingUp, AlertTriangle } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { format, subDays, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type Lead = { id: string; nome: string | null; telefone: string; status: string; valor_estimado: number | null; created_at: string };

function useLeads() {
  return useQuery({
    queryKey: ['leads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('id, nome, telefone, status, valor_estimado, created_at')
        .order('created_at', { ascending: false })
        .limit(500);
      if (error) throw error;
      return (data ?? []) as Lead[];
    },
  });
}

function useConversations() {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conversations')
        .select('id, client_name, client_phone, last_message_summary, last_message_at, slow_response')
        .order('last_message_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      return data ?? [];
    },
  });
}

function Metric({ label, value, icon: Icon, hint }: { label: string; value: string; icon: any; hint?: string }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </Card>
  );
}

export default function Dashboard() {
  const leads = useLeads();
  const conversations = useConversations();

  const list = leads.data ?? [];
  const recovered = list.filter((l) => l.status === 'recuperado' || l.status === 'convertido').length;
  const valor = list.reduce((sum, l) => sum + Number(l.valor_estimado ?? 0), 0);
  const slow = (conversations.data ?? []).filter((c: any) => c.slow_response).length;

  const chart = Array.from({ length: 14 }).map((_, i) => {
    const day = startOfDay(subDays(new Date(), 13 - i));
    const count = list.filter((l) => startOfDay(new Date(l.created_at)).getTime() === day.getTime()).length;
    return { dia: format(day, 'dd/MM', { locale: ptBR }), leads: count };
  });

  const loading = leads.isLoading || conversations.isLoading;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Visão geral da recuperação de conversas e leads.</p>
      </header>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="Leads totais" value={String(list.length)} icon={Users} />
          <Metric label="Conversas ativas" value={String((conversations.data ?? []).length)} icon={MessageSquare} />
          <Metric label="Recuperados" value={String(recovered)} icon={TrendingUp} hint={list.length ? `${Math.round((recovered / list.length) * 100)}% de conversão` : undefined} />
          <Metric label="Respostas lentas" value={String(slow)} icon={AlertTriangle} hint="Conversas que exigem atenção" />
        </div>
      )}

      <Card>
        <CardHeader title="Leads nos últimos 14 dias" subtitle={`Valor estimado em carteira: R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
        <div className="h-72 p-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chart}>
              <defs>
                <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="dia" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" width={30} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} />
              <Area type="monotone" dataKey="leads" stroke="hsl(var(--primary))" fill="url(#g)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <CardHeader title="Conversas recentes" subtitle="Últimas interações registradas" />
        <div className="divide-y divide-border">
          {(conversations.data ?? []).slice(0, 5).map((c: any) => (
            <div key={c.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3">
              <div>
                <p className="text-sm font-medium">{c.client_name || c.client_phone}</p>
                <p className="text-xs text-muted-foreground">{c.last_message_summary || 'Sem resumo disponível'}</p>
              </div>
              {c.slow_response ? <Badge tone="warning">Resposta lenta</Badge> : <Badge tone="success">Em dia</Badge>}
            </div>
          ))}
          {!loading && (conversations.data ?? []).length === 0 && (
            <p className="px-5 py-8 text-center text-sm text-muted-foreground">Nenhuma conversa registrada ainda.</p>
          )}
        </div>
      </Card>
    </div>
  );
}
