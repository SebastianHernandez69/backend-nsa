const express = require('express');
const fs = require('fs');
const csv = require('csv-parser');
const { default: axios } = require('axios');

const app = express();

const PORT = process.env.PORT ?? 3001;

// ASTEROIDS
app.get("/asteroids",(req, res) => {

    const results = [];
    const { page = 1, limit = 10 } = req.query;
    const columns = ['full_name', 'a', 'e', 'i', 'per_y', 'diameter']

    try {

        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        
        fs.createReadStream('src/data/asteroids.csv')
            .pipe(csv())
            .on('data', (asteroids) => {

                const filteredAsteroids = {};
                columns.forEach(column => {
                    if(asteroids[column] !== undefined){
                        filteredAsteroids[column] = asteroids[column];
                    }
                });
                results.push(filteredAsteroids);
            })
            .on('end', () => {
                const paginatedAsteroids = results.sort((asteroid1, asteroid2) => parseFloat(asteroid2.a) > parseFloat(asteroid1.a) ? -1 : 1)
                .slice(startIndex, endIndex);

                res.json(paginatedAsteroids);
            })
            .on('error', (err) => {
                console.log(err);
                res.status(500).json({ message: 'Error' });
            });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error' });
    }

})

// COMETS
app.get("/comets", async (req, res) => {
    
    const { page = 1, limit = 10 } = req.query;

    try {

        startIndex = (page - 1) * limit;
        endIndex = page * limit;

        const response = await axios.get('https://data.nasa.gov/resource/b67r-rgxc.json');
        let comets = response.data;

        comets = comets.map(comet => ({
            e: comet.e,
            i_deg: comet.i_deg,
            q_au_1: comet.q_au_1,
            q_au_2: comet.q_au_2,
            p_yr: comet.p_yr,
            moid_au: comet.moid_au,
            object: comet.object
        }))
        .sort((comet1, comet2) => comet2.e > comet1.e ? -1 : 1)
        .slice(startIndex, endIndex);

        res.json(comets);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error' });
    }

})

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
})
