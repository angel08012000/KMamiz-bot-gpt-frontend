import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './ChatApp.module.css';
import config from '../../config';
import {covert_to_html, count_continuous_button, covert_to_gpt_entity} from './Covert';
import ChatHeader from '../ChatHeader/ChatHeader';
import ChatMessages from '../ChatMessages/ChatMessages';
import ChatInput from '../ChatInput/ChatInput';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot } from '@fortawesome/free-solid-svg-icons';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { solarizedlight } from 'react-syntax-highlighter/dist/cjs/styles/prism';

function ChatApp(){
  //--- 處理聊天室長相 START ---//
  const [chatOpen, setChatOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const toggleChat = () => {
    if(!chatOpen) setIsFullScreen(false);
    setChatOpen(!chatOpen);
  };
  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };
  //--- 處理聊天室長相 END ---//

  //--- 處理 user_id START ---//
  const [userId, setUserId] = useState("");
  function clearCookie(cookieName) {
    // 將Cookie的過期時間設定為過去的日期
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }

  // 初始化該 user 的 messages（第一次進來＆獲取歷史紀錄時）
  const initializeUserMessages = (userId) => {
    setMessages(prevMessages => ({
      ...prevMessages,
      [userId]: [],
    }));
  };

  useEffect(() => {
    // 檢查是否已經有使用者ID的Cookie
    //clearCookie('userId');
    let cookie = document.cookie.split('; ').find(row => row.startsWith('userId='));

    if (!cookie) {
      axios.get(config.apiUser)
      .then(response => {
        // 處理 API 回應數據
        const newUserId = response.data["user_id"];
        setUserId(newUserId);
        initializeUserMessages(newUserId);
        // 將ID存儲在Cookie中，有效期為7天
        document.cookie = `userId=${newUserId}; expires=${new Date(Date.now() + 86400000*7).toUTCString()}`;
      })
      .catch(error => {
        // 處理錯誤
        console.error('Error sending message:', error);
      });
    }
    else{
      const fromCookieUserId = cookie.split('=')[1]
      setUserId(fromCookieUserId);
    }
  }, []);
  
  useEffect(() => {
    if (userId) {
      //console.log(`您的 userId: ${userId}`);
      fetchHistory(userId);
    }
  }, [userId]);
  //--- 處理 user_id END ---//

  //--- 處理 ENTITY 們 START ---//
  const [entityValue, setEntityValue] = useState({});
  useEffect(() => {
    //console.log('Updated entity:', entityValue);
  }, [entityValue]);



  const handleSetEntity = (name, value) => {
    //console.log('set_entity called with:', name, value);
    setEntityValue(prevState => {
      return { ...prevState, [name]: value };
    });
  };

  const sendEntity = () => {
    //console.log(`準備送出 entity`);
    //console.log(entityValue);

    addMessage(covert_to_gpt_entity(entityValue));

    setEntityValue({});
  }
  //--- 處理 ENTITY 們 START ---//

  //--- 處理歷史紀錄 START ---//
  const [messages, setMessages] = useState({});
  useEffect(() => {
    // 這個函數會在每次 myState 更新後執行
    //console.log('Updated state:', messages);
  }, [messages]); // 這個 effect 只在 myState 改變時執行

  const deal_response = (res) =>{
    let tempMessages = [];
    let submitButton = false;

    if(res!=undefined){
      for (let i = 0; i < res.length; i++) {
        //console.log(`deal response: ${i}`);
        let html = '';
        try {
          if(res[i]["ui_type"]=='button'){
            submitButton = true;
            let end = count_continuous_button(res, i);
            let button_data = [];
            for(let j=i; j<=end; j++){
              button_data.push(res[j]["data"][res[j]["ui_type"]])
              // html += covert_to_html(`to_${res[i]["ui_type"]}`, res[i]["data"][res[i]["ui_type"]]);
            }
            i = end;
  
            tempMessages.push({
              from: 'system',
              buttonData: button_data
            });
          }
          else{
            html = covert_to_html(`to_${res[i]["ui_type"]}`, res[i]["data"][res[i]["ui_type"]]);
            
            // 在發送成功後更新本地狀態
            tempMessages.push({
              from: 'system',
              text: html
            });
          }
        } catch (error) {
          console.log('錯誤訊息: ');
          console.error(error.message);
        }
      }
    }

    if(submitButton){
      tempMessages.push({
        from: 'system',
        buttonData: {}
      });
    }
    //console.log(`處理 response: `);
    //console.log(tempMessages);
    return tempMessages;
  }

  const fetchHistory = async (userId) => {
    try {
      let tempMessages = [];
      initializeUserMessages(userId);
      const response = await axios.post(config.apiHistory, {"id": userId});
      const res = response.data["res"];

      // console.log('歷史紀錄:')
      // console.log(res);

      // console.log(`userid: ${userId}`)

      if (res !== undefined) {
        for (let i = 0; i < res.length; i++) {

          if (res[i]["from"] === "user") {
            tempMessages.push({
              from: 'user',
              text: covert_to_html(`to_${res[i]["text"][0]["ui_type"]}`, res[i]["text"][0]["data"][res[i]["text"][0]["ui_type"]])
            });
          } else if (res[i]["from"] === "system") {
            tempMessages = [...tempMessages, ...deal_response(res[i]["text"])];
          }
        }
      }
      else{
        console.log("something error...")
        tempMessages.push({
          from: 'system',
          text: covert_to_html(`to_text`, {"content": "something error, please try again later..."})
        });
      }
      

      setMessages(prevMessages => ({
        ...prevMessages,
        [userId]: [...(prevMessages[userId] || []), ...tempMessages],
      }));

    } catch (error) {
      // 處理錯誤
      console.error('Error sending message:', error);
    }
  };

  const addMessage = async (newMessage) => {

    setMessages(prevMessages => {
      const newMessageObj = {
        from: 'user',
        text: newMessage
      }
    
      return {
        ...prevMessages,
        [userId]: [...(prevMessages[userId] || []), newMessageObj],
      };
    });

    // 呼叫 API
    axios.post(config.apiUrl, {"user": newMessage, "id": userId})
      .then(response => {
        // console.log(`傳過去的：${newMessage}`)
        // 處理 API 回應數據
        const res = response.data.response;

        // console.log('API Response:', res);

        let tempMessages = deal_response(res);
        setMessages(prevMessages => ({
          ...prevMessages,
          [userId]: [...(prevMessages[userId] || []), ...tempMessages],
        }));

      })
      .catch(error => {
        // 處理錯誤
        console.error('Error sending message:', error);
      });
  };
  //--- 處理歷史紀錄 END ---//

  return (
    <div className={`${styles.chatApp} ${isFullScreen ? styles.fullScreen : (chatOpen ? styles.notFullScreen : '')}`}>
      {chatOpen && (
        <>
          <ChatHeader onMinimize={toggleChat} onFullScreen={toggleFullScreen} />
          <ChatMessages messages={messages[userId]} onSetEntity={handleSetEntity} onSendEntity={sendEntity}/>
          <ChatInput onSendMessage={addMessage} />
        </>
      )}
        <div onClick={toggleChat}>
            {!chatOpen && (
                <FontAwesomeIcon className={styles.chatIcon} icon={faRobot} size='lg'/>
            )}
        </div>

    </div>
  );
}

export default ChatApp;