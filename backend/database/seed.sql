ALTER TABLE ratings
ADD COLUMN request_id INT,
ADD CONSTRAINT fk_ratings_request
FOREIGN KEY (request_id) REFERENCES maintenance_requests(id);
