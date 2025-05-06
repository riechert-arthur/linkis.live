DELIMITER $$

CREATE PROCEDURE sp_record_hit(
  IN p_slug_code  VARCHAR(64),
  IN p_referrer   VARCHAR(2048),
  IN p_ip_address VARBINARY(16),
  IN p_user_agent TEXT
)
BEGIN
  INSERT INTO hits (slug_code, referrer, ip_address, user_agent)
    VALUES (p_slug_code, p_referrer, p_ip_address, p_user_agent);
END $$

CREATE PROCEDURE sp_count_hits(
  IN  p_slug_code VARCHAR(64),
  OUT p_hit_count BIGINT
)
BEGIN
  SELECT COUNT(*) INTO p_hit_count
    FROM hits
   WHERE slug_code = p_slug_code;
END $$

DELIMITER ;
