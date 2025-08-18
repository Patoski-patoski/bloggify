# Bloggify

Bloggify is a full-stack blogging application that allows users to create, manage, and share blog posts. Built with a focus on simplicity and usability, Bloggify employs a modern tech stack to provide a seamless experience for both developers and users.

## Features

- **User Authentication**: Secure login and registration using JSON Web Tokens (JWT).
- **CRUD Operations**: Create, Read, Update, and Delete blog posts with ease.
- **Slug-based URLS**: Access blog posts via user-friendly slugs.
- **User Management**: Users can manage their blog posts.

## Technology Stack

- **Frontend**: HTML, CSS, Bootstrap, JavaScript
- **Backend**: Node.js with Express.js
- **Database**: Mongodb, accessed through Mongoose
- **Authentication**: JSON Web Tokens (JWT)

## Installation

To get started with Bloggify, follow these steps:

1. **Clone the repository**:

   ```bash
   git clone https://github.com/Patoski-patoski/bloggify.git
   cd bloggify
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Set up your environment**:
   - Create a `.env` file in the root directory and add your MongoDB connection string and JWT secret:

    ```bash
     MONGODB_URI=your_mongodb_uri
     JWT_SECRET=your_jwt_secret
     REFRESH_JWT_SECRET=your_jwt_refresh_secret
     ```

4. **Run the application**:

   ```bash
   npm start
   ```

   The application should now be running on `http://localhost:3000`.

## API Endpoints

### Authentication

- **POST /register**: Register a new user
- **POST /login**: Login an existing user

### Blog Posts

- **GET /api/posts**: Retrieve all blog posts
- **GET /api/posts/:slug**: Retrieve a single blog post by slug
- **POST /api/posts**: Create a new blog post
- **PUT /api/posts/:slug**: Update an existing blog post
- **DELETE /api/posts/:slug**: Delete a blog post

## License

This project does not specify a license, so the default copyright applies. Feel free to contribute and modify as needed.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## Contact

For any inquiries, please contact [patrickpeters911@gmail.com](mailto:patrickpeters911@gmail.com).

## File structure

```bash
your-project/
├── public/                      # All static assets go here
│   ├── stylesheets/             # CSS files
│   │   └── profile.css          # Your profile CSS
│   ├── javascript/              # JavaScript files 
│   │   └── profile.js           # Your profile JavaScript
│   ├── img/                     # Images
│   │   ├── user.jpg             # Default user image
│   │   ├── blog-1.jpg           # Blog thumbnail
│   │   └── blog-draft.jpg       # Draft thumbnail
│   └── other-static-assets/     # Other assets
├── views/                       # Your EJS templates
│   ├── partials/                # Reusable template parts
│   │   └── navbar.ejs           # Navigation bar partial
│   └── profile.ejs              # Your profile view
├── src/                         # Application source code
│   ├── controllers/             # Controller functions
│   ├── middleware/              # Middlewares like authentication
│   └── models/                  # Database models
├── app.js or index.js           # Main application file
└── package.json                 # Project dependencies
```