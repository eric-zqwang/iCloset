const {removeBackgroundFromImageUrl,removeBackgroundFromImageFile} = require("remove.bg")
 
const localFile = "./image/01.jpg";
const outputFile = `${__dirname}/out/img-removed-from-file.png`;
 
removeBackgroundFromImageFile({
  path: localFile,
  apiKey: "oZ4aG5Km9m7fCuVQxYYZsGSn",
  size: "regular",
  type: "auto",
  scale: "50%",
  outputFile 
}).then((result) => {
 console.log(`File saved to ${outputFile}`);
}).catch((errors) => {
 console.log(JSON.stringify(errors));
});