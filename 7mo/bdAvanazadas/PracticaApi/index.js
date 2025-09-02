const express = require('express');
const app = express();

app.use(express.json());

app.use(express.urlencoded({extended: true}));

app.use(require('./routes/users'));

app.listen(process.env.PORT||3300, () => {
    console.log("Server on port", process.env.PORT||3000);
});

module.exports = app;