# دليل تشغيل أكاديمية النجوم على Firebase + GitHub Pages

التطبيق ده اتحول بالكامل ليشتغل من المتصفح مباشرة، بدون أي سيرفر Node.js. كل البيانات بتتخزن في Firebase Firestore.

---

## الخطوة 1: إعداد Firebase Console

ادخل على [Firebase Console](https://console.firebase.google.com) وافتح مشروعك `academy-football-e66f9`.

### أ) تفعيل Authentication
1. من القائمة الجانبية اختار **Authentication**
2. اضغط **Get started**
3. في تبويب **Sign-in method** فعّل **Email/Password**
4. روح على تبويب **Users** واضغط **Add user**
5. أضف:
   - **Email:** `admin@academy.local`
   - **Password:** `admin123`

### ب) تفعيل Firestore Database
1. من القائمة الجانبية اختار **Firestore Database**
2. اضغط **Create database**
3. اختار **Start in production mode**
4. اختار أقرب منطقة جغرافية (مثلاً `eur3` أو `nam5`)
5. اضغط **Enable**

### ج) ضبط قواعد الأمان (Security Rules)
1. في **Firestore Database** روح لتبويب **Rules**
2. الصق هذا الكود (موجود في ملف `firestore.rules`):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

3. اضغط **Publish**

> ✅ كده بس المستخدمين المسجل دخولهم يقدروا يقروا/يكتبوا. غير المسجلين ممنوعين تماماً.

---

## الخطوة 2: رفع الموقع على GitHub Pages

### أ) إنشاء المستودع (Repository)
1. ادخل على [GitHub](https://github.com) واعمل **New repository** (مثلاً اسمه `academy-app`)
2. خليه **Public**

### ب) رفع الملفات
كل اللي تحتاج ترفعه موجود في مجلد **`dist/`** (في الملف المضغوط `academy-deploy.tar.gz`):
- `index.html`
- مجلد `assets/`

ارفع محتويات مجلد `dist` (مش المجلد نفسه) لجذر المستودع.

### ج) تفعيل GitHub Pages
1. في المستودع روح لتبويب **Settings**
2. من القائمة الجانبية اختار **Pages**
3. تحت **Source** اختار:
   - **Branch:** `main`
   - **Folder:** `/ (root)`
4. اضغط **Save**

بعد دقيقتين هتلاقي رابط الموقع زي:
```
https://USERNAME.github.io/academy-app/
```

---

## الخطوة 3: إضافة الدومين لـ Firebase

عشان الدخول يشتغل من رابط GitHub Pages:

1. في **Firebase Console** → **Authentication** → **Settings** → **Authorized domains**
2. اضغط **Add domain**
3. ضيف الدومين بتاعك مثلاً: `USERNAME.github.io`

---

## بيانات الدخول
- **اسم المستخدم:** `admin`
- **كلمة المرور:** `admin123`

(داخلياً النظام بيحول `admin` لـ `admin@academy.local` عشان Firebase Auth)

---

## ملاحظات مهمة

### قاعدة البيانات فاضية في الأول
لما تدخل لأول مرة هتلاقي القوائم فاضية. ابدأ بإضافة:
1. اللاعبين من صفحة **اللاعبون** → **إضافة لاعب جديد**
2. الموظفين من صفحة **الموظفون** → **إضافة موظف**
3. باقي البيانات تتسجل من خلال الواجهة

### الصور
صور اللاعبين بتتخزن داخل قاعدة البيانات نفسها (base64). لو هتضيف صور كتير، يفضل تستخدم **Firebase Storage** لاحقاً.

### الرسائل (SMS)
مفيش مزود رسائل متربط. الرسائل بس بتتسجل في قاعدة البيانات في صفحة **الرسائل** للأرشيف.

### إعادة البناء
لو غيرت أي حاجة في الكود، شغّل:
```bash
cd artifacts/academy
pnpm install
pnpm run build
```
وهيظهر مجلد `dist/` جديد، ارفعه على GitHub.
