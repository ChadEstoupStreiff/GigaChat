CREATE TABLE `Users` (
  `user_mail` varchar(128) NOT NULL,
  `user_password` BLOB(512) NOT NULL,
  `user_name` varchar(256) NOT NULL,
  CONSTRAINT PK_User PRIMARY KEY (user_mail)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;