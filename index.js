const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
const cookieParser = require("cookie-parser");
const session = require('express-session');
const mongoose = require("mongoose");
require("dotenv/config");
const schema = require("./models/schemas");

var fs = require('fs');
const { title } = require('process');

const app = express();

app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');
app.set('views',__dirname+'/views');

app.use(express.static(path.join(__dirname, 'images')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const oneDay = 1000 * 60 * 60 * 24;

//session middleware
app.use(session({
  secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
  saveUninitialized: true,
  cookie: { maxAge: oneDay },
  resave: false
}));
app.use(cookieParser());


// function read_poems() {
//   var data = fs.readFileSync("allocation.json");
//   poems_dict = [];
//   const poems = JSON.parse(data);
//   for (var i = 0; i < poems.length; i++) {
//     poems_dict.push({ 'key': poems[i].title, 'value': poems[i].value });
//   }

//   return poems_dict;
// }



app.get('/', (req, res) => {
  res.redirect('/login');
  //res.render('index',{message:"",layout: false});
});


app.get('/home', async (req, res) => {
  session = req.session;
  if (session.userid) {
    let users = schema.users;
    let user = await users.findOne({
      its_id: username
    });
    
    res.render('home', { message: user, layout: false });
  }
  else {
    res.render('index', { message: '', layout: false });
  }
});

app.get('/login', (req, res) => {


  res.render('login', { message: "", layout: false });
});

app.get('/register', (req, res) => {
  res.render('register', { message: "", layout: false });
});

app.post('/addUser', (req, res) => {
  let password = req.body.Password;
  let username = req.body.username;
  let confirm = req.body.confirm;

  if (confirm != password) {
    res.render('register', { message: 'Passoword does not match with confirm password.', layout: false });
  }
  else {
    res.render('register', { message: 'Successfully Registered.', layout: false });
    var data = fs.readFileSync("users.json");
    var myObject = JSON.parse(data);

    myObject[username] = password;

    // Writing to our JSON file
    var newData2 = JSON.stringify(myObject, null, 2);
    fs.writeFile("users.json", newData2, (err) => {
      if (err) throw err;
      console.log("New data added");
    });


  }
});

app.post('/login', async (req, res) => {
  let username = req.body.its;
  let password = req.body.sabeel;
  let users = schema.users;
  let user = await users.find({
    ITS_ID: username,
  });
  console.log(user);
  if (user.length == 0) {
    res.render('login', { message: 'ITS _ID not Registered Contact Admin', layout: false });
  }else
  {
  if (user[0].TanzeemFile_No !== password) {
    res.render('login', { message: 'Invalid Password', layout: false });
  }
  else {
    if (user[0].NOC == true) {
      req.session.user = user[0];
      let allocation = schema.allocation;
      let getdata = await allocation.find({
        its_id: user[0].ITS_ID
      });
      let data = []
      for (let i = 0; i < getdata.length; i++) {
        let data1 = {
          id: getdata[i]._id,
          date: getdata[i].date,
          its_id: getdata[i].its_id
        }
        data.push(data1);
      }
      console.log("start",data,"hello");
      res.render('home', { message: user[0].Allocated, data: data, layout: false,its:user[0].ITS_ID});
    }
    else
      res.render('login', { message: 'You are not Register for Azaan/Taqbirah Contact Admin for further query', layout: false });
  }



  // var data = fs.readFileSync("users.json");
//addedd
  // var myObject = JSON.parse(data);
  // var userflag =0;
  // for (const [key, value] of Object.entries(myObject)) {
  //   if (username ==key)
  //   {
  //     userflag=1;
  //   }
  // }

  // for (const [key, value] of Object.entries(myObject)) {
  //   if (username ==key &&  password==value)
  //   {
  //     
  //     userflag=2;
  //     res.render('home',{ message: username ,poems: read_poems(), layout: false});
  //   }
  // }




}
});

app.get('/update',(req,res)=>{
  if (req.session.user === undefined) {
    res.redirect("/login")
  }
  else if (req.session.user.Mobile !== "admin") {
    res.redirect('/login');
  } else {
  res.render('update', { message: '',name:"", layout: false });
  }
})

app.post('/update',async(req,res)=>{
  const ITS_ID=req.body.its;
  let users = schema.users;
  let user = await users.findOne({
    ITS_ID: ITS_ID,
  });
  
  res.render('update', { message: '',its:user.ITS_ID,name:user.Full_Name, layout: false });
})



const read_user = (data) => {

  poems_dict = [];

  console.log(data);
  for (let i = 0; i < data.length; i++) {
    console.log("hi mustafa")
    poems_dict.push({ 'name': data[i].Full_Name, 'its_id': data[i].ITS_ID, mobile: data[i].Mobile,allocated:data[i].Allocated});
  }


  return poems_dict;

}

app.get('/logout', (req, res) => {
  req.session.destroy();

  res.redirect('/login');
});

app.get('/admin/login', (req, res) => {
  res.render('adminlogin', { message: "", layout: false });


});
app.post('/admin/login', async (req, res) => {
  let username = req.body.its;
  let password = req.body.sabeel;
  let users = schema.users;
  let user = await users.find({
    ITS_ID: username
  });

  if (!user) {
    res.render('adminlogin', { message: "here Invalid username or password", layout: false });
  } else {
    if (user[0].Mobile == "admin" && user[0].Sabeel == password) {
      req.session.user = user[0];

      res.render('adminpanel', { message: "hello admin", layout: false });
    }
    else {
      res.render('adminlogin', { message: "Invalid username here or password", layout: false });
    }
  }
})

app.post('/admin/panel', async (req, res) => {
  console.log(req.session.user, "hello");
  if (req.session.user === undefined) {
    res.redirect('/login');
  }

  else if (req.session.user.Mobile !== "admin") {
    res.redirect('/login');
  } else {
    let arr = req.body.its.split("\r\n");
    console.log(arr,"array");
    let data = [];
    let users = schema.users;
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] !== "") {
        let user = await users.findOne({
          ITS_ID: arr[i]
        });
        let allocate=schema.allocation;
       
        
        if (user) {
          let all=await allocate.find({
            its_id: arr[i]
          });
          if(all.length>0){
            let object={
              allocated:all,
              user:user
            }
            data.push(object)
          }else
          {
            let object={
              allocated:[],
              user:user
            }
            data.push(object)
          }
        }
      }
    }

    let events = schema.events;
    let event = await events.find({
      available: true
    })
   

    if (data.length==0) {
      res.render('adminpanel', { message: [], layout: false });
      
    }
    else {
      res.render('adminpanel', { message: read_users(data, event), layout: false });
    }
  }
})
function read_users(data, event) {

  poems_dict = [];
  let e = read_event(event);
  
  console.log(data.length);
  for (let i = 0; i < data.length; i++) {
    let all=[];
    if(data[i].allocated.length>=0){
    all=read_all(data[i]['allocated']);
  }
    poems_dict.push({ 'name': data[i]['user'].Full_Name, 'its_id': data[i]['user'].ITS_ID, mobile: data[i]['user'].Mobile, misaq: data[i]['user'].Misaq, age: data[i]['user'].Age, noc: data[i]['user'].NOC, 'events': e,allocated:all,already:all.length });
  }


  return poems_dict;
}
function read_event(data) {

  event_dict = [];
  for (let j = 0; j < data.length; j++) {
    event_dict.push({ 'event': data[j].event, 'id': data[j].id });

  }
  return event_dict;
}
function read_all(data) {

  event_dict = [];
  for (let j = 0; j < data.length; j++) {
    event_dict.push({ 'event': data[j].date, 'id': data[j].id });

  }
  return event_dict;
}

