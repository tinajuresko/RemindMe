const express = require('express');
const { Pool } = require('pg');
const cors = require('cors'); 
const jwt = require('jsonwebtoken');
const moment = require('moment');


const app = express();

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'Calendar',
  password: 'bazepodataka',
  port: 5432, 
});

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true // Omogući slanje kolačića (cookies) s zahtjevima
}));

// Endpoint za prijavu korisnika
app.post('/api/login', async (req, res) => {
    const { username, pass } = req.body;
    try {
        const client = await pool.connect();
        const result = await client.query(
            `SELECT * FROM userTable WHERE username = $1 AND pass = $2`,
            [username, pass]
        );
        client.release();
        if (result.rows.length > 0) {
            const token = jwt.sign({ username: username }, 'tajni-kljuc', { expiresIn: '15h' });
            res.status(200).json({ message: 'Logged in successfully' , token: token});
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    } catch (err) {
        console.error('Error during user login:', err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/api/login', (req, res) => {
    res.status(405).send('Method Not Allowed');
  });

const authenticateToken = require('./authenticateToken');

app.get('/api/protectedRoute', authenticateToken, (req, res) => {
      // Ruta koja zahtijeva autentifikaciju
      // Ovdje možete pristupiti req.user kako biste dobili informacije o trenutnom korisniku
      res.json({ message: 'Authenticated route', user: req.user });
});
  

// Endpoint za registraciju korisnika
app.post('/api/register', async (req, res) => {
    const { username, email, pass} = req.body;
    try {
        // Provjeri postoji li korisnik s istim korisničkim imenom
        const client = await pool.connect();
        const usernameCheck = await client.query(
            `SELECT * FROM userTable WHERE username = $1`,
            [username]
        );
        if (usernameCheck.rows.length > 0) {
            return res.status(409).json({ message: 'Username already exists' });
        }

        // Unesi novog korisnika u bazu podataka
        const result = await client.query(
            `INSERT INTO userTable (username, email, pass) VALUES ($1, $2, $3)`,
            [username, email, pass]
        );
        client.release();
        
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error('Error during user registration:', err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

//addEvent

app.post('/api/event', authenticateToken, async (req, res) => {
    const { title, description, dateofevent, timeofevent, people, repeat, notificationInterval, notificationRepeat } = req.body;
    const { username } = req.user; // Korisničko ime dobiveno iz JWT tokena
    console.log(username);
    try {
        // Ovdje možete provjeriti i obraditi ostale podatke o događaju
        const client = await pool.connect();
        const result = await client.query(
            `INSERT INTO eventTable (title, description, dateofevent, timeofevent, people, creator, repeat) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING event_id`,
            [title, description, dateofevent, timeofevent, people, username, repeat]
        );
        const event_id = result.rows[0].event_id;
        //ponavljaj event godinje
        if(repeat == 'godisnje'){
            let pom = dateofevent;
            for(let i = 1; i <= 5; i++){
                let newDate = moment(pom).add(1, 'years').format('YYYY-MM-DD');
                await client.query(
                    `INSERT INTO eventTable (title, description, dateofevent, timeofevent, people, creator, repeat) 
                    VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                    [title, description, newDate, timeofevent, people, username, repeat]
                );
                pom = newDate;
            }

        }else if(repeat == 'mjesecno'){
            let pom = dateofevent;
            for (let i = 1; i <= 24; i++) {
                let newDate = moment(pom).add(1, 'months').format('YYYY-MM-DD');
                await client.query(
                    `INSERT INTO eventTable (title, description, dateofevent, timeofevent, people, creator, repeat) 
                     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                    [title, description, newDate, timeofevent, people, username, repeat]
                );
                pom = newDate;
            }

        }else if(repeat == 'tjedno'){
            let pom = dateofevent;
            for (let i = 1; i <= 100; i++) {
                let newDate = moment(pom).add(7, 'days').format('YYYY-MM-DD');
                await client.query(
                    `INSERT INTO eventTable (title, description, dateofevent, timeofevent, people, creator, repeat) 
                     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                    [title, description, newDate, timeofevent, people, username, repeat]
                );
                pom = newDate;
            }

        }else if(repeat == 'dnevno'){
            let pom = dateofevent;
            for (let i = 1; i <= 100; i++) {
                let newDate = moment(pom).add(1, 'days').format('YYYY-MM-DD');
                await client.query(
                    `INSERT INTO eventTable (title, description, dateofevent, timeofevent, people, creator, repeat) 
                     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                    [title, description, newDate, timeofevent, people, username, repeat]
                );
                
                pom = newDate;
            }

        }

        //dodavanje notifikacija u bazu
        await client.query(
            `INSERT INTO notificationTable (username, event_id, repeatcount, notificationinterval) 
                VALUES ($1, $2, $3, $4)`,
            [username, event_id, notificationRepeat, notificationInterval]
        );

        //people
        let invitedUsers = [];
        if(people && people.trim() !== ''){
            invitedUsers = people.split(',').map(username => username.trim());
        }
        for(const invitedUser of invitedUsers){
            const emptyString = '';
            const resultForInvitedUser = await client.query(
                `INSERT INTO eventTable (title, description, dateofevent, timeofevent, people, creator, repeat) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING event_id`,
                [title, description, dateofevent, timeofevent, emptyString, invitedUser, repeat]
            );
            const event_id = resultForInvitedUser.rows[0].event_id;
            await client.query(
                `INSERT INTO notificationTable (username, event_id, repeatcount, notificationinterval) 
                 VALUES ($1, $2, $3, $4)`,
                [invitedUser, event_id, notificationRepeat, notificationInterval]
            );
        }
        
        res.status(201).json({ message: 'Event added successfully' });
    } catch (err) {
        console.error('Error adding event:', err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/api/event', (req, res) => {
    // Ovdje možete definirati logiku za obradu GET zahtjeva za /api/event
    res.send('GET request to the homepage');
});

//prikaz evenata u kalendaru
app.get('/api/events', authenticateToken, async (req, res)  => {
    try {
        const { username } = req.user; 
        console.log(username);
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM eventTable WHERE creator = $1', [username]);
        client.release();
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching events:', err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

//dohvacanje notifikacija
app.get('/api/notifications', authenticateToken, async (req, res) => {
    const { username } = req.user; // Korisničko ime dobiveno iz JWT tokena

    try {
        // Dohvaćanje podataka o notifikacijama na temelju korisničkog imena
        const client = await pool.connect();
        const result = await client.query(
            `SELECT eventTable.event_id, eventTable.title, eventTable.dateofevent, eventTable.timeofevent 
             FROM notificationTable 
             INNER JOIN eventTable ON notificationTable.event_id = eventTable.event_id 
             WHERE notificationTable.username = $1`,
            [username]
        );
        client.release();

        const notifications = result.rows;
        res.status(200).json(notifications);
    } catch (err) {
        console.error('Error fetching notifications:', err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

//brisanje notifikacija iz baze
app.delete('/api/notifications/:eventId', authenticateToken, async (req, res) => {
    const { username } = req.user; // Korisničko ime dobiveno iz JWT tokena
    const eventId = req.params.eventId;

    try {
        const client = await pool.connect();
        const result = await client.query(
            `DELETE FROM notificationTable WHERE username = $1 AND event_id = $2`,
            [username, eventId]
        );
        client.release();

        res.status(200).json({ message: 'Notification deleted successfully' });
    } catch (err) {
        console.error('Error deleting notification:', err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

//provjera treba li se slati notifikacija korisniku
app.post('/api/notificationsettings', authenticateToken, async (req, res) => {
    const eventIds  = req.body;

    
    console.log(typeof eventIds[0]);
    try {
        const client = await pool.connect();
        
        // Generirajte niz znakova '?' za upit na temelju duljine niza ID-ova
        const placeholders = eventIds.map((id, index) => `$${index + 1}`).join(', ');
        
        // Izvršite upit s dinamički generiranim placeholderima
        const result = await client.query(
            `SELECT 
                n.event_id, 
                n.repeatCount, 
                n.notificationInterval,
                e.dateofevent, 
                e.timeofevent,
                e.title
            FROM notificationTable n
            JOIN eventTable e ON n.event_id = e.event_id
            WHERE n.event_id IN (${placeholders}) AND n.repeatCount IS NOT NULL 
            AND n.notificationInterval IS NOT NULL`, // Umjesto $1, $2, ..., koristimo generirane placeholdere
            eventIds // Proslijedite niz ID-ova kao parametre upita
        );

        client.release();

        const notificationSettings = result.rows;
        res.status(200).json(notificationSettings);
    } catch (err) {
        console.error('Error fetching notification settings:', err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
