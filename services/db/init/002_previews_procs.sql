DELIMITER $$

CREATE PROCEDURE sp_upsert_preview(
  IN p_url_id       INT,
  IN p_provider     ENUM('og','twitter'),
  IN p_title        VARCHAR(256),
  IN p_description  TEXT,
  IN p_image_url    VARCHAR(2048),
  IN p_twitter_card VARCHAR(128),
  IN p_twitter_dom  VARCHAR(256)
)
BEGIN
  INSERT INTO previews
    (url_id, provider, title, description, image_url, twitter_card, twitter_domain)
  VALUES
    (p_url_id, p_provider, p_title, p_description, p_image_url, p_twitter_card, p_twitter_dom)
  ON DUPLICATE KEY UPDATE
    title          = VALUES(title),
    description    = VALUES(description),
    image_url      = VALUES(image_url),
    twitter_card   = VALUES(twitter_card),
    twitter_domain = VALUES(twitter_domain),
    updated_at     = CURRENT_TIMESTAMP;
END $$

CREATE PROCEDURE sp_get_preview(
  IN  p_url_id     INT,
  IN  p_provider   ENUM('og','twitter'),
  OUT p_title      VARCHAR(256),
  OUT p_description TEXT,
  OUT p_image_url  VARCHAR(2048),
  OUT p_twitter_card VARCHAR(128),
  OUT p_twitter_dom VARCHAR(256),
  OUT p_created_at TIMESTAMP,
  OUT p_updated_at TIMESTAMP
)
BEGIN
  SELECT title, description, image_url,
         twitter_card, twitter_domain,
         created_at, updated_at
    INTO p_title, p_description, p_image_url,
         p_twitter_card, p_twitter_dom,
         p_created_at, p_updated_at
    FROM previews
   WHERE url_id   = p_url_id
     AND provider = p_provider;
END $$

DELIMITER ;
