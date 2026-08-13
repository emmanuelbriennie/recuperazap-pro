import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardHeader, Input, Badge, Skeleton, EmptyState, Button } from '@/components/ui';
import { Search, Phone, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

type Lead = {
  id: string;
  nome: string | null;
  telefone: string;
  status: string;
  valor_estimado: number | null;
  created_at: string;
};

const tones: Record<string, 'muted' | 'success' | 'warning' | 'danger'> = {
  recuperado: 'success',
  convertido: 'success',
  pendente: 'warning',
  perdido: 'danger',
};

export default function Leads() {
  const [term, setTerm] = useState('');

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['leads-page'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('id, nome, telefone, status, valor_estimado, created_at')
        .order('created_at', { ascending: false })
        .limit(300);
      if (error) throw error;
      return (data ?? []) as Lead[];
    },
  });

  const filtered = useMemo(() => {
    const t = term.trim().toLowerCase();
    if (!t) return data ?? [];
    return (data ?? []).filter((l) => (l.nome ?? '').toLowerCase().includes(t) || l.telefone.includes(t));
  }, [data, term]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Leads & Mensagens</h1>
          <p className="text-sm text-muted-foreground">Gerencie contatos e acompanhe o status de recuperação.</p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            refetch();
            toast.success('Lista atualizada');
          }}
        >
          <RefreshCw className={isFetching ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
          Atualizar
        </Button>
      </header>

      <Card>
        <CardHeader title="Contatos" subtitle={`${filtered.length} lead(s) encontrados`} />
        <div className="border-b border-border p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Buscar por nome ou telefone" className="pl-9" />
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14" />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState title="Nenhum lead encontrado" description="Assim que novos contatos chegarem pelo WhatsApp, eles aparecerão aqui." />
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((lead) => (
              <div key={lead.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{lead.nome || 'Contato sem nome'}</p>
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Phone className="h-3 w-3" /> {lead.telefone}
                    <span className="mx-1">•</span>
                    {format(new Date(lead.created_at), "dd 'de' MMM, HH:mm", { locale: ptBR })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {lead.valor_estimado != null && (
                    <span className="text-sm font-semibold">
                      R$ {Number(lead.valor_estimado).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  )}
                  <Badge tone={tones[lead.status] ?? 'muted'}>{lead.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
