import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Settings, Key, Eye, EyeOff } from 'lucide-react';
import { z } from 'zod';

const passwordSchema = z.object({
  currentPassword: z.string().min(8, 'Password minimal 8 karakter'),
  newPassword: z.string().min(8, 'Password minimal 8 karakter'),
  confirmPassword: z.string().min(8, 'Password minimal 8 karakter'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Password baru tidak cocok',
  path: ['confirmPassword'],
});

const Pengaturan: React.FC = () => {
  const { user, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    }
  }, [user, isLoading, navigate]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validation = passwordSchema.safeParse(passwords);
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

    setIsSubmitting(true);

    try {
      // First verify the current password by re-authenticating
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: passwords.currentPassword,
      });

      if (signInError) {
        setErrors({ currentPassword: 'Password saat ini salah' });
        setIsSubmitting(false);
        return;
      }

      // Now update to the new password
      const { error } = await supabase.auth.updateUser({
        password: passwords.newPassword,
      });

      if (error) {
        // Handle session missing error
        if (error.message.includes('session') || error.message.includes('Session')) {
          toast({
            title: 'Sesi Berakhir',
            description: 'Silakan login ulang dan coba lagi',
            variant: 'destructive',
          });
          await supabase.auth.signOut();
          navigate('/auth');
          return;
        }
        throw error;
      }

      toast({
        title: 'Berhasil',
        description: 'Password berhasil diperbarui',
      });

      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
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
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <div className="p-2 rounded-lg gradient-primary">
              <Settings className="w-6 h-6 text-primary-foreground" />
            </div>
            Pengaturan
          </h1>
          <p className="text-muted-foreground mt-1">
            Kelola pengaturan akun Anda
          </p>
        </div>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              Ubah Password
            </CardTitle>
            <CardDescription>
              Perbarui password akun Anda
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Password Saat Ini</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwords.currentPassword}
                    onChange={(e) =>
                      setPasswords({ ...passwords, currentPassword: e.target.value })
                    }
                    className={errors.currentPassword ? 'border-destructive pr-10' : 'pr-10'}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords({ ...showPasswords, current: !showPasswords.current })
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPasswords.current ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.currentPassword && (
                  <p className="text-sm text-destructive">{errors.currentPassword}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Password Baru</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwords.newPassword}
                    onChange={(e) =>
                      setPasswords({ ...passwords, newPassword: e.target.value })
                    }
                    className={errors.newPassword ? 'border-destructive pr-10' : 'pr-10'}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords({ ...showPasswords, new: !showPasswords.new })
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPasswords.new ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="text-sm text-destructive">{errors.newPassword}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwords.confirmPassword}
                    onChange={(e) =>
                      setPasswords({ ...passwords, confirmPassword: e.target.value })
                    }
                    className={errors.confirmPassword ? 'border-destructive pr-10' : 'pr-10'}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPasswords.confirm ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                )}
              </div>

              <Button
                type="submit"
                variant="gradient-secondary"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Menyimpan...' : 'Simpan Password Baru'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>Informasi Akun</CardTitle>
            <CardDescription>Detail akun Anda</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-muted-foreground">Email</Label>
              <p className="font-medium text-foreground">{user.email}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Role</Label>
              <p className="font-medium text-foreground">{isAdmin ? 'Administrator' : 'Kontraktor'}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Terdaftar Sejak</Label>
              <p className="font-medium text-foreground">
                {new Date(user.created_at).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Pengaturan;
