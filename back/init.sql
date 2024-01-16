CREATE TABLE `Users` (
  `user_mail` varchar(128) NOT NULL,
  `user_password` BLOB(512) NOT NULL,
  `user_name` varchar(256) NOT NULL,
  CONSTRAINT PK_User PRIMARY KEY (user_mail)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `Chats` (
  `chat_id` INT NOT NULL AUTO_INCREMENT,
  `userA` varchar(128) NOT NULL,
  `userB` varchar(128) NOT NULL,
  CONSTRAINT PK_Chat PRIMARY KEY (chat_id),
  CONSTRAINT FK_userA FOREIGN KEY (userA) REFERENCES Users(user_mail),
  CONSTRAINT FK_userB FOREIGN KEY (userB) REFERENCES Users(user_mail)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `ChatMessages` (
  `chat_id` INT NOT NULL,
  `name` varchar(256) NOT NULL,
  `message` varchar(256) NOT NULL,
  `date` varchar(256) NOT NULL,
  CONSTRAINT FK_chat_id FOREIGN KEY (chat_id) REFERENCES Chats(chat_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
