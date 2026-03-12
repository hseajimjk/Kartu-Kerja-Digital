-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'contractor');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role app_role NOT NULL DEFAULT 'contractor',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table for role management
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create kontraktors table (master data)
CREATE TABLE public.kontraktors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  no SERIAL,
  nama_kontraktor TEXT NOT NULL UNIQUE,
  id_kont TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create factories table (master data)
CREATE TABLE public.factories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  no SERIAL,
  factory TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create area_kerja table (master data)
CREATE TABLE public.area_kerja (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  factory_id UUID REFERENCES public.factories(id) ON DELETE CASCADE NOT NULL,
  department TEXT NOT NULL,
  section TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pic_em table (master data)
CREATE TABLE public.pic_em (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_pic_em TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create type_kartu_kerja table (master data)
CREATE TABLE public.type_kartu_kerja (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  no SERIAL,
  type_kk TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create jenis_pekerjaan table (master data)
CREATE TABLE public.jenis_pekerjaan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  no SERIAL,
  jenis_pekerjaan TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create akun_kontraktor table (linked to kontraktors and auth.users)
CREATE TABLE public.akun_kontraktor (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  kontraktor_id UUID REFERENCES public.kontraktors(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create kartu_kerja table (main work permit form)
CREATE TABLE public.kartu_kerja (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  no_urut SERIAL,
  id_kartu_kerja TEXT NOT NULL UNIQUE,
  kontraktor_id UUID REFERENCES public.kontraktors(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tanggal_input DATE NOT NULL DEFAULT CURRENT_DATE,
  tanggal_pekerjaan DATE NOT NULL,
  area_kerja_id UUID REFERENCES public.area_kerja(id) ON DELETE CASCADE NOT NULL,
  type_kk_id UUID REFERENCES public.type_kartu_kerja(id) ON DELETE CASCADE NOT NULL,
  jenis_pekerjaan_id UUID REFERENCES public.jenis_pekerjaan(id) ON DELETE CASCADE NOT NULL,
  pic_em_id UUID REFERENCES public.pic_em(id) ON DELETE CASCADE NOT NULL,
  deskripsi_pekerjaan TEXT NOT NULL,
  jam_mulai TIME NOT NULL,
  jam_selesai TIME,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kontraktors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.factories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.area_kerja ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pic_em ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.type_kartu_kerja ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jenis_pekerjaan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.akun_kontraktor ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kartu_kerja ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_roles
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for kontraktors (read for all authenticated, write for admin)
CREATE POLICY "Authenticated can read kontraktors" ON public.kontraktors FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage kontraktors" ON public.kontraktors FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for factories (read for all authenticated, write for admin)
CREATE POLICY "Authenticated can read factories" ON public.factories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage factories" ON public.factories FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for area_kerja (read for all authenticated, write for admin)
CREATE POLICY "Authenticated can read area_kerja" ON public.area_kerja FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage area_kerja" ON public.area_kerja FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for pic_em (read for all authenticated, write for admin)
CREATE POLICY "Authenticated can read pic_em" ON public.pic_em FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage pic_em" ON public.pic_em FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for type_kartu_kerja (read for all authenticated, write for admin)
CREATE POLICY "Authenticated can read type_kartu_kerja" ON public.type_kartu_kerja FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage type_kartu_kerja" ON public.type_kartu_kerja FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for jenis_pekerjaan (read for all authenticated, write for admin)
CREATE POLICY "Authenticated can read jenis_pekerjaan" ON public.jenis_pekerjaan FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage jenis_pekerjaan" ON public.jenis_pekerjaan FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for akun_kontraktor
CREATE POLICY "Users can view their own akun" ON public.akun_kontraktor FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all akun" ON public.akun_kontraktor FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for kartu_kerja
CREATE POLICY "Users can view their own kartu_kerja" ON public.kartu_kerja FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own kartu_kerja" ON public.kartu_kerja FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all kartu_kerja" ON public.kartu_kerja FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage all kartu_kerja" ON public.kartu_kerja FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, 'contractor');
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'contractor');
  
  RETURN new;
END;
$$;

-- Create trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();