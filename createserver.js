var http = require('http'); /// http coremodule require cheyy
const fs = require('fs');
const url = require('url');


http.createServer(function (req, res) {

    if (req.url === "/" && req.method === "GET") {
        fs.readFile('index.html', (err, data) => {
            if (err) {
                console.log("error reading index.html:", err);
                        res.writeHead(500, { 'Content-Type': 'text/html' });
                res.end("Internal Server Error");
            }

            else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(data);
            }
        });
    }

    else if (req.url === "/details" && req.method === "POST") {
        fs.readFile('details.html', (err, data) => {
            if (err) {
                console.log("error reading in details.html:", err);
                res.writeHead(500, { 'Content-Type': 'text/html' });
            }
            else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(data)
            }
        })
    }


    else if (req.method === 'POST' && req.url === '/') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            console.log('Complete body:', body);
            try {
                const formData = JSON.parse(body);

                fs.readFile('add.json', 'utf-8', (readErr, data) => {
                    if (readErr) {
                        res.writeHead(500, { 'Content-Type': 'text/html' });
                        res.end('Internal Server Error');
                    } else {
                        const jsonData = JSON.parse(data);
                        jsonData.push(formData);

                        fs.writeFile('add.json', JSON.stringify(jsonData, null, 2), writeErr => {
                            if (writeErr) {
                                res.writeHead(500, { 'Content-Type': 'text/html' });
                                res.end('Internal Server Error');
                            } else {
                                res.writeHead(302, { 'Location': '/' });
                                res.end();
                            }
                        });
                    }
                });
            } catch (error) {
                console.error(error);
                res.writeHead(400, { 'Content-Type': 'text/html' });
                res.end();
            }
        });
    }
 

    else if (req.url === "/add.json" && req.method === "GET") {
        fs.readFile('./add.json', (err, data) => {
            if (err) {
                console.log('error reading add.json', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end("Internal Server Error");
            }
            else {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(data);
            }
        });
    }

    else if (req.url === '/data' && req.method === 'GET') {
        fs.readFile('./add.json', (err, data) => {
            if (err) {
                console.log('Error reading add.json:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Internal Server Error' }));
            } else {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(data);
            }
        });
    }


    else if (req.url === '/data' && req.method === 'PUT') {
        let body = '';

        req.on('data', (chunk) => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                // Read the existing brand data
                fs.readFile('./add.json', 'utf-8', (readErr, data) => {
                    console.log("ok");
                    const ppdata = JSON.parse(body);
                    const parsedUrl = url.parse(req.url, true);
                    const pid = parsedUrl.query.id;
                    console.log(pid);
                    if (readErr) {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Internal Server Error' }));
                    } else {
                        const jsonData = JSON.parse(data);

                        // Update the brand data in the array based on pid
                        if (pid >= 0 && pid < jsonData.length) {
                            jsonData[pid] = ppdata;

                            // Write the updated data back to brand.json
                            fs.writeFile('add.json', JSON.stringify(jsonData, null, 2), (writeErr) => {
                                if (writeErr) {
                                    res.writeHead(500, { 'Content-Type': 'application/json' });
                                    res.end(JSON.stringify({ error: 'Internal Server Error' }));
                                } else {
                                    res.writeHead(200, { 'Content-Type': 'application/json' });
                                    res.end(JSON.stringify({ message: 'brand data updated successfully' }));
                                }
                            });
                        } else {
                            res.writeHead(404, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ error: 'brand not found' }));
                        }
                    }
                });
            } catch (error) {
                console.error(error);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Error parsing JSON data' }));
            }
        }); 
    }



    else if (req.url.startsWith("/details") && req.method === "GET") {
        fs.readFile("details.html", 'utf8', (err, data) => {
            if (err) {
                console.error(`Error reading details.html:`, err);
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Internal Server Error');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(data);
            }
        });
    }


    else if (req.url.startsWith("/update") && req.method === "GET") {
        fs.readFile("brand.html", 'utf8', (err, data) => {
            if (err) {
                console.error(`Error reading details.html:`, err);
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Internal Server Error');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(data);
            }
        });
    }
    

    else if (req.method === 'DELETE' && req.url.startsWith("/delete")) {
        const parsedUrl = url.parse(req.url, true);
        const id = parsedUrl.query.id;
    
        fs.readFile('add.json', 'utf8', (err, data) => {
            if (err) {
                console.error(`Error reading data from add.json:`, err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: "Internal Server Error" }));
            } else {
                try {
                    const jsonData = JSON.parse(data);
    
                    // Check if the index is within bounds
                    if (!isNaN(id) && id >= 0 && id < jsonData.length) {
                        // Remove the brand record at the specified index
                        jsonData.splice(id, 1);
    
                        // Write the updated data back to add.json
                        fs.writeFile('add.json', JSON.stringify(jsonData, null, 2), writeErr => {
                            if (writeErr) {
                                res.writeHead(500, { 'Content-Type': 'text/html' });
                                res.end('Internal Server Error');
                            } else {
                                res.writeHead(200, { 'Content-Type': 'text/html' });
                                res.end('Patient deleted successfully');
                            }
                        });
                        
                    } else {
                        res.writeHead(404, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: "Patient not found" }));
                    }

                } catch (parseError) {
                    console.error(`Error parsing JSON from add.json:`, parseError);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: "Error parsing JSON data" }));
                }
            }
        });
    }

    
    else if (req.method === 'PUT') {
        let body = '';

        req.on('data', (chunk) => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                const ppdata = JSON.parse(body);
                // Retrieve PId from query parameter
                const parsedUrl = url.parse(req.url, true);
                const pid = parsedUrl.query.id;// Retrieve PId from query parameter

                // Read the existing brand data
                fs.readFile('add.json', 'utf-8', (readErr, data) => {
                    if (readErr) {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Internal Server Error' }));
                    } else {
                        const jsonData = JSON.parse(data);

                        // Update the brand data in the array based on pid
                        if (pid >= 0 && pid < jsonData.length) {
                            jsonData[pid] = ppdata;

                            // Write the updated data back add.json
                            fs.writeFile('add.json', JSON.stringify(jsonData, null, 2), (writeErr) => {
                                if (writeErr) {
                                    res.writeHead(500, { 'Content-Type': 'application/json' });
                                    res.end(JSON.stringify({ error: 'Internal Server Error' }));
                                } else {
                                    res.writeHead(200, { 'Content-Type': 'application/json' });
                                    res.end(JSON.stringify({ message: 'brand data updated successfully' }));
                                }
                            });
                        } else {
                            res.writeHead(404, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ error: 'brand not found' }));
                        }
                    }
                });
            } catch (error) {
                console.error(error);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Error parsing JSON data' }));
            }
        }); 
    }

    else {
        fs.readFile("404.html", (err, data) => {
            res.writeHead(404, { "Content-Type": "text/html" });
            res.end(data);
        })
    }
}).listen(5000, () => {
    console.log('Server is running on port 5000');
});