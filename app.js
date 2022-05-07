const path = require('path');
const express = require('express');
const ejs = require('ejs');
const bodyparser = require('body-parser');
const mysql = require('mysql');
const app = express();

// set view files
app.set('views',path.join(__dirname,'views'));

// set view engine
app.set('view engine', 'ejs');
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: false}));

// Listening Server
app.listen(4200, ()=> {
    console.log("Server is running at port 4200");
});

// Creates a connection to the Project Information database
var conn = mysql.createConnection({
    host: "localhost",   
    user: "root",    
    password: "Root",   
    database: "projectinformation"  
  });

conn.connect((err)=> {
    if(!err)
        console.log('Connected to database Successfully');
    else
        console.log('Connection Failed!'+ JSON.stringify(err,undefined,2));
});

// Creates a default route
app.get('/', (req, res)=>{
    // res.send("NOTES ON PROJECTS");
    let sql = 'SELECT * FROM projectinformation.project_info';
    let query = conn.query(sql, (err, rows)=>{
        if(err) throw err
        // res.send(rows)
        res.render('projectIndex',{
            title:'Project Information',
            project_info: rows
        });
    });
});

// Creates a route to add projects to database
app.get('/addProjects', (req, res)=>{
    res.render('addProjects',{
        title:' Add New Project'
    }); 
});

app.post('/Add',(req, res)=>{
    let data = {
                 project_title: req.body.ptitle,
                 project_description: req.body.p_des,
                 project_start_dt: req.body.p_start_dt,
                 project_due_dt: req.body.p_due_dt
               }
    let sql = "INSERT INTO projectinformation.project_info SET ?"
    conn.query(sql, data, (err,result)=>{
        if(err) throw err;
        res.redirect('/');
    });
});

// Creates a route to edit projects in database
app.get('/edit/:id',(req, res)=>{
    const id = req.params.id;
    let sql = `SELECT id, project_title , project_description, date_format(project_due_dt, '%Y-%m-%d') AS project_due_dt FROM projectinformation.project_info  WHERE id = ${id}`;
    let query = conn.query(sql,(err, result)=>{
        if(err) throw err;
        res.render('projectEdit',{
            title: 'Update Project Information',
            proj: result[0]            
        });
    });
});

app.post('/update',(req, res)=>{
    const id = req.body.id;    
    let sql = "UPDATE projectinformation.project_info SET project_title='" +req.body.ptitle+"', project_description='"+req.body.p_des+"', project_due_dt='"+req.body.p_due_dt+"' WHERE  id= "+id; 
    conn.query(sql, (err,result)=>{
        if(err) throw err;
        res.redirect('/');
    });
});

// Allows User to delete a record
app.get('/delete/:id',(req, res)=>{
    const id = req.params.id;
    let sql = `DELETE FROM projectinformation.project_info WHERE id = ${id}`;
    let query = conn.query(sql,(err, result)=>{
        if(err) throw err;
        res.redirect('/')
    });
});

// creates a route for users to add note about projects
app.get('/notes/:id',(req, res)=>{
    const id = req.params.id;
    let sql = `SELECT * FROM projectinformation.project_info WHERE id = ${id}`;
    let query = conn.query(sql,(err, result)=>{
        if(err) throw err;
        res.render('projectNotes',{
            title: 'Add Project Notes',
            proj: result[0]            
        });
    });
});

app.post('/addNotes',(req, res)=>{
    let data = {
        project_id: req.body.project_id,
        notes: req.body.p_notes,
        active_dt: req.body.active_dt
      }
        let sql = "INSERT INTO projectinformation.notes SET ?"
        conn.query(sql, data, (err,result)=>{
        if(err) throw err;
        res.redirect('/');
    });   
});

// creates route to view project
app.get('/notes',(req, res)=>{
    // const id = req.body.id;
    let sql = "SELECT * FROM projectinformation.notes ";
    let query = conn.query(sql, (err, rows)=>{
        if(err) throw err
        res.render('notes',{
            title:'Project Notes',
            notes: rows
        });
    });
});

// create a route to view project notes corresponding to a specific ID
app.get('/notesinfo/:id',(req, res)=>{
    const id = req.params.id;
    let sql = `SELECT * FROM projectinformation.notes WHERE project_id = ${id}`;
    let query = conn.query(sql, (err, rows)=>{
        if(err) throw err
        res.render('notes',{
            title:'Project Notes',
            notes: rows
        });
    });
});

// creates a route to update project notes
app.get('/notesEdit/:id',(req, res)=>{
    const id = req.params.id;
    let sql = `SELECT id, notes, date_format(active_dt, '%Y-%m-%d') AS active_dt FROM projectinformation.notes WHERE id = ${id}`;
    let query = conn.query(sql,(err, result)=>{
        if(err) throw err;
        res.render('notesEdit',{
            title: 'Update Project Notes',
            notes: result[0]            
        });
    });
});

app.post('/updateNotes',(req, res)=>{
    const id = req.body.id;    
    let sql = "UPDATE projectinformation.notes SET notes='" +req.body.p_notes+"', active_dt='"+req.body.active_dt+"' WHERE  id = " +id; 
    conn.query(sql, (err,result)=>{
        if(err) throw err;
        res.redirect('/')
    });
});