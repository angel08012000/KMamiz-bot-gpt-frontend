import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot, faUser } from '@fortawesome/free-solid-svg-icons';
import styles from './ChatMessages.module.css';

const ChatMessages = ({ messages, onSetEntity, onSendEntity }) => {
  return (
    <div className={styles.container}>
      {messages.map((message, messageIndex) => (
        <Message key={messageIndex} message={message} onSetEntity={onSetEntity} onSendEntity={onSendEntity} />
      ))}
    </div>
  );
};

const Message = ({ message, onSetEntity, onSendEntity }) => {
  const [lastClickedIndex, setLastClickedIndex] = useState(null);

  const handleButtonClick = (index) => {
    // 取消上一個被點擊的按鈕樣式
    if (lastClickedIndex !== null) {
      setLastClickedIndex(null);
    }

    // 設置新被點擊的按鈕樣式
    setLastClickedIndex(index);

    // 處理按鈕點擊的邏輯
    // console.log('Button clicked:', index);
  };

  return (
    <div className={`${styles.message} ${message.from === 'system' ? styles.systemMessage : styles.userMessage}`}>
      <div className={`${styles.avatar} ${message.from === 'system' ? styles.systemAvatar : styles.userAvatar}`}>
        {message.from === 'system' ? (
          <FontAwesomeIcon icon={faRobot} />
        ) : (
          <FontAwesomeIcon icon={faUser} />
        )}
      </div>
      {/* {message.text && <div className={`${styles.text} ${message.from === 'system' ? styles.systemText : styles.userText}`} dangerouslySetInnerHTML={{ __html: message.text }}></div>} */}
      {message.text && <div className={`${styles.text} ${message.from === 'system' ? styles.systemText : styles.userText}`}> {message.text} </div>}

      {message.buttonData && (
        <div className={`${styles.text} ${styles.systemText}`}>
          {Array.isArray(message.buttonData)
            ? message.buttonData.map((button, index) => (
                <button
                  key={index}
                  className={`${index === lastClickedIndex ? styles.button_click : styles.button}`}
                  onClick={() => {
                    onSetEntity(button.name, button.value);
                    handleButtonClick(index);
                  }}>
                  {button.value}
                </button>
              ))
            : (
                <button
                  className={styles.button_submit}
                  onClick={() => {
                    onSendEntity();
                  }}>
                  Submit
                </button>
              )}
        </div>
      )}
    </div>
  );
};

export default ChatMessages;