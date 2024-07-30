import React, { useEffect, useState } from "react";
import styles from "./index.module.scss";
import Navbar from '@/Components/Navbar'
import Footer from '@/Components/Footer'
import axios from "axios";
import { useRouter } from "next/router";

interface User {
  _id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  leftChild?: string;
  rightChild?: string;
  coins?: number;
  referralCode?: string;
}

interface TreeNodeProps {
  node: User;
  left: TreeNodeProps | null;
  right: TreeNodeProps | null;
  onClick: (node: User) => void;
  onAddChild: (parentId: string, selectedOption: "left" | "right") => void;
  refreshKey: number; // Pass refreshKey as prop
  userRole: string | null; // Pass userRole as prop
}

const createBinaryTree = (users: User[]): Map<string, TreeNodeProps> => {
  const userMap = new Map<string, any>();

  users.forEach((user) => {
    userMap.set(user._id, { node: user, left: null, right: null });
  });

  users.forEach((user) => {
    const node = userMap.get(user._id);
    if (user.leftChild && userMap.has(user.leftChild)) {
      node!.left = userMap.get(user.leftChild)!;
    }
    if (user.rightChild && userMap.has(user.rightChild)) {
      node!.right = userMap.get(user.rightChild)!;
    }
  });

  return userMap;
};

const TreeNode: React.FC<TreeNodeProps> = ({
  node,
  left,
  right,
  onClick,
  onAddChild,
  refreshKey,
  userRole,
}) => {
  const [loading, setloading] = useState(false);
  const [showCoinsPopup, setShowCoinsPopup] = useState(false);
  const [newCoins, setNewCoins] = useState("");
  const [updatingCoins, setUpdatingCoins] = useState(false);

  const handleCoinsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewCoins(e.target.value);
  };

  const handleUpdateCoins = async () => {
    try {
      setloading(true);
      setUpdatingCoins(true);
      const token = localStorage.getItem("accessToken");
      const apiEndpoint = `https://www.referback.trollsufficient.com/admin/distribute-coins/${node.referralCode}`;

      const response = await axios.post(
        apiEndpoint,
        { coins: newCoins },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Coins updated successfully:", response.data);
      setNewCoins("");
      setShowCoinsPopup(false);
      setUpdatingCoins(false);

      // Reload the page to reflect updated coins
      window.location.reload();
    } catch (error) {
      console.error("Error updating coins:", error);
      setUpdatingCoins(false);
    }
  };

  const handleAddChild = (selectedOption: "left" | "right") => {
    onAddChild(node._id, selectedOption);
  };

  return (
    <>
      <div className={styles.node} onClick={() => onClick(node)}>
        <div className={styles.icon}>
          <i className="fas fa-user"></i>
        </div>
        <div className={styles.name}>{node.name}</div>
        <div className={styles.email}>{node.email}</div>
        <div className={styles.id}>Coins: {node.coins}</div>
        <div className={styles.id}>Referral Code: {node.referralCode}</div>

        {/* Conditionally render Add Child buttons based on role */}
        {userRole === "admin" && !left && (
          <div className={styles.addChild}>
            <button
              className={styles.addChildButton}
              onClick={() => handleAddChild("left")}
            >
              <i className="fas fa-plus"></i> Add Left Child
            </button>
          </div>
        )}

        {userRole === "admin" && !right && (
          <div className={styles.addChild}>
            <button
              className={styles.addChildButton}
              onClick={() => handleAddChild("right")}
            >
              <i className="fas fa-plus"></i> Add Right Child
            </button>
          </div>
        )}

        {left && (
          <div className={styles.lineWrapper}>
            <div className={`${styles.line} ${styles.lineLeft}`}></div>
          </div>
        )}

        {right && (
          <div className={styles.lineWrapper}>
            <div className={`${styles.line} ${styles.lineRight}`}></div>
          </div>
        )}
      </div>

      {/* Conditionally render Send Coins button based on role */}
      {userRole === "admin" && !showCoinsPopup && (
        <div className={styles.sendCoinnew}>
          <button
            className={`${styles.sendCoinsButton} ${
              updatingCoins ? styles.updating : ""
            }`}
            onClick={() => setShowCoinsPopup(true)}
          >
            Send Coins
          </button>
        </div>
      )}

      <div className={styles.sendCoins}>
        {showCoinsPopup && (
          <div className={styles.form}>
            <input
              type="number"
              placeholder="Enter Coins"
              value={newCoins}
              onChange={handleCoinsChange}
            />
            <button
              className={styles.updateCoinsButton}
              onClick={handleUpdateCoins}
            >
              Update Coins
            </button>
            {(loading)&&<h1 className={styles.loadingOverlay} style={{color:"white"}}>Loading</h1>}
          </div>
          
        )}
      </div>
  
    </>
  );
};

const Index: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [userMap, setUserMap] = useState<Map<string, TreeNodeProps> | null>(
    null
  );
  const [currentNode, setCurrentNode] = useState<User | null>(null);
  const [viewAll, setViewAll] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [parentId, setParentId] = useState("");
  const [selectedOption, setSelectedOption] = useState<"left" | "right">(
    "left"
  );
  const [error, setError] = useState<Error | null>(null);
  const [success, setSuccess] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [previousTree, setPreviousTree] = useState<User[] | null>(null); // State to store previous tree nodes
