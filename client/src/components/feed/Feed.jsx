import Post from "../post/Post";
import Share from "../share/Share";
import "./feed.css";
import React, { useEffect, useState } from 'react';
import axios from "axios"

export default function Feed({username}) {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = username
          ? await axios.get(`posts/profile/${username}`)
          : await axios.get(`posts/timeline/66726e42e8c1b5a4ac2f01d9`);
        setPosts(res.data);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };
    fetchPosts();
  }, [username]);
  
  return (
    <div className="feed">
      <div className="feedWrapper">
        <Share />
        {posts.map((p) => (
          <Post key={p._id} post={p} />
        ))}
      </div>
    </div>
  );
}
