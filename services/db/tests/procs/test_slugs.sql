-- tests/procedures/test_slugs.sql
DELIMITER $$
-- 1) CREATE + GET newly created slug
DROP PROCEDURE IF EXISTS test_sp_create_and_get_slug$$
CREATE PROCEDURE test_sp_create_and_get_slug()
BEGIN
  DECLARE v_created TIMESTAMP;
  DECLARE v_long    VARCHAR(2048);
  DECLARE v_exp     TIMESTAMP;
  DECLARE v_owner   INT;

  CALL sp_create_slug('newslug',1,1,NULL,v_created);
  CALL sp_get_slug   ('newslug',v_long,v_exp,@ucreated,v_owner);

  IF v_long <> 'https://example.com/hello' OR v_owner <> 1 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='test_sp_create_and_get_slug FAILED';
  END IF;
END$$

-- 2) GET existing edge slugs
DROP PROCEDURE IF EXISTS test_sp_get_slug_edges$$
CREATE PROCEDURE test_sp_get_slug_edges()
BEGIN
  DECLARE v_long  VARCHAR(2048);
  DECLARE v_exp   TIMESTAMP;
  DECLARE v_owner INT;

  -- expired
  CALL sp_get_slug('expired',v_long,v_exp,@c,v_owner);
  IF v_exp <> '2020-01-01 00:00:00' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='expired get failed';
  END IF;

  -- future
  CALL sp_get_slug('future',v_long,v_exp,@c,v_owner);
  IF v_exp <> '2030-01-01 00:00:00' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='future get failed';
  END IF;

  -- ownerless
  CALL sp_get_slug('noslug',v_long,v_exp,@c,v_owner);
  IF v_owner IS NOT NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='ownerless get failed';
  END IF;

  -- unicode code
  CALL sp_get_slug('unicode✓',v_long,v_exp,@c,v_owner);
  IF v_long <> 'https://example.com/こんにちは' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='unicode✓ get failed';
  END IF;
END$$

-- 3) DELETE slug
DROP PROCEDURE IF EXISTS test_sp_delete_slug$$
CREATE PROCEDURE test_sp_delete_slug()
BEGIN
  CALL sp_delete_slug('expired');
  IF (SELECT COUNT(*) FROM slugs WHERE code='expired') <> 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='test_sp_delete_slug FAILED';
  END IF;
END$$

-- 4) Successful resolves + hit‐count bump
DROP PROCEDURE IF EXISTS test_sp_resolve_slug_success$$
CREATE PROCEDURE test_sp_resolve_slug_success()
BEGIN
  DECLARE before_cnt BIGINT;
  DECLARE after_cnt  BIGINT;
  DECLARE url        VARCHAR(2048);
  DECLARE exp        TIMESTAMP;
  DECLARE owner      INT;

  CALL sp_count_hits('abc123', before_cnt);
  CALL sp_resolve_slug('abc123',NULL,NULL,NULL,url,exp,owner);
  IF url <> 'https://example.com/hello' OR owner <> 1 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='resolve success failed';
  END IF;
  CALL sp_count_hits('abc123', after_cnt);
  IF after_cnt <> before_cnt+1 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='resolve hit log failed';
  END IF;

  -- future‐dated slug still works
  CALL sp_resolve_slug('future',NULL,NULL,NULL,url,exp,owner);
  IF exp <> '2030-01-01 00:00:00' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='future resolve failed';
  END IF;

  -- ownerless slug
  CALL sp_resolve_slug('noslug',NULL,NULL,NULL,url,exp,owner);
  IF owner IS NOT NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='ownerless resolve failed';
  END IF;

  -- unicode code
  CALL sp_resolve_slug('unicode✓',NULL,NULL,NULL,url,exp,owner);
  IF url <> 'https://example.com/こんにちは' OR owner <> 3 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='unicode✓ resolve failed';
  END IF;
END$$

-- 5) Expired slug should error
DROP PROCEDURE IF EXISTS test_sp_resolve_slug_expired$$
CREATE PROCEDURE test_sp_resolve_slug_expired()
BEGIN
  DECLARE v_err INT DEFAULT 0;
  DECLARE CONTINUE HANDLER FOR SQLSTATE '45000' SET v_err = 1;

  CALL sp_resolve_slug('expired',NULL,NULL,NULL,@u,@e,@o);
  IF v_err = 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='expired slug did NOT error';
  END IF;
END$$

-- runner
DROP PROCEDURE IF EXISTS run_slug_tests$$
CREATE PROCEDURE run_slug_tests() BEGIN
  CALL test_sp_create_and_get_slug();
  CALL test_sp_get_slug_edges();
  CALL test_sp_delete_slug();
  CALL test_sp_resolve_slug_success();
  CALL test_sp_resolve_slug_expired();
END$$
DELIMITER ;
CALL run_slug_tests();
