DROP SCHEMA IF EXISTS `novedades` ;

-- -----------------------------------------------------
-- Schema novedades
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `novedades` ;
USE `novedades` ;

-- -----------------------------------------------------
-- TABLE Client
-- -----------------------------------------------------


CREATE TABLE `Client` (
  `NIT` VARCHAR(10) NOT NULL DEFAULT 'CF',
  `name` VARCHAR(60) NOT NULL DEFAULT 'CONSUMIDOR FINAL',
  `address` VARCHAR(100) NOT NULL DEFAULT 'CIUDAD',
  `phone_number` VARCHAR(12) NOT NULL,
  PRIMARY KEY (`NIT`),
  UNIQUE INDEX `NIT_UNIQUE` (`NIT` ASC) VISIBLE)
  ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `Worker_Area`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Worker_Area` ;

CREATE TABLE IF NOT EXISTS `Worker_Area` (
  `id` VARCHAR(15) NOT NULL,
  `name` VARCHAR(15) NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `Worker`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Worker` ;

CREATE TABLE IF NOT EXISTS `Worker` (
  `id` VARCHAR(10) NOT NULL,
  `password` VARCHAR(45) NOT NULL,
  `name` VARCHAR(45) NOT NULL,
  `allowed` TINYINT(1) NULL DEFAULT 0,
  `Worker_Area_id` VARCHAR(15) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_Worker_Worker_Area1_idx` (`Worker_Area_id` ASC) VISIBLE,
  CONSTRAINT `fk_Worker_Worker_Area1`
    FOREIGN KEY (`Worker_Area_id`)
    REFERENCES `Worker_Area` (`id`)
    ON DELETE NO ACTION
    ON UPDATE CASCADE)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `Expense_Type`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Expense_Type` ;

CREATE TABLE IF NOT EXISTS `Expense_Type` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `name_UNIQUE` (`name` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `Expense`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Expense` ;

CREATE TABLE IF NOT EXISTS `Expense` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `ammount` DOUBLE NOT NULL,
  `date` DATE NOT NULL DEFAULT NOW(),
  `Worker_id` VARCHAR(10) NOT NULL,
  `Expense_Type_id` INT(11) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_Expense_Worker_idx` (`Worker_id` ASC) VISIBLE,
  INDEX `fk_Expense_Expense_Type1_idx` (`Expense_Type_id` ASC) VISIBLE,
  CONSTRAINT `fk_Expense_Worker`
    FOREIGN KEY (`Worker_id`)
    REFERENCES `novedades`.`Worker` (`id`)
    ON DELETE NO ACTION
    ON UPDATE CASCADE,
  CONSTRAINT `fk_Expense_Expense_Type1`
    FOREIGN KEY (`Expense_Type_id`)
    REFERENCES `novedades`.`Expense_Type` (`id`)
    ON DELETE NO ACTION
    ON UPDATE CASCADE)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `Order_Status`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Order_Status` ;

CREATE TABLE IF NOT EXISTS `Order_Status` (
  `id` VARCHAR(20) NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `Order`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Order` ;

CREATE TABLE IF NOT EXISTS `Order` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `total` DOUBLE(7,2) NOT NULL DEFAULT 1.00,
  `is_special` TINYINT(4) NOT NULL DEFAULT 0,
  `phone` VARCHAR(10) NOT NULL,
  `name` VARCHAR(45) NULL DEFAULT NULL,
  `date` DATE NOT NULL DEFAULT NOW(),
  `Order_Status_id` VARCHAR(20) NOT NULL DEFAULT 'REGISTRADO',
  PRIMARY KEY (`id`),
  INDEX `fk_Orders_Order_Status1_idx` (`Order_Status_id` ASC) VISIBLE,
  CONSTRAINT `fk_Orders_Order_Status1`
    FOREIGN KEY (`Order_Status_id`)
    REFERENCES `Order_Status` (`id`)
    ON DELETE NO ACTION
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `Bill`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Bill` ;

CREATE TABLE IF NOT EXISTS `Bill` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `Client_NIT` VARCHAR(10) NOT NULL DEFAULT 'CF',
  `total` DOUBLE(9,2) NOT NULL DEFAULT 1.00,
  `date` DATE NOT NULL DEFAULT NOW(),
  `cancelled` BOOLEAN NOT NULL DEFAULT FALSE,
  `Order_id` INT(11) NULL DEFAULT NULL,
  `Worker_id` VARCHAR(10) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_Bill_Order1_idx` (`Order_id` ASC) VISIBLE,
  INDEX `fk_Bill_Worker1_idx` (`Worker_id` ASC) VISIBLE,
  CONSTRAINT `fk_Bill_Client`
	FOREIGN KEY (`Client_NIT`)
    REFERENCES `Client` (`NIT`)
    ON DELETE NO ACTION
    ON UPDATE CASCADE,
  CONSTRAINT `fk_Bill_Order1`
    FOREIGN KEY (`Order_id`)
    REFERENCES `Order` (`id`)
    ON DELETE NO ACTION
    ON UPDATE CASCADE,
  CONSTRAINT `fk_Bill_Worker1`
    FOREIGN KEY (`Worker_id`)
    REFERENCES `Worker` (`id`)
    ON DELETE NO ACTION
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `Extra`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Extra` ;

CREATE TABLE IF NOT EXISTS `Extra` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `detail` VARCHAR(100) NOT NULL,
  `price` DOUBLE(7,2) NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `Pledge`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Pledge` ;

CREATE TABLE IF NOT EXISTS `Pledge` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `name` (`name` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `Size`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Size` ;

CREATE TABLE IF NOT EXISTS `Size` (
  `id` VARCHAR(4) NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `Inventory`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Inventory` ;

CREATE TABLE IF NOT EXISTS `Inventory` (
  `Pledge_id` INT(11) NOT NULL,
  `Size_id` VARCHAR(4) NOT NULL,
  `price` DOUBLE(7,2) NOT NULL DEFAULT 1.00,
  PRIMARY KEY (`Pledge_id`, `Size_id`),
  INDEX `fk_Pledge_has_Size_Size1_idx` (`Size_id` ASC) VISIBLE,
  INDEX `fk_Pledge_has_Size_Pledge1_idx` (`Pledge_id` ASC) VISIBLE,
  CONSTRAINT `fk_Pledge_has_Size_Pledge1`
    FOREIGN KEY (`Pledge_id`)
    REFERENCES `Pledge` (`id`)
    ON DELETE NO ACTION
    ON UPDATE CASCADE,
  CONSTRAINT `fk_Pledge_has_Size_Size1`
    FOREIGN KEY (`Size_id`)
    REFERENCES `Size` (`id`)
    ON DELETE NO ACTION
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `Bill_Detail`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Bill_Detail` ;

CREATE TABLE IF NOT EXISTS `Bill_Detail` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `unitary_price` DOUBLE(7,2) NOT NULL,
  `quantity` TINYINT(2) NOT NULL DEFAULT 1,
  `Bill_id` INT(11) NOT NULL,
  `Inventory_Pledge_id` INT(11) NOT NULL,
  `Inventory_Size_id` VARCHAR(4) NOT NULL,
  `Extra_id` INT(11) NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `Bill_id_UNIQUE` (`Bill_id` ASC) VISIBLE,
  INDEX `Inventory_Pledge_id_UNIQUE` (`Inventory_Pledge_id` ASC) VISIBLE,
  INDEX `Inventory_Size_id_UNIQUE` (`Inventory_Size_id` ASC) VISIBLE,
  INDEX `fk_Bill_has_Inventory_Inventory1_idx` (`Inventory_Pledge_id` ASC, `Inventory_Size_id` ASC) VISIBLE,
  INDEX `fk_Bill_has_Inventory_Bill1_idx` (`Bill_id` ASC) VISIBLE,
  INDEX `fk_Bill_Detail_Extra1_idx` (`Extra_id` ASC) VISIBLE,
  CONSTRAINT `fk_Bill_Detail_Extra1`
    FOREIGN KEY (`Extra_id`)
    REFERENCES `Extra` (`id`)
    ON DELETE NO ACTION
    ON UPDATE CASCADE,
  CONSTRAINT `fk_Bill_has_Inventory_Bill1`
    FOREIGN KEY (`Bill_id`)
    REFERENCES `Bill` (`id`)
    ON DELETE NO ACTION
    ON UPDATE CASCADE,
  CONSTRAINT `fk_Bill_has_Inventory_Inventory1`
    FOREIGN KEY (`Inventory_Pledge_id` , `Inventory_Size_id`)
    REFERENCES `Inventory` (`Pledge_id` , `Size_id`)
    ON DELETE NO ACTION
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `Building`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Building` ;

CREATE TABLE IF NOT EXISTS `Building` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  `direction` VARCHAR(85) NOT NULL DEFAULT 'city',
  PRIMARY KEY (`id`),
  UNIQUE INDEX `name` (`name` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `Stock`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Stock` ;

CREATE TABLE IF NOT EXISTS `Stock` (
  `Building_id` INT(11) NOT NULL,
  `Inventory_Pledge_id` INT(11) NOT NULL,
  `Inventory_Size_id` VARCHAR(4) NOT NULL,
  `stock` INT(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`Building_id`, `Inventory_Pledge_id`, `Inventory_Size_id`),
  INDEX `fk_Building_has_Inventory_Inventory1_idx` (`Inventory_Pledge_id` ASC, `Inventory_Size_id` ASC) VISIBLE,
  INDEX `fk_Building_has_Inventory_Building1_idx` (`Building_id` ASC) VISIBLE,
  CONSTRAINT `fk_Building_has_Inventory_Building1`
    FOREIGN KEY (`Building_id`)
    REFERENCES `Building` (`id`)
    ON DELETE NO ACTION
    ON UPDATE CASCADE,
  CONSTRAINT `fk_Building_has_Inventory_Inventory1`
    FOREIGN KEY (`Inventory_Pledge_id` , `Inventory_Size_id`)
    REFERENCES `Inventory` (`Pledge_id` , `Size_id`)
    ON DELETE NO ACTION
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `Log`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Log` ;

CREATE TABLE IF NOT EXISTS `Log` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `Worker_id` VARCHAR(10) NOT NULL,
  `Stock_Building_id` INT(11) NOT NULL,
  `Stock_Inventory_Pledge_id` INT(11) NOT NULL,
  `Stock_Inventory_Size_id` VARCHAR(4) NOT NULL,
  `description` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_Worker_has_Stock_Stock1_idx` (`Stock_Building_id` ASC, `Stock_Inventory_Pledge_id` ASC, `Stock_Inventory_Size_id` ASC) VISIBLE,
  INDEX `fk_Worker_has_Stock_Worker1_idx` (`Worker_id` ASC) VISIBLE,
  CONSTRAINT `fk_Worker_has_Stock_Stock1`
    FOREIGN KEY (`Stock_Building_id` , `Stock_Inventory_Pledge_id` , `Stock_Inventory_Size_id`)
    REFERENCES `Stock` (`Building_id` , `Inventory_Pledge_id` , `Inventory_Size_id`)
    ON DELETE NO ACTION
    ON UPDATE CASCADE,
  CONSTRAINT `fk_Worker_has_Stock_Worker1`
    FOREIGN KEY (`Worker_id`)
    REFERENCES `Worker` (`id`)
    ON DELETE NO ACTION
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `Order_Detail`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Order_Detail` ;

CREATE TABLE IF NOT EXISTS `Order_Detail` (
  `Order_id` INT(11) NOT NULL,
  `Inventory_Pledge_id` INT(11) NOT NULL,
  `Inventory_Size_id` VARCHAR(4) NOT NULL,
  `quantity` TINYINT(4) NOT NULL DEFAULT 1,
  `anotation` VARCHAR(100) NULL DEFAULT NULL,
  `Order_Status_id` VARCHAR(20) NOT NULL,
  PRIMARY KEY (`Order_id`, `Inventory_Pledge_id`, `Inventory_Size_id`),
  INDEX `fk_Order_has_Inventory_Inventory1_idx` (`Inventory_Pledge_id` ASC, `Inventory_Size_id` ASC) VISIBLE,
  INDEX `fk_Order_has_Inventory_Order1_idx` (`Order_id` ASC) VISIBLE,
  INDEX `fk_Order_Detail_Order_Status1_idx` (`Order_Status_id` ASC) VISIBLE,
  CONSTRAINT `fk_Order_Detail_Order_Status1`
    FOREIGN KEY (`Order_Status_id`)
    REFERENCES `Order_Status` (`id`)
    ON DELETE NO ACTION
    ON UPDATE CASCADE,
  CONSTRAINT `fk_Order_has_Inventory_Inventory1`
    FOREIGN KEY (`Inventory_Pledge_id` , `Inventory_Size_id`)
    REFERENCES `Inventory` (`Pledge_id` , `Size_id`)
    ON DELETE NO ACTION
    ON UPDATE CASCADE,
  CONSTRAINT `fk_Order_has_Inventory_Order1`
    FOREIGN KEY (`Order_id`)
    REFERENCES `Order` (`id`)
    ON DELETE NO ACTION
    ON UPDATE CASCADE)
ENGINE = InnoDB;


DROP TRIGGER IF EXISTS `Expense_Type_BEFORE_INSERT`;

DELIMITER $$

CREATE DEFINER = CURRENT_USER TRIGGER `Expense_Type_BEFORE_INSERT` BEFORE INSERT ON `Expense_Type` FOR EACH ROW
BEGIN
	SET NEW.name = UPPER(NEW.name);
END$$
DELIMITER ;


-- -----------------------------------------------------
-- procedure insertWorkerAndGetId
-- -----------------------------------------------------

DROP procedure IF EXISTS `insertWorkerAndGetId`;

DELIMITER $$

CREATE DEFINER = CURRENT_USER PROCEDURE `insertWorkerAndGetId`(IN p_password VARCHAR(45),IN p_name VARCHAR(45),IN p_Worker_Area_id VARCHAR(15), IN p_Worker_allowed INT,OUT p_generated_id VARCHAR(10))
BEGIN
    DECLARE prefix VARCHAR(5);
    
    -- Determine the prefix based on Worker_Area_id
    IF p_Worker_Area_id = 'ADMIN' THEN
        SET prefix = 'ADM';
    ELSEIF p_Worker_Area_id = 'PRODUCTION' THEN
        SET prefix = 'PRD';
    ELSEIF p_Worker_Area_id = 'SELLS' THEN
        SET prefix = 'SLLS';
    ELSE
        -- Set a default prefix if necessary
        SET prefix = 'UNKNOWN';
    END IF;

    -- Generate the new ID
    SET p_generated_id = (SELECT CONCAT(prefix, COALESCE(MAX(CAST(SUBSTRING(id, LENGTH(prefix) + 1) AS SIGNED)), 0) + 1)
                         FROM Worker
                         WHERE Worker_Area_id = p_Worker_Area_id);
    -- Perform the INSERT operation
    INSERT INTO Worker (password, name, Worker_Area_id, id, allowed) VALUES (p_password, p_name, p_Worker_Area_id, p_generated_id, p_Worker_allowed);
END$$

DELIMITER ;

DROP procedure IF EXISTS `filter_expenses_dynamically`;

DELIMITER $$

CREATE DEFINER = CURRENT_USER PROCEDURE `filter_expenses_dynamically` (IN start_date DATE, IN finish_date DATE)
BEGIN
    IF (start_date IS NULL AND finish_date IS NULL) THEN
        SELECT e.id, e.ammount, e.date, et.id AS `expense_type_id`, et.name AS `expense_type_name`, w.id AS `worker_id`, w.name AS `worker_name`
			FROM Expense AS e INNER JOIN Expense_Type AS et	ON e.Expense_Type_id = et.id
			INNER JOIN Worker AS w ON e.Worker_id = w.id
				ORDER BY e.`date` ASC;
    ELSEIF (start_date IS NOT NULL AND finish_date IS NULL) THEN
       SELECT e.id, e.ammount, e.date, et.id AS `expense_type_id`, et.name AS `expense_type_name`, w.id AS `worker_id`, w.name AS `worker_name`
			FROM Expense AS e INNER JOIN Expense_Type AS et	ON e.Expense_Type_id = et.id
			INNER JOIN Worker AS w ON e.Worker_id = w.id
				WHERE `date` >= start_date ORDER BY `date` ASC;
    ELSEIF (start_date IS NULL AND finish_date IS NOT NULL) THEN
        SELECT e.id, e.ammount, e.date, et.id AS `expense_type_id`, et.name AS `expense_type_name`, w.id AS `worker_id`, w.name AS `worker_name`
			FROM Expense AS e INNER JOIN Expense_Type AS et	ON e.Expense_Type_id = et.id
			INNER JOIN Worker AS w ON e.Worker_id = w.id
				WHERE `date` <= finish_date ORDER BY `date` ASC;
    ELSE
        SELECT e.id, e.ammount, e.date, et.id AS `expense_type_id`, et.name AS `expense_type_name`, w.id AS `worker_id`, w.name AS `worker_name`
			FROM Expense AS e INNER JOIN Expense_Type AS et	ON e.Expense_Type_id = et.id
			INNER JOIN Worker AS w ON e.Worker_id = w.id
				WHERE `date` BETWEEN start_date AND finish_date ORDER BY `date` ASC;
    END IF;
END$$

DELIMITER ;

DROP procedure IF EXISTS `generate_sample_bills`;

DELIMITER //

/*
	TODO: delete this procedure, is used just to fill the DB with testing values
*/
CREATE DEFINER = CURRENT_USER PROCEDURE generate_sample_bills()
BEGIN
  DECLARE num INT DEFAULT 0; -- no. of bills inserted
  DECLARE random_date DATE; -- variable to store random date
  DECLARE num_products, product_count, random_pledge_id, bill_id, tmp_product_count INT;
  DECLARE random_size_id VARCHAR(4);
  DECLARE random_price DECIMAL(10,2);  -- price variable
  DECLARE total DECIMAL(10,2) DEFAULT 0;  -- initialize total to 0

  WHILE num < 100 DO
    SET random_date = CURRENT_DATE - INTERVAL FLOOR(RAND() * (4*365)) DAY; 
    INSERT INTO `Bill` (`total`, `date`, `Worker_id`) VALUES (total, random_date, 'SLLS1');
    SET bill_id = LAST_INSERT_ID();
    SET num = num + 1;

    SET num_products = FLOOR(RAND() * 4) + 1;

    SET product_count = 1;
    WHILE product_count <= num_products DO
      SET random_pledge_id = (SELECT id FROM Pledge ORDER BY RAND() LIMIT 1);
      SET random_size_id = (SELECT id FROM Size ORDER BY RAND() LIMIT 1);
      SET random_price = (SELECT price FROM Inventory WHERE Pledge_id = random_pledge_id AND Size_id = random_size_id);
      SET tmp_product_count = FLOOR(RAND() * 3) + 1;

      INSERT INTO `Bill_Detail` (`unitary_price`, `quantity`, `Bill_id`, `Inventory_Pledge_id`, `Inventory_Size_id`) 
      VALUES (random_price, tmp_product_count, bill_id, random_pledge_id, random_size_id);

      SET total = total + (random_price * tmp_product_count);
      SET product_count = product_count + 1;
    END WHILE;
	UPDATE `Bill` SET `total` = total WHERE (`id` = bill_id);
    SET total = 0;
  END WHILE;
END //

DELIMITER ;

DROP USER IF EXISTS 'novedades-client'@'%';
CREATE USER 'novedades-client'@'%' IDENTIFIED BY 'GehYwLt7Yvn99I4';
GRANT ALL PRIVILEGES ON `novedades`.* TO 'novedades-client'@'%';
FLUSH PRIVILEGES;