app.post("/change/password",async(req,res)=>{
  const ITS_ID=req.body.its;
  const TanzeemFile_No=req.body.password;
  let users = schema.users;
  let user = await users.findOneAndUpdate({
    ITS_ID: ITS_ID,
  },{
    TanzeemFile_No:TanzeemFile_No
  }
  
  
)
if(user){
  res.render('adminpanel', { message: "hello admin", layout: false });
}else
res.status(200).json({success:false,message:"user not found"});

})

app.get("/register",(req,res)=>{
  if (req.session.user === undefined) {
    res.redirect("/login")
  }
  else if (req.session.user.Mobile !== "admin") {
    res.redirect('/login');
  } else {
  req.render("register",{message:"",layout:false})
  }
})

app.post("/allocate", async (req, res) => {
  const its_id = req.body.its_id;
  const event_id = req.body.event_id;
  let events = schema.events;
  let ev = await events.find({
    _id: event_id
  })
  
  if (ev.length == 0) {
    console.log("empty");
    res.status(200).json({
      success:false,
      message: "empty"
    })
  }
  else if (ev[0].available !== true)
    res.status(200).json({
      success: false,
      error: "already booked"
    })
  else {
    let allocation = schema.allocation;

    let allocate = await allocation.create({
      its_id: its_id,
      date: ev[0].event,
      serial:ev[0].serial
    });
    let users = schema.users;
    let user = await users.findOneAndUpdate({ ITS_ID: its_id }, { NOC: true });

    let event = await events.findByIdAndUpdate(event_id, { available: false });
    res.status(200).json({
      success: true,
      data: "raza given"
    })
  }
})
app.get('/admin/list', async (req, res) => {
 
  if (req.session.user === undefined) {
    res.redirect("/login")
  }
  else if (req.session.user.Mobile !== "admin") {
    res.redirect('/login');
  } else {

    let allocation = schema.allocation;
    let list = await allocation.find({}).sort({serial:1});
    let data = [];
    let users = schema.users;
    for (let i = 0; i < list.length; i++) {
      let user = await users.findOne({
        ITS_ID: list[i].its_id
      });
      if (!user) {
        res.render("razalist", { data: [], layout: false });
      }
      let list1 = {
        "id": list[i]._id,
        "its_id": list[i].its_id,
        "date": list[i].date,
        "name": user.Full_Name,
        "mobile": user.Mobile
      }
      data.push(list1);


    }
    res.render("razalist", { data: data, layout: false });
  }
})
app.get('/razalist',async(req,res)=>{
  let allocation = schema.allocation;
    let list = await allocation.find({}).sort({serial:1});
    let data = [];
    let users = schema.users;
    for (let i = 0; i < list.length; i++) {
      let user = await users.findOne({
        ITS_ID: list[i].its_id
      });
      if (!user) {
        res.render("razalist", { data: [], layout: false });
      }
      let list1 = {
        "id": list[i]._id,
        "its_id": list[i].its_id,
        "date": list[i].date,
        "name": user.Full_Name,
        "mobile": user.Mobile
      }
      data.push(list1);


    }
    res.render("listraza", { data: data, layout: false });
  }
)


