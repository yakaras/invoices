# Quick Start Guide

Get your invoice application up and running in 5 minutes!

## Option 1: Docker (Recommended - Easiest)

### Prerequisites
- Docker and Docker Compose installed
- AWS SES credentials (optional, for email sending)

### Steps

1. **Navigate to project directory:**
   ```bash
   cd /path/to/invoices
   ```

2. **Create .env file for AWS credentials:**
   ```bash
   # Create .env file in the root directory
   cat > .env << EOF
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   AWS_SES_FROM_EMAIL=noreply@yourdomain.com
   EOF
   ```

3. **Start the application:**
   ```bash
   docker-compose up --build
   ```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api
   - Database: PostgreSQL on localhost:5432

## Option 2: Manual Setup

### Prerequisites
- Node.js v16+
- PostgreSQL v12+
- npm or yarn

### Backend Setup

1. **Navigate to backend:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your database and AWS credentials
   ```

4. **Start backend:**
   ```bash
   npm run dev
   ```

Backend will run on http://localhost:5000

### Frontend Setup

1. **Navigate to frontend:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   # Adjust REACT_APP_API_URL if needed
   ```

4. **Start frontend:**
   ```bash
   npm start
   ```

Frontend will open at http://localhost:3000

## Initial Configuration

### 1. Add Company Settings
1. Click **Settings** in the sidebar
2. Fill in your company information
3. Upload your company logo (optional)
4. Click **Save Settings**

### 2. Add Your First Customer
1. Click **Customers** in the sidebar
2. Click **New Customer**
3. Enter customer details
4. Click **Save**

### 3. Create an Invoice Template
1. Click **Templates** in the sidebar
2. Click **New Template**
3. Name your template (e.g., "Standard Invoice")
4. Drag and drop elements onto the canvas:
   - Click **Text** to add text fields for invoice details
   - Click **Shape** to add rectangles for layout
5. Click **Save Template**

### 4. Create Your First Invoice
1. Click **Invoices** in the sidebar
2. Click **New Invoice**
3. Select your template
4. Select a customer
5. Enter invoice details:
   - Invoice number (e.g., INV-001)
   - Issue and due dates
   - Add line items with description, quantity, and price
6. Click **Save Invoice**

### 5. Send Invoice via Email
1. Go to **Invoices** page
2. Click on your invoice to view details
3. Click **Send Email**
4. Enter recipient email address
5. Add optional message
6. Click **Send**

## Common Tasks

### Download Invoice as PDF
- Go to Invoices → Click on invoice → Click **Download PDF**

### Search Invoices
- Go to Invoices → Use search box to find by number or customer
- Filter by status (Draft, Sent, Viewed, Paid)

### Edit Invoice
- Go to Invoices → Click on invoice → Modify details → Save

### Delete Invoice
- Go to Invoices → Click the delete button (trash icon)

### Export Template
- Templates are stored in database
- Can export via API: `GET /api/templates/:id`

## Troubleshooting

### Port Already in Use
```bash
# Change port in backend .env or frontend
# Backend: Change PORT=5000 to different port
# Frontend: REACT_APP_API_URL=http://localhost:PORT/api
```

### Database Connection Failed
```bash
# Check PostgreSQL is running
# Verify credentials in .env
# For Docker: postgres service must be healthy
```

### Email Not Sending
1. Check AWS SES credentials are correct
2. Verify sender email is verified in AWS SES
3. In sandbox mode, verify recipient emails too
4. Check backend logs for errors

### Frontend Won't Load
1. Check backend is running
2. Verify REACT_APP_API_URL points to correct backend
3. Check CORS errors in browser console

## Stopping the Application

### Docker
```bash
docker-compose down
```

### Manual
- Press `Ctrl+C` in terminal windows

## Next Steps

- Read full [README.md](./README.md) for detailed documentation
- Check API documentation in [README.md](./README.md#api-endpoints)
- Set up AWS SES for production email sending
- Configure HTTPS for production deployment

## Support

For detailed information, see [README.md](./README.md)

Enjoy your invoice management system! 📋
