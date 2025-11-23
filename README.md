# Nawam Fabrics Node Backend

This is a Node.js backend project using Express.js, MongoDB (with Mongoose), and a clean folder structure.

## Structure

- `models/` - Mongoose models
- `routes/` - Express routes
- `controllers/` - Route controllers
- `config/` - Configuration files
- `middleware/` - Custom middleware

## Usage

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the server:
   ```bash
   npm start
   ```

## MongoDB

- Default connection: `mongodb://localhost:27017/nawam-fabrics`
- Change connection string in `config/db.js` or set `MONGO_URI` environment variable.
