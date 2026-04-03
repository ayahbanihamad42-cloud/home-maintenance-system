CREATE TABLE users (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR2(100) NOT NULL,
    email VARCHAR2(100) UNIQUE NOT NULL,
    phone VARCHAR2(20),
    dob DATE,
    city VARCHAR2(50),
    password VARCHAR2(255) NOT NULL,
    role VARCHAR2(20) DEFAULT 'user',
    is_verified NUMBER(1) DEFAULT 1,
    verification_token VARCHAR2(255),
    reset_token VARCHAR2(255)
);
CREATE TABLE technicians (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id NUMBER,
    service VARCHAR2(50),
    experience NUMBER,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE TABLE technician_availability (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    technician_id NUMBER,
    available_date DATE,
    start_time VARCHAR2(10),
    end_time VARCHAR2(10),
    is_booked NUMBER(1) DEFAULT 0,
    FOREIGN KEY (technician_id) REFERENCES technicians(id)
);
CREATE TABLE maintenance_requests (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id NUMBER,
    technician_id NUMBER,
    description CLOB,
    city VARCHAR2(50),
    service VARCHAR2(50),
    scheduled_date DATE,
    scheduled_time VARCHAR2(10),
    status VARCHAR2(20) DEFAULT 'pending',
    created_at DATE DEFAULT SYSDATE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (technician_id) REFERENCES technicians(id)
);
CREATE TABLE stores (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    store_name VARCHAR2(100),
    category VARCHAR2(50),
    city VARCHAR2(50),
    address CLOB
);
CREATE TABLE messages (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    sender_id NUMBER,
    receiver_id NUMBER,
    message CLOB,
    created_at DATE DEFAULT SYSDATE,
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (receiver_id) REFERENCES users(id)
);
CREATE TABLE notifications (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id NUMBER,
    message CLOB,
    is_read NUMBER(1) DEFAULT 0,
    created_at DATE DEFAULT SYSDATE,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE TABLE ratings (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id NUMBER,
    technician_id NUMBER,
    rating NUMBER NOT NULL,
    review_comment CLOB,
    created_at DATE DEFAULT SYSDATE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (technician_id) REFERENCES technicians(id)
);