const router =useRouter();
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/Login");
      return;
    }
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await axios.get(
          "https://www.referback.trollsufficient.com/admin/all",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        setUsers(response.data);
        const map = createBinaryTree(response.data);
        setUserMap(map);

        if (response.data.length > 0) {
          setCurrentNode(response.data[0]);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    const fetchUserRole = () => {
      const role = localStorage.getItem("role");
      setUserRole(role);
    };

    fetchUsers();
    fetchUserRole();
  }, [refreshKey]); // Trigger fetch on refreshKey change

  const handleNodeClick = (node: User) => {
    setPreviousTree([...users]); // Store the previous tree nodes
    setCurrentNode(node);
  };

  const handleBackButtonClick = () => {
    if (previousTree && previousTree.length > 0) {
      setUsers(previousTree); // Restore previous tree nodes
      setUserMap(createBinaryTree(previousTree));
      setCurrentNode(previousTree[0]); // Set current node to the first node of the previous tree
      setPreviousTree(null); // Clear previous tree nodes
    }
  };

  const handleAddChild = async (
    parentId: string,
    selectedOption: "left" | "right"
  ) => {
    try {
      setParentId(parentId);
      setSelectedOption(selectedOption);
      setShowForm(true);
    } catch (error) {
      console.error("Error handling add child:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const apiEndpoint =
        selectedOption === "left"
          ? `https://www.referback.trollsufficient.com/admin/add-left-child/${parentId}`
          : `https://www.referback.trollsufficient.com/admin/add-right-child/${parentId}`;

      const token = localStorage.getItem("accessToken");

      const response = await axios.put(apiEndpoint, formData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status !== 200) {
        throw new Error("Failed to add child");
      }

      console.log("Child added successfully:", response.data);
      setSuccess(true);

      // Trigger refresh by incrementing refreshKey
      setRefreshKey((prevKey) => prevKey + 1);
    } catch (error: any) {
      console.error("Error adding child:", error);
      setError(error);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setFormData({
      name: "",
      email: "",
      password: "",
    });
    setError(null);
    setSuccess(false);
  };

  const renderInitialNodes = (node: User | null) => {
    if (!node) return null;

    return (
      <div className={styles.children}>
        {userMap && userMap.has(node._id) && (
          <>
            {userMap.get(node._id)!.left && (
              <div className={styles.child}>
                <TreeNode
                  node={userMap.get(node._id)!.left!.node}
                  left={userMap.get(node._id)!.left!.left}
                  right={userMap.get(node._id)!.left!.right}
                  onClick={handleNodeClick}
                  onAddChild={handleAddChild}
                  refreshKey={refreshKey} // Pass refreshKey
                  userRole={userRole} // Pass userRole
                />
              </div>
            )}
            {userMap.get(node._id)!.right && (
              <div className={styles.child}>
                <TreeNode
                  node={userMap.get(node._id)!.right!.node}
                  left={userMap.get(node._id)!.right!.left}
                  right={userMap.get(node._id)!.right!.right}
                  onClick={handleNodeClick}
                  onAddChild={handleAddChild}
                  refreshKey={refreshKey} // Pass refreshKey
                  userRole={userRole} // Pass userRole
                />
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  const renderCompleteTree = (node: User | null): JSX.Element | null => {
    if (!node) return null;

    const leftNode = userMap?.get(node._id)?.left?.node || null;
    const rightNode = userMap?.get(node._id)?.right?.node || null;

    return (
      <div>
        <TreeNode
          node={node}
          left={userMap?.get(node._id)?.left || null}
          right={userMap?.get(node._id)?.right || null}
          onClick={handleNodeClick}
          onAddChild={handleAddChild}
          refreshKey={refreshKey} // Pass refreshKey
          userRole={userRole} // Pass userRole
        />
        <div className={styles.children}>
          {leftNode && renderCompleteTree(leftNode)}
          {rightNode && renderCompleteTree(rightNode)}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className={styles.container}>
      
        <Navbar />
        {previousTree && (
            <button
              className={styles.backButton}
              onClick={handleBackButtonClick}
            >
              Back
            </button>
          )}
        <div className={styles.buttonWrapper}>
          
          {/* <button
            className={styles.toggleButton}
            onClick={() => setViewAll(!viewAll)}
          >
            {viewAll ? "View Initial Nodes" : "View All Nodes"}
          </button> */}

        </div>
        <div className={styles.treeContainer}>
          {viewAll
            ? renderCompleteTree(currentNode)
            : currentNode && (
                <div>
                  <TreeNode
                    node={currentNode}
                    left={userMap?.get(currentNode._id)?.left || null}
                    right={userMap?.get(currentNode._id)?.right || null}
                    onClick={handleNodeClick}
                    onAddChild={handleAddChild}
                    refreshKey={refreshKey} // Pass refreshKey
                    userRole={userRole} // Pass userRole
                  />
                  {renderInitialNodes(currentNode)}
                </div>
              )}
        </div>
        {/* <Footer/> */}
      </div>

      {showForm && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <span className={styles.close} onClick={handleCloseForm}>
              &times;
            </span>
            <form onSubmit={handleSubmit} className={styles.form}>
              <label>
                Name:
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </label>
              <label>
                Email:
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </label>
              <label>
                Password:
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </label>
              {userRole === "admin" && <button type="submit">Add Child</button>}
            </form>
            {error && (
              <div className={styles.error}>Error: {error.message}</div>
            )}
            {success && (
              <div className={styles.success}>Child added successfully!</div>
            )}
          </div>
          {/* <Footer/> */}
        </div>
      )}
    </div>
  );
};

export default Index;
