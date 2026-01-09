INSERT INTO users (name, email, phone, dob, city, password, role)
VALUES
('Ahmad Khaled', 'ahmad@gmail.com', '0791234567', '1998-05-10', 'Amman', 'password123', 'user'),
('Lina Saleh', 'lina@gmail.com', '0789876543', '2000-03-22', 'Irbid', 'password123', 'user'),
('Omar Hassan', 'omar@gmail.com', '0775554433', '1995-11-15', 'Zarqa', 'password123', 'technician'),
('Rana Ali', 'rana@gmail.com', '0793332211', '1999-07-01', 'Salt', 'password123', 'technician'),
('Admin User', 'admin@gmail.com', '0790001111', '1990-01-01', 'Amman', 'adminpass', 'admin');

-- TECHNICIANS
INSERT INTO technicians (user_id, service, experience)
VALUES
(3, 'Electrical', 5),
(4, 'Plumbing', 3);

-- TECHNICIAN AVAILABILITY
INSERT INTO technician_availability (technician_id, available_date, start_time, end_time)
VALUES
(1, '2026-01-10', '09:00:00', '13:00:00'),
(1, '2026-01-11', '10:00:00', '15:00:00'),
(2, '2026-01-10', '08:00:00', '12:00:00');

-- MAINTENANCE REQUESTS
INSERT INTO maintenance_requests
(user_id, technician_id, description, city, service, scheduled_date, scheduled_time, status)
VALUES
(1, 1, 'Fix electrical wiring in living room', 'Amman', 'Electrical', '2026-01-10', '10:00:00', 'confirmed'),
(2, 2, 'Water leakage in kitchen sink', 'Irbid', 'Plumbing', '2026-01-10', '09:00:00', 'pending');

-- STORES
INSERT INTO stores (store_name, category, city, address)
VALUES
('Amman Tools', 'Hardware', 'Amman', 'Gardens Street'),
('Irbid Home Store', 'Plumbing Supplies', 'Irbid', 'University Street'),
('Zarqa Electric', 'Electrical Supplies', 'Zarqa', 'Main Market'),
('Aqaba Builders', 'Construction', 'Aqaba', 'Port Area');

-- MESSAGES
INSERT INTO messages (sender_id, receiver_id, message)
VALUES
(1, 3, 'Hello, are you available tomorrow?'),
(3, 1, 'Yes, I am available from 10 AM.');

-- NOTIFICATIONS
INSERT INTO notifications (user_id, message)
VALUES
(1, 'Your maintenance request has been confirmed.'),
(3, 'You have a new maintenance request.');

-- RATINGS
INSERT INTO ratings (user_id, technician_id, rating, comment)
VALUES
(1, 1, 5, 'Very professional and fast service'),
(2, 2, 4, 'Good work but arrived late');