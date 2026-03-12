import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ClipboardCheck, Shield, Users, FileText, ArrowRight } from 'lucide-react';

const Index: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <header className="gradient-hero relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-72 h-72 bg-secondary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-3xl" />
        </div>

        <nav className="relative z-10 container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg gradient-secondary shadow-glow">
                <ClipboardCheck className="w-6 h-6 text-secondary-foreground" />
              </div>
              <span className="text-xl font-bold text-primary-foreground">
                Kartu Kerja
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
                onClick={() => navigate('/auth')}
              >
                Masuk
              </Button>
              <Button 
                variant="gradient-secondary"
                onClick={() => navigate('/auth')}
              >
                Daftar
              </Button>
            </div>
          </div>
        </nav>

        <div className="relative z-10 container mx-auto px-4 py-20 lg:py-32">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-primary-foreground leading-tight animate-slide-up">
              Sistem Manajemen{' '}
              <span className="text-gradient-primary bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
                Kartu Kerja
              </span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Platform terintegrasi untuk mengelola perizinan kerja kontraktor. 
              Catat semua aktivitas pekerjaan dengan sistem yang terorganisir dan efisien.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Button 
                variant="gradient-secondary" 
                size="xl"
                onClick={() => navigate('/auth')}
                className="group"
              >
                Mulai Sekarang
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                variant="outline" 
                size="xl"
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              >
                Pelajari Lebih Lanjut
              </Button>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </header>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Fitur Unggulan
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Sistem yang dirancang untuk memudahkan pengelolaan perizinan kerja kontraktor
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="group p-8 rounded-2xl bg-card border border-border hover:border-secondary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <div className="w-14 h-14 rounded-xl gradient-secondary flex items-center justify-center mb-6 group-hover:shadow-glow transition-shadow">
                <FileText className="w-7 h-7 text-secondary-foreground" />
              </div>
              <h3 className="text-xl font-bold text-card-foreground mb-3">
                Form Kartu Kerja
              </h3>
              <p className="text-muted-foreground">
                Isi formulir perizinan kerja dengan mudah. Setiap pekerjaan mendapat ID unik untuk pelacakan.
              </p>
            </div>

            <div className="group p-8 rounded-2xl bg-card border border-border hover:border-secondary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center mb-6 group-hover:shadow-lg transition-shadow">
                <Users className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold text-card-foreground mb-3">
                Manajemen Kontraktor
              </h3>
              <p className="text-muted-foreground">
                Kelola data kontraktor dan akun pengguna dengan sistem yang terorganisir.
              </p>
            </div>

            <div className="group p-8 rounded-2xl bg-card border border-border hover:border-secondary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <div className="w-14 h-14 rounded-xl gradient-accent flex items-center justify-center mb-6 group-hover:shadow-lg transition-shadow">
                <Shield className="w-7 h-7 text-accent-foreground" />
              </div>
              <h3 className="text-xl font-bold text-card-foreground mb-3">
                Keamanan Data
              </h3>
              <p className="text-muted-foreground">
                Sistem autentikasi yang aman dengan kontrol akses berbasis peran.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-hero relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 right-10 w-40 h-40 bg-secondary/20 rounded-full blur-2xl" />
          <div className="absolute bottom-10 left-10 w-60 h-60 bg-accent/10 rounded-full blur-2xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground">
              Siap Memulai?
            </h2>
            <p className="text-primary-foreground/80 text-lg">
              Daftar sekarang dan mulai kelola perizinan kerja dengan lebih efisien.
            </p>
            <Button 
              variant="gradient-secondary" 
              size="xl"
              onClick={() => navigate('/auth')}
              className="group"
            >
              Daftar Gratis
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-card border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg gradient-secondary">
                <ClipboardCheck className="w-4 h-4 text-secondary-foreground" />
              </div>
              <span className="font-semibold text-card-foreground">Kartu Kerja</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Sistem Manajemen Kartu Kerja. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
