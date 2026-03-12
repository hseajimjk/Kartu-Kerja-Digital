import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Eye, EyeOff, ClipboardCheck, ArrowLeft } from 'lucide-react';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
});

const registerSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  kontraktorId: z.string().min(1, 'Pilih kontraktor'),
});

interface Kontraktor {
  id: string;
  nama_kontraktor: string;
}

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedKontraktor, setSelectedKontraktor] = useState('');
  const [kontraktors, setKontraktors] = useState<Kontraktor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchKontraktors = async () => {
      const { data, error } = await supabase
        .from('kontraktors')
        .select('id, nama_kontraktor')
        .order('nama_kontraktor');

      if (!error && data) {
        setKontraktors(data);
      }
    };

    if (!isLogin) {
      fetchKontraktors();
    }
  }, [isLogin]);

  const ADMIN_ACCOUNTS = [
    { email: 'hse.ajinomoto@gmail.com', password: '12345678' },
    { email: 'irawan.36z@asv.ajinomoto.com', password: 'em123456' },
  ];

  const createAdminAccount = async (adminEmail: string, adminPassword: string) => {
    // Try to sign up admin account
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: adminEmail,
      password: adminPassword,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });

    if (signUpError) {
      return { error: signUpError };
    }

    if (data.user) {
      // Add admin role
      await supabase.from('user_roles').insert({
        user_id: data.user.id,
        role: 'admin' as const,
      });
    }

    return { error: null };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      if (isLogin) {
        const validation = loginSchema.safeParse({ email, password });
        if (!validation.success) {
          const fieldErrors: Record<string, string> = {};
          validation.error.errors.forEach((err) => {
            if (err.path[0]) {
              fieldErrors[err.path[0].toString()] = err.message;
            }
          });
          setErrors(fieldErrors);
          setIsLoading(false);
          return;
        }

        // Check if this is admin login
        const adminAccount = ADMIN_ACCOUNTS.find(
          (acc) => acc.email.toLowerCase() === email.toLowerCase() && acc.password === password
        );

        let { error } = await signIn(email, password);
        
        // If admin login fails, try to create admin account first
        if (error && adminAccount) {
          await createAdminAccount(adminAccount.email, adminAccount.password);
          // Try login again
          const result = await signIn(email, password);
          error = result.error;
        }

        if (error) {
          toast({
            title: 'Login Gagal',
            description: error.message === 'Invalid login credentials' 
              ? 'Email atau password salah' 
              : error.message,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Login Berhasil',
            description: 'Selamat datang kembali!',
          });
          navigate('/dashboard');
        }
      } else {
        const validation = registerSchema.safeParse({ 
          email, 
          password, 
          kontraktorId: selectedKontraktor 
        });
        if (!validation.success) {
          const fieldErrors: Record<string, string> = {};
          validation.error.errors.forEach((err) => {
            if (err.path[0]) {
              fieldErrors[err.path[0].toString()] = err.message;
            }
          });
          setErrors(fieldErrors);
          setIsLoading(false);
          return;
        }

        const { error } = await signUp(email, password, selectedKontraktor);
        if (error) {
          if (error.message?.includes('already registered')) {
            toast({
              title: 'Registrasi Gagal',
              description: 'Email sudah terdaftar. Silakan login.',
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'Registrasi Gagal',
              description: error.message,
              variant: 'destructive',
            });
          }
        } else {
          toast({
            title: 'Registrasi Berhasil',
            description: 'Akun berhasil dibuat. Silakan login.',
          });
          setIsLogin(true);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-secondary/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/20 rounded-full blur-3xl" />
      </div>

      <Card className="w-full max-w-md relative z-10 animate-fade-in glass-effect">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-xl gradient-secondary shadow-glow">
              <ClipboardCheck className="w-8 h-8 text-secondary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">
            {isLogin ? 'Masuk' : 'Daftar'}
          </CardTitle>
          <CardDescription>
            {isLogin 
              ? 'Masuk ke akun Kartu Kerja Anda' 
              : 'Buat akun baru untuk mengakses sistem'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimal 8 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="kontraktor">Pilih Kontraktor</Label>
                <Select value={selectedKontraktor} onValueChange={setSelectedKontraktor}>
                  <SelectTrigger className={errors.kontraktorId ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Pilih kontraktor..." />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    {kontraktors.map((k) => (
                      <SelectItem key={k.id} value={k.id}>
                        {k.nama_kontraktor}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.kontraktorId && (
                  <p className="text-sm text-destructive">{errors.kontraktorId}</p>
                )}
                {kontraktors.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Belum ada kontraktor terdaftar. Hubungi administrator.
                  </p>
                )}
              </div>
            )}

            <Button
              type="submit"
              variant="gradient-secondary"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Memproses...' : isLogin ? 'Masuk' : 'Daftar'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setErrors({});
              }}
              className="text-sm text-muted-foreground hover:text-secondary transition-colors"
            >
              {isLogin 
                ? 'Belum punya akun? Daftar di sini' 
                : 'Sudah punya akun? Masuk di sini'}
            </button>
          </div>

          <div className="mt-4 text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="text-muted-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Beranda
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
