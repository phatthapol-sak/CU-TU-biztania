# 🌿 GreenScope Concierge
> **Minimal, Production-Grade Scope 3 Carbon Accounting & Green Procurement AI Agent**

GreenScope Concierge เป็นระบบ AI Agent อัจฉริยะสำหรับบริหารจัดการข้อมูลคาร์บอนฟุตพริ้นท์ของห่วงโซ่อุปทาน (Scope 3 GHG Emissions) ในระดับองค์กร ออกแบบตามมาตรฐาน **Linear/Vercel Design System** (Dark Zinc Aesthetic) เน้นความเรียบหรู สะอาด สวยงาม และแสดงข้อมูลอย่างมีประสิทธิภาพ ตั้งแต่การนำเข้าเอกสารจัดซื้อ, การประมวลผลด้วย Gemini Vision AI, การสร้าง Supply Chain Knowledge Graph, การวิเคราะห์ความเสี่ยงตามมาตรฐาน DEFRA/TGO ไปจนถึงการตัดสินใจดำเนินการจัดซื้อจัดจ้างสีเขียว (Green RFQ) และการซิงค์ข้อมูลกับระบบ ERP

---

## 🏛️ สรุปสถาปัตยกรรม 3-Tab Multi-View Navigation & Human-in-the-Loop Workflow

ระบบถูกออกแบบใหม่ให้แบ่งมุมมองออกเป็น 3 Tabs หลัก พร้อมระบบ **2-Stage Human-in-the-Loop Review & Commit**:

```text
+-----------------------------------------------------------------------------------+
|  GREENSCOPE.AI // SCOPE-3 ENGINE    [01. INGESTION]  [02. GRAPH]  [03. ACTIONS]   |
+-----------------------------------------------------------------------------------+
```

### 1. 📑 Tab 1: `[01. DOCUMENT INGESTION & TECHNICAL INSPECTOR]`
- **2-Stage Human-in-the-Loop Ingestion:**
  - **Stage 1 (Staged for Review):** เมื่ออัปโหลดไฟล์หรือเลือก Preset ระบบจะสกัดข้อมูลมาแสดงพรีวิวใน Technical Sheet Inspector โดยยังไม่อัปเดตตัวเลขคาร์บอนภาพรวมในแท็บอื่น
  - **Stage 2 (`[Upload & Commit to Google Sheet Database]`):** เมื่อผู้ใช้ตรวจสอบความถูกต้องและกดปุ่มยืนยัน ระบบจะส่งข้อมูลไปบันทึกเพิ่มแถว (Append Row) ลงใน Google Sheet ERP ผ่าน API POST (`/api/sheets/append`) และแสดงสถานะ `[SYNCED TO GOOGLE SHEET]`
- **Registered Documents & Clear Rows:** มีรายการเอกสารที่ลงทะเบียนแล้วพร้อมปุ่ม **`[Clear Ingested Rows]`** สำหรับเคลียร์ข้อมูลเพื่อรีเซ็ตกลับสู่ค่าเริ่มต้น
- **Custom File Upload:** รองรับการลากวาง (Drag & Drop) ไฟล์ PDF/PNG/JPG ชนิด Invoices, BOMs และ Waybills
- **Gemini Vision AI Engine:** สกัดข้อมูลโครงสร้าง JSON (Pydantic/TypeScript Schema) เช่น `supplierName`, `materialName`, `quantity`, `transportMode`, `distanceKm`, `totalCostUSD`

### 2. 🕸️ Tab 2: `[02. SUPPLY CHAIN KNOWLEDGE GRAPH]`
- **Document Switcher Bar:** แถบเลือกเอกสารด้านบนสุด สามารถสลับเลือกดูโหนดความสัมพันธ์และผลการตรวจสอบตามใบสั่งซื้อ (PO) แต่ละใบได้ทันที
- **Spacious SVG Topological Network Graph:** ผังโครงข่ายความสัมพันธ์ความละเอียดสูงระหว่าง:
  $$\text{Tier-1 Supplier} \xrightarrow{\text{TRANSPORTED\_BY}} \text{Logistics Carrier} \xrightarrow{\text{IN\_PRODUCT}} \text{Production Line}$$
  $$\text{Material Specification} \xrightarrow{\text{EMITS}} \text{Scope 3 Carbon Audit Outcome}$$
