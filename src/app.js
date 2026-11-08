require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./config/database');
const userRoutes = require("./routes/userRoutes");
const articlesRoutes = require('./routes/articlesRoutes');
const categoriesRoutes = require('./routes/categoriesRoutes');
const authroute = require('./routes/authroute');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 7777;




// Middleware
app.use(express.json());
app.use(cookieParser())

// cors error 
app.use(cors({
    origin:[
        'http://localhost:4200',
        'https://rr-projects.netlify.app'
    ],
    credentials:true
}))
app.use((req, res, next) => {
    console.log('Incoming request:', req.method, req.originalUrl);
    next();
});
// Routes
app.use("/users", userRoutes); // abondand
app.use("/articles", articlesRoutes);
app.use("/categories",categoriesRoutes);
app.use("/admin",authroute)


async function startServer (){
    try {
        await pool.query('SELECT 1');
        console.log("data base connection successfull !");
        app.listen(PORT, ()=> {
            console.log("successfull listing to : ",PORT);
        });
    } catch (err) {
        console.log("database connection failure : ",err)
    }
}

startServer();