app.get("/delete", async (req, res) => {
  
  let its_id = req.query.its_id;
  let all_id = req.query.all_id;
  let allocation = schema.allocation;
  let all = await allocation.findOne({
    _id: all_id,
  })
  let dlt = await allocation.findOneAndDelete({
    _id: all_id,
  });
  let check=await allocation.find({
    _id: all_id,
  })
  if(check.length==0){
    let users = schema.users;
    let updateUser = await users.findOneAndUpdate({ ITS_ID: its_id }, { NOC: false, Allocated: false });
  }
  let events = schema.events;
  let upeve = await events.findOneAndUpdate({ event: all.date }, { available: true })
  res.status(200).json(
    {
      success: true,
      message: "removed"
    }
  )


})


app.get("/print1", async (req, res) => {
  console.log(req.session, "admin session");
  if (req.session.user === undefined) {
    res.redirect("/login");
  }
  else if (req.session.Mobile === "admin") {
    res.redirect("login");
  }
  else {
    let ITS_ID = req.query.its;
    let users = schema.users;
    let user = await users.findOne({
      ITS_ID: ITS_ID
    })
    let event = schema.events;
    let eve = await event.findOne({
      _id: req.query.id
    })


    let data1 = {
      name: user.Full_Name,
      sabeel: user.TanzeemFile_No,
      mobile: user.Mobile,
      its: user.ITS_ID,
      event: eve.event

    }
    console.log(eve);
    let data = [];
    data.push(data1);
    res.render('print', { user: data, layout: false });
  }
})
app.get("/print2", async (req, res) => {

  if (req.session.user === undefined) {
    res.redirect("/login")
  } else {
    let ITS_ID = req.query.its;
    let users = schema.users;
    let user = await users.findOne({
      ITS_ID: ITS_ID
    })
    let allocation = schema.allocation;
    let eve = await allocation.findOne({
      _id: req.query.id
    })
    if (!eve) {
      res.redirect('/login');
    }


    let data1 = {
      name: user.Full_Name,
      sabeel: user.TanzeemFile_No,
      mobile: user.Mobile,
      its: user.ITS_ID,
      event: eve.date

    }
    console.log(eve);
    let data = [];
    data.push(data1);
    res.render('print', { user: data, layout: false });
  }
})
app.get('/allow',async(req,res)=>{
  console.log(req.query)
  let users = schema.users;
  let allocate=await users.findOneAndUpdate({
    ITS_ID:req.query.its_id
  },{
    Allocated:true
  }
  );
  res.status(200).json({
    success:true,
    message:"allocated"
  })

})
app.get('/sort',async(req,res)=>{
  let event = schema.events;
  
  let eve=(await event.find({})).forEach(async(data) =>{
    await event.updateOne({
        "_id": data._id,
        "event": data.event,
        "available":data.available,
    }, {
        "$set": {
            "serial": parseInt(data.serial)
        }
    });
})
console.log(eve);
res.status(200).json({
  success:true,

})
})

// db.student.find().sort({age:-1})
mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("db connected");
  })
  .catch(err =>
    console.log(err)
  );

const port = process.env.PORT||9001

app.listen(port, () => console.log(`This app is listening on port ${port}`));