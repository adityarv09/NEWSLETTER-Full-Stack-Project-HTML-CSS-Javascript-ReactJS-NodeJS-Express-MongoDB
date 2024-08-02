const express = require('express');
const Article = require('../models/Article');
const router = express.Router();

// Create an article
router.post('/', async (req, res) => {
  try {
    const article = new Article(req.body);
    await article.save();
    res.status(201).send(article);
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

// Get all articles
router.get('/', async (req, res) => {
  try {
    const topic = req.query.category;
    let articles;
    if(topic){
      articles  = await Article.find({category: topic});
    } else {
       articles = await Article.find();
    }
    
    res.send(articles);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

// Get an article by ID
router.get('/:id', async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).send({ error: 'Article not found' });
    }
    res.send(article);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});



// cast vote

router.post('/:id/vote', async (req, res) => {
  const article_id = req.params.id;
  const {voteType}=req.body;
  try {
    const article = await Article.findById(article_id);
    if (!article) {
      return res.status(404).send({ error: 'Article not found' });
    }

    console.log(voteType);
    
    // save the updated article
    //await article.save;

    // how to update mongodb
    const count = article[voteType] + 1;

    const updatedArticle = await Article.findOneAndUpdate(
      { _id: article_id },
      { $set: { [voteType]: count } },
      { new: true } // Return the updated document
    );

    if (!updatedArticle) {
      return res.status(404).send({ error: 'Article not found' });
    }

    res.send(updatedArticle);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});


// Update an article by ID
router.put('/:id', async (req, res) => {
  try {
    const article = await Article.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!article) {
      return res.status(404).send({ error: 'Article not found' });
    }
    res.send(article);
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

// Delete an article by ID
router.delete('/:id', async (req, res) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);
    if (!article) {
      return res.status(404).send({ error: 'Article not found' });
    }
    res.send({ message: 'Article deleted' });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

module.exports = router;
