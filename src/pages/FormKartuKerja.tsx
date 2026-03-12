import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Send, CheckCircle } from 'lucide-react';
import { z } from 'zod';

const formSchema = z.object({
  tanggalPekerjaan: z.string().min(1, 'Tanggal pekerjaan wajib diisi'),
  areaKerjaId: z.string().min(1, 'Area kerja wajib dipilih'),
  typeKkId: z.string().min(1, 'Type kartu kerja wajib dipilih'),
  jenisPekerjaanId: z.string().min(1, 'Jenis pekerjaan wajib dipilih'),
  picEmId: z.string().min(1, 'PIC EM wajib dipilih'),
  deskripsiPekerjaan: z.string().min(1, 'Deskripsi pekerjaan wajib diisi'),
  jamMulai: z.string().min(1, 'Jam mulai wajib diisi'),
});

interface MasterData {
  areaKerja: any[];
  typeKk: any[];
  jenisPekerjaan: any[];
  picEm: any[];
  factories: any[];
}

const FormKartuKerja: React.FC = () => {
  const { user, kontraktorId, kontraktorName, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [masterData, setMasterData] = useState<MasterData>({
    areaKerja: [],
    typeKk: [],
    jenisPekerjaan: [],
    picEm: [],
    factories: [],
  });

  const [formData, setFormData] = useState({
    tanggalPekerjaan: '',
    areaKerjaId: '',
    typeKkId: '',
    jenisPekerjaanId: '',
    picEmId: '',
    deskripsiPekerjaan: '',
    jamMulai: '',
    jamSelesai: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastIdKartuKerja, setLastIdKartuKerja] = useState<string | null>(null);

  const today = new Date().toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  });

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    const fetchMasterData = async () => {
      const [areaKerjaRes, typeKkRes, jenisPekerjaanRes, picEmRes, factoriesRes] = await Promise.all([
        supabase.from('area_kerja').select('*, factories(factory)'),
        supabase.from('type_kartu_kerja').select('*').order('no'),
        supabase.from('jenis_pekerjaan').select('*').order('no'),
        supabase.from('pic_em').select('*'),
        supabase.from('factories').select('*').order('no'),
      ]);

      setMasterData({
        areaKerja: areaKerjaRes.data || [],
        typeKk: typeKkRes.data || [],
        jenisPekerjaan: jenisPekerjaanRes.data || [],
        picEm: picEmRes.data || [],
        factories: factoriesRes.data || [],
      });
    };

    fetchMasterData();
  }, []);

  const generateIdKartuKerja = async (): Promise<string> => {
    // Get selected data for ID generation
    const selectedArea = masterData.areaKerja.find(a => a.id === formData.areaKerjaId);
    const selectedFactory = masterData.factories.find(f => f.id === selectedArea?.factory_id);
    const selectedTypeKk = masterData.typeKk.find(t => t.id === formData.typeKkId);
    const selectedJenisPekerjaan = masterData.jenisPekerjaan.find(j => j.id === formData.jenisPekerjaanId);

    // Calculate date difference correctly (comparing dates only, not time)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tanggalPekerjaan = new Date(formData.tanggalPekerjaan);
    tanggalPekerjaan.setHours(0, 0, 0, 0);
    
    const diffTime = tanggalPekerjaan.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    // Use absolute value for the digit, capped at 9
    const digit4 = Math.min(Math.abs(diffDays), 9);

    // Get current count for sequence
    const { count } = await supabase
      .from('kartu_kerja')
      .select('id', { count: 'exact' });

    const sequence = ((count || 0) + 1).toString().padStart(6, '0');

    // Build ID: D1-Factory, D2-TypeKK, D3-JenisPekerjaan, D4-DateDiff, D5-10-Sequence
    const digit1 = (selectedFactory?.no || 1).toString();
    const digit2 = (selectedTypeKk?.no || 1).toString();
    const digit3 = (selectedJenisPekerjaan?.no || 1).toString();

    return `${digit1}${digit2}${digit3}${digit4}${sequence}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validation = formSchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    if (!kontraktorId) {
      toast({
        title: 'Error',
        description: 'Akun kontraktor tidak ditemukan. Silakan hubungi administrator.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const idKartuKerja = await generateIdKartuKerja();

      const { error } = await supabase.from('kartu_kerja').insert({
        id_kartu_kerja: idKartuKerja,
        kontraktor_id: kontraktorId,
        user_id: user!.id,
        tanggal_pekerjaan: formData.tanggalPekerjaan,
        area_kerja_id: formData.areaKerjaId,
        type_kk_id: formData.typeKkId,
        jenis_pekerjaan_id: formData.jenisPekerjaanId,
        pic_em_id: formData.picEmId,
        deskripsi_pekerjaan: formData.deskripsiPekerjaan,
        jam_mulai: formData.jamMulai,
        jam_selesai: formData.jamSelesai || null,
      });

      if (error) {
        throw error;
      }

      setLastIdKartuKerja(idKartuKerja);
      toast({
        title: 'Berhasil',
        description: `Kartu Kerja berhasil dibuat dengan ID: ${idKartuKerja}`,
      });

      // Reset form
      setFormData({
        tanggalPekerjaan: '',
        areaKerjaId: '',
        typeKkId: '',
        jenisPekerjaanId: '',
        picEmId: '',
        deskripsiPekerjaan: '',
        jamMulai: '',
        jamSelesai: '',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Terjadi kesalahan saat menyimpan data',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <div className="p-2 rounded-lg gradient-secondary">
              <FileText className="w-6 h-6 text-secondary-foreground" />
            </div>
            Form Kartu Kerja
          </h1>
          <p className="text-muted-foreground mt-1">
            Isi formulir untuk membuat perizinan kerja baru
          </p>
        </div>

        {lastIdKartuKerja && (
          <Card className="border-secondary bg-secondary/5">
            <CardContent className="flex items-center gap-4 py-4">
              <div className="p-2 rounded-full bg-secondary/20">
                <CheckCircle className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="font-medium text-foreground">
                  Kartu Kerja terakhir berhasil dibuat
                </p>
                <p className="text-sm text-muted-foreground">
                  ID Kartu Kerja:{' '}
                  <span className="font-mono font-bold text-secondary">
                    {lastIdKartuKerja}
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-border">
          <CardHeader>
            <CardTitle>Informasi Pekerjaan</CardTitle>
            <CardDescription>
              Lengkapi semua field yang diperlukan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Read-only fields */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Tanggal Input</Label>
                  <Input value={today} disabled className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label>Nama Kontraktor</Label>
                  <Input value={kontraktorName || '-'} disabled className="bg-muted" />
                </div>
              </div>

              {/* Editable fields */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="tanggalPekerjaan">Tanggal Pekerjaan *</Label>
                  <Input
                    id="tanggalPekerjaan"
                    type="date"
                    value={formData.tanggalPekerjaan}
                    onChange={(e) => setFormData({ ...formData, tanggalPekerjaan: e.target.value })}
                    className={errors.tanggalPekerjaan ? 'border-destructive' : ''}
                  />
                  {errors.tanggalPekerjaan && (
                    <p className="text-sm text-destructive">{errors.tanggalPekerjaan}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="areaKerja">Area Kerja *</Label>
                  <Select
                    value={formData.areaKerjaId}
                    onValueChange={(value) => setFormData({ ...formData, areaKerjaId: value })}
                  >
                    <SelectTrigger className={errors.areaKerjaId ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Pilih area kerja..." />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      {masterData.areaKerja.map((area) => (
                        <SelectItem key={area.id} value={area.id}>
                          {(area.factories as any)?.factory} - {area.department} - {area.section}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.areaKerjaId && (
                    <p className="text-sm text-destructive">{errors.areaKerjaId}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="typeKk">Type Kartu Kerja *</Label>
                  <Select
                    value={formData.typeKkId}
                    onValueChange={(value) => setFormData({ ...formData, typeKkId: value })}
                  >
                    <SelectTrigger className={errors.typeKkId ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Pilih type KK..." />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      {masterData.typeKk.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.type_kk}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.typeKkId && (
                    <p className="text-sm text-destructive">{errors.typeKkId}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jenisPekerjaan">Jenis Pekerjaan *</Label>
                  <Select
                    value={formData.jenisPekerjaanId}
                    onValueChange={(value) => setFormData({ ...formData, jenisPekerjaanId: value })}
                  >
                    <SelectTrigger className={errors.jenisPekerjaanId ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Pilih jenis pekerjaan..." />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      {masterData.jenisPekerjaan.map((jenis) => (
                        <SelectItem key={jenis.id} value={jenis.id}>
                          {jenis.jenis_pekerjaan}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.jenisPekerjaanId && (
                    <p className="text-sm text-destructive">{errors.jenisPekerjaanId}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="picEm">Nama PIC EM *</Label>
                  <Select
                    value={formData.picEmId}
                    onValueChange={(value) => setFormData({ ...formData, picEmId: value })}
                  >
                    <SelectTrigger className={errors.picEmId ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Pilih PIC EM..." />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      {masterData.picEm.map((pic) => (
                        <SelectItem key={pic.id} value={pic.id}>
                          {pic.nama_pic_em}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.picEmId && (
                    <p className="text-sm text-destructive">{errors.picEmId}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jamMulai">Jam Mulai * (format: HH:MM)</Label>
                  <Input
                    id="jamMulai"
                    type="text"
                    placeholder="00:00"
                    pattern="^([01]?[0-9]|2[0-3]):[0-5][0-9]$"
                    value={formData.jamMulai}
                    onChange={(e) => {
                      let value = e.target.value.replace(/[^0-9:]/g, '');
                      if (value.length === 2 && !value.includes(':')) {
                        value = value + ':';
                      }
                      if (value.length <= 5) {
                        setFormData({ ...formData, jamMulai: value });
                      }
                    }}
                    className={errors.jamMulai ? 'border-destructive' : ''}
                    maxLength={5}
                  />
                  {errors.jamMulai && (
                    <p className="text-sm text-destructive">{errors.jamMulai}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jamSelesai">Jam Selesai (format: HH:MM)</Label>
                  <Input
                    id="jamSelesai"
                    type="text"
                    placeholder="00:00"
                    pattern="^([01]?[0-9]|2[0-3]):[0-5][0-9]$"
                    value={formData.jamSelesai}
                    onChange={(e) => {
                      let value = e.target.value.replace(/[^0-9:]/g, '');
                      if (value.length === 2 && !value.includes(':')) {
                        value = value + ':';
                      }
                      if (value.length <= 5) {
                        setFormData({ ...formData, jamSelesai: value });
                      }
                    }}
                    maxLength={5}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deskripsiPekerjaan">Deskripsi Pekerjaan *</Label>
                <Textarea
                  id="deskripsiPekerjaan"
                  placeholder="Jelaskan detail pekerjaan yang akan dilakukan..."
                  value={formData.deskripsiPekerjaan}
                  onChange={(e) => setFormData({ ...formData, deskripsiPekerjaan: e.target.value })}
                  className={errors.deskripsiPekerjaan ? 'border-destructive' : ''}
                  rows={4}
                />
                {errors.deskripsiPekerjaan && (
                  <p className="text-sm text-destructive">{errors.deskripsiPekerjaan}</p>
                )}
              </div>

              <Button
                type="submit"
                variant="gradient-secondary"
                size="lg"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  'Menyimpan...'
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Submit Kartu Kerja
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default FormKartuKerja;
