-- shoes table
CREATE TABLE IF NOT EXISTS shoes (
  id CHAR(36) NOT NULL,
  name VARCHAR(191) NOT NULL,
  brand VARCHAR(191) NOT NULL,
  size DOUBLE NOT NULL,
  color VARCHAR(191) NULL,
  price DECIMAL(10,2) NOT NULL,
  stock INT NOT NULL,
  description TEXT NULL,
  category VARCHAR(191) NULL,
  sku VARCHAR(191) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY unique_sku (sku),
  KEY idx_brand (brand),
  KEY idx_category (category),
  KEY idx_price (price)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- shoe images
CREATE TABLE IF NOT EXISTS shoe_images (
  id CHAR(36) NOT NULL,
  shoe_id CHAR(36) NOT NULL,
  url VARCHAR(191) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_shoe_id (shoe_id),
  CONSTRAINT fk_shoe_image_shoe FOREIGN KEY (shoe_id) REFERENCES shoes(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;