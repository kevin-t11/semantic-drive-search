# Google Drive Semantic Search

A full-stack application that enables semantic search across Google Drive files using natural language processing.

## Features

- Google OAuth2.0 authentication
- Google Drive file indexing
- Semantic search using natural language
- Real-time search results

## Tech Stack

### Frontend (Client)

- React 18
- TypeScript
- Tailwind CSS for styling
- Vite for build tooling
- React Router for navigation
- Custom UI components (shadcn/ui)

### Backend (Server)

- Node.js
- Express.js
- Pinecone for vector embeddings
- Google Drive API integration
- OpenAI for semantic search

## Getting Started

### Prerequisites

- Node.js 16+
- Google Cloud Platform account with Drive API enabled
- Environment variables configured
- Pinecone API key
- OpenAI API key

### Installation

1. Clone the repository

```
git clone https://github.com/kevin-t11/semantic-drive-search.git
cd semantic-drive-search
```

2. Install dependencies

```
npm install
```

3. Configure environment variables
   Create a `.env` file in the root directory with the following variables:

```
cp .env.example .env
```

4. Start the development server

```
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173` to access the application.

## Usage

1. Login with Google OAuth2.0
2. Grant access to your Google Drive files
3. Perform semantic search using natural language
4. View search results in real-time

## Project Structure

```
semantic-drive-search/
├── client/ # React frontend
├── server/ # Node.js backend
├── .env # Environment variables
└── README.md # Project documentation
```

## Contributing

1. Fork the repository
2. Create a new branch
3. Make your changes and commit them
4. Push to your fork and create a pull request

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact
