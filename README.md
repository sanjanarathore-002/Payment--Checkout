<<<<<<< HEAD
# Payment--Checkout
=======
# AXIPAYS — Premium Fintech Checkout & Merchant Analytics Dashboard

AXIPAYS is a high-performance single-page React application designed with a premium glassmorphic visual style, custom interactive SVG data visualizations, and robust frontend cryptography. It allows merchants to securely process credit card transactions and analyze real-time clearance metrics.

---

## 🚀 Quick Start & Installation

Ensure you have [Node.js](https://nodejs.org) (v18+) installed.

1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Start Dev Server**:
   ```bash
   npm run dev
   ```
   *The application will launch on [http://localhost:5173](http://localhost:5173).*
3. **Build Production Assets**:
   ```bash
   npm run build
   ```

---

## 📁 Code Structure

```
PaymentCheckout/
├── src/
│   ├── components/
│   │   ├── Layout.jsx           # Main sidebar navigation & theme toggling
│   │   ├── PaymentModal.jsx     # Security pipeline & final status modals
│   │   └── TransactionTable.jsx # Paginated transaction grid with search/filter & drawer details
│   ├── pages/
│   │   ├── Checkout.jsx         # 3D flipping card checkout form & Luhn checking
│   │   └── Dashboard.jsx        # Summary KPI cards & interactive SVG charts
│   ├── utils/
│   │   └── crypto.js            # Luhn validator, brand detector, Web Crypto HMAC-SHA256
│   ├── App.jsx                  # Main router and global theme orchestrator
│   ├── index.css                # Custom Tailwind v4 theme values & neon utilities
│   └── main.jsx                 # React entry mount
├── package.json                 # Project dependencies & build instructions
└── README.md                    # Technical documentation
```

---

## 🔐 Core Security Implementations

Security is implemented natively with no external dependency bloat, ensuring maximum compatibility and code safety.

### 1. HMAC-SHA256 Signatures via Web Crypto API
The payment initiation endpoint requires a secure `Hash` header computed from the customer details. Rather than importing large third-party hashing libraries (e.g. `crypto-js`), we use the browser's native **Web Crypto API** (`window.crypto.subtle`):
1. The first 6 and last 4 digits of the card number are concatenated (`first6 + last4`).
2. This 10-digit string and the user's email are reversed.
3. The signature string is constructed: `reverse(email) + "AXIPAYS" + reverse(first6+last4)`.
4. The string is converted to uppercase and signed with HMAC-SHA256 using the key `AXI2026` to output an uppercase hex hash header.

### 2. Luhn Check Algorithm (ISO/IEC 7812)
Before payment submission, the credit card number is checked using the standard Luhn algorithm. Starting from the rightmost digit, every second digit is doubled. If the result is $> 9$, its digits are summed (or $9$ is subtracted). The card is valid if the sum of all digits is congruent to $0 \pmod{10}$.

### 3. Strict Card and CVV Masking
Sensitive elements are masked across all views:
* **Card Number**: Shows `489795******3334` in the transaction table and blurred checkout fields, keeping only the non-sensitive routing details (BIN/first 6 and last 4) visible.
* **CVV/CVC**: Represented as a password field during typing and hidden behind `***` bullets.

---

## 📊 Key Features & UX Touches

* **3D Flipping Card Preview**: Credit card mock visually updates details. Focusing the CVC field rotates the card to the back with a 3D perspective transition.
* **Custom Interactive SVG Charts**: Built from scratch using native SVG coordinates, Bezier path curves, and circle math. This avoids React 19 charting library peer dependency issues while providing zero-overhead, highly-responsive graphs (Donut charts with centered hover indicators and Line charts with absolute hover tooltips).
* **Dual Redirect Simulation**: Accommodates both standard browser tab redirects and embedded iframe simulators (Bonus) in the transaction resolution modal.
* **Status Badges & Drawer slideouts**: Features colorful badge components and drawer menus to inspect invoice records easily.
* **Theme Switching**: Includes a dark/light mode toggle that transitions all background glow circles smoothly.
>>>>>>> dc4fa74 (Payment checkOut)
