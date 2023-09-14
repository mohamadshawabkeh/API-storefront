const jsonServer = require('json-server');
const server = jsonServer.create();
const db = require('./db.json');
const router = jsonServer.router(db);
const middlewares = jsonServer.defaults();
const bodyParser = require('body-parser');

const port = process.env.PORT || 3000;

server.use(middlewares);
server.use(bodyParser.json());

server.get('/products', (req, res) => {
  const data = router.db.getState().products;
  res.json(data);
});

server.put('/products/:id', (req, res) => {
  const { id } = req.params;
  const newData = req.body;

  router.db.updateById('products', id, newData);

  res.json(newData);
});

server.post('/products', (req, res) => {
  const newData = req.body;

  const newProduct = router.db
    .get('products')
    .push(newData)
    .write();

  res.json(newProduct);
});

server.delete('/products/:id', (req, res) => {
  const { id } = req.params;

  const removedProduct = router.db
    .get('products')
    .remove({ id })
    .write();

  res.status(204).end();
});

// Add a route to update the product's inventory
server.put('/products/:id/decreaseInventory', (req, res) => {
    const productId = req.params.id;
    const quantityToDecrease = parseInt(req.query.quantity); // Get the quantity from the query parameter
  
    // Retrieve the product from the database and update the inventory count
    const product = router.db
      .get('products')
      .find({ id: parseInt(productId) })
      .value();
  
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
  
    if (product.inventoryCount < quantityToDecrease) {
      return res.status(400).json({ error: 'Not enough inventory' });
    }
  
    // Update the inventory count in the database
    const newInventoryCount = product.inventoryCount - quantityToDecrease;
    router.db
      .get('products')
      .find({ id: parseInt(productId) })
      .assign({ inventoryCount: newInventoryCount })
      .write();
  
    res.status(204).end(); // 204 No Content response
  });
  


// Add a route to update the product's inventory when removing from the cart
server.put('/products/:id/increaseInventory', (req, res) => {
    const productId = req.params.id;
    const quantityToIncrease = parseInt(req.query.quantity);
  
  const product = router.db
    .get('products')
    .find({ id: parseInt(productId) })
    .value();

  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const newInventoryCount = product.inventoryCount + quantityToIncrease;
  router.db
    .get('products')
    .find({ id: parseInt(productId) })
    .assign({ inventoryCount: newInventoryCount })
    .write();

  res.status(204).end();
});

server.use(router);

server.listen(port, () => {
  console.log(`JSON Server is running on port ${port}`);
});
