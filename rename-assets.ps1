# =============================================================
# Script de renombramiento de assets para Secub-Frontend
# Ejecutar desde la raíz del proyecto
# =============================================================

Write-Host "Iniciando renombramiento de assets..." -ForegroundColor Cyan

# ── 1. Carpeta Seccionales → seccionales ─────────────────────
# Git en Windows no detecta cambios de case directo,
# se usa un nombre temporal intermedio para forzarlo.

Write-Host "`n[1/2] Renombrando carpeta Seccionales..." -ForegroundColor Yellow

git mv src/assets/Seccionales src/assets/_seccionales_tmp
git mv src/assets/_seccionales_tmp src/assets/seccionales

# ── 2. Carpeta Modulos → modulos ──────────────────────────────
Write-Host "[2/2] Renombrando carpeta Modulos..." -ForegroundColor Yellow

git mv src/assets/Modulos src/assets/_modulos_tmp
git mv src/assets/_modulos_tmp src/assets/modulos

# ── 3. Imágenes dentro de seccionales ────────────────────────
Write-Host "`nRenombrando imágenes de seccionales..." -ForegroundColor Yellow

git mv "src/assets/seccionales/Seccional-Bogota.jpg"   "src/assets/seccionales/seccional-bogota.jpg"
git mv "src/assets/seccionales/Seccional-Cali.jpg"     "src/assets/seccionales/seccional-cali.jpg"
git mv "src/assets/seccionales/Seccional-Cartagena.webp" "src/assets/seccionales/seccional-cartagena.webp"
git mv "src/assets/seccionales/Seccional-Medellin.jpg" "src/assets/seccionales/seccional-medellin.jpg"

# ── 4. Imágenes dentro de modulos ────────────────────────────
Write-Host "Renombrando imágenes de modulos..." -ForegroundColor Yellow

git mv "src/assets/modulos/1.png" "src/assets/modulos/modulo-1.png"
git mv "src/assets/modulos/2.png" "src/assets/modulos/modulo-2.png"
git mv "src/assets/modulos/3.png" "src/assets/modulos/modulo-3.png"
git mv "src/assets/modulos/4.png" "src/assets/modulos/modulo-4.png"

# ── 5. Imágenes dentro de logos ──────────────────────────────
Write-Host "Renombrando imágenes de logos..." -ForegroundColor Yellow

git mv "src/assets/logos/LogoAltaCalidad.png"  "src/assets/logos/logo-alta-calidad.png"
git mv "src/assets/logos/LogoUSB.png"          "src/assets/logos/logo-usb.png"
git mv "src/assets/logos/LogoUSBFooter.png"    "src/assets/logos/logo-usb-footer.png"

# ── 6. Commit ─────────────────────────────────────────────────
Write-Host "`nHaciendo commit de los cambios..." -ForegroundColor Yellow

git add -A
git commit -m "refactor: rename asset folders and files to kebab-case"

Write-Host "`n✅ Listo! Cambios registrados en Git." -ForegroundColor Green
Write-Host "Recuerda hacer push y luego actualizar los imports." -ForegroundColor Cyan