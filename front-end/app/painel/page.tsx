'use client';

import { useCallback, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { useAuth } from '@/app/contexts/AuthContext';
import { systemApi } from '@/app/services/api';

// Quem pode abrir o painel. O servidor confere de novo (ADMIN_EMAILS); esta lista só controla a tela.
const ADMIN_EMAILS = ['isaiascbluz@gmail.com', 'gabrielmerola12@gmail.com'];
const REFRESH_MS = 15000;

type Clinic = { clinic_id: string; status: string; created_at: string; expires_at?: string };
type Status = {
  motor_online: boolean;
  clinics_total: number;
  clinics_by_status: Record<string, number>;
  wizard_uptime_s: number;
  wizard_heap_mb: number;
  wizard_goroutines: number;
  generated_at: string;
};

function formatUptime(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${h}h ${m}min`;
}

export default function PainelPage() {
  const { token, userEmail } = useAuth();
  const [status, setStatus] = useState<Status | null>(null);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const allowed = !!userEmail && ADMIN_EMAILS.includes(userEmail.toLowerCase());

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const [s, c] = await Promise.all([systemApi.adminStatus(token), systemApi.adminClinics(token)]);
      setStatus(s);
      setClinics(Array.isArray(c) ? c : []);
      setError('');
    } catch (err: any) {
      setError(err?.message || 'Não foi possível carregar o painel.');
    }
  }, [token]);

  useEffect(() => {
    if (!allowed) return;
    load();
    const timer = setInterval(load, REFRESH_MS);
    return () => clearInterval(timer);
  }, [allowed, load]);

  const destroy = async (id: string) => {
    if (!token) return;
    if (!window.confirm(`Desligar a clínica ${id}? Os recursos da AWS serão destruídos.`)) return;
    setBusyId(id);
    try {
      await systemApi.destroyClinic(token, id);
      await load();
    } catch (err: any) {
      setError(err?.message || 'Não foi possível desligar a clínica.');
    } finally {
      setBusyId(null);
    }
  };

  if (!token || !userEmail) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="info">Entre com a conta de administrador para abrir o painel.</Alert>
      </Box>
    );
  }

  if (!allowed) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">Acesso restrito a administradores.</Alert>
      </Box>
    );
  }

  const byStatus = status?.clinics_by_status || {};
  const cards: Array<{ label: string; value: string }> = [
    { label: 'Motor', value: status ? (status.motor_online ? 'Online' : 'Offline') : '—' },
    { label: 'Clínicas (total)', value: String(status?.clinics_total ?? '—') },
    { label: 'Prontas', value: String(byStatus['ready'] ?? 0) },
    { label: 'Em provisionamento', value: String((byStatus['provisioning'] ?? 0) + (byStatus['creating'] ?? 0)) },
    { label: 'Desligadas', value: String(byStatus['destroyed'] ?? 0) },
    { label: 'Uptime do wizard', value: status ? formatUptime(status.wizard_uptime_s) : '—' },
    { label: 'Memória do wizard', value: status ? `${status.wizard_heap_mb} MB` : '—' },
    { label: 'Goroutines', value: String(status?.wizard_goroutines ?? '—') },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1100, mx: 'auto' }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>Painel de controle</Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
        Atualiza a cada 15 segundos{status ? ` • última leitura ${new Date(status.generated_at).toLocaleTimeString('pt-BR')}` : ''}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, mb: 3 }}>
        {cards.map((c) => (
          <Paper key={c.label} sx={{ p: 2 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{c.label}</Typography>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>{c.value}</Typography>
          </Paper>
        ))}
      </Box>

      <Paper sx={{ p: 2, overflowX: 'auto' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Clínicas na AWS</Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Clínica</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Criada em</TableCell>
              <TableCell>Expira em</TableCell>
              <TableCell align="right">Ação</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clinics.length === 0 && (
              <TableRow><TableCell colSpan={5}>Nenhuma clínica registrada.</TableCell></TableRow>
            )}
            {clinics.map((c) => (
              <TableRow key={c.clinic_id}>
                <TableCell sx={{ fontFamily: 'monospace' }}>{c.clinic_id.slice(0, 8)}</TableCell>
                <TableCell><Chip size="small" label={c.status} /></TableCell>
                <TableCell>{new Date(c.created_at).toLocaleString('pt-BR')}</TableCell>
                <TableCell>{c.expires_at ? new Date(c.expires_at).toLocaleString('pt-BR') : '—'}</TableCell>
                <TableCell align="right">
                  {c.status !== 'destroyed' && (
                    <Button
                      size="small"
                      color="error"
                      variant="outlined"
                      disabled={busyId === c.clinic_id}
                      onClick={() => destroy(c.clinic_id)}
                    >
                      Desligar
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
