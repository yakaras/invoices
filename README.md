# Enterprise Invoice Management System

A full-stack invoice management application with template builder, PDF generation, and email integration via Amazon SES.

## Features

- 📋 Create and manage invoices
- 🎨 Visual template builder with drag-and-drop interface
- 📄 PDF invoice generation and download
- 📧 Send invoices via Amazon SES
- 👥 Customer management
- 🔍 Invoice search and filtering
- ⚙️ Company settings and branding
- 📊 Dashboard with invoice statistics

## Tech Stack

**Backend:**
- Node.js with Express.js
- TypeScript
- PostgreSQL
- PDFKit for PDF generation
- AWS SDK for SES integration

**Frontend:**
- React 18
- TypeScript
- React Router for navigation
- Konva.js for canvas rendering (template builder)
- Axios for API calls
- React Hot Toast for notifications
- Lucide React for icons

## Prerequisites

- Node.js (v16+)
- PostgreSQL (v12+)
- AWS account with SES access
- npm or yarn

## Installation

### 1. Clone and Setup Project Structure

```bash
cd /path/to/invoices
npm install  # or yarn install
```

### 2. Backend Setup

```bash
cd backend
npm install

# Create .env file
cp .env.example .env

# Edit .env with your configuration
# Required:
# - DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
# - AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY
# - AWS_SES_FROM_EMAIL
```

#### Database Setup

```bash
# Connect to PostgreSQL
psql -U postgres -d postgres

# Create database (if not auto-created)
CREATE DATABASE invoices_db;

# The backend will auto-initialize tables on first run
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install

# Create .env file
cp .env.example .env

# Default configuration should work if backend is on localhost:5000
# Adjust REACT_APP_API_URL if your backend is hosted elsewhere
```

## Running the Application

### Start Backend Server

```bash
cd backend
npm run dev
```

Server will run on `http://localhost:5000`

### Start Frontend Development Server

```bash
cd frontend
npm start
```

Application will open at `http://localhost:3000`

## Building for Production

### Backend

```bash
cd backend
npm run build
npm start  # Runs compiled JavaScript
```

### Frontend

```bash
cd frontend
npm run build
```

Build output will be in `frontend/build/`

## API Endpoints

### Templates
- `GET /api/templates` - Get all templates
- `GET /api/templates/:id` - Get single template
- `POST /api/templates` - Create template
- `PUT /api/templates/:id` - Update template
- `DELETE /api/templates/:id` - Delete template

### Invoices
- `GET /api/invoices` - Get invoices (with search/filter)
- `GET /api/invoices/:id` - Get single invoice
- `POST /api/invoices` - Create invoice
- `PUT /api/invoices/:id` - Update invoice
- `DELETE /api/invoices/:id` - Delete invoice
- `GET /api/invoices/:id/pdf` - Download invoice PDF
- `POST /api/invoices/:id/send` - Send invoice via email

### Customers
- `GET /api/customers` - Get all customers
- `GET /api/customers/:id` - Get single customer
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Settings
- `GET /api/settings` - Get company settings
- `POST /api/settings` - Update settings

## Usage Guide

### 1. Initial Setup

1. Go to **Settings** page
2. Configure company information, logo, and invoice prefix
3. Set default currency

### 2. Add Customers

1. Go to **Customers** page
2. Click **New Customer**
3. Fill in customer details and save

### 3. Create Invoice Template

1. Go to **Templates** page
2. Click **New Template**
3. Name and describe your template
4. Use the template builder to:
   - Add text elements with fonts and colors
   - Add shapes/rectangles for layout
   - Position elements with drag-and-drop
   - Use property panel to adjust positioning
5. Save template

### 4. Create Invoice

1. Go to **Invoices** page
2. Click **New Invoice**
3. Select template and customer
4. Enter invoice number, dates, and line items
5. Add line items with descriptions, quantities, and prices
6. Save invoice

### 5. Send Invoice

1. Go to **Invoices** page
2. Click on an invoice to view details
3. Click **Send Email**
4. Enter recipient email and optional message
5. Send (requires AWS SES configuration)

## AWS SES Configuration

### Prerequisites

1. Verify email addresses in AWS SES:
   - Go to AWS SES Console
   - Add and verify your sender email
   - Verify customer/recipient emails (in sandbox mode)

2. Generate IAM credentials:
   - Create IAM user with SES permissions
   - Generate access key and secret key

3. Configure in `.env`:
   ```
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your_key
   AWS_SECRET_ACCESS_KEY=your_secret
   AWS_SES_FROM_EMAIL=noreply@yourdomain.com
   ```

## Environment Variables

### Backend (.env)
```
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=invoices_db
DB_USER=postgres
DB_PASSWORD=postgres

AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_SES_FROM_EMAIL=
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
```

## Troubleshooting

### Database Connection Error
- Ensure PostgreSQL is running
- Verify credentials in .env
- Check DB_HOST and DB_PORT

### AWS SES Errors
- Verify email addresses in SES console
- Check IAM permissions
- Ensure region matches configuration

### CORS Errors
- Frontend and backend must be running on correct ports
- Check REACT_APP_API_URL in frontend .env
- Verify backend has CORS enabled

### PDF Generation Issues
- Ensure PDFKit is installed: `npm install pdfkit`
- Check available disk space
- Verify font paths are correct

## Project Structure

```
invoices/
├── backend/
│   ├── src/
│   │   ├── db/          # Database connection and initialization
│   │   ├── routes/      # API endpoint handlers
│   │   ├── services/    # Business logic (PDF, Email)
│   │   ├── types/       # TypeScript interfaces
│   │   └── index.ts     # Express server
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── frontend/
│   ├── public/          # Static files
│   ├── src/
│   │   ├── api/         # API client
│   │   ├── pages/       # React pages
│   │   ├── components/  # Reusable components
│   │   ├── App.tsx      # Main app component
│   │   └── index.tsx    # React entry point
│   ├── package.json
│   └── .env.example
└── README.md
```

## Future Enhancements

- Authentication and multi-tenant support
- Invoice payment tracking
- Email templates for customization
- Recurring invoices
- Invoice reminders
- Multi-currency support with conversion
- Bank account details on invoices
- Invoice approval workflow
- Inventory management
- Expense tracking

## License

MIT

## Support

For issues and questions, please check the GitHub issues or contact support.
