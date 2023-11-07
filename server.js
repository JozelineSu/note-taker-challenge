const express = require('express');
const path = require('path');
const fs = require('fs');
const db = require('./db/db.json');
const uuid = require('./helpers/uuid');

const PORT = 3001;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

app.get('/api/notes', (req, res) => {
    res.json(db.slice(1));
    console.info(`${req.method} request received to get notes`);
});

app.get('/', (req, res) => 
res.sendFile(path.join(__dirname, '/public/index.html'))
);

app.get('/notes', (req, res) =>
    res.sendFile(path.join(__dirname, '/public/notes.html'))
);

app.get('*', (req, res) =>
    res.sendFile(path.join(__dirname, '/public/index.html'))
);

app.post('/api/notes', (req, res) => {
    console.info(`${req.method} request recieved to add a note`);
    const notesArray = [];
    const { title, text } = req.body;

    if (title && text) {
        const newNote = {
            title,
            text,
            id: uuid()
        };
        notesArray.push(newNote);
    
    fs.readFile('./db/db.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
        } else {
            const parsedNotes = JSON.parse(data);

            parsedNotes.push(newNote);

            fs.writeFileSync(
                './db/db.json',
                JSON.stringify(parsedNotes, null, 2),
                (writeErr) =>
                writeErr
                ? console.error(writeErr)
                : console.info('Succesfully updated notes')
            );
        }
    });
    const response = {
        status: 'success',
        body: newNote,
    };

    console.log(response);
    res.status(201).json(response);
    } else {
        res.status(500).json('Error in posting note');
    }
});

app.listen(PORT, () =>
console.log(`App listening at http://localhost:${PORT}`)
);
