-- tests/procedures/test_users.sql
DELIMITER $$
-- 1) CREATE USER
DROP PROCEDURE IF EXISTS test_sp_create_user$$
CREATE PROCEDURE test_sp_create_user()
BEGIN
  DECLARE v_id   INT;
  DECLARE v_email VARCHAR(255);
  DECLARE v_name  VARCHAR(255);

  -- existing seed has ids 1–4; create a new one
  CALL sp_create_user('new@test.com','NewUser',SHA2('pw',256),v_id);
  SELECT email,name INTO v_email,v_name FROM users WHERE id = v_id;

  IF v_email <> 'new@test.com' OR v_name <> 'NewUser' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='test_sp_create_user FAILED';
  END IF;
END$$

-- 2) GET USER BY EMAIL (normal + blank name)
DROP PROCEDURE IF EXISTS test_sp_get_user_by_email$$
CREATE PROCEDURE test_sp_get_user_by_email()
BEGIN
  DECLARE v_id       INT;
  DECLARE v_name     VARCHAR(255);
  DECLARE v_created  TIMESTAMP;
  DECLARE v_updated  TIMESTAMP;

  -- normal
  CALL sp_get_user_by_email('alice@example.com', v_id, v_name, v_created, v_updated);
  IF v_id <> 1 OR v_name <> 'Alice' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='test_sp_get_user_by_email(normal) FAILED';
  END IF;

  -- blank name
  CALL sp_get_user_by_email('dan@example.com', v_id, v_name, v_created, v_updated);
  IF v_id <> 4 OR v_name <> '' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='test_sp_get_user_by_email(blank) FAILED';
  END IF;
END$$

-- 3) UPDATE USER (set & no-op)
DROP PROCEDURE IF EXISTS test_sp_update_user$$
CREATE PROCEDURE test_sp_update_user()
BEGIN
  DECLARE v_name_after VARCHAR(255);
  DECLARE v_hash_after CHAR(100);

  -- change both fields on user 3
  CALL sp_update_user(3,'Charlie X',SHA2('newpw',256));
  SELECT name,password_hash INTO v_name_after,v_hash_after FROM users WHERE id=3;
  IF v_name_after <> 'Charlie X' OR v_hash_after <> SHA2('newpw',256) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='test_sp_update_user(set) FAILED';
  END IF;

  -- no-op on user 2
  CALL sp_update_user(2,NULL,NULL);
  SELECT name,password_hash INTO v_name_after,v_hash_after FROM users WHERE id=2;
  IF v_name_after <> 'Bob' OR v_hash_after <> SHA2('password2',256) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='test_sp_update_user(no-op) FAILED';
  END IF;
END$$

-- 4) DELETE USER (and NULL-FKs)
DROP PROCEDURE IF EXISTS test_sp_delete_user$$
CREATE PROCEDURE test_sp_delete_user()
BEGIN
  DECLARE v_cnt_users INT;
  DECLARE v_uid_url    INT;
  DECLARE v_uid_slug   INT;

  CALL sp_delete_user(2);
  SELECT COUNT(*)       INTO v_cnt_users FROM users WHERE id=2;
  SELECT user_id        INTO v_uid_url    FROM urls  WHERE id=2;
  SELECT user_id        INTO v_uid_slug   FROM slugs WHERE code='def456';

  IF v_cnt_users <> 0
     OR v_uid_url    IS NOT NULL
     OR v_uid_slug   IS NOT NULL
  THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='test_sp_delete_user FAILED';
  END IF;
END$$

-- runner
DROP PROCEDURE IF EXISTS run_user_tests$$
CREATE PROCEDURE run_user_tests() BEGIN
  CALL test_sp_create_user();
  CALL test_sp_get_user_by_email();
  CALL test_sp_update_user();
  CALL test_sp_delete_user();
END$$
DELIMITER ;
CALL run_user_tests();
