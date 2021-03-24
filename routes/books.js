var express = require('express');
var router = express.Router();
var Books = require('../models/book')
const  db  = require('../models/index');
const { Book } = db;

/* GET shows full list of books */
router.get('/', asyncHandler(
  async function(req, res, next) {
    let books = await Book.findAll();
    res.render('allBooks', {books: books});
  }
));

/* GET new book form display route */
router.get('/new', asyncHandler(
  function(req, res, next) {
  const book = new Book();
  book.title = "";
  book.author="";
  book.genre="";
  book.year="";
  res.render('new-book',{book, title: 'New Book'});
}));

/* POST new book added to db */
router.post('/new', asyncHandler(
  async function(req, res, next) {
  let book = await Book.build(req.body);
  try{ 
    book = await book.save();
    res.redirect(`/books`);
  } catch(err) {
    if(err.name === "SequelizeValidationError") { // checking the error
      res.render("new-book", { book, errors: err.errors})

    } else {
      throw err;
    } 
    next(err);
  }
}));

router.get('/error/500', asyncHandler((req, res, next) => {
  const internalServerError = new Error('500 Internal Server Error');
  next(internalServerError);
}));

/* GET display book detail form */
router.get('/:id', asyncHandler(
  async function(req, res, next) {
  let id = req.params.id;
  console.log('bookid: ' + id);
 if(id){
   const book = await Book.findByPk(id);
   if(book){
    res.render('update-book', {book});
   }
 } else {
  res.redirect('/no-book-found');
 }
}));

/* POST update book detail form */
router.post('/:id', asyncHandler(
  async function(req, res, next) {
  const id = req.params.id;
  let book = await Book.findByPk(id);
  book.title = req.body.title;
  book.year = req.body.year;
  book.genre = req.body.genre;
  book.author = req.body.author;
  try{
    await book.save();
    res.redirect(`/books`);
  } catch(err) {
    if(err.name === "SequelizeValidationError") { // checking the error
      res.render("update-book", { book, errors: err.errors})
    } else {
      throw err;
    } 
  }
}));

/* DELETE  book   */
router.post('/:id/delete', asyncHandler(
  async function(req, res, next) {
  const id = req.params.id;
  let book = await Book.findByPk(id);
  await book.destroy();
  res.redirect('/books');
}));

function postHelper(obj, req){
  for( let key in obj.rawAttributes ){
    if(req.body[key]){
      obj[key] = req.body[key];
      console.log('the update------'+ obj[key] + ' = ' + req.body[key])
    }
  }
  return  obj;
}

function asyncHandler(cb){
  return async(req, res, next) => {
    try{
      await cb(req, res, next);
    } catch(error){
      console.log('There was a problem fulfilling the book route');
      throw(error);
    }
  }
}
module.exports = router;
