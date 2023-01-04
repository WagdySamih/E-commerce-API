# E-commerce API
   a simple shopping cart API with all its basic features with PayPal payment method.
    

## Guest Role:
*    can create a new account or log in an existing one.
*    can see products, with their reviews.


## User Role:
*    Guest Role.
*    View a profile, edit it, and logout.
*    Add,remove product from his wish list, Show all products in his wish list 
*    Create a cart and get its info.
*    add products, edit existing and delete them from the cart.
*    checkout the cart.
*    Write only one review per product, edit, and delete it.

## Admin Role:
*    Guest Role.
*    User Role.
*    Add new products to the website, edit existing ones and delete them.
*    Upload a max of 5 images per product, edit existing and delete them.
*    Access the users' orders and update their status.



Users are notified by email when their order status is updated.
Products can be sorted due to their price, creating time in ascending or descending order, and supports pagination.
orders can be sorted due to time created in ascending or descending order, also can be filtered due to their status, and can be paginated too.

### NPM modules used:
  Express, mongoDB, mongoose, jsonwebtokens, nodemailer, bcrypt, Validator.

### Future Work:
    Email verification and confirmation email.
    Add search method for products.
    Add testing.
