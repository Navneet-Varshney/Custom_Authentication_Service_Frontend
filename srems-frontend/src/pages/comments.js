import { commentsService } from '../js/services/comments.service.js';
import { COMMENT_ENTITY_TYPES } from '../js/utils/constants.js';

/**
 * Comments Page Controller
 * Displays all comments and discussions
 * 
 * Backend requires: commentText (REQUIRED)
 * Entity information: entityType, entityId
 */
class CommentsPage {
  constructor() {
    this.comments = [];
    this.filteredComments = [];
    this.entityType = 'projects';  // Default
    this.entityId = localStorage.getItem('CURRENT_PROJECT') || 'all';
  }

  async init() {
    this.setupEventListeners();
    await this.loadComments();
  }

  setupEventListeners() {
    const searchBox = document.getElementById('searchComments');
    if (searchBox) {
      searchBox.addEventListener('input', () => {
        this.filterComments();
      });
    }

    const typeFilter = document.getElementById('filterType');
    if (typeFilter) {
      typeFilter.addEventListener('change', () => {
        this.filterComments();
      });
    }

    const createBtn = document.getElementById('createCommentBtn') || document.getElementById('addCommentBtn');
    if (createBtn) {
      createBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.showCommentForm();
      });
    }
  }

  async loadComments() {
    try {
      console.log(`💬 Loading comments for entityType=${this.entityType}, entityId=${this.entityId}`);

      // Get hierarchical comments (with replies structured)
      // Service returns response wrapper { success, status, data: [...] }
      const response = await commentsService.getCommentsByEntityHierarchical(this.entityType, this.entityId);
      this.comments = (response && response.data && Array.isArray(response.data)) ? response.data : [];
      
      this.filterComments();
      this.renderComments();
    } catch (error) {
      console.error('Failed to load comments:', error);
      this.comments = [];
      this.renderComments();
    }
  }

  filterComments() {
    const search = document.getElementById('searchComments')?.value?.toLowerCase() || '';

    this.filteredComments = this.comments.filter(comment => {
      const matchesSearch = !search || 
        (comment.commentText?.toLowerCase().includes(search)) ||
        (comment.author?.toLowerCase().includes(search)) ||
        (comment.userName?.toLowerCase().includes(search));
      
      return matchesSearch;
    });

    this.renderComments();
  }

  renderComments() {
    const container = document.getElementById('commentsList');
    if (!container) return;

    if (!Array.isArray(this.filteredComments) || this.filteredComments.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">💬</div>
          <h3>No Comments</h3>
          <p>No comments yet. Start discussions on this item.</p>
          <button class="btn btn-primary" onclick="window.commentsPage.showCommentForm()">Add Comment</button>
        </div>
      `;
      return;
    }

    container.innerHTML = this.filteredComments.map(comment => `
      <div class="comment-card">
        <div class="comment-header">
          <div class="comment-author">
            <strong>${comment.author || comment.userName || 'Anonymous'}</strong>
            <span class="comment-time">${this.formatDate(comment.createdAt)}</span>
          </div>
          ${comment.status ? `<span class="badge badge-${comment.status?.toLowerCase() || 'default'}">${comment.status}</span>` : ''}
        </div>

        <div class="comment-body">
          <p>${this.escapeHtml(comment.commentText || '')}</p>
        </div>

        <div class="comment-footer">
          <button class="btn btn-sm btn-secondary" onclick="window.commentsPage.replyToComment('${comment._id}')">💬 Reply</button>
          ${comment.createdBy === localStorage.getItem('USER_ID') ? `
            <button class="btn btn-sm btn-danger" onclick="window.commentsPage.deleteComment('${comment._id}')">🗑️ Delete</button>
          ` : ''}
        </div>

        ${comment.replies && Array.isArray(comment.replies) && comment.replies.length > 0 ? `
          <div class="comment-replies">
            <div class="replies-header">↳ ${comment.replies.length} replies</div>
            ${comment.replies.map(reply => `
              <div class="reply-card">
                <div class="reply-header">
                  <strong>${reply.author || reply.userName || 'Anonymous'}</strong>
                  <span class="reply-time">${this.formatDate(reply.createdAt)}</span>
                </div>
                <p>${this.escapeHtml(reply.commentText || '')}</p>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `).join('');
  }

  formatDate(dateString) {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  async showCommentForm() {
    let form = document.getElementById('quickCommentForm');
    if (!form) {
      form = document.createElement('div');
      form.id = 'quickCommentForm';
      form.className = 'comment-form-card';
      form.innerHTML = `
        <div class="form-group">
          <textarea id="quickCommentText" placeholder="Add your comment..." rows="4" required></textarea>
        </div>
        <div class="form-actions">
          <button class="btn btn-primary" id="submitCommentBtn">Post Comment</button>
          <button class="btn btn-secondary" id="cancelCommentBtn">Cancel</button>
        </div>
      `;
      
      const container = document.getElementById('commentsList');
      if (container) {
        container.parentElement.insertBefore(form, container);
      }
    }

    form.style.display = 'block';

    document.getElementById('submitCommentBtn').onclick = () => this.submitComment();
    document.getElementById('cancelCommentBtn').onclick = () => {
      form.style.display = 'none';
    };
  }

  async submitComment() {
    try {
      const commentTextVal = document.getElementById('quickCommentText')?.value?.trim();

      if (!commentTextVal) {
        alert('Comment text is required');
        return;
      }

      const commentData = {
        commentText: commentTextVal  // Backend expects commentText, not text
      };

      const response = await commentsService.createComment(
        this.entityType,
        this.entityId,
        commentData
      );

      console.log('✅ Comment posted:', response);
      alert('Comment posted successfully!');

      const form = document.getElementById('quickCommentForm');
      if (form) form.style.display = 'none';

      await this.loadComments();
    } catch (error) {
      console.error('Failed to post comment:', error);
      alert(`Failed to post comment: ${error.message}`);
    }
  }

  async replyToComment(commentId) {
    const replyText = prompt('Enter your reply:');
    if (!replyText) return;

    try {
      const replyData = {
        commentText: replyText,
        parentCommentId: commentId
      };

      const response = await commentsService.createComment(
        this.entityType,
        this.entityId,
        replyData
      );

      alert('Reply posted successfully!');
      await this.loadComments();
    } catch (error) {
      console.error('Failed to add reply:', error);
      alert('Failed to add reply');
    }
  }

  async deleteComment(commentId) {
    if (confirm('Are you sure you want to delete this comment?')) {
      try {
        await commentsService.deleteComment(commentId, 'Deleted by user');
        alert('Comment deleted!');
        await this.loadComments();
      } catch (error) {
        console.error('Failed to delete:', error);
        alert('Failed to delete comment');
      }
    }
  }
}

// Initialize page
const commentsPage = new CommentsPage();
window.commentsPage = commentsPage;
commentsPage.init();

export { CommentsPage };
