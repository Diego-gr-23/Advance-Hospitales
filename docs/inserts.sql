USE novedades;

-- CLIENTES default user CF
INSERT INTO `novedades`.`Client` (`NIT`, `name`, `phone_number`) VALUES ('CF', 'CONSUMIDOR FINAL', '00000000'), ('12312312', 'PEPE EL POLLO', '12345678');

-- WORKERS: default password 'a'
INSERT INTO `Worker_Area` VALUES ('ADMIN', 'ADMINISTRADOR'), ('SELLS', 'VENTAS'), ('PRODUCTION', 'OPERARIO');
CALL insertWorkerAndGetId('0GGOy6X/t2XHqNKgYdfsWw==', 'testing admin', 'ADMIN', TRUE, @generated_id);
CALL insertWorkerAndGetId('0GGOy6X/t2XHqNKgYdfsWw==', 'testing production', 'PRODUCTION', TRUE, @generated_id);
CALL insertWorkerAndGetId('0GGOy6X/t2XHqNKgYdfsWw==', 'testing sells', 'SELLS', TRUE, @generated_id);
-- CLOTHES 
INSERT INTO `Size` (`id`) VALUES ('6'),('8'),('10'),('12'),('14'),('16'),('XS'),('S'),('M'),('L'),('XL'),('XXL');
INSERT INTO `Pledge` (`name`) VALUES ('CHUMPA DE DIARIO ADVANCE'),('CAMISA POLO ADVANCE'), ('PLAYERA FISICA ADVANCE'), ('PANTS FISICA ADVANCE');
-- CHUMPA DE DIARIO ADVANCE
INSERT INTO `Inventory` (`Pledge_id`, `Size_id`, `price`) VALUES (1, '6', 160), (1, '8', 160), (1, '10', 180), (1, '12', 180),
	(1, '14', 200), (1, '16', 200), (1, 'XS', 220), (1, 'S', 220), (1, 'M', 240), (1, 'L', 240), (1, 'XL', 260), (1, 'XXL', 260);
-- CAMISA POLO ADVANCE
INSERT INTO `Inventory` (`Pledge_id`, `Size_id`, `price`) VALUES (2, '6', 80), (2, '8', 80), (2, '10', 100), (2, '12', 100),
	(2, '14', 120),(2, '16', 120), (2, 'XS', 140), (2, 'S', 140), (2, 'M', 160), (2, 'L', 160), (2, 'XL', 180),(2, 'XXL', 180);
-- PLAYERA FISICA ADVANCE
INSERT INTO `Inventory` (`Pledge_id`, `Size_id`, `price`) VALUES (3, '6', 60), (3, '8', 60), (3, '10', 80), (3, '12', 80), (3, '14', 100),
	(3, '16', 100), (3, 'XS', 120), (3, 'S', 120), (3, 'M', 140), (3, 'L', 140), (3, 'XL', 160), (3, 'XXL', 160);
-- PANTS FISICA ADVANCE
INSERT INTO `Inventory` (`Pledge_id`, `Size_id`, `price`) VALUES (4, '6', 300), (4, '8', 300), (4, '10', 320), (4, '12', 320),
	(4, '14', 340), (4, '16', 340), (4, 'XS', 360), (4, 'S', 360), (4, 'M', 380), (4, 'L', 380), (4, 'XL', 400), (4, 'XXL', 400);
