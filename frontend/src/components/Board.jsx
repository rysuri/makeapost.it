import { useState, useEffect } from "react";
import axios from "axios";

function Board() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    try {
      const { data } = await axios.get("http://localhost:3000/data/posts");
      setPosts(data.posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setError("Failed to load posts");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-xl">Loading posts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-xl text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
      <div className="max-w-md mx-auto w-full">
        {posts.length === 0 ? (
          <p className="text-center text-gray-500">No posts yet</p>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="bg-white p-4 rounded-lg shadow-md">
                <p className="text-gray-800 mb-2">{post.message}</p>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>Size: {post.size}</span>
                  <span>Posted: {new Date(post.iat).toLocaleString()}</span>
                  <span>Expires: {new Date(post.exp).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Board;
