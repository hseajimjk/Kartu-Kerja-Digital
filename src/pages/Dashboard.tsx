import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { FileText, ListTodo, Users, Building2, ArrowRight, Clock } from 'lucide-react';

interface Stats {
  totalKartuKerja: number;
  kartuKerjaHariIni: number;
  totalKontraktor: number;
  totalFactory: number;
}

const Dashboard: React.FC = () => {
  const { user, isAdmin, kontraktorName, kontraktorId, isLoading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({
    totalKartuKerja: 0,
    kartuKerjaHariIni: 0,
    totalKontraktor: 0,
    totalFactory: 0,
  });
  const [recentWorks, setRecentWorks] = useState<any[]>([]);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];

      // Fetch kartu kerja count
      let kartuKerjaQuery = supabase.from('kartu_kerja').select('id', { count: 'exact' });
      let kartuKerjaHariIniQuery = supabase
        .from('kartu_kerja')
        .select('id', { count: 'exact' })
        .eq('tanggal_input', today);

      if (!isAdmin && kontraktorId) {
        kartuKerjaQuery = kartuKerjaQuery.eq('kontraktor_id', kontraktorId);
        kartuKerjaHariIniQuery = kartuKerjaHariIniQuery.eq('kontraktor_id', kontraktorId);
      }

      const [kartuKerjaResult, kartuKerjaHariIniResult] = await Promise.all([
        kartuKerjaQuery,
        kartuKerjaHariIniQuery,
      ]);

      // Fetch kontraktor and factory count (admin only)
      let totalKontraktor = 0;
      let totalFactory = 0;

      if (isAdmin) {
        const [kontraktorResult, factoryResult] = await Promise.all([
          supabase.from('kontraktors').select('id', { count: 'exact' }),
          supabase.from('factories').select('id', { count: 'exact' }),
        ]);
        totalKontraktor = kontraktorResult.count || 0;
        totalFactory = factoryResult.count || 0;
      }

      setStats({
        totalKartuKerja: kartuKerjaResult.count || 0,
        kartuKerjaHariIni: kartuKerjaHariIniResult.count || 0,
        totalKontraktor,
        totalFactory,
      });

      // Fetch recent works
      let recentQuery = supabase
        .from('kartu_kerja')
        .select(`
          id,
          id_kartu_kerja,
          tanggal_pekerjaan,
          deskripsi_pekerjaan,
          jam_mulai,
          kontraktors(nama_kontraktor),
          type_kartu_kerja(type_kk)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (!isAdmin && kontraktorId) {
        recentQuery = recentQuery.eq('kontraktor_id', kontraktorId);
      }

      const { data: recentData } = await recentQuery;
      setRecentWorks(recentData || []);
    };

    fetchStats();
  }, [user, isAdmin, kontraktorId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Memuat...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Selamat Datang, {kontraktorName || user.email?.split('@')[0]}!
          </h1>
          <p className="text-muted-foreground mt-1">
            {isAdmin
              ? 'Kelola sistem kartu kerja dan data master'
              : 'Kelola perizinan kerja Anda dengan mudah'}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border hover:border-secondary/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Kartu Kerja
              </CardTitle>
              <div className="p-2 rounded-lg gradient-secondary">
                <FileText className="w-4 h-4 text-secondary-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats.totalKartuKerja}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Semua perizinan kerja
              </p>
            </CardContent>
          </Card>

          <Card className="border-border hover:border-secondary/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Hari Ini
              </CardTitle>
              <div className="p-2 rounded-lg gradient-accent">
                <Clock className="w-4 h-4 text-accent-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats.kartuKerjaHariIni}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Kartu kerja hari ini
              </p>
            </CardContent>
          </Card>

          {isAdmin && (
            <>
              <Card className="border-border hover:border-secondary/50 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Kontraktor
                  </CardTitle>
                  <div className="p-2 rounded-lg gradient-primary">
                    <Users className="w-4 h-4 text-primary-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{stats.totalKontraktor}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Kontraktor terdaftar
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border hover:border-secondary/50 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Factory
                  </CardTitle>
                  <div className="p-2 rounded-lg bg-muted">
                    <Building2 className="w-4 h-4 text-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{stats.totalFactory}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Factory terdaftar
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-border hover:border-secondary/50 transition-all hover:shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 rounded-lg gradient-secondary">
                  <FileText className="w-5 h-5 text-secondary-foreground" />
                </div>
                Form Kartu Kerja
              </CardTitle>
              <CardDescription>
                Buat perizinan kerja baru dengan mengisi formulir
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="gradient-secondary"
                onClick={() => navigate('/dashboard/form-kartu-kerja')}
                className="group"
              >
                Buat Kartu Kerja
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border hover:border-secondary/50 transition-all hover:shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 rounded-lg gradient-primary">
                  <ListTodo className="w-5 h-5 text-primary-foreground" />
                </div>
                Daftar Pekerjaan
              </CardTitle>
              <CardDescription>
                Lihat semua daftar pekerjaan yang sudah tercatat
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="gradient"
                onClick={() => navigate('/dashboard/daftar-pekerjaan')}
                className="group"
              >
                Lihat Daftar
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Works */}
        {recentWorks.length > 0 && (
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Pekerjaan Terbaru</CardTitle>
              <CardDescription>
                5 pekerjaan terakhir yang tercatat
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentWorks.map((work) => (
                  <div
                    key={work.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-semibold text-secondary">
                          {work.id_kartu_kerja}
                        </span>
                        <span className="px-2 py-0.5 text-xs rounded-full bg-secondary/10 text-secondary">
                          {(work.type_kartu_kerja as any)?.type_kk}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate mt-1">
                        {work.deskripsi_pekerjaan}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-sm font-medium text-foreground">
                        {formatDate(work.tanggal_pekerjaan)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {work.jam_mulai?.slice(0, 5)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