-- BUILDINGS
INSERT INTO `Building` (`name`, `direction`) VALUES ('Novedades Mercado San Pedro', '5a Calle 10-64 Zona 1 SP SM');
INSERT INTO `Building` (`name`) VALUES ('Almacen Cruz Blanca');
-- AVAILABILITY
-- Stock for Novedades Mercado San Pedro (Building_id = 1)
INSERT INTO `Stock` (`Building_id`, `Inventory_Pledge_id`, `Inventory_Size_id`, `stock`) VALUES
  -- Set stock for CHUMPA DE DIARIO ADVANCE
  (1, 1, '6', FLOOR(RAND() * 21)), (1, 1, '8', FLOOR(RAND() * 21)), (1, 1, '10', FLOOR(RAND() * 21)), (1, 1, '12', FLOOR(RAND() * 21)), (1, 1, '14', FLOOR(RAND() * 21)), 
  (1, 1, '16', FLOOR(RAND() * 21)), (1, 1, 'XS', FLOOR(RAND() * 21)), (1, 1, 'S', FLOOR(RAND() * 21)), (1, 1, 'M', FLOOR(RAND() * 21)), (1, 1, 'L', FLOOR(RAND() * 21)), 
  (1, 1, 'XL', FLOOR(RAND() * 21)),(1, 1, 'XXL', FLOOR(RAND() * 21)),
  -- Set stock for CAMISA POLO ADVANCE
  (1, 2, '6', FLOOR(RAND() * 21)), (1, 2, '8', FLOOR(RAND() * 21)), (1, 2, '10', FLOOR(RAND() * 21)), (1, 2, '12', FLOOR(RAND() * 21)), (1, 2, '14', FLOOR(RAND() * 21)), (1, 2, '16', FLOOR(RAND() * 21)), (1, 2, 'XS', FLOOR(RAND() * 21)), (1, 2, 'S', FLOOR(RAND() * 21)),
  (1, 2, 'M', FLOOR(RAND() * 21)), (1, 2, 'L', FLOOR(RAND() * 21)), (1, 2, 'XL', FLOOR(RAND() * 21)), (1, 2, 'XXL', FLOOR(RAND() * 21)), 
  -- Set stock for PLAYERA FISICA ADVANCE
  (1, 3, '6', FLOOR(RAND() * 21)), (1, 3, '8', FLOOR(RAND() * 21)), (1, 3, '10', FLOOR(RAND() * 21)), (1, 3, '12', FLOOR(RAND() * 21)), (1, 3, '14', FLOOR(RAND() * 21)), (1, 3, '16', FLOOR(RAND() * 21)), (1, 3, 'XS', FLOOR(RAND() * 21)),
  (1, 3, 'S', FLOOR(RAND() * 21)), (1, 3, 'M', FLOOR(RAND() * 21)), (1, 3, 'L', FLOOR(RAND() * 21)), (1, 3, 'XL', FLOOR(RAND() * 21)), (1, 3, 'XXL', FLOOR(RAND() * 21)),
  -- Set stock for PANTS FISICA ADVANCE
  (1, 4, '6', FLOOR(RAND() * 21)), (1, 4, '8', FLOOR(RAND() * 21)), (1, 4, '10', FLOOR(RAND() * 21)), (1, 4, '12', FLOOR(RAND() * 21)), (1, 4, '14', FLOOR(RAND() * 21)), (1, 4, '16', FLOOR(RAND() * 21)), (1, 4, 'XS', FLOOR(RAND() * 21)),
  (1, 4, 'S', FLOOR(RAND() * 21)), (1, 4, 'M', FLOOR(RAND() * 21)), (1, 4, 'L', FLOOR(RAND() * 21)), (1, 4, 'XL', FLOOR(RAND() * 21)), (1, 4, 'XXL', FLOOR(RAND() * 21));

-- Stock for Almacen Cruz Blanca (Building_id = 2)
INSERT INTO `Stock` (`Building_id`, `Inventory_Pledge_id`, `Inventory_Size_id`, `stock`) VALUES
  -- Set stock for CHUMPA DE DIARIO ADVANCE
  (2, 1, '6', FLOOR(RAND() * 21)), (2, 1, '8', FLOOR(RAND() * 21)), (2, 1, '10', FLOOR(RAND() * 21)), (2, 1, '12', FLOOR(RAND() * 21)), (2, 1, '14', FLOOR(RAND() * 21)), (2, 1, '16', FLOOR(RAND() * 21)),
  (2, 1, 'XS', FLOOR(RAND() * 21)), (2, 1, 'S', FLOOR(RAND() * 21)), (2, 1, 'M', FLOOR(RAND() * 21)), (2, 1, 'L', FLOOR(RAND() * 21)), (2, 1, 'XL', FLOOR(RAND() * 21)), (2, 1, 'XXL', FLOOR(RAND() * 21)),
  -- Set stock for CAMISA POLO ADVANCE
  (2, 2, '6', FLOOR(RAND() * 21)), (2, 2, '8', FLOOR(RAND() * 21)), (2, 2, '10', FLOOR(RAND() * 21)), (2, 2, '12', FLOOR(RAND() * 21)), (2, 2, '14', FLOOR(RAND() * 21)), (2, 2, '16', FLOOR(RAND() * 21)),
  (2, 2, 'XS', FLOOR(RAND() * 21)), (2, 2, 'S', FLOOR(RAND() * 21)), (2, 2, 'M', FLOOR(RAND() * 21)), (2, 2, 'L', FLOOR(RAND() * 21)), (2, 2, 'XL', FLOOR(RAND() * 21)), (2, 2, 'XXL', FLOOR(RAND() * 21)),
  -- Set stock for PLAYERA FISICA ADVANCE
  (2, 3, '6', FLOOR(RAND() * 21)), (2, 3, '8', FLOOR(RAND() * 21)), (2, 3, '10', FLOOR(RAND() * 21)), (2, 3, '12', FLOOR(RAND() * 21)), (2, 3, '14', FLOOR(RAND() * 21)), (2, 3, '16', FLOOR(RAND() * 21)), (2, 3, 'XS', FLOOR(RAND() * 21)),
  (2, 3, 'S', FLOOR(RAND() * 21)), (2, 3, 'M', FLOOR(RAND() * 21)),  (2, 3, 'L', FLOOR(RAND() * 21)), (2, 3, 'XL', FLOOR(RAND() * 21)), (2, 3, 'XXL', FLOOR(RAND() * 21)),  
  -- Set stock for PANTS FISICA ADVANCE
  (2, 4, '6', FLOOR(RAND() * 21)), (2, 4, '8', FLOOR(RAND() * 21)), (2, 4, '10', FLOOR(RAND() * 21)), (2, 4, '12', FLOOR(RAND() * 21)), (2, 4, '14', FLOOR(RAND() * 21)), (2, 4, '16', FLOOR(RAND() * 21)), (2, 4, 'XS', FLOOR(RAND() * 21)),
  (2, 4, 'S', FLOOR(RAND() * 21)), (2, 4, 'M', FLOOR(RAND() * 21)), (2, 4, 'L', FLOOR(RAND() * 21)), (2, 4, 'XL', FLOOR(RAND() * 21)), (2, 4, 'XXL', FLOOR(RAND() * 21));

