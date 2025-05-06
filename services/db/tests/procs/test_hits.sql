-- tests/procedures/test_hits.sql
DELIMITER $$
DROP PROCEDURE IF EXISTS test_sp_record_and_count_hits$$
CREATE PROCEDURE test_sp_record_and_count_hits()
BEGIN
  DECLARE cnt_before  BIGINT;
  DECLARE cnt_after   BIGINT;

  CALL sp_count_hits('abc123',cnt_before);
  IF cnt_before <> 3 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='initial count failed';
  END IF;

  CALL sp_record_hit('abc123','https://x',INET6_ATON('8.8.8.8'),'UA');
  CALL sp_count_hits('abc123',cnt_after);
  IF cnt_after <> cnt_before+1 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='record/count failed';
  END IF;

  CALL sp_count_hits('nope',cnt_after);
  IF cnt_after <> 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='count on non-existent failed';
  END IF;
END$$

DROP PROCEDURE IF EXISTS run_hit_tests$$
CREATE PROCEDURE run_hit_tests() BEGIN
  CALL test_sp_record_and_count_hits();
END$$
DELIMITER ;
CALL run_hit_tests();
