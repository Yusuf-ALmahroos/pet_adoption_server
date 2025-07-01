![GA-Adoption-pet](https://files.slack.com/files-tmb/T03JBCX8WE7-F094D0G0SDN-ed728cb417/chatgpt_image_jun_23__2025__01_13_41_pm_720.png)


![ERD](https://files.slack.com/files-pri/T03JBCX8WE7-F094GDND000/untitled_diagram.drawio__1_.png)


[Back End](#back-end)
[github-pet_adoption_server](https://github.com/Yusuf-ALmahroos/pet_adoption_server)
# Pet Adoption Server

This is a backend server for a pet adoption platform, built with Node.js, Express, and MongoDB (Mongoose). It provides a RESTful API for managing users, pets, adoption requests, and comments.

## Features

*   **User Management**:
    *   User registration and login.
    *   Password hashing and JWT-based authentication.
    *   Update user passwords.
    *   Session checking.
*   **Pet Management**:
    *   Create, read, update, and delete pet listings.
    *   View all available pets.
    *   View pets owned by a specific user (shelter owner).
*   **Adoption Requests**:
    *   Users can create adoption requests for pets.
    *   View personal adoption requests.
    *   Shelter owners can view and respond to adoption requests for their pets (approve/reject).
    *   Pets are marked as `isAdopted` upon approval of a request.
*   **Comments**:
    *   Users can create comments on pet listings.
    *   View comments for a specific pet.
    *   Update and delete personal comments.

## Technologies Used

*   **Node.js**: JavaScript runtime environment.
*   **Express.js**: Web application framework for Node.js.
*   **MongoDB**: NoSQL database.
*   **Mongoose**: ODM (Object Data Modeling) library for MongoDB and Node.js.
*   **Bcrypt**: For password hashing.
*   **jsonwebtoken**: For JWT (JSON Web Token) based authentication.
*   **Dotenv**: To load environment variables from a `.env` file.

## Project Structure

```
.
     controllers/          # Contains the business logic for API endpoints
         AdoptController.js
         AuthController.js
         CommentController.js
         PetController.js
     db/                   # Database connection setup
         index.js
     middleware/           # Authentication middleware
         index.js
     models/               # Mongoose schemas for data models
        AdoptionRequest.js
         Comment.js
         Pet.js
         User.js
     routes/               # Defines API routes and links to controllers
         AdoptionRequestRouter.js
         AuthRouter.js
         CommentRouter.js
         PetRouter.js
     .env.example          # Example environment variables file
     package.json          # Project dependencies and scripts
     README.md             # This file
     server.js             # Main server entry point
```

## Setup and Installation

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd pet_adoption_server
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Environment Variables**:
    Create a `.env` file in the root directory and add the following:
    ```
    MONGODB_URI=your_mongodb_connection_string
    SALT_ROUNDS=10 # Or any integer for bcrypt salt rounds
    APP_SECRET=your_jwt_secret_key
    ```
    Replace `your_mongodb_connection_string` with your MongoDB connection URI (e.g., `mongodb://localhost:27017/petadoption`).
    Replace `your_jwt_secret_key` with a strong, random string.

4.  **Start the server**:
    ```bash
    node server.js
    ```
    The server will typically run on `http://localhost:3000` (or the port configured in `server.js`).

## API Endpoints

Below is a summary of the main API endpoints. All authenticated routes require a JWT in the `Authorization: Bearer <token>` header.

### Authentication (`/auth`)

*   `POST /auth/register`: Register a new user.
*   `POST /auth/login`: Log in a user and receive a JWT.
*   `PUT /auth/update/:user_id`: Update user password (authenticated).
*   `GET /auth/session`: Check user session (authenticated).

### Pets (`/pets`)

*   `GET /pets`: Get all pets.
*   `GET /pets/me`: Get pets owned by the authenticated user (shelter owner) (authenticated).
*   `GET /pets/:id`: Get a pet by ID (authenticated).
*   `POST /pets`: Create a new pet listing (authenticated).
*   `PUT /pets/:id`: Update a pet listing (authenticated, owner only).
*   `DELETE /pets/:id`: Delete a pet listing (authenticated, owner only).

### Adoption Requests (`/adoption-requests`)

*   `POST /adoption-requests`: Create a new adoption request (authenticated).
*   `GET /adoption-requests/my`: Get adoption requests made by the authenticated user (authenticated).
*   `GET /adoption-requests/received`: Get adoption requests received for the authenticated user's pets (authenticated, owner only).
*   `GET /adoption-requests/respond/:requestId`: Respond to an adoption request (approve/reject) (authenticated, owner only).

### Comments (`/comments`)

*   `POST /comments`: Create a new comment on a pet (authenticated).
*   `GET /comments/pet/:petId`: Get all comments for a specific pet.
*   `PUT /comments/:commentId`: Update a comment (authenticated, owner only).
*   `DELETE /comments/:commentId`: Delete a comment (authenticated, owner only).

## Usage Example (using `curl`)

### Register a User

```bash
curl -X POST -H "Content-Type: application/json" -d '{"name": "John Doe", "email": "john@example.com", "password": "password123"}' http://localhost:3001/auth/register
```

### Login a User

```bash
curl -X POST -H "Content-Type: application/json" -d '{"email": "john@example.com", "password": "password123"}' http://localhost:3001/auth/login
```
(This will return a JWT token that you can use for authenticated requests)

### Create a Pet (as a shelter owner)

```bash
curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer <YOUR_JWT_TOKEN>" -d '{"name": "Buddy", "type": "Dog", "breed": "Golden Retriever", "age": 2, "description": "Friendly and playful.", "image": "http://example.com/buddy.jpg"}' http://localhost:3001/pets
```

### Create an Adoption Request

```bash
curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer <YOUR_JWT_TOKEN>" -d '{"petId": "60c72b2f9b1e8c001c8e4d7a", "message": "I would love to adopt Buddy!"}' http://localhost:3001/adoption-requests



[FRONT END](#front-end)

[github-pet_adoption_client](https://github.com/Yusuf-ALmahroos/pet_adoption_client)

# GA Pet Adoption Client

This is a React-based front-end application for a pet adoption platform. It allows users to view available pets, register, log in, add new pets for adoption, edit pet details, submit adoption requests, and manage their user profile.

## Features

- **User Authentication:** Register, Login, and Update Password functionality.
- **Pet Listing:** View a list of available pets, categorized by type (Dogs, Cats, Birds, Other Animals).
- **Pet Details:** View detailed information about individual pets, including descriptions and images.
- **Add/Edit Pets:** Authenticated users can add new pets to the platform and edit existing pet details.
- **Adoption Requests:** Users can submit adoption requests for available pets.
- **User Profile:** View adopted pets and manage user-specific information.
- **Comments:** Users can leave comments on pet profiles.
- **Responsive Navigation:** A navigation bar that adapts based on user login status.

## Technologies Used

- **React:** A JavaScript library for building user interfaces.
- **React Router DOM:** For declarative routing in React applications.
- **Axios:** A promise-based HTTP client for making API requests.
- **CSS:** For styling the application.

## Project Structure

The project follows a standard React application structure:

```

    public/
         Pet Adaption Logo.png
     services/
         api.js
    src/
        App.css
         App.jsx
         main.jsx
         components/
         AddPetForm.jsx
         AdoptionRequestForm.jsx
         CommentSection.jsx
         EditPetForm.jsx
         LoginForm.jsx
         Nav.jsx
         PetCard.jsx
         RegisterForm.jsx
         UpdatePasswordForm.jsx
      pages/
         AddPet.jsx
         EditPet.jsx
         Home.jsx
         Login.jsx
         Pet.jsx
         Register.jsx
         UserProfile.jsx
      styles/
         AddPetForm.css
         AdoptionRequestForm.css
         EditPetForm.css
         home.css
         LoginForm.css
         Nav.css
         pet.css
         petCard.css
         RegisterForm.css
         UpdatePasswordForm.css
     .gitignore
     index.html
     package.json
     README.md
     vite.config.js
```

- `src/App.jsx`: The main application component, handling routing and user state.
- `src/main.jsx`: Entry point for the React application.
- `src/components/`: Contains reusable UI components (e.g., forms, navigation, cards).
- `src/pages/`: Contains components representing different views or pages of the application.
- `src/styles/`: Contains CSS files for styling various components and pages.
- `services/api.js`: Configures the Axios instance for API calls.

## Setup and Installation

1.  **Clone the repository:**
    ```bash
    git clone [repository-url]
    cd pet_adoption_client
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Start the development server:**
    ```bash
    npm run dev
    ```
    The application will typically run on `http://localhost:5173` (or another available port).

## Usage

- Navigate to the home page to view available pets.
- Use the navigation bar to log in, register, or access other features.
- Logged-in users can add new pets or manage their profile.

## API Endpoint

The application interacts with a backend API running at `http://localhost:3000`. Ensure the backend server is running for full functionality.
