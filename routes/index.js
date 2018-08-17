var express = require('express');
var router = express.Router();
var lda = require('lda');
var fetch = require("node-fetch");

var getGraphOfEntity = (entity) => {
  const url = "http://localhost:3000/wikiquery?id="
  return fetch(url + entity).then( body => body.json() ).then( json => { return json;});
}

var flatten = (arr) => {
  return arr.reduce(function (flat, toFlatten) {
    return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
  }, []);
}

/* GET home page. */
router.get('/', function(req, res, next) {
  var text = 'A canine is the best kind of pet, domesticated animals that can even work with you to take care of your livestock. there are other type of pets but canines are the best';
  var documents = text.match( /[^\.!\?]+[\.!\?]+/g );
  var ldaResult = lda(documents, 1, 10);

  getGraphOfEntity("Q144").then( (result) => {
    var nodeNames = result.graphNodes.map(node => node.label.toLowerCase());
    var categoryId = result.graphCategories.map(category => category.id.toLowerCase());
    var subcategoryNames = flatten(result.graphCategories.map( category => 
      category.subcategories.map(subcategory => 
        subcategory.title.replace('Category:', '').toLowerCase())));
    var pagesNames = flatten(result.graphCategories.map( category => 
      category.pages.map(page => 
          page.title.toLowerCase())));    

    var finalResult = nodeNames.concat(categoryId).concat(subcategoryNames).concat(pagesNames)

    console.log(ldaResult)
    var ldaTerms = ldaResult[0].map(term => term.term)

    var found = ldaTerms.some(r=> finalResult.includes(r))
    res.set('Content-Type', 'text/plain');
    var textToSend = "is this text related to Dogs?:    " + found;
    textToSend = textToSend + " \n\n\n\n ========================== "
    textToSend = textToSend + text
    textToSend = textToSend + " \n\n\n\n ========================== "
    res.send(textToSend)
  })
  
});

module.exports = router;
