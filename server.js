const express = require("express");
const app = express();

// config server side render MVC
app.use(express.json({ extended: false }));
app.use(express.static("./templates"));
app.set("view engine", "ejs");
app.engine("ejs", require("ejs").__express);
app.set("views", "./templates");

//config aws dynamoBD
const AWS = require("aws-sdk");
const config = new AWS.Config({
  accessKeyId: "AKIAZQKZVYE2VYD35BWZ",
  secretAccessKey: "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",
  region: "ap-southeast-1",
});
AWS.config = config;

const docClient = new AWS.DynamoDB.DocumentClient();

const tableName = "MonHoc";

const multer = require("multer");

const upload = multer();

app.get("/", (req, res) => {
  const params = {
    TableName: tableName,
  };
  docClient.scan(params, (err, data) => {
    if (err) {
      res.send('Internal Server Error');
    } else {
      return res.render("index", { monHocs: data.Items });
    }
  });
});

app.post("/", upload.fields([]), (req, res) => {
  const { stt, ma_mh, loai, hoc_ky, khoa } = req.body;

  const params = {
    TableName: tableName,
    Item: {
      "stt": stt,
      "ma_mh": ma_mh,
      "loai": loai,
      "hoc_ky": hoc_ky,
      "khoa": khoa,
    }
  }

  docClient.put(params, (err, data) => {
    if (err) {
      return res.send('Internal Server Error');
    } else {
      return res.redirect("/");
    }
  });
});

app.post('/delete', upload.fields([]) , (req, res) =>{
    const listItems = Object.keys(req.body);

    if(listItems.length === 0){
        return res.redirect("/");
    }
    
    function onDeleteItem(index){
        const params = {
            TableName: tableName,
            Key: {
                "ma_mh": listItems[index]
            }
        }

        docClient.delete(params, (err, data) =>{
            if(err) {
                return res.send('Internal Server Error');
            }else{
                if(index > 0) {
                    onDeleteItem(index - 1 );
                }else{
                    return res.redirect("/");
                }
            }
        })
    }
    onDeleteItem(listItems.length - 1);
});

app.listen(3090, () => {
  console.log("Server is running on port 3090!");
});
