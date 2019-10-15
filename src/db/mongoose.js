const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
}); 




// const newTask = new Task({
//     description: 'Do thing yo         ',

// })

// newTask.save().then((result) => {
//     console.log(result)
// }).catch((error) => {
//     console.log(error)
// })

// // const me = new User({
// //     name: 'Brandon ',
// //     email: '  BOb@hank.com',
// //     age: 10,
// //     password: 'pass0word'
// // })

// // me.save().then((result) => {
// //     console.log(result)
// // }).catch((error) => {
// //     console.log(error)
// // })

