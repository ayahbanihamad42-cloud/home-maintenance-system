INSERT INTO users (name, email, phone, dob, city, password, role, is_verified)
VALUES
  ('Ahmad Saleh', 'ahmad@example.com', '0501111111', '1992-04-12', 'Riyadh', '$2b$10$RKSvUdDzEbTp6LF9Uvi9TuAp7DUh0V1gQhNGfVnLhePTJpkFPXV3u', 'user', TRUE),
  ('Laila Hassan', 'laila@example.com', '0502222222', '1995-08-25', 'Jeddah', '$2b$10$RKSvUdDzEbTp6LF9Uvi9TuAp7DUh0V1gQhNGfVnLhePTJpkFPXV3u', 'user', TRUE),
  ('Omar Technician', 'omar.tech@example.com', '0503333333', '1988-01-10', 'Riyadh', '$2b$10$RKSvUdDzEbTp6LF9Uvi9TuAp7DUh0V1gQhNGfVnLhePTJpkFPXV3u', 'technician', TRUE),
  ('Sara Admin', 'admin@example.com', '0504444444', '1985-06-20', 'Dammam', '$2b$10$RKSvUdDzEbTp6LF9Uvi9TuAp7DUh0V1gQhNGfVnLhePTJpkFPXV3u', 'admin', TRUE);

INSERT INTO technicians (user_id, service, experience)
VALUES
  (3, 'Electrical', 7);

INSERT INTO technician_availability (technician_id, available_date, start_time, end_time, is_booked)
VALUES
  (1, '2024-06-20', '09:00:00', '11:00:00', FALSE),
  (1, '2024-06-20', '13:00:00', '15:00:00', FALSE);

INSERT INTO maintenance_requests (user_id, technician_id, description, city, service, scheduled_date, scheduled_time, status)
VALUES
  (1, 1, 'Fix kitchen lights', 'Riyadh', 'Electrical', '2024-06-20', '09:00:00', 'pending');

INSERT INTO stores (store_name, category, city, address)
VALUES
  ('Al Noor Supplies', 'Electrical', 'Riyadh', 'King Fahd Road'),
  ('Home Decor Hub', 'Decoration', 'Jeddah', 'Corniche Street');

INSERT INTO ratings (user_id, technician_id, rating, comment)
VALUES
  (1, 1, 5, 'Very professional and fast.'),
  (2, 1, 4, 'Good work but arrived late.');

INSERT INTO messages (sender_id, receiver_id, message)
VALUES
  (1, 3, 'Hello, can you come earlier?'),
  (3, 1, 'Sure, I can arrive 30 minutes earlier.');

INSERT INTO notifications (user_id, message, is_read)
VALUES
  (1, 'Your request has been received.', FALSE),
  (1, 'Technician assigned: Omar Technician.', FALSE);