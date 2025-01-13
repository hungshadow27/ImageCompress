const express = require("express");
const app = express();
const http = require("http").createServer(app);
const compressImages = require("compress-images");
const formidable = require("express-formidable");
app.use(formidable());
const fileSystem = require("fs");
app.set("view engine", "ejs");

const port = 3000;
http.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  app.post("/compressImage", (req, res) => {
    const image = req.files["image/*"];
    console.log(req.files);
    if (image.size > 0) {
      if (image.type == "image/png" || image.type == "image/jpeg") {
        fileSystem.readFile(image.path, (error, data) => {
          if (error) throw error;
          const filePath = `uploads/${new Date().getTime()}-${image.name}`;
          const compressedFilePath = `uploads/${image.name}`;
          const compression = 60;
          fileSystem.writeFile(filePath, data, async (error) => {
            if (error) throw error;
            compressImages(
              filePath,
              compressedFilePath,
              { compress_force: false, statistic: true, autoupdate: true },
              false,
              {
                // jpg: { engine: "mozjpeg", command: ["-quality", compression] },
                jpg: { engine: "webp", command: false },
              },
              {
                //   engine: "pngquant", command: ["--quality=" + compression, "-o"],
                png: { engine: "webp", command: false },
              },
              { svg: { engine: "svgo", command: "--multipass" } },
              {
                gif: {
                  engine: "gifsicle",
                  command: ["--color", "64", "--use-col=web"],
                },
              },
              async (error, completed, statistic) => {
                console.log("-------------");
                console.log(error);
                console.log(completed);
                console.log(statistic);
                console.log("-------------");

                fileSystem.unlink(filePath, (error) => {
                  if (error) throw error;
                });
              }
            );
            res.send("File has been compressed and saved.");
          });
          fileSystem.unlink(image.path, (error) => {
            if (error) throw error;
          });
        });
      } else {
        res.send("Please select an image");
      }
    } else {
      res.send("Please select an image");
    }
  });
  app.get("/", (req, res) => {
    res.render("index");
  });
});
