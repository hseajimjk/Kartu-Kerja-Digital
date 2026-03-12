import React, { forwardRef } from 'react';

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

interface PrintPreviewProps {
  data: KartuKerja[];
  filterInfo?: {
    tanggalMulai?: string;
    tanggalSelesai?: string;
  };
}

const PrintPreviewDaftarPekerjaan = forwardRef<HTMLDivElement, PrintPreviewProps>(
  ({ data, filterInfo }, ref) => {
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

    // Sort data by area kerja then by kontraktor
    const sortedData = [...data].sort((a, b) => {
      // First sort by factory
      const factoryA = (a.area_kerja as any)?.factories?.factory || '';
      const factoryB = (b.area_kerja as any)?.factories?.factory || '';
      if (factoryA !== factoryB) return factoryA.localeCompare(factoryB);

      // Then by department
      const deptA = (a.area_kerja as any)?.department || '';
      const deptB = (b.area_kerja as any)?.department || '';
      if (deptA !== deptB) return deptA.localeCompare(deptB);

      // Then by section
      const sectionA = (a.area_kerja as any)?.section || '';
      const sectionB = (b.area_kerja as any)?.section || '';
      if (sectionA !== sectionB) return sectionA.localeCompare(sectionB);

      // Finally by kontraktor
      const kontA = (a.kontraktors as any)?.nama_kontraktor || '';
      const kontB = (b.kontraktors as any)?.nama_kontraktor || '';
      return kontA.localeCompare(kontB);
    });

    // Group data by area kerja
    const groupedByArea = sortedData.reduce((acc, item) => {
      const areaKey = `${(item.area_kerja as any)?.factories?.factory || ''} - ${(item.area_kerja as any)?.department || ''} - ${(item.area_kerja as any)?.section || ''}`;
      if (!acc[areaKey]) {
        acc[areaKey] = [];
      }
      acc[areaKey].push(item);
      return acc;
    }, {} as Record<string, KartuKerja[]>);

    return (
      <div ref={ref} className="print-content p-4 bg-white text-black min-h-screen" style={{ fontSize: '9px' }}>
        <style>
          {`
            @media print {
              @page {
                size: A4 landscape;
                margin: 5mm;
              }
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
                font-size: 9px !important;
              }
              .print-content {
                padding: 0 !important;
                font-size: 9px !important;
              }
            }
          `}
        </style>

        {/* Header */}
        <div className="text-center mb-3 border-b border-black pb-2">
          <h1 className="text-base font-bold uppercase">Daftar Pekerjaan Kontraktor</h1>
          <p className="mt-1" style={{ fontSize: '8px' }}>
            Dicetak: {new Date().toLocaleDateString('id-ID', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
            {(filterInfo?.tanggalMulai || filterInfo?.tanggalSelesai) && (
              <> | Periode: {filterInfo.tanggalMulai ? formatDate(filterInfo.tanggalMulai) : 'Awal'} - {filterInfo.tanggalSelesai ? formatDate(filterInfo.tanggalSelesai) : 'Sekarang'}</>
            )}
            {' | '}Total: {sortedData.length} pekerjaan
          </p>
        </div>

        {/* Grouped Tables by Area */}
        {Object.entries(groupedByArea).map(([areaName, areaData]) => {
          // Group by kontraktor within area
          const groupedByKontraktor = areaData.reduce((acc, item) => {
            const kontName = (item.kontraktors as any)?.nama_kontraktor || 'Tidak diketahui';
            if (!acc[kontName]) {
              acc[kontName] = [];
            }
            acc[kontName].push(item);
            return acc;
          }, {} as Record<string, KartuKerja[]>);

          return (
            <div key={areaName} className="mb-2">
              {/* Area Header */}
              <div className="bg-gray-800 text-white px-2 py-0.5 font-bold text-xs">
                Area: {areaName}
              </div>

              {Object.entries(groupedByKontraktor).map(([kontName, kontData]) => (
                <div key={kontName} className="mb-1">
                  {/* Kontraktor SubHeader */}
                  <div className="bg-gray-200 px-2 py-0.5 font-semibold border-x border-gray-400" style={{ fontSize: '8px' }}>
                    Kontraktor: {kontName} ({kontData.length})
                  </div>

                  {/* Table */}
                  <table className="w-full border-collapse" style={{ fontSize: '8px' }}>
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-400 px-1 py-0.5 text-center" style={{ width: '20px' }}>No</th>
                        <th className="border border-gray-400 px-1 py-0.5 text-left" style={{ width: '90px' }}>ID KK</th>
                        <th className="border border-gray-400 px-1 py-0.5 text-center" style={{ width: '55px' }}>Tgl Kerja</th>
                        <th className="border border-gray-400 px-1 py-0.5 text-left" style={{ width: '50px' }}>Type</th>
                        <th className="border border-gray-400 px-1 py-0.5 text-left" style={{ width: '80px' }}>Jenis</th>
                        <th className="border border-gray-400 px-1 py-0.5 text-left">Deskripsi</th>
                        <th className="border border-gray-400 px-1 py-0.5 text-left" style={{ width: '80px' }}>PIC</th>
                        <th className="border border-gray-400 px-1 py-0.5 text-center" style={{ width: '40px' }}>Mulai</th>
                        <th className="border border-gray-400 px-1 py-0.5 text-center" style={{ width: '40px' }}>Selesai</th>
                      </tr>
                    </thead>
                    <tbody>
                      {kontData.map((item, idx) => (
                        <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="border border-gray-400 px-1 py-0.5 text-center">{idx + 1}</td>
                          <td className="border border-gray-400 px-1 py-0.5 font-mono">
                            {item.id_kartu_kerja}
                          </td>
                          <td className="border border-gray-400 px-1 py-0.5 text-center">
                            {formatDate(item.tanggal_pekerjaan)}
                          </td>
                          <td className="border border-gray-400 px-1 py-0.5">
                            {(item.type_kartu_kerja as any)?.type_kk}
                          </td>
                          <td className="border border-gray-400 px-1 py-0.5">
                            {(item.jenis_pekerjaan as any)?.jenis_pekerjaan}
                          </td>
                          <td className="border border-gray-400 px-1 py-0.5">
                            {item.deskripsi_pekerjaan}
                          </td>
                          <td className="border border-gray-400 px-1 py-0.5">
                            {(item.pic_em as any)?.nama_pic_em}
                          </td>
                          <td className="border border-gray-400 px-1 py-0.5 text-center">
                            {formatTime(item.jam_mulai)}
                          </td>
                          <td className="border border-gray-400 px-1 py-0.5 text-center">
                            {formatTime(item.jam_selesai)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          );
        })}

        {/* Footer */}
        <div className="mt-4 pt-2 border-t border-gray-400 text-center" style={{ fontSize: '7px', color: '#666' }}>
          <p>Dokumen ini dicetak secara otomatis dari Sistem Kartu Kerja Kontraktor</p>
        </div>
      </div>
    );
  }
);

PrintPreviewDaftarPekerjaan.displayName = 'PrintPreviewDaftarPekerjaan';

export default PrintPreviewDaftarPekerjaan;
