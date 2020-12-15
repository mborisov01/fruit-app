const fs = require("fs");
const http = require("http");
const url = require("url");

const replaceTemplate = require("./modules/replaceTemplate");

///////////////////////////////////
/////////// FILES
//Blocking synchrones way
const textIn = fs.readFileSync("./txt/input.txt", "utf-8");
//console.log(textIn);

const textOut = `including text: ${textIn}.\nCreated on ${Date.now()}`;
fs.writeFileSync("./txt/output.txt", textOut);
//console.log("file written");
const newFile = fs.readFileSync("./txt/output.txt", "utf-8");
//console.log(newFile);

////Non-Blocking synchrones way
fs.readFile("./txt/start.txt", "utf-8", (err, data1) => {
  if (err) return console.log("No such file");
  fs.readFile(`./txt/${data1}.txt`, "utf-8", (err, data2) => {
    fs.readFile(`./txt/append.txt`, "utf-8", (err, data3) => {
      fs.writeFile("./txt/final.txt", `${data2}\n${data3}`, "utf-8", (err) => {
        //console.log("The file is written");
      });
    });
  });
});

//////////////////////////////
/////////// SERVER

//API
const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, "utf-8");
const tempOverview = fs.readFileSync(
  `${__dirname}/templates/template-overview.html`,
  "utf-8"
);
const tempCard = fs.readFileSync(
  `${__dirname}/templates/template-card.html`,
  "utf-8"
);
const tempProduct = fs.readFileSync(
  `${__dirname}/templates/template-product.html`,
  "utf-8"
);
const dataObject = JSON.parse(data);

const server = http.createServer((req, res) => {
  const { query, pathname } = url.parse(req.url, true);

  if (pathname === "/" || pathname === "/overview") {
    res.writeHead(200, { "Content-type": "text/html" });
    const cardsHtml = dataObject
      .map((el) => replaceTemplate(tempCard, el))
      .join("");
    const output = tempOverview.replace("{%PRODUCT_CARDS%}", cardsHtml);
    res.end(output);
  } else if (pathname === "/product") {
    const product = dataObject[query.id];
    res.writeHead(200, { "Content-type": "text/html" });
    const output = replaceTemplate(tempProduct, product);
    res.end(output);
  } else if (pathname === "/api") {
    res.writeHead(200, { "Content-type": "application/json" });
    res.end(data);
  } else {
    res.writeHead(404, {
      "Content-type": "text/html",
    });
    res.end("<h1>404</h1>");
  }
});

server.listen(8000, "127.0.0.1", () => {
  console.log("listening to request on port 8000");
});
