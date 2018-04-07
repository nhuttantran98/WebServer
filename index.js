const express=require("express")
const app=express()
const bodyParser=require("body-parser")
const passport=require("passport")
const localStrategy=require("passport-local").Strategy
const fs=require("fs")
const session=require("express-session")

app.use( express.static( "public" ) );
app.use(session({secret:"mysecret"}))
app.use(bodyParser.urlencoded({extended:true}))
app.use(passport.initialize())
app.use(passport.session())


app.listen(3000,function(){
    console.log("server started")
})

app.set("views","./views")
app.set("view engine","ejs")

app.get("/",function(req,res){
    res.render("home.ejs")
})

app.get("/login", function (req, res) {
    res.render('login.ejs')
})

app.post("/login", passport.authenticate("local", { failureRedirect: "/login", successRedirect: "/loginSuccess" }))

/*app.route("/login")
.get(function(req,res){
    res.render("login.ejs")
})
.post(passport.authenticate("local",{failureRedirect:"/login",successRedirect:"/loginSuccess"}));*/

passport.use(new localStrategy(function(username,password,done){
    fs.readFile('./userdb.json',(err,data) => {
        const db=JSON.parse(data)
        const userRecord=db.find(user=>user.usr==username)
        if (userRecord && userRecord.pws==password){
            return done(null,userRecord)
        } else {
            return done(null,false)
        }
    })
}
))

passport.serializeUser((user,done)=>{
    done(null,user.usr)
});


app.get("/loginSuccess",function(req,res){
    res.render("loginSuccess.ejs")
})


passport.deserializeUser(function(name,done){
    fs.readFile('./userdb.json',(err,data)=>{
        const db=JSON.parse(data)
        const userRecord=db.find(user=>user.usr==name)
        if(userRecord){
            return done(null,userRecord)
        }else{
            return done(null,false)
        }
    })
});