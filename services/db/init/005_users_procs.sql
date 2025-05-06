DELIMITER $$

CREATE PROCEDURE sp_create_user(
  IN  p_email         VARCHAR(255),
  IN  p_name          VARCHAR(255),
  IN  p_password_hash CHAR(100),
  OUT p_user_id       INT
)
BEGIN
  INSERT INTO users (email, name, password_hash)
    VALUES (p_email, p_name, p_password_hash);
  SET p_user_id = LAST_INSERT_ID();
END $$

CREATE PROCEDURE sp_get_user_by_email(
  IN  p_email   VARCHAR(255),
  OUT p_id      INT,
  OUT p_name    VARCHAR(255),
  OUT p_created TIMESTAMP,
  OUT p_updated TIMESTAMP
)
BEGIN
  SELECT id, name, created_at, updated_at
    INTO p_id, p_name, p_created, p_updated
    FROM users
   WHERE email = p_email;
END $$

CREATE PROCEDURE sp_update_user(
  IN p_user_id       INT,
  IN p_new_name      VARCHAR(255),
  IN p_new_pw_hash   CHAR(100)
)
BEGIN
  UPDATE users
     SET name          = COALESCE(p_new_name,      name),
         password_hash = COALESCE(p_new_pw_hash,   password_hash)
   WHERE id = p_user_id;
END $$

CREATE PROCEDURE sp_delete_user(
  IN p_user_id INT
)
BEGIN
  DELETE FROM users WHERE id = p_user_id;
END $$

DELIMITER ;
