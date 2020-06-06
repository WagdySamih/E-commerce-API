const mongoose = require('mongoose')
const connectURL = process.env.MONGODB_URL


mongoose.connect(connectURL,{
    useNewUrlParser:true,
    useCreateIndex:true,
    useUnifiedTopology: true,
    useFindAndModify: false,
}).then(() => {
    console.log("Connected to Database");
}).catch((err) => {
        console.log("Not Connected to Database ERROR! ", err)
});