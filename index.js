const csv = require('csv-parser');
const fs = require('fs');
const express = require("express")
const path = require('path')
const app = express()
var port = process.env.PORT || 80

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(express.static("public"))

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public/index.html"))
})

app.post("/", (req, res) => {
    deobfuscate(req.body.obfuscated, req.body.version, res)
})

app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`)
})

const fieldsMap = [];
const methodsMap = [];
const paramsMap = [];

const deobfuscate = async(obfuscated, version, res) => {
    fs.createReadStream(`mappings/${version}/fields.csv`)
        .pipe(csv())
        .on('data', (data) => { fieldsMap.push(data) })
        .on('end', () => {
            fs.createReadStream(`mappings/${version}/methods.csv`)
                .pipe(csv())
                .on('data', (data) => { methodsMap.push(data) })
                .on('end', () => {
                    fs.createReadStream(`mappings/${version}/params.csv`)
                        .pipe(csv())
                        .on('data', (data) => { paramsMap.push(data) })
                        .on('end', () => {
                            fieldsMap.forEach(field => {
                                obfuscated = obfuscated.replaceAll(field.searge, field.name)
                            })
                            methodsMap.forEach(method => {
                                obfuscated = obfuscated.replaceAll(method.searge, method.name)
                            })
                            paramsMap.forEach(param => {
                                obfuscated = obfuscated.replaceAll(param.param, param.name)
                            })
                            res.send(`<pre>${obfuscated}</pre>`)
                        })
                })
        })
}