DELIMITER $$

CREATE PROCEDURE sp_create_slug(
  IN  p_code       VARCHAR(64),
  IN  p_url_id     INT,
  IN  p_user_id    INT,
  IN  p_expires_at TIMESTAMP,
  OUT p_created_at TIMESTAMP
)
BEGIN
  INSERT INTO slugs (code, url_id, user_id, expires_at)
    VALUES (p_code, p_url_id, p_user_id, p_expires_at);
  SELECT created_at INTO p_created_at
    FROM slugs
   WHERE code = p_code;
END $$

CREATE PROCEDURE sp_get_slug(
  IN  p_code         VARCHAR(64),
  OUT p_long_url     VARCHAR(2048),
  OUT p_expires_at   TIMESTAMP,
  OUT p_url_created  TIMESTAMP,
  OUT p_owner_user   INT
)
BEGIN
  SELECT u.long_url,
         s.expires_at,
         u.created_at,
         s.user_id
    INTO p_long_url, p_expires_at, p_url_created, p_owner_user
    FROM slugs s
    JOIN urls  u ON u.id = s.url_id
   WHERE s.code = p_code;
END $$

CREATE PROCEDURE sp_delete_slug(
  IN p_code VARCHAR(64)
)
BEGIN
  DELETE FROM slugs WHERE code = p_code;
END $$

CREATE PROCEDURE sp_resolve_slug(
  IN  p_code        VARCHAR(64),
  IN  p_referrer    VARCHAR(2048),
  IN  p_ip_address  VARBINARY(16),
  IN  p_user_agent  TEXT,
  OUT p_long_url    VARCHAR(2048),
  OUT p_expires_at  TIMESTAMP,
  OUT p_owner_user  INT
)
BEGIN
  DECLARE v_url_id INT;
  DECLARE v_now    TIMESTAMP DEFAULT UTC_TIMESTAMP();

  IF NOT EXISTS (SELECT 1 FROM slugs WHERE code = p_code) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'slug does not exist';
  END IF;

  SELECT url_id, expires_at, user_id
    INTO v_url_id, p_expires_at, p_owner_user
    FROM slugs
   WHERE code = p_code;

  IF p_expires_at IS NOT NULL AND p_expires_at < v_now THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Slug has expired';
  END IF;

  INSERT INTO hits 
    (slug_code, referrer, ip_address, user_agent)
  VALUES 
    (p_code, p_referrer, p_ip_address, p_user_agent);

  SELECT long_url
    INTO p_long_url
    FROM urls
   WHERE id = v_url_id;
END $$
 
DELIMITER ;
