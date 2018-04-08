const express=require("express")
const app=express()
const bodyParser=require("body-parser")
const passport=require("passport")
const localStrategy=require("passport-local").Strategy
const fs=require("fs")
const session=require("express-session")
const pg=require("pg")


var config = {
    user: 'postgres',
    password: 'chuyentien1307',
    host: 'localhost',
    port: 5432,
    database: 'myDataUser',
    ssl: false,
    idleTimeoutMillis:30000
  }

  var pool=new pg.Pool(config)

  var urlencodedParser = bodyParser.urlencoded({ extended: true })

app.use( express.static( "public" ) )
app.use(session({secret:"mysecret"}))
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

app.get("/login", function (req, res) {
    res.render('login.ejs')
})

app.post("/login", passport.authenticate("local", { failureRedirect: "/login", successRedirect: "/loginSuccess" }))

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

app.post("/signUp",urlencodedParser,function(req,res){

    pool.connect((err, client, done) => {
        if (err)  {
            return console.error('error fetching client from pool', err);
        }
        var username=req.body.usernameSign;
        var password=req.body.passwordSign;

        const text = 'INSERT INTO "myDataUser"(username, password) VALUES($1, $2)';
        const values =[ username, password];
       
        client.query(text,values, (err, result) => {
          done();

          if (err) {
            return console.error('error running query', err);
          }
        res.render("signUpSuccess.ejs");
        })
      })
})

app.get("/signUp",function(req,res){
    res.render("signUp.ejs")
})