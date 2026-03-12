import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { ListTodo, Search, Filter, Download, FileSpreadsheet, FileText, X, ChevronLeft, ChevronRight, Printer } from 'lucide-react';
import PrintPreviewDaftarPekerjaan from '@/components/PrintPreviewDaftarPekerjaan';
interface KartuKerja {
  id: string;
  id_kartu_kerja: string;
  tanggal_input: string;
  tanggal_pekerjaan: string;
  deskripsi_pekerjaan: string;
  jam_mulai: string;
  jam_selesai: string | null;
  kontraktors: { nama_kontraktor: string };
  area_kerja: { department: string; section: string; factories: { factory: string } };
  type_kartu_kerja: { type_kk: string };
  jenis_pekerjaan: { jenis_pekerjaan: string };
  pic_em: { nama_pic_em: string };
}

interface FilterState {
  search: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  areaKerjaId: string;
  typeKkId: string;
  jenisPekerjaanId: string;
}

const DaftarPekerjaan: React.FC = () => {
  const { user, isAdmin, kontraktorId, isLoading } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState<KartuKerja[]>([]);
  const [filteredData, setFilteredData] = useState<KartuKerja[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const printRef = useRef<HTMLDivElement>(null);
  const [printPeriod, setPrintPeriod] = useState({
    tanggalMulai: '',
    tanggalSelesai: '',
  });
  const itemsPerPage = 10;

  const [filters, setFilters] = useState<FilterState>({
    search: '',
    tanggalMulai: '',
    tanggalSelesai: '',
    areaKerjaId: '',
    typeKkId: '',
    jenisPekerjaanId: '',
  });

  const [masterData, setMasterData] = useState({
    areaKerja: [] as any[],
    typeKk: [] as any[],
    jenisPekerjaan: [] as any[],
  });

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      setIsDataLoading(true);

      let query = supabase
        .from('kartu_kerja')
        .select(`
          *,
          kontraktors(nama_kontraktor),
          area_kerja(department, section, factories(factory)),
          type_kartu_kerja(type_kk),
          jenis_pekerjaan(jenis_pekerjaan),
          pic_em(nama_pic_em)
        `)
        .order('created_at', { ascending: false });

      if (!isAdmin && kontraktorId) {
        query = query.eq('kontraktor_id', kontraktorId);
      }

      const { data: kartuKerjaData } = await query;
      setData((kartuKerjaData as any[]) || []);
      setFilteredData((kartuKerjaData as any[]) || []);

      // Fetch master data for filters
      const [areaKerjaRes, typeKkRes, jenisPekerjaanRes] = await Promise.all([
        supabase.from('area_kerja').select('*, factories(factory)'),
        supabase.from('type_kartu_kerja').select('*'),
        supabase.from('jenis_pekerjaan').select('*'),
      ]);

      setMasterData({
        areaKerja: areaKerjaRes.data || [],
        typeKk: typeKkRes.data || [],
        jenisPekerjaan: jenisPekerjaanRes.data || [],
      });

      setIsDataLoading(false);
    };

    fetchData();
  }, [user, isAdmin, kontraktorId]);

  useEffect(() => {
    let result = [...data];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (item) =>
          item.id_kartu_kerja.toLowerCase().includes(searchLower) ||
          item.deskripsi_pekerjaan.toLowerCase().includes(searchLower) ||
          (item.kontraktors as any)?.nama_kontraktor?.toLowerCase().includes(searchLower)
      );
    }

    // Date range filter
    if (filters.tanggalMulai) {
      result = result.filter((item) => item.tanggal_pekerjaan >= filters.tanggalMulai);
    }
    if (filters.tanggalSelesai) {
      result = result.filter((item) => item.tanggal_pekerjaan <= filters.tanggalSelesai);
    }

    // Area kerja filter
    if (filters.areaKerjaId) {
      result = result.filter((item) => (item as any).area_kerja_id === filters.areaKerjaId);
    }

    // Type KK filter
    if (filters.typeKkId) {
      result = result.filter((item) => (item as any).type_kk_id === filters.typeKkId);
    }

    // Jenis pekerjaan filter
    if (filters.jenisPekerjaanId) {
      result = result.filter((item) => (item as any).jenis_pekerjaan_id === filters.jenisPekerjaanId);
    }

    setFilteredData(result);
    setCurrentPage(1);
  }, [filters, data]);

  const resetFilters = () => {
    setFilters({
      search: '',
      tanggalMulai: '',
      tanggalSelesai: '',
      areaKerjaId: '',
      typeKkId: '',
      jenisPekerjaanId: '',
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    });
  };

  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return '-';
    return timeStr.slice(0, 5);
  };

  const exportToCSV = () => {
    const headers = [
      'No',
      'ID KK',
      'Nama Kontraktor',
      'Tanggal Pekerjaan',
      'Type KK',
      'Jenis Pekerjaan',
      'Area Kerja',
      'Deskripsi Pekerjaan',
      'PIC EM',
      'Mulai',
      'Selesai',
      'Tanggal Input',
    ];

    const rows = filteredData.map((item, index) => [
      index + 1,
      item.id_kartu_kerja,
      (item.kontraktors as any)?.nama_kontraktor || '',
      formatDate(item.tanggal_pekerjaan),
      (item.type_kartu_kerja as any)?.type_kk || '',
      (item.jenis_pekerjaan as any)?.jenis_pekerjaan || '',
      `${(item.area_kerja as any)?.factories?.factory || ''} - ${(item.area_kerja as any)?.department || ''} - ${(item.area_kerja as any)?.section || ''}`,
      item.deskripsi_pekerjaan,
      (item.pic_em as any)?.nama_pic_em || '',
      formatTime(item.jam_mulai),
      formatTime(item.jam_selesai),
      formatDate(item.tanggal_input),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `daftar_pekerjaan_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handlePrint = () => {
    // Initialize print period with current filter values
    setPrintPeriod({
      tanggalMulai: filters.tanggalMulai,
      tanggalSelesai: filters.tanggalSelesai,
    });
    setShowPrintPreview(true);
  };

  // Filter data for print based on print period
  const getPrintData = () => {
    let result = [...data];
    if (printPeriod.tanggalMulai) {
      result = result.filter((item) => item.tanggal_pekerjaan >= printPeriod.tanggalMulai);
    }
    if (printPeriod.tanggalSelesai) {
      result = result.filter((item) => item.tanggal_pekerjaan <= printPeriod.tanggalSelesai);
    }
    return result;
  };

  const executePrint = () => {
    if (printRef.current) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Daftar Pekerjaan - Print</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { font-family: Arial, sans-serif; }
              @page { size: A4 landscape; margin: 10mm; }
              table { border-collapse: collapse; width: 100%; }
              th, td { border: 1px solid #666; padding: 4px 8px; text-align: left; font-size: 11px; }
              th { background-color: #f0f0f0; }
              .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 15px; }
              .header h1 { font-size: 18px; text-transform: uppercase; margin-bottom: 8px; }
              .header p { font-size: 11px; margin: 4px 0; }
              .area-header { background-color: #333; color: white; padding: 8px 12px; font-weight: bold; font-size: 14px; margin-top: 20px; }
              .kont-header { background-color: #e0e0e0; padding: 6px 12px; font-weight: 600; border-left: 1px solid #666; border-right: 1px solid #666; }
              .footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #666; text-align: center; font-size: 10px; color: #666; }
              .page-break { page-break-before: always; }
              .no-break { page-break-inside: avoid; }
              tr:nth-child(even) { background-color: #f9f9f9; }
              .font-mono { font-family: monospace; }
            </style>
          </head>
          <body>
            ${printRef.current.innerHTML}
          </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 250);
      }
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <div className="p-2 rounded-lg gradient-primary">
                <ListTodo className="w-6 h-6 text-primary-foreground" />
              </div>
              Daftar Pekerjaan
            </h1>
            <p className="text-muted-foreground mt-1">
              {filteredData.length} pekerjaan ditemukan
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="w-4 h-4" />
              Filter
              {Object.values(filters).some((v) => v !== '') && (
                <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-secondary text-secondary-foreground">
                  {Object.values(filters).filter((v) => v !== '').length}
                </span>
              )}
            </Button>
            <Button variant="outline" onClick={handlePrint} className="gap-2">
              <Printer className="w-4 h-4" />
              Print Preview
            </Button>
            <Button variant="gradient-secondary" onClick={exportToCSV} className="gap-2">
              <FileSpreadsheet className="w-4 h-4" />
              Export Excel
            </Button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <Card className="border-border animate-slide-up">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Filter Data</CardTitle>
                <Button variant="ghost" size="sm" onClick={resetFilters}>
                  <X className="w-4 h-4 mr-1" />
                  Reset
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <Label>Tanggal Pekerjaan (Mulai)</Label>
                  <Input
                    type="date"
                    value={filters.tanggalMulai}
                    onChange={(e) => setFilters({ ...filters, tanggalMulai: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tanggal Pekerjaan (Sampai)</Label>
                  <Input
                    type="date"
                    value={filters.tanggalSelesai}
                    onChange={(e) => setFilters({ ...filters, tanggalSelesai: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Area Kerja</Label>
                  <Select
                    value={filters.areaKerjaId || "all"}
                    onValueChange={(value) => setFilters({ ...filters, areaKerjaId: value === "all" ? "" : value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Semua area" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      <SelectItem value="all">Semua area</SelectItem>
                      {masterData.areaKerja.map((area) => (
                        <SelectItem key={area.id} value={area.id}>
                          {area.factories?.factory} - {area.department}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Type KK</Label>
                  <Select
                    value={filters.typeKkId || "all"}
                    onValueChange={(value) => setFilters({ ...filters, typeKkId: value === "all" ? "" : value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Semua type" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      <SelectItem value="all">Semua type</SelectItem>
                      {masterData.typeKk.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.type_kk}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Jenis Pekerjaan</Label>
                  <Select
                    value={filters.jenisPekerjaanId || "all"}
                    onValueChange={(value) => setFilters({ ...filters, jenisPekerjaanId: value === "all" ? "" : value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Semua jenis" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      <SelectItem value="all">Semua jenis</SelectItem>
                      {masterData.jenisPekerjaan.map((jenis) => (
                        <SelectItem key={jenis.id} value={jenis.id}>
                          {jenis.jenis_pekerjaan}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cari ID KK, deskripsi, atau kontraktor..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="pl-10"
          />
        </div>

        {/* Table */}
        <Card className="border-border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">No</TableHead>
                  <TableHead className="font-semibold">ID KK</TableHead>
                  <TableHead className="font-semibold">Kontraktor</TableHead>
                  <TableHead className="font-semibold">Tgl Pekerjaan</TableHead>
                  <TableHead className="font-semibold">Type KK</TableHead>
                  <TableHead className="font-semibold">Jenis Pekerjaan</TableHead>
                  <TableHead className="font-semibold">Area Kerja</TableHead>
                  <TableHead className="font-semibold max-w-[200px]">Deskripsi</TableHead>
                  <TableHead className="font-semibold">PIC EM</TableHead>
                  <TableHead className="font-semibold">Mulai</TableHead>
                  <TableHead className="font-semibold">Selesai</TableHead>
                  <TableHead className="font-semibold">Tgl Input</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isDataLoading ? (
                  <TableRow>
                    <TableCell colSpan={12} className="text-center py-8 text-muted-foreground">
                      Memuat data...
                    </TableCell>
                  </TableRow>
                ) : paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={12} className="text-center py-8 text-muted-foreground">
                      Tidak ada data ditemukan
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((item, index) => (
                    <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell>{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                      <TableCell>
                        <span className="font-mono text-sm font-semibold text-secondary">
                          {item.id_kartu_kerja}
                        </span>
                      </TableCell>
                      <TableCell>{(item.kontraktors as any)?.nama_kontraktor}</TableCell>
                      <TableCell>{formatDate(item.tanggal_pekerjaan)}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 text-xs rounded-full bg-secondary/10 text-secondary">
                          {(item.type_kartu_kerja as any)?.type_kk}
                        </span>
                      </TableCell>
                      <TableCell>{(item.jenis_pekerjaan as any)?.jenis_pekerjaan}</TableCell>
                      <TableCell className="text-sm">
                        {(item.area_kerja as any)?.factories?.factory} -{' '}
                        {(item.area_kerja as any)?.department}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate" title={item.deskripsi_pekerjaan}>
                        {item.deskripsi_pekerjaan}
                      </TableCell>
                      <TableCell>{(item.pic_em as any)?.nama_pic_em}</TableCell>
                      <TableCell>{formatTime(item.jam_mulai)}</TableCell>
                      <TableCell>{formatTime(item.jam_selesai)}</TableCell>
                      <TableCell>{formatDate(item.tanggal_input)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Menampilkan {(currentPage - 1) * itemsPerPage + 1} -{' '}
                {Math.min(currentPage * itemsPerPage, filteredData.length)} dari{' '}
                {filteredData.length} data
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm font-medium">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Print Preview Dialog */}
        <Dialog open={showPrintPreview} onOpenChange={setShowPrintPreview}>
          <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Printer className="w-5 h-5" />
                Print Preview - Daftar Pekerjaan
              </DialogTitle>
            </DialogHeader>
            
            {/* Print Period Settings */}
            <div className="flex flex-wrap items-end gap-4 p-4 bg-muted/50 rounded-lg mb-4">
              <div className="space-y-1">
                <Label className="text-xs">Tanggal Mulai</Label>
                <Input
                  type="date"
                  value={printPeriod.tanggalMulai}
                  onChange={(e) => setPrintPeriod({ ...printPeriod, tanggalMulai: e.target.value })}
                  className="h-9 w-40"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Tanggal Selesai</Label>
                <Input
                  type="date"
                  value={printPeriod.tanggalSelesai}
                  onChange={(e) => setPrintPeriod({ ...printPeriod, tanggalSelesai: e.target.value })}
                  className="h-9 w-40"
                />
              </div>
              <div className="text-sm text-muted-foreground">
                {getPrintData().length} pekerjaan
              </div>
              <div className="flex-1" />
              <Button variant="outline" onClick={() => setShowPrintPreview(false)}>
                Tutup
              </Button>
              <Button variant="gradient" onClick={executePrint} className="gap-2">
                <Printer className="w-4 h-4" />
                Cetak
              </Button>
            </div>
            
            <div className="border rounded-lg overflow-hidden">
              <PrintPreviewDaftarPekerjaan
                ref={printRef}
                data={getPrintData()}
                filterInfo={{
                  tanggalMulai: printPeriod.tanggalMulai,
                  tanggalSelesai: printPeriod.tanggalSelesai,
                }}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default DaftarPekerjaan;
