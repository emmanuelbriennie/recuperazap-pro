import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardHeader, Badge, Skeleton, EmptyState } from '@/components/ui';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type Conversation = {
  id: string;
  client_name: string | null;
  client_phone: string;
  last_message_summary: string | null;
  last_message_at: string | null;
  slow_response: boolean | null;
};

export default function Auditoria() {
  const { data, isLoading } = useQuery({
    queryKey: ['auditoria'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conversations')
        .select('id, client_name, client_phone, last_message_summary, last_message_at, slow_response')
        .order('last_message_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data ?? []) as Conversation[];
    },
  });

  const rows = data ?? [];
  const slow = rows.filter((r) => r.slow_response);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Auditoria</h1>
        <p className="text-sm text-muted-foreground">Monitore tempo de resposta e a qualidade do atendimento.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Conversas auditadas</p>
          <p className="mt-2 text-2xl font-bold">{rows.length}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Atrasos detectados</p>
          <p className="mt-2 text-2xl font-bold text-warning">{slow.length}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Índice de conformidade</p>
          <p className="mt-2 text-2xl font-bold text-success">
            {rows.length ? Math.round(((rows.length - slow.length) / rows.length) * 100) : 100}%
          </p>
        </Card>
      </div>

      <Card>
        <CardHeader title="Registro de conversas" subtitle="Ordenado pela última mensagem recebida" />
        {isLoading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14" />)}
          </div>
        ) : rows.length === 0 ? (
          <EmptyState title="Sem registros de auditoria" description="As conversas monitoradas aparecerão aqui automaticamente." />
        ) : (
          <div className="divide-y divide-border">
            {rows.map((row) => (
              <div key={row.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{row.client_name || row.client_phone}</p>
                  <p className="truncate text-xs text-muted-foreground">{row.last_message_summary || 'Sem resumo'}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    {row.last_message_at
                      ? formatDistanceToNow(new Date(row.last_message_at), { addSuffix: true, locale: ptBR })
                      : '—'}
                  </span>
                  {row.slow_response ? <Badge tone="danger">Atrasada</Badge> : <Badge tone="success">Ok</Badge>}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
