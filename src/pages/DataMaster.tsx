import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Database, Plus, Edit2, Trash2, Building2, Users, MapPin, UserCheck, FileText, Briefcase, Mail, KeyRound } from 'lucide-react';

const DataMaster: React.FC = () => {
  const { user, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('kontraktors');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);

  // Data states
  const [kontraktors, setKontraktors] = useState<any[]>([]);
  const [factories, setFactories] = useState<any[]>([]);
  const [areaKerja, setAreaKerja] = useState<any[]>([]);
  const [picEm, setPicEm] = useState<any[]>([]);
  const [typeKk, setTypeKk] = useState<any[]>([]);
  const [jenisPekerjaan, setJenisPekerjaan] = useState<any[]>([]);
  const [akunKontraktor, setAkunKontraktor] = useState<any[]>([]);

  // Form states
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    }
    if (!isLoading && user && !isAdmin) {
      navigate('/dashboard');
    }
  }, [user, isAdmin, isLoading, navigate]);

  const fetchAllData = async () => {
    const [
      kontraktorRes,
      factoryRes,
      areaRes,
      picRes,
      typeRes,
      jenisRes,
      akunRes,
    ] = await Promise.all([
      supabase.from('kontraktors').select('*').order('no'),
      supabase.from('factories').select('*').order('no'),
      supabase.from('area_kerja').select('*, factories(factory)').order('created_at'),
      supabase.from('pic_em').select('*').order('nama_pic_em'),
      supabase.from('type_kartu_kerja').select('*').order('no'),
      supabase.from('jenis_pekerjaan').select('*').order('no'),
      supabase.from('akun_kontraktor').select('*, kontraktors(nama_kontraktor)').order('created_at'),
    ]);

    setKontraktors(kontraktorRes.data || []);
    setFactories(factoryRes.data || []);
    setAreaKerja(areaRes.data || []);
    setPicEm(picRes.data || []);
    setTypeKk(typeRes.data || []);
    setJenisPekerjaan(jenisRes.data || []);
    setAkunKontraktor(akunRes.data || []);
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleAdd = async () => {
    try {
      let error;

      switch (activeTab) {
        case 'kontraktors':
          ({ error } = await supabase.from('kontraktors').insert({
            nama_kontraktor: formData.nama_kontraktor,
            id_kont: formData.id_kont,
          }));
          break;
        case 'factories':
          ({ error } = await supabase.from('factories').insert({
            factory: formData.factory,
          }));
          break;
        case 'area_kerja':
          ({ error } = await supabase.from('area_kerja').insert({
            factory_id: formData.factory_id,
            department: formData.department,
            section: formData.section,
          }));
          break;
        case 'pic_em':
          ({ error } = await supabase.from('pic_em').insert({
            nama_pic_em: formData.nama_pic_em,
          }));
          break;
        case 'type_kartu_kerja':
          ({ error } = await supabase.from('type_kartu_kerja').insert({
            type_kk: formData.type_kk,
          }));
          break;
        case 'jenis_pekerjaan':
          ({ error } = await supabase.from('jenis_pekerjaan').insert({
            jenis_pekerjaan: formData.jenis_pekerjaan,
          }));
          break;
      }

      if (error) throw error;

      toast({ title: 'Berhasil', description: 'Data berhasil ditambahkan' });
      setIsDialogOpen(false);
      setFormData({});
      fetchAllData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleUpdate = async () => {
    try {
      let error;

      switch (activeTab) {
        case 'kontraktors':
          ({ error } = await supabase.from('kontraktors').update({
            nama_kontraktor: formData.nama_kontraktor,
            id_kont: formData.id_kont,
          }).eq('id', editItem.id));
          break;
        case 'factories':
          ({ error } = await supabase.from('factories').update({
            factory: formData.factory,
          }).eq('id', editItem.id));
          break;
        case 'area_kerja':
          ({ error } = await supabase.from('area_kerja').update({
            factory_id: formData.factory_id,
            department: formData.department,
            section: formData.section,
          }).eq('id', editItem.id));
          break;
        case 'pic_em':
          ({ error } = await supabase.from('pic_em').update({
            nama_pic_em: formData.nama_pic_em,
          }).eq('id', editItem.id));
          break;
        case 'type_kartu_kerja':
          ({ error } = await supabase.from('type_kartu_kerja').update({
            type_kk: formData.type_kk,
          }).eq('id', editItem.id));
          break;
        case 'jenis_pekerjaan':
          ({ error } = await supabase.from('jenis_pekerjaan').update({
            jenis_pekerjaan: formData.jenis_pekerjaan,
          }).eq('id', editItem.id));
          break;
      }

      if (error) throw error;

      toast({ title: 'Berhasil', description: 'Data berhasil diperbarui' });
      setIsDialogOpen(false);
      setFormData({});
      setEditItem(null);
      fetchAllData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string, table: 'kontraktors' | 'factories' | 'area_kerja' | 'pic_em' | 'type_kartu_kerja' | 'jenis_pekerjaan') => {
    if (!confirm('Apakah Anda yakin ingin menghapus data ini?')) return;

    try {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;

      toast({ title: 'Berhasil', description: 'Data berhasil dihapus' });
      fetchAllData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleResetPassword = async (userId: string, email: string) => {
    if (!confirm(`Apakah Anda yakin ingin mereset password untuk ${email} ke password default (12345678)?`)) return;

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/reset-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionData.session?.access_token}`,
          },
          body: JSON.stringify({ user_id: userId }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Gagal mereset password');
      }

      toast({
        title: 'Berhasil',
        description: `Password untuk ${email} berhasil direset ke 12345678`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (item: any) => {
    setEditItem(item);
    setFormData(item);
    setIsDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditItem(null);
    setFormData({});
    setIsDialogOpen(true);
  };

  const renderForm = () => {
    switch (activeTab) {
      case 'kontraktors':
        return (
          <>
            <div className="space-y-2">
              <Label>Nama Kontraktor</Label>
              <Input
                value={formData.nama_kontraktor || ''}
                onChange={(e) => setFormData({ ...formData, nama_kontraktor: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>ID Kontraktor</Label>
              <Input
                value={formData.id_kont || ''}
                onChange={(e) => setFormData({ ...formData, id_kont: e.target.value })}
              />
            </div>
          </>
        );
      case 'factories':
        return (
          <div className="space-y-2">
            <Label>Nama Factory</Label>
            <Input
              value={formData.factory || ''}
              onChange={(e) => setFormData({ ...formData, factory: e.target.value })}
            />
          </div>
        );
      case 'area_kerja':
        return (
          <>
            <div className="space-y-2">
              <Label>Factory</Label>
              <Select
                value={formData.factory_id || ''}
                onValueChange={(value) => setFormData({ ...formData, factory_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih factory..." />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  {factories.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.factory}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Input
                value={formData.department || ''}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Section</Label>
              <Input
                value={formData.section || ''}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
              />
            </div>
          </>
        );
      case 'pic_em':
        return (
          <div className="space-y-2">
            <Label>Nama PIC EM</Label>
            <Input
              value={formData.nama_pic_em || ''}
              onChange={(e) => setFormData({ ...formData, nama_pic_em: e.target.value })}
            />
          </div>
        );
      case 'type_kartu_kerja':
        return (
          <div className="space-y-2">
            <Label>Type Kartu Kerja</Label>
            <Input
              value={formData.type_kk || ''}
              onChange={(e) => setFormData({ ...formData, type_kk: e.target.value })}
            />
          </div>
        );
      case 'jenis_pekerjaan':
        return (
          <div className="space-y-2">
            <Label>Jenis Pekerjaan</Label>
            <Input
              value={formData.jenis_pekerjaan || ''}
              onChange={(e) => setFormData({ ...formData, jenis_pekerjaan: e.target.value })}
            />
          </div>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Memuat...</div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  const tabs = [
    { value: 'kontraktors', label: 'Kontraktor', icon: Users, count: kontraktors.length },
    { value: 'factories', label: 'Factory', icon: Building2, count: factories.length },
    { value: 'area_kerja', label: 'Area Kerja', icon: MapPin, count: areaKerja.length },
    { value: 'pic_em', label: 'PIC EM', icon: UserCheck, count: picEm.length },
    { value: 'type_kartu_kerja', label: 'Type KK', icon: FileText, count: typeKk.length },
    { value: 'jenis_pekerjaan', label: 'Jenis Pekerjaan', icon: Briefcase, count: jenisPekerjaan.length },
    { value: 'akun_kontraktor', label: 'Akun Kontraktor', icon: Mail, count: akunKontraktor.length },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <div className="p-2 rounded-lg gradient-primary">
              <Database className="w-6 h-6 text-primary-foreground" />
            </div>
            Data Master
          </h1>
          <p className="text-muted-foreground mt-1">
            Kelola semua data master sistem
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex flex-wrap gap-2 h-auto p-2 bg-muted/50">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex items-center gap-2 data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground"
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="px-1.5 py-0.5 text-xs rounded-full bg-background/50">
                  {tab.count}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>

          {tabs.slice(0, -1).map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="mt-6">
              <Card className="border-border">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>{tab.label}</CardTitle>
                    <CardDescription>
                      Kelola data {tab.label.toLowerCase()}
                    </CardDescription>
                  </div>
                  <Dialog open={isDialogOpen && activeTab === tab.value} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="gradient-secondary" onClick={openAddDialog}>
                        <Plus className="w-4 h-4 mr-2" />
                        Tambah
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-card">
                      <DialogHeader>
                        <DialogTitle>
                          {editItem ? 'Edit' : 'Tambah'} {tab.label}
                        </DialogTitle>
                        <DialogDescription>
                          {editItem ? 'Perbarui' : 'Masukkan'} data {tab.label.toLowerCase()}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        {renderForm()}
                      </div>
                      <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                          Batal
                        </Button>
                        <Button
                          variant="gradient-secondary"
                          onClick={editItem ? handleUpdate : handleAdd}
                        >
                          {editItem ? 'Simpan' : 'Tambah'}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>No</TableHead>
                        {tab.value === 'kontraktors' && (
                          <>
                            <TableHead>Nama Kontraktor</TableHead>
                            <TableHead>ID Kont</TableHead>
                          </>
                        )}
                        {tab.value === 'factories' && <TableHead>Factory</TableHead>}
                        {tab.value === 'area_kerja' && (
                          <>
                            <TableHead>Factory</TableHead>
                            <TableHead>Department</TableHead>
                            <TableHead>Section</TableHead>
                          </>
                        )}
                        {tab.value === 'pic_em' && <TableHead>Nama PIC EM</TableHead>}
                        {tab.value === 'type_kartu_kerja' && <TableHead>Type KK</TableHead>}
                        {tab.value === 'jenis_pekerjaan' && <TableHead>Jenis Pekerjaan</TableHead>}
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tab.value === 'kontraktors' &&
                        kontraktors.map((item, index) => (
                          <TableRow key={item.id} className="hover:bg-muted/30">
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{item.nama_kontraktor}</TableCell>
                            <TableCell>{item.id_kont}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" onClick={() => openEditDialog(item)}>
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive"
                                onClick={() => handleDelete(item.id, 'kontraktors')}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      {tab.value === 'factories' &&
                        factories.map((item, index) => (
                          <TableRow key={item.id} className="hover:bg-muted/30">
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{item.factory}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" onClick={() => openEditDialog(item)}>
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive"
                                onClick={() => handleDelete(item.id, 'factories')}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      {tab.value === 'area_kerja' &&
                        areaKerja.map((item, index) => (
                          <TableRow key={item.id} className="hover:bg-muted/30">
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{(item.factories as any)?.factory}</TableCell>
                            <TableCell>{item.department}</TableCell>
                            <TableCell>{item.section}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" onClick={() => openEditDialog(item)}>
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive"
                                onClick={() => handleDelete(item.id, 'area_kerja')}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      {tab.value === 'pic_em' &&
                        picEm.map((item, index) => (
                          <TableRow key={item.id} className="hover:bg-muted/30">
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{item.nama_pic_em}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" onClick={() => openEditDialog(item)}>
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive"
                                onClick={() => handleDelete(item.id, 'pic_em')}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      {tab.value === 'type_kartu_kerja' &&
                        typeKk.map((item, index) => (
                          <TableRow key={item.id} className="hover:bg-muted/30">
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{item.type_kk}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" onClick={() => openEditDialog(item)}>
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive"
                                onClick={() => handleDelete(item.id, 'type_kartu_kerja')}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      {tab.value === 'jenis_pekerjaan' &&
                        jenisPekerjaan.map((item, index) => (
                          <TableRow key={item.id} className="hover:bg-muted/30">
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{item.jenis_pekerjaan}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" onClick={() => openEditDialog(item)}>
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive"
                                onClick={() => handleDelete(item.id, 'jenis_pekerjaan')}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          ))}

          {/* Akun Kontraktor Tab - Read Only */}
          <TabsContent value="akun_kontraktor" className="mt-6">
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Akun Kontraktor</CardTitle>
                <CardDescription>
                  Daftar akun yang terdaftar dalam sistem. Password default setelah reset: <strong>12345678</strong>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>No</TableHead>
                      <TableHead>Nama Kontraktor</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Tanggal Daftar</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {akunKontraktor.map((item, index) => (
                      <TableRow key={item.id} className="hover:bg-muted/30">
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{(item.kontraktors as any)?.nama_kontraktor}</TableCell>
                        <TableCell>{item.email}</TableCell>
                        <TableCell>
                          {new Date(item.created_at).toLocaleDateString('id-ID')}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1"
                            onClick={() => handleResetPassword(item.user_id, item.email)}
                          >
                            <KeyRound className="w-4 h-4" />
                            Reset Password
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default DataMaster;