- **Interactive Node Selection:** กดเลือก Node เพื่อดูรายละเอียดในแถบ **Node Telemetry Inspector** ด้านล่าง (4-Column Monospace Data Strip)
- **Anomaly Highlight:** Node ที่ปล่อยคาร์บอนเกินเกณฑ์จะเน้นด้วยขอบสีแดง (`border-rose-800 font-bold`)

### 3. 📊 Tab 3: `[03. SCENARIO ANALYTICS & AUTONOMOUS ACTIONS]`
- **Document Switcher Bar:** แถบสลับเอกสาร PO ด้านบน สะท้อนตัวเลข Scope 3 Baseline และทางเลือกสีเขียวตามเอกสารใบนั้นๆ
- **Live Google Sheets ERP Integration:** เชื่อมต่อฐานข้อมูลจัดซื้อแบบสดผ่าน Google Sheets:
  - 🔗 **Google Sheet ERP Database:** [เข้าสู่ตารางฐานข้อมูล Google Sheet ↗](https://docs.google.com/spreadsheets/d/17_0MgXv54ILWUctKkreuiAwekj0mDMShWprgbpmXLH4/edit?gid=0#gid=0)
  - ดึงข้อมูลสดผ่าน API Proxy (`/api/sheets`) ขจัดปัญหา CORS และปัญหาวนลูปร้องขอข้อมูลด้วย `useCallback`
- **Multi-Objective Scenario Matrix:** กรองแสดงผลเฉพาะแผนทางเลือกจัดซื้อสีเขียวแท้จริง (`Plan B` และ `Plan C`) แยกจากการ์ด Baseline 
- **Recharts Scenario Simulation:** กราฟแท่งเปรียบเทียบสภาวะปัจจุบัน (Baseline Scenario) กับสภาวะพึงประสงค์ (Green Scenario) ในมิติของ **Emissions (tCO2e)** และ **Cost (฿ THB / $ USD)**
- **Copilot 3-Tier Audit Card & Autonomous Action Center:**
  - 📄 **Generate Green RFQ:** สร้างเอกสารขอเสนอราคาการจัดซื้อจัดจ้างสีเขียว
  - ✉️ **Draft Negotiation Email:** ร่างอีเมลเจรจาขอใบรับรองคาร์บอนฟุตพริ้นท์ (CFP)
  - 🚀 **Dispatch ERP Webhook:** ส่งข้อมูลสั่งซื้อใหม่ไปยังระบบ SAP S/4HANA / NetSuite ERP

---

## 🎨 การออกแบบ UI/UX & Hydration Protection

- **Palette Theme (Subdued Dark Zinc):**
  - **Backgrounds:** Base `bg-zinc-950` (#09090b), Cards `bg-zinc-900` (#18181b)
  - **Borders:** Default `border-zinc-800` (#27272a), Focus `border-zinc-700` (#3f3f46)
  - **Typography:** Primary `text-zinc-100`, Labels/Captions `text-zinc-400`/`text-zinc-500`, Data `text-zinc-200`
  - **Accents:** Restrained `emerald-400` สำหรับค่าคาร์บอนต่ำ และ `rose-400`/`rose-900` สำหรับจุดเสี่ยงสูง
- **Hydration Warning Suppression:** เพิ่ม prop `suppressHydrationWarning` ใน [src/app/layout.tsx](file:///D:/Desktop/bsd/project-maharai/CU-TU%20biztania/greenscope-poc/src/app/layout.tsx) เพื่อป้องกันการแจ้งเตือนเตือนความขัดแย้งของ DOM จาก Browser Extensions

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

- **Framework:** Next.js 16 (App Router, Turbopack, TypeScript)
- **Styling:** Tailwind CSS, JetBrains Mono & Inter Fonts
- **Data Visualization:** Recharts (Custom dark theme chart), SVG Network Canvas
- **AI Integration:** Google Gemini API (`@google/genai`) พร้อมระบบ Fallback Mock Engine
- **Cloud Database:** Google Sheet ERP Database ผ่าน Google Apps Script Web App API Proxy

---

## 💻 วิธีการติดตั้งและใช้งาน (Getting Started)

### 1. ติดตั้ง Dependencies
```bash
npm install
```

### 2. กำหนดค่า Environment (`.env`)
กำหนดค่า Web App URL และ Google Sheet ID ในไฟล์ `.env`:
```env
GOOGLE_APPS_SCRIPT_URL="https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec"
GOOGLE_SHEET_ID="17_0MgXv54ILWUctKkreuiAwekj0mDMShWprgbpmXLH4"
NEXT_PUBLIC_GOOGLE_SHEET_ID="17_0MgXv54ILWUctKkreuiAwekj0mDMShWprgbpmXLH4"
```

### 3. รัน Development Server
```bash
npm run dev
```
เข้าใช้งานผ่านบราวเซอร์ที่ [http://localhost:3000](http://localhost:3000)

### 4. ทดสอบ Build สำหรับ Production
```bash
npm run build
```

---

## 📁 โครงสร้างไดเรกทอรีโครงการ (Project Structure)

```text
greenscope-poc/
├── src/
│   ├── app/
│   │   ├── api/extract/route.ts       # API Route สำหรับ Gemini Vision Extraction
│   │   ├── api/sheets/route.ts        # API Route สำหรับอ่านข้อมูลสดจาก Google Sheet CSV
│   │   ├── api/sheets/append/route.ts # API Route สำหรับยิง POST Append แถวใหม่ลง Google Sheet
│   │   ├── api/sheets/clear/route.ts  # API Route สำหรับรีเซ็ต/ลบแถวที่ Append เข้ามา
│   │   ├── globals.css                # Dark Zinc Theme & Minimal Scrollbars
│   │   ├── layout.tsx                 # Root Layout พร้อม suppressHydrationWarning
│   │   └── page.tsx                   # Main Multi-Tab Controller & useCallback Handlers
│   ├── components/
│   │   ├── Header.tsx                 # System Telemetry Strip & Sub-Header 3-Tab Bar
│   │   ├── LeftPanel.tsx              # Tab 1: Presets, Upload Dropzone & Technical Sheet Inspector
│   │   ├── KnowledgeGraph.tsx         # Tab 2: Interactive SVG Topological Network & Inspector
│   │   ├── AnalyticsPanel.tsx         # Tab 3: Recharts Scenario Chart & DEFRA Audit Table
│   │   ├── RightPanel.tsx             # Tab 3: Copilot Diagnosis, Actions & Live Feed
│   │   ├── DocumentSwitcher.tsx       # แถบเลือกสลับเอกสาร PO ด้านบนสุดของ Tab 2 และ Tab 3
│   │   └── ActionModals.tsx           # Modals สำหรับ Green RFQ, Email Draft, ERP Webhook
│   ├── data/
│   │   ├── emissionFactors.ts         # DEFRA 2024 & TGO Standard Emission Factors
│   │   └── mockDocuments.ts           # Preset Documents Data (Virgin PP, rPP, Cardboard)
│   ├── lib/
│   │   ├── calculator.ts              # สูตรคำนวณ Scope 3, EF Matching & Trade-offs
│   │   └── gemini.ts                  # Gemini Vision AI Extraction Service
│   └── types/
│       └── index.ts                   # TypeScript Interfaces
├── .env                               # Environment variables สำหรับ Google Sheet & Apps Script
└── README.md                          # คู่มือสถาปัตยกรรมและการใช้งานฉบับอัปเดตล่าสุด
```
