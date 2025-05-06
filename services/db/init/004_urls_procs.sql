DELIMITER $$

CREATE PROCEDURE sp_get_or_create_url(
  IN  p_user_id   INT,
  IN  p_long_url  VARCHAR(2048),
  OUT p_url_id    INT
)
BEGIN
  DECLARE v_hash CHAR(64)   DEFAULT SHA2(p_long_url,256);
  INSERT IGNORE INTO urls (user_id, long_url)
    VALUES (p_user_id, p_long_url);
  SELECT id INTO p_url_id
    FROM urls
   WHERE url_hash = v_hash;
END $$

CREATE PROCEDURE sp_get_url_by_id(
  IN  p_url_id     INT,
  OUT p_user_id    INT,
  OUT p_long_url   VARCHAR(2048),
  OUT p_created_at TIMESTAMP,
  OUT p_updated_at TIMESTAMP
)
BEGIN
  SELECT user_id, long_url, created_at, updated_at
    INTO p_user_id, p_long_url, p_created_at, p_updated_at
    FROM urls
   WHERE id = p_url_id;
END $$

CREATE PROCEDURE sp_delete_url(
  IN p_url_id INT
)
BEGIN
  DELETE FROM urls WHERE id = p_url_id;
END $$

DELIMITER ;
