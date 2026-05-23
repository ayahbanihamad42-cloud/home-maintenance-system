CREATE TABLE IF NOT EXISTS technician_payment_info (
  id INT AUTO_INCREMENT PRIMARY KEY,
  technician_id INT NOT NULL,
  account_holder VARCHAR(100),
  wallet_name VARCHAR(100),
  wallet_number VARCHAR(50),
  mock_account_number VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);