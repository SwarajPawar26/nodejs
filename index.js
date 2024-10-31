import cookieParser from 'cookie-parser';
import express from 'express'
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken'

const app = express()

mongoose.connect("mongodb://127.0.0.1:27017", {
    dbName: "backend"
}).then(()=> console.log("Database connected"))
.catch((e) => console.log(e));

const schema = new mongoose.Schema({
    name: String,
    email: String,
    password: String
});

const message = mongoose.model("Message", schema)

const name = 'Swaraj'

app.use(express.urlencoded({extended: true}));
app.use(cookieParser())

app.set("view engine", "ejs")
app.get('/', async (req, res) => {
    const {token} = req.cookies;

    if(token){
        const decoded = jwt.verify(token, "sjhajbc")
        req.user = await message.findById(decoded._id);
        res.render("logout", {name: req.user.name})
    }
    else{
        res.render("login")
    }
})
  
app.get("/logout", (req, res) => {
    res.cookie("token", null, {
        expires: new Date(Date.now())
    })
    res.redirect("/")
})

app.get("/exists", (req, res) => {
    res.render("exists")
})

app.post("/exists", (req, res) => {
    res.redirect("/")
})

app.post("/login", async (req, res) => {

    const {email, password} = req.body;

    let userID = await message.findOne({ email });
    if(!userID){
        return res.redirect("/register")
    }
    if(userID.password !== req.body.password){
        return res.render("login", {error : "Incorrect Password", email: userID.email})
    }
    userID = await message.create({email: email, password: password})
    const token =  jwt.sign({_id: userID._id}, "sjhajbc")

    await res.cookie("token", token, {
        expires: new Date(Date.now() + 60*1000)
    })
    res.redirect("/")
})

app.get("/register", (req, res) => {
    res.render("register")
})


app.post("/register", async(req, res) => {
    const {name, email, password} = req.body;
    let userID = await message.findOne({email})

    if(userID){
        return res.redirect("/exists")
    }
    userID = await message.create({name: name, email: email, password: password})
    res.redirect("/")
})

// app.get("/logout", (req, res) => {
//     res.redirect("/logout")
// })

app.listen(5000, ()=>{
    console.log("server is running")
})