# Restaurant Review Manager UI

A Next.js application for managing and responding to restaurant reviews using AI-generated responses.

## Features

- Load and display restaurant reviews from a business URL
- Generate AI-powered responses to reviews using customizable profiles
- Sort and filter reviews by rating and date
- Manage AI response profiles
- Responsive design with Tailwind CSS

## Prerequisites

- Node.js 20.x or later
- Docker and Docker Compose (for containerized deployment)
- Access to the backend API service

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000  # URL of the backend API service
```

## Development Setup

### Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Docker Development

1. Build and start the container:
   ```bash
   docker-compose up --build
   ```

2. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Production Deployment

### Docker Deployment

1. Build the production image:
   ```bash
   docker-compose -f docker-compose.prod.yml build
   ```

2. Start the container:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Manual Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── profiles/          # Profiles management page
│   ├── reviews/           # Reviews table page
│   └── page.tsx           # Home page (business URL input)
├── components/            # React components
├── types/                 # TypeScript type definitions
└── utils/                 # Utility functions
```

## API Integration

The application expects the backend API to provide the following endpoints:

- `POST /reviews/fetch` - Fetch reviews for a business URL
- `POST /message/get_response` - Generate AI responses for reviews

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License - see the LICENSE file for details.

## Troubleshooting

### Common Issues

1. **API Connection Issues**
   - Verify the `NEXT_PUBLIC_API_BASE_URL` is correct in your `.env` file
   - Ensure the backend API service is running and accessible

2. **Docker Build Issues**
   - Clear Docker cache: `docker-compose build --no-cache`
   - Verify Docker and Docker Compose are installed correctly

3. **Environment Variables**
   - Ensure all required environment variables are set
   - Restart the application after updating environment variables

### Getting Help

If you encounter any issues or need assistance:
1. Check the console logs for error messages
2. Review the API documentation
3. Open an issue in the repository 