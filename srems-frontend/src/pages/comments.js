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
    // Backend only supports comments on: scopes, requirements, inceptions, high-level-features
    // Default to 'scopes' since it's a main entity type
    this.entityType = 'scopes';
    
    // Extract project ID from URL query parameter: #/comments?project=<projectId>
    this.extractProjectId();
    
    // Initialize page (setup listeners and load comments if entityId exists)
    this.init();
  }

  extractProjectId() {
    try {
      // Extract from hash since we're using hash-based routing
      // Hash format: #/comments?project=<projectId>
      const hash = window.location.hash.substring(2); // Remove #/
      const queryIndex = hash.indexOf('?');
      
      if (queryIndex === -1) {
        console.warn('⚠️ No project specified in URL. Comments cannot be loaded');
        this.entityId = null;
        return;
      }
      
      const queryString = hash.substring(queryIndex + 1);
      const params = new URLSearchParams(queryString);
      this.entityId = params.get('project');
      
      if (!this.entityId) {
        console.warn('⚠️ Project ID not found in URL parameters');
      }
    } catch (error) {
      console.error('❌ Error extracting project ID:', error);
      this.entityId = null;
    }
  }

  async init() {
    this.setupEventListeners();
    
    // Comments can only be added on specific entities (scopes, requirements, inceptions, high-level-features)
    // Not on projects directly
    // For now, show a notice
    this.renderNotice();
  }

  renderNotice() {
    const container = document.getElementById('commentsList');
    if (container) {
      container.innerHTML = `
        <div class="info-message">
          <div class="info-icon">ℹ️</div>
          <h3>Comments by Entity</h3>
          <p>Comments in this system are managed on specific entities within a project:</p>
          <ul style="text-align: left; margin: 1rem auto; max-width: 400px;">
            <li>📌 Scopes</li>
            <li>📋 Requirements</li>
            <li>💡 Inceptions (Product Vision)</li>
            <li>⭐ High-Level Features</li>
          </ul>
          <p>To view or add comments, navigate to a specific entity detail page.</p>
        </div>
      `;
    }
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
        if (!this.entityId || this.entityId === 'all') {
          alert('⚠️ Please select a project first');
          return;
        }
        this.showCommentForm();
      });
    }
  }

  renderEmptyState() {
    const container = document.getElementById('commentsList');
    if (container) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📋</div>
          <h3>No Project Selected</h3>
          <p>Select a project to view and add comments.</p>
        </div>
      `;
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
      // Validate project is selected
      if (!this.entityId || this.entityId === 'all') {
        alert('⚠️ Please select a project first');
        return;
      }

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
