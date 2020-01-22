DROP DATABASE IF EXISTS bamazon;

CREATE DATABASE bamazon;

USE bamazon;

CREATE TABLE products(
item_id INT NOT NULL auto_increment,
product_name VARCHAR (100) NULL,
department_name VARCHAR (100) NULL,
price DECIMAL(10,2) NULL,
quantity INT NOT NULL,
PRIMARY KEY (item_id)
);

SELECT * FROM products;