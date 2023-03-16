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


function read_poems() {
  var data = fs.readFileSync("allocation.json");
  poems_dict = [];
  const poems = JSON.parse(data);
  for (var i = 0; i < poems.length; i++) {
    poems_dict.push({ 'key': poems[i].title, 'value': poems[i].value });
  }

  return poems_dict;
}



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
    console.log(user, "hi");
    res.render('home', { message: user, poems: read_poems(), layout: false });
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
    res.render('login', { message: 'Not a registered username', layout: false });
  }
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
      console.log(data);
      res.render('home', { message: read_user(user), data: data, layout: false });
    }
    else
      res.render('login', { message: 'You are not eligible for azaan/taqbirah contact admin', layout: false });
  }


  // var data = fs.readFileSync("users.json");
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




});
const read_user = (data) => {

  poems_dict = [];

  console.log(data.length);
  for (let i = 0; i < data.length; i++) {

    poems_dict.push({ 'name': data[i].name, 'its_id': data[i].its_id, mobile: data[i].mobile });
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
    let data = [];
    let users = schema.users;
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] !== "") {
        let user = await users.find({
          ITS_ID: arr[i]
        });
        if (user) {
          data.push(user);
        }
      }
    }

    let events = schema.events;
    let event = await events.find({
      available: true
    })


    if (data.length !== 0) {

      res.render('adminpanel', { message: read_users(data, event), layout: false });
    }
    else {
      res.render('adminpanel', { message: [], layout: false });
    }
  }
})
function read_users(data, event) {

  poems_dict = [];
  let e = read_event(event);
  console.log(data.length);
  for (let i = 0; i < data.length; i++) {
    console.log(data[i][0].Age, "here")
    poems_dict.push({ 'name': data[i][0].Full_Name, 'its_id': data[i][0].ITS_ID, mobile: data[i][0].Mobile, misaq: data[i][0].Misaq, age: data[i][0].Age, noc: data[i][0].NOC, 'events': e });
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

app.post("/allocate", async (req, res) => {
  const its_id = req.body.its_id;
  const event_id = req.body.event_id;
  let events = schema.events;
  let ev = await events.find({
    _id: event_id
  })
  console.log(event_id);
  if (ev.length == 0) {
    console.log("empty");
    res.status(200).json({
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
      date: ev[0].event
    });
    let users = schema.users;
    let user = await users.findOneAndUpdate({ ITS_ID: its_id }, { NOC: true, Allocated: true });

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
    let list = await allocation.find({});
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

  let users = schema.users;
  let updateUser = await users.findOneAndUpdate({ ITS_ID: its_id }, { NOC: false, Allocated: false });
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

mongoose.connect("mongodb+srv://ras:ras@cluster0.cdnkd3q.mongodb.net/ramzan?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("db connected");
  })
  .catch(err =>
    console.log(err)
  );

const port = process.env.PORT||9001

app.listen(port, () => console.log(`This app is listening on port ${port}`));