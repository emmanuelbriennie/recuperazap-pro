import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardHeader, Input, Button, Badge, Skeleton, EmptyState } from '@/components/ui';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';
import { Moon, Sun, Save } from 'lucide-react';

type Instance = {
  id: string;
  sector_name: string | null;
  phone: string | null;
  status: string | null;
  message: string | null;
  delay: number | null;
};

export default function Configuracoes() {
  const queryClient = useQueryClient();
  const { theme, setTheme } = useTheme();
  const [drafts, setDrafts] = useState<Record<string, { message: string; delay: number }>>({});

  const { data, isLoading } = useQuery({
    queryKey: ['instances'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('instances')
        .select('id, sector_name, phone, status, message, delay')
        .order('created_at', { ascending: true });
      if (error) throw error;
      return (data ?? []) as Instance[];
    },
  });

  useEffect(() => {
    if (!data) return;
    setDrafts(
      Object.fromEntries(data.map((i) => [i.id, { message: i.message ?? '', delay: i.delay ?? 0 }])),
    );
  }, [data]);

  const save = useMutation({
    mutationFn: async (instance: Instance) => {
      const draft = drafts[instance.id];
      const { error } = await supabase
        .from('instances')
        .update({ message: draft.message, delay: draft.delay })
        .eq('id', instance.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Configuração salva com sucesso');
      queryClient.invalidateQueries({ queryKey: ['instances'] });
    },
    onError: (error: any) => toast.error(error?.message ?? 'Não foi possível salvar'),
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
        <p className="text-sm text-muted-foreground">Ajuste mensagens automáticas e o tempo de disparo por setor.</p>
      </header>

      <Card>
        <CardHeader
          title="Aparência"
          subtitle="Escolha o tema da interface"
          action={
            <Button variant="outline" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {theme === 'dark' ? 'Tema claro' : 'Tema escuro'}
            </Button>
          }
        />
      </Card>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-48" />)}
        </div>
      ) : (data ?? []).length === 0 ? (
        <Card>
          <EmptyState title="Nenhuma instância configurada" description="Cadastre uma instância do WhatsApp para começar a automatizar as mensagens de recuperação." />
        </Card>
      ) : (
        (data ?? []).map((instance) => {
          const draft = drafts[instance.id] ?? { message: '', delay: 0 };
          return (
            <Card key={instance.id}>
              <CardHeader
                title={instance.sector_name || 'Instância'}
                subtitle={instance.phone || 'Telefone não informado'}
                action={<Badge tone={instance.status === 'connected' ? 'success' : 'muted'}>{instance.status ?? 'desconhecido'}</Badge>}
              />
              <div className="space-y-4 p-5">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Mensagem automática</label>
                  <textarea
                    value={draft.message}
                    onChange={(e) => setDrafts((d) => ({ ...d, [instance.id]: { ...draft, message: e.target.value } }))}
                    rows={4}
                    className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-primary/40"
                    placeholder="Olá! Vi que sua conversa ficou pendente, posso te ajudar?"
                  />
                </div>
                <div className="max-w-xs">
                  <label className="mb-1.5 block text-sm font-medium">Delay de envio (minutos)</label>
                  <Input
                    type="number"
                    min={0}
                    value={draft.delay}
                    onChange={(e) => setDrafts((d) => ({ ...d, [instance.id]: { ...draft, delay: Number(e.target.value) } }))}
                  />
                </div>
                <Button onClick={() => save.mutate(instance)} disabled={save.isPending}>
                  <Save className="h-4 w-4" />
                  Salvar alterações
                </Button>
              </div>
            </Card>
          );
        })
      )}
    </div>
  );
}
