-- 1. التأكد من تفعيل جدار الحماية (RLS) على جدول الملفات
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 2. إزالة أي سياسة سابقة قد تسمح للزوار بالرفع أو الحذف بالخطأ (إن وجدت)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Give users public access to images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload an avatar" ON storage.objects;

-- 3. إنشاء سياسة جديدة تسمح للجميع (المريض والزوار) بقراءة وعرض الصور فقط
CREATE POLICY "Public Image Viewing"
ON storage.objects FOR SELECT
USING ( bucket_id = 'nexus_uploads' );
