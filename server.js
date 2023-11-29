const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const db = require('./db/db.json');
const uuid = require('./helpers/uuid');

const PORT = 3001;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

app.get('/api/notes', (req, res) => {
    res.json(db);
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

app.post('/api/notes', async (req, res) => {
    console.info(`${req.method} request received to add a note`);
    const { title, text } = req.body;

    if (title && text) {
        const newNote = {
            title,
            text,
            id: uuid()
        };

        try {
            const data = await fs.readFile('./db/db.json', 'utf8');
            const parsedNotes = JSON.parse(data);

            parsedNotes.push(newNote);

            await fs.writeFile('./db/db.json', JSON.stringify(parsedNotes, null, 2), 'utf8');

            const response = {
                status: 'success',
                body: newNote,
            };

            console.log(response);
            res.status(201).json(response);
        } catch (err) {
            console.error(err);
            res.status(500).json('Internal Server Error');
        }
    } else {
        res.status(500).json('Error in posting note');
    }
});


app.delete('/api/notes/:id', async (req, res) => {
    const noteId = req.params.id;

    try {
        const data = await fs.readFile('./db/db.json', 'utf8');
        const json = JSON.parse(data);

        const result = json.filter((note) => note.id.toString() !== noteId);

        await fs.writeFile('./db/db.json', JSON.stringify(result, null, 2), 'utf8');

        res.json(`Note ${noteId} has been deleted`);
    } catch (err) {
        console.error(err);
        res.status(500).json('Internal Server Error');
    }
});

app.listen(PORT, () =>
console.log(`App listening at http://localhost:${PORT}`)
);