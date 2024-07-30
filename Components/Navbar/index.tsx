import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar, Nav, Container, Button, Form } from "react-bootstrap";
import { faBitcoin } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faHome,
  faUsers,
  faPhone,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./index.module.scss";
import { useRouter } from "next/router";
import axios from "axios";

const Header = () => {
  const [isFixed, setIsFixed] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState("transparent");
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [redeemAmount, setRedeemAmount] = useState("");
  const [coin, setCoins] = useState<number>(0);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 50;
      setIsFixed(scrolled);
      setBackgroundColor(scrolled ? "#006739" : "transparent");
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const role = localStorage.getItem("role");
    setIsAuthenticated(!!token);
    setUserRole(role);

    const fetchCoins = async () => {
      if (token) {
        try {
          const userId = localStorage.getItem("userId");
          if (userId) {
            const coinsResponse = await axios.get(
              `https://www.referback.trollsufficient.com/admin/coins/${userId}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              }
            );
            setCoins(coinsResponse.data.coins);
          }
        } catch (error) {
          console.error("Error fetching coins:", error);
        }
      }
    };

    fetchCoins();
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userName");
    localStorage.removeItem("userId");
    localStorage.removeItem("userCoins");
    localStorage.removeItem("role");
    setCoins(0);
    setIsAuthenticated(false);
    setUserRole(null);
    router.push("/");
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleRedeemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRedeemAmount(e.target.value);
  };

  const handleRedeem = async () => {
    const coins = parseInt(redeemAmount, 10);
    if (isNaN(coins) || coins <= 0) {
      alert("Please enter a valid amount.");
      return;
    }
    if (coins > coin) {
      alert("You do not have enough coins to redeem this amount.");
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      const userId = localStorage.getItem("userId");
      if (token && userId) {
        await axios.post(
          `https://www.referback.trollsufficient.com/admin/redeem-coins`,
          { userId, coins },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        setCoins(coin - coins);
        setRedeemAmount("");
        handleCloseModal();
        window.location.reload();
      }
    } catch (error) {
      console.error("Error redeeming coins:", error);
      alert("There was an error redeeming coins. Please try again.");
    }
  };

  return (
    <div className={styles.container}>
      <header
        className={`${styles.navbar} ${isFixed ? styles.fixed : ""}`}
        style={{ backgroundColor }}
      >
        <Navbar expand="lg" bg="transparent">
          <Container>
            <Link href="/" passHref>
              {/* <Navbar.Brand>MyApp</Navbar.Brand> */}
            </Link>
            <Navbar.Toggle
              aria-controls="navbarSupportedContent"
              onClick={handleToggle}
            >
              <span className={styles.menu_icon}>
                <FontAwesomeIcon
                  icon={faBars}
                  height={40}
                  width={40}
                  color="white"
                />
              </span>
            </Navbar.Toggle>
            <Navbar.Collapse
              id="navbarSupportedContent"
              className={isOpen ? styles.show : ""}
            >
              <Nav className={styles.nav}>
                <Link href="/home" passHref className={styles.links}>
                  <FontAwesomeIcon icon={faHome} className={styles.icon} /> Home
                </Link>
                {userRole === "admin" && (
                  <Link href="/Tree" passHref className={styles.links}>
                    <FontAwesomeIcon icon={faUsers} className={styles.icon} /> All
                    Users
                  </Link>
                )}
                <Link href="/contact" passHref className={styles.links}>
                  <FontAwesomeIcon icon={faPhone} className={styles.icon} /> Contact
                </Link>
                <Nav className={`${styles.links} ${styles.buttonGroup}`}>
                  {isAuthenticated ? (
                    <Button
                      variant="outline-light"
                      onClick={handleLogout}
                      style={{ color: "white" }}
                    >
                      <div className={styles.btn}>
                        <div>
                          <FontAwesomeIcon
                            icon={faSignOutAlt}
                            className={styles.icon}
                            color="white"
                          />
                        </div>
                        <div>Logout</div>
                      </div>
                    </Button>
                  ) : (
                    <Link href="/Login" passHref>
                      <Button
                        variant="outline-light"
                        style={{ color: "white" }}
                      >
                        <div className={styles.btn}>
                          <div>
                            <FontAwesomeIcon
                              icon={faSignOutAlt}
                              className={styles.icon}
                              color="white"
                            />
                          </div>
                          <div>Login</div>
                        </div>
                      </Button>
                    </Link>
                  )}
                </Nav>
                {isAuthenticated && (
                  <Nav className={`${styles.links} ${styles.buttonGroup}`}>
                    <Button
                      variant="outline-light"
                      style={{
                        color: "white",
                        marginLeft: "10px",
                      }}
                      onClick={handleOpenModal}
                    >
                      <div className={styles.btn}>
                        <div>
                          <FontAwesomeIcon
                            icon={faBitcoin}
                            className={styles.icon}
                            style={{ color: "#ffffff" }}
                          />
                        </div>
                        <div> Coins ({coin})</div>
                      </div>
                    </Button>
                  </Nav>
                )}
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
      </header>

      {isModalOpen && (
        <div className={styles.modalBackdrop} onClick={handleCloseModal}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalColumn}>
              <h3>
                Your Coins<span>&nbsp;&nbsp;&nbsp;{coin}</span>
              </h3>
              <Form.Group controlId="redeemAmount">
                <Form.Label>Amount to Redeem:</Form.Label>
                <Form.Control
                  type="number"
                  value={redeemAmount}
                  onChange={handleRedeemChange}
                  placeholder="Enter amount"
                />
              </Form.Group>
            </div>
            <div className={styles.modalColumn}>
              <Button variant="success" onClick={handleRedeem}>
                Redeem
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;
