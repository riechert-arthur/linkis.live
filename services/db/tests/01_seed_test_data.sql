SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE hits;
TRUNCATE TABLE previews;
TRUNCATE TABLE slugs;
TRUNCATE TABLE urls;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO users (
  id, email,             name,                     password_hash,        created_at,        updated_at
) VALUES
  (1, 'alice@example.com','Alice',                  SHA2('password1',256), UTC_TIMESTAMP(), UTC_TIMESTAMP()),
  (2, 'bob@example.com',  'Bob',                    SHA2('password2',256), UTC_TIMESTAMP(), UTC_TIMESTAMP()),
  (3, 'charlie@example.com','Charlie O’Connor',     SHA2('p@$$w0rd',256),  UTC_TIMESTAMP(), UTC_TIMESTAMP()),  -- unicode apostrophe
  (4, 'dan@example.com',  '',                       SHA2('pass123',256),   UTC_TIMESTAMP(), UTC_TIMESTAMP());  -- blank name

INSERT INTO urls (
  id, user_id, long_url,      created_at,        updated_at
) VALUES
  (1, 1, 'https://example.com/hello',        UTC_TIMESTAMP(), UTC_TIMESTAMP()),
  (2, 2, 'https://example.com/world',        UTC_TIMESTAMP(), UTC_TIMESTAMP()),
  (3, 1, REPEAT('x',2048),                   UTC_TIMESTAMP(), UTC_TIMESTAMP()),  -- max-length URL
  (4, NULL, 'https://EXAMPLE.com/CaseTest',  UTC_TIMESTAMP(), UTC_TIMESTAMP()),  -- uppercase domain
  (5, 3, 'https://example.com/こんにちは',   UTC_TIMESTAMP(), UTC_TIMESTAMP());  -- unicode in path

INSERT INTO slugs (
  code,           url_id,  user_id, expires_at,           created_at,        updated_at
) VALUES
  ('abc123',       1,       1,       NULL,                 UTC_TIMESTAMP(), UTC_TIMESTAMP()),
  ('def456',       2,       2,       '2025-12-31 23:59:59', UTC_TIMESTAMP(), UTC_TIMESTAMP()),
  ('expired',      1,       1,       '2020-01-01 00:00:00', UTC_TIMESTAMP(), UTC_TIMESTAMP()),  -- past expiry
  ('future',       2,       2,       '2030-01-01 00:00:00', UTC_TIMESTAMP(), UTC_TIMESTAMP()),  -- far-future expiry
  ('noslug',       4,       NULL,    NULL,                 UTC_TIMESTAMP(), UTC_TIMESTAMP()),  -- no owner
  ('dash_slug-1',  3,       1,       NULL,                 UTC_TIMESTAMP(), UTC_TIMESTAMP()),  -- hyphens/underscores
  ('unicode✓',     5,       3,       NULL,                 UTC_TIMESTAMP(), UTC_TIMESTAMP());  -- unicode char in code

INSERT INTO previews (
  url_id, provider,  title,               description,       image_url,                     twitter_card,          twitter_domain,        created_at,        updated_at
) VALUES
  (1,     'og',      'Hello OG',           'An OG preview',   'https://example.com/img.png', 'summary',             'example.com',         UTC_TIMESTAMP(), UTC_TIMESTAMP()),
  (1,     'twitter', 'Hello Twitter',      'A Twitter preview','https://example.com/tw.png','summary_large_image','twitter.com',         UTC_TIMESTAMP(), UTC_TIMESTAMP()),
  (2,     'twitter', NULL,                 NULL,               NULL,                           NULL,                   NULL,                  UTC_TIMESTAMP(), UTC_TIMESTAMP()),  -- all optional NULL
  (3,     'og',      'Emoji 😊 Title',      'Desc 😊',         'https://ex.com/emoji.png',     'card',                 'ex.com',              UTC_TIMESTAMP(), UTC_TIMESTAMP()),
  (5,     'twitter', 'Unicode ✓',           '',                 '',                             '',                     '',                    UTC_TIMESTAMP(), UTC_TIMESTAMP());  -- empty strings

INSERT INTO hits (
  slug_code,   referrer,                  ip_address,              user_agent,         created_at
) VALUES
  -- existing abc123
  ('abc123',    'https://referrer.com',    INET6_ATON('127.0.0.1'), 'test-agent-1',     UTC_TIMESTAMP()),
  ('abc123',    NULL,                     INET6_ATON('::1'),       'curl/7.64.1',      UTC_TIMESTAMP()),
  ('abc123',    'https://foo.com',        NULL,                    NULL,                UTC_TIMESTAMP()),  -- null UA & IP
  -- expired slug
  ('expired',   'https://gone.com',       INET6_ATON('192.0.2.1'), 'ExpiredAgent/1.0', UTC_TIMESTAMP()),
  -- future slug
  ('future',    NULL,                     INET6_ATON('198.51.100.2'),'FutureUA/2.0',    UTC_TIMESTAMP()),
  -- dash_slug-1
  ('dash_slug-1','https://dasher.com',    INET6_ATON('203.0.113.3'),'DashAgent/3.0',    UTC_TIMESTAMP()),
  -- unicode✓ slug
  ('unicode✓',  'https://uni.com',        INET6_ATON('2001:db8::1'), '特殊Agent/1.0',  UTC_TIMESTAMP());