-- ORDERS
INSERT INTO `Order_Status` (`id`) VALUES ('ENLISTED'), ('WAREHOUSE'),('DELIVERED'),('PARTIALLY DELIVERED'),('CANCELED');
-- ORDER FOR 3 CAMISA POLO ADVANCE 8 (240) + EMBROIDERY ON EXTRAS (20) 
INSERT INTO `Order` (`total`, `is_special`, `phone`, `name`, `Order_Status_id`, `date`) VALUES (260, TRUE, CONCAT('', FLOOR(10000000 + RAND() * (99999999 - 10000000 + 1))), 'Chismosin', 'DELIVERED', CURDATE() - INTERVAL 1 WEEK);
INSERT INTO `Order_Detail` (`Order_id`, `Inventory_Pledge_id`, `Inventory_Size_id`, `quantity`, `Order_Status_id`, `anotation`) VALUES ('1', '2', '8', '3', 'DELIVERED', 'Bordar el nombre Fino Filipino');

-- BILLS / RECEIPES
-- 1 CHUMPA DE DIARIO ADVANCE 10 (180) + 2 CAMISA POLO ADVANCE 12 (100)
INSERT INTO `Bill` (`total`, `date`, `Worker_id`) VALUES (380.00, CURDATE(), 'SLLS1');
-- 1 PANTS FISICA ADVANCE XL (400) 
INSERT INTO `Bill` (`Client_NIT`, `total`, `date`, `Worker_id`) VALUES ('12312312', 400.00, DATE('2022-01-01') + INTERVAL FLOOR(RAND() * (DATEDIFF('2023-12-31', '2022-01-01') + 1)) DAY, 'SLLS1');
-- 1 Order FOR ORDER 1 (300)
INSERT INTO `Bill` (`Client_NIT`, `total`, `date`, `Worker_id`, `Order_id`) VALUES ('12312312', 260, CURDATE(), 'SLLS1', 1);
-- NOTE: may i switch FK for 1:1 at Extra and Order Detail?
INSERT INTO `Extra` (`detail`, `price`) VALUES ('Bordar el nombre Juanito Perez', '20');
INSERT INTO `Bill_Detail` (`unitary_price`, `quantity`, `Bill_id`, `Inventory_Pledge_id`, `Inventory_Size_id`, `Extra_id`) VALUES 
	(180, 1, 1, 1, '10', NULL), (100, 2, 1, 2, '12', NULL), (400, 1, 2, 4, 'XL', NULL), (80, 3, 3, 2, '8', 1);

-- EXPENSES
INSERT INTO `Expense_Type` (`name`) VALUES ('SALARIOS'), ('Mobiliario y Equipo'), ('Herramientas'),('Alquileres'),('Gastos Varios');
INSERT INTO `Expense` (`ammount`, `Worker_id`, `Expense_Type_id`, `date`) VALUES (123.12, 'ADM1', 1, NOW()), (155.12, 'ADM1', 2, '2020-12-21'), (182.12, 'ADM1', 3, '2023-01-02');


-- CALL filter_expenses_dynamically('2020-02-02', '2022-01-01');

-- Call the stored procedure with desired start and end date (e.g., '2024-01-01', '2024-03-17')
CALL generate_sample_bills();