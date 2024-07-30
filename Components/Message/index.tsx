import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPaperPlane,
  faChevronUp,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./index.module.scss";
import { useRouter } from "next/router";

const Message = () => {
  const [content, setContent] = useState<string>("");
  const [messages, setMessages] = useState<any[]>([]);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [showError, setShowError] = useState<boolean>(false); // State for error message
  const messageEndRef = useRef<HTMLDivElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const [shouldScrollToBottom, setShouldScrollToBottom] =
    useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
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

  const handleSubmit = async () => {
    if (!content.trim()) {
      setShowError(true); // Show error if content is empty
      return;
    }

    try {
      await axios.post("https://www.referback.trollsufficient.com/messages", {
        group_id: "121",
        content: content,
      });

      setMessages((prevMessages) => [
        ...prevMessages,
        { content: content, isSender: true },
      ]);
      setContent("");
      setShowError(false); // Hide error message after successful submission
      setShouldScrollToBottom(true);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevent default Enter key behavior (like new line)
      handleSubmit();
    }
  };

  const scrollToBottom = () => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
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

  const preventScroll = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  useEffect(() => {
    // Handle visibility based on screen size
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsVisible(false); // Hide on small screens initially
      } else {
        setIsVisible(true); // Show on larger screens
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Call on component mount

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className={styles.container}>
      {isVisible && (
        <div className={styles["message-form"]} onTouchStart={preventScroll}>
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
                className={`${styles.message} ${
                  message.isSender ? styles.sent : styles.received
                }`}
              >
                <div className={styles.sevillanaregular}>{message.content}</div>
              </div>
            ))}
            <div ref={messageEndRef} />
          </div>
          <div className={styles["form-group"]}>
            <div className={styles.messagebox}>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={3}
                required
                onKeyPress={handleKeyPress}
                className={styles.textarea}
              />
              <div
                className={styles["send-icon"]}
                onClick={handleSubmit}
                role="button"
                aria-label="Send Message"
              >
                <FontAwesomeIcon icon={faPaperPlane} className={styles.icon} />
              </div>
            </div>
            {showError && <p className={styles.error}>Enter a message</p>}{" "}
            {/* Error message */}
          </div>
          <div className={styles.toggleButton} onClick={toggleVisibility}>
            <FontAwesomeIcon
              icon={faChevronDown}
              style={{ height: "20px", width: "20px" }}
            />
          </div>
        </div>
      )}
      {!isVisible && (
        // <div style={{ display: "flex" }}>
          <div className={styles.toggleButton} onClick={toggleVisibility}>
            <div>
              <FontAwesomeIcon
                icon={faChevronUp}
                style={{ height: "20px", width: "20px" }}
              />
            </div>
            <div className={styles.send_message}>
              <h3>Community Chat</h3>
            </div>
          </div>
        // {/* </div> */}
      )}
    </div>
  );
};

export default Message;
