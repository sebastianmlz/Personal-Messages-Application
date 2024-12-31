import express from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';

const app = express();
const port = 3000;
let messages = []; 

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));

// Configurar express-session
app.use(session({
    secret: 'mySecretKey',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Cambia a true si usas HTTPS
}));

app.get('/', (req, res) =>{
    messages = [];
    req.session.messages = [];
    res.render('index.ejs');
})

app.get('/home', (req, res) => {
    const nameUser = req.session.nameUser || 'Invitado';
    var messages = req.session.messages || [];
    res.render('home.ejs', { nameUser, messages });
});

app.get('/contact', (req, res) =>{
    res.render('contact.ejs');
})

app.get('/about', (req, res) =>{
    res.render('about.ejs');
})

app.get('/newMessage', (req, res) =>{
    res.render('new.ejs');
})

app.get('/editMessage', (req, res) =>{
    const index = parseInt(req.query.index);
    res.render('editForm.ejs', {index:index});
})

app.post('/submit',(req, res) =>{
    const name = req.body["name"];
    console.log(name);
    req.session.nameUser = name;
    res.redirect("/home");
})

app.post('/submitMessage', (req, res) => {
    const title = req.body["titleText"];
    const text = req.body["text"];
    
    // Crear un nuevo objeto mensaje con índice único
    const newMessage = {
        title,
        text,
        index: messages.length, // El índice es la posición actual en el arreglo
    };
    
    messages.push(newMessage);

    // Almacena en la sesión
    req.session.messages = messages;

    console.log(messages);
    res.redirect("/home");
});

app.post('/edited', (req, res) =>{
    const newTitle = req.body["newTitleText"];
    const newText = req.body["newText"];
    const index = req.body["index"];
    if(messages[index]) {
        messages[index].title = newTitle;
        messages[index].text = newText;
        req.session.messages = messages;
    }
    res.redirect("/home")
})

app.post('/deleteMessage',(req, res) => {
    const index = req.body["index"];
    if (index >= 0 && index < messages.length) {
        messages.splice(index, 1); // Elimina el mensaje del arreglo
        // Actualiza los índices restantes para mantener la consistencia
        for(let i=0; i < messages.length; i++){
            messages[i].index = i;
        }
        console.log(messages);
        req.session.messages = messages; 
    }
    res.redirect('/home');
})

app.listen(port, () =>{
    console.log(`Server running on port ${port}`);
})