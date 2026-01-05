CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    dob DATE,
    city VARCHAR(50),
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'technician', 'admin', 'store_owner') DEFAULT 'user'
);

CREATE TABLE technicians (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    service VARCHAR(50),
    experience INT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE technician_availability (
    id INT AUTO_INCREMENT PRIMARY KEY,
    technician_id INT,
    available_date DATE,
    start_time TIME,
    end_time TIME,
    is_booked BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (technician_id) REFERENCES technicians(id)
);

CREATE TABLE maintenance_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    technician_id INT,
    description TEXT,
    city VARCHAR(50),
    scheduled_date DATE,
    scheduled_time TIME,
    status ENUM('pending', 'confirmed', 'completed') DEFAULT 'pending',
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (technician_id) REFERENCES technicians(id)
);

CREATE TABLE stores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    store_name VARCHAR(100),
    category VARCHAR(50),
    city VARCHAR(50),
    address TEXT
);
