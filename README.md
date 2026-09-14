# DigiNirikshak — National Statutory Packaging Compliance & Forensic Terminal

### Smart India Hackathon (Problem Statement SIH26034)
**Authority:** Department of Consumer Affairs (DoCA), Ministry of Consumer Affairs, Food & Public Distribution, Government of India  
**Enforced Statutes:** Legal Metrology Act, 2009 • Legal Metrology (Packaged Commodities) Rules, 2011 (PCR 2011) • Consumer Protection Act, 2019 (CPA 2019)

---

## 🌟 Key Features

1. **Single-Label Ingestion (Decluttered UI)**:
   - PCR 2011 mandatory declarations exist on the back/side statutory label. Ingests one single high-clarity label via drag-and-drop file upload or live webcam viewfinder.
   - 3 Instant Hackathon Benchmark Presets: `🟢 Compliant Label` (NutriGold Biscuits), `🟡 Mislabeled Pack` (CrunchMax Chips), `🔴 Tampered Pack` (Royal Chai).

2. **Interactive Computer Vision Workstation (Step 2)**:
   - Strict 50/50 two-column layout with vertical electric-cyan laser sweep.
   - **Bounding Box Overlays**: Detected text regions are outlined in subtle cyan and expand/glow when hovering over corresponding statutory cards.
   - **Rule 18(2) Tamper Detection**: External price sticker overwrites trigger a dedicated pulsing amber bounding box (`⚠️ TAMPERED REGION`) showing base vs sticker price.
   - **Interactive Sub-Region Crop & Rescan**: Drag a marquee box over glare or blurry text for targeted WebAssembly re-OCR.
   - **Laboratory Physical Scale Verifier**: Audits physical weight against First Schedule Maximum Permissible Error (MPE) thresholds, detecting Section 39 short-quantity deficits.

3. **1-Click Role Switcher (Zero Scan Reset)**:
   - Instant toggle between **Enforcement Officer** (Insp. Rajesh Kumar) and **Citizen Consumer** (Jaya M.).
   - Dynamically adapts legal vocabulary, input fields, and output legal documents while preserving all OCR text and canvas state in memory.

4. **Form VI Statutory E-Challan & NCH Grievance Petition (Step 3)**:
   - **Automated Compounding Penalty Table**: Computes Section 36(1) checklist fines (₹10,000 each), Section 36(2) price tampering fines (₹25,000), and Section 39 short-weight fines (₹15,000) with a Section 48 15-day compounding warning.
   - **Dynamic SVG QR Code**: Embeds cryptographic docket hash, officer credentials, and DoCA/NCH verification URLs.
   - **Dual-Persona Vector Stamps**: Directorate of Legal Metrology Prussian blue seal vs CCPA Crimson consumer seal.
   - **A4 Print Engine**: Faint 4% diagonal watermark with crisp black & white rendering under `window.print()`.
   - **1-Click WhatsApp / SMS Generator**: Formats consumer complaints for National Consumer Helpline (+91 8800001915).

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run production preview
npm run preview
```
