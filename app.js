const express = require('express');
const fs = require('fs');
const csv = require('csv-parser');

const app = express();

const PORT = process.env.PORT ?? 3001;

// http://localhost:3001/filter?column=age&value=25&page=1&pageSize=10
app.get("/filter",(req, res) => {
    const results = [];
    const { column, value, page = 1, pageSize = 10 } = req.query;
    const startI = (page - 1) * pageSize;
    const endI = page * pageSize;

    try {
        
        fs.createReadStream('src/data/ejemplo.csv')
        .pipe(csv())
        .on('data', (data) => {
            if (data[column] === value) {
                results.push(data);
            }
        })
        .on('end', () => {
            const paginatedResults = results.slice(startI, endI);
            res.json({
                page: parseInt(page),
                pageSize: parseInt(pageSize),
                total: results.length,
                resultados: paginatedResults
            });
        })
        .on('error', (error) => {
            console.error('Error al leer archivo CSV:', error);
            res.status(500).json({ message: 'Error al leer el archivo CSV' });
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error general' });
    }

    


})

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
})
