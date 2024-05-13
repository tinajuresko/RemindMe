const jwt = require('jsonwebtoken');

// Middleware funkcija za provjeru JWT tokena
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = req.headers.authorization.split(' ')[1]; // Dobivanje tokena iz zaglavlja Authorization
    
    if (token == null) {
        return res.sendStatus(401); // Ako token nije pronađen, vraća 401 Unauthorized
    }

    jwt.verify(token, 'tajni-kljuc', (err, user) => {
        if (err) {
            return res.sendStatus(403); // Ako token nije valjan, vraća 403 Forbidden
        }
        req.user = user; // Postavljanje korisnika iz tokena u request objekt
        next(); // Nastavlja s izvršavanjem sljedećeg middleware-a
    });
}

module.exports = authenticateToken;
