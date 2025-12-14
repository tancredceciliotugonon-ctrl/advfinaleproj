import { useState, useEffect } from 'react';

export default function Community() {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState({});

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/community/posts', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setPosts(data.posts || []);
      } else {
        setPosts([]);
      }
    } catch (error) {
      console.error('Error loading posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePostCreate = async (e) => {
    e.preventDefault();
    if (!newPost.trim() && !selectedImage) return;

    setUploading(true);
    try {
      let imageUrl = null;
      
      // Upload image if selected
      if (selectedImage) {
        const formDataObj = new FormData();
        formDataObj.append('file', selectedImage);
        
        const token = localStorage.getItem('token');
        const uploadResponse = await fetch('/api/community/upload', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formDataObj
        });
        
        const uploadData = await uploadResponse.json();
        if (uploadResponse.ok) {
          imageUrl = uploadData.image_url;
        } else {
          alert('Failed to upload image');
          setUploading(false);
          return;
        }
      }
      
      // Create post
      const token = localStorage.getItem('token');
      const response = await fetch('/api/community/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: newPost, image_url: imageUrl })
      });
      const data = await response.json();
      if (response.ok && data.post) {
        setPosts([data.post, ...posts]);
        setNewPost('');
        setSelectedImage(null);
        setImagePreview(null);
      }
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLike = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/community/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok && data.post) {
        setPosts(posts.map(p => p.id === postId ? data.post : p));
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const loadComments = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/community/posts/${postId}/comments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setComments({ ...comments, [postId]: data.comments || [] });
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handlePostComment = async (postId) => {
    const content = newComment[postId];
    if (!content?.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/community/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content })
      });
      const data = await response.json();
      if (response.ok && data.comment) {
        const postComments = comments[postId] || [];
        setComments({ ...comments, [postId]: [...postComments, data.comment] });
        setNewComment({ ...newComment, [postId]: '' });
      }
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-green-600"></div>
        <p className="mt-4 text-gray-600">Loading community...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
        <h2 className="text-4xl font-bold mb-2">💬 Community Feed</h2>
        <p className="text-blue-100">Share your hiking adventures and connect with fellow hikers</p>
      </div>

      {/* Post Creation Form */}
      <form onSubmit={handlePostCreate} className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-600">
        <label className="block text-sm font-semibold text-gray-700 mb-3">Share Your Adventure</label>
        <textarea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="📝 Share a hiking story, tips, or connect with other hikers..."
          className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition placeholder-gray-400"
          rows="3"
        />
        
        {/* Image Preview */}
        {imagePreview && (
          <div className="mt-4 relative">
            <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-xl" />
            <button
              type="button"
              onClick={() => {
                setSelectedImage(null);
                setImagePreview(null);
              }}
              className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
            >
              ✕
            </button>
          </div>
        )}
        
        {/* Image Upload */}
        <div className="mt-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Add Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            disabled={uploading}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-green-600 file:text-white file:font-semibold hover:file:bg-green-700 file:cursor-pointer"
          />
        </div>
        
        <button
          type="submit"
          disabled={!newPost.trim() && !selectedImage || uploading}
          className="mt-4 bg-gradient-to-r from-green-600 to-teal-500 text-white px-8 py-3 rounded-xl font-bold hover:from-green-500 hover:to-teal-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-green-900/20"
        >
          {uploading ? '⏳ Posting...' : '✈️ Post Adventure'}
        </button>
      </form>

      {/* Posts List */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300">
            <span className="text-5xl block mb-3">🗻</span>
            <p className="text-gray-600 text-lg font-semibold">No posts yet</p>
            <p className="text-gray-500">Be the first to share your hiking adventure!</p>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-100 overflow-hidden">
              <div className="p-6">
                {/* Post Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1">
                    {post.user?.profile_picture ? (
                      <img
                        src={post.user.profile_picture}
                        alt={post.user.username}
                        className="w-12 h-12 rounded-full object-cover border-2 border-green-600"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-600 to-teal-500 flex items-center justify-center text-white font-bold">
                        {post.user?.username?.[0]?.toUpperCase() || '?'}
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-gray-800">{post.user?.username || 'Unknown User'}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(post.created_at).toLocaleDateString()} at {new Date(post.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Post Content */}
                <p className="text-gray-800 leading-relaxed mb-4 whitespace-pre-wrap">{post.content}</p>

                {/* Post Image */}
                {post.image_url && (
                  <img src={post.image_url} alt="Post" className="w-full h-64 object-cover rounded-lg mb-4" />
                )}

                {/* Post Actions */}
                <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleLike(post.id)}
                    className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition font-semibold"
                  >
                    <span className="text-xl">{post.likes_count > 0 ? '❤️' : '🤍'}</span>
                    <span>{post.likes_count || 0}</span>
                  </button>
                  <button 
                    onClick={() => {
                      setSelectedPostId(selectedPostId === post.id ? null : post.id);
                      if (selectedPostId !== post.id && !comments[post.id]) {
                        loadComments(post.id);
                      }
                    }}
                    className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition font-semibold"
                  >
                    <span className="text-xl">💬</span>
                    <span>{comments[post.id]?.length || 0}</span>
                  </button>
                </div>

                {/* Comments Section */}
                {selectedPostId === post.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    {/* Comments List */}
                    <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                      {comments[post.id]?.length === 0 ? (
                        <p className="text-gray-500 text-sm">No comments yet</p>
                      ) : (
                        comments[post.id]?.map((comment) => (
                          <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-start gap-2 mb-2">
                              {comment.user.profile_picture ? (
                                <img
                                  src={comment.user.profile_picture}
                                  alt={comment.user.username}
                                  className="w-6 h-6 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center text-white text-xs font-bold">
                                  {comment.user.username?.[0]?.toUpperCase() || '?'}
                                </div>
                              )}
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-bold text-gray-800">{comment.user.username}</p>
                                  <p className="text-xs font-light text-gray-500">{new Date(comment.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                </div>
                              </div>
                            </div>
                            <p className="text-sm text-gray-700 ml-8">{comment.content}</p>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Comment Input */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newComment[post.id] || ''}
                        onChange={(e) => setNewComment({ ...newComment, [post.id]: e.target.value })}
                        placeholder="Write a comment..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handlePostComment(post.id);
                          }
                        }}
                      />
                      <button
                        onClick={() => handlePostComment(post.id)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700"
                      >
                        Post
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
