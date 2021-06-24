const csv = require("csv-parser")
const fs = require("fs")
const express = require("express")
const path = require("path")
const app = express()
const port = process.env.PORT || 80

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(express.static("public"))

app.get("/", (req, res) => { res.sendFile(path.join(__dirname, "public/index.html")) })

app.post("/", (req, res) => { deobfuscate(req.body.obfuscated, req.body.version, res) })

app.listen(port, () => { console.log(`Listening at http://localhost:${port}`) })

//Mappings map
const fieldsMap = []
const methodsMap = []
const paramsMap = []

//Deobfuscate
const deobfuscate = (obfuscated, version, res) => {
    //Parse fields
    fs.createReadStream(`mappings/${version}/fields.csv`)
        .pipe(csv())
        .on("data", (data) => { fieldsMap.push(data) })
        .on("end", () => {
        //Parse methods
        fs.createReadStream(`mappings/${version}/methods.csv`)
            .pipe(csv())
            .on("data", (data) => { methodsMap.push(data) })
            .on("end", () => {
            //Parse params
            fs.createReadStream(`mappings/${version}/params.csv`)
                .pipe(csv())
                .on("data", (data) => { paramsMap.push(data) })
                .on("end", () => {
                //Deobfuscate fields
                fieldsMap.forEach(field => {
                    obfuscated = obfuscated.replace(new RegExp(field.searge, "g"), field.name)
                })
                //Deobfuscate methods
                methodsMap.forEach(method => {
                    obfuscated = obfuscated.replace(new RegExp(method.searge, "g"), method.name)
                })
                //Deobfuscate params
                paramsMap.forEach(param => {
                    obfuscated = obfuscated.replace(new RegExp(param.param, "g"), param.name)
                })
                //Clear maps
                fieldsMap.length = 0
                methodsMap.length = 0
                paramsMap.length = 0
                //Send deobfuscated code with whitespace
                res.send(`<pre>${obfuscated}</pre>`)
            })
        })
    })
}