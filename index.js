const express=require("express")
const app=express()
const bodyParser=require("body-parser")
const passport=require("passport")
const LocalStrategy=require("passport-local").Strategy
const fs=require("fs")
const session=require("express-session")
const pg=require("pg")
const Users=require("./db.js")
const bcrypt=require("bcrypt-nodejs")
const router=express.Router()
/*var config = {
    user: 'postgres',
    password: 'chuyentien1307',
    host: 'localhost',
    port: 5432,
    database: 'myDataUser',
    ssl: false,
    idleTimeoutMillis:30000
  }

  var pool=new pg.Pool(config)*/

var urlencodedParser = bodyParser.urlencoded({ extended: true })

app.use(bodyParser.json());
app.use( express.static( "public" ) )
app.use(session({
    secret : "secret",
    saveUninitialized: true,
    resave: true
  }))
  
app.use(urlencodedParser)
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

/*app.get("/login", function (req, res) {
    res.render("login.ejs")
})*/


/*passport.use(new LocalStrategy({
    usernameField: "username",
    passwordField: "password"
},
    function (username,password,done) {
        Users.find({where : {
            username : username
        }}).then(user=>function (user) {
            bcrypt.compare(password, user.password, function (err,result) {
                if (err) { return done(err);}
                if(!result) {
                    return done(null, false, { message: 'Incorrect username and password' });
                }
                return done(null, user);
            })
        }).catch(function (err) {
            return done(err);
        })
    }
))*/
app.get("/login",function(req,res){
    res.render("login.ejs")
})
app.post("/login", passport.authenticate("local", { failureRedirect: "/login", successRedirect: "/loginSuccess" }))

passport.use(new LocalStrategy({
    usernameField: "username",
    passwordField: "password"
},
    function (username,password,done) {
        Users.find({where : {
            username : username
        }})
        .then(user=>{
            if(user && user.password==password){
                //console.log(user);
                return done(null,user);
               
            }
            else {console.log("end ned");return done(null,false);}
        })
        .catch(function (err) {
            console.log(err.stack);
            return done(err);
           
        })
    }
))

/*passport.serializeUser((user,done)=>{
    done(null,user.usr)
});*/

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

Users.find({where:{
    username:"1"
}
}).then(user=>{
    return console.log(user.password+"abc")})
.catch(err=>console.log(err))


/*passport.deserializeUser(function(name,done){
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
*/

passport.deserializeUser(function(id, done) {
    Users.findById(id)
    .then(user=> {
        done(null, user);
    }).catch(function (err) {
        console.log(err);
    })
});

app.post("/signUp",urlencodedParser,function(req,res){
    const username=req.body.usernameSign
    const password=req.body.passwordSign
    
    Users.create({
        username: username,
        password: password
    }).then(()=>{res.render("signUpSuccess.ejs")})
    .catch(err=>res.render("signUp.ejs"))
    
})

app.get("/signUp",function(req,res){
    res.render("signUp.ejs")
})

/*app.post("/login",
  passport.authenticate('local', { successRedirect: "/loginSuccess",
                                   failureRedirect: "/login" }));*/



app.get("/loginSuccess",function(req,res){
    res.render("loginSuccess.ejs")
})
