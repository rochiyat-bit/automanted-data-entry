# Automated Data Entry System

A production-grade automated data entry system with OCR and AI capabilities to extract data from physical/scanned documents and automatically populate a PostgreSQL database.

## Features

### Document Processing
- **Multi-format Support**: Upload PDF, JPG, and PNG files
- **Batch Processing**: Process up to 10 files simultaneously
- **OCR Integration**: Tesseract.js or Google Cloud Vision API
- **AI-Powered Extraction**: GPT-4 or Claude for intelligent data structuring

### Document Types
- **Invoices**: Extract invoice number, vendor, date, amount, line items
- **Receipts**: Extract merchant, date, total, tax, items
- **ID Cards**: Extract name, ID number, date of birth, address
- **Business Cards**: Extract name, company, email, phone, address, website

### Security & Authentication
- **NextAuth.js v5**: Secure authentication with JWT sessions
- **Role-Based Access Control (RBAC)**: Admin, Operator, and Viewer roles
- **Protected Routes**: Middleware-based authentication
- **Audit Logging**: Complete trail of all actions
- **Input Validation**: Zod schemas for all inputs
- **SQL Injection Prevention**: Sequelize ORM with parameterized queries

### Database
- **PostgreSQL**: Production-grade relational database
- **Sequelize ORM**: Type-safe database operations
- **Migrations**: Database schema versioning
- **Seeding**: Sample data for development

## Tech Stack

- **Frontend & Backend**: Next.js 14+ (App Router)
- **ORM**: Sequelize 6+
- **Database**: PostgreSQL 15+
- **OCR**: Tesseract.js / Google Cloud Vision API
- **AI**: OpenAI GPT-4 / Anthropic Claude
- **Authentication**: NextAuth.js v5
- **Validation**: Zod
- **UI**: Tailwind CSS
- **Container**: Docker & Docker Compose

## Prerequisites

- Node.js 18+ and npm 9+
- PostgreSQL 15+
- Docker and Docker Compose (for containerized deployment)
- OpenAI API key or Anthropic API key

## Quick Start

### Option 1: Docker (Recommended)

1. **Clone and configure environment**:
   ```bash
   git clone <repository-url>
   cd automanted-data-entry
   cp .env.example .env
   # Edit .env and add your API keys
   ```

2. **Start with Docker Compose**:
   ```bash
   docker-compose up -d
   ```

3. **Access the application**:
   - App: http://localhost:3000
   - pgAdmin: http://localhost:5050 (admin@example.com / admin)

### Option 2: Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials and API keys
   ```

3. **Set up PostgreSQL database**:
   ```bash
   createdb automated_data_entry
   ```

4. **Run migrations and seed data**:
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

5. **Start development server**:
   ```bash
   npm run dev
   ```

6. **Access the application**:
   Open http://localhost:3000

## Configuration

### Environment Variables

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/automated_data_entry

# Authentication
NEXTAUTH_SECRET=your-super-secret-key-change-this-in-production
NEXTAUTH_URL=http://localhost:3000

# OCR (Optional)
GOOGLE_VISION_API_KEY=your-google-vision-api-key
TESSERACT_LANG=eng

# AI (Choose one)
OPENAI_API_KEY=your-openai-api-key
# OR
ANTHROPIC_API_KEY=your-anthropic-api-key

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./public/uploads
```

### Default Users (Seeded)

After running `npm run db:seed`, you can login with:

| Role     | Email                    | Password     |
|----------|--------------------------|--------------|
| Admin    | admin@example.com        | admin123     |
| Operator | operator@example.com     | operator123  |
| Viewer   | viewer@example.com       | viewer123    |

## API Documentation

### Authentication

#### Register
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

#### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

### Documents

#### Upload Document
```bash
POST /api/documents/upload
Content-Type: multipart/form-data

file: <file>
```

#### List Documents
```bash
GET /api/documents?page=1&limit=20&status=processed
```

#### Get Document
```bash
GET /api/documents/{id}
```

#### Update Document
```bash
PATCH /api/documents/{id}
Content-Type: application/json

{
  "status": "verified"
}
```

#### Delete Document
```bash
DELETE /api/documents/{id}
```

### OCR Processing

#### Process Document
```bash
POST /api/ocr/process
Content-Type: application/json

{
  "documentId": "uuid-here"
}
```

### Dashboard

#### Get Statistics
```bash
GET /api/dashboard
```

### Data Retrieval

#### List Invoices
```bash
GET /api/invoices?page=1&limit=20
```

### Health Check

```bash
GET /api/health
```

## Project Structure

```
.
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth pages
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/              # Protected pages
│   │   ├── dashboard/
│   │   ├── documents/
│   │   ├── review/
│   │   └── settings/
│   ├── api/                      # API routes
│   │   ├── auth/
│   │   ├── documents/
│   │   ├── dashboard/
│   │   ├── invoices/
│   │   ├── ocr/
│   │   └── health/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/                    # React components
│   ├── ui/                       # shadcn/ui components
│   ├── documents/
│   ├── dashboard/
│   └── shared/
├── lib/                          # Core libraries
│   ├── db/                       # Database
│   │   ├── models/               # Sequelize models
│   │   ├── migrations/
│   │   ├── migrate.js
│   │   ├── seed.js
│   │   └── sequelize.ts
│   ├── ocr/                      # OCR services
│   │   └── tesseract.ts
│   ├── ai/                       # AI services
│   │   └── extract-data.ts
│   ├── processing/               # Document processing
│   │   └── document-processor.ts
│   ├── validation/               # Zod schemas
│   │   └── schemas.ts
│   ├── auth.ts                   # NextAuth config
│   ├── config.ts                 # App configuration
│   └── utils.ts                  # Utility functions
├── types/                        # TypeScript types
│   └── index.ts
├── hooks/                        # React hooks
├── public/                       # Static files
│   └── uploads/                  # Uploaded documents
├── Dockerfile
├── docker-compose.yml
├── .env.example
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## Database Schema

### Tables

1. **users**: User accounts with roles
2. **documents**: Uploaded documents
3. **invoices**: Extracted invoice data
4. **receipts**: Extracted receipt data
5. **id_cards**: Extracted ID card data
6. **business_cards**: Extracted business card data
7. **audit_logs**: Audit trail of all actions

## Development

### Running Tests
```bash
npm test
```

### Linting
```bash
npm run lint
```

### Building for Production
```bash
npm run build
npm start
```

## Deployment

### Docker Deployment

1. Build the image:
   ```bash
   docker build -t automated-data-entry .
   ```

2. Run with Docker Compose:
   ```bash
   docker-compose up -d
   ```

### Environment-Specific Deployments

For production, ensure you:
- Set strong `NEXTAUTH_SECRET`
- Use production database credentials
- Enable SSL/TLS for database connections
- Set up proper CORS policies
- Configure rate limiting
- Set up monitoring and logging

## Security Best Practices

1. **Never commit `.env` files**
2. **Use strong passwords** for default users
3. **Enable HTTPS** in production
4. **Regularly update dependencies**
5. **Monitor audit logs** for suspicious activity
6. **Implement rate limiting** on API endpoints
7. **Sanitize file uploads** to prevent malicious files

## Troubleshooting

### Database Connection Issues
```bash
# Test database connection
npm run db:migrate
```

### OCR Not Working
- Ensure Tesseract.js is properly installed
- Check file permissions on upload directory
- Verify supported file formats

### AI Extraction Failing
- Verify API keys are set correctly
- Check API quota/limits
- Ensure network connectivity to AI services

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation
- Review API documentation

## Acknowledgments

- Next.js team for the amazing framework
- Tesseract.js for OCR capabilities
- OpenAI and Anthropic for AI services
- PostgreSQL community
