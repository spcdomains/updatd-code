import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
// import { useNavigate } from "react-router-dom"; // Import useNavigate for redirect
import styles from "./index.module.scss";
import Navbar from "../../Components/Navbar";
import Footer from "../../Components/Footer";
import { useRouter } from "next/router";

const Message = () => {
  const [content, setContent] = useState<string>("");
  const [messages, setMessages] = useState<any[]>([]);
  const [userName, setUserName] = useState<string>("");
  const messageEndRef = useRef<HTMLDivElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState<boolean>(true);
  const router = useRouter(); // Initialize useNavigate for redirection

  useEffect(() => {
    // Check for token and userName in local storage
    const token = localStorage.getItem("accessToken"); // Assuming token is stored under "token"
    const storedUserName = localStorage.getItem("userName");

    if (!token) {
      // Redirect to login page if token is not present
      router.push("/Login"); // Replace with the path to your login page
      return;
    }

    if (storedUserName) {
      setUserName(storedUserName);
    }

    fetchMessages();

    const interval = setInterval(fetchMessages, 600);

    return () => clearInterval(interval);
  }, [router]);

  useEffect(() => {
    if (shouldScrollToBottom) {
      scrollToBottom();
    }
  }, [messages, shouldScrollToBottom]);

  const fetchMessages = async () => {
    try {
      const response = await axios.get(
        "https://www.referback.trollsufficient.com/messages/121"
      );
      setMessages(response.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!content) return;

    try {
      const token = localStorage.getItem("token"); // Ensure token is still valid

   

      const response = await axios.post(
        "https://www.referback.trollsufficient.com/messages",
        {
          group_id: "121",
          sender: userName,
          content: content,
        },
        {
          headers: {
            Authorization: `Bearer ${token}` // Include token in headers
          }
        }
      );

      setMessages((prevMessages) => [...prevMessages, response.data]);
      setContent("");
      setShouldScrollToBottom(true);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      handleSubmit(e as any);
    }
  };

  const scrollToBottom = () => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  };

  const handleScroll = () => {
    const container = messageContainerRef.current;
    if (container) {
      const { scrollTop, clientHeight, scrollHeight } = container;
      const atBottom = scrollHeight - scrollTop <= clientHeight + 50;

      setShouldScrollToBottom(atBottom);
    }
  };

  // Prevent default scroll behavior when scrolling in message container
  const preventScroll = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  return (
    <div className={styles.container}>
      <Navbar />
      <div className={styles.main}>
        <div
          className={styles["message-form"]}
          onTouchStart={preventScroll} // Handle touch events to prevent page scroll
        >
          <div className={styles.heading}>
            <h2>Send a Message</h2>
          </div>
          <div
            className={styles["message-container"]}
            id="messageContainer"
            ref={messageContainerRef}
            onScroll={handleScroll}
          >
            {messages.map((message, index) => (
              <div
                key={index}
                className={`${styles["message"]} ${
                  message.sender === userName ? styles["sent"] : styles["received"]
                }`}
              >
                {message.sender !== userName && (
                  <div className={styles.sender}>
                    <strong className={styles.font}>{message.sender}</strong>
                  </div>
                )}
                <div className={styles.sevillanaregular}>{message.content}</div>
              </div>
            ))}
            <div ref={messageEndRef} />
          </div>
          <form onSubmit={handleSubmit}>
            <div className={styles["form-group"]}>
              <div className={styles.messagebox}>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={3}
                  required
                  onKeyPress={handleKeyPress}
                />
              </div>
              <div className={styles.btn}>
                <button type="submit" className={styles["send-button"]}>
                  <FontAwesomeIcon icon={faPaperPlane} />
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      {/* <Footer /> */}
    </div>
  );
};

export default Message;
