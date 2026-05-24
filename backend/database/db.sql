CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    dob DATE,
    city VARCHAR(50),
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'technician', 'admin', 'store_owner') DEFAULT 'user',
    is_verified TINYINT(1) DEFAULT 1,
    verification_token VARCHAR(255),
    reset_token VARCHAR(255),
    reset_token_expiry DATETIME,
    profile_image LONGTEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    image_url VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS technicians (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    service VARCHAR(50),
    experience INT,
    price_per_hour DECIMAL(10,2) DEFAULT 0.00,
    service_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS technician_availability (
    id INT AUTO_INCREMENT PRIMARY KEY,
    technician_id INT,
    available_date DATE,
    start_time TIME,
    end_time TIME,
    is_booked TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS technician_regular_availability (
    id INT AUTO_INCREMENT PRIMARY KEY,
    technician_id INT NOT NULL,
    month_start DATE NOT NULL,
    month_end DATE NOT NULL,
    day_of_week VARCHAR(20) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    slot_minutes INT NOT NULL DEFAULT 60,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS maintenance_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    technician_id INT,
    description TEXT,
    city VARCHAR(50),
    service VARCHAR(50),
    scheduled_date DATE,
    scheduled_time TIME,
    location_note TEXT,
    status ENUM(
        'pending',
        'accepted',
        'confirmed',
        'on_the_way',
        'in_progress',
        'completed',
        'rejected',
        'cancelled'
    ) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    hours_requested INT DEFAULT 1,
    price_per_hour DECIMAL(10,2) DEFAULT 0.00,
    total_price DECIMAL(10,2) DEFAULT 0.00,
    payment_method ENUM('cash','online') DEFAULT 'cash',
    payment_status ENUM('unpaid','paid','failed') DEFAULT 'unpaid',
    payment_transaction_id VARCHAR(255),
    estimated_hours INT DEFAULT 1,
    location VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS stores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    store_name VARCHAR(100),
    category VARCHAR(50),
    city VARCHAR(50),
    address TEXT,
    owner_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT,
    receiver_id INT,
    message LONGTEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    type VARCHAR(20) NOT NULL DEFAULT 'text'
);

CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255),
    user_id INT,
    message TEXT,
    is_read TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ratings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    technician_id INT,
    request_id INT,
    rating INT NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS technician_work_posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    technician_id INT NOT NULL,
    description TEXT NOT NULL,
    images LONGTEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    location_note VARCHAR(255)
);

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

CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    request_id INT NOT NULL,
    user_id INT NOT NULL,
    technician_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    transaction_id VARCHAR(100),
    status ENUM('paid','refunded') DEFAULT 'paid',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT IGNORE INTO services (name, image_url) VALUES
('Plumbing', '/images/services/plumbing.png'),
('Electrical', '/images/services/Electrical.png'),
('Painting', '/images/services/Painting.png'),
('Decoration', '/images/services/Decoration.png');