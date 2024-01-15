CREATE TABLE `Users` (
  `user_mail` varchar(128) NOT NULL,
  `user_password` BLOB(512) NOT NULL,
  `user_name` varchar(256) NOT NULL,
  `user_sex` varchar(6) NOT NULL,
  `user_country` varchar(256) NOT NULL,
  `user_city` varchar(256) NOT NULL,
  CONSTRAINT PK_User PRIMARY KEY (user_mail)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `Clothes` (
  `user_mail` varchar(128) NOT NULL,
  `name` varchar(256) NOT NULL,
  `color` varchar(32) NOT NULL,
  `type` varchar(12) NOT NULL,
  `heat` varchar(12) NOT NULL,
  `rain` varchar(12) NOT NULL,
  CONSTRAINT PK_Clothe PRIMARY KEY (user_mail, name, color, type, heat, rain),
  CONSTRAINT FK_Clothes_Users FOREIGN KEY (user_mail) REFERENCES Users(user_mail)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;