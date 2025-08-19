# Bloggify

A modern, full-stack blog application built with Node.js, Express, and MongoDB, designed for seamless content creation and sharing.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgements](#acknowledgements)

## Features

-   **User Authentication:** Secure signup, login, and logout with JWTs and refresh tokens.
-   **Role-Based Access Control:** Differentiate between 'reader' and 'author' roles.
-   **Blog Management:**
    -   Create, read, update, and delete blog posts.
    -   Support for drafts and publishing.
    -   Rich text editing for blog content (TinyMCE).
    -   Image uploads and Unsplash integration for featured images.
-   **Dynamic Content:**
    -   Unique slug generation for blog posts.
    -   Categorization with tags.
    -   Author profiles with published blogs.
-   **Robust Backend:**
    -   Centralized error handling for consistent API and web responses.
    -   Input validation using Joi for data integrity.
    -   Service layer architecture for clear separation of concerns.
-   **Security:** Implemented Helmet.js, CORS, and rate limiting.

## Technologies Used

-   **Backend:**
    -   Node.js
    -   Express.js (Web Framework)
    -   MongoDB (Database)
    -   Mongoose (ODM)
    -   bcrypt (Password Hashing)
    -   jsonwebtoken (JWT Authentication)
    -   express-async-handler (Error Handling for Async Routes)
    -   Joi (Input Validation)
    -   Helmet.js (Security Headers)
    -   express-rate-limit (Rate Limiting)
    -   cookie-parser (Cookie Handling)
    -   slugify (Slug Generation)
-   **Frontend:**
    -   EJS (Templating Engine)
    -   Bootstrap 5 (CSS Framework)
    -   TinyMCE (Rich Text Editor)
    -   Custom CSS and JavaScript
-   **Testing:**
    -   Jest (Testing Framework)
    -   Supertest (HTTP assertions)
    -   mongodb-memory-server (In-memory MongoDB for tests)

## Installation

### Prerequisites

-   Node.js (v18 or higher recommended)
-   npm (comes with Node.js)
-   MongoDB (local installation or cloud service like MongoDB Atlas)

### Steps

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/patoski-patoski/bloggify.git
    ```
2.  **Navigate to the project directory:**
    ```bash
    cd bloggify
    ```
3.  **Install dependencies:**
    ```bash
    npm install
    ```

## Environment Variables

Create a `.env` file in the root directory of your project and add the following environment variables:

```
PORT=3000
MONGODB_URI_ATLAS=your_mongodb_connection_string_or_local_uri (e.g., mongodb://localhost:27017/bloggify_db)
JWT_SECRET=a_very_strong_secret_for_jwt
REFRESH_JWT_SECRET=another_very_strong_secret_for_refresh_jwt
UNSPLASH_ACCESS_KEY=your_unsplash_api_access_key (optional, for image selection)
NODE_ENV=development # or production
```

## Running the Application

### Development Mode

To start the server in development mode (with nodemon for auto-restarts):

```bash
npm run dev
```

### Production Mode

To start the server in production mode:

```bash
npm start
```

Access the application in your browser at `http://localhost:3000` (or your specified PORT).

## Usage

1.  **Register:** Create a new user account.
2.  **Login:** Access your dashboard.
3.  **Create Blog:** Start writing new posts, save them as drafts, or publish them.
4.  **Manage Blogs:** Edit or delete your existing posts from your profile.
5.  **Explore:** Browse other authors' blogs.

## API Documentation

The API endpoints are documented using Swagger/OpenAPI.
You can view the interactive API documentation by running the application and navigating to `/api-docs` in your browser (e.g., `http://localhost:3000/api-docs`).

The OpenAPI specification is located at `swagger.yaml`.

## Testing

To run the test suite:

```bash
npm test
```

This will execute all tests using Jest and Supertest, ensuring the backend API endpoints function as expected.

## Project Structure

```bash
.
├── config/                 # Application configuration
├── __tests__/              # Unit and integration tests
├── src/
│   ├── controllers/        # Request handlers (e.g., auth, blog)
│   ├── database/           # Database connection setup
│   ├── middleware/         # Express middleware (e.g., auth, error handling, validation)
│   ├── models/             # Mongoose schemas and models
│   ├── public/             # Static assets (CSS, JS, images)
│   │   ├── javascript/     # Frontend JavaScript
│   │   ├── stylesheets/    # Frontend CSS
│   │   └── img/            # Images
│   ├── routes/             # API routes and web routes
│   ├── services/           # Business logic and data manipulation
│   ├── utils/              # Utility functions (e.g., slugify)
│   └── views/              # EJS templates
├── .env.example            # Example environment variables
├── app.js                  # Main Express application file
├── server.js               # Server startup file
├── package.json            # Project dependencies and scripts
├── README.md               # Project README
└── ...
```

## Contributing

We welcome contributions! Please follow these steps:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/your-feature-name`).
3.  Make your changes.
4.  Ensure tests pass (`npm test`).
5.  Commit your changes (`git commit -m 'feat: Add new feature'`).
6.  Push to the branch (`git push origin feature/your-feature-name`).
7.  Open a pull request.

Please ensure your code adheres to the existing style and conventions.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgements

-   Inspired by various Node.js and Express.js best practices.
-   Thanks to the creators of the libraries and tools used in this project.
-   HTML Codex for the base template design.
