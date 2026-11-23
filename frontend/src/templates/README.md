# 📱 Template Halaman Responsive

Template ini mengatasi masalah **zoom out** yang sering terjadi pada aplikasi web. Semua komponen sudah dioptimasi untuk:

## ✅ **Fitur Otomatis:**
- **Responsif** desktop dan mobile
- **Auto-adjust** untuk berbagai zoom level (100%-500%)
- **Modal** yang tidak perlu zoom out
- **Container** yang menyesuaikan ukuran layar
- **Grid system** yang adaptif
- **Typography** yang scalable

## 🚀 **Cara Penggunaan:**

### 1. **Buat Halaman Baru:**
```bash
# Copy template
cp src/templates/ResponsivePage.tsx src/pages/HalamanBaru.tsx
```

### 2. **Customize Halaman:**
```tsx
import ResponsivePage, { 
  ResponsiveContainer, 
  ResponsiveHeader, 
  ResponsiveGrid,
  ResponsiveCard 
} from '../templates/ResponsivePage';

const HalamanBaru = () => {
  return (
    <ResponsivePage title="Halaman Keren">
      {/* Konten Anda */}
    </ResponsivePage>
  );
};
```

### 3. **Gunakan Komponen Responsive:**

#### **Container:**
```tsx
<ResponsiveContainer>
  {/* Konten otomatis responsive */}
</ResponsiveContainer>
```

#### **Header dengan Actions:**
```tsx
<ResponsiveHeader 
  title="Dashboard"
  showBackButton={true}
  onBack={() => navigate(-1)}
  actions={
    <Button variant="primary">
      Tambah Data
    </Button>
  }
/>
```

#### **Grid Adaptif:**
```tsx
<ResponsiveGrid columns={3}>
  <ResponsiveCard title="Card 1">Konten</ResponsiveCard>
  <ResponsiveCard title="Card 2">Konten</ResponsiveCard>
  <ResponsiveCard title="Card 3">Konten</ResponsiveCard>
</ResponsiveGrid>
```

#### **Modal yang Responsive:**
```tsx
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Form Input"
  size="lg" // sm, md, lg, xl, 2xl, full
>
  <ResponsiveForm />
</Modal>
```

### 4. **Class CSS yang Tersedia:**

#### **Container Classes:**
- `container-responsive` - Container dasar
- `container-adaptive` - Container dengan padding adaptif

#### **Layout Classes:**
```css
/* Mobile-first responsive */
.responsive-padding    /* Padding yang menyesuaikan screen */
.responsive-margin     /* Margin yang adaptif */
.responsive-text       /* Text size yang scalable */
```

## 📊 **Breakpoints:**
- **Mobile:** < 640px
- **Tablet:** 640px - 1023px  
- **Desktop:** 1024px - 1279px
- **Large:** 1280px - 1535px
- **XL:** > 1536px

## 🔧 **Zoom Level Support:**
- **100%** - Default
- **125%-175%** - Auto padding adjustment
- **176%-250%** - Enhanced spacing
- **250%+** - Maximum spacing

## 🎨 **Best Practices:**

### ✅ **DO:**
- Gunakan `ResponsiveContainer` untuk wrapper
- Gunakan komponen `Responsive*` yang sudah disediakan
- Test di berbagai zoom level (100%, 150%, 200%)
- Gunakan `clamp()` untuk dynamic sizing

### ❌ **DON'T:**
- Jangan gunakan fixed width/height
- Jangan gunakan `px` untuk spacing utama
- Jangan lupa test di mobile dan desktop
- Jangan override CSS responsive tanpa alasan

## 🧪 **Testing Responsivitas:**

### Browser:
1. **Chrome DevTools** - Toggle device toolbar
2. **Zoom Test** - Ctrl+/- (100% sampai 500%)
3. **Real Device** - Test di HP/tablet asli

### Ukuran yang Harus Ditest:
- Mobile: 375px, 414px
- Tablet: 768px, 1024px  
- Desktop: 1366px, 1920px
- 4K: 2560px+

## 🐛 **Troubleshooting:**

### Modal Tidak Responsive:
```tsx
// ❌ Salah
<div className="w-96 h-96">

// ✅ Benar  
<Modal size="md">
```

### Container Terlalu Kecil:
```tsx
// ❌ Salah
<div className="max-w-sm">

// ✅ Benar
<ResponsiveContainer>
```

### Text Terlalu Kecil di Zoom:
```tsx
// ❌ Salah
<h1 className="text-xl">

// ✅ Benar
<h1 className="text-xl sm:text-2xl lg:text-3xl">
```

## 💡 **Tips:**
- Gunakan `em` atau `rem` untuk spacing
- Manfaatkan `clamp()` untuk dynamic values
- Test dengan zoom 200% minimum
- Gunakan `vh` dan `vw` dengan hati-hati

**Happy Coding!** 🎉
