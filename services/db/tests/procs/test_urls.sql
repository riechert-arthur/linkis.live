-- tests/procedures/test_urls.sql
DELIMITER $$
-- 1) GET_OR_CREATE_URL (existing, new, idempotent)
DROP PROCEDURE IF EXISTS test_sp_get_or_create_url$$
CREATE PROCEDURE test_sp_get_or_create_url()
BEGIN
  DECLARE v1   INT;
  DECLARE v2   INT;
  DECLARE vnew INT;
  DECLARE vurl VARCHAR(2048);

  -- existing seeded URL #1
  CALL sp_get_or_create_url(1,'https://example.com/hello',v1);
  IF v1 <> 1 THEN SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT='test_sp_get_or_create_url(existing) FAILED'; END IF;

  -- create a brand-new URL
  CALL sp_get_or_create_url(NULL,'https://new.url/path',vnew);
  SELECT long_url INTO vurl FROM urls WHERE id = vnew;
  IF vurl <> 'https://new.url/path' THEN SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT='test_sp_get_or_create_url(new) FAILED'; END IF;

  -- idempotency
  CALL sp_get_or_create_url(NULL,'https://new.url/path',v2);
  IF v2 <> vnew THEN SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT='test_sp_get_or_create_url(idemp) FAILED'; END IF;
END$$

-- 2) GET_URL_BY_ID (unicode path)
DROP PROCEDURE IF EXISTS test_sp_get_url_by_id$$
CREATE PROCEDURE test_sp_get_url_by_id()
BEGIN
  DECLARE v_uid    INT;
  DECLARE v_long   VARCHAR(2048);
  DECLARE v_created TIMESTAMP;
  DECLARE v_updated TIMESTAMP;

  CALL sp_get_url_by_id(5, v_uid, v_long, v_created, v_updated);
  IF v_uid <> 3 OR v_long <> 'https://example.com/こんにちは' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='test_sp_get_url_by_id FAILED';
  END IF;
END$$

-- 3) DELETE_URL (cascades to slugs, previews, hits)
DROP PROCEDURE IF EXISTS test_sp_delete_url$$
CREATE PROCEDURE test_sp_delete_url()
BEGIN
  DECLARE c_urls    INT;
  DECLARE c_slugs   INT;
  DECLARE c_prevs   INT;
  DECLARE c_hits    INT;

  -- url #3 had: dash_slug-1, a preview, and hits
  CALL sp_delete_url(3);

  SELECT COUNT(*) INTO c_urls  FROM urls    WHERE id=3;
  SELECT COUNT(*) INTO c_slugs FROM slugs   WHERE url_id=3;
  SELECT COUNT(*) INTO c_prevs FROM previews WHERE url_id=3;
  SELECT COUNT(*) INTO c_hits  FROM hits    WHERE slug_code='dash_slug-1';

  IF c_urls <> 0 OR c_slugs <> 0 OR c_prevs <> 0 OR c_hits <> 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='test_sp_delete_url FAILED';
  END IF;
END$$

-- runner
DROP PROCEDURE IF EXISTS run_url_tests$$
CREATE PROCEDURE run_url_tests() BEGIN
  CALL test_sp_get_or_create_url();
  CALL test_sp_get_url_by_id();
  CALL test_sp_delete_url();
END$$
DELIMITER ;
CALL run_url_tests();
