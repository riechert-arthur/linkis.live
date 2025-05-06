-- tests/procedures/test_previews.sql
DELIMITER $$
-- 1) UPDATE existing + INSERT new, then GET
DROP PROCEDURE IF EXISTS test_sp_upsert_and_get_preview$$
CREATE PROCEDURE test_sp_upsert_and_get_preview()
BEGIN
  DECLARE t VARCHAR(256);
  DECLARE d TEXT;
  DECLARE i VARCHAR(2048);

  -- update the og preview on url 1
  CALL sp_upsert_preview(1,'og','X','Y','Z','C','D');
  CALL sp_get_preview(1,'og',t,d,i,@tc,@td,@c,@u);
  IF t <> 'X' OR d <> 'Y' OR i <> 'Z' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='upsert/update failed';
  END IF;

  -- insert new og preview on url 2
  CALL sp_upsert_preview(2,'og','T2','D2','I2','C2','DM2');
  CALL sp_get_preview(2,'og',t,d,i,@tc,@td,@c,@u);
  IF t <> 'T2' OR d <> 'D2' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='upsert/insert failed';
  END IF;

  -- existing twitter preview on url 2 was all NULL
  CALL sp_get_preview(2,'twitter',t,d,i,@tc,@td,@c,@u);
  IF t IS NOT NULL OR d IS NOT NULL OR i IS NOT NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='get-null-preview failed';
  END IF;
END$$

-- runner
DROP PROCEDURE IF EXISTS run_preview_tests$$
CREATE PROCEDURE run_preview_tests() BEGIN
  CALL test_sp_upsert_and_get_preview();
END$$
DELIMITER ;
CALL run_preview_tests();
