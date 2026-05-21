ALTER TABLE maintenance_requests
ADD UNIQUE KEY unique_booking_slot (technician_id, scheduled_date, scheduled_